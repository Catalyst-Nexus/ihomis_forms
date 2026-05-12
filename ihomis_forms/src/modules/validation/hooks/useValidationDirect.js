import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

/**
 * Extract enccode from selected patient data
 */
function normalizeEncounterCode(rawValue) {
  const text = String(rawValue || "").trim();
  if (!text) return "";
  const firstToken = text.split(/[\s/]/)[0].trim();
  return firstToken || text;
}

function resolveEnccode(selectedPatient) {
  return normalizeEncounterCode(
    selectedPatient?.rawData?.enccode ||
      selectedPatient?.contextParams?.enccode ||
      selectedPatient?.contextParams?.enc ||
      selectedPatient?.selectedEncounter?.enccode ||
      (selectedPatient?.idSource === "enccode" ? selectedPatient.id : "") ||
      selectedPatient?.id ||
      "",
  );
}

function resolveHpercode(selectedPatient) {
  return String(
    selectedPatient?.rawData?.hpercode ||
      selectedPatient?.contextParams?.hpercode ||
      (selectedPatient?.idSource === "hpercode" ? selectedPatient.id : "") ||
      selectedPatient?.id ||
      "",
  ).trim();
}

/**
 * New hook: Frontend-driven validation using Supabase rules
 * 
 * Flow:
 * 1. Fetch encounter data from backend: POST /api/validation/data { enccode }
 * 2. Fetch validation rules from Supabase: SELECT * FROM validation WHERE id IN (...)
 * 3. Fetch form-validation mappings from Supabase: SELECT * FROM formvalidator WHERE formid = ?
 * 4. Execute validation queries via backend or Supabase functions
 * 
 * @param {object} options - { selectedPatient, enccode, formId }
 * @returns {object} - { encounterData, validationRules, loading, error, results, summary, refresh }
 */
export function useValidationDirect({ selectedPatient, enccode: propEnccode, formId }) {
  const [encounterData, setEncounterData] = useState(null);
  const [validationRules, setValidationRules] = useState([]);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    allPassed: true,
    missing: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizedPropEnccode = useMemo(
    () => normalizeEncounterCode(propEnccode),
    [propEnccode],
  );

  const enccode = useMemo(
    () => normalizedPropEnccode || resolveEnccode(selectedPatient),
    [normalizedPropEnccode, selectedPatient],
  );

  const hpercode = useMemo(
    () => resolveHpercode(selectedPatient),
    [selectedPatient],
  );

  const validationApiBase =
    import.meta.env.VITE_VALIDATION_API_URL ||
    import.meta.env.VITE_VALIDATION_API ||
    "http://localhost:3000/api/validation";

  /**
   * Step 1: Fetch encounter data from backend
   */
  const fetchEncounterData = useCallback(async () => {
    if (!enccode) {
      throw new Error("No encounter code available");
    }

    const response = await fetch(`${validationApiBase}/data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enccode, hpercode }),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      throw new Error(
        `Failed to fetch encounter data: ${response.status} (${errorPayload?.error || "unknown"})`,
      );
    }

    const payload = await response.json();
    if (!payload?.ok) {
      throw new Error(payload?.error || "Backend returned error");
    }

    return payload.data;
  }, [enccode, hpercode, validationApiBase]);

  /**
   * Step 2: Fetch validation rules for this form from Supabase
   */
  const fetchValidationRules = useCallback(async () => {
    if (!formId || !supabase) {
      return [];
    }

    try {
      // Get form-validation mappings
      const { data: mappings, error: mapError } = await supabase
        .from("formvalidator")
        .select("*")
        .eq("formid", formId);

      if (mapError) throw mapError;

      if (!mappings || mappings.length === 0) {
        return [];
      }

      const validationIds = mappings.map((m) => m.validationid).filter(Boolean);
      if (validationIds.length === 0) {
        return [];
      }

      // Fetch validation rules
      const { data: validations, error: valError } = await supabase
        .from("validation")
        .select("id, description, query, created_at")
        .in("id", validationIds);

      if (valError) throw valError;

      // Enrich with mapping info
      const mappingMap = new Map(mappings.map((m) => [String(m.validationid), m]));
      return (validations || []).map((val) => ({
        ...val,
        mappingId: mappingMap.get(String(val.id))?.id,
      }));
    } catch (err) {
      console.error("Failed to fetch validation rules from Supabase:", err);
      throw err;
    }
  }, [formId]);

  /**
   * Step 3: Execute validation queries
   * For now, this calls a helper backend endpoint or Supabase functions
   */
  const executeValidations = useCallback(
    async (data, rules) => {
      if (!rules || rules.length === 0) {
        return [];
      }

      // Execute all validations in parallel
      // Note: This calls the backend to execute queries since frontend can't run SQL directly
      const validationPromises = rules.map((rule) =>
        executeValidationQuery(rule, data),
      );

      const executedResults = await Promise.all(validationPromises);
      return executedResults;
    },
    [validationApiBase],
  );

  /**
   * Execute a single validation query
   * Calls backend to execute the query against MySQL
   */
  const executeValidationQuery = async (rule, data) => {
    try {
      // Prepare query by replacing placeholders
      const query = prepareQuery(rule.query, data);

      // Call backend to execute this specific query
      const response = await fetch(`${validationApiBase}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          validationId: rule.id,
          description: rule.description,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        return {
          validationId: rule.id,
          mappingId: rule.mappingId,
          description: rule.description,
          success: false,
          error: errorPayload?.error || "Query execution failed",
          info: null,
        };
      }

      const result = await response.json();
      return {
        validationId: rule.id,
        mappingId: rule.mappingId,
        description: rule.description,
        success: result.success || false,
        info: result.info,
      };
    } catch (err) {
      return {
        validationId: rule.id,
        mappingId: rule.mappingId,
        description: rule.description,
        success: false,
        error: err.message,
        info: null,
      };
    }
  };

  /**
   * Prepare validation query by replacing placeholders
   */
  const prepareQuery = (template, data) => {
    if (!template) return template;

    let result = template;
    result = result.replace(
      /\{\{enccode\}\}|\$ENCCODE\$|{enccode}/gi,
      `'${(data?.enccode || "").replace(/'/g, "''")}'`,
    );
    result = result.replace(
      /\{\{hpercode\}\}|\$HPERCODE\$|{hpercode}/gi,
      `'${(data?.hpercode || "").replace(/'/g, "''")}'`,
    );
    return result;
  };

  /**
   * Calculate summary from results
   */
  const calculateSummary = (resultsList) => {
    const passed = resultsList.filter((r) => r.success).length;
    const failed = resultsList.length - passed;
    return {
      total: resultsList.length,
      passed,
      failed,
      allPassed: failed === 0,
      missing: resultsList
        .filter((r) => !r.success)
        .map((r) => r.description)
        .filter(Boolean),
    };
  };

  /**
   * Main refresh function: fetch data and validate
   */
  const refresh = useCallback(async () => {
    if (!enccode || !formId) {
      setEncounterData(null);
      setValidationRules([]);
      setResults([]);
      setSummary({
        total: 0,
        passed: 0,
        failed: 0,
        allPassed: true,
        missing: [],
      });
      setError(
        !enccode ? "No encounter code available for validation." : "No form ID provided.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: Fetch encounter data
      const data = await fetchEncounterData();
      setEncounterData(data);

      // Step 2: Fetch validation rules
      const rules = await fetchValidationRules();
      setValidationRules(rules);

      // Step 3: Execute validations
      const validationResults = await executeValidations(data, rules);
      setResults(validationResults);

      // Calculate summary
      const newSummary = calculateSummary(validationResults);
      setSummary(newSummary);
    } catch (err) {
      console.error("Validation error:", err);
      setError(err.message || "An error occurred during validation");
      setEncounterData(null);
      setValidationRules([]);
      setResults([]);
      setSummary({
        total: 0,
        passed: 0,
        failed: 0,
        allPassed: true,
        missing: [],
      });
    } finally {
      setLoading(false);
    }
  }, [enccode, formId, fetchEncounterData, fetchValidationRules, executeValidations]);

  // Auto-refresh when enccode or formId changes
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    encounterData,
    validationRules,
    results,
    summary,
    loading,
    error,
    refresh,
  };
}
