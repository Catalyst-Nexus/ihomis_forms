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
 */
export function useFormValidation({ selectedPatient, enccode: propEnccode }) {
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

  const fetchValidationEndpoint = useCallback(async (url, label) => {
    try {
      const response = await fetch(url);
      let payload = null;

      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        return {
          ok: false,
          label,
          status: response.status,
          data: payload,
          error: `${label}:${response.status}`,
        };
      }

      return {
        ok: true,
        label,
        status: response.status,
        data: payload,
      };
    } catch {
      return {
        ok: false,
        label,
        status: 0,
        data: null,
        error: `${label}:network`,
      };
    }
  }, []);

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

      // Fetch all validation payloads; keep successful ones even if one endpoint fails.
      const [admissionResult, dischargeResult, detailsResult] = await Promise.all([
        fetchValidationEndpoint(
          `${validationApiBase}/admission/${encodedEnccode}`,
          "admission",
        ),
        fetchValidationEndpoint(
          `${validationApiBase}/discharge/${encodedEnccode}`,
          "discharge",
        ),
        fetchValidationEndpoint(
          `${validationApiBase}/details/${encodedEnccode}`,
          "details",
        ),
      ]);

      const failedEndpoints = [admissionResult, dischargeResult, detailsResult]
        .filter((result) => !result.ok)
        .map((result) => result.error);

      const admissionData = admissionResult.ok ? admissionResult.data : null;
      const dischargeData = dischargeResult.ok ? dischargeResult.data : null;
      const detailsData = detailsResult.ok ? detailsResult.data : null;

      if (!admissionData && !dischargeData && !detailsData) {
        const failureText = failedEndpoints.length
          ? failedEndpoints.join(", ")
          : "unknown";
        throw new Error(
          `Failed to fetch validation data from server (${failureText}).`,
        );
      }

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
  }, [enccode, validationApiBase, fetchValidationEndpoint]);

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
