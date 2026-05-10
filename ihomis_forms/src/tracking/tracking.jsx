import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import "./tracking.css";
import { supabase } from "../tracking/hooks/supabaseClient.js";
import { useTagAccess } from "./hooks/useTagAccess.js";
import {
  Search,
  X,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import "./tracking.css";

// ── Safe date helpers ─────────────────────────────────────────────────────────
function safeIso(raw) {
  if (!raw) return null;
  const cleaned = String(raw)
    .replace(/^[^(]*\(([^)]+)\).*$/, "$1")
    .trim();
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) return d.toISOString();
  const d2 = new Date(raw);
  return isNaN(d2.getTime()) ? null : d2.toISOString();
}

const API_FIELD_MAP = {
  phic: ["phic"],
  records_received: ["records received", "records_received"],
  verify_status: ["verify"],
  scan_status: ["scan"],
  send_status: ["send"],
  records_filed: ["records filed", "records_filed"],
  claim_map: ["claim map", "claim_map", "philhealth"],
  acpn: ["acpm", "acpn"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function parseApiStatus(raw = "") {
  if (!raw) return { done: false };
  const lower = String(raw).toLowerCase();
  if (lower.includes("not yet") || lower.includes("no phic"))
    return { done: false };
  return { done: true, isoDate: safeIso(raw), label: String(raw) };
}

function matchApiField(stepDescription = "") {
  const desc = String(stepDescription).toLowerCase();
  for (const [field, keywords] of Object.entries(API_FIELD_MAP)) {
    if (keywords.some((keyword) => desc.includes(keyword))) return field;
  }
  return null;
}

let STEPS = [];

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
  const idx = STEPS.findIndex((s) => s.key === stepKey);
  if (idx === -1 || idx >= STEPS.length - 1) return null;
  return STEPS[idx + 1].key;
}

// ─────────────────────────────────────────────────────────────────────────────
// ProcessModal — click a cell → opens this
// ─────────────────────────────────────────────────────────────────────────────
function ProcessModal({ ctx, stepKeyToUsers, onClose, onSave }) {
  const {
    row,
    stepKey,
    stepLabel,
    existingLog,
    currentUserId,
    currentUserName,
  } = ctx;

  const [remarks, setRemarks] = useState(existingLog?.remarks ?? "");
  const [nextUser, setNextUser] = useState("");
  const [saving, setSaving] = useState(false);

  // Workflow history — steps marked done
  const history = Object.entries(row._stepLogs ?? {})
    .filter(([, l]) => l.status === "done")
    .sort(
      ([, a], [, b]) => new Date(a.completed_at) - new Date(b.completed_at),
    );

  // Only show users assigned to the NEXT step
  const nextStepKey = getNextStepKey(stepKey);
  const nextStepLabel =
    STEPS.find((s) => s.key === nextStepKey)?.label ?? "next step";
  const eligibleUsers = nextStepKey
    ? (stepKeyToUsers[nextStepKey] ?? []).filter(
        (u) => u.user_id !== currentUserId,
      )
    : [];

  async function handleDoneAndPass() {
    if (nextStepKey && !nextUser) return;
    setSaving(true);
    await onSave({
      row,
      stepKey,
      remarks,
      markDone: true,
      nextUserId: nextUser || null,
    });
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
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-info">
            <span className="modal-step-pill">{stepLabel}</span>
            <h3 className="modal-patient">{row.patientName}</h3>
            <p className="modal-patient-sub">
              {row.hospitalNo} · {row.admittedDate}
            </p>
          </div>
          <button className="modal-x-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Workflow history */}
        {history.length > 0 && (
          <div className="modal-history">
            <p className="modal-section-title">📋 Workflow History</p>
            <div className="modal-timeline">
              {history.map(([key, log]) => {
                const step = STEPS.find((s) => s.key === key);
                return (
                  <div key={key} className="timeline-row">
                    <CheckCircle2 size={13} className="tl-icon-done" />
                    <div className="tl-content">
                      <span className="tl-step">{step?.label ?? key}</span>
                      <span className="tl-who">
                        {log.completed_by} · {fmt(log.completed_at)}
                      </span>
                      {log.remarks && (
                        <p className="tl-remarks">&quot;{log.remarks}&quot;</p>
                      )}
                    </div>
                  </div>
                );
              })}
              {/* Current step */}
              <div className="timeline-row timeline-row--current">
                <Clock size={13} className="tl-icon-current" />
                <div className="tl-content">
                  <span className="tl-step">
                    {stepLabel} <em>(you are here)</em>
                  </span>
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
            onChange={(e) => setRemarks(e.target.value)}
            autoFocus
          />
        </div>

        {/* Pass to next user */}
        <div className="modal-pass-section">
          <p className="modal-section-title">
            <ArrowRight size={13} />
            {nextStepKey ? (
              <>
                {" "}
                Mark Done &amp; Pass to <strong>{nextStepLabel}</strong> user
              </>
            ) : (
              <> Mark Done (last step)</>
            )}
          </p>

          {nextStepKey ? (
            eligibleUsers.length > 0 ? (
              <>
                <select
                  className="modal-select"
                  value={nextUser}
                  onChange={(e) => setNextUser(e.target.value)}
                >
                  <option value="">
                    — Choose who handles {nextStepLabel} —
                  </option>
                  {eligibleUsers.map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.full_name ?? u.username}
                    </option>
                  ))}
                </select>
                <p className="modal-pass-hint">
                  Only users assigned to <strong>{nextStepLabel}</strong> are
                  listed.
                </p>
              </>
            ) : (
              <p className="modal-pass-hint modal-pass-hint--warn">
                ⚠️ No users are assigned to <strong>{nextStepLabel}</strong>{" "}
                yet. You can still save remarks below.
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
          <button
            className="mbtn mbtn--ghost"
            onClick={onClose}
            disabled={saving}
          >
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
            disabled={
              saving || (nextStepKey && eligibleUsers.length > 0 && !nextUser)
            }
            title={nextStepKey && !nextUser ? "Select a user first" : ""}
          >
            {saving ? (
              "Saving…"
            ) : (
              <>
                <CheckCircle2 size={13} /> Done &amp; Pass →
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

ProcessModal.propTypes = {
  ctx: PropTypes.shape({
    row: PropTypes.shape({
      patientName: PropTypes.string,
      hospitalNo: PropTypes.string,
      admittedDate: PropTypes.string,
      _stepLogs: PropTypes.object,
    }).isRequired,
    stepKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    stepLabel: PropTypes.string.isRequired,
    existingLog: PropTypes.shape({
      remarks: PropTypes.string,
      done_by: PropTypes.string,
      done_at: PropTypes.string,
    }),
    currentUserId: PropTypes.string,
    currentUserName: PropTypes.string,
  }).isRequired,
  stepKeyToUsers: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function Tracking({
  onBackToModuleNavigator,
  currentUserId, // ← from useUserSession
  currentUserName, // ← from useUserSession
  onSwitchUser, // ← clears session → shows UserPicker
  onOpenTagging, // ← for opening tagging modal
}) {
  const [encounterFilter, setEncounterFilter] = useState("ADM");
  const [nameInput, setNameInput] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [steps, setSteps] = useState([]);
  const [apiRows, setApiRows] = useState([]);
  const [dbRows, setDbRows] = useState([]);
  const [stepKeyToUsers, setStepKeyToUsers] = useState({});
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [myAssignedStepKeys, setMyAssignedStepKeys] = useState(new Set());

  const [loadingApi, setLoadingApi] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState(null);
  const ROWS_PER_PAGE = 10;

  STEPS = steps;

  // ── Access control ────────────────────────────────────────────────────────
  const {
    accessMap,
    canSeeStep,
    hasAccess,
    loading: accessLoading,
    refresh: refreshAccess,
  } = useTagAccess(currentUserId);

  // ── 1. Load steps ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUserId) return;
    (async () => {
      // tracking_sequence → seqId → stepKey map
      const { data: seqs } = await supabase
        .from("tracking_sequence")
        .select("id, description")
        .order("sort_order", { ascending: true });

      setSteps(seqs ?? []);

      const map = {};
      for (const s of seqs ?? []) {
        const desc = s.description.toLowerCase();
        for (const [key, kws] of Object.entries(API_FIELD_MAP)) {
          if (kws.some((kw) => desc.includes(kw))) {
            map[s.id] = key;
            break;
          }
        }
      }
      // All active users
      const { data: users } = await supabase
        .from("users")
        .select("user_id, username, full_name")
        .eq("active", true);

      // Build stepKey → users[] map from ALL user_seq_assignment rows
      const { data: allAssignments } = await supabase
        .from("user_seq_assignment")
        .select("user_id, seq_id");

      const skToUsers = {};
      for (const stepKey of Object.keys(API_FIELD_MAP)) {
        skToUsers[stepKey] = [];
      }
      for (const assignment of allAssignments ?? []) {
        const sk = map[assignment.seq_id];
        if (!sk) continue;
        const user = (users ?? []).find(
          (u) => u.user_id === assignment.user_id,
        );
        if (user && !skToUsers[sk].some((u) => u.user_id === user.user_id)) {
          skToUsers[sk].push(user);
        }
      }
      setStepKeyToUsers(skToUsers);

      // Is current user a super user? (tag_order === 1)
      const { data: myTA } = await supabase
        .from("tracking_user_assignment")
        .select("tag_order")
        .eq("user_id", currentUserId);
      const isSuper = (myTA ?? []).some((a) => a.tag_order === 1);
      setIsSuperUser(isSuper);

      // My assigned step keys (for non-super users)
      if (!isSuper) {
        const { data: mySeqs } = await supabase
          .from("user_seq_assignment")
          .select("seq_id")
          .eq("user_id", currentUserId);
        setMyAssignedStepKeys(
          new Set((mySeqs ?? []).map((r) => map[r.seq_id]).filter(Boolean)),
        );
      }
    })();
  }, [currentUserId]);

  // ── Fetch API ────────────────────────────────────────────────────────────
  const fetchApi = useCallback(async () => {
    const url = import.meta.env.VITE_CHART_TRACKING;
    if (!url) {
      setError("VITE_CHART_TRACKING is not configured.");
      return;
    }
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

  useEffect(() => {
    fetchApi();
  }, [fetchApi]);

  // ── Sync API → tracking table ────────────────────────────────────────────
  useEffect(() => {
    if (!apiRows.length) return;
    let cancelled = false;
    (async () => {
      setSyncing(true);
      for (const apiRow of apiRows) {
        if (cancelled) break;
        const encoCode = apiRow.enccode ?? apiRow.tracking_encocode;
        if (!encoCode) continue;
        const { data: upserted, error: uErr } = await supabase
          .from("tracking")
          .upsert(
            {
              tracking_encocode: encoCode,
              encounter_type: apiRow.encounter_type ?? "",
              is_current: true,
              created_by: String(apiRow.patient_id ?? ""),
            },
            { onConflict: "tracking_encocode" },
          )
          .select("id")
          .single();
        if (uErr || !upserted?.id) continue;
        const trackingId = upserted.id;
        for (const step of steps) {
          if (cancelled) break;
          const apiField = matchApiField(step.label);
          if (!apiField) continue;
          const rawVal = apiRow[apiField];
          if (!rawVal) continue;
          const parsed = parseApiStatus(String(rawVal));
          if (!parsed.done) continue;
          const { data: existing } = await supabase
            .from("tracking_log")
            .select("id")
            .eq("tracking_id", trackingId)
            .eq("seq_id", step.id)
            .maybeSingle();
          if (existing) continue;
          const doneAt = parsed.isoDate ?? new Date().toISOString();
          await supabase.from("tracking_log").insert({
            tracking_id: trackingId,
            seq_id: step.id,
            done_by: "API sync",
            done_at: doneAt,
            remarks: parsed.label,
          });
        }
      }
      if (!cancelled) {
        setSyncing(false);
        await reloadDbRows();
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiRows, steps]);

  // ── 4. Reload DB rows ──────────────────────────────────────────────────────
  const reloadDbRows = useCallback(async () => {
    const { data: trackingData, error: tErr } = await supabase
      .from("tracking")
      .select("id, tracking_encocode, encounter_type, date_created")
      .order("date_created", { ascending: false });
    if (tErr) return;
    if (!trackingData?.length) {
      setDbRows([]);
      return;
    }
    const ids = trackingData.map((r) => r.id);
    const { data: logData } = await supabase
      .from("tracking_log")
      .select("id, tracking_id, seq_id, done_by, done_at, remarks")
      .in("tracking_id", ids);

    const stepLogsByTrackingId = {};
    for (const log of logData ?? []) {
      if (!stepLogsByTrackingId[log.tracking_id]) {
        stepLogsByTrackingId[log.tracking_id] = {};
      }
      stepLogsByTrackingId[log.tracking_id][log.seq_id] = {
        ...log,
        status: "done",
        completed_by: log.done_by,
        completed_at: log.done_at,
      };
    }

    const rows = trackingData.map((trackingRow) => ({
      ...trackingRow,
      _stepLogs: stepLogsByTrackingId[trackingRow.id] ?? {},
    }));

    setDbRows(rows);
  }, []);

  useEffect(() => {
    if (steps.length) reloadDbRows();
  }, [reloadDbRows, steps]);

  // ── 5. Merge ───────────────────────────────────────────────────────────────
  const mergedRows = useMemo(() => {
    return apiRows.map((apiRow) => {
      const encoCode = apiRow.enccode ?? apiRow.tracking_encocode ?? "";
      const dbRow = dbRows.find((r) => r.tracking_encocode === encoCode);
      return {
        id: dbRow?.id ?? null,
        encoCode,
        encounterType: (apiRow.encounter_type ?? "").toUpperCase(),
        patientName: apiRow.patient_name ?? "—",
        hospitalNo: apiRow.hospital_no ?? apiRow.patient_id ?? "—",
        admittedDate: extractAdmittedDate(encoCode),
        dischargedDate: apiRow.discharged_date || "—",
        remainingDays: calculateRemainingDays(apiRow.discharged_date || "—"),
        _apiRow: apiRow,
      };
    });
  }, [apiRows, dbRows]);

  // ── Filter + sort ────────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    return mergedRows.filter((r) => {
      // ── Access gate: only show records this user is tagged on ──────────────
      // If accessMap has entries (user is tagged somewhere), enforce it.
      // If accessMap is empty (user not tagged anywhere), show nothing.
      if (currentUserId) {
        if (Object.keys(accessMap).length > 0 && r.id && !hasAccess(r.id))
          return false;
      }
      if (encounterFilter && r.encounterType !== encounterFilter) return false;
      if (
        nameFilter &&
        !r.patientName.toLowerCase().includes(nameFilter.toLowerCase())
      )
        return false;
      if (dateFilter && !r.admittedDate.includes(dateFilter)) return false;
      return true;
    });
  }, [
    mergedRows,
    encounterFilter,
    nameFilter,
    dateFilter,
    accessMap,
    currentUserId,
    hasAccess,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [encounterFilter, nameFilter, dateFilter]);

  // ── 7. Paginate ────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredRows.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const paginatedRows = filteredRows.slice(
    startIndex,
    startIndex + ROWS_PER_PAGE,
  );

  // ── Cell state ───────────────────────────────────────────────────────────
  function getCellState(row, stepKey) {
    const wfLog = row._stepLogs?.[stepKey];
    const apiRaw = getApiValueForStep(row._apiRow, stepKey);
    const apiOk = apiRaw ? parseApiStatus(apiRaw).done : false;

    // ── Already logged in DB ───────────────────────────────────────────────
    if (wfLog) {
      if (wfLog.status === "done") {
        return {
          status: "done",
          value: wfLog.remarks || "Done",
          meta: `${wfLog.completed_by ?? ""} · ${fmt(wfLog.completed_at)}`,
          canClick: false,
          log: wfLog,
        };
      }
      // 'active' or 'pending' in DB — editable if authorised
      const canEdit = isSuperUser || myAssignedStepKeys.has(stepKey);
      return {
        status: "active",
        value: "",
        meta: "",
        canClick: canEdit,
        log: wfLog,
      };
    }

    // ── Completed via API (no DB log yet) ──────────────────────────────────
    if (apiOk) {
      return {
        status: "done",
        value: apiRaw.slice(0, 24),
        meta: "API",
        canClick: false,
        log: null,
      };
    }

    // ── No DB log exists yet ───────────────────────────────────────────────
    // Super users can click any undone cell immediately
    if (isSuperUser) {
      return {
        status: "active",
        value: "",
        meta: "",
        canClick: true,
        log: null,
      };
    }

    // Regular users: must be assigned to this step
    if (!myAssignedStepKeys.has(stepKey)) {
      return {
        status: "pending",
        value: "",
        meta: "",
        canClick: false,
        log: null,
      };
    }

    // Regular users: all previous steps must be done first
    const stepIndex = STEPS.findIndex((s) => s.key === stepKey);
    const allPreviousDone = STEPS.slice(0, stepIndex).every((prevStep) => {
      const prevLog = row._stepLogs?.[prevStep.key];
      if (prevLog) return prevLog.status === "done";
      const prevApiRaw = getApiValueForStep(row._apiRow, prevStep.key);
      return prevApiRaw ? parseApiStatus(prevApiRaw).done : false;
    });

    if (allPreviousDone || stepIndex === 0) {
      return {
        status: "active",
        value: "",
        meta: "",
        canClick: true,
        log: null,
      };
    }
    return {
      status: "pending",
      value: "",
      meta: "",
      canClick: false,
      log: null,
    };
  }

  const taggableRows = filteredRows.filter((r) => r.id !== null);
  const isLoading = loadingApi || syncing || accessLoading;

  // ── Visible steps for current user ────────────────────────────────────────
  const visibleSteps = useMemo(() => {
    // No auth / admin mode → show all steps
    if (!currentUserId) return steps;

    // No assignments yet → show NO step columns (base columns only)
    if (!Object.keys(accessMap).length) return [];

    const ids = new Set();
    for (const [, access] of Object.entries(accessMap)) {
      if (access.seqIds === "all") return steps; // full access → all steps
      if (access.seqIds === "remaining") {
        steps.forEach((s) => {
          if (!(access.excludeSeqIds ?? []).includes(s.id)) ids.add(s.id);
        });
      } else {
        (access.seqIds ?? []).forEach((id) => ids.add(id));
      }
    }
    return steps.filter((s) => ids.has(s.id));
  }, [accessMap, currentUserId, steps]);

  const handleSave = useCallback(
    async ({ row, stepKey, remarks, markDone }) => {
      const trackingId = row?.id;
      if (!trackingId) return;

      const payload = {
        tracking_id: trackingId,
        seq_id: stepKey,
        done_by: currentUserName || String(currentUserId || ""),
        done_at: markDone ? new Date().toISOString() : null,
        remarks: remarks || "",
      };

      const { data: existing } = await supabase
        .from("tracking_log")
        .select("id")
        .eq("tracking_id", trackingId)
        .eq("seq_id", stepKey)
        .maybeSingle();

      if (existing?.id) {
        await supabase
          .from("tracking_log")
          .update(payload)
          .eq("id", existing.id);
      } else {
        await supabase.from("tracking_log").insert(payload);
      }

      await reloadDbRows();
    },
    [currentUserId, currentUserName, reloadDbRows],
  );

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
              {isSuperUser ? (
                <span className="badge-super">SUPER USER</span>
              ) : myAssignedStepKeys.size > 0 ? (
                <span className="badge-assigned">
                  {[...myAssignedStepKeys]
                    .map((k) => STEPS.find((s) => s.key === k)?.label)
                    .join(", ")}
                </span>
              ) : null}
              {" · "}
              <button
                type="button"
                className="tracking-switch-user-link"
                onClick={onSwitchUser}
              >
                Switch user
              </button>
            </small>
          )}
        </header>

        {/* Filters */}
        <div className="tracking-filters">
          <div className="tracking-filter-row tracking-filter-row--select">
            <label htmlFor="encounter-filter">Encounter Type</label>
            <select
              id="encounter-filter"
              value={encounterFilter}
              onChange={(e) => setEncounterFilter(e.target.value)}
            >
              <option value="">All Encounters</option>
              <option value="ADM">Admitted (ADM)</option>
              <option value="ER">Emergency (ER)</option>
              <option value="OPD">Out-Patient (OPD)</option>
            </select>
          </div>
          <div className="tracking-filter-row tracking-filter-row--search">
            <input
              type="text"
              style={{ fontFamily: "inherit" }}
              placeholder="Search patient name…"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setNameFilter(nameInput)}
            />
            <button
              type="button"
              style={{ fontFamily: "inherit" }}
              onClick={() => setNameFilter(nameInput)}
            >
              <Search size={13} strokeWidth={2.5} /> Search
            </button>
            {nameFilter && (
              <button
                type="button"
                className="tracking-btn-ghost"
                onClick={() => {
                  setNameFilter("");
                  setNameInput("");
                }}
              >
                <X size={12} strokeWidth={2.5} /> Clear
              </button>
            )}
          </div>
          <div className="tracking-filter-row tracking-filter-row--search">
            <input
              type="text"
              style={{ fontFamily: "inherit" }}
              placeholder="Filter by date e.g. 02/18/2026…"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setDateFilter(dateInput)}
            />
            <button
              type="button"
              style={{ fontFamily: "inherit" }}
              onClick={() => setDateFilter(dateInput)}
            >
              <Calendar size={13} strokeWidth={2.5} /> Search
            </button>
            {dateFilter && (
              <button
                type="button"
                className="tracking-btn-ghost"
                onClick={() => {
                  setDateFilter("");
                  setDateInput("");
                }}
              >
                <X size={12} strokeWidth={2.5} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <section className="tracking-actions">
          <button
            type="button"
            style={{ fontFamily: "inherit" }}
            onClick={onBackToModuleNavigator}
          >
            ← Back to Navigator
          </button>
          <button
            type="button"
            style={{ fontFamily: "inherit" }}
            onClick={() => onOpenTagging(taggableRows)}
            disabled={!taggableRows.length}
          >
            Open Tagging
          </button>
          <button
            type="button"
            style={{ fontFamily: "inherit" }}
            onClick={() => {
              fetchApi();
              refreshAccess();
            }}
            disabled={isLoading}
          >
            {isLoading ? "Syncing…" : "↺ Refresh"}
          </button>
        </section>

        {error && <p className="tracking-error">{error}</p>}

        {/* Legend */}
        <div className="tracking-legend">
          <span className="leg">
            <span className="leg-dot leg-done" />
            <CheckCircle2 size={11} /> Done
          </span>
          <span className="leg">
            <span className="leg-dot leg-active" />
            <Clock size={11} /> Active – click to process
          </span>
          <span className="leg">
            <span className="leg-dot leg-empty" /> Pending
          </span>
          <span className="leg leg-hint">
            {isSuperUser
              ? "⚡ Super User — click any step cell to process"
              : myAssignedStepKeys.size > 0
                ? `✏️ You can process: ${[...myAssignedStepKeys].map((k) => STEPS.find((s) => s.key === k)?.label).join(", ")}`
                : "👁 View only — no step assigned"}
          </span>
        </div>

        <div className="tracking-status-bar">
          {isLoading
            ? "⏳ Syncing records from API…"
            : `${filteredRows.length} record${filteredRows.length !== 1 ? "s" : ""}  ·  Page ${currentPage} of ${totalPages || 1}`}
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
                {STEPS.map((s) => (
                  <th key={s.key} className="th-step">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && !filteredRows.length ? (
                <tr>
                  <td
                    colSpan={6 + visibleSteps.length}
                    className="tracking-td-center"
                  >
                    ⏳ Loading records…
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6 + visibleSteps.length}
                    className="tracking-td-center"
                  >
                    {currentUserId && Object.keys(accessMap).length === 0
                      ? "You have not been tagged on any records yet."
                      : `No ${encounterFilter || ""} records found.`}
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, index) => (
                  <tr key={row.encoCode}>
                    <td>{(currentPage - 1) * ROWS_PER_PAGE + index + 1}</td>
                    <td className="td-mono">{row.hospitalNo}</td>
                    <td>
                      <span
                        className={`tracking-badge tracking-badge--${row.encounterType.toLowerCase()}`}
                      >
                        {row.encounterType || "—"}
                      </span>
                    </td>
                    <td className="td-mono">{row.admittedDate}</td>
                    <td className="td-mono">{row.dischargedDate}</td>
                    <td
                      className={
                        row.remainingDays !== null && row.remainingDays <= 10
                          ? "td-urgent"
                          : ""
                      }
                    >
                      {row.remainingDays != null
                        ? `${row.remainingDays}d`
                        : "—"}
                    </td>
                    <td className="tracking-td-name">{row.patientName}</td>
                    {visibleSteps.map((step) => {
                      // Cell-level gate: hide cells this user can't see
                      const visible =
                        !currentUserId || !row.id || canSeeStep(row, step.id);
                      if (!visible)
                        return (
                          <td
                            key={step.id}
                            className="tracking-td-step tracking-td-step--hidden"
                          >
                            <span
                              className="tracking-step-locked"
                              title="Not in your access scope"
                            >
                              —
                            </span>
                          </td>
                        );
                      const status = getCellState(row, step.id, step.label);
                      return (
                        <td
                          key={step.id}
                          className={`tracking-td-step${status.done ? " tracking-td-step--done" : ""}`}
                          title={status.title}
                        >
                          <span
                            className={
                              status.done
                                ? "tracking-step-date"
                                : "tracking-step-pending"
                            }
                          >
                            {status.value}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="tracking-pagination">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="tracking-pagination-btn"
            >
              ← Prev
            </button>
            <span className="tracking-pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="tracking-pagination-btn"
            >
              Next →
            </button>
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

Tracking.propTypes = {
  onBackToModuleNavigator: PropTypes.func.isRequired,
  currentUserId: PropTypes.string,
  currentUserName: PropTypes.string,
  onSwitchUser: PropTypes.func,
  onOpenTagging: PropTypes.func.isRequired,
};
