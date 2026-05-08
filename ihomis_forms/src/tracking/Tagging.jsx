import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useTaggingSession } from "./hooks/useTaggingSession";
import TaggingUserPicker from "./TaggingUserPicker";
import "./Tagging.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const RECORD_SESSION_KEY = "tagging_selected_record_id";

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
  5: { color: "#b8860b", bg: "#fff8dc", label: "5th tag — remaining steps"     },
  6: { color: "#2e8b57", bg: "#e0ffe0", label: "6th tag — remaining steps"     },
  7: { color: "#8b008b", bg: "#ffe4ff", label: "7th tag — remaining steps"     },
  8: { color: "#4b0082", bg: "#eee8ff", label: "8th tag — remaining steps"     },
};
function tagCfg(order) {
  return TAG_CFG[order] ?? { color: "#555", bg: "#f0f0f0", label: `#${order} tag` };
}

function AccessDenied({ userName, onSwitchUser, onBack }) {
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
              {userName?.toUpperCase()}
            </div>
          )}
        </header>
        <nav className="tg-nav">
          
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
              Please wait for the first tagged user to assign steps to your account
              before you can access the tagging panel.
            </p>
            <p style={{ margin: 0, color: "#aaa", fontSize: ".8rem" }}>
              Logged in as: <strong style={{ color: "#8a4f0b" }}>{userName?.toUpperCase()}</strong>
            </p>
            <button
              className="tg-btn tg-btn--primary"
              onClick={onSwitchUser}
              style={{ marginTop: ".5rem" }}
            >
              Switch User
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
  // Removed: currentUserId, currentUserName props - now uses independent tagging session
  // This ensures tagging user selection is completely isolated from tracking module
  onAccessChanged,
}) {
  const { toasts, push } = useToast();

  // ── INDEPENDENT TAGGING SESSION ──────────────────────────────────────────
  // This session is completely separate from the tracking module's user picker.
  // It uses its own localStorage key and fetches users independently.
  const {
    taggingUserId,
    taggingUserName,
    users,
    usersLoading,
    usersError,
    selectTaggingUser,
    clearTaggingSession,
    refreshUsers,
  } = useTaggingSession();

  // ── Go back to user picker ─────────────────────────────────────────────────
  const handleSwitchUser = useCallback(() => {
    clearTaggingSession();
    setAccessStatus("needs-user");
  }, [clearTaggingSession]);

  // ── Access check state ────────────────────────────────────────────────────
  // IMPORTANT: Start with "needs-user" so the picker shows immediately on page load
  // The access check happens AFTER user selection, not before
  const [accessStatus, setAccessStatus] = useState("needs-user");

  // ── Init ──────────────────────────────────────────────────────────────────
  const [initComplete,     setInitComplete]     = useState(false);
  const [initError,        setInitError]        = useState("");

  // FIX: restore selectedRecordId from sessionStorage so it survives remounts
  const [selectedRecordId, setSelectedRecordId] = useState(() => {
    return sessionStorage.getItem(RECORD_SESSION_KEY) ?? "";
  });

  // Keep sessionStorage in sync
  useEffect(() => {
    if (selectedRecordId) {
      sessionStorage.setItem(RECORD_SESSION_KEY, selectedRecordId);
    } else {
      sessionStorage.removeItem(RECORD_SESSION_KEY);
    }
  }, [selectedRecordId]);

  useEffect(() => {
    let live = true;
    (async () => {
      setInitError("");
      setInitComplete(false);

      if (!trackingRows.length) { setInitComplete(true); return; }

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

      // FIX: only override selectedRecordId if we don't already have a persisted one
      if (firstId) {
        setSelectedRecordId((prev) => prev || firstId);
      }
      setInitComplete(true);
    })();
    return () => { live = false; };
  }, [trackingRows, selectedPatient]);

  // If nothing is selected yet, fall back to the first available row.
  useEffect(() => {
    if (!initComplete || !trackingRows.length || selectedRecordId) return;
    const firstValid = trackingRows.find((r) => r?.id);
    if (firstValid) {
      setSelectedRecordId(String(firstValid.id));
    }
  }, [initComplete, trackingRows, selectedRecordId]);

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

  // NOTE: Users are now fetched from useTaggingSession hook - no local state needed
  // The hook provides: users, usersLoading, usersError, selectTaggingUser, refreshUsers

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

  // FIX: only fetch tagged users AFTER init is complete and when selectedRecordId changes
  useEffect(() => {
    if (!initComplete) return;
    if (!selectedRecordId) return;
    fetchTaggedUsers();
  }, [initComplete, selectedRecordId, fetchTaggedUsers]);

  // ── Step assignments ───────────────────────────────────────────────────────
  // Store multiple assignments per step: { [stepKey]: [{ rowId, userId, userName }, ...] }
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
      const stepKey = String(row.seq_id);
      const assignment = {
        rowId:    row.id,
        userId:   String(row.user_id),
        userName: users.find((u) => u.id === String(row.user_id))?.label ?? String(row.user_id),
      };
      // Allow multiple assignments per step
      if (!map[stepKey]) {
        map[stepKey] = [];
      }
      map[stepKey].push(assignment);
    }
    setStepAssign(map);
  }, [taggedUsers, users]);

  // FIX: fetch step assignments whenever taggedUsers or users changes (covers remount)
  useEffect(() => { fetchStepAssign(); }, [fetchStepAssign]);

  // ── CRITICAL: Compute who can manage tagging ───────────────────────────────
  // Rules:
  // 1. User must be the FIRST tagged user (tag_order = 1) to access tagging
  // 2. If no first tagged user exists yet, user cannot access (they need to be tagged first)
  const firstTaggedUser = useMemo(
    () => taggedUsers.find((u) => u.tagOrder === 1),
    [taggedUsers]
  );

  const canManageTagging = useMemo(() => {
    // Must have a selected tagging user
    if (!taggingUserId) return false;
    
    // Must have a first tagged user in the database
    if (!firstTaggedUser) return false;
    
    // Only the first tagged user can manage tagging
    return String(firstTaggedUser.userId) === String(taggingUserId);
  }, [taggingUserId, firstTaggedUser]);

  // ── ACCESS CHECK ───────────────────────────────────────────────────────────
  // With independent tagging session:
  // 1. If no tagging user selected yet → show user picker (immediately, don't wait for init)
  // 2. If user selected but not first tagged → deny access
  // 3. If user is first tagged → allow access
  useEffect(() => {
    // Show user picker immediately if no user selected - don't wait for init
    if (!taggingUserId) {
      setAccessStatus("needs-user");
      return;
    }
    
    // Only check initComplete for the actual access decision
    if (!initComplete) return;
    
    setAccessStatus(canManageTagging ? "allowed" : "denied");
  }, [initComplete, taggingUserId, canManageTagging]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const assignableUsers = useMemo(
    () => taggedUsers.filter((u) => u.tagOrder >= 2),
    [taggedUsers]
  );

  const stepsEnabled = assignableUsers.length > 0;

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

  // FIX: exclude already-tagged users from the dropdown — always derived from live taggedUsers state
  const unusedUsers = useMemo(
    () => users.filter((u) => !taggedUsers.some((t) => t.userId === u.id)),
    [users, taggedUsers]
  );

  // canAddUser is true when there are still unused users available to add
  const canAddUser = unusedUsers.length > 0;
  const taggingDisabled = !selectedRecordId || usersLoading || !users.length || !initComplete;

  // ── Handlers ──────────────────────────────────────────────────────────

  /**
   * FIX: handleAddUser — complete rewrite with strict sequential validation
   *
   * Rules enforced:
   * 1. Always re-fetch live assignments from DB before inserting (no stale state)
   * 2. A user already tagged (any order) cannot be added again
   * 3. tag_order 1 can only exist ONCE per record
   * 4. New tag_order = max(existing) + 1, gap-filled if needed
   * 5. Maximum 4 users per record
   */
  async function handleAddUser() {
    if (!canManageTagging) {
      push("Only the 1st tagged user can manage tagging.", "error");
      return;
    }
    if (!selectedRecordId || !pendingUser) {
      push("No record selected or no user selected.", "error");
      return;
    }

    const trackingIdInt = parseInt(selectedRecordId, 10);
    if (isNaN(trackingIdInt)) {
      push("Invalid tracking record. Please refresh.", "error");
      return;
    }

    // ── Step 1: Verify the tracking record exists in DB, or re-initialize if needed ──
    let { data: exists, error: chkErr } = await supabase
      .from("tracking").select("id, tracking_encocode, encounter_type").eq("id", trackingIdInt).maybeSingle();
    
    // If record doesn't exist, try to create it on the fly
    if (chkErr || !exists) {
      // Try to get the tracking code from trackingRows using multiple possible ID fields
      const trackingRow = trackingRows.find(r => 
        String(r.id) === selectedRecordId || 
        String(r.tracking_encocode) === selectedRecordId ||
        String(r.encoCode) === selectedRecordId
      );
      
      // Fallback: try to find by matching against any tracking row's DB id
      let encoCode = trackingRow?.encoCode || trackingRow?.tracking_encocode;
      let encounterType = trackingRow?.encounterType || trackingRow?.encounter_type || "";
      
      // If no encoCode found from trackingRows, try fetching by tracking_encocode
      if (!encoCode && trackingIdInt) {
        const { data: byCode } = await supabase
          .from("tracking")
          .select("tracking_encocode, encounter_type")
          .eq("id", trackingIdInt)
          .maybeSingle();
        if (byCode) {
          encoCode = byCode.tracking_encocode;
          encounterType = byCode.encounter_type || "";
        }
      }
      
      // Last resort: use the selectedRecordId itself as the encoCode
      if (!encoCode) {
        encoCode = selectedRecordId;
      }
      
      // Try to create the tracking record
      const { data: upserted, error: upsertErr } = await supabase
        .from("tracking")
        .upsert({
          tracking_encocode: String(encoCode),
          encounter_type: String(encounterType),
          is_current: true,
          created_by: String(selectedPatient?.id ?? selectedPatient?.patient_id ?? "TAGGING_INIT"),
        }, { onConflict: "tracking_encocode", ignoreDuplicates: false })
        .select("id")
        .single();
      
      if (upsertErr || !upserted?.id) {
        push(`Error creating tracking record: ${upsertErr?.message ?? "Unknown error"}`, "error");
        return;
      }
      
      // Update the selectedRecordId with the correct DB id if needed
      if (String(upserted.id) !== selectedRecordId) {
        setSelectedRecordId(String(upserted.id));
      }
      
      exists = upserted;
    }

    // ── Step 2: Fetch LIVE assignments from DB (ignore local state) ───────
    const { data: existing, error: existingErr } = await supabase
      .from("tracking_user_assignment")
      .select("id, user_id, tag_order")
      .eq("tracking_id", trackingIdInt)
      .order("tag_order", { ascending: true });

    if (existingErr) {
      push(`Error loading existing tags: ${existingErr.message}`, "error");
      return;
    }

    const liveAssignments = existing ?? [];

    // ── Step 3: Check if this user is already tagged (any order) ─────────
    const alreadyTagged = liveAssignments.some(
      (r) => String(r.user_id) === String(pendingUser)
    );
    if (alreadyTagged) {
      push("This user is already tagged on this record.", "info");
      // Sync local state in case it was stale
      setTaggedUsers(liveAssignments.map((r) => ({
        rowId: r.id, userId: String(r.user_id), tagOrder: r.tag_order,
      })));
      setPendingUser("");
      return;
    }

    // ── Step 4: Validate tag_order integrity ──────────────────────────────
    const orders = liveAssignments
      .map((r) => Number(r.tag_order))
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b);

    const orderSet = new Set(orders);

    // Detect duplicate orders (data corruption)
    if (orders.length !== orderSet.size) {
      push("Tag order inconsistency detected. Please refresh and resolve duplicates before adding a new user.", "error");
      return;
    }

    // If any assignments exist, tag_order 1 must be present
    if (orders.length > 0 && !orderSet.has(1)) {
      push("Tag order is missing the 1st tag. Please resolve existing tags first.", "error");
      return;
    }

    // ── Step 5: Compute next tag_order (fill first gap, or max+1) ─────────
    let newOrder = 1; // default if no assignments yet
    if (orders.length > 0) {
      // Find the first unused order starting from 1
      newOrder = orders[orders.length - 1] + 1; // start with max+1
      for (let i = 1; i <= orders[orders.length - 1] + 1; i++) {
        if (!orderSet.has(i)) { newOrder = i; break; }
      }
    }

    // ── Step 6: Insert ────────────────────────────────────────────────────
    const { error: insertErr } = await supabase
      .from("tracking_user_assignment")
      .insert({ tracking_id: trackingIdInt, user_id: pendingUser, tag_order: newOrder })
      .select("id")
      .single();

    if (insertErr) { push(`Error: ${insertErr.message}`, "error"); return; }

    // ── Step 7: Sync local state from DB (re-fetch to be safe) ───────────
    await fetchTaggedUsers();

    const uLabel = users.find((u) => u.id === pendingUser)?.label ?? pendingUser;
    push(`Tagged ${uLabel} as #${newOrder} — ${tagCfg(newOrder).label}`);
    setPendingUser("");
    onAccessChanged?.();
  }

  async function handleRemoveUser(rowId, userId, tagOrder) {
    if (!canManageTagging) {
      push("Only the 1st tagged user can manage tagging.", "error");
      return;
    }
    if (tagOrder === 1) {
      push("The 1st tagged user cannot be removed.", "info");
      return;
    }
    const { error } = await supabase
      .from("tracking_user_assignment").delete().eq("id", rowId);
    if (error) { push(`Error: ${error.message}`, "error"); return; }

    setTaggedUsers((p) => p.filter((u) => u.rowId !== rowId));

    // Remove all step assignments for this user
    await supabase.from("user_seq_assignment").delete().eq("user_id", userId);
    setStepAssign((p) => {
      const n = { ...p };
      // stepAssign is now: { [stepKey]: [{ rowId, userId, userName }, ...] }
      for (const k of Object.keys(n)) {
        if (Array.isArray(n[k])) {
          n[k] = n[k].filter(a => a.userId !== userId);
          if (n[k].length === 0) delete n[k];
        } else if (n[k]?.userId === userId) {
          delete n[k];
        }
      }
      return n;
    });

    const uLabel = users.find((u) => u.id === userId)?.label ?? userId;
    push(`Removed ${uLabel} (tag #${tagOrder}).`, "info");
    onAccessChanged?.();
  }

  async function handleAssignStep(step, userId) {
    if (!canManageTagging) {
      push("Only the 1st tagged user can manage tagging.", "error");
      return;
    }
    if (!userId) { push("Select a user for this step first.", "info"); return; }

    const tu = taggedUsers.find((u) => u.userId === userId);
    if (!tu) { push("User not tagged on this record.", "info"); return; }
    if (tu.tagOrder === 1) { push("1st user already has full access to all steps.", "info"); return; }

    // Check if this user is already assigned to this step
    const currentAssignments = stepAssign[step.key] || [];
    const alreadyAssigned = currentAssignments.some(a => a.userId === userId);
    if (alreadyAssigned) {
      push(`${users.find(u => u.id === userId)?.label ?? userId} is already assigned to "${step.label}".`, "info");
      setDrafts((p) => { const n = { ...p }; delete n[step.key]; return n; });
      return;
    }

    setSaving((p) => ({ ...p, [step.key]: true }));

    // Insert new assignment (always add, never replace)
    const { data, error: e } = await supabase
      .from("user_seq_assignment")
      .insert({ user_id: userId, seq_id: step.id })
      .select("id").single();

    setSaving((p) => ({ ...p, [step.key]: false }));
    if (e) { push(`Error: ${e.message}`, "error"); return; }

    const uLabel = users.find((u) => u.id === userId)?.label ?? userId;
    const newAssignment = {
      rowId: data.id,
      userId,
      userName: uLabel,
    };
    
    setStepAssign((p) => ({
      ...p,
      [step.key]: [...(p[step.key] || []), newAssignment]
    }));
    setDrafts((p) => { const n = { ...p }; delete n[step.key]; return n; });
    push(`Assigned "${step.label}" → ${uLabel} (${(currentAssignments.length + 1)} total)`);
    onAccessChanged?.();
  }

  async function handleClearStep(step) {
    if (!canManageTagging) {
      push("Only the 1st tagged user can manage tagging.", "error");
      return;
    }
    const existing = stepAssign[step.key];
    if (!existing || (Array.isArray(existing) && existing.length === 0)) return;
    
    setSaving((p) => ({ ...p, [step.key]: true }));

    // Delete ALL assignments for this step
    const rowIds = Array.isArray(existing) 
      ? existing.map(a => a.rowId) 
      : [existing.rowId];
    
    const { error } = await supabase
      .from("user_seq_assignment")
      .delete()
      .in("id", rowIds);

    setSaving((p) => ({ ...p, [step.key]: false }));
    if (error) { push(`Error: ${error.message}`, "error"); return; }
    setStepAssign((p) => { const n = { ...p }; delete n[step.key]; return n; });
    setDrafts((p) => { const n = { ...p }; delete n[step.key]; return n; });
    push(`Cleared all assignments for "${step.label}"`, "info");
    onAccessChanged?.();
  }

  // Remove a single assignment from a step
  async function handleRemoveStepAssignment(step, rowId) {
    if (!canManageTagging) {
      push("Only the 1st tagged user can manage tagging.", "error");
      return;
    }
    setSaving((p) => ({ ...p, [step.key]: true }));
    const { error } = await supabase
      .from("user_seq_assignment").delete().eq("id", rowId);
    setSaving((p) => ({ ...p, [step.key]: false }));
    if (error) { push(`Error: ${error.message}`, "error"); return; }
    
    setStepAssign((p) => {
      const current = p[step.key] || [];
      const updated = current.filter(a => a.rowId !== rowId);
      if (updated.length === 0) {
        const n = { ...p };
        delete n[step.key];
        return n;
      }
      return { ...p, [step.key]: updated };
    });
    push(`Removed assignment from "${step.label}"`, "info");
    onAccessChanged?.();
  }

  const selectedRecord = trackingRows.find((r) => String(r.id) === selectedRecordId);

  // ── Access gate: checking ─────────────────────────────────────────────────
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
        userName={taggingUserName}
        onSwitchUser={handleSwitchUser}
        onBack={onBackToTracking}
      />
    );
  }

  // ── Needs user selection ─────────────────────────────────────────────────
  // When no tagging user is selected yet, show the TaggingUserPicker
  if (accessStatus === "needs-user") {
    return (
      <TaggingUserPicker
        users={users}
        usersLoading={usersLoading}
        usersError={usersError}
        onSelect={selectTaggingUser}
        onRefresh={refreshUsers}
      />
    );
  }

  // ── Normal render ─────────────────────────────────────────────────────────
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
          {taggingUserName && (
            <div className="tg-session-pill">
              <span className="tg-session-dot" />
              {taggingUserName}
            </div>
          )}
        </header>

        <nav className="tg-nav">
          <button className="tg-btn tg-btn--ghost" onClick={handleSwitchUser}>
            ← Switch User
          </button>
        
        </nav>

        <div className="tg-panel">
          <div className="tg-panel-topbar">
            <div>
              <h2 className="tg-panel-title">Tagging Panel</h2>
              <p className="tg-panel-sub">Assign users to records and workflow steps.</p>
            </div>
            <div className="tg-users-status">
              {usersLoading && <span className="tg-spinner" />}
              {usersError   && <span className="tg-err-text">{usersError}</span>}
              {!usersLoading && !usersError && <span className="tg-count">{users.length} users loaded</span>}
              <button className="tg-btn tg-btn--sm" onClick={() => { refreshUsers(); fetchTaggedUsers(); }}>↺ Refresh</button>
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

          {initComplete && selectedRecordId && (
            <>
              {/* ── USER TAGGING ORDER ─────────────────────────────────── */}
              <div className="tg-section">
                <p className="tg-section-cap">USER TAGGING ORDER</p>
                <p className="tg-section-desc">
                  The 1st tagged user gets full access to all steps and can manage all tagging.
                  Only the 1st user can add, remove, or manage other users.
                  Tag more users to restrict their access to specific steps only.
                  Each user can only be tagged once and follows a strict sequence (1 → 2 → 3 → 4).
                </p>

                {taggedUsers.length > 0 && (
                  <div className="tg-user-list">
                    {taggedUsers.map((tu) => {
                      const cfg       = tagCfg(tu.tagOrder);
                      const uName     = users.find((u) => u.id === tu.userId)?.label ?? tu.userId;
                      // Count steps where this user is assigned (supports multiple per step)
                      const stepCount = Object.values(stepAssign).filter((assignments) => {
                        if (Array.isArray(assignments)) {
                          return assignments.some(a => a.userId === tu.userId);
                        }
                        return assignments?.userId === tu.userId;
                      }).length;
                      const isCurrent = String(tu.userId) === String(taggingUserId);
                      return (
                        <div key={tu.rowId} className="tg-user-row">
                          <span className="tg-order-badge" style={{ color: cfg.color, background: cfg.bg }}>
                            #{tu.tagOrder}
                          </span>
                          <span className="tg-user-name">
                            {uName}
                            {isCurrent && tu.tagOrder === 1 && <span style={{ marginLeft: ".5rem", fontSize: ".75rem", opacity: .7 }}>(you)</span>}
                          </span>
                          <span className="tg-user-role">{cfg.label}</span>
                          {tu.tagOrder === 1
                            ? <span className="tg-step-count-pill tg-step-count-pill--full">All {steps.length} steps</span>
                            : <span className="tg-step-count-pill">{stepCount} step{stepCount !== 1 ? "s" : ""} assigned</span>
                          }
                          <button
                            className="tg-remove-btn"
                            onClick={() => handleRemoveUser(tu.rowId, tu.userId, tu.tagOrder)}
                            disabled={tu.tagOrder === 1 || !canManageTagging}
                            title={tu.tagOrder === 1 ? "The 1st tag is fixed and cannot be removed." : !canManageTagging ? "Only the 1st tagged user can remove other users." : "Remove user"}
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {taggedUsers.length === 0 && (
                  <div className="tg-notice tg-notice--hint">
                    💡 No users tagged yet. Add the first user below to begin.
                  </div>
                )}

                {canAddUser && canManageTagging && (
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
                  <p className="tg-notice tg-notice--hint">💡 All available users have been tagged for this record.</p>
                )}

                {taggedUsers.length > 0 && !canManageTagging && (
                  <p className="tg-notice tg-notice--error">Only the 1st tagged user (#1) can add or remove users.</p>
                )}
              </div>

              {/* ── STEP ASSIGNMENTS ───────────────────────────────────── */}
              {canManageTagging && (
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
                        const assignedList = stepAssign[step.key] || [];
                        const isSaving  = saving[step.key] ?? false;
                        const draftVal  = drafts[step.key] ?? "";
                        const hasAssigned = assignedList.length > 0;
                        // Check if draft user is already assigned to this step
                        const draftUserAlreadyAssigned = draftVal 
                          ? assignedList.some(a => a.userId === draftVal)
                          : false;
                        const canAssign = stepsEnabled
                          && !isSaving
                          && !!draftVal
                          && !draftUserAlreadyAssigned;

                        return (
                          <div
                            key={step.key}
                            className={`tg-step-card ${hasAssigned ? "tg-step-card--assigned" : "tg-step-card--remaining"}`}
                            style={hasAssigned && assignedList[0] ? {
                              borderColor: tagCfg(
                                taggedUsers.find(u => u.userId === assignedList[0].userId)?.tagOrder ?? 1
                              ).color + "44",
                              background:  `linear-gradient(160deg, #fff 55%, ${tagCfg(
                                taggedUsers.find(u => u.userId === assignedList[0].userId)?.tagOrder ?? 1
                              ).bg} 100%)`,
                            } : {}}
                          >
                            <div className="tg-step-head">
                              <span className="tg-step-name">{step.label}</span>
                              <span className="tg-step-num">Step {idx + 1}</span>
                              {hasAssigned && (
                                <span className="tg-step-count-badge">{assignedList.length} assigned</span>
                              )}
                            </div>

                            <div className="tg-step-badge-wrap">
                              {hasAssigned ? (
                                <div className="tg-assigned-users-list">
                                  {assignedList.map((assignment) => {
                                    const tu = taggedUsers.find((u) => u.userId === assignment.userId);
                                    const cfg = tu ? tagCfg(tu.tagOrder) : null;
                                    return (
                                      <div key={assignment.rowId} className="tg-assigned-user-item">
                                        <span 
                                          className="tg-step-badge" 
                                          style={{ background: cfg?.bg, color: cfg?.color }}
                                        >
                                          {assignment.userName}
                                        </span>
                                        <button
                                          className="tg-remove-assign-btn"
                                          disabled={isSaving}
                                          onClick={() => handleRemoveStepAssignment(step, assignment.rowId)}
                                          title="Remove this assignment"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
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
                                const isAlreadyAssigned = assignedList.some(a => a.userId === tu.userId);
                                return (
                                  <option 
                                    key={tu.userId} 
                                    value={tu.userId}
                                    disabled={isAlreadyAssigned}
                                  >
                                    #{tu.tagOrder} {uLabel}{isAlreadyAssigned ? ' (assigned)' : ''}
                                  </option>
                                );
                              })}
                            </select>

                            <div className="tg-step-owner">
                              {hasAssigned ? (
                                <span className="tg-chip" style={{ 
                                  background: tagCfg(
                                    taggedUsers.find(u => u.userId === assignedList[0].userId)?.tagOrder ?? 1
                                  ).bg, 
                                  color: tagCfg(
                                    taggedUsers.find(u => u.userId === assignedList[0].userId)?.tagOrder ?? 1
                                  ).color 
                                }}>
                                  {assignedList.length} user{assignedList.length !== 1 ? 's' : ''} assigned
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
                                disabled={!hasAssigned || isSaving}
                                onClick={() => handleClearStep(step)}
                              >
                                Clear All
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── ACCESS SUMMARY — always rendered from DB-loaded state ── */}
              {taggedUsers.length > 0 && !stepsLoading && (
                <div className="tg-section">
                  <p className="tg-section-cap">ACCESS SUMMARY</p>
                  <p className="tg-section-desc">Overview of what each tagged user can access. Each user has independent access to all steps. This reflects live data from the database.</p>
                  <div className="tg-summary">
                    {taggedUsers.map((tu) => {
                      const cfg     = tagCfg(tu.tagOrder);
                      const uName   = users.find((u) => u.id === tu.userId)?.label ?? tu.userId;
                      // First user sees all steps; other users see only their assigned steps
                      // Now supports multiple assignments per step
                      const mySteps = tu.tagOrder === 1
                        ? steps.map((s) => s.label)
                        : steps
                            .filter((s) => {
                              const assignments = stepAssign[s.key];
                              if (Array.isArray(assignments)) {
                                return assignments.some(a => a.userId === tu.userId);
                              }
                              return assignments?.userId === tu.userId;
                            })
                            .map((s) => s.label);
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
{/* 
          {!selectedRecord && initComplete && trackingRows.length > 0 && selectedRecordId && (
            <div className="tg-notice" style={{ color: "#8a4f0b", background: "#faebd5" }}>
              ⚠️ Could not match a tracking record. Try refreshing the page.
            </div>
          )} */}
        </div>
      </main>
    </div>
  );
}