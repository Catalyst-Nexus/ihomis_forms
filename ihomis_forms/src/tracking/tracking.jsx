import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { supabase } from "../tracking/hooks/supabaseClient.js";
import {Search, X, Calendar, RefreshCw, CheckCircle2, Clock, ArrowRight, ChevronRight, User} from "lucide-react";
import "./tracking.css";

// Workflow (dynamic via tracking_sequence)
function getNextSequenceId(steps, sequenceId) {
  const idx = steps.findIndex(s => String(s.id) === String(sequenceId));
  if (idx === -1 || idx >= steps.length - 1) return null;
  return steps[idx + 1].id;
}

// Toast
function Toast({ message, type = "success", onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`toast toast--${type}`}>
      {type === "success" ? <CheckCircle2 size={15}/> : "⚠️"}
      <span>{message}</span>
    </div>
  );
}

// Helpers
function extractAdmittedDate(encoCode = "") {
  const m = String(encoCode).match(
    /(\d{2}\/\d{2}\/\d{4})\s*(\d{2}:\d{2}:\d{2})?/,
  );
  if (!m) return "—";
  return m[2] ? `${m[1]} ${m[2]}` : m[1];
}

function calculateRemainingDays(dischargedDate) {
  if (!dischargedDate || dischargedDate === "—") return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dischargedDate);
  if (isNaN(d.getTime())) return null;
  return 60 - Math.floor((today - d) / 86400000);
}

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-PH", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function fmtTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

function getStepLabel(steps, sequenceId) {
  return steps.find(s => String(s.id) === String(sequenceId))?.label ?? `Step ${sequenceId}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// ProcessModal
// ─────────────────────────────────────────────────────────────────────────────
function ProcessModal({ ctx, steps, sequenceIdToUsers, onClose, onSave }) {
  const {
    row, sequenceId, sequenceLabel, existingLog,
    currentUserName,
  } = ctx;

  const [remarks,  setRemarks]  = useState(existingLog?.remarks ?? "");
  const [saving,   setSaving]   = useState(false);

  const history = Object.entries(row._stepLogs ?? {})
    .filter(([, l]) => l.status === "done")
    .sort(
      ([, a], [, b]) => new Date(a.completed_at) - new Date(b.completed_at),
    );

  const nextSequenceId = getNextSequenceId(steps, sequenceId);
  const nextStepLabel = nextSequenceId ? getStepLabel(steps, nextSequenceId) : "next step";

  const assignedUsers = nextSequenceId ? (sequenceIdToUsers[String(nextSequenceId)] ?? []) : [];
  const hasAssignees = assignedUsers.length > 0;

  async function handleDoneAndPass() {
    setSaving(true);
    const result = await onSave({ row, sequenceId, remarks, markDone: true });
    setSaving(false);
    onClose(result);
  }

  async function handleSaveOnly() {
    setSaving(true);
    const result = await onSave({ row, sequenceId, remarks, markDone: false });
    setSaving(false);
    onClose(result ?? null);
  }

  return (
    <div className="modal-backdrop" onClick={() => onClose(null)}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <div className="modal-header-info">
            <span className="modal-step-pill">
              <Clock size={11}/>
              {sequenceLabel}
            </span>
            <h3 className="modal-patient">
              <User size={20} style={{marginRight: '6px', opacity: 0.6}}/>
              {row.patientName}
            </h3>
            <p className="modal-patient-sub">{row.hospitalNo} · {row.admittedDate}</p>
          </div>
          <button className="modal-x-btn" onClick={() => onClose(null)}><X size={18}/></button>
        </div>

        {history.length > 0 && (
          <div className="modal-history">
            <p className="modal-section-title">
              <CheckCircle2 size={12}/>
              Workflow History
            </p>
            <div className="modal-timeline">
              {history.map(([key, log]) => {
                const step = steps.find(s => String(s.id) === String(key));
                return (
                  <div key={key} className="timeline-row">
                    <CheckCircle2 size={15} className="tl-icon-done"/>
                    <div className="tl-content">
                      <span className="tl-step">{step?.label ?? String(key)}</span>
                      <span className="tl-who">{log.completed_by} · {fmt(log.completed_at)}</span>
                      {log.remarks && <p className="tl-remarks">&quot;{log.remarks}&quot;</p>}
                    </div>
                  </div>
                );
              })}
              <div className="timeline-row timeline-row--current">
                <Clock size={15} className="tl-icon-current"/>
                <div className="tl-content">
                  <span className="tl-step">{sequenceLabel} <em>(you are here)</em></span>
                  <span className="tl-who">{currentUserName}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="modal-body">
          <label className="modal-field-label">
            Remarks for <strong>{sequenceLabel}</strong>
          </label>
          <textarea
            className="modal-textarea"
            rows={4}
            placeholder="Type your remarks or notes for this step…"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            autoFocus
          />
        </div>

        <div className="modal-pass-section">
          <p className="modal-pass-title">
            <ArrowRight size={14}/>
            {nextSequenceId
              ? <> Mark Done & Pass to <strong>{nextStepLabel}</strong> office</>
              : <> Mark Done (last step)</>
            }
          </p>

          {nextSequenceId ? (
            hasAssignees ? (
              <p className="modal-pass-hint">
                Passes to the <strong>{nextStepLabel}</strong> office ({assignedUsers.length} user{assignedUsers.length !== 1 ? "s" : ""} assigned).
              </p>
            ) : (
              <p className="modal-pass-hint modal-pass-hint--warn">
                No users are assigned to <strong>{nextStepLabel}</strong> yet.
                You can still save remarks below.
              </p>
            )
          ) : (
            <p className="modal-pass-hint">
              This is the last step in the workflow. No handoff needed.
            </p>
          )}
        </div>

        <div className="modal-footer">
          <button className="mbtn mbtn--ghost" onClick={() => onClose(null)} disabled={saving}>
            Cancel
          </button>
          <button
            className="mbtn mbtn--outline"
            onClick={handleSaveOnly}
            disabled={saving}
          >
            Save Remarks Only
          </button>
          <button
            className="mbtn mbtn--primary"
            onClick={handleDoneAndPass}
            disabled={saving}
          >
            {saving
              ? "Saving…"
              : <><CheckCircle2 size={14}/> Done & Pass</>
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

  const [steps,              setSteps]              = useState([]);
  const [apiRows,            setApiRows]            = useState([]);
  const [dbRows,             setDbRows]             = useState([]);
  const [wfLogs,             setWfLogs]             = useState({});
  const [allUsers,           setAllUsers]           = useState([]);
  const [myAssignedSeqIds,   setMyAssignedSeqIds]   = useState(new Set());
  const [isSuperUser,        setIsSuperUser]        = useState(false);
  const [sequenceIdToUsers,  setSequenceIdToUsers]  = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [modal,       setModal]       = useState(null);
  const [toast,       setToast]       = useState(null);
  const [loadingApi,  setLoadingApi]  = useState(false);
  const [syncing,     setSyncing]     = useState(false);
  const [error,       setError]       = useState("");
  const ROWS_PER_PAGE = 10;

  // ── Refs ──────────────────────────────────────────────────────────────────
  // Dedicated broadcast channel (stable across renders)
  const broadcastChannelRef = useRef(null);
  const reloadDebounceRef   = useRef(null);
  const reloadDbRef         = useRef(null);
  // Track in-flight claim attempts to prevent duplicate clicks
  const claimingRef         = useRef(new Set());

  // ── Debounced reload (120ms) ──────────────────────────────────────────────
  const scheduleReloadDb = useCallback(() => {
    if (reloadDebounceRef.current) clearTimeout(reloadDebounceRef.current);
    reloadDebounceRef.current = setTimeout(() => {
      reloadDebounceRef.current = null;
      reloadDbRef.current?.();
    }, 120);
  }, []);

  useEffect(() => {
    return () => {
      if (reloadDebounceRef.current) clearTimeout(reloadDebounceRef.current);
    };
  }, []);

  // ── Broadcast helper (uses stable ref channel) ────────────────────────────
  const broadcastLockChange = useCallback(async (payload) => {
    const ch = broadcastChannelRef.current;
    if (!ch) return;
    try {
      await ch.send({ type: "broadcast", event: "lock_changed", payload });
    } catch (e) {
      console.error("broadcastLockChange:", e?.message ?? e);
    }
  }, []);

  // ── Patch wfLogs locally (shared by broadcast handler + claimStepLock) ───
  const patchWfLog = useCallback((trackingId, sequenceId, patch) => {
    setWfLogs(prev => {
      const tid = String(trackingId);
      return {
        ...prev,
        [tid]: {
          ...(prev[tid] ?? {}),
          [sequenceId]: {
            ...(prev[tid]?.[sequenceId] ?? {}),
            ...patch,
          },
        },
      };
    });
  }, []);

  // ── Broadcast channel (stable, created once per mount) ───────────────────
  useEffect(() => {
    const ch = supabase
      .channel("tracking-lock-broadcast-v2")
      .on(
        "broadcast",
        { event: "lock_changed" },
        ({ payload }) => {
          if (payload?.trackingId != null && payload?.sequenceId != null) {
            // Immediately patch local state so all users see the change at once
            patchWfLog(payload.trackingId, payload.sequenceId, {
              sequence_id: payload.sequenceId,
              ...(payload.status      !== undefined && { status:      payload.status }),
              ...(payload.assigned_to !== undefined && { assigned_to: payload.assigned_to }),
            });
          }
          // Then schedule a full DB sync to reconcile any other fields
          scheduleReloadDb();
        },
      )
      .subscribe();

    broadcastChannelRef.current = ch;

    return () => {
      broadcastChannelRef.current = null;
      supabase.removeChannel(ch);
    };
  }, [patchWfLog, scheduleReloadDb]);

  // ── Workflow steps ────────────────────────────────────────────────────────
  const reloadSteps = useCallback(async () => {
    const { data, error: stepsErr } = await supabase
      .from("tracking_sequence")
      .select("id, description, sort_order")
      .order("sort_order", { ascending: true });

    if (stepsErr) { console.error("reloadSteps:", stepsErr.message); return; }
    setSteps((data ?? []).map(r => ({
      id:        r.id,
      label:     r.description,
      sortOrder: r.sort_order,
    })));
  }, []);

  useEffect(() => { reloadSteps(); }, [reloadSteps]);

  useEffect(() => {
    const ch = supabase
      .channel("tracking-sequence-live")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "tracking_sequence" },
        () => reloadSteps())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [reloadSteps]);

  // ── Users + assignments ───────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUserId) return;
    let alive = true;
    (async () => {
      const { data: users, error: usersErr } = await supabase
        .from("users")
        .select("user_id, username, full_name")
        .eq("active", true);

      if (!alive) return;
      if (usersErr) console.error("load users:", usersErr.message);
      setAllUsers(users ?? []);

      const { data: allAssignments, error: assignErr } = await supabase
        .from("user_seq_assignment")
        .select("user_id, seq_id");

      if (!alive) return;
      if (assignErr) console.error("load user_seq_assignment:", assignErr.message);

      const seqToUsers = {};
      for (const assignment of allAssignments ?? []) {
        const seqId = assignment.seq_id;
        if (seqId == null) continue;
        const user = (users ?? []).find(u => u.user_id === assignment.user_id);
        if (!user) continue;
        const k = String(seqId);
        if (!seqToUsers[k]) seqToUsers[k] = [];
        if (!seqToUsers[k].some(u => u.user_id === user.user_id)) {
          seqToUsers[k].push(user);
        }
      }
      setSequenceIdToUsers(seqToUsers);

      const { data: myTA, error: taErr } = await supabase
        .from("tracking_user_assignment")
        .select("tag_order")
        .eq("user_id", currentUserId);

      if (!alive) return;
      if (taErr) console.error("load tracking_user_assignment:", taErr.message);

      const isSuper = (myTA ?? []).some(a => a.tag_order === 1);
      setIsSuperUser(isSuper);

      if (!isSuper) {
        const { data: mySeqs, error: mySeqErr } = await supabase
          .from("user_seq_assignment")
          .select("seq_id")
          .eq("user_id", currentUserId);

        if (!alive) return;
        if (mySeqErr) console.error("load my user_seq_assignment:", mySeqErr.message);
        setMyAssignedSeqIds(new Set((mySeqs ?? []).map(r => r.seq_id).filter(Boolean)));
      } else {
        setMyAssignedSeqIds(new Set());
      }
    })();
    return () => { alive = false; };
  }, [currentUserId]);

  // ── Fetch API ─────────────────────────────────────────────────────────────
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

  // ── Reload DB ─────────────────────────────────────────────────────────────
  const reloadDb = useCallback(async () => {
    if (!apiRows.length) { setDbRows([]); setWfLogs({}); return; }

    const pageEncocodes = apiRows
      .map(r => r.enccode ?? r.tracking_encocode ?? "")
      .filter(Boolean)
      .slice(0, 500);

    const allTrackingRows = [];
    for (let i = 0; i < pageEncocodes.length; i += 20) {
      const chunk = pageEncocodes.slice(i, i + 20);
      const { data } = await supabase
        .from("tracking")
        .select("id, tracking_encocode, encounter_type, date_created")
        .in("tracking_encocode", chunk);
      if (data) allTrackingRows.push(...data);
    }

    if (!allTrackingRows.length) { setDbRows([]); setWfLogs({}); return; }

    const ids = allTrackingRows.map(r => r.id);
    const allLogs = [];
    for (let i = 0; i < ids.length; i += 50) {
      const chunk = ids.slice(i, i + 50);
      const { data } = await supabase
        .from("workflow_step_log")
        .select("id, tracking_id, sequence_id, status, remarks, completed_by, completed_at, assigned_to")
        .in("tracking_id", chunk);
      if (data) allLogs.push(...data);
    }

    const lm = {};
    for (const l of allLogs) {
      if (!lm[l.tracking_id]) lm[l.tracking_id] = {};
      lm[l.tracking_id][l.sequence_id] = l;
    }
    setWfLogs(lm);
    setDbRows(allTrackingRows);
  }, [apiRows]);

  reloadDbRef.current = reloadDb;
  useEffect(() => { reloadDbRef.current = reloadDb; }, [reloadDb]);
  useEffect(() => { reloadDb(); }, [reloadDb]);

  // ── Realtime: workflow_step_log changes ───────────────────────────────────
  useEffect(() => {
    const ch = supabase
      .channel("tracking-workflow-live")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "workflow_step_log" },
        (payload) => {
          // Immediately patch local state from the Postgres change payload
          const row = payload.new ?? payload.old;
          if (row?.tracking_id != null && row?.sequence_id != null) {
            if (payload.eventType === "DELETE") {
              setWfLogs(prev => {
                const tid = String(row.tracking_id);
                const next = { ...(prev[tid] ?? {}) };
                delete next[row.sequence_id];
                return { ...prev, [tid]: next };
              });
            } else {
              patchWfLog(row.tracking_id, row.sequence_id, row);
            }
          }
          // Full reload to stay consistent
          scheduleReloadDb();
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [patchWfLog, scheduleReloadDb]);

  // ── Sync API rows to DB ───────────────────────────────────────────────────
  useEffect(() => {
    if (!apiRows.length) return;
    let cancelled = false;
    (async () => {
      setSyncing(true);
      const toSync = apiRows.slice(0, 100);
      for (const r of toSync) {
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
  }, [apiRows, reloadDb]);

  // ── Normalize workflow progression ────────────────────────────────────────
  const stepsKey = useMemo(
    () => steps.map(s => `${s.id}:${s.sortOrder ?? ""}`).join("|"),
    [steps],
  );
  const normalizingRef = useRef(false);

  const normalizeLoadedWorkflows = useCallback(async () => {
    if (!steps.length || !dbRows.length) return false;
    const resetIds     = new Set();
    const expectedUpserts = [];

    for (const tr of dbRows) {
      const trackingId = tr?.id;
      if (!trackingId) continue;
      const logs = wfLogs?.[trackingId];
      if (!logs || Object.keys(logs).length === 0) continue;

      const expectedStep = steps.find(s => logs?.[s.id]?.status !== "done");
      if (!expectedStep) {
        for (const l of Object.values(logs)) {
          if (l?.status === "active" && l?.id) resetIds.add(l.id);
        }
        continue;
      }

      const expectedId = expectedStep.id;
      for (const l of Object.values(logs)) {
        if (!l?.id) continue;
        if (l.status === "active" && String(l.sequence_id) !== String(expectedId)) {
          resetIds.add(l.id);
        }
      }

      const expectedLog  = logs?.[expectedId];
      const needsActive  = !expectedLog || expectedLog.status !== "active";
      if (needsActive) {
        expectedUpserts.push({
          tracking_id:  trackingId,
          sequence_id:  expectedId,
          status:       "active",
          assigned_to:  null,
          remarks:      expectedLog?.remarks ?? null,
          completed_by: null,
          completed_at: null,
        });
      }
    }

    let changed = false;
    if (resetIds.size > 0) {
      const { error } = await supabase
        .from("workflow_step_log")
        .update({ status: "pending", assigned_to: null })
        .in("id", [...resetIds]);
      if (!error) changed = true;
      else console.error("normalize reset actives:", error.message);
    }
    if (expectedUpserts.length > 0) {
      const { error } = await supabase
        .from("workflow_step_log")
        .upsert(expectedUpserts, { onConflict: "tracking_id,sequence_id", ignoreDuplicates: false });
      if (!error) changed = true;
      else console.error("normalize expected active:", error.message);
    }
    return changed;
  }, [steps, dbRows, wfLogs]);

  useEffect(() => {
    if (normalizingRef.current) return;
    if (!steps.length || !dbRows.length) return;
    normalizingRef.current = true;
    (async () => {
      const changed = await normalizeLoadedWorkflows();
      if (changed) await reloadDb();
    })()
      .catch(e => console.error("normalize error:", e?.message ?? e))
      .finally(() => { normalizingRef.current = false; });
  }, [stepsKey, steps.length, dbRows.length, normalizeLoadedWorkflows, reloadDb]);

  // ── Merge rows ────────────────────────────────────────────────────────────
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

  // ── Filter + sort ─────────────────────────────────────────────────────────
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

  // ── Helpers ───────────────────────────────────────────────────────────────
  const displayUserName = useCallback((userId) => {
    if (!userId) return "";
    const u = allUsers.find(x => String(x.user_id) === String(userId));
    return u?.full_name ?? u?.username ?? String(userId);
  }, [allUsers]);

  const normalizeLockOwnerId = useCallback((value) => {
    if (value == null) return null;
    const s = String(value).trim();
    return s ? s : null;
  }, []);

  // ── Ensure tracking row ───────────────────────────────────────────────────
  async function ensureTrackingRow(row) {
    if (row.id) return row.id;
    const { data: existing } = await supabase
      .from("tracking").select("id").eq("tracking_encocode", row.encoCode).maybeSingle();
    if (existing?.id) return existing.id;
    const { data: inserted } = await supabase
      .from("tracking").insert({
        tracking_encocode: row.encoCode,
        encounter_type:    row.encounterType ?? "",
        is_current:        true,
        created_by:        String(row.hospitalNo ?? ""),
      }).select("id").single();
    return inserted?.id ?? null;
  }

  async function fetchStepLog(trackingId, sequenceId) {
    if (!trackingId || !sequenceId) return null;
    const { data, error: logErr } = await supabase
      .from("workflow_step_log")
      .select("id, tracking_id, sequence_id, status, remarks, completed_by, completed_at, assigned_to")
      .eq("tracking_id", trackingId)
      .eq("sequence_id", sequenceId)
      .maybeSingle();
    if (logErr) console.error("fetchStepLog:", logErr.message);
    return data ?? null;
  }

  // ── ATOMIC claimStepLock ──────────────────────────────────────────────────
  // Uses a SINGLE UPDATE with combined null/empty filter to avoid the race
  // where two users both see "unassigned" and both updates succeed.
  // The atomic trick: update WHERE (assigned_to IS NULL OR assigned_to = '')
  // in a single query. Postgres row-level locking ensures only one writer wins.
  async function claimStepLock(trackingId, sequenceId) {
    if (!currentUserId) return { ok: false, reason: "no-user" };

    const lockKey = `${trackingId}:${sequenceId}`;
    if (claimingRef.current.has(lockKey)) {
      return { ok: false, reason: "claiming" };
    }
    claimingRef.current.add(lockKey);

    try {
      // ── Step 1: Single atomic UPDATE for both null and empty assigned_to ──
      // We use .or() to combine both conditions in one query
      const { data: updated, error: updErr } = await supabase
        .from("workflow_step_log")
        .update({ status: "active", assigned_to: String(currentUserId) })
        .eq("tracking_id", trackingId)
        .eq("sequence_id", sequenceId)
        .in("status", ["active", "pending"])
        .or("assigned_to.is.null,assigned_to.eq.")
        .select("id, tracking_id, sequence_id, status, remarks, completed_by, completed_at, assigned_to")
        .maybeSingle();

      if (updErr && updErr.code !== "PGRST116") {
        console.error("claimStepLock update:", updErr.message);
      }

      if (updated) {
        // We won the lock — patch local state immediately
        patchWfLog(trackingId, sequenceId, { ...updated, assigned_to: String(currentUserId) });
        await broadcastLockChange({
          trackingId: String(trackingId),
          sequenceId,
          assigned_to: String(currentUserId),
          status: "active",
        });
        return { ok: true, log: updated };
      }

      // ── Step 2: No existing row — try INSERT ──────────────────────────────
      const { data: inserted, error: insErr } = await supabase
        .from("workflow_step_log")
        .insert({
          tracking_id:  trackingId,
          sequence_id:  sequenceId,
          status:       "active",
          assigned_to:  String(currentUserId),
          remarks:      null,
          completed_by: null,
          completed_at: null,
        })
        .select("id, tracking_id, sequence_id, status, remarks, completed_by, completed_at, assigned_to")
        .maybeSingle();

      if (inserted) {
        patchWfLog(trackingId, sequenceId, { ...inserted, assigned_to: String(currentUserId) });
        await broadcastLockChange({
          trackingId: String(trackingId),
          sequenceId,
          assigned_to: String(currentUserId),
          status: "active",
        });
        return { ok: true, log: inserted };
      }

      if (insErr && insErr.code !== "23505") {
        console.error("claimStepLock insert:", insErr.message);
      }

      // ── Step 3: Conflict — read current state ─────────────────────────────
      const current = await fetchStepLog(trackingId, sequenceId);
      const ownerId = normalizeLockOwnerId(current?.assigned_to);

      if (current?.status === "done")   return { ok: false, reason: "done",       log: current };
      if (!ownerId)                      return { ok: false, reason: "unavailable", log: current };
      if (String(ownerId) === String(currentUserId)) return { ok: true, log: current };

      return { ok: false, reason: "locked", lockedBy: ownerId, log: current };
    } finally {
      claimingRef.current.delete(lockKey);
    }
  }

  async function releaseStepLock(trackingId, sequenceId) {
    if (!currentUserId || !trackingId || !sequenceId) return;
    const { error: relErr } = await supabase
      .from("workflow_step_log")
      .update({ assigned_to: null })
      .eq("tracking_id", trackingId)
      .eq("sequence_id", sequenceId)
      .eq("status", "active")
      .eq("assigned_to", String(currentUserId));

    if (relErr) console.error("releaseStepLock:", relErr.message);

    // Optimistically clear the lock in local state
    patchWfLog(trackingId, sequenceId, { assigned_to: null });
    await broadcastLockChange({ trackingId: String(trackingId), sequenceId, assigned_to: null, status: "active" });
  }

  // ── Cell state ────────────────────────────────────────────────────────────
  function getCellState(row, sequenceId) {
    const wfLog = row._stepLogs?.[sequenceId];

    const lockOwnerId   = wfLog?.status === "active" ? normalizeLockOwnerId(wfLog?.assigned_to) : null;
    const lockedByOther = Boolean(lockOwnerId) && String(lockOwnerId) !== String(currentUserId);
    const lockOwnerName = lockOwnerId ? displayUserName(lockOwnerId) : "";

    // Done
    if (wfLog?.status === "done") {
      const completedById  = wfLog.completed_by;
      const completedByUser = allUsers.find(
        u => String(u.user_id) === String(completedById) ||
             String(u.username).toLowerCase() === String(completedById).toLowerCase() ||
             String(u.full_name).toLowerCase() === String(completedById).toLowerCase()
      );
      const displayName = completedByUser?.full_name ?? completedByUser?.username ?? completedById ?? "";
      return {
        status:   "done",
        value:    wfLog.remarks || "Done",
        userName: displayName,
        meta:     `${fmtDate(wfLog.completed_at)} · ${fmtTime(wfLog.completed_at)}`,
        canClick: false,
        log:      wfLog,
      };
    }

    const stepIndex = steps.findIndex(s => String(s.id) === String(sequenceId));
    if (stepIndex === -1) {
      return { status: "pending", value: "", meta: "", canClick: false, log: wfLog ?? null };
    }

    // Strict gating: all previous steps must be done
    const allPreviousDone = stepIndex === 0 || steps
      .slice(0, stepIndex)
      .every(s => row._stepLogs?.[s.id]?.status === "done");

    if (!allPreviousDone) {
      return { status: "pending", value: "", meta: "", canClick: false, log: wfLog ?? null };
    }

    // Super user logic
    if (isSuperUser) {
      if (wfLog?.status === "active") {
        if (lockedByOther) {
          return { status: "active", value: "", meta: "", canClick: false, locked: true,  lockOwnerId, lockOwnerName, log: wfLog };
        }
        return { status: "active", value: "", meta: "", canClick: true, locked: false, lockOwnerId, lockOwnerName, log: wfLog };
      }
      return { status: "active", value: "", meta: "", canClick: true, locked: false, lockOwnerId: null, lockOwnerName: "", log: null };
    }

    // Regular user: not assigned to this step
    if (!myAssignedSeqIds.has(sequenceId)) {
      if (wfLog?.status === "active") {
        return { status: "active", value: "", meta: "On-going", canClick: false, locked: lockedByOther, lockOwnerId, lockOwnerName, log: wfLog };
      }
      return { status: "pending", value: "", meta: "", canClick: false, locked: false, lockOwnerId: null, lockOwnerName: "", log: null };
    }

    // Regular user: assigned to this step
    if (wfLog?.status === "active") {
      if (lockedByOther) {
        // Another user is processing — show On-going, NOT clickable
        return { status: "active", value: "", meta: "", canClick: false, locked: true, lockOwnerId, lockOwnerName, log: wfLog };
      }
      // Either we hold the lock, or it's unlocked — clickable
      return { status: "active", value: "", meta: "", canClick: true, locked: false, lockOwnerId, lockOwnerName, log: wfLog };
    }

    // No log yet for first step
    if (stepIndex === 0) {
      return { status: "active", value: "", meta: "", canClick: true, locked: false, lockOwnerId: null, lockOwnerName: "", log: null };
    }

    return { status: "pending", value: "", meta: "", canClick: false, locked: false, lockOwnerId: null, lockOwnerName: "", log: null };
  }

  // ── Handle cell click ─────────────────────────────────────────────────────
  async function handleCellClick(row, sequenceId, sequenceLabel, cell) {
    if (!cell.canClick) return;
    if (!currentUserId) {
      setToast({ message: "No user selected.", type: "error" });
      return;
    }

    const trackingId = await ensureTrackingRow(row);
    if (!trackingId) {
      setToast({ message: "Could not resolve tracking ID for this record.", type: "error" });
      return;
    }

    // Re-check lock against latest DB state BEFORE attempting claim
    const latest      = await fetchStepLog(trackingId, sequenceId);
    const latestOwner = normalizeLockOwnerId(latest?.assigned_to);

    if (latest?.status === "done") {
      setToast({ message: "This step is already completed.", type: "error" });
      return;
    }

    // if (latest?.status === "active" && latestOwner && String(latestOwner) !== String(currentUserId)) {
    //   const who = displayUserName(latestOwner);
    //   setToast({ message: `Already On-going by ${who}.`, type: "error" });
    //   // Sync local state with DB truth
    //   patchWfLog(trackingId, sequenceId, latest);
    //   return;
    // }

    // Attempt atomic lock claim
    const claim = await claimStepLock(trackingId, sequenceId);

    // if (!claim.ok) {
    //   if (claim.reason === "claiming") return; // duplicate click guard
    //   const who = claim.lockedBy ? displayUserName(claim.lockedBy) : "another user";
    //   setToast({ message: `Already On-going by ${who}.`, type: "error" });
    //   // Sync to DB truth so cell shows correct state
    //   if (claim.log) patchWfLog(trackingId, sequenceId, claim.log);
    //   return;
    // }

    setModal({
      row:             { ...row, id: trackingId },
      trackingId,
      sequenceId,
      sequenceLabel,
      existingLog:     claim.log ?? latest ?? cell.log,
      currentUserId,
      currentUserName,
    });
  }

  // ── Evict modal if another user claims our lock ───────────────────────────
  useEffect(() => {
    if (!modal) return;
    const trackingId = modal.trackingId ?? modal.row?.id;
    const sequenceId = modal.sequenceId;
    if (!trackingId || !sequenceId) return;

    const l        = wfLogs?.[String(trackingId)]?.[sequenceId] ?? null;
    const ownerId  = normalizeLockOwnerId(l?.assigned_to);

    if (l?.status === "active" && ownerId && String(ownerId) !== String(currentUserId)) {
      setModal(null);
      setToast({ message: `Taken over by ${displayUserName(ownerId)}.`, type: "error" });
    }
  }, [modal, wfLogs, currentUserId, normalizeLockOwnerId, displayUserName]);

  // ── Save ──────────────────────────────────────────────────────────────────
  async function handleSave({ row, sequenceId, remarks, markDone }) {
    const now        = new Date().toISOString();
    const trackingId = await ensureTrackingRow(row);
    if (!trackingId) { console.error("Could not resolve tracking ID for", row.encoCode); return null; }

    const liveLogs     = wfLogs?.[trackingId] ?? row._stepLogs ?? {};
    const expectedStep = steps.find(s => liveLogs?.[s.id]?.status !== "done");
    if (expectedStep && String(expectedStep.id) !== String(sequenceId)) {
      const expectedLabel = getStepLabel(steps, expectedStep.id);
      const currentLabel  = getStepLabel(steps, sequenceId);
      return {
        type:    "error",
        message: `Workflow changed. You can't complete "${currentLabel}" yet — next step is "${expectedLabel}".`,
      };
    }

    // Re-verify lock ownership from DB
    let existing = liveLogs?.[sequenceId] ?? null;
    if (!existing) existing = await fetchStepLog(trackingId, sequenceId);

    // if (existing?.status === "active" && existing?.assigned_to && String(existing.assigned_to) !== String(currentUserId)) {
    //   const who = displayUserName(existing.assigned_to);
    //   return { type: "error", message: `This record is already On-going by ${who}.` };
    // }

    if (markDone) {
      const donePayload = {
        tracking_id:  trackingId,
        sequence_id:  sequenceId,
        status:       "done",
        remarks:      remarks || null,
        completed_by: currentUserName ?? currentUserId,
        completed_at: now,
        assigned_to:  currentUserId,
      };

      await supabase
        .from("workflow_step_log")
        .upsert(donePayload, { onConflict: "tracking_id,sequence_id", ignoreDuplicates: false });

      // Immediately patch local state
      patchWfLog(trackingId, sequenceId, donePayload);
      await broadcastLockChange({ trackingId: String(trackingId), sequenceId, status: "done", assigned_to: String(currentUserId) });

      // Activate next step
      const nextSequenceId = getNextSequenceId(steps, sequenceId);
      if (nextSequenceId) {
        const nextPayload = {
          tracking_id:  trackingId,
          sequence_id:  nextSequenceId,
          status:       "active",
          assigned_to:  null,
          remarks:      null,
          completed_by: null,
          completed_at: null,
        };

        const { error: upsertErr } = await supabase
          .from("workflow_step_log")
          .upsert(nextPayload, { onConflict: "tracking_id,sequence_id", ignoreDuplicates: false });

        if (upsertErr) {
          const { data: nextEx } = await supabase
            .from("workflow_step_log").select("id")
            .eq("tracking_id", trackingId).eq("sequence_id", nextSequenceId).maybeSingle();
          if (nextEx?.id) {
            await supabase.from("workflow_step_log")
              .update({ status: "active", assigned_to: null })
              .eq("id", nextEx.id);
          } else {
            await supabase.from("workflow_step_log").insert(nextPayload);
          }
        }

        patchWfLog(trackingId, nextSequenceId, nextPayload);
        await broadcastLockChange({ trackingId: String(trackingId), sequenceId: nextSequenceId, status: "active", assigned_to: null });

        const nextLabel    = getStepLabel(steps, nextSequenceId);
        const currentLabel = getStepLabel(steps, sequenceId);
        await reloadDb();
        return { type: "success", message: `"${currentLabel}" marked done. Passed to ${nextLabel} office.` };
      } else {
        const currentLabel = getStepLabel(steps, sequenceId);
        await reloadDb();
        return { type: "success", message: `"${currentLabel}" completed — workflow finished for this record.` };
      }
    } else {
      // Save remarks only — release lock
      const activePayload = {
        tracking_id: trackingId,
        sequence_id: sequenceId,
        status:      "active",
        remarks:     remarks || null,
        assigned_to: null,
      };
      await supabase
        .from("workflow_step_log")
        .upsert(activePayload, { onConflict: "tracking_id,sequence_id", ignoreDuplicates: false });

      patchWfLog(trackingId, sequenceId, activePayload);
      await broadcastLockChange({ trackingId: String(trackingId), sequenceId, status: "active", assigned_to: null });
      await reloadDb();
      return null;
    }
  }

  // ── Modal close ───────────────────────────────────────────────────────────
  function handleModalClose(result) {
    const closing = modal;
    setModal(null);

    // Release lock on cancel/close (not on successful completion)
    if (closing && result?.type !== "success") {
      releaseStepLock(closing.trackingId ?? closing.row?.id, closing.sequenceId)
        .catch(e => console.error("releaseStepLock error:", e?.message ?? e));
    }

    if (result?.message) {
      setToast({ message: result.message, type: result.type ?? "success" });
    }
  }

  const isLoading = loadingApi || syncing;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="tracking-page">
      <main className="tracking-shell">

        {toast && (
          <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
        )}

        <header className="tracking-title-box">
          <h1>Agusan del Norte Provincial Health Office</h1>
          <p>CHART Tracking System</p>
          {currentUserName && (
            <small>
              Viewing as: <strong>{currentUserName}</strong>
              {isSuperUser
                ? <span className="badge-super">SUPER USER</span>
                : myAssignedSeqIds.size > 0
                ? <span className="badge-assigned">
                    {[...myAssignedSeqIds].map(id => getStepLabel(steps, id)).join(", ")}
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

        <section className="tracking-actions">
          <button type="button" onClick={onBackToModuleNavigator}>← Back to Navigator</button>
          <button type="button" onClick={() => { fetchApi(); reloadDb(); }} disabled={isLoading}>
            <RefreshCw size={13}/> {isLoading ? "Syncing…" : "Refresh"}
          </button>
        </section>

        {error && <p className="tracking-error">{error}</p>}

        <div className="tracking-legend">
          <span className="leg"><span className="leg-dot leg-done"/>Done</span>
          <span className="leg"><span className="leg-dot leg-active"/>Active – click to process</span>
          <span className="leg"><span className="leg-dot leg-empty"/> Pending</span>
          <span className="leg leg-hint">
            {isSuperUser
              ? "Super User — click any step cell to process"
              : myAssignedSeqIds.size > 0
              ? `You can process: ${[...myAssignedSeqIds].map(id => getStepLabel(steps, id)).join(", ")}`
              : "👁 View only — no step assigned"}
          </span>
        </div>

        <div className="tracking-status-bar">
          {isLoading
            ? "⏳ Syncing records from API…"
            : `${filteredRows.length} record${filteredRows.length !== 1 ? "s" : ""}  ·  Page ${currentPage} of ${totalPages || 1}`}
        </div>

        <div className="tracking-table-container">
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
                  {steps.map(s => <th key={s.id} className="th-step">{s.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {isLoading && !filteredRows.length
                  ? <tr><td colSpan={7+steps.length} className="tracking-td-center">⏳ Loading…</td></tr>
                  : !filteredRows.length
                  ? <tr><td colSpan={7+steps.length} className="tracking-td-center">No records found.</td></tr>
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

                      {steps.map(step => {
                        const cell      = getCellState(row, step.id);
                        const clickable = cell.canClick;
                        return (
                          <td
                            key={step.id}
                            className={[
                              "wf-cell",
                              cell.status === "done"   && "wf-done",
                              cell.status === "active" && "wf-active",
                              clickable                && "wf-clickable",
                            ].filter(Boolean).join(" ")}
                            onClick={() => clickable && handleCellClick(row, step.id, step.label, cell)}
                            title={
                              clickable
                                ? `Click to process ${step.label}`
                                : cell.locked && cell.lockOwnerName
                                ? `On-going by ${cell.lockOwnerName}`
                                : cell.value || ""
                            }
                          >
                            <div className="wf-inner">
                              {cell.status === "done" && (
                                <>
                                  <CheckCircle2 size={12} className="wf-icon-done"/>
                                  <div className="wf-user-info">
                                    {cell.userName && <span className="wf-user-name">{cell.userName}</span>}
                                    {cell.meta     && <span className="wf-meta-date">{cell.meta}</span>}
                                    {cell.value    && <span className="wf-remarks">{cell.value.length > 16 ? cell.value.slice(0,16)+"…" : cell.value}</span>}
                                  </div>
                                </>
                              )}
                              {cell.status === "active" && (
                                <>
                                  {clickable && <span className="wf-pulse-ring"/>}
                                  <Clock size={12} className="wf-icon-active"/>
                                  {clickable
                                    ? <span className="wf-val wf-val-action"><ChevronRight size={10}/> Process</span>
                                    : cell.locked
                                    ? <span className="wf-val wf-val-wait" title={cell.lockOwnerName ? `On-going by ${cell.lockOwnerName}` : "On-going"}>On-going</span>
                                    : <span className="wf-val wf-val-wait">Waiting</span>
                                  }
                                </>
                              )}
                              {(cell.status === "empty" || cell.status === "pending") && (
                                clickable
                                  ? <span className="wf-val wf-val-open">+ Add</span>
                                  : <span className="wf-val wf-val-dash">Not Yet</span>
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

          {totalPages > 1 && (
            <div className="tracking-pagination">
              <button className="tracking-pagination-btn" onClick={() => setCurrentPage(p=>Math.max(p-1,1))} disabled={currentPage===1}>← Prev</button>
              <span className="tracking-pagination-info">Page {currentPage} of {totalPages}</span>
              <button className="tracking-pagination-btn" onClick={() => setCurrentPage(p=>Math.min(p+1,totalPages))} disabled={currentPage===totalPages}>Next →</button>
            </div>
          )}
        </div>
      </main>

      {modal && (
        <ProcessModal
          ctx={modal}
          steps={steps}
          sequenceIdToUsers={sequenceIdToUsers}
          onClose={handleModalClose}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["success", "error"]),
  onDone: PropTypes.func.isRequired,
};

ProcessModal.propTypes = {
  ctx: PropTypes.shape({
    row: PropTypes.object.isRequired,
    sequenceId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    sequenceLabel: PropTypes.string.isRequired,
    existingLog: PropTypes.object,
    currentUserId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    currentUserName: PropTypes.string,
  }).isRequired,
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      label: PropTypes.string,
    }),
  ).isRequired,
  sequenceIdToUsers: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

Tracking.propTypes = {
  onBackToModuleNavigator: PropTypes.func.isRequired,
  currentUserId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  currentUserName: PropTypes.string,
  onSwitchUser: PropTypes.func.isRequired,
};