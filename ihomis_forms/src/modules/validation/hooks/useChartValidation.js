import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../../tracking/hooks/supabaseClient.js";
import {
  extractAdmittedDate,
  matchApiField,
  parseApiStatus,
  safeDisplay,
} from "../../../tracking/utils/chartTrackingUtils.js";

function buildTrackingUrl(baseUrl, queryParams) {
  if (!baseUrl) return "";

  const hasProtocol = /^https?:\/\//i.test(baseUrl);
  const url = hasProtocol
    ? new URL(baseUrl)
    : new URL(baseUrl, window.location.origin);

  if (queryParams && typeof queryParams === "object") {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      const normalized = String(value).trim();
      if (!normalized) return;
      url.searchParams.set(key, normalized);
    });
  }

  return url.toString();
}

function resolvePatientHpercode(selectedPatient) {
  return String(
    selectedPatient?.rawData?.hpercode ||
      selectedPatient?.contextParams?.hpercode ||
      (selectedPatient?.idSource === "hpercode" ? selectedPatient.id : "") ||
      selectedPatient?.id ||
      "",
  ).trim();
}

function parseApiRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function buildLogMap(logRows) {
  return (logRows || []).reduce((acc, log) => {
    const trackingId = String(log.tracking_id || "");
    const seqId = log.seq_id;
    if (!trackingId) return acc;
    if (!acc[trackingId]) acc[trackingId] = {};
    acc[trackingId][seqId] = log;
    return acc;
  }, {});
}

function buildStepStatus({ step, apiRow, logEntry }) {
  if (logEntry) {
    return {
      id: step.id,
      label: step.label,
      done: true,
      statusLabel: logEntry.done_at ? safeDisplay(logEntry.done_at) : "Done",
      source: "log",
    };
  }

  const apiField = matchApiField(step.label);
  if (apiField && apiRow?.[apiField]) {
    const parsed = parseApiStatus(String(apiRow[apiField]));
    if (parsed.done) {
      return {
        id: step.id,
        label: step.label,
        done: true,
        statusLabel: parsed.isoDate ? safeDisplay(parsed.isoDate) : "Done",
        source: "api",
      };
    }
  }

  return {
    id: step.id,
    label: step.label,
    done: false,
    statusLabel: "",
    source: "missing",
  };
}

function buildEncounterSummary({ apiRow, trackingRow, logMap, steps }) {
  const enccode = apiRow.enccode || apiRow.tracking_encocode || "";
  const admittedDate = extractAdmittedDate(enccode);
  const trackingLogs = trackingRow ? logMap[String(trackingRow.id)] || {} : {};

  const stepStatuses = steps.map((step) =>
    buildStepStatus({
      step,
      apiRow,
      logEntry: trackingLogs[step.id],
    }),
  );

  const missingSteps = stepStatuses.filter((step) => !step.done);
  const completedSteps = stepStatuses.filter((step) => step.done);

  return {
    key: enccode || apiRow.patient_id || apiRow.patient_name || "unknown",
    enccode,
    encounterType: String(apiRow.encounter_type || "").toUpperCase(),
    patientName: apiRow.patient_name || "",
    hospitalNo: apiRow.hospital_no || apiRow.patient_id || "",
    dischargedDate: apiRow.discharged_date || "",
    admittedDate,
    missingSteps,
    completedSteps,
    totalSteps: steps.length,
    hasTrackingRecord: Boolean(trackingRow?.id),
  };
}

export function useChartValidation({ selectedPatient }) {
  const [steps, setSteps] = useState([]);
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const patientHpercode = useMemo(
    () => resolvePatientHpercode(selectedPatient),
    [selectedPatient],
  );

  const refresh = useCallback(async () => {
    const trackingUrl = import.meta.env.VITE_CHART_TRACKING || "";

    if (!patientHpercode) {
      setEncounters([]);
      setSteps([]);
      setError("No patient selected for validation.");
      return;
    }

    if (!trackingUrl) {
      setEncounters([]);
      setSteps([]);
      setError("VITE_CHART_TRACKING is not configured.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [stepsResult, apiResult] = await Promise.all([
        supabase
          .from("tracking_sequence")
          .select("id, description, sort_order")
          .order("sort_order", { ascending: true }),
        fetch(buildTrackingUrl(trackingUrl, { hpercode: patientHpercode })),
      ]);

      if (stepsResult.error) {
        throw new Error(
          stepsResult.error.message || "Unable to load tracking steps.",
        );
      }

      const stepRows = stepsResult.data || [];
      const nextSteps = stepRows.map((row) => ({
        id: row.id,
        label: row.description,
      }));
      setSteps(nextSteps);

      if (!apiResult.ok) {
        throw new Error(
          `Chart tracking request failed with ${apiResult.status}.`,
        );
      }

      const apiPayload = await apiResult.json();
      const apiRows = parseApiRows(apiPayload);

      const enccodes = apiRows
        .map((row) => String(row.enccode || row.tracking_encocode || "").trim())
        .filter(Boolean);

      if (!apiRows.length || !enccodes.length) {
        setEncounters([]);
        setLoading(false);
        return;
      }

      const { data: trackingRows, error: trackingError } = await supabase
        .from("tracking")
        .select("id, tracking_encocode, encounter_type, date_created")
        .in("tracking_encocode", enccodes);

      if (trackingError) {
        throw new Error(
          trackingError.message || "Unable to load tracking records.",
        );
      }

      const trackingByEnc = new Map(
        (trackingRows || []).map((row) => [row.tracking_encocode, row]),
      );

      const trackingIds = (trackingRows || []).map((row) => row.id);
      let logMap = {};

      if (trackingIds.length) {
        const { data: logRows, error: logError } = await supabase
          .from("tracking_log")
          .select("id, tracking_id, seq_id, done_by, done_at, remarks")
          .in("tracking_id", trackingIds);

        if (logError) {
          throw new Error(logError.message || "Unable to load tracking logs.");
        }

        logMap = buildLogMap(logRows);
      }

      const summaries = apiRows.map((row) =>
        buildEncounterSummary({
          apiRow: row,
          trackingRow: trackingByEnc.get(
            row.enccode || row.tracking_encocode || "",
          ),
          logMap,
          steps: nextSteps,
        }),
      );

      setEncounters(summaries);
    } catch (err) {
      setEncounters([]);
      setSteps([]);
      setError(err instanceof Error ? err.message : "Validation failed.");
    } finally {
      setLoading(false);
    }
  }, [patientHpercode]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const summary = useMemo(() => {
    const totalSteps = steps.length * (encounters.length || 0);
    const missingSteps = encounters.reduce(
      (acc, encounter) => acc + encounter.missingSteps.length,
      0,
    );
    const completedSteps = encounters.reduce(
      (acc, encounter) => acc + encounter.completedSteps.length,
      0,
    );

    return {
      encounters: encounters.length,
      totalSteps,
      missingSteps,
      completedSteps,
    };
  }, [encounters, steps]);

  return {
    encounters,
    steps,
    loading,
    error,
    summary,
    patientHpercode,
    refresh,
  };
}
