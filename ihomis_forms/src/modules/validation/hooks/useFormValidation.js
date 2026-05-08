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
      (selectedPatient?.idSource === "enccode" ? selectedPatient.id : "") ||
      selectedPatient?.id ||
      "",
  );
}

/**
 * Hook to validate forms using the backend API
 * Replaces chart tracking validation with API-based form validation
 */
export function useFormValidation({ selectedPatient, enccode: propEnccode }) {
  const [validationData, setValidationData] = useState({
    admission: null,
    discharge: null,
    details: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const enccode = useMemo(
    () => propEnccode || resolveEnccode(selectedPatient),
    [propEnccode, selectedPatient],
  );

  const validationApiBase =
    import.meta.env.VITE_VALIDATION_API_URL ||
    import.meta.env.VITE_VALIDATION_API ||
    "http://localhost:3000/api/validation";

  const refresh = useCallback(async () => {
    if (!enccode) {
      setValidationData({ admission: null, discharge: null, details: null });
      setError("No encounter code available for validation.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const encodedEnccode = encodeURIComponent(enccode);

      // Fetch all validation data in parallel
      const [admissionRes, dischargeRes, detailsRes] = await Promise.all([
        fetch(`${validationApiBase}/admission/${encodedEnccode}`),
        fetch(`${validationApiBase}/discharge/${encodedEnccode}`),
        fetch(`${validationApiBase}/details/${encodedEnccode}`),
      ]);

      if (!admissionRes.ok || !dischargeRes.ok || !detailsRes.ok) {
        const failedStatuses = [
          `admission:${admissionRes.status}`,
          `discharge:${dischargeRes.status}`,
          `details:${detailsRes.status}`,
        ].join(", ");
        throw new Error(
          `Failed to fetch validation data from server (${failedStatuses}).`,
        );
      }

      const [admissionData, dischargeData, detailsData] = await Promise.all([
        admissionRes.json(),
        dischargeRes.json(),
        detailsRes.json(),
      ]);

      setValidationData({
        admission: admissionData,
        discharge: dischargeData,
        details: detailsData,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation failed.");
      setValidationData({ admission: null, discharge: null, details: null });
    } finally {
      setLoading(false);
    }
  }, [enccode, validationApiBase]);

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
