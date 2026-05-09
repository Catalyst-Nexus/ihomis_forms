import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../tracking/hooks/supabaseClient.js";
import {
  Search, X, Calendar, RefreshCw,
  CheckCircle2, Clock, ArrowRight, ChevronRight
} from "lucide-react";
import "./tracking.css";

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOW DEFINITION — fixed order, 8 columns
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  { key: "phic",             label: "PHIC"             },
  { key: "records_received", label: "Records Received" },
  { key: "verify_status",    label: "Verify"           },
  { key: "scan_status",      label: "Scan"             },
  { key: "send_status",      label: "Send"             },
  { key: "records_filed",    label: "Records Filed"    },
  { key: "claim_map",        label: "Claim Map"        },
  { key: "acpn",             label: "ACPN"             },
];

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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function parseApiStatus(raw = "") {
  const lower = raw.toLowerCase();
  if (lower.includes("not yet") || lower.includes("no phic")) return { done: false };
  return { done: true, label: raw };
}

function extractAdmittedDate(encoCode = "") {
  const m = String(encoCode).match(/(\d{2}\/\d{2}\/\d{4})\s*(\d{2}:\d{2}:\d{2})?/);
  if (!m) return "—";
  return m[2] ? `${m[1]} ${m[2]}` : m[1];
}

function calculateRemainingDays(dischargedDate) {
  if (!dischargedDate || dischargedDate === "—") return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(dischargedDate);
  if (isNaN(d.getTime())) return null;
  return 60 - Math.floor((today - d) / 86400000);
}

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-PH", { dateStyle: "short", timeStyle: "short" });
}

function getApiValueForStep(apiRow, stepKey) {
  const keywords = API_FIELD_MAP[stepKey] ?? [];
  for (const kw of keywords) {
    for (const [field, val] of Object.entries(apiRow ?? {})) {
      if (field.toLowerCase().includes(kw) && val) return String(val);
    }
  }
  return null;
}

function getNextStepKey(stepKey) {
  const idx = STEPS.findIndex(s => s.key === stepKey);
  if (idx === -1 || idx >= STEPS.length - 1) return null;
  return STEPS[idx + 1].key;
}

// ─────────────────────────────────────────────────────────────────────────────
// ProcessModal — click a cell → opens this
// ─────────────────────────────────────────────────────────────────────────────
function ProcessModal({ ctx, stepKeyToUsers, onClose, onSave }) {
  const {
    row, stepKey, stepLabel, existingLog,
    currentUserId, currentUserName,
  } = ctx;

  const [remarks,  setRemarks]  = useState(existingLog?.remarks ?? "");
  const [nextUser, setNextUser] = useState("");
  const [saving,   setSaving]   = useState(false);

  // Workflow history — steps marked done
  const history = Object.entries(row._stepLogs ?? {})
    .filter(([, l]) => l.status === "done")
    .sort(([, a], [, b]) => new Date(a.completed_at) - new Date(b.completed_at));

  // Only show users assigned to the NEXT step
  const nextStepKey   = getNextStepKey(stepKey);
  const nextStepLabel = STEPS.find(s => s.key === nextStepKey)?.label ?? "next step";
  const eligibleUsers = nextStepKey
    ? (stepKeyToUsers[nextStepKey] ?? []).filter(u => u.user_id !== currentUserId)
    : [];

  async function handleDoneAndPass() {
    if (nextStepKey && !nextUser) return;
    setSaving(true);
    await onSave({ row, stepKey, remarks, markDone: true, nextUserId: nextUser || null });
    setSaving(false);
    onClose();
  }

  async function handleSaveOnly() {
    setSaving(true);
    await onSave({ row, stepKey, remarks, markDone: false });
    setSaving(false);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-info">
            <span className="modal-step-pill">{stepLabel}</span>
            <h3 className="modal-patient">{row.patientName}</h3>
            <p className="modal-patient-sub">{row.hospitalNo} · {row.admittedDate}</p>
          </div>
          <button className="modal-x-btn" onClick={onClose}><X size={16}/></button>
        </div>

        {/* Workflow history */}
        {history.length > 0 && (
          <div className="modal-history">
            <p className="modal-section-title">📋 Workflow History</p>
            <div className="modal-timeline">
              {history.map(([key, log]) => {
                const step = STEPS.find(s => s.key === key);
                return (
                  <div key={key} className="timeline-row">
                    <CheckCircle2 size={13} className="tl-icon-done"/>
                    <div className="tl-content">
                      <span className="tl-step">{step?.label ?? key}</span>
                      <span className="tl-who">{log.completed_by} · {fmt(log.completed_at)}</span>
                      {log.remarks && <p className="tl-remarks">"{log.remarks}"</p>}
                    </div>
                  </div>
                );
              })}
              {/* Current step */}
              <div className="timeline-row timeline-row--current">
                <Clock size={13} className="tl-icon-current"/>
                <div className="tl-content">
                  <span className="tl-step">{stepLabel} <em>(you are here)</em></span>
                  <span className="tl-who">{currentUserName}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remarks */}
        <div className="modal-body">
          <label className="modal-field-label">
            Remarks for <strong>{stepLabel}</strong>
          </label>
          <textarea
            className="modal-textarea"
            rows={3}
            placeholder="Type your remarks or notes…"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            autoFocus
          />
        </div>

        {/* Pass to next user */}
        <div className="modal-pass-section">
          <p className="modal-section-title">
            <ArrowRight size={13}/>
            {nextStepKey
              ? <> Mark Done &amp; Pass to <strong>{nextStepLabel}</strong> user</>
              : <> Mark Done (last step)</>
            }
          </p>

          {nextStepKey ? (
            eligibleUsers.length > 0 ? (
              <>
                <select
                  className="modal-select"
                  value={nextUser}
                  onChange={e => setNextUser(e.target.value)}
                >
                  <option value="">— Choose who handles {nextStepLabel} —</option>
                  {eligibleUsers.map(u => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.full_name ?? u.username}
                    </option>
                  ))}
                </select>
                <p className="modal-pass-hint">
                  Only users assigned to <strong>{nextStepLabel}</strong> are listed.
                </p>
              </>
            ) : (
              <p className="modal-pass-hint modal-pass-hint--warn">
                ⚠️ No users are assigned to <strong>{nextStepLabel}</strong> yet.
                You can still save remarks below.
              </p>
            )
          ) : (
            <p className="modal-pass-hint">
              This is the last step in the workflow. No handoff needed.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="mbtn mbtn--ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="mbtn mbtn--outline" onClick={handleSaveOnly} disabled={saving}>
            Save Remarks Only
          </button>
          <button
            className="mbtn mbtn--primary"
            onClick={handleDoneAndPass}
            disabled={saving || (nextStepKey && eligibleUsers.length > 0 && !nextUser)}
            title={nextStepKey && !nextUser ? "Select a user first" : ""}
          >
            {saving
              ? "Saving…"
              : <><CheckCircle2 size={13}/> Done &amp; Pass →</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function Tracking({
  onBackToModuleNavigator,
  currentUserId,
  currentUserName,
  onSwitchUser,
}) {
  const [encounterFilter, setEncounterFilter] = useState("ADM");
  const [nameInput,  setNameInput]  = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [dateInput,  setDateInput]  = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [apiRows,            setApiRows]            = useState([]);
  const [dbRows,             setDbRows]             = useState([]);
  const [wfLogs,             setWfLogs]             = useState({});
  const [allUsers,           setAllUsers]           = useState([]);
  const [myAssignedStepKeys, setMyAssignedStepKeys] = useState(new Set());
  const [isSuperUser,        setIsSuperUser]        = useState(false);
  const [seqToKey,           setSeqToKey]           = useState({});
  // stepKey → array of user objects assigned to that step
  const [stepKeyToUsers,     setStepKeyToUsers]     = useState({});

  const [loadingApi,  setLoadingApi]  = useState(false);
  const [syncing,     setSyncing]     = useState(false);
  const [error,       setError]       = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modal,       setModal]       = useState(null);
  const ROWS_PER_PAGE = 10;

  // ── Bootstrap ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUserId) return;
    (async () => {
      // tracking_sequence → seqId → stepKey map
      const { data: seqs } = await supabase
        .from("tracking_sequence")
        .select("id, description")
        .order("sort_order", { ascending: true });

      const map = {};
      for (const s of seqs ?? []) {
        const desc = s.description.toLowerCase();
        for (const [key, kws] of Object.entries(API_FIELD_MAP)) {
          if (kws.some(kw => desc.includes(kw))) { map[s.id] = key; break; }
        }
      }
      setSeqToKey(map);

      // All active users
      const { data: users } = await supabase
        .from("users").select("user_id, username, full_name").eq("active", true);
      setAllUsers(users ?? []);

      // Build stepKey → users[] map from ALL user_seq_assignment rows
      const { data: allAssignments } = await supabase
        .from("user_seq_assignment").select("user_id, seq_id");

      const skToUsers = {};
      for (const stepKey of Object.keys(API_FIELD_MAP)) {
        skToUsers[stepKey] = [];
      }
      for (const assignment of allAssignments ?? []) {
        const sk   = map[assignment.seq_id];
        if (!sk) continue;
        const user = (users ?? []).find(u => u.user_id === assignment.user_id);
        if (user && !skToUsers[sk].some(u => u.user_id === user.user_id)) {
          skToUsers[sk].push(user);
        }
      }
      setStepKeyToUsers(skToUsers);

      // Is current user a super user? (tag_order === 1)
      const { data: myTA } = await supabase
        .from("tracking_user_assignment")
        .select("tag_order").eq("user_id", currentUserId);
      const isSuper = (myTA ?? []).some(a => a.tag_order === 1);
      setIsSuperUser(isSuper);

      // My assigned step keys (for non-super users)
      if (!isSuper) {
        const { data: mySeqs } = await supabase
          .from("user_seq_assignment").select("seq_id").eq("user_id", currentUserId);
        setMyAssignedStepKeys(new Set(
          (mySeqs ?? []).map(r => map[r.seq_id]).filter(Boolean)
        ));
      }
    })();
  }, [currentUserId]);

  // ── Fetch API ────────────────────────────────────────────────────────────
  const fetchApi = useCallback(async () => {
    const url = import.meta.env.VITE_CHART_TRACKING;
    if (!url) { setError("VITE_CHART_TRACKING not configured."); return; }
    setLoadingApi(true); setError("");
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setApiRows(Array.isArray(json) ? json : (json?.data ?? []));
    } catch (e) { setError(`API error: ${e.message}`); }
    finally { setLoadingApi(false); }
  }, []);

  useEffect(() => { fetchApi(); }, [fetchApi]);

  // ── Sync API → tracking table ────────────────────────────────────────────
  useEffect(() => {
    if (!apiRows.length) return;
    let cancelled = false;
    (async () => {
      setSyncing(true);
      for (const r of apiRows) {
        if (cancelled) break;
        const enco = r.enccode ?? r.tracking_encocode;
        if (!enco) continue;
        await supabase.from("tracking").upsert(
          { tracking_encocode: enco, encounter_type: r.encounter_type ?? "", is_current: true, created_by: String(r.patient_id ?? "") },
          { onConflict: "tracking_encocode" }
        );
      }
      if (!cancelled) { setSyncing(false); await reloadDb(); }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiRows]);

  // ── Reload DB + workflow logs ────────────────────────────────────────────
  const reloadDb = useCallback(async () => {
    const { data: rows } = await supabase
      .from("tracking").select("id, tracking_encocode, encounter_type, date_created")
      .order("date_created", { ascending: false });
    if (!rows?.length) { setDbRows([]); setWfLogs({}); return; }

    const ids = rows.map(r => r.id);
    const { data: logs } = await supabase
      .from("workflow_step_log")
      .select("id, tracking_id, step_key, status, remarks, completed_by, completed_at, assigned_to")
      .in("tracking_id", ids);

    const lm = {};
    for (const l of logs ?? []) {
      if (!lm[l.tracking_id]) lm[l.tracking_id] = {};
      lm[l.tracking_id][l.step_key] = l;
    }
    setWfLogs(lm);
    setDbRows(rows);
  }, []);

  useEffect(() => { reloadDb(); }, [reloadDb]);

  // ── Merge ────────────────────────────────────────────────────────────────
  const mergedRows = useMemo(() => apiRows.map(apiRow => {
    const enco = apiRow.enccode ?? apiRow.tracking_encocode ?? "";
    const db   = dbRows.find(r => r.tracking_encocode === enco);
    const dis  = apiRow.discharged_date || "—";
    return {
      id:             db?.id ?? null,
      encoCode:       enco,
      encounterType:  (apiRow.encounter_type ?? "").toUpperCase(),
      patientName:    apiRow.patient_name ?? "—",
      hospitalNo:     apiRow.hospital_no ?? apiRow.patient_id ?? "—",
      admittedDate:   extractAdmittedDate(enco),
      dischargedDate: dis,
      remainingDays:  calculateRemainingDays(dis),
      _apiRow:        apiRow,
      _stepLogs:      db?.id ? (wfLogs[db.id] ?? {}) : {},
    };
  }), [apiRows, dbRows, wfLogs]);

  // ── Filter + sort ────────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    const f = mergedRows.filter(r => {
      if (encounterFilter && r.encounterType !== encounterFilter) return false;
      if (nameFilter && !r.patientName.toLowerCase().includes(nameFilter.toLowerCase())) return false;
      if (dateFilter && !r.admittedDate.includes(dateFilter)) return false;
      return true;
    });
    return f.sort((a, b) => {
      if (a.remainingDays === null && b.remainingDays === null) return 0;
      if (a.remainingDays === null) return 1;
      if (b.remainingDays === null) return -1;
      if (a.remainingDays < 0 && b.remainingDays < 0) return 0;
      if (a.remainingDays < 0) return 1;
      if (b.remainingDays < 0) return -1;
      return a.remainingDays - b.remainingDays;
    });
  }, [mergedRows, encounterFilter, nameFilter, dateFilter]);

  useEffect(() => { setCurrentPage(1); }, [encounterFilter, nameFilter, dateFilter]);

  const totalPages    = Math.ceil(filteredRows.length / ROWS_PER_PAGE);
  const paginatedRows = filteredRows.slice((currentPage-1)*ROWS_PER_PAGE, currentPage*ROWS_PER_PAGE);

  // ── Cell state ───────────────────────────────────────────────────────────
  function getCellState(row, stepKey) {
    const wfLog  = row._stepLogs?.[stepKey];
    const apiRaw = getApiValueForStep(row._apiRow, stepKey);
    const apiOk  = apiRaw ? parseApiStatus(apiRaw).done : false;

    // ── Already logged in DB ───────────────────────────────────────────────
    if (wfLog) {
      if (wfLog.status === "done") {
        return {
          status:   "done",
          value:    wfLog.remarks || "Done",
          meta:     `${wfLog.completed_by ?? ""} · ${fmt(wfLog.completed_at)}`,
          canClick: false,
          log:      wfLog,
        };
      }
      // 'active' or 'pending' in DB — editable if authorised
      const canEdit = isSuperUser || myAssignedStepKeys.has(stepKey);
      return { status: "active", value: "", meta: "", canClick: canEdit, log: wfLog };
    }

    // ── Completed via API (no DB log yet) ──────────────────────────────────
    if (apiOk) {
      return { status: "done", value: apiRaw.slice(0, 24), meta: "API", canClick: false, log: null };
    }

    // ── No DB log exists yet ───────────────────────────────────────────────
    // Super users can click any undone cell immediately
    if (isSuperUser) {
      return { status: "active", value: "", meta: "", canClick: true, log: null };
    }

    // Regular users: must be assigned to this step
    if (!myAssignedStepKeys.has(stepKey)) {
      return { status: "pending", value: "", meta: "", canClick: false, log: null };
    }

    // Regular users: all previous steps must be done first
    const stepIndex       = STEPS.findIndex(s => s.key === stepKey);
    const allPreviousDone = STEPS.slice(0, stepIndex).every(prevStep => {
      const prevLog    = row._stepLogs?.[prevStep.key];
      if (prevLog) return prevLog.status === "done";
      const prevApiRaw = getApiValueForStep(row._apiRow, prevStep.key);
      return prevApiRaw ? parseApiStatus(prevApiRaw).done : false;
    });

    if (allPreviousDone || stepIndex === 0) {
      return { status: "active", value: "", meta: "", canClick: true, log: null };
    }
    return { status: "pending", value: "", meta: "", canClick: false, log: null };
  }

  // ── Open modal ───────────────────────────────────────────────────────────
  function openModal(row, stepKey, stepLabel, cell) {
    if (!cell.canClick) return;
    setModal({ row, stepKey, stepLabel, existingLog: cell.log, currentUserId, currentUserName });
  }

  // ── Ensure tracking row exists, returns trackingId ───────────────────────
  async function ensureTrackingRow(row) {
    if (row.id) return row.id;

    const { data: existing } = await supabase
      .from("tracking")
      .select("id")
      .eq("tracking_encocode", row.encoCode)
      .maybeSingle();

    if (existing?.id) return existing.id;

    const { data: inserted } = await supabase
      .from("tracking")
      .insert({
        tracking_encocode: row.encoCode,
        encounter_type:    row.encounterType ?? "",
        is_current:        true,
        created_by:        String(row.hospitalNo ?? ""),
      })
      .select("id")
      .single();

    return inserted?.id ?? null;
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  async function handleSave({ row, stepKey, remarks, markDone, nextUserId }) {
    const now = new Date().toISOString();

    const trackingId = await ensureTrackingRow(row);
    if (!trackingId) {
      console.error("Could not resolve tracking ID for", row.encoCode);
      return;
    }

    const existing = row._stepLogs?.[stepKey];

    if (markDone) {
      // Mark current step as done
      const donePayload = {
        tracking_id:  trackingId,
        step_key:     stepKey,
        status:       "done",
        remarks:      remarks || null,
        completed_by: currentUserName ?? currentUserId,
        completed_at: now,
        assigned_to:  currentUserId,
      };

      if (existing?.id) {
        await supabase.from("workflow_step_log").update(donePayload).eq("id", existing.id);
      } else {
        await supabase.from("workflow_step_log").insert(donePayload);
      }

      // Activate the next sequential step for the chosen user
      const nextKey = getNextStepKey(stepKey);
      if (nextKey) {
        const { data: nextEx } = await supabase
          .from("workflow_step_log")
          .select("id, status")
          .eq("tracking_id", trackingId)
          .eq("step_key", nextKey)
          .maybeSingle();

        const assignTo = nextUserId || currentUserId;

        if (nextEx?.id) {
          await supabase.from("workflow_step_log")
            .update({ status: "active", assigned_to: assignTo })
            .eq("id", nextEx.id);
        } else {
          await supabase.from("workflow_step_log").insert({
            tracking_id:  trackingId,
            step_key:     nextKey,
            status:       "active",
            assigned_to:  assignTo,
            remarks:      null,
            completed_by: null,
            completed_at: null,
          });
        }
      }
    } else {
      // Save remarks only — mark as active
      const activePayload = {
        tracking_id: trackingId,
        step_key:    stepKey,
        status:      "active",
        remarks:     remarks || null,
        assigned_to: currentUserId,
      };

      if (existing?.id) {
        await supabase.from("workflow_step_log").update(activePayload).eq("id", existing.id);
      } else {
        await supabase.from("workflow_step_log").insert(activePayload);
      }
    }

    await reloadDb();
  }

  const isLoading = loadingApi || syncing;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="tracking-page">
      <main className="tracking-shell">

        {/* Header */}
        <header className="tracking-title-box">
          <h1>Agusan del Norte Provincial Health Office</h1>
          <p>CHART Tracking System</p>
          {currentUserName && (
            <small>
              Viewing as: <strong>{currentUserName}</strong>
              {isSuperUser
                ? <span className="badge-super">SUPER USER</span>
                : myAssignedStepKeys.size > 0
                ? <span className="badge-assigned">
                    {[...myAssignedStepKeys].map(k => STEPS.find(s=>s.key===k)?.label).join(", ")}
                  </span>
                : null
              }
              {" · "}
              <button type="button" className="tracking-switch-user-link" onClick={onSwitchUser}>
                Switch user
              </button>
            </small>
          )}
        </header>

        {/* Filters */}
        <div className="tracking-filters">
          <div className="tracking-filter-row tracking-filter-row--select">
            <label>Encounter Type</label>
            <select value={encounterFilter} onChange={e => setEncounterFilter(e.target.value)}>
              <option value="">All</option>
              <option value="ADM">Admitted (ADM)</option>
              <option value="ER">Emergency (ER)</option>
              <option value="OPD">Out-Patient (OPD)</option>
            </select>
          </div>
          <div className="tracking-filter-row tracking-filter-row--search">
            <input type="text" placeholder="Search patient name…" value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key==="Enter" && setNameFilter(nameInput)}/>
            <button type="button" onClick={() => setNameFilter(nameInput)}><Search size={13}/> Search</button>
            {nameFilter && <button type="button" className="tracking-btn-ghost" onClick={() => { setNameFilter(""); setNameInput(""); }}><X size={12}/> Clear</button>}
          </div>
          <div className="tracking-filter-row tracking-filter-row--search">
            <input type="text" placeholder="Filter by date e.g. 02/18/2026…" value={dateInput}
              onChange={e => setDateInput(e.target.value)}
              onKeyDown={e => e.key==="Enter" && setDateFilter(dateInput)}/>
            <button type="button" onClick={() => setDateFilter(dateInput)}><Calendar size={13}/> Search</button>
            {dateFilter && <button type="button" className="tracking-btn-ghost" onClick={() => { setDateFilter(""); setDateInput(""); }}><X size={12}/> Clear</button>}
          </div>
        </div>

        {/* Actions */}
        <section className="tracking-actions">
          <button type="button" onClick={onBackToModuleNavigator}>← Back to Navigator</button>
          <button type="button" onClick={() => { fetchApi(); reloadDb(); }} disabled={isLoading}>
            <RefreshCw size={13}/> {isLoading ? "Syncing…" : "Refresh"}
          </button>
        </section>

        {error && <p className="tracking-error">{error}</p>}

        {/* Legend */}
        <div className="tracking-legend">
          <span className="leg"><span className="leg-dot leg-done"/><CheckCircle2 size={11}/> Done</span>
          <span className="leg"><span className="leg-dot leg-active"/><Clock size={11}/> Active – click to process</span>
          <span className="leg"><span className="leg-dot leg-empty"/> Pending</span>
          <span className="leg leg-hint">
            {isSuperUser
              ? "⚡ Super User — click any step cell to process"
              : myAssignedStepKeys.size > 0
              ? `✏️ You can process: ${[...myAssignedStepKeys].map(k=>STEPS.find(s=>s.key===k)?.label).join(", ")}`
              : "👁 View only — no step assigned"}
          </span>
        </div>

        <div className="tracking-status-bar">
          {isLoading
            ? "⏳ Syncing records from API…"
            : `${filteredRows.length} record${filteredRows.length!==1?"s":""}  ·  Page ${currentPage} of ${totalPages || 1}`}
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
                <th>Discharged</th>
                <th>Days Left</th>
                <th>Patient Name</th>
                {STEPS.map(s => <th key={s.key} className="th-step">{s.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {isLoading && !filteredRows.length
                ? <tr><td colSpan={7+STEPS.length} className="tracking-td-center">⏳ Loading…</td></tr>
                : !filteredRows.length
                ? <tr><td colSpan={7+STEPS.length} className="tracking-td-center">No records found.</td></tr>
                : paginatedRows.map((row, idx) => (
                  <tr key={row.encoCode}>
                    <td>{(currentPage-1)*ROWS_PER_PAGE + idx + 1}</td>
                    <td className="td-mono">{row.hospitalNo}</td>
                    <td>
                      <span className={`tracking-badge tracking-badge--${row.encounterType.toLowerCase()}`}>
                        {row.encounterType || "—"}
                      </span>
                    </td>
                    <td className="td-mono">{row.admittedDate}</td>
                    <td className="td-mono">{row.dischargedDate}</td>
                    <td className={row.remainingDays !== null && row.remainingDays <= 10 ? "td-urgent" : ""}>
                      {row.remainingDays != null ? `${row.remainingDays}d` : "—"}
                    </td>
                    <td className="tracking-td-name">{row.patientName}</td>

                    {STEPS.map(step => {
                      const cell      = getCellState(row, step.key);
                      const clickable = cell.canClick;
                      return (
                        <td
                          key={step.key}
                          className={[
                            "wf-cell",
                            cell.status === "done"   && "wf-done",
                            cell.status === "active" && "wf-active",
                            clickable                && "wf-clickable",
                          ].filter(Boolean).join(" ")}
                          onClick={() => clickable && openModal(row, step.key, step.label, cell)}
                          title={clickable ? `Click to process ${step.label}` : cell.value || ""}
                        >
                          <div className="wf-inner">
                            {cell.status === "done" && (
                              <>
                                <CheckCircle2 size={12} className="wf-icon-done"/>
                                <span className="wf-val">{cell.value.length > 16 ? cell.value.slice(0,16)+"…" : cell.value}</span>
                                <span className="wf-meta">{cell.meta}</span>
                              </>
                            )}
                            {cell.status === "active" && (
                              <>
                                {clickable && <span className="wf-pulse-ring"/>}
                                <Clock size={12} className="wf-icon-active"/>
                                {clickable
                                  ? <span className="wf-val wf-val-action"><ChevronRight size={10}/> Process</span>
                                  : <span className="wf-val wf-val-wait">Waiting</span>
                                }
                              </>
                            )}
                            {(cell.status === "empty" || cell.status === "pending") && (
                              clickable
                                ? <span className="wf-val wf-val-open">+ Add</span>
                                : <span className="wf-val wf-val-dash">—</span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="tracking-pagination">
            <button className="tracking-pagination-btn" onClick={() => setCurrentPage(p=>Math.max(p-1,1))} disabled={currentPage===1}>← Prev</button>
            <span className="tracking-pagination-info">Page {currentPage} of {totalPages}</span>
            <button className="tracking-pagination-btn" onClick={() => setCurrentPage(p=>Math.min(p+1,totalPages))} disabled={currentPage===totalPages}>Next →</button>
          </div>
        )}
      </main>

      {/* Modal */}
      {modal && (
        <ProcessModal
          ctx={modal}
          stepKeyToUsers={stepKeyToUsers}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}