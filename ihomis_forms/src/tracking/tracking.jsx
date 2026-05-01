import { useCallback, useEffect, useMemo, useState } from "react";
import "./tracking.css";
import { supabase } from "./supabaseClient";

// ── Safe date helpers — never throws RangeError ───────────────────────────────
function safeIso(raw) {
  if (!raw) return null;
  // Strip wrapper text like "Sent (2026-02-18 23:55:02)" → "2026-02-18 23:55:02"
  const cleaned = String(raw).replace(/^[^(]*\(([^)]+)\).*$/, "$1").trim();
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) return d.toISOString();
  // Try the raw string directly
  const d2 = new Date(raw);
  return isNaN(d2.getTime()) ? null : d2.toISOString();
}

function safeDisplay(raw) {
  const iso = safeIso(raw);
  if (!iso) return raw ? String(raw) : "—";
  return new Date(iso).toLocaleDateString();
}

// ── Parse API status strings ──────────────────────────────────────────────────
function parseApiStatus(raw = "") {
  if (!raw) return { done: false };
  const lower = raw.toLowerCase();
  if (lower.includes("not yet") || lower.includes("no phic")) {
    return { done: false };
  }
  return { done: true, isoDate: safeIso(raw), label: raw };
}

// Map API field names → keywords matching tracking_sequence.description
const API_FIELD_MAP = {
  phic:             ["phic"],
  records_received: ["records received", "records_received"],
  verify_status:    ["verify"],
  scan_status:      ["scan"],
  send_status:      ["send"],
  records_filed:    ["records filed", "records_filed"],
  claim_map:        ["claim map", "claim_map", "philhealth"],
  acpn:             ["acpm", "acpn"],
};

function matchApiField(stepDescription = "") {
  const desc = stepDescription.toLowerCase();
  for (const [field, keywords] of Object.entries(API_FIELD_MAP)) {
    if (keywords.some((k) => desc.includes(k))) return field;
  }
  return null;
}

// ── Extract date from enccode string ─────────────────────────────────────────
// enccode format: "000502700000000001747702/18/202623:26:16"
// The date MM/DD/YYYY is embedded after the patient ID digits
function extractAdmittedDate(encoCode = "") {
  const m = encoCode.match(/(\d{2}\/\d{2}\/\d{4})/);
  return m ? m[1] : "—";
}

// ════════════════════════════════════════════════════════════════════════════
export default function Tracking({
  selectedPatient,
  onBackToModuleNavigator,
  onChangePatient,
  onOpenTagging,
}) {
  // ── Encounter type filter — primary control ────────────────────────────────
  const [encounterFilter, setEncounterFilter] = useState("ADM");

  // ── Search filters ─────────────────────────────────────────────────────────
  const [nameInput,  setNameInput]  = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [dateInput,  setDateInput]  = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // ── Data ───────────────────────────────────────────────────────────────────
  const [steps,   setSteps]   = useState([]);
  const [apiRows, setApiRows] = useState([]);   // all patients from API
  const [dbRows,  setDbRows]  = useState([]);   // tracking rows from Supabase
  const [logs,    setLogs]    = useState({});   // { trackingId: { seqId: log } }

  const [loadingApi, setLoadingApi] = useState(false);
  const [syncing,    setSyncing]    = useState(false);
  const [error,      setError]      = useState("");

  // ── 1. Load tracking_sequence (dynamic workflow steps) ────────────────────
  useEffect(() => {
    (async () => {
      const { data, error: err } = await supabase
        .from("tracking_sequence")
        .select("id, description, sort_order")
        .order("sort_order", { ascending: true });
      if (!err && data?.length) {
        setSteps(data.map((r) => ({ id: r.id, label: r.description })));
      }
    })();
  }, []);

  // ── 2. Fetch ALL patients from VITE_CHART_TRACKING ────────────────────────
  const fetchApi = useCallback(async () => {
    const url = import.meta.env.VITE_CHART_TRACKING;
    if (!url) { setError("VITE_CHART_TRACKING is not configured."); return; }
    setLoadingApi(true);
    setError("");
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
          ? json.data
          : [];
      setApiRows(list);
    } catch (e) {
      setError(`API fetch error: ${e.message}`);
    } finally {
      setLoadingApi(false);
    }
  }, []);

  useEffect(() => { fetchApi(); }, [fetchApi]);

  // ── 3. Sync API rows → Supabase ───────────────────────────────────────────
  // Uses upsert with onConflict to avoid 409 Conflict errors
  useEffect(() => {
    if (!apiRows.length || !steps.length) return;
    let cancelled = false;

    (async () => {
      setSyncing(true);

      for (const apiRow of apiRows) {
        if (cancelled) break;

        const encoCode = apiRow.enccode ?? apiRow.tracking_encocode;
        if (!encoCode) continue;

        // Upsert tracking row — conflict on tracking_encocode (add UNIQUE constraint if missing)
        const { data: upserted, error: uErr } = await supabase
          .from("tracking")
          .upsert(
            {
              tracking_encocode: encoCode,
              encounter_type:    apiRow.encounter_type ?? "",
              is_current:        true,
              created_by:        String(apiRow.patient_id ?? ""),
            },
            { onConflict: "tracking_encocode" }
          )
          .select("id")
          .single();

        if (uErr || !upserted?.id) continue;
        const trackingId = upserted.id;

        // Sync completed steps → tracking_log
        for (const step of steps) {
          if (cancelled) break;

          const apiField = matchApiField(step.label);
          if (!apiField) continue;

          const rawVal = apiRow[apiField];
          if (!rawVal) continue;

          const parsed = parseApiStatus(String(rawVal));
          if (!parsed.done) continue;

          // Skip if already logged (avoid 409)
          const { data: existing } = await supabase
            .from("tracking_log")
            .select("id")
            .eq("tracking_id", trackingId)
            .eq("seq_id", step.id)
            .maybeSingle();

          if (existing) continue;

          // Safe ISO date — never throws RangeError
          const doneAt = parsed.isoDate ?? new Date().toISOString();

          await supabase.from("tracking_log").insert({
            tracking_id: trackingId,
            seq_id:      step.id,
            done_by:     "API sync",
            done_at:     doneAt,
            remarks:     parsed.label,
          });
        }
      }

      if (!cancelled) {
        setSyncing(false);
        await reloadDbRows();
      }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiRows, steps]);

  // ── 4. Reload Supabase rows + logs ────────────────────────────────────────
  const reloadDbRows = useCallback(async () => {
    const { data: trackingData, error: tErr } = await supabase
      .from("tracking")
      .select("id, tracking_encocode, encounter_type, date_created")
      .order("date_created", { ascending: false });

    if (tErr) return;
    if (!trackingData?.length) { setDbRows([]); return; }

    const ids = trackingData.map((r) => r.id);
    const { data: logData } = await supabase
      .from("tracking_log")
      .select("id, tracking_id, seq_id, done_by, done_at, remarks")
      .in("tracking_id", ids);

    const logMap = {};
    for (const log of logData ?? []) {
      if (!logMap[log.tracking_id]) logMap[log.tracking_id] = {};
      logMap[log.tracking_id][log.seq_id] = log;
    }

    setLogs(logMap);
    setDbRows(trackingData);
  }, []);

  useEffect(() => {
    if (steps.length) reloadDbRows();
  }, [reloadDbRows, steps]);

  // ── 5. Merge API rows with DB rows ────────────────────────────────────────
  // API is source of truth for patient data.
  // DB provides the Supabase `id` needed for tagging.
  const mergedRows = useMemo(() => {
    return apiRows.map((apiRow) => {
      const encoCode = apiRow.enccode ?? apiRow.tracking_encocode ?? "";
      const dbRow    = dbRows.find((r) => r.tracking_encocode === encoCode);

      return {
        id:             dbRow?.id ?? null,
        encoCode,
        encounterType:  (apiRow.encounter_type ?? "").toUpperCase(),
        patientName:    apiRow.patient_name ?? "—",
        hospitalNo:     apiRow.hospital_no  ?? apiRow.patient_id ?? "—",
        admittedDate:   extractAdmittedDate(encoCode),
        dischargedDate: apiRow.discharged_date || "—",
        _apiRow:        apiRow,
      };
    });
  }, [apiRows, dbRows]);

  // ── 6. Apply filters ───────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    return mergedRows.filter((r) => {
      // Encounter type — exact match against ADM / ER / OPD
      if (encounterFilter && r.encounterType !== encounterFilter) return false;
      // Name search
      if (nameFilter && !r.patientName.toLowerCase().includes(nameFilter.toLowerCase())) return false;
      // Date search
      if (dateFilter && !r.admittedDate.includes(dateFilter)) return false;
      return true;
    });
  }, [mergedRows, encounterFilter, nameFilter, dateFilter]);

  // ── 7. Step status per cell ────────────────────────────────────────────────
  function getStepStatus(row, seqId, stepLabel) {
    // Prefer DB log
    if (row.id !== null && logs[row.id]?.[seqId]) {
      const log = logs[row.id][seqId];
      return {
        done:  true,
        label: log.done_at ? safeDisplay(log.done_at) : "Done",
        title: log.remarks ?? "",
      };
    }
    // Fallback: API field
    const apiField = matchApiField(stepLabel);
    if (apiField && row._apiRow?.[apiField]) {
      const parsed = parseApiStatus(String(row._apiRow[apiField]));
      if (parsed.done) {
        return {
          done:  true,
          label: parsed.isoDate ? safeDisplay(parsed.isoDate) : "Done",
          title: String(row._apiRow[apiField]),
        };
      }
    }
    return { done: false, label: "—", title: "" };
  }

  // Rows with a valid Supabase ID — safe to pass to Tagging
  const taggableRows = filteredRows.filter((r) => r.id !== null);
  const isLoading    = loadingApi || syncing;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="tracking-page">
      <main className="tracking-shell">
        {/* Header */}
        <header className="tracking-title-box">
          <h1>Agusan del Norte Provincial Health Office</h1>
          <p>CHART Tracking System</p>
        
        </header>

        {/* Filters */}
        <div className="tracking-filters">
          {/* Encounter type — primary filter */}
          <div className="tracking-filter-row tracking-filter-row--select">
            <label htmlFor="encounter-filter">Encounter Type</label>
            <select
              id="encounter-filter"
              value={encounterFilter}
              onChange={(e) => setEncounterFilter(e.target.value)}
            >
              <option value="">All Encounters</option>
              <option value="ADM">Admitted (ADM)</option>
              <option value="ER">Emergency Room (ER)</option>
              <option value="OPD">Out-Patient Department (OPD)</option>
            </select>
          </div>

          {/* Name search */}
          <div className="tracking-filter-row tracking-filter-row--search">
            <input
              type="text"
              placeholder="Search patient name (Last, First Middle)…"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setNameFilter(nameInput)}
            />
            <button type="button" onClick={() => setNameFilter(nameInput)}>
              Search
            </button>
            {nameFilter && (
              <button
                type="button"
                className="tracking-btn-ghost"
                onClick={() => { setNameFilter(""); setNameInput(""); }}
              >
                ✕ Clear
              </button>
            )}
          </div>

          {/* Date search */}
          <div className="tracking-filter-row tracking-filter-row--search">
            <input
              type="text"
              placeholder="Filter by date e.g. 02/18/2026…"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setDateFilter(dateInput)}
            />
            <button type="button" onClick={() => setDateFilter(dateInput)}>
              Search
            </button>
            {dateFilter && (
              <button
                type="button"
                className="tracking-btn-ghost"
                onClick={() => { setDateFilter(""); setDateInput(""); }}
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <section className="tracking-actions">
          <button type="button" onClick={onBackToModuleNavigator}>
            ← Back to Navigator
          </button>
          <button type="button" onClick={onChangePatient}>
            Change Patient
          </button>
          <button
            type="button"
            onClick={() => onOpenTagging?.(taggableRows)}
            disabled={!taggableRows.length}
          >
            Open Tagging
          </button>
          <button type="button" onClick={fetchApi} disabled={isLoading}>
            {isLoading ? "Syncing…" : "↺ Refresh"}
          </button>
        </section>

        {/* Error */}
        {error && <p className="tracking-error">{error}</p>}

        {/* Status bar */}
        <div className="tracking-status-bar">
          {isLoading
            ? "⏳ Syncing records from API…"
            : `${filteredRows.length} of ${mergedRows.length} record${mergedRows.length !== 1 ? "s" : ""} · ${steps.length} steps loaded`}
        </div>

        {/* Table */}
        <div className="tracking-table-wrap">
          <table className="tracking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Hospital No.</th>
                <th>Encounter</th>
                <th>Admitted Date</th>
                <th>Discharged Date</th>
                <th>Patient Name</th>
                {steps.map((step) => (
                  <th key={step.id}>{step.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && !filteredRows.length ? (
                <tr>
                  <td colSpan={6 + steps.length} className="tracking-td-center">
                    ⏳ Loading records…
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6 + steps.length} className="tracking-td-center">
                    No {encounterFilter || ""} records found.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => (
                  <tr key={row.encoCode}>
                    <td>{index + 1}</td>
                    <td>{row.hospitalNo}</td>
                    <td>
                      <span className={`tracking-badge tracking-badge--${row.encounterType.toLowerCase()}`}>
                        {row.encounterType || "—"}
                      </span>
                    </td>
                    <td>{row.admittedDate}</td>
                    <td>{row.dischargedDate}</td>
                    <td className="tracking-td-name">{row.patientName}</td>
                    {steps.map((step) => {
                      const status = getStepStatus(row, step.id, step.label);
                      return (
                        <td
                          key={step.id}
                          className={`tracking-td-step${status.done ? " tracking-td-step--done" : ""}`}
                          title={status.title}
                        >
                          {status.done ? (
                            <>
                              <span className="tracking-step-check">✓</span>
                              <span className="tracking-step-date">{status.label}</span>
                            </>
                          ) : (
                            <span className="tracking-step-pending">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}