/**
 * WorkflowTracking.jsx  –  WORKFLOW ROUTING SYSTEM
 *
 * ACCESS MODEL:
 * ─────────────────────────────────────────────────────────────────────────────
 * • Super User (1st tagged user): Full access to all workflow steps on their records
 * • Assigned Users (2nd+ tagged): Can only edit their specifically assigned steps
 * • All Users: Can VIEW all workflow columns and patient records
 *
 * WORKFLOW BEHAVIOR:
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. All users see the entire tracking table with all workflow columns
 * 2. Assigned steps are enabled only for the assigned user
 * 3. Unassigned/future steps are disabled/read-only for regular users
 * 4. Completed steps are visible but no longer editable
 * 5. Super users can edit ALL steps regardless of assignment
 *
 * RECORD ROUTING:
 * ─────────────────────────────────────────────────────────────────────────────
 * When a user processes a step and clicks "Done":
 * 1. User adds remarks (optional)
 * 2. User clicks "Done" button
 * 3. A modal opens to select which assigned user will receive the record
 * 4. Once confirmed, the record is transferred to the next assigned user
 * 5. The record becomes "active" for the receiving user
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./Workflowtracking.css";
import { supabase } from "./hooks/supabaseClient.js";
import {
  Search, X, Calendar, ChevronLeft, RefreshCw, Send,
  CheckCircle2, Clock, Zap, Lock, Eye, Edit3, ArrowRight, User,
  Inbox, List,
} from "lucide-react";

const ROWS_PER_PAGE = 10;

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

function safeIso(raw) {
  if (!raw) return null;
  const cleaned = String(raw).replace(/^[^(]*\(([^)]+)\).*$/, "$1").trim();
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) return d.toISOString();
  const d2 = new Date(raw);
  return isNaN(d2.getTime()) ? null : d2.toISOString();
}

function parseApiStatus(raw = "") {
  if (!raw) return { done: false };
  const lower = raw.toLowerCase();
  if (
    lower.includes("not yet") ||
    lower.includes("no phic") ||
    lower.includes("no cheque")
  ) {
    return { done: false };
  }
  return { done: true, isoDate: safeIso(raw), label: raw };
}

function extractAdmittedDate(encoCode = "") {
  const m = String(encoCode).match(/(\d{2}\/\d{2}\/\d{4})\s*(\d{2}:\d{2}:\d{2})?/);
  if (!m) return "—";
  return m[2] ? `${m[1]} ${m[2]}` : m[1];
}

function calcRemainingDays(dischargedDate) {
  if (!dischargedDate || dischargedDate === "—") return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dischargedDate);
  if (isNaN(d.getTime())) return null;
  return 60 - Math.floor((today - d) / 86400000);
}

function formatDateDisplay(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-PH", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

function initials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function matchEncoCode(apiEnco, dbEnco) {
  if (!apiEnco || !dbEnco) return false;
  const a = String(apiEnco).trim();
  const b = String(dbEnco).trim();
  if (a === b) return true;
  if (a.startsWith(b) || b.startsWith(a)) return true;
  const aLeadNum = a.replace(/[^0-9].*$/, "");
  const bLeadNum = b.replace(/[^0-9].*$/, "");
  if (aLeadNum && bLeadNum) {
    if (aLeadNum === bLeadNum) return true;
    if (aLeadNum.startsWith(bLeadNum) || bLeadNum.startsWith(aLeadNum)) return true;
  }
  const aNum = a.replace(/[^0-9]/g, "").slice(0, 16);
  const bNum = b.replace(/[^0-9]/g, "").slice(0, 16);
  if (aNum && bNum && aNum === bNum) return true;
  if (a.includes(b) || b.includes(a)) return true;
  return false;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#B5D4F4", "#9FE1CB", "#FAC775", "#F5C4B3", "#CECBF6", "#C0DD97"];
const AVATAR_TEXT   = ["#0C447C", "#085041", "#633806", "#712B13", "#3C3489", "#27500A"];

function Avatar({ name = "", size = 28, index = 0 }) {
  const bg    = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const color = AVATAR_TEXT[index % AVATAR_TEXT.length];
  return (
    <div
      className="wt-avatar"
      style={{ width: size, height: size, background: bg, color, fontSize: size * 0.4 }}
    >
      {initials(name)}
    </div>
  );
}

// ─── StepChip ─────────────────────────────────────────────────────────────────
function StepChip({ status, label, editable, onClick, routed = false }) {
  const cls = [
    `wt-chip wt-chip--${status}`,
    editable ? "wt-chip--editable" : "",
    routed   ? "wt-chip--routed"   : "",
  ].filter(Boolean).join(" ");

  const Icon =
    status === "done"   ? CheckCircle2 :
    status === "active" ? Zap :
    status === "locked" ? Lock : Clock;

  return (
    <button
      className={cls}
      onClick={editable ? onClick : undefined}
      disabled={!editable}
      title={routed ? `⚡ Routed to you — ${label}` : label}
      type="button"
    >
      <Icon size={10} strokeWidth={2.5} />
      <span>{label}</span>
      {routed && <span className="wt-chip-routed-dot" title="Routed to you" />}
    </button>
  );
}

// ─── StepChipWithDetails ──────────────────────────────────────────────────────
// Enhanced chip that shows patient details when step is completed
function StepChipWithDetails({ 
  status, 
  label, 
  editable, 
  onClick, 
  routed = false,
  completionDetails = null 
}) {
  const cls = [
    `wt-chip wt-chip--${status}`,
    editable ? "wt-chip--editable" : "",
    routed   ? "wt-chip--routed"   : "",
  ].filter(Boolean).join(" ");

  const Icon =
    status === "done"   ? CheckCircle2 :
    status === "active" ? Zap :
    status === "locked" ? Lock : Clock;

  // When step is done, show expanded view with patient details
  if (status === "done" && completionDetails) {
    return (
      <div className="wt-chip wt-chip--done wt-chip--done-details" title={`Completed by ${completionDetails.doneByName}`}>
        <div className="wt-chip-details-header">
          <CheckCircle2 size={10} strokeWidth={2.5} />
          <span className="wt-chip-done-label">Done</span>
        </div>
        <div className="wt-chip-patient-info">
          <div className="wt-chip-patient-name">{completionDetails.patientName}</div>
          <div className="wt-chip-hospital-no">{completionDetails.hospitalNo}</div>
        </div>
        {completionDetails.remarks && (
          <div className="wt-chip-remarks">{completionDetails.remarks}</div>
        )}
      </div>
    );
  }

  return (
    <button
      className={cls}
      onClick={editable ? onClick : undefined}
      disabled={!editable}
      title={routed ? `⚡ Routed to you — ${label}` : label}
      type="button"
    >
      <Icon size={10} strokeWidth={2.5} />
      <span>{label}</span>
      {routed && <span className="wt-chip-routed-dot" title="Routed to you" />}
    </button>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ children, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <div
      className="wt-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="wt-modal">{children}</div>
    </div>
  );
}

// ─── ProcessModal ─────────────────────────────────────────────────────────────
function ProcessModal({ record, step, stepHistory, onClose, onDone }) {
  const [remarks, setRemarks] = useState("");
  const textRef = useRef(null);
  useEffect(() => { textRef.current?.focus(); }, []);
  return (
    <Modal onClose={onClose}>
      <div className="wt-modal-header">
        <Edit3 size={16} strokeWidth={2} />
        <div>
          <h3>Process: {step.label}</h3>
          <p>{record.patientName} · {record.hospitalNo}</p>
        </div>
      </div>
      {stepHistory.length > 0 && (
        <div className="wt-history">
          <div className="wt-history-title">Workflow history</div>
          {stepHistory.map((h) => (
            <div key={h.seq_id} className="wt-history-item">
              <div className="wt-history-step">{h.stepLabel}</div>
              <div className="wt-history-meta">
                {h.done_by_name || h.done_by || "—"} ·{" "}
                {h.done_at ? formatDateDisplay(h.done_at) : "—"}
              </div>
              {h.remarks && <div className="wt-history-remarks">{h.remarks}</div>}
            </div>
          ))}
        </div>
      )}
      <div className="wt-field">
        <label htmlFor="wt-remarks">Remarks</label>
        <textarea
          id="wt-remarks"
          ref={textRef}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add remarks for this step…"
          rows={3}
        />
      </div>
      <div className="wt-modal-actions">
        <button className="wt-btn" type="button" onClick={onClose}>Cancel</button>
        <button
          className="wt-btn wt-btn--primary"
          type="button"
          onClick={() => onDone(remarks)}
        >
          <CheckCircle2 size={14} strokeWidth={2.5} /> Mark Done &amp; Route
        </button>
      </div>
    </Modal>
  );
}

// ─── RouteModal ───────────────────────────────────────────────────────────────
function RouteModal({
  record, step, remarks, allGlobalUsers, steps,
  currentUserId, onClose, onConfirm,
}) {
  const [selectedUserId, setSelectedUserId] = useState(null);

  const stepIdx            = steps.findIndex((s) => s.id === step.id);
  const nextSteps          = steps.slice(stepIdx + 1);
  const immediateNextStepId = nextSteps[0]?.id;

  const candidates = useMemo(() => {
    return allGlobalUsers
      .filter((u) => {
        if (String(u.id) === String(currentUserId)) return false;
        if (u.isSuperUser) return true;
        if (!u.stepIds || u.stepIds.length === 0) return false;
        return u.stepIds.some((sid) => nextSteps.find((ns) => ns.id === sid));
      })
      .sort((a, b) => {
        const aNext = a.stepIds?.includes(immediateNextStepId) ? 0 : 1;
        const bNext = b.stepIds?.includes(immediateNextStepId) ? 0 : 1;
        return aNext - bNext;
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allGlobalUsers, currentUserId, stepIdx]);

  return (
    <Modal onClose={onClose}>
      <div className="wt-modal-header">
        <ArrowRight size={16} strokeWidth={2} />
        <div>
          <h3>Route Record</h3>
          <p>Completing <strong>{step.label}</strong> for {record.patientName}</p>
        </div>
      </div>

      {remarks && (
        <div className="wt-remarks-preview">
          <span className="wt-remarks-label">Remarks</span>
          <span>{remarks}</span>
        </div>
      )}

      <div className="wt-field">
        <label>Pass record to</label>
        {candidates.length === 0 ? (
          <div className="wt-empty-state">
            <p className="wt-empty-msg">
              No users are assigned to the remaining steps.
              <br />
              <span style={{ fontSize: 11, opacity: 0.7 }}>
                Assign users via the Tagging System, then route here.
              </span>
            </p>
          </div>
        ) : (
          <div className="wt-assignee-list">
            {candidates.map((u, i) => {
              const handlesImmediateNext =
                u.isSuperUser || u.stepIds?.includes(immediateNextStepId);

              const assignedStepLabels = u.isSuperUser
                ? ["All steps"]
                : (u.stepIds ?? [])
                    .filter((sid) => nextSteps.find((ns) => ns.id === sid))
                    .map((sid) => steps.find((s) => s.id === sid)?.label)
                    .filter(Boolean);

              return (
                <button
                  key={u.id}
                  type="button"
                  className={[
                    "wt-assignee-row",
                    selectedUserId === u.id     ? "wt-assignee-row--selected" : "",
                    handlesImmediateNext        ? "wt-assignee-row--next"     : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => setSelectedUserId(u.id)}
                >
                  <Avatar name={u.name} index={i} />
                  <div className="wt-assignee-info">
                    <div className="wt-assignee-name">{u.name}</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 2 }}>
                      {u.isSuperUser && (
                        <span className="wt-badge wt-badge--super">Full Access</span>
                      )}
                      {handlesImmediateNext && !u.isSuperUser && (
                        <span className="wt-badge wt-badge--next">Next Step</span>
                      )}
                    </div>
                    <div className="wt-assignee-steps">
                      Handles:{" "}
                      {assignedStepLabels.length > 3
                        ? `${assignedStepLabels.length} upcoming steps`
                        : assignedStepLabels.join(", ") || "—"}
                    </div>
                  </div>
                  {selectedUserId === u.id && (
                    <CheckCircle2
                      size={16} strokeWidth={2.5}
                      style={{ color: "#185FA5", marginLeft: "auto", flexShrink: 0 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedUserId && (
        <div className="wt-route-confirm-msg">
          Record will become <strong>active</strong> for{" "}
          <strong>{allGlobalUsers.find((u) => u.id === selectedUserId)?.name}</strong>{" "}
          on their next assigned step.
        </div>
      )}

      <div className="wt-modal-actions">
        <button className="wt-btn" type="button" onClick={onClose}>Cancel</button>
        <button
          className="wt-btn wt-btn--primary"
          type="button"
          onClick={() => onConfirm(selectedUserId)}
        >
          <Send size={14} strokeWidth={2.5} />
          {selectedUserId ? "Confirm & Route" : "Complete Step Only"}
        </button>
      </div>
    </Modal>
  );
}

// ─── ViewHistoryModal ─────────────────────────────────────────────────────────
function ViewHistoryModal({ record, step, stepHistory, onClose }) {
  const entry = stepHistory.find((h) => h.seq_id === step.id);
  return (
    <Modal onClose={onClose}>
      <div className="wt-modal-header">
        <Eye size={16} strokeWidth={2} />
        <div>
          <h3>{step.label} — History</h3>
          <p>{record.patientName} · {record.hospitalNo}</p>
        </div>
      </div>
      {entry ? (
        <div className="wt-history-item wt-history-item--done">
          <div className="wt-history-step">Completed</div>
          <div className="wt-history-meta">
            {entry.done_by_name || entry.done_by || "—"} ·{" "}
            {entry.done_at ? formatDateDisplay(entry.done_at) : "—"}
          </div>
          {entry.remarks && <div className="wt-history-remarks">{entry.remarks}</div>}
        </div>
      ) : (
        <p className="wt-empty-msg">No completion record found.</p>
      )}
      {stepHistory.filter((h) => h.seq_id !== step.id && h.done_at).length > 0 && (
        <div className="wt-history" style={{ marginTop: 12 }}>
          <div className="wt-history-title">Other completed steps</div>
          {stepHistory
            .filter((h) => h.seq_id !== step.id && h.done_at)
            .map((h) => (
              <div key={h.seq_id} className="wt-history-item">
                <div className="wt-history-step">{h.stepLabel}</div>
                <div className="wt-history-meta">
                  {h.done_by_name || "—"} · {formatDateDisplay(h.done_at)}
                </div>
                {h.remarks && <div className="wt-history-remarks">{h.remarks}</div>}
              </div>
            ))}
        </div>
      )}
      <div className="wt-modal-actions">
        <button className="wt-btn" type="button" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

// ─── EmptyQueue ───────────────────────────────────────────────────────────────
function EmptyQueue({ isSuperUser }) {
  return (
    <tr>
      <td colSpan={99}>
        <div className="wt-empty-queue">
          <div className="wt-empty-queue-icon">
            <Inbox size={36} strokeWidth={1.5} />
          </div>
          <div className="wt-empty-queue-title">Your queue is empty</div>
          <div className="wt-empty-queue-sub">
            {isSuperUser
              ? "No active records are currently in the system."
              : "No records have been routed to you yet. Once another user completes their step and passes a record to you, it will appear here."}
          </div>
        </div>
      </td>
    </tr>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════════════════════
export default function WorkflowTracking({
  currentUserId,
  currentUserName,
  onSwitchUser,
  onBackToModuleNavigator,
}) {
  const [steps,          setSteps]          = useState([]);
  const [apiRows,        setApiRows]        = useState([]);
  const [dbRows,         setDbRows]         = useState([]);
  const [logs,           setLogs]           = useState({});
  const [routing,        setRouting]        = useState({});

  const [allGlobalUsers,    setAllGlobalUsers]    = useState([]);
  const [perRecordTagOrder, setPerRecordTagOrder] = useState({});
  const [profileMap,        setProfileMap]        = useState({});

  const [myStepIds,   setMyStepIds]   = useState(null);
  const [isSuperUser, setIsSuperUser] = useState(false);
  
  // Use ref to avoid stale closure issues with isSuperUser in callback functions
  const isSuperUserRef = useRef(false);
  useEffect(() => {
    isSuperUserRef.current = isSuperUser;
  }, [isSuperUser]);

  const [nameInput,       setNameInput]       = useState("");
  const [nameFilter,      setNameFilter]      = useState("");
  const [dateInput,       setDateInput]       = useState("");
  const [dateFilter,      setDateFilter]      = useState("");
  const [encounterFilter, setEncounterFilter] = useState("ADM");

  // ── v7: view mode ──────────────────────────────────────────────────────────
  // "queue"  → only records routed to me (default for regular users)
  // "all"    → every record (admin / reference view)
  const [viewMode, setViewMode] = useState("queue");

  const [currentPage, setCurrentPage] = useState(1);
  const [loadingApi,  setLoadingApi]  = useState(false);
  const [syncing,     setSyncing]     = useState(false);
  const [error,       setError]       = useState("");
  const [modal,       setModal]       = useState(null);

  const isLoading = loadingApi || syncing;

  // ── 1. Load workflow steps ─────────────────────────────────────────────────
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

  // ── 2. Load ALL global users from user_seq_assignment ─────────────────────
  const loadGlobalUsers = useCallback(async () => {
    const { data: seqData, error: seqErr } = await supabase
      .from("user_seq_assignment")
      .select("user_id, seq_id");

    if (seqErr) {
      console.warn("user_seq_assignment error:", seqErr.message);
      return;
    }

    const seqMap = {};
    for (const row of seqData ?? []) {
      const uid = String(row.user_id);
      if (!seqMap[uid]) seqMap[uid] = [];
      seqMap[uid].push(row.seq_id);
    }

    const { data: superData } = await supabase
      .from("tracking_user_assignment")
      .select("user_id")
      .eq("tag_order", 1);

    const superIds = new Set((superData ?? []).map((t) => String(t.user_id)));

    const allUids = [...new Set([...Object.keys(seqMap), ...Array.from(superIds)])];
    if (allUids.length === 0) return;

    const { data: usersData } = await supabase
      .from("users")
      .select("user_id, full_name, email")
      .in("user_id", allUids);

    const newProfileMap = {};
    for (const u of usersData ?? []) {
      newProfileMap[String(u.user_id)] = u.full_name || u.email || String(u.user_id);
    }
    setProfileMap(newProfileMap);

    const globalList = allUids.map((uid) => ({
      id:          uid,
      name:        newProfileMap[uid] ?? `User ${uid}`,
      stepIds:     seqMap[uid] ?? [],
      isSuperUser: superIds.has(uid),
    }));

    setAllGlobalUsers(globalList);
  }, []);

  // ── 3. Current user's own step assignments + super check ──────────────────
  useEffect(() => {
    if (!currentUserId) return;
    (async () => {
      const uid = String(currentUserId);

      const { data: tagData } = await supabase
        .from("tracking_user_assignment")
        .select("tag_order")
        .eq("user_id", uid)
        .eq("tag_order", 1)
        .limit(1);

      const isSuper = (tagData?.length ?? 0) > 0;
      setIsSuperUser(isSuper);

      if (!isSuper) {
        const { data: seqData } = await supabase
          .from("user_seq_assignment")
          .select("seq_id")
          .eq("user_id", uid);
        setMyStepIds((seqData ?? []).map((s) => s.seq_id));
      } else {
        setMyStepIds([]);
      }
    })();
  }, [currentUserId]);

  // ── 4. Fetch API data ──────────────────────────────────────────────────────
  const fetchApi = useCallback(async () => {
    const url = import.meta.env.VITE_CHART_TRACKING;
    if (!url) {
      setError("VITE_CHART_TRACKING env variable is not configured.");
      return;
    }
    setLoadingApi(true);
    setError("");
    try {
      const res  = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const rows = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
        ? json.data
        : [];
      setApiRows(rows);
    } catch (e) {
      setError(`API fetch error: ${e.message}`);
    } finally {
      setLoadingApi(false);
    }
  }, []);

  useEffect(() => { fetchApi();        }, [fetchApi]);
  useEffect(() => { loadGlobalUsers(); }, [loadGlobalUsers]);

  // ── 5. Sync API → Supabase ─────────────────────────────────────────────────
  useEffect(() => {
    if (!apiRows.length || !steps.length) return;
    let cancelled = false;

    (async () => {
      setSyncing(true);

      for (const apiRow of apiRows) {
        if (cancelled) break;

        const encoCode = apiRow.enccode ?? apiRow.tracking_encocode ?? "";
        if (!encoCode) continue;

        const { data: upserted, error: uErr } = await supabase
          .from("tracking")
          .upsert(
            {
              tracking_encocode: encoCode,
              encounter_type:    apiRow.encounter_type ?? "",
              is_current:        true,
              created_by:        String(apiRow.patient_id ?? ""),
            },
            { onConflict: "tracking_encocode" },
          )
          .select("id")
          .single();

        if (uErr || !upserted?.id) continue;
        const trackingId = upserted.id;

        // NOTE: We do NOT insert tracking_log entries for API-synced records.
        // The API data represents external system state, not user workflow completion.
        // Instead, the routing will be initialized with all steps as "pending" 
        // until a user manually processes them.
        // 
        // If you want the API data to reflect as "done", you would need to:
        // 1. Remove the API_FIELD_MAP matching entirely, OR
        // 2. Only mark specific steps as done (e.g., only PHIC)
        // 
        // For now, we skip all API log insertions so users can process records themselves.
        // We also delete any existing log entries and routing entries to reset the workflow state.
        
        await supabase
          .from("tracking_log")
          .delete()
          .eq("tracking_id", trackingId)
          .eq("done_by", "API sync");
        
        // Also delete all routing entries so they get recreated fresh
        await supabase
          .from("workflow_routing")
          .delete()
          .eq("tracking_id", trackingId);

        // Check if there's a tagged user to assign the first step to
        // Get the FIRST tagged user (tag_order = 1) who has super user access
        const { data: tagData } = await supabase
          .from("tracking_user_assignment")
          .select("user_id")
          .eq("tracking_id", trackingId)
          .eq("tag_order", 1) // Only get 1st tagged user (super user)
          .maybeSingle();
        
        // Get the 1st tagged user ID
        const firstUserId = tagData?.user_id ?? null;
        
        // If we have a first user, create routing entries with the first step active for them
        if (firstUserId && steps.length > 0) {
          const routingEntries = steps.map((step, index) => ({
            tracking_id: trackingId,
            seq_id: step.id,
            status: index === 0 ? "active" : "pending", // First step is active
            assigned_to: index === 0 ? String(firstUserId) : null,
          }));
          
          await supabase.from("workflow_routing").insert(routingEntries);
        } else {
          // No tagged users yet - just create pending entries
          await initRoutingRowsFor(trackingId, steps, null);
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

  // ── 6. Init routing rows ───────────────────────────────────────────────────
  async function initRoutingRowsFor(trackingId, stepsArr, firstUserId = null) {
    // Fetch all log entries for this tracking to determine which steps are already done
    const { data: logData } = await supabase
      .from("tracking_log")
      .select("seq_id")
      .eq("tracking_id", trackingId);
    const doneSeqIds = new Set((logData ?? []).map((l) => l.seq_id));

    // Fetch existing routing entries
    const { data: existing } = await supabase
      .from("workflow_routing")
      .select("seq_id")
      .eq("tracking_id", trackingId);
    const existingSeqIds = new Set((existing ?? []).map((r) => r.seq_id));

    // Determine the first NOT-done step
    const firstNotDoneStep = stepsArr.find((s) => !doneSeqIds.has(s.id));
    
    const toInsert = stepsArr
      .filter((s) => !existingSeqIds.has(s.id))
      .map((s) => {
        const isFirstNotDone = s === firstNotDoneStep;
        const isDone = doneSeqIds.has(s.id);
        return { 
          tracking_id: trackingId, 
          seq_id: s.id, 
          status: isDone ? "done" : (isFirstNotDone ? "active" : "pending"),
          assigned_to: isFirstNotDone && !isDone ? (firstUserId || null) : null
        };
      });
    
    if (toInsert.length > 0) {
      await supabase.from("workflow_routing").insert(toInsert);
    }
    
    // Also update the first NOT-done step to be active if it exists but isn't set correctly
    if (firstNotDoneStep) {
      const firstStepId = firstNotDoneStep.id;
      const firstStepExists = existingSeqIds.has(firstStepId);
      if (firstStepExists) {
        await supabase
          .from("workflow_routing")
          .update({ 
            status: "active",
            assigned_to: firstUserId || null
          })
          .eq("tracking_id", trackingId)
          .eq("seq_id", firstStepId)
          .neq("status", "done"); // Don't overwrite if already done
      }
    }
  }

  // ── 7. Reload DB rows ──────────────────────────────────────────────────────
  const reloadDbRows = useCallback(async () => {
    const { data: trackingData, error: tErr } = await supabase
      .from("tracking")
      .select("id, tracking_encocode, encounter_type, date_created")
      .order("date_created", { ascending: false });

    if (tErr || !trackingData?.length) {
      setDbRows([]);
      return;
    }

    const ids = trackingData.map((r) => r.id);

    const [
      { data: logData },
      { data: routingData },
      { data: tagData },
    ] = await Promise.all([
      supabase
        .from("tracking_log")
        .select("id, tracking_id, seq_id, done_by, done_at, remarks")
        .in("tracking_id", ids),
      supabase
        .from("workflow_routing")
        .select("tracking_id, seq_id, status, assigned_to, remarks, done_by, done_at, passed_from")
        .in("tracking_id", ids),
      supabase
        .from("tracking_user_assignment")
        .select("tracking_id, user_id, tag_order")
        .in("tracking_id", ids)
        .order("tag_order", { ascending: true }),
    ]);

    // Log map
    const logMap = {};
    for (const log of logData ?? []) {
      if (!logMap[log.tracking_id]) logMap[log.tracking_id] = {};
      logMap[log.tracking_id][log.seq_id] = log;
    }

    // Route map
    const routeMap = {};
    for (const r of routingData ?? []) {
      if (!routeMap[r.tracking_id]) routeMap[r.tracking_id] = {};
      routeMap[r.tracking_id][r.seq_id] = r;
    }

    // Sync routing → done where log entries exist
    for (const tid of ids) {
      const routeRows = routeMap[tid] ?? {};
      const logRows   = logMap[tid]   ?? {};
      for (const seqId of Object.keys(logRows)) {
        const sid = Number(seqId);
        if (routeRows[sid] && routeRows[sid].status !== "done") {
          routeMap[tid][sid] = {
            ...routeRows[sid],
            status:  "done",
            done_by: logRows[seqId].done_by,
            done_at: logRows[seqId].done_at,
            remarks: logRows[seqId].remarks,
          };
        }
      }
    }

    // Per-record tag_order
    const newPerRecordTagOrder = {};
    for (const t of tagData ?? []) {
      const tid = t.tracking_id;
      const uid = String(t.user_id);
      if (!newPerRecordTagOrder[tid]) newPerRecordTagOrder[tid] = {};
      newPerRecordTagOrder[tid][uid] = t.tag_order;
    }

    setLogs(logMap);
    setRouting(routeMap);
    setDbRows(trackingData);
    setPerRecordTagOrder(newPerRecordTagOrder);
  }, []);

  useEffect(() => {
    if (steps.length) reloadDbRows();
  }, [reloadDbRows, steps]);

  // ── 8. Realtime ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUserId) return;
    const ch = supabase
      .channel("workflow-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "workflow_routing" },
          () => reloadDbRows())
      .on("postgres_changes", { event: "*", schema: "public", table: "tracking_log" },
          () => reloadDbRows())
      .on("postgres_changes", { event: "*", schema: "public", table: "tracking_user_assignment" },
          () => { reloadDbRows(); loadGlobalUsers(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "user_seq_assignment" },
          () => loadGlobalUsers())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [currentUserId, reloadDbRows, loadGlobalUsers]);

  // ── 9. Name helper ─────────────────────────────────────────────────────────
  function getUserName(userId) {
    if (!userId) return "—";
    const uid = String(userId);
    return (
      allGlobalUsers.find((u) => u.id === uid)?.name ??
      profileMap[uid] ??
      uid
    );
  }

  // ── 10. Merge API + DB ─────────────────────────────────────────────────────
  const mergedRows = useMemo(() => {
    return apiRows.map((apiRow) => {
      const encoCode       = apiRow.enccode ?? apiRow.tracking_encocode ?? "";
      const dbRow          = dbRows.find((r) => matchEncoCode(encoCode, r.tracking_encocode));
      const dischargedDate = apiRow.discharged_date || "—";
      return {
        id:            dbRow?.id ?? null,
        encoCode,
        encounterType: (apiRow.encounter_type ?? "").toUpperCase(),
        patientName:   apiRow.patient_name ?? "—",
        hospitalNo:    apiRow.hospital_no  ?? apiRow.patient_id ?? "—",
        admittedDate:  extractAdmittedDate(encoCode),
        dischargedDate,
        remainingDays: calcRemainingDays(dischargedDate),
      };
    });
  }, [apiRows, dbRows]);

  // ── 11a. isInMyQueue ───────────────────────────────────────────────────────
  /**
   * Returns true if this record has at least one step that is:
   *   status = "active"  AND  assigned_to = currentUserId
   *   AND  that step is in myStepIds  (or user is super)
   *
   * Super-users: see every record that has ANY active step (i.e. is in-progress).
   */
  const isInMyQueue = useCallback(
    (row) => {
      if (!row.id) return false;
      const uid        = String(currentUserId ?? "");
      const rowRouting = routing[row.id] ?? {};

      if (isSuperUser) {
        // Super sees all records that have at least one active step
        return Object.values(rowRouting).some((r) => r.status === "active");
      }

      // Regular user: need an active step assigned explicitly to me
      return Object.values(rowRouting).some(
        (r) =>
          r.status === "active" &&
          String(r.assigned_to) === uid &&
          (myStepIds ?? []).includes(r.seq_id),
      );
    },
    [routing, currentUserId, isSuperUser, myStepIds],
  );

  // ── 11b. Filter + sort ─────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    const base = mergedRows.filter((r) => {
      if (encounterFilter && r.encounterType !== encounterFilter) return false;
      if (nameFilter && !r.patientName.toLowerCase().includes(nameFilter.toLowerCase())) return false;
      if (dateFilter && !r.admittedDate.includes(dateFilter)) return false;
      return true;
    });

    const viewRows = viewMode === "queue"
      ? base.filter((r) => isInMyQueue(r))
      : base;

    return viewRows.sort((a, b) => {
      if (a.remainingDays === null && b.remainingDays === null) return 0;
      if (a.remainingDays === null) return 1;
      if (b.remainingDays === null) return -1;
      if (a.remainingDays < 0 && b.remainingDays < 0) return 0;
      if (a.remainingDays < 0) return 1;
      if (b.remainingDays < 0) return -1;
      return a.remainingDays - b.remainingDays;
    });
  }, [mergedRows, encounterFilter, nameFilter, dateFilter, viewMode, isInMyQueue]);

  // Queue badge count (always computed against un-filtered base for the tab number)
  const myQueueCount = useMemo(
    () => mergedRows.filter((r) => isInMyQueue(r)).length,
    [mergedRows, isInMyQueue],
  );

  useEffect(() => { setCurrentPage(1); }, [encounterFilter, nameFilter, dateFilter, viewMode]);

  const totalPages    = Math.ceil(filteredRows.length / ROWS_PER_PAGE);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
  );

  // ── 12. Step status ────────────────────────────────────────────────────────
  function getStepStatus(row, step) {
    if (!row.id) return { status: "pending", label: "Pending", routingRow: null, logRow: null };
    const logRow  = logs[row.id]?.[step.id]    ?? null;
    const routRow = routing[row.id]?.[step.id] ?? null;

    if (routRow?.status === "done" || logRow) {
      const doneBy = routRow?.done_by || logRow?.done_by || null;
      return {
        status:     "done",
        label:      doneBy ? getUserName(doneBy) : "Done",
        routingRow: routRow,
        logRow,
      };
    }
    if (routRow?.status === "active") {
      return {
        status:     "active",
        label:      routRow.assigned_to ? getUserName(routRow.assigned_to) : "Active",
        routingRow: routRow,
        logRow,
      };
    }
    return { status: "pending", label: "Pending", routingRow: null, logRow: null };
  }

  // ── 12b. Get step completion details for display ─────────────────────────
  function getStepCompletionDetails(row, step) {
    if (!row.id) return null;
    const logRow  = logs[row.id]?.[step.id]    ?? null;
    const routRow = routing[row.id]?.[step.id] ?? null;
    
    if (routRow?.status === "done" || logRow) {
      const doneBy = routRow?.done_by || logRow?.done_by || null;
      const doneAt = routRow?.done_at || logRow?.done_at || null;
      const remarks = routRow?.remarks || logRow?.remarks || null;
      return {
        doneBy:     doneBy,
        doneByName: getUserName(doneBy),
        doneAt:     doneAt,
        remarks:    remarks,
        patientName: row.patientName,
        hospitalNo:  row.hospitalNo,
        encounterType: row.encounterType,
      };
    }
    return null;
  }

  // ── 13. Can edit ───────────────────────────────────────────────────────────
  function canEdit(row, step, stepStatus) {
    if (!row.id) return false;
    if (stepStatus.status === "done") return false;

    // Super users can always edit ALL steps (use ref to avoid stale closure)
    if (isSuperUserRef.current) return true;

    const uid = String(currentUserId ?? "");
    
    // First tagged user on this record can edit all steps
    if (perRecordTagOrder[row.id]?.[uid] === 1) return true;

    // For regular users, step must be in their assigned steps AND active AND assigned to them
    if (!myStepIds?.includes(step.id)) return false;
    if (stepStatus.status !== "active") return false;
    
    // Check if this step is assigned to the current user (handle type mismatches)
    const assignedTo = stepStatus.routingRow?.assigned_to;
    if (!assignedTo) return false;
    
    // Convert both to string for comparison
    return String(assignedTo) === uid || Number(assignedTo) === Number(uid);
  }

  // ── 14. Resolve chip ───────────────────────────────────────────────────────
  function resolveChip(row, step) {
    const stepStatus        = getStepStatus(row, step);
    const { status, label } = stepStatus;
    const editable          = canEdit(row, step, stepStatus);

    // Is this step actively routed to the current user?
    const uid      = String(currentUserId ?? "");
    const routedToMe =
      status === "active" &&
      String(stepStatus.routingRow?.assigned_to) === uid &&
      !isSuperUserRef.current; // super always editable; badge only for regular users

    if (status === "done") return { chipStatus: "done",    label, editable: false, routed: false, isClickable: true };
    
    if (status === "active") {
      if (editable) return { chipStatus: "active",  label: "Process", editable: true, routed: routedToMe, isClickable: true };
      // Locked active step (assigned to someone else) - still clickable to see details
      return { chipStatus: "locked",  label: "Active", editable: false, routed: false, isClickable: true };
    }

    if (isSuperUserRef.current) return { chipStatus: "pending", label: "Pending", editable: true, routed: false, isClickable: true };

    const isMyStep = myStepIds !== null && myStepIds.includes(step.id);
    if (isMyStep)   return { chipStatus: "locked",  label: "Pending", editable: false, routed: false, isClickable: true };

    return { chipStatus: "locked", label: "—", editable: false, routed: false, isClickable: false };
  }

  // ── 15. History helpers ────────────────────────────────────────────────────
  function buildHistory(row, upToStepId) {
    if (!row.id) return [];
    const upToIdx = steps.findIndex((s) => s.id === upToStepId);
    return steps
      .slice(0, upToIdx)
      .map((s) => {
        const logRow  = logs[row.id]?.[s.id];
        const routRow = routing[row.id]?.[s.id];
        if (!logRow && routRow?.status !== "done") return null;
        const doneBy = routRow?.done_by || logRow?.done_by || null;
        return {
          seq_id:       s.id,
          stepLabel:    s.label,
          done_by:      doneBy,
          done_by_name: getUserName(doneBy),
          done_at:      routRow?.done_at || logRow?.done_at || null,
          remarks:      routRow?.remarks || logRow?.remarks || null,
        };
      })
      .filter(Boolean);
  }

  function buildFullHistory(row) {
    if (!row.id) return [];
    return steps
      .map((s) => {
        const logRow  = logs[row.id]?.[s.id];
        const routRow = routing[row.id]?.[s.id];
        const doneBy  = routRow?.done_by || logRow?.done_by || null;
        return {
          seq_id:       s.id,
          stepLabel:    s.label,
          done_by:      doneBy,
          done_by_name: getUserName(doneBy),
          done_at:      routRow?.done_at || logRow?.done_at || null,
          remarks:      routRow?.remarks || logRow?.remarks || null,
        };
      })
      .filter((h) => h.done_at);
  }

  // ── 16. Modal openers ──────────────────────────────────────────────────────
  function openProcessModal(row, step) {
    setModal({ type: "process", record: row, step, history: buildHistory(row, step.id) });
  }
  function openViewModal(row, step) {
    setModal({ type: "view",    record: row, step, history: buildFullHistory(row) });
  }
  function handleProcessDone(remarks) {
    setModal((prev) => ({ ...prev, type: "route", remarks }));
  }

  // ── 17. Confirm routing ────────────────────────────────────────────────────
  async function handleConfirmRoute(nextUserId) {
    const { record, step, remarks } = modal;
    if (!record?.id) { setModal(null); return; }
    setModal(null);

    // Refresh global users to ensure we have the latest step assignments
    await loadGlobalUsers();

    const now     = new Date().toISOString();
    const stepIdx = steps.findIndex((s) => s.id === step.id);

    // 1. Mark current step done
    const { error: doneErr } = await supabase
      .from("workflow_routing")
      .update({
        status:      "done",
        done_by:     currentUserId,
        done_at:     now,
        remarks:     remarks || null,
        assigned_to: null,
      })
      .eq("tracking_id", record.id)
      .eq("seq_id", step.id);

    if (doneErr) {
      setError(`Failed to complete step: ${doneErr.message}`);
      return;
    }

    // 2. Insert tracking_log
    const { data: existingLog } = await supabase
      .from("tracking_log")
      .select("id")
      .eq("tracking_id", record.id)
      .eq("seq_id", step.id)
      .maybeSingle();

    if (!existingLog) {
      await supabase.from("tracking_log").insert({
        tracking_id: record.id,
        seq_id:      step.id,
        done_by:     currentUserId,
        done_at:     now,
        remarks:     remarks || null,
      });
    }

    // 3. Find next step to activate
    let nextStepId = null;

    if (nextUserId) {
      const nextUserGlobal = allGlobalUsers.find(
        (u) => u.id === String(nextUserId)
      );

      if (nextUserGlobal?.isSuperUser) {
        nextStepId = steps[stepIdx + 1]?.id ?? null;
      } else if (nextUserGlobal?.stepIds?.length > 0) {
        const remaining = steps.slice(stepIdx + 1);
        const found = remaining.find((s) => {
          if (!nextUserGlobal.stepIds.includes(s.id)) return false;
          const rt  = routing[record.id]?.[s.id];
          const lg  = logs[record.id]?.[s.id];
          return rt?.status !== "done" && !lg;
        });
        nextStepId = found?.id ?? null;
      }
    } else {
      nextStepId = steps[stepIdx + 1]?.id ?? null;
    }

    // 4. Activate next step — set assigned_to so it appears in that user's queue
    // Also store passed_from to track who passed this record
    if (nextStepId) {
      const { error: activeErr } = await supabase
        .from("workflow_routing")
        .update({
          status:      "active",
          assigned_to: nextUserId || null,
          passed_from: currentUserId, // Track who passed this record
          done_by:     null,
          done_at:     null,
          remarks:     null,
        })
        .eq("tracking_id", record.id)
        .eq("seq_id", nextStepId);

      if (activeErr) {
        console.error("Activate next step failed:", activeErr.message);
      }
    }

    // 5. OPTIMISTIC UPDATE: Immediately update local state for instant UI feedback
    const newRouting = { ...routing };
    if (!newRouting[record.id]) {
      newRouting[record.id] = {};
    }
    // Mark current step as done
    newRouting[record.id] = {
      ...newRouting[record.id],
      [step.id]: {
        ...newRouting[record.id][step.id],
        status: "done",
        done_by: currentUserId,
        done_at: now,
        remarks: remarks || null,
        assigned_to: null,
      },
    };
    // Activate next step
    if (nextStepId) {
      newRouting[record.id] = {
        ...newRouting[record.id],
        [nextStepId]: {
          ...newRouting[record.id][nextStepId],
          status: "active",
          assigned_to: nextUserId || null,
          passed_from: currentUserId, // Track who passed this record
          done_by: null,
          done_at: null,
          remarks: null,
        },
      };
    }
    setRouting(newRouting);

    // 6. Also update logs
    const newLogs = { ...logs };
    if (!newLogs[record.id]) {
      newLogs[record.id] = {};
    }
    newLogs[record.id] = {
      ...newLogs[record.id],
      [step.id]: {
        tracking_id: record.id,
        seq_id: step.id,
        done_by: currentUserId,
        done_at: now,
        remarks: remarks || null,
      },
    };
    setLogs(newLogs);

    // 7. Then reload from DB to ensure consistency
    await reloadDbRows();
  }

  // ── 18. Progress ───────────────────────────────────────────────────────────
  function calcProgress(row) {
    if (!row.id || !steps.length) return 0;
    const done = steps.filter(
      (s) => logs[row.id]?.[s.id] || routing[row.id]?.[s.id]?.status === "done"
    ).length;
    return Math.round((done / steps.length) * 100);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="wt-page">
      <main className="wt-shell">

        <header className="wt-header">
          <div className="wt-header-text">
            <h1>CHART Tracking System</h1>
            <p>Agusan del Norte Provincial Health Office — Workflow Routing</p>
          </div>
          {currentUserName && (
            <div className="wt-user-info">
              <Avatar name={currentUserName} index={0} size={30} />
              <div>
                <div className="wt-user-name">{currentUserName}</div>
                <div className="wt-user-role">
                  {isSuperUser ? "Super User / Admin" : "Assigned User"}
                </div>
              </div>
              <button type="button" className="wt-switch-btn" onClick={onSwitchUser}>
                <User size={12} strokeWidth={2.5} /> Switch
              </button>
            </div>
          )}
        </header>

        {/* ── View mode tabs ── */}
        <div className="wt-view-tabs">
          <button
            type="button"
            className={`wt-view-tab ${viewMode === "queue" ? "wt-view-tab--active" : ""}`}
            onClick={() => setViewMode("queue")}
          >
            <Inbox size={14} strokeWidth={2} />
            My Queue
            {myQueueCount > 0 && (
              <span className="wt-queue-badge">{myQueueCount}</span>
            )}
          </button>
          <button
            type="button"
            className={`wt-view-tab ${viewMode === "all" ? "wt-view-tab--active" : ""}`}
            onClick={() => setViewMode("all")}
          >
            <List size={14} strokeWidth={2} />
            All Records
            <span className="wt-queue-badge wt-queue-badge--neutral">
              {mergedRows.length}
            </span>
          </button>

          {viewMode === "queue" && !isSuperUser && (
            <span className="wt-view-hint">
              Showing only records routed to <strong>{currentUserName}</strong>
            </span>
          )}
          {viewMode === "queue" && isSuperUser && (
            <span className="wt-view-hint">
              Showing all records with an active step
            </span>
          )}
          {viewMode === "all" && (
            <span className="wt-view-hint">
              Showing all records — you can only process steps assigned to you
            </span>
          )}
        </div>

        <div className="wt-legend">
          <span className="wt-chip wt-chip--done"    style={{ cursor: "default", pointerEvents: "none" }}><CheckCircle2 size={10} strokeWidth={2.5} /> Done</span>
          <span className="wt-chip wt-chip--active"  style={{ cursor: "default", pointerEvents: "none" }}><Zap          size={10} strokeWidth={2.5} /> Active (yours)</span>
          <span className="wt-chip wt-chip--pending" style={{ cursor: "default", pointerEvents: "none" }}><Clock        size={10} strokeWidth={2.5} /> Pending</span>
          <span className="wt-chip wt-chip--locked"  style={{ cursor: "default", pointerEvents: "none" }}><Lock         size={10} strokeWidth={2.5} /> Read-only</span>
          <span style={{ fontSize: 11, color: "var(--color-text-secondary)", marginLeft: 4 }}>
            Click any chip to process or view history
          </span>
        </div>

        <div className="wt-filters">
          <div className="wt-filter-group">
            <label htmlFor="wt-encounter">Encounter</label>
            <select
              id="wt-encounter"
              value={encounterFilter}
              onChange={(e) => setEncounterFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="ADM">ADM</option>
              <option value="ER">ER</option>
              <option value="OPD">OPD</option>
            </select>
          </div>
          <div className="wt-filter-search">
            <input
              type="text"
              placeholder="Search patient name…"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setNameFilter(nameInput)}
            />
            <button type="button" onClick={() => setNameFilter(nameInput)}>
              <Search size={12} strokeWidth={2.5} /> Search
            </button>
            {nameFilter && (
              <button
                type="button"
                className="wt-btn-ghost"
                onClick={() => { setNameFilter(""); setNameInput(""); }}
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            )}
          </div>
          <div className="wt-filter-search">
            <input
              type="text"
              placeholder="Filter by date e.g. 02/18/2026…"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setDateFilter(dateInput)}
            />
            <button type="button" onClick={() => setDateFilter(dateInput)}>
              <Calendar size={12} strokeWidth={2.5} /> Date
            </button>
            {dateFilter && (
              <button
                type="button"
                className="wt-btn-ghost"
                onClick={() => { setDateFilter(""); setDateInput(""); }}
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        <div className="wt-actions">
          <button type="button" className="wt-btn" onClick={onBackToModuleNavigator}>
            <ChevronLeft size={14} strokeWidth={2.5} /> Back
          </button>
          <button
            type="button"
            className="wt-btn"
            onClick={() => { fetchApi(); reloadDbRows(); loadGlobalUsers(); }}
            disabled={isLoading}
          >
            <RefreshCw
              size={14} strokeWidth={2.5}
              className={isLoading ? "wt-spin" : ""}
            />
            {isLoading ? "Syncing…" : "Refresh"}
          </button>
          <div className="wt-status-bar">
            {isLoading
              ? "⏳ Syncing records from API…"
              : `${filteredRows.length} record${filteredRows.length !== 1 ? "s" : ""} · ${steps.length} steps · ${allGlobalUsers.length} users`}
          </div>
        </div>

        {error && <div className="wt-error">{error}</div>}

        <div className="wt-table-wrap">
          <table className="wt-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Hospital No.</th>
                <th>Patient Name</th>
                <th>Encounter</th>
                <th>Admitted</th>
                <th>Discharged</th>
                <th>Remaining</th>
                <th>Progress</th>
                {steps.map((step, i) => (
                  <th key={step.id} className="wt-th-step">
                    <span className="wt-step-num">{i + 1}</span>
                    {step.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && !filteredRows.length ? (
                <tr>
                  <td colSpan={8 + steps.length} className="wt-td-center">
                    ⏳ Loading records…
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                viewMode === "queue"
                  ? <EmptyQueue isSuperUser={isSuperUser} />
                  : (
                    <tr>
                      <td colSpan={8 + steps.length} className="wt-td-center">
                        No {encounterFilter || ""} records found.
                      </td>
                    </tr>
                  )
              ) : (
                paginatedRows.map((row, idx) => {
                  const prog = calcProgress(row);
                  const rem  = row.remainingDays;
                  return (
                    <tr key={row.encoCode}>
                      <td className="wt-td-num">
                        {(currentPage - 1) * ROWS_PER_PAGE + idx + 1}
                      </td>
                      <td>
                        <span className="wt-hosp-no">{row.hospitalNo}</span>
                      </td>
                      <td>
                        <span className="wt-patient-name">{row.patientName}</span>
                      </td>
                      <td>
                        <span
                          className={`wt-encounter-badge wt-encounter-badge--${row.encounterType.toLowerCase()}`}
                        >
                          {row.encounterType || "—"}
                        </span>
                      </td>
                      <td className="wt-td-date">{row.admittedDate}</td>
                      <td className="wt-td-date">{row.dischargedDate}</td>
                      <td
                        className={
                          rem !== null && rem <= 10 ? "wt-td-urgent" : "wt-td-date"
                        }
                      >
                        {rem !== null ? `${rem}d` : "—"}
                      </td>
                      <td className="wt-td-progress">
                        <div className="wt-progress-label">{prog}%</div>
                        <div className="wt-progress-bar">
                          <div
                            className="wt-progress-fill"
                            style={{ width: `${prog}%` }}
                          />
                        </div>
                      </td>
                      {steps.map((step) => {
                        const chipData = resolveChip(row, step);
                        const { chipStatus, label, editable, routed, isClickable } = chipData;
                        const { status } = getStepStatus(row, step);
                        const completionDetails = status === "done" ? getStepCompletionDetails(row, step) : null;
                        return (
                          <td key={step.id} className="wt-td-step">
                            <StepChipWithDetails
                              status={chipStatus}
                              label={label}
                              editable={isClickable}
                              routed={routed}
                              completionDetails={completionDetails}
                              onClick={() => {
                                if (status === "done") openViewModal(row, step);
                                else if (editable)    openProcessModal(row, step);
                              }}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredRows.length > ROWS_PER_PAGE && (
          <div className="wt-pagination">
            <button
              type="button"
              className="wt-btn"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ← Prev
            </button>
            <span className="wt-page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="wt-btn"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </main>

      {modal?.type === "process" && (
        <ProcessModal
          record={modal.record}
          step={modal.step}
          stepHistory={modal.history}
          onClose={() => setModal(null)}
          onDone={handleProcessDone}
        />
      )}

      {modal?.type === "route" && (
        <RouteModal
          record={modal.record}
          step={modal.step}
          remarks={modal.remarks}
          allGlobalUsers={allGlobalUsers}
          steps={steps}
          currentUserId={currentUserId}
          onClose={() => setModal(null)}
          onConfirm={handleConfirmRoute}
        />
      )}

      {modal?.type === "view" && (
        <ViewHistoryModal
          record={modal.record}
          step={modal.step}
          stepHistory={modal.history}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}