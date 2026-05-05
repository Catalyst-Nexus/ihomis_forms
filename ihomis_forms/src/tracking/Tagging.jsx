/**
 * Tagging.jsx — User-based access control via tagging order [FIXED v3]
 *
 * KEY FIX: 
 * - No FK constraint checks
 * - No user table syncing
 * - Direct inserts to tracking_user_assignment
 * - Works with API users directly
 *
 * DB schema:
 *   tracking:                  id | tracking_encocode | encounter_type | ...
 *   tracking_user_assignment:  id | tracking_id | user_id | tag_order
 *   user_seq_assignment:       id | user_id | seq_id
 *   tracking_sequence:         id | description | sort_order
 *
 * Access rules:
 *   tag_order 1  → full access (all steps)
 *   tag_order 2  → only steps in user_seq_assignment for their user_id
 *   tag_order 3  → steps NOT in user_seq_assignment for the tag-order-2 user
 *   tag_order 4+ → can be extended with same "remaining" logic
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./Tagging.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

function normalizeUser(u, i) {
  const id    = String(u?.user_id ?? u?.id ?? u?.userId ?? u?.uid ?? u?.email ?? i);
  const label = u?.full_name ?? u?.displayName ?? u?.fullName ?? u?.name
             ?? u?.username ?? u?.email ?? id;
  return { id, label, raw: u };
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);
  return { toasts, push };
}

const TAG_CFG = {
  1: { color: "#0f7a6e", bg: "#e0f5f2", label: "1st tag — full access"        },
  2: { color: "#1a5ea8", bg: "#e2eef9", label: "2nd tag — assigned steps only" },
  3: { color: "#8a4f0b", bg: "#faebd5", label: "3rd tag — remaining steps"     },
  4: { color: "#6b3a8a", bg: "#f0e8f7", label: "4th tag — remaining steps"     },
};
function tagCfg(order) {
  return TAG_CFG[order] ?? { color: "#555", bg: "#f0f0f0", label: `#${order} tag` };
}

// ── Access Gate Component ─────────────────────────────────────────────────────
function AccessDenied({ userName, onBack }) {
  return (
    <div className="tg-page">
      <main className="tg-shell">
        <header className="tg-header">
          <div className="tg-header-text">
            <h1>Agusan del Norte Provincial Health Office</h1>
            <p>CHART Tagging System</p>
          </div>
          {userName && (
            <div className="tg-session-pill">
              <span className="tg-session-dot" />
              {userName}
            </div>
          )}
        </header>
        <nav className="tg-nav">
          <button className="tg-btn tg-btn--ghost" onClick={onBack}>
            ← Back to Tracking
          </button>
        </nav>
        <div className="tg-panel" style={{ textAlign: "center", padding: "3rem 2rem" }}>
          <div style={{
            display:        "inline-flex",
            flexDirection:  "column",
            alignItems:     "center",
            gap:            "1rem",
            background:     "#faebd5",
            border:         "1.5px solid #e8c97e",
            borderRadius:   "1rem",
            padding:        "2.5rem 3rem",
            maxWidth:       "480px",
          }}>
            <span style={{ fontSize: "2.5rem" }}>🔒</span>
            <h2 style={{ margin: 0, color: "#8a4f0b", fontSize: "1.2rem" }}>
              No Access Yet
            </h2>
            <p style={{ margin: 0, color: "#7a5c2e", fontSize: ".95rem", lineHeight: 1.6 }}>
              You do not have any assigned steps yet.
              Please wait for an administrator to assign steps to your account
              before you can access this panel.
            </p>
            <p style={{ margin: 0, color: "#aaa", fontSize: ".8rem" }}>
              Logged in as: <strong style={{ color: "#8a4f0b" }}>{userName}</strong>
            </p>
            <button
              className="tg-btn tg-btn--ghost"
              onClick={onBack}
              style={{ marginTop: ".5rem" }}
            >
              ← Go Back
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
export default function Tagging({
  selectedPatient,
  trackingRows = [],
  onBackToTracking,
  currentUserId,
  currentUserName,
  onAccessChanged,
}) {
  const { toasts, push } = useToast();

  // ── Access check state ────────────────────────────────────────────────────
  const [accessStatus, setAccessStatus] = useState("checking"); // "checking" | "allowed" | "denied"

  // ── Init ──────────────────────────────────────────────────────────────────
  const [initComplete,     setInitComplete]     = useState(false);
  const [initError,        setInitError]        = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      setInitError("");
      setInitComplete(false);
      setSelectedRecordId("");
      setAccessStatus("checking");

      if (!trackingRows.length) { setInitComplete(true); setAccessStatus("allowed"); return; }

      const errors  = [];
      let   firstId = "";

      for (const row of trackingRows) {
        if (!live) break;
        const encoCode      = row.encoCode || row.tracking_encocode || row.id;
        const encounterType = row.encounterType || row.encounter_type || "";
        if (!encoCode) continue;

        try {
          const { error: upsertErr } = await supabase
            .from("tracking")
            .upsert(
              {
                tracking_encocode: String(encoCode),
                encounter_type:    String(encounterType),
                is_current:        true,
                created_by:        String(
                  selectedPatient?.id ?? selectedPatient?.patient_id ?? "TAGGING_INIT"
                ),
              },
              { onConflict: "tracking_encocode", ignoreDuplicates: true }
            );

          if (upsertErr) {
            errors.push(`Upsert failed for ${encoCode}: ${upsertErr.message}`);
            continue;
          }

          const { data: fetched, error: fetchErr } = await supabase
            .from("tracking")
            .select("id")
            .eq("tracking_encocode", String(encoCode))
            .single();

          if (fetchErr || !fetched?.id) {
            errors.push(`Fetch id failed for ${encoCode}: ${fetchErr?.message ?? "no row"}`);
            continue;
          }

          row.id = fetched.id;
          if (!firstId) firstId = String(fetched.id);
        } catch (e) {
          errors.push(`Exception for ${encoCode}: ${e.message}`);
        }
      }

      if (!live) return;
      if (errors.length) setInitError(errors.join(" | "));
      if (firstId) setSelectedRecordId(firstId);
      setInitComplete(true);
    })();
    return () => { live = false; };
  }, [trackingRows, selectedPatient]);

  // ── Steps ──────────────────────────────────────────────────────────────────
  const [steps,        setSteps]        = useState([]);
  const [stepsLoading, setStepsLoading] = useState(true);

  useEffect(() => {
    let live = true;
    (async () => {
      setStepsLoading(true);
      const { data, error } = await supabase
        .from("tracking_sequence")
        .select("id, description, sort_order")
        .order("sort_order", { ascending: true });
      if (live && !error && data?.length)
        setSteps(data.map((r) => ({ id: r.id, key: String(r.id), label: r.description })));
      if (live) setStepsLoading(false);
    })();
    return () => { live = false; };
  }, []);

  // ── Users ──────────────────────────────────────────────────────────────────
  const [users,      setUsers]      = useState([]);
  const [usersState, setUsersState] = useState("idle");
  const [usersError, setUsersError] = useState("");

  const fetchUsers = useCallback(async () => {
    const url = import.meta.env.VITE_TRACKING_USERS;
    if (!url) { setUsersState("error"); setUsersError("VITE_TRACKING_USERS not set."); return; }
    setUsersState("loading"); setUsersError("");
    try {
      const res  = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw  = await res.json();
      const list = Array.isArray(raw) ? raw
        : Array.isArray(raw?.data)  ? raw.data
        : Array.isArray(raw?.users) ? raw.users : [];
      setUsers(list.map(normalizeUser));
      setUsersState("idle");
    } catch (e) {
      setUsersState("error"); setUsersError(e.message);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Tagged users ───────────────────────────────────────────────────────────
  const [taggedUsers, setTaggedUsers] = useState([]);

  const fetchTaggedUsers = useCallback(async () => {
    if (!selectedRecordId) { setTaggedUsers([]); return; }
    const { data, error } = await supabase
      .from("tracking_user_assignment")
      .select("id, user_id, tag_order")
      .eq("tracking_id", parseInt(selectedRecordId, 10))
      .order("tag_order", { ascending: true });
    if (error) { console.error("fetchTaggedUsers:", error.message); return; }
    setTaggedUsers((data ?? []).map((r) => ({
      rowId: r.id, userId: String(r.user_id), tagOrder: r.tag_order,
    })));
  }, [selectedRecordId]);

  useEffect(() => { fetchTaggedUsers(); }, [fetchTaggedUsers]);

  // ── Step assignments ───────────────────────────────────────────────────────
  const [stepAssign, setStepAssign] = useState({});

  const fetchStepAssign = useCallback(async () => {
    if (!taggedUsers.length) { setStepAssign({}); return; }
    const { data, error } = await supabase
      .from("user_seq_assignment")
      .select("id, user_id, seq_id")
      .in("user_id", taggedUsers.map((u) => u.userId));
    if (error) { console.error("fetchStepAssign:", error.message); return; }
    const map = {};
    for (const row of data ?? []) {
      map[String(row.seq_id)] = {
        rowId:    row.id,
        userId:   String(row.user_id),
        userName: users.find((u) => u.id === String(row.user_id))?.label ?? String(row.user_id),
      };
    }
    setStepAssign(map);
  }, [taggedUsers, users]);

  useEffect(() => { fetchStepAssign(); }, [fetchStepAssign]);

  // ── ACCESS CHECK: runs after taggedUsers + stepAssign are loaded ───────────
  useEffect(() => {
    // Still loading — wait
    if (!initComplete || stepsLoading) return;

    // If currentUserId is not set, allow (admin/no-auth mode)
    if (!currentUserId) { setAccessStatus("allowed"); return; }

    // Find if current user is tagged on this record
    const myTag = taggedUsers.find((u) => u.userId === String(currentUserId));

    // Not tagged at all → allowed (they might be the admin adding users)
    // You can change this to "denied" if you want untagged users blocked too
    if (!myTag) { setAccessStatus("allowed"); return; }

    // 1st tagged user → full access always
    if (myTag.tagOrder === 1) { setAccessStatus("allowed"); return; }

    // 2nd/3rd/4th tagged user → only allowed if they have at least 1 assigned step
    const mySteps = Object.values(stepAssign).filter(
      (s) => s.userId === String(currentUserId)
    );

    if (mySteps.length > 0) {
      setAccessStatus("allowed");
    } else {
      setAccessStatus("denied");
    }
  }, [initComplete, stepsLoading, taggedUsers, stepAssign, currentUserId]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const assignableUsers = useMemo(
    () => taggedUsers.filter((u) => u.tagOrder >= 2),
    [taggedUsers]
  );

  const stepsEnabled = assignableUsers.length > 0;

  const accessByUser = useMemo(() => {
    if (!steps.length) return {};
    const assignedKeys = new Set(Object.keys(stepAssign));
    const byUser2 = {};
    for (const [k, v] of Object.entries(stepAssign)) {
      if (!byUser2[v.userId]) byUser2[v.userId] = new Set();
      byUser2[v.userId].add(k);
    }
    const result = {};
    for (const tu of taggedUsers) {
      if (tu.tagOrder === 1) {
        result[tu.userId] = steps.map((s) => s.label);
      } else if (byUser2[tu.userId]?.size) {
        result[tu.userId] = steps
          .filter((s) => byUser2[tu.userId].has(s.key))
          .map((s) => s.label);
      } else {
        result[tu.userId] = steps
          .filter((s) => !assignedKeys.has(s.key))
          .map((s) => s.label);
      }
    }
    return result;
  }, [taggedUsers, steps, stepAssign]);

  // ── Drafts ─────────────────────────────────────────────────────────────────
  const [drafts,      setDrafts]      = useState({});
  const [saving,      setSaving]      = useState({});
  const [pendingUser, setPendingUser] = useState("");
  const prevRecordIdRef = useRef(selectedRecordId);

  useEffect(() => {
    if (prevRecordIdRef.current !== selectedRecordId) {
      prevRecordIdRef.current = selectedRecordId;
      setDrafts({});
      setSaving({});
    }
  }, [selectedRecordId]);

  const canAddUser      = taggedUsers.length < 4;
  const taggingDisabled = !selectedRecordId || usersState === "loading" || !users.length || !initComplete;
  const unusedUsers     = users.filter((u) => !taggedUsers.some((t) => t.userId === u.id));

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleAddUser() {
    if (!selectedRecordId || !pendingUser) return;
    if (taggedUsers.some((u) => u.userId === pendingUser)) {
      push("User already tagged.", "info"); return;
    }
    if (!canAddUser) { push("Maximum users reached.", "info"); return; }

    const trackingIdInt = parseInt(selectedRecordId, 10);
    if (isNaN(trackingIdInt)) { push("Invalid tracking record. Please refresh.", "error"); return; }

    const { data: exists, error: chkErr } = await supabase
      .from("tracking").select("id").eq("id", trackingIdInt).maybeSingle();
    if (chkErr || !exists) {
      push("Tracking record not found in DB. Try refreshing.", "error"); return;
    }

    const { data: existing } = await supabase
      .from("tracking_user_assignment")
      .select("tag_order")
      .eq("tracking_id", trackingIdInt)
      .order("tag_order", { ascending: false })
      .limit(1);
    const maxOrder = existing?.[0]?.tag_order ?? 0;
    const newOrder = maxOrder + 1;

    const { data, error } = await supabase
      .from("tracking_user_assignment")
      .insert({ tracking_id: trackingIdInt, user_id: pendingUser, tag_order: newOrder })
      .select("id")
      .single();

    if (error) { push(`Error: ${error.message}`, "error"); return; }

    setTaggedUsers((prev) => [
      ...prev,
      { rowId: data.id, userId: pendingUser, tagOrder: newOrder },
    ]);

    const uLabel = users.find((u) => u.id === pendingUser)?.label ?? pendingUser;
    push(`Tagged ${uLabel} as #${newOrder} — ${tagCfg(newOrder).label}`);
    setPendingUser("");
    onAccessChanged?.();
  }

  async function handleRemoveUser(rowId, userId, tagOrder) {
    const { error } = await supabase
      .from("tracking_user_assignment").delete().eq("id", rowId);
    if (error) { push(`Error: ${error.message}`, "error"); return; }

    setTaggedUsers((p) => p.filter((u) => u.rowId !== rowId));

    await supabase.from("user_seq_assignment").delete().eq("user_id", userId);
    setStepAssign((p) => {
      const n = { ...p };
      for (const k of Object.keys(n)) if (n[k].userId === userId) delete n[k];
      return n;
    });

    const uLabel = users.find((u) => u.id === userId)?.label ?? userId;
    push(`Removed ${uLabel} (tag #${tagOrder}).`, "info");
    onAccessChanged?.();
  }

  async function handleAssignStep(step, userId) {
    if (!userId) { push("Select a user for this step first.", "info"); return; }

    const tu = taggedUsers.find((u) => u.userId === userId);
    if (!tu) { push("User not tagged on this record.", "info"); return; }
    if (tu.tagOrder === 1) { push("1st user already has full access to all steps.", "info"); return; }

    const existing = stepAssign[step.key];
    setSaving((p) => ({ ...p, [step.key]: true }));

    let error = null, returnedId = existing?.rowId ?? null;
    if (existing?.rowId) {
      ({ error } = await supabase
        .from("user_seq_assignment")
        .update({ user_id: userId })
        .eq("id", existing.rowId));
    } else {
      const { data, error: e } = await supabase
        .from("user_seq_assignment")
        .insert({ user_id: userId, seq_id: step.id })
        .select("id").single();
      error = e; returnedId = data?.id ?? null;
    }

    setSaving((p) => ({ ...p, [step.key]: false }));
    if (error) { push(`Error: ${error.message}`, "error"); return; }

    const uLabel = users.find((u) => u.id === userId)?.label ?? userId;
    setStepAssign((p) => ({ ...p, [step.key]: { rowId: returnedId, userId, userName: uLabel } }));
    setDrafts((p) => { const n = { ...p }; delete n[step.key]; return n; });
    push(`Assigned "${step.label}" → ${uLabel}`);
    onAccessChanged?.();
  }

  async function handleClearStep(step) {
    const existing = stepAssign[step.key];
    if (!existing?.rowId) return;
    setSaving((p) => ({ ...p, [step.key]: true }));
    const { error } = await supabase
      .from("user_seq_assignment").delete().eq("id", existing.rowId);
    setSaving((p) => ({ ...p, [step.key]: false }));
    if (error) { push(`Error: ${error.message}`, "error"); return; }
    setStepAssign((p) => { const n = { ...p }; delete n[step.key]; return n; });
    setDrafts((p) => { const n = { ...p }; delete n[step.key]; return n; });
    push(`Cleared "${step.label}"`, "info");
    onAccessChanged?.();
  }

  const selectedRecord = trackingRows.find((r) => String(r.id) === selectedRecordId);

  // ── Access gate: show loading while checking ───────────────────────────────
  if (accessStatus === "checking") {
    return (
      <div className="tg-page">
        <main className="tg-shell">
          <header className="tg-header">
            <div className="tg-header-text">
              <h1>Agusan del Norte Provincial Health Office</h1>
              <p>CHART Tagging System</p>
            </div>
          </header>
          <div className="tg-panel" style={{ textAlign: "center", padding: "3rem" }}>
            <span className="tg-spinner" /> Checking access…
          </div>
        </main>
      </div>
    );
  }

  // ── Access gate: denied ────────────────────────────────────────────────────
  if (accessStatus === "denied") {
    return (
      <AccessDenied
        userName={currentUserName}
        onBack={onBackToTracking}
      />
    );
  }

  // ── Normal render (accessStatus === "allowed") ────────────────────────────
  return (
    <div className="tg-page">
      <div className="tg-toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`tg-toast tg-toast--${t.type}`}>{t.msg}</div>
        ))}
      </div>

      <main className="tg-shell">
        <header className="tg-header">
          <div className="tg-header-text">
            <h1>Agusan del Norte Provincial Health Office</h1>
            <p>CHART Tagging System</p>
          </div>
          {currentUserName && (
            <div className="tg-session-pill">
              <span className="tg-session-dot" />
              {currentUserName}
            </div>
          )}
        </header>

        <nav className="tg-nav">
          <button className="tg-btn tg-btn--ghost" onClick={onBackToTracking}>
            ← Back to Tracking
          </button>
        </nav>

        <div className="tg-panel">
          <div className="tg-panel-topbar">
            <div>
              <h2 className="tg-panel-title">Tagging Panel</h2>
              <p className="tg-panel-sub">Assign users to records and workflow steps.</p>
            </div>
            <div className="tg-users-status">
              {usersState === "loading" && <span className="tg-spinner" />}
              {usersState === "error"   && <span className="tg-err-text">{usersError}</span>}
              {usersState === "idle"    && <span className="tg-count">{users.length} users loaded</span>}
              <button className="tg-btn tg-btn--sm" onClick={fetchUsers}>↺ Refresh</button>
            </div>
          </div>

          {!initComplete && (
            <div className="tg-notice" style={{ background: "#f0f9f8", borderColor: "rgba(31,157,149,.3)", color: "#0f7a6e" }}>
              ⏳ Initializing records…
            </div>
          )}
          {initError && (
            <div className="tg-notice tg-notice--error">⚠️ {initError}</div>
          )}

          {selectedRecord && initComplete && (
            <>
              {/* ── USER TAGGING ORDER ─────────────────────────────────── */}
              <div className="tg-section">
                <p className="tg-section-cap">USER TAGGING ORDER</p>
                <p className="tg-section-desc">
                  The 1st tagged user gets full access to all steps.
                  Tag more users to restrict their access to specific steps.
                </p>

                {taggedUsers.length > 0 && (
                  <div className="tg-user-list">
                    {taggedUsers.map((tu) => {
                      const cfg       = tagCfg(tu.tagOrder);
                      const uName     = users.find((u) => u.id === tu.userId)?.label ?? tu.userId;
                      const stepCount = Object.values(stepAssign).filter((s) => s.userId === tu.userId).length;
                      return (
                        <div key={tu.rowId} className="tg-user-row">
                          <span className="tg-order-badge" style={{ color: cfg.color, background: cfg.bg }}>
                            #{tu.tagOrder}
                          </span>
                          <span className="tg-user-name">{uName}</span>
                          <span className="tg-user-role">{cfg.label}</span>
                          {tu.tagOrder === 1
                            ? <span className="tg-step-count-pill tg-step-count-pill--full">All {steps.length} steps</span>
                            : <span className="tg-step-count-pill">{stepCount} step{stepCount !== 1 ? "s" : ""} assigned</span>
                          }
                          <button
                            className="tg-remove-btn"
                            onClick={() => handleRemoveUser(tu.rowId, tu.userId, tu.tagOrder)}
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {canAddUser && (
                  <div className="tg-add-row">
                    <select
                      className="tg-select tg-select--flex"
                      value={pendingUser}
                      onChange={(e) => setPendingUser(e.target.value)}
                      disabled={taggingDisabled}
                    >
                      <option value="">+ Add user…</option>
                      {unusedUsers.map((u) => (
                        <option key={u.id} value={u.id}>{u.label}</option>
                      ))}
                    </select>
                    <button
                      className="tg-btn tg-btn--primary"
                      onClick={handleAddUser}
                      disabled={!pendingUser || taggingDisabled}
                    >
                      Add
                    </button>
                  </div>
                )}

                {!canAddUser && (
                  <p className="tg-notice tg-notice--success">✓ Maximum users tagged for this record.</p>
                )}
              </div>

              {/* ── STEP ASSIGNMENTS ───────────────────────────────────── */}
              <div className="tg-section">
                <p className="tg-section-cap">STEP ASSIGNMENTS</p>
                <p className="tg-section-desc">
                  {stepsEnabled
                    ? "Select a user in each step's dropdown, then click Assign."
                    : taggedUsers.length === 0
                      ? "Tag at least one user above to begin."
                      : "Add a 2nd user above — the 1st user already has full access to all steps."}
                </p>

                {!stepsEnabled && taggedUsers.length > 0 && (
                  <div className="tg-notice tg-notice--hint">
                    💡 Tag a 2nd user above to start assigning specific steps to them.
                  </div>
                )}

                {stepsLoading ? (
                  <p className="tg-loading">Loading steps…</p>
                ) : (
                  <div className="tg-step-grid">
                    {steps.map((step, idx) => {
                      const assigned  = stepAssign[step.key];
                      const isSaving  = saving[step.key] ?? false;
                      const draftVal  = drafts[step.key] ?? assigned?.userId ?? "";
                      const assignedTu  = assigned
                        ? taggedUsers.find((u) => u.userId === assigned.userId)
                        : null;
                      const assignedCfg = assignedTu ? tagCfg(assignedTu.tagOrder) : null;
                      const canAssign = stepsEnabled
                        && !isSaving
                        && !!draftVal
                        && draftVal !== (assigned?.userId ?? "");

                      return (
                        <div
                          key={step.key}
                          className={`tg-step-card ${assigned ? "tg-step-card--assigned" : "tg-step-card--remaining"}`}
                          style={assigned && assignedCfg ? {
                            borderColor: assignedCfg.color + "44",
                            background:  `linear-gradient(160deg, #fff 55%, ${assignedCfg.bg} 100%)`,
                          } : {}}
                        >
                          <div className="tg-step-head">
                            <span className="tg-step-name">{step.label}</span>
                            <span className="tg-step-num">Step {idx + 1}</span>
                          </div>

                          <div className="tg-step-badge-wrap">
                            {assigned ? (
                              <span className="tg-step-badge" style={{ background: assignedCfg?.bg, color: assignedCfg?.color }}>
                                {assigned.userName}
                              </span>
                            ) : (
                              <span className="tg-step-badge tg-step-badge--none">Unassigned</span>
                            )}
                          </div>

                          <select
                            className="tg-step-dropdown"
                            value={draftVal}
                            disabled={isSaving || !stepsEnabled}
                            onChange={(e) =>
                              setDrafts((p) => ({ ...p, [step.key]: e.target.value }))
                            }
                          >
                            <option value="">— Select user —</option>
                            {assignableUsers.map((tu) => {
                              const uLabel = users.find((u) => u.id === tu.userId)?.label ?? tu.userId;
                              return (
                                <option key={tu.userId} value={tu.userId}>
                                  #{tu.tagOrder} {uLabel}
                                </option>
                              );
                            })}
                          </select>

                          <div className="tg-step-owner">
                            {assignedTu ? (
                              <span className="tg-chip" style={{ background: assignedCfg?.bg, color: assignedCfg?.color }}>
                                #{assignedTu.tagOrder} — {assignedTu.tagOrder === 2 ? "assigned" : "remaining"}
                              </span>
                            ) : (
                              <span className="tg-chip tg-chip--amber">Unassigned (remaining)</span>
                            )}
                          </div>

                          <div className="tg-step-actions">
                            <button
                              className="tg-btn tg-btn--assign"
                              disabled={!canAssign}
                              onClick={() => handleAssignStep(step, draftVal)}
                            >
                              {isSaving ? "Saving…" : "Assign"}
                            </button>
                            <button
                              className="tg-btn tg-btn--clear"
                              disabled={!assigned || isSaving}
                              onClick={() => handleClearStep(step)}
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── ACCESS SUMMARY ─────────────────────────────────────── */}
              {taggedUsers.length > 0 && !stepsLoading && (
                <div className="tg-section">
                  <p className="tg-section-cap">ACCESS SUMMARY</p>
                  <p className="tg-section-desc">Overview of what each tagged user can access.</p>
                  <div className="tg-summary">
                    {taggedUsers.map((tu) => {
                      const cfg     = tagCfg(tu.tagOrder);
                      const uName   = users.find((u) => u.id === tu.userId)?.label ?? tu.userId;
                      const mySteps = accessByUser[tu.userId] ?? [];
                      return (
                        <div
                          key={tu.rowId}
                          className="tg-summary-row"
                          style={{ "--row-accent": cfg.color, "--row-bg": cfg.bg }}
                        >
                          <div className="tg-summary-meta">
                            <div style={{ display: "flex", alignItems: "center", gap: ".45rem" }}>
                              <span
                                className="tg-order-badge"
                                style={{ color: cfg.color, background: cfg.bg, fontSize: ".65rem" }}
                              >
                                #{tu.tagOrder}
                              </span>
                              <strong className="tg-summary-name">{uName}</strong>
                            </div>
                            <span className="tg-summary-role" style={{ color: cfg.color }}>
                              {cfg.label}
                            </span>
                          </div>
                          <div className="tg-summary-chips">
                            {mySteps.length > 0
                              ? mySteps.map((l) => (
                                  <span
                                    key={l}
                                    className="tg-chip"
                                    style={{ background: cfg.bg, color: cfg.color, opacity: .85 }}
                                  >
                                    {l}
                                  </span>
                                ))
                              : <span className="tg-chip tg-chip--empty">No steps assigned yet</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {!selectedRecord && initComplete && trackingRows.length > 0 && (
            <div className="tg-notice" style={{ color: "#8a4f0b", background: "#faebd5" }}>
              ⚠️ Could not match a tracking record. Try refreshing the page.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}