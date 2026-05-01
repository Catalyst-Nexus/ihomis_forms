import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./Tagging.css";

// ── Supabase client (singleton) ──────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

// ── Helpers ───────────────────────────────────────────────────────────────────
function normalizeUser(user, index) {
  const id =
    user?.user_id ?? user?.id ?? user?.userId ?? user?.uid ??
    user?.username ?? user?.email ?? String(index);
  const label =
    user?.full_name ?? user?.displayName ?? user?.fullName ??
    user?.name ?? user?.username ?? user?.email ?? String(id);
  return { id: String(id), label, raw: user };
}

// ── Toast hook ────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  return { toasts, push };
}

// ════════════════════════════════════════════════════════════════════════════
export default function Tagging({
  selectedPatient,
  trackingRows = [],        // [{ id, patientName, hospitalNo, encoCode, … }]
  onBackToTracking,
  onChangePatient,
  onAssignTag,
  onClearTag,
}) {
  // ── Record selector ────────────────────────────────────────────────────────
  const [selectedRecordId, setSelectedRecordId] = useState(
    () => trackingRows[0]?.id ?? "",
  );

  useEffect(() => {
    if (!trackingRows.length) { setSelectedRecordId(""); return; }
    if (!trackingRows.some((r) => r.id === selectedRecordId)) {
      setSelectedRecordId(trackingRows[0].id);
    }
  }, [trackingRows, selectedRecordId]);

  // ── Steps from tracking_sequence ──────────────────────────────────────────
  const [steps,        setSteps]        = useState([]);
  const [stepsLoading, setStepsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStepsLoading(true);
      const { data, error } = await supabase
        .from("tracking_sequence")
        .select("id, description, sort_order")
        .order("sort_order", { ascending: true });
      if (!cancelled && !error && data?.length) {
        setSteps(data.map((r) => ({ key: String(r.id), label: r.description, seqId: r.id })));
      }
      if (!cancelled) setStepsLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Users from VITE_TRACKING_USERS ────────────────────────────────────────
  const [users,        setUsers]        = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError,   setUsersError]   = useState("");

  const fetchUsers = useCallback(async () => {
    const url = import.meta.env.VITE_TRACKING_USERS;
    if (!url) { setUsersError("VITE_TRACKING_USERS is not configured."); return; }
    setUsersLoading(true);
    setUsersError("");
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      const list = Array.isArray(raw) ? raw
        : Array.isArray(raw?.data)  ? raw.data
        : Array.isArray(raw?.users) ? raw.users
        : [];
      setUsers(list.map(normalizeUser));
    } catch (e) {
      setUsersError(`Failed to load users: ${e.message}`);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── user_seq_assignment: which user can do which step ─────────────────────
  // { seqId: [userId, …] }
  const [stepPermissions, setStepPermissions] = useState({});

  const fetchStepPermissions = useCallback(async () => {
    const { data } = await supabase
      .from("user_seq_assignment")
      .select("user_id, seq_id");
    if (!data) return;
    const map = {};
    for (const row of data) {
      const key = String(row.seq_id);
      if (!map[key]) map[key] = [];
      map[key].push(String(row.user_id));
    }
    setStepPermissions(map);
  }, []);

  useEffect(() => { fetchStepPermissions(); }, [fetchStepPermissions]);

  // ── tracking_user_assignment: who is assigned to this record ──────────────
  // { trackingId: [userId, …] }
  const [recordAssignments, setRecordAssignments] = useState({});

  const fetchRecordAssignments = useCallback(async () => {
    if (!selectedRecordId) return;
    const { data } = await supabase
      .from("tracking_user_assignment")
      .select("id, user_id")
      .eq("tracking_id", selectedRecordId);
    if (!data) return;
    setRecordAssignments((prev) => ({
      ...prev,
      [selectedRecordId]: data.map((r) => ({ id: r.id, userId: String(r.user_id) })),
    }));
  }, [selectedRecordId]);

  useEffect(() => { fetchRecordAssignments(); }, [fetchRecordAssignments]);

  // ── user_seq_assignment: step-level tag (per record) ──────────────────────
  // { recordId: { stepKey: { assignmentId, userId, userName } } }
  const [assignments, setAssignments] = useState({});
  const [drafts,      setDrafts]      = useState({});
  const [saving,      setSaving]      = useState({});

  const { toasts, push: pushToast } = useToast();

  // Load existing step assignments for this record
  useEffect(() => {
    if (!selectedRecordId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("user_seq_assignment")
        .select("id, user_id, seq_id")
        .eq("tracking_id", selectedRecordId);   // NOTE: user_seq_assignment must have tracking_id FK

      if (cancelled || !data) return;
      const loaded = {};
      for (const row of data) {
        const user = users.find((u) => String(u.id) === String(row.user_id));
        loaded[String(row.seq_id)] = {
          assignmentId: row.id,
          userId: String(row.user_id),
          userName: user?.label ?? String(row.user_id),
          seqId: row.seq_id,
        };
      }
      setAssignments((prev) => ({ ...prev, [selectedRecordId]: loaded }));
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRecordId, users]);

  const activeAssignments = assignments[selectedRecordId] ?? {};
  const activeDrafts      = drafts[selectedRecordId]      ?? {};
  const activeRecordUsers = recordAssignments[selectedRecordId] ?? [];
  const taggingDisabled   = !selectedRecordId || usersLoading || !users.length;

  // ── Helpers ────────────────────────────────────────────────────────────────
  function handleDraftChange(stepKey, userId) {
    if (!selectedRecordId) return;
    setDrafts((prev) => ({
      ...prev,
      [selectedRecordId]: { ...(prev[selectedRecordId] ?? {}), [stepKey]: userId },
    }));
  }

  // ── Assign tracking_user (record-level) ───────────────────────────────────
  async function handleAssignRecord(userId) {
    if (!selectedRecordId || !userId) return;
    const already = activeRecordUsers.some((a) => a.userId === userId);
    if (already) { pushToast("User already assigned to this record.", "info"); return; }

  const { data: check } = await supabase
    .from("tracking")
    .select("id")
    .eq("id", selectedRecordId)
      .maybeSingle();
     if (!check) {
    pushToast("Record not yet synced to database. Please refresh Tracking first.", "error");
    return;
  }

    if (error) { pushToast(`Error: ${error.message}`, "error"); return; }

    setRecordAssignments((prev) => ({
      ...prev,
      [selectedRecordId]: [
        ...(prev[selectedRecordId] ?? []),
        { id: data.id, userId },
      ],
    }));
    const user = users.find((u) => u.id === userId);
    pushToast(`Assigned ${user?.label ?? userId} to record.`);
  }

  async function handleRemoveRecord(assignmentId, userId) {
    const { error } = await supabase
      .from("tracking_user_assignment")
      .delete()
      .eq("id", assignmentId);
    if (error) { pushToast(`Error: ${error.message}`, "error"); return; }
    setRecordAssignments((prev) => ({
      ...prev,
      [selectedRecordId]: (prev[selectedRecordId] ?? []).filter((a) => a.id !== assignmentId),
    }));
    const user = users.find((u) => u.id === userId);
    pushToast(`Removed ${user?.label ?? userId} from record.`, "info");
  }

  // ── Assign step (user_seq_assignment) ─────────────────────────────────────
  async function handleAssign(step) {
    if (!selectedRecordId) return;
    const userId = activeDrafts[step.key];
    if (!userId) return;

    const selectedUser = users.find((u) => u.id === userId);
    const seqId = step.seqId ?? parseInt(step.key, 10) ?? null;
    const existing = activeAssignments[step.key];

    setSaving((prev) => ({ ...prev, [step.key]: true }));

    let dbError = null;
    let returnedId = existing?.assignmentId ?? null;

    if (existing?.assignmentId) {
      const { error } = await supabase
        .from("user_seq_assignment")
        .update({ user_id: userId })
        .eq("id", existing.assignmentId);
      dbError = error;
    } else {
      const { data, error } = await supabase
        .from("user_seq_assignment")
        .insert({ user_id: userId, seq_id: seqId, tracking_id: selectedRecordId })
        .select("id")
        .single();
      dbError = error;
      returnedId = data?.id ?? null;
    }

    setSaving((prev) => ({ ...prev, [step.key]: false }));
    if (dbError) { pushToast(`Error: ${dbError.message}`, "error"); return; }

    const assignment = {
      assignmentId: returnedId,
      userId,
      userName: selectedUser?.label ?? userId,
      seqId,
    };

    setAssignments((prev) => ({
      ...prev,
      [selectedRecordId]: { ...(prev[selectedRecordId] ?? {}), [step.key]: assignment },
    }));

    pushToast(`Tagged ${step.label} → ${assignment.userName}`);
    onAssignTag?.({ recordId: selectedRecordId, stepKey: step.key, userId, user: selectedUser?.raw ?? null });
  }

  // ── Clear step assignment ─────────────────────────────────────────────────
  async function handleClear(step) {
    if (!selectedRecordId) return;
    const existing = activeAssignments[step.key];
    if (existing?.assignmentId) {
      setSaving((prev) => ({ ...prev, [step.key]: true }));
      const { error } = await supabase
        .from("user_seq_assignment")
        .delete()
        .eq("id", existing.assignmentId);
      setSaving((prev) => ({ ...prev, [step.key]: false }));
      if (error) { pushToast(`Error: ${error.message}`, "error"); return; }
    }
    setAssignments((prev) => {
      const updated = { ...(prev[selectedRecordId] ?? {}) };
      delete updated[step.key];
      return { ...prev, [selectedRecordId]: updated };
    });
    setDrafts((prev) => {
      const updated = { ...(prev[selectedRecordId] ?? {}) };
      delete updated[step.key];
      return { ...prev, [selectedRecordId]: updated };
    });
    pushToast(`Cleared ${step.label}`, "info");
    onClearTag?.({ recordId: selectedRecordId, stepKey: step.key });
  }

  // ── Users eligible for a step (filtered by user_seq_assignment) ───────────
  function eligibleUsers(stepKey) {
    const allowed = stepPermissions[stepKey];
    if (!allowed?.length) return users; // no restriction → all users
    return users.filter((u) => allowed.includes(u.id));
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const selectedRecord = trackingRows.find((r) => r.id === selectedRecordId);

  return (
    <div className="tagging-page">
      <div className="tagging-toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`tagging-toast tagging-toast--${t.type}`}>{t.message}</div>
        ))}
      </div>

      <main className="tagging-shell">
        {/* Header */}
        <header className="tagging-title-box">
          <h1>Agusan del Norte Provincial Health Office</h1>
          <p>CHART Tagging System</p>
          {selectedPatient && <small>Selected Patient: {selectedPatient.displayName}</small>}
        </header>

        {/* Nav */}
        <section className="tagging-actions">
          <button type="button" onClick={onBackToTracking}>← Back to Tracking</button>
          <button type="button" onClick={onChangePatient}>Change Patient</button>
        </section>

        {/* Panel */}
        <section className="tagging-panel" aria-label="Tagging panel">
          <div className="tagging-panel-header">
            <div>
              <h2>Tagging Panel</h2>
              <p>Assign users to records and workflow steps.</p>
            </div>
            <div className="tagging-panel-summary">
              {usersLoading ? <span>Loading users…</span>
                : usersError ? <span className="tagging-panel-error">{usersError}</span>
                : <span>{users.length} users loaded</span>}
              <button type="button" onClick={fetchUsers}>↺ Refresh</button>
            </div>
          </div>

          {/* Record selector */}
          <div className="tagging-panel-controls">
            <label htmlFor="tagging-record">Select Record</label>
            <select
              id="tagging-record"
              value={selectedRecordId}
              onChange={(e) => setSelectedRecordId(e.target.value)}
              disabled={!trackingRows.length}
            >
              {!trackingRows.length
                ? <option value="">No records available</option>
                : trackingRows.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.patientName} ({row.hospitalNo})
                  </option>
                ))}
            </select>
          </div>

          {/* Record-level user assignment (tracking_user_assignment) */}
          {selectedRecord && (
            <div className="tagging-record-assign">
              <h3>Record Ownership</h3>
              <p className="tagging-hint">
                Assigned users can <strong>only see this record</strong>. Enforced by Supabase RLS.
              </p>
              <div className="tagging-record-assign-row">
                <select
                  id="record-user-select"
                  defaultValue=""
                  onChange={(e) => { if (e.target.value) handleAssignRecord(e.target.value); e.target.value = ""; }}
                  disabled={taggingDisabled}
                >
                  <option value="">+ Add user to record…</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.label}</option>
                  ))}
                </select>
              </div>
              {activeRecordUsers.length > 0 && (
                <ul className="tagging-record-users">
                  {activeRecordUsers.map((a) => {
                    const user = users.find((u) => u.id === a.userId);
                    return (
                      <li key={a.id}>
                        <span>{user?.label ?? a.userId}</span>
                        <button
                          type="button"
                          className="tagging-remove-user"
                          onClick={() => handleRemoveRecord(a.id, a.userId)}
                        >
                          ×
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* Step cards (user_seq_assignment) */}
          {stepsLoading ? (
            <p className="tagging-loading-steps">Loading steps…</p>
          ) : (
            <>
              <h3 className="tagging-steps-heading">Step Assignments</h3>
              <div className="tagging-board">
                {steps.map((step, index) => {
                  const assigned = activeAssignments[step.key];
                  const draft    = activeDrafts[step.key] ?? "";
                  const isSaving = saving[step.key] ?? false;
                  const eligible = eligibleUsers(step.key);

                  return (
                    <article key={step.key} className="tagging-card">
                      <div className="tagging-card-head">
                        <h3>{step.label}</h3>
                        <span className="tagging-step">Step {index + 1}</span>
                      </div>

                      <div className="tagging-field">
                        <label htmlFor={`tag-${step.key}`}>Assign user</label>
                        <select
                          id={`tag-${step.key}`}
                          value={draft}
                          onChange={(e) => handleDraftChange(step.key, e.target.value)}
                          disabled={taggingDisabled || isSaving}
                        >
                          <option value="">
                            {eligible.length ? "Select user…" : "No eligible users"}
                          </option>
                          {eligible.map((u) => (
                            <option key={u.id} value={u.id}>{u.label}</option>
                          ))}
                        </select>
                        {stepPermissions[step.key]?.length > 0 && (
                          <span className="tagging-permission-note">
                            🔒 Restricted to {stepPermissions[step.key].length} user(s)
                          </span>
                        )}
                      </div>

                      <div className="tagging-status">
                        <span>Current:</span>
                        <strong>
                          {isSaving ? "Saving…" : assigned ? assigned.userName : "Unassigned"}
                        </strong>
                      </div>

                      <div className="tagging-actions-row">
                        <button
                          type="button"
                          onClick={() => handleAssign(step)}
                          disabled={taggingDisabled || !draft || isSaving}
                        >
                          {isSaving ? "…" : "Tag"}
                        </button>
                        <button
                          type="button"
                          className="tagging-clear"
                          onClick={() => handleClear(step)}
                          disabled={!assigned || isSaving}
                        >
                          Clear
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}