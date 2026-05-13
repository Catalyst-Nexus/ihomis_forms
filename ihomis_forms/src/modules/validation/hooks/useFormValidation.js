import { useCallback, useEffect, useMemo, useState } from "react";
import { getValidationApiBaseUrl } from "../validationApiConfig.js";

/**
 * Extract enccode from selected patient data
 */
function normalizeEncounterCode(rawValue) {
  const text = String(rawValue || "").trim();

  if (!text) return "";

  // Some patient payloads append date/time text after the encounter code.
  // Keep the first token so REST path segments remain valid.
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

/**
 * Hook to validate forms using the backend API
 * Replaces chart tracking validation with API-based form validation
 * Uses single POST /api/validation/run endpoint with formId and enccode
 */
export function useFormValidation({ selectedPatient, enccode: propEnccode, formId }) {
  const [validationData, setValidationData] = useState({
    admission: null,
    discharge: null,
    details: null,
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

  const validationApiBase = getValidationApiBaseUrl();

  const refresh = useCallback(async () => {
    if (!enccode || !formId) {
      setValidationData({ admission: null, discharge: null, details: null });
      setError(!enccode ? "No encounter code available for validation." : "No form ID provided.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Single endpoint: POST /api/validation/run
      const response = await fetch(validationApiBase ? `${validationApiBase}/run` : "/api/validation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: Number(formId), enccode }),
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        throw new Error(
          `Validation API error: ${response.status} (${payload?.error || "unknown"})`,
        );
      }

      if (!payload?.ok) {
        throw new Error(payload?.error || "Validation API returned error");
      }

      // Prefer the new backend shape, but keep compatibility with the old alias.
      const results = payload.validations || payload.results || [];
      const summary = payload.summary || {
        total: results.length,
        passed: results.filter((item) => item.success).length,
        failed: results.filter((item) => !item.success).length,
        allPassed: results.every((item) => item.success),
        missing: results.filter((item) => !item.success).map((item) => item.description),
      };

      setValidationData({
        admission: {
          ok: true,
          enccode,
          isComplete: summary.allPassed,
          details: Object.fromEntries(results.map((item) => [item.description, item.success])),
          missingFields: summary.missing,
        },
        discharge: {
          ok: true,
          enccode,
          isComplete: summary.allPassed,
          details: Object.fromEntries(results.map((item) => [item.description, item.success])),
          missingFields: summary.missing,
        },
        details: {
          ok: true,
          enccode,
          form: payload.form || null,
          encounter: payload.encounter || null,
          validationContext: payload.validationContext || null,
          summary,
          validation: Object.fromEntries(results.map((item) => [item.description, { success: item.success, rowCount: item.info?.rowCount || 0 }])),
          results,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation failed.");
      setValidationData({ admission: null, discharge: null, details: null });
    } finally {
      setLoading(false);
    }
  }, [enccode, formId, validationApiBase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const summary = useMemo(() => {
    const admission = validationData.admission;
    const discharge = validationData.discharge;

    const admissionMissing = admission?.missingFields || [];
    const dischargeMissing = discharge?.missingFields || [];

    return {
      enccode,
      admissionComplete: admission?.isComplete || false,
      dischargeComplete: discharge?.isComplete || false,
      admissionMissing,
      dischargeMissing,
      allMissing: [...admissionMissing, ...dischargeMissing],
      hasIssues: !admission?.isComplete || !discharge?.isComplete,
    };
  }, [validationData, enccode]);

  return {
    enccode,
    validationData,
    loading,
    error,
    summary,
    refresh,
  };
}
