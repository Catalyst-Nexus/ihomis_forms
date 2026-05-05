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

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./Tagging.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

// ── Helpers ───────────────────────────────────────────────────────────────────
function normalizeUser(u, i) {
  const id    = String(u?.user_id ?? u?.id ?? u?.userId ?? u?.uid ?? u?.email ?? i);
  const label = u?.full_name ?? u?.displayName ?? u?.fullName ?? u?.name ?? u?.username ?? u?.email ?? id;
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

// Tag order visual config — extendable
const TAG_CFG = {
  1: { color: "#0f7a6e", bg: "#e0f5f2", label: "1st tag — full access"         },
  2: { color: "#1a5ea8", bg: "#e2eef9", label: "2nd tag — assigned steps only"  },
  3: { color: "#8a4f0b", bg: "#faebd5", label: "3rd tag — remaining steps"      },
  4: { color: "#6b3a8a", bg: "#f0e8f7", label: "4th tag — remaining steps"      },
};
function tagCfg(order) {
  return TAG_CFG[order] ?? { color: "#555", bg: "#f0f0f0", label: `#${order} tag` };
}

// ════════════════════════════════════════════════════════════════════════════
export default function Tagging({
  selectedPatient,
  trackingRows = [],
  onBackToTracking,
  onChangePatient,
  currentUserId,
  currentUserName,
  onAccessChanged,
}) {
  // ── Init state ─────────────────────────────────────────────────────────────
  const [initComplete, setInitComplete] = useState(false);
  const [initError, setInitError] = useState("");

  // ── 0. INITIALIZE: Ensure all records exist in DB ──────────────────────────
  useEffect(() => {
    let live = true;
    (async () => {
      setInitError("");
      if (!trackingRows.length) {
        setInitComplete(true);
        return;
      }

      const errors = [];
      for (const row of trackingRows) {
        if (!live) break;

        const encoCode = row.encoCode || row.tracking_encocode || row.id;
        if (!encoCode) continue;

        const encounterType = row.encounterType || row.encounter_type || "";

        try {
          const { data: upserted, error: upErr } = await supabase
            .from("tracking")
            .upsert(
              {
                tracking_encocode: String(encoCode),
                encounter_type: String(encounterType),
                is_current: true,
                created_by: String(selectedPatient?.id ?? selectedPatient?.patient_id ?? "TAGGING_INIT"),
              },
              { onConflict: "tracking_encocode" }
            )
            .select("id")
            .single();

          if (upErr) {
            errors.push(`Upsert tracking failed for ${encoCode}: ${upErr.message}`);
            continue;
          }

          if (upserted?.id && !row.id) {
            row.id = upserted.id;
          }
        } catch (e) {
          errors.push(`Exception for ${encoCode}: ${e.message}`);
        }
      }

      if (!live) return;
      if (errors.length > 0) {
        setInitError(errors.join(" | "));
      }
      setInitComplete(true);
    })();

    return () => { live = false; };
  }, [trackingRows, selectedPatient]);

  // ── Record selector ────────────────────────────────────────────────────────
  const [selectedRecordId, setSelectedRecordId] = useState(() => {
    const withId = trackingRows.find(r => r.id);
    return withId ? String(withId.id) : String(trackingRows[0]?.id ?? "");
  });

  useEffect(() => {
    if (!trackingRows.length) { 
      setSelectedRecordId(""); 
      return; 
    }
    
    if (!trackingRows.some((r) => String(r.id) === selectedRecordId)) {
      const firstWithId = trackingRows.find(r => r.id);
      setSelectedRecordId(firstWithId ? String(firstWithId.id) : "");
    }
  }, [trackingRows, selectedRecordId]);

  // ── Steps (tracking_sequence) ──────────────────────────────────────────────
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
      if (live && !error && data?.length) {
        setSteps(data.map((r) => ({ id: r.id, key: String(r.id), label: r.description })));
      }
      if (live) setStepsLoading(false);
    })();
    return () => { live = false; };
  }, []);

  // ── Users (VITE_TRACKING_USERS) ────────────────────────────────────────────
  const [users,       setUsers]       = useState([]);
  const [usersState,  setUsersState]  = useState("idle"); // "idle"|"loading"|"error"
  const [usersError,  setUsersError]  = useState("");

  const fetchUsers = useCallback(async () => {
    const url = import.meta.env.VITE_TRACKING_USERS;
    if (!url) { setUsersState("error"); setUsersError("VITE_TRACKING_USERS not set."); return; }
    setUsersState("loading"); setUsersError("");
    try {
      const res  = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw  = await res.json();
      const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.users) ? raw.users : [];
      const normalized = list.map(normalizeUser);
      setUsers(normalized);
      setUsersState("idle");
    } catch (e) {
      setUsersState("error"); setUsersError(e.message);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Tagged users for selected record (tracking_user_assignment) ────────────
  const [taggedUsers, setTaggedUsers] = useState([]);

  const fetchTaggedUsers = useCallback(async () => {
    if (!selectedRecordId) { setTaggedUsers([]); return; }
    const { data, error } = await supabase
      .from("tracking_user_assignment")
      .select("id, user_id, tag_order")
      .eq("tracking_id", selectedRecordId)
      .order("tag_order", { ascending: true });
    if (error) { console.error("fetchTaggedUsers:", error.message); return; }
    setTaggedUsers((data ?? []).map((r) => ({
      rowId:    r.id,
      userId:   String(r.user_id),
      tagOrder: r.tag_order,
    })));
  }, [selectedRecordId]);

  useEffect(() => { fetchTaggedUsers(); }, [fetchTaggedUsers]);

  // ── Step assignments (user_seq_assignment) ──────────────────────────────────
  const [stepAssign, setStepAssign] = useState({});

  const fetchStepAssign = useCallback(async () => {
    if (!taggedUsers.length) { setStepAssign({}); return; }
    const allUserIds = taggedUsers.map((u) => u.userId);

    const { data, error } = await supabase
      .from("user_seq_assignment")
      .select("id, user_id, seq_id")
      .in("user_id", allUserIds);

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

  // ── Derived ────────────────────────────────────────────────────────────────
  const user2 = useMemo(() => taggedUsers.find((u) => u.tagOrder === 2), [taggedUsers]);

  const accessByUser = useMemo(() => {
    if (!steps.length) return {};
    const user2AssignedKeys = new Set(
      steps.filter((s) => stepAssign[s.key]?.userId === user2?.userId).map((s) => s.key)
    );

    const result = {};
    for (const tu of taggedUsers) {
      if (tu.tagOrder === 1) {
        result[tu.userId] = steps.map((s) => s.label);
      } else if (tu.tagOrder === 2) {
        result[tu.userId] = steps.filter((s) => user2AssignedKeys.has(s.key)).map((s) => s.label);
      } else {
        result[tu.userId] = steps.filter((s) => !user2AssignedKeys.has(s.key)).map((s) => s.label);
      }
    }
    return result;
  }, [taggedUsers, steps, stepAssign, user2]);

  const nextTagOrder    = taggedUsers.length > 0 ? Math.max(...taggedUsers.map((u) => u.tagOrder)) + 1 : 1;
  const canAddUser      = taggedUsers.length < 4;
  const taggingDisabled = !selectedRecordId || usersState === "loading" || !users.length || !initComplete;

  const [drafts,  setDrafts]  = useState({});
  const [saving,  setSaving]  = useState({});
  const [pendingUser, setPendingUser] = useState("");

  useEffect(() => { setDrafts({}); setSaving({}); }, [selectedRecordId]);

  const { toasts, push } = useToast();

  // ── Add user to record ─────────────────────────────────────────────────────
  // ✅ SIMPLE: Direct insert, no FK checks, no user table syncing
  async function handleAddUser() {
    if (!selectedRecordId || !pendingUser) return;
    if (taggedUsers.some((u) => u.userId === pendingUser)) { 
      push("User already tagged.", "info"); 
      return; 
    }
    if (!canAddUser) { 
      push("Maximum users reached.", "info"); 
      return; 
    }

    // ✅ Direct insert to tracking_user_assignment
    // NO FK validation, NO user table checks
    const { data, error } = await supabase
      .from("tracking_user_assignment")
      .insert({ 
        tracking_id: selectedRecordId, 
        user_id: pendingUser, 
        tag_order: nextTagOrder 
      })
      .select("id")
      .single();

    if (error) { 
      console.error("Insert error:", error);
      push(`Error: ${error.message}`, "error"); 
      return; 
    }
    
    setTaggedUsers((p) => [...p, { rowId: data.id, userId: pendingUser, tagOrder: nextTagOrder }]);
    const uLabel = users.find((u) => u.id === pendingUser)?.label ?? pendingUser;
    push(`Tagged ${uLabel} as #${nextTagOrder} — ${tagCfg(nextTagOrder).label}`);
    setPendingUser("");
    onAccessChanged?.();
  }

  // ── Remove tagged user ─────────────────────────────────────────────────────
  async function handleRemoveUser(rowId, userId, tagOrder) {
    const { error } = await supabase.from("tracking_user_assignment").delete().eq("id", rowId);
    if (error) { push(`Error: ${error.message}`, "error"); return; }

    setTaggedUsers((p) => p.filter((u) => u.rowId !== rowId));

    if (tagOrder === 2) {
      await supabase.from("user_seq_assignment").delete().eq("user_id", userId);
      setStepAssign({});
      setDrafts({});
    }

    const uLabel = users.find((u) => u.id === userId)?.label ?? userId;
    push(`Removed ${uLabel} (tag #${tagOrder}).`, "info");
    onAccessChanged?.();
  }

  // ── Assign step to user2 ───────────────────────────────────────────────────
  async function handleAssignStep(step) {
    const userId = drafts[step.key];
    if (!userId) return;
    if (!user2) { push("Add a 2nd-tagged user before assigning steps.", "info"); return; }
    if (userId !== user2.userId) { push("Only the 2nd-tagged user can be assigned steps.", "info"); return; }

    const existing = stepAssign[step.key];
    setSaving((p) => ({ ...p, [step.key]: true }));

    let error = null, returnedId = existing?.rowId ?? null;

    if (existing?.rowId) {
      ({ error } = await supabase.from("user_seq_assignment").update({ user_id: userId }).eq("id", existing.rowId));
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
    push(`Assigned ${step.label} → ${uLabel}`);
    onAccessChanged?.();
  }

  // ── Clear step assignment ──────────────────────────────────────────────────
  async function handleClearStep(step) {
    const existing = stepAssign[step.key];
    if (!existing?.rowId) return;
    setSaving((p) => ({ ...p, [step.key]: true }));
    const { error } = await supabase.from("user_seq_assignment").delete().eq("id", existing.rowId);
    setSaving((p) => ({ ...p, [step.key]: false }));
    if (error) { push(`Error: ${error.message}`, "error"); return; }
    setStepAssign((p) => { const n = { ...p }; delete n[step.key]; return n; });
    setDrafts((p) => { const n = { ...p }; delete n[step.key]; return n; });
    push(`Cleared ${step.label}`, "info");
    onAccessChanged?.();
  }

  const selectedRecord = trackingRows.find((r) => String(r.id) === selectedRecordId);
  const unusedUsers    = users.filter((u) => !taggedUsers.some((t) => t.userId === u.id));

  // ════════════════════════════════════════════════════════════════════════════
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
          <button className="tg-btn tg-btn--ghost" onClick={onBackToTracking}>← Back to Tracking</button>
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
            <div className="tg-notice tg-notice--error" style={{ background: "#fdf0f0", borderColor: "#e8c0c0", color: "#b03b3b" }}>
              Init warning: {initError}
            </div>
          )}

          {selectedRecord && initComplete && (
            <>
              <div className="tg-section">
                <p className="tg-section-cap">USER TAGGING ORDER</p>
                <p className="tg-section-desc">Tag users below. The order determines their access scope.</p>

                {taggedUsers.length > 0 && (
                  <div className="tg-user-list">
                    {taggedUsers.map((tu) => {
                      const cfg   = tagCfg(tu.tagOrder);
                      const uName = users.find((u) => u.id === tu.userId)?.label ?? tu.userId;
                      return (
                        <div key={tu.rowId} className="tg-user-row">
                          <span className="tg-order-badge" style={{ color: cfg.color, background: cfg.bg }}>
                            #{tu.tagOrder}
                          </span>
                          <span className="tg-user-name">{uName}</span>
                          <span className="tg-user-role">{cfg.label}</span>
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

              <div className="tg-section">
                <p className="tg-section-cap">STEP ASSIGNMENTS</p>
                <p className="tg-section-desc">
                  Assign steps to the 2nd-tagged user. User 3 automatically receives all unassigned steps.
                  {!user2 && <span className="tg-notice-inline"> — add a 2nd user above first</span>}
                </p>

                {stepsLoading ? (
                  <p className="tg-loading">Loading steps…</p>
                ) : (
                  <div className="tg-step-grid">
                    {steps.map((step, idx) => {
                      const assigned  = stepAssign[step.key];
                      const isSaving  = saving[step.key] ?? false;
                      const draftVal  = drafts[step.key] ?? assigned?.userId ?? "";
                      const isUser2   = !!assigned;

                      return (
                        <div key={step.key} className={`tg-step-card ${isUser2 ? "tg-step-card--assigned" : "tg-step-card--remaining"}`}>
                          <div className="tg-step-head">
                            <span className="tg-step-name">{step.label}</span>
                            <span className="tg-step-num">Step {idx + 1}</span>
                          </div>

                          <div className="tg-step-badge-wrap">
                            {assigned ? (
                              <span className="tg-step-badge tg-step-badge--user2">
                                {assigned.userName}
                              </span>
                            ) : (
                              <span className="tg-step-badge tg-step-badge--none">Unassigned</span>
                            )}
                          </div>

                          <select
                            className="tg-step-dropdown"
                            value={draftVal}
                            disabled={isSaving || !user2}
                            onChange={(e) => setDrafts((p) => ({ ...p, [step.key]: e.target.value }))}
                          >
                            <option value="">Unassigned</option>
                            {user2 && (() => {
                              const u2 = users.find((u) => u.id === user2.userId);
                              return u2 ? <option key={u2.id} value={u2.id}>{u2.label}</option> : null;
                            })()}
                          </select>

                          <div className="tg-step-owner">
                            {isUser2
                              ? <span className="tg-chip tg-chip--blue">2nd user</span>
                              : <span className="tg-chip tg-chip--amber">3rd user (remaining)</span>}
                          </div>

                          <div className="tg-step-actions">
                            <button
                              className="tg-btn tg-btn--assign"
                              disabled={!drafts[step.key] || isSaving || !user2}
                              onClick={() => handleAssignStep(step)}
                            >
                              {isSaving ? "…" : "Assign"}
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

              {taggedUsers.length > 0 && !stepsLoading && (
                <div className="tg-section">
                  <p className="tg-section-cap">ACCESS SUMMARY</p>
                  <div className="tg-summary">
                    {taggedUsers.map((tu) => {
                      const cfg    = tagCfg(tu.tagOrder);
                      const uName  = users.find((u) => u.id === tu.userId)?.label ?? tu.userId;
                      const steps_ = accessByUser[tu.userId] ?? [];
                      return (
                        <div key={tu.rowId} className="tg-summary-row" style={{ "--row-accent": cfg.color, "--row-bg": cfg.bg }}>
                          <div className="tg-summary-meta">
                            <strong className="tg-summary-name">{uName}</strong>
                            <span className="tg-summary-role" style={{ color: cfg.color }}>
                              {cfg.label}
                            </span>
                          </div>
                          <div className="tg-summary-chips">
                            {steps_.length > 0
                              ? steps_.map((l) => (
                                  <span key={l} className="tg-chip tg-chip--step">{l}</span>
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
        </div>
      </main>
    </div>
  );
}