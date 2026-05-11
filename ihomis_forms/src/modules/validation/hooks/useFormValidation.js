import { useCallback, useEffect, useMemo, useState } from "react";

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

  const validationApiBase =
    import.meta.env.VITE_VALIDATION_API_URL ||
    import.meta.env.VITE_VALIDATION_API ||
    "http://localhost:3000/api/validation";

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
      const response = await fetch(`${validationApiBase}/run`, {
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

      // Transform the results array into admission/discharge/details structure
      const results = payload.results || [];
      const admissionResults = results.filter(r => r.description?.toLowerCase().includes("admission") || r.description?.toLowerCase().includes("history") || r.description?.toLowerCase().includes("vital") || r.description?.toLowerCase().includes("bmi"));
      const dischargeResults = results.filter(r => r.description?.toLowerCase().includes("discharge") || r.description?.toLowerCase().includes("order") || r.description?.toLowerCase().includes("diagnosis") || r.description?.toLowerCase().includes("icd"));
      const detailsResults = results;

      setValidationData({
        admission: {
          ok: true,
          enccode,
          isComplete: admissionResults.length > 0 && admissionResults.every(r => r.success),
          details: Object.fromEntries(admissionResults.map(r => [r.description, r.success])),
          missingFields: admissionResults.filter(r => !r.success).map(r => r.description),
        },
        discharge: {
          ok: true,
          enccode,
          isComplete: dischargeResults.length > 0 && dischargeResults.every(r => r.success),
          details: Object.fromEntries(dischargeResults.map(r => [r.description, r.success])),
          missingFields: dischargeResults.filter(r => !r.success).map(r => r.description),
        },
        details: {
          ok: true,
          enccode,
          validation: Object.fromEntries(detailsResults.map(r => [r.description, { success: r.success, rowCount: r.info?.rowCount || 0 }])),
          results: detailsResults,
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
