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
    <div className="tagging-container">
      <header className="tagging-header">
        <div className="tagging-header-top">
          <div className="tagging-patient-info">
            <h1>CHART Tagging System</h1>
          </div>
          {userName && (
            <div className="tagging-user-badge">
              <span className="tagging-user-badge-dot" />
              {userName?.toUpperCase()}
            </div>
          )}
        </div>
      </header>
      <nav className="tagging-nav">
      </nav>
      <div className="tagging-panel" style={{ textAlign: "center", padding: "3rem 2rem" }}>
        <div className="tagging-access-denied">
          <div className="tagging-access-denied-icon">🔒</div>
          <h2>No Access Yet</h2>
          <p>
            You do not have any assigned steps yet.
            Please wait for the first tagged user to assign steps to your account
            before you can access the tagging panel.
          </p>
          <small>Logged in as: <strong>{userName?.toUpperCase()}</strong></small>
          <button
            className="btn btn-primary"
            onClick={onSwitchUser}
            style={{ marginTop: "1rem" }}
          >
            Switch User
          </button>
        </div>
      </div>
    </div>
  );
}
export default function Tagging({
  selectedPatient,
  trackingRows = [],
  onBackToTracking,
  onAccessChanged,
  currentUserId,
  currentUserName,
  onChangePatient,
}) {
  const { toasts, push } = useToast();

  // ── TAGGING SESSION (now uses session user automatically) ───────────────────
  const {
    users,
    usersLoading,
    usersError,
    refreshUsers,
  } = useTaggingSession();

  // Use session user directly instead of separate tagging session
  const taggingUserId = currentUserId;
  const taggingUserName = currentUserName;

  // ── Access check state ────────────────────────────────────────────────────
  const [accessStatus, setAccessStatus] = useState("checking");

  // ── Init ──────────────────────────────────────────────────────────────────
  const [initComplete,     setInitComplete]     = useState(false);
  const [initError,        setInitError]        = useState("");

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

  // ── Initialize tracking record from trackingRows (only if needed) ──────
  useEffect(() => {
    let live = true;
    
    // Skip if no tracking rows or already have a selectedRecordId
    if (!trackingRows.length || selectedRecordId) {
      setInitComplete(true);
      return;
    }
    
    (async () => {
      setInitError("");
      setInitComplete(false);

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

      if (firstId) {
        setSelectedRecordId(firstId);
      }
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

  // ── Tagged users ───────────────────────────────────────────────────────────
  const [taggedUsers, setTaggedUsers] = useState([]);

  // ── Step assignments ───────────────────────────────────────────────────────
  const [stepAssign, setStepAssign] = useState({});

  // ── Unified fetch function that fetches ALL data from DB ─────────────────
  const fetchAllData = useCallback(async () => {
    if (!selectedRecordId) {
      setTaggedUsers([]);
      setStepAssign({});
      return;
    }
    
    const trackingIdInt = parseInt(selectedRecordId, 10);
    if (isNaN(trackingIdInt)) {
      setTaggedUsers([]);
      setStepAssign({});
      return;
    }
    
    // Fetch tagged users from DB
    const { data: taggedData, error: taggedErr } = await supabase
      .from("tracking_user_assignment")
      .select("id, user_id, tag_order")
      .eq("tracking_id", trackingIdInt)
      .order("tag_order", { ascending: true });
    
    if (taggedErr) {
      console.error("fetchTaggedUsers:", taggedErr.message);
      setTaggedUsers([]);
    } else {
      setTaggedUsers((taggedData ?? []).map((r) => ({
        rowId: r.id, userId: String(r.user_id), tagOrder: r.tag_order,
      })));
    }
    
    // Fetch step assignments
    if (taggedData?.length) {
      const userIds = taggedData.map(u => u.user_id);
      const { data: seqData, error: seqErr } = await supabase
        .from("user_seq_assignment")
        .select("id, user_id, seq_id")
        .in("user_id", userIds);
      
      if (!seqErr && seqData) {
        const map = {};
        for (const row of seqData ?? []) {
          const stepKey = String(row.seq_id);
          const assignment = {
            rowId:    row.id,
            userId:   String(row.user_id),
            userName: users.find((u) => u.id === String(row.user_id))?.label ?? String(row.user_id),
          };
          if (!map[stepKey]) {
            map[stepKey] = [];
          }
          map[stepKey].push(assignment);
        }
        setStepAssign(map);
      } else {
        setStepAssign({});
      }
    } else {
      setStepAssign({});
    }
  }, [selectedRecordId, users]);

  // Fetch ALL data when selectedRecordId or users change
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ── CRITICAL: Compute who can manage tagging ───────────────────────────────
  const firstTaggedUser = useMemo(
    () => taggedUsers.find((u) => u.tagOrder === 1),
    [taggedUsers]
  );

  const canManageTagging = useMemo(() => {
    if (!taggingUserId) return false;
    if (taggedUsers.length === 0) return true;
    if (!firstTaggedUser) return false;
    return String(firstTaggedUser.userId) === String(taggingUserId);
  }, [taggingUserId, firstTaggedUser, taggedUsers.length]);

  // ── ACCESS CHECK ───────────────────────────────────────────────────────────
  // User is auto-set from session. Check if they can manage tagging.
  useEffect(() => {
    if (!taggingUserId) {
      // No session user - should not happen if properly authenticated
      setAccessStatus("denied");
      return;
    }
    // Always allow access if no tagged users exist (any logged-in user can be first)
    // When tagged users exist, only the first tagged user gets access
    setAccessStatus(canManageTagging ? "allowed" : "denied");
  }, [taggingUserId, canManageTagging, taggedUsers]);

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
  const [userSearch,  setUserSearch]  = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const prevRecordIdRef = useRef(selectedRecordId);

  useEffect(() => {
    if (prevRecordIdRef.current !== selectedRecordId) {
      prevRecordIdRef.current = selectedRecordId;
      setDrafts({});
      setSaving({});
      setPendingUser("");
      setUserSearch("");
      setUserDropdownOpen(false);
    }
  }, [selectedRecordId]);

  useEffect(() => {
    if (!userDropdownOpen) return;

    const handlePointerDown = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
        setUserSearch("");
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setUserDropdownOpen(false);
        setUserSearch("");
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userDropdownOpen]);

  const unusedUsers = useMemo(
    () => users.filter((u) => !taggedUsers.some((t) => t.userId === u.id)),
    [users, taggedUsers]
  );

  const filteredUnusedUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return unusedUsers;

    const filtered = unusedUsers.filter((u) =>
      String(u.label ?? "").toLowerCase().includes(query) ||
      String(u.id ?? "").toLowerCase().includes(query)
    );

    if (pendingUser) {
      const selected = unusedUsers.find((u) => String(u.id) === String(pendingUser));
      if (selected && !filtered.some((u) => String(u.id) === String(selected.id))) {
        return [selected, ...filtered];
      }
    }

    return filtered;
  }, [unusedUsers, userSearch, pendingUser]);

  const canAddUser = unusedUsers.length > 0;
  const taggingDisabled = !selectedRecordId || usersLoading || !users.length || !initComplete;

  const selectedPendingUser = useMemo(
    () => unusedUsers.find((u) => String(u.id) === String(pendingUser)) ?? null,
    [unusedUsers, pendingUser]
  );

  const pendingUserLabel = selectedPendingUser?.label ?? (pendingUser || "+ Add User");

  const openUserDropdown = useCallback(() => {
    if (taggingDisabled) return;
    setUserSearch("");
    setUserDropdownOpen(true);
  }, [taggingDisabled]);

  const closeUserDropdown = useCallback(() => {
    setUserDropdownOpen(false);
    setUserSearch("");
  }, []);

  const toggleUserDropdown = useCallback(() => {
    if (taggingDisabled) return;
    if (userDropdownOpen) {
      closeUserDropdown();
      return;
    }
    openUserDropdown();
  }, [taggingDisabled, userDropdownOpen, closeUserDropdown, openUserDropdown]);

  const handlePickUser = useCallback((userId) => {
    setPendingUser(userId);
    closeUserDropdown();
  }, [closeUserDropdown]);

  // ── Handlers ──────────────────────────────────────────────────────────

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
    
    if (chkErr || !exists) {
      const trackingRow = trackingRows.find(r => 
        String(r.id) === selectedRecordId || 
        String(r.tracking_encocode) === selectedRecordId ||
        String(r.encoCode) === selectedRecordId
      );
      
      let encoCode = trackingRow?.encoCode || trackingRow?.tracking_encocode;
      let encounterType = trackingRow?.encounterType || trackingRow?.encounter_type || "";
      
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
      
      if (!encoCode) {
        encoCode = selectedRecordId;
      }
      
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
      
      if (String(upserted.id) !== selectedRecordId) {
        setSelectedRecordId(String(upserted.id));
      }
      
      exists = upserted;
    }

    // ── Step 2: Fetch LIVE assignments from DB ───────
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

    // ── Step 3: Check if this user is already tagged ─────────
    const alreadyTagged = liveAssignments.some(
      (r) => String(r.user_id) === String(pendingUser)
    );
    if (alreadyTagged) {
      push("This user is already tagged on this record.", "info");
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

    if (orders.length !== orderSet.size) {
      push("Tag order inconsistency detected. Please refresh and resolve duplicates before adding a new user.", "error");
      return;
    }

    if (orders.length > 0 && !orderSet.has(1)) {
      push("Tag order is missing the 1st tag. Please resolve existing tags first.", "error");
      return;
    }

    // ── Step 5: Compute next tag_order ─────────
    let newOrder = 1;
    if (orders.length > 0) {
      newOrder = orders[orders.length - 1] + 1;
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

    // ── Step 7: Sync local state from DB ───────────
    await fetchAllData();

    const uLabel = users.find((u) => u.id === pendingUser)?.label ?? pendingUser;
    push(`Tagged ${uLabel} as #${newOrder} — ${tagCfg(newOrder).label}`);
    setPendingUser("");
    setUserSearch("");
    setUserDropdownOpen(false);
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

    await supabase.from("user_seq_assignment").delete().eq("user_id", userId);
    setStepAssign((p) => {
      const n = { ...p };
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

    const currentAssignments = stepAssign[step.key] || [];
    const alreadyAssigned = currentAssignments.some(a => a.userId === userId);
    if (alreadyAssigned) {
      push(`${users.find(u => u.id === userId)?.label ?? userId} is already assigned to "${step.label}".`, "info");
      setDrafts((p) => { const n = { ...p }; delete n[step.key]; return n; });
      return;
    }

    setSaving((p) => ({ ...p, [step.key]: true }));

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

  function handleUserSearchChange(value) {
    setUserSearch(value);
    if (!userDropdownOpen) {
      setUserDropdownOpen(true);
    }
  }

    // ── Access gate: checking ─────────────────────────────────────────────────
  if (accessStatus === "checking") {
    return (
      <div className="tagging-container">
        <header className="tagging-header">
          <div className="tagging-header-top">
            <div className="tagging-patient-info">
              <h1>CHART Tagging System</h1>
            </div>
          </div>
        </header>
        <div className="tagging-panel" style={{ textAlign: "center", padding: "3rem" }}>
          <div className="tagging-checking">
            <span className="tagging-spinner" />
            <p>Checking access…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Access gate: denied ────────────────────────────────────────────────────
  if (accessStatus === "denied") {
    return (
      <AccessDenied
        userName={taggingUserName}
        onSwitchUser={onBackToTracking}
        onBack={onBackToTracking}
      />
    );
  }

  // ── Normal render ─────────────────────────────────────────────────────────
  return (
    <div className="tagging-container">
      <div className="tagging-toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`}>{t.msg}</div>
        ))}
      </div>

      {/* Header - Consistent with forms module */}
      <header className="tagging-header">
        <div className="tagging-header-top">
          <div className="tagging-patient-info">
            <h1>CHART User Tagging</h1>
            {taggingUserName && (
              <p className="tagging-encounter-info">
                Viewing as: <strong>{taggingUserName?.toUpperCase()}</strong>
                {taggedUsers.find((t: { userId: string }) => String(t.userId) === String(taggingUserId))?.tagOrder === 1 && (
                  <span className="badge-super">SUPER USER</span>
                )}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Controls bar */}
      <div className="tagging-controls">
        <div className="tagging-status">
          {usersLoading && <span className="tagging-spinner" />}
          {usersError && <span className="tagging-err-text">{usersError}</span>}
          {!usersLoading && !usersError && <span className="tagging-count">{users.length} users loaded</span>}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => { refreshUsers(); fetchAllData(); }}>↺ Refresh</button>
      </div>

      <nav className="tagging-nav">
        <button className="btn btn-ghost" onClick={onBackToTracking}>
          ← Back to Tracking
        </button>
      </nav>

      <div className="tagging-panel">
        <div className="tagging-panel-topbar">
          <div>
            <h2 className="tagging-panel-title">Tagging Panel</h2>
            <p className="tagging-panel-sub">Assign users to records and workflow steps.</p>
          </div>
        </div>

                    {!initComplete && (
            <div className="notice notice--loading">
              ⏳ Initializing records…
            </div>
          )}
          {initError && (
            <div className="notice notice--error">⚠️ {initError}</div>
          )}

          {initComplete && selectedRecordId && (
            <>
              {/* ── USER TAGGING ORDER ─────────────────────────────────── */}
              <div className="tagging-section">
                <p className="tagging-section-cap">USER TAGGING ORDER</p>
                <p className="tagging-section-desc">
                  The 1st tagged user gets full access to all steps and can manage all tagging.
                  Only the 1st user can add, remove, or manage other users.
                  Tag more users to restrict their access to specific steps only.
                  Each user can only be tagged once and follows a strict sequence (1 → 2 → 3 → 4).
                </p>

                {taggedUsers.length > 0 && (
                  <div className="tagging-user-list">
                    {taggedUsers.map((tu) => {
                      const cfg       = tagCfg(tu.tagOrder);
                      const uName     = users.find((u) => u.id === tu.userId)?.label ?? tu.userId;
                      const stepCount = Object.values(stepAssign).filter((assignments) => {
                        if (Array.isArray(assignments)) {
                          return assignments.some(a => a.userId === tu.userId);
                        }
                        return assignments?.userId === tu.userId;
                      }).length;
                      const isCurrent = String(tu.userId) === String(taggingUserId);
                      return (
                        <div key={tu.rowId} className="tagging-user-row">
                          <span className="tagging-order-badge" style={{ color: cfg.color, background: cfg.bg }}>
                            #{tu.tagOrder}
                          </span>
                          <span className="tagging-user-name">
                            {uName.toUpperCase()}
                            {isCurrent && tu.tagOrder === 1 && <span style={{ marginLeft: ".5rem", fontSize: ".75rem", opacity: .7 }}></span>}
                          </span>
                          <span className="tagging-user-role">{cfg.label}</span>
                          {tu.tagOrder === 1
                            ? <span className="tagging-step-count-pill tagging-step-count-pill--full">All {steps.length} steps</span>
                            : <span className="tagging-step-count-pill">{stepCount} step{stepCount !== 1 ? "s" : ""} assigned</span>
                          }
                          <button
                            className="btn-remove"
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
                  <div className="notice notice--hint">
                    No users tagged yet. Add the first user below to begin.
                  </div>
                )}

                                {canAddUser && canManageTagging && (
                  <div className="tagging-add-row">
                    <div className="tagging-user-picker" ref={userDropdownRef}>
                      <button
                        type="button"
                        className={`tagging-user-picker-trigger ${userDropdownOpen ? "tagging-user-picker-trigger--open" : ""}`}
                        onClick={toggleUserDropdown}
                        disabled={taggingDisabled}
                        aria-expanded={userDropdownOpen}
                        aria-haspopup="listbox"
                      >
                        <span className="tagging-user-picker-trigger-label">{pendingUserLabel}</span>
                        <span className="tagging-user-picker-caret">▾</span>
                      </button>

                      {userDropdownOpen && !taggingDisabled && (
                        <div className="tagging-user-picker-panel">
                          <input
                            className="tagging-user-search"
                            type="text"
                            placeholder="Search user to add…"
                            value={userSearch}
                            onChange={(e) => handleUserSearchChange(e.target.value)}
                            autoFocus
                          />
                          <div className="tagging-user-picker-list" role="listbox" aria-label="Users">
                            {filteredUnusedUsers.length > 0 ? (
                              filteredUnusedUsers.map((u) => {
                                const isSelected = String(pendingUser) === String(u.id);
                                return (
                                  <button
                                    key={u.id}
                                    type="button"
                                    className={`tagging-user-picker-option ${isSelected ? "tagging-user-picker-option--selected" : ""}`}
                                    onClick={() => handlePickUser(u.id)}
                                    role="option"
                                    aria-selected={isSelected}
                                  >
                                    {u.label}
                                  </button>
                                );
                              })
                            ) : (
                              <div className="tagging-user-picker-empty">No matching users</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      className="btn btn-primary"
                      onClick={handleAddUser}
                      disabled={!pendingUser || taggingDisabled}
                    >
                      Add
                    </button>
                  </div>
                )}

                {!canAddUser && (
                  <p className="notice notice--hint">💡 All available users have been tagged for this record.</p>
                )}

                {taggedUsers.length > 0 && !canManageTagging && (
                  <p className="notice notice--error">Only the 1st tagged user (#1) can add or remove users.</p>
                )}
              </div>

              {/* ── STEP ASSIGNMENTS ───────────────────────────────────── */}
              {canManageTagging && (
                <div className="tagging-section">
                  <p className="tagging-section-cap">STEP ASSIGNMENTS</p>
                  <p className="tagging-section-desc">
                    {stepsEnabled
                      ? "Select a user in each step's dropdown, then click Assign."
                      : taggedUsers.length === 0
                        ? "Tag at least one user above to begin."
                        : "Add a 2nd user above — the 1st user already has full access to all steps."}
                  </p>

                  {!stepsEnabled && taggedUsers.length > 0 && (
                    <div className="notice notice--hint">
                      Tag a 2nd user above to start assigning specific steps to them.
                    </div>
                  )}

                  {stepsLoading ? (
                    <p className="notice notice--loading">Loading steps…</p>
                  ) : (
                    <div className="tagging-step-grid">
                      {steps.map((step, idx) => {
                        const assignedList = stepAssign[step.key] || [];
                        const isSaving  = saving[step.key] ?? false;
                        const draftVal  = drafts[step.key] ?? "";
                        const hasAssigned = assignedList.length > 0;
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
                            className={`tagging-step-card ${hasAssigned ? "tagging-step-card--assigned" : "tagging-step-card--remaining"}`}
                            style={hasAssigned && assignedList[0] ? {
                              borderColor: tagCfg(
                                taggedUsers.find(u => u.userId === assignedList[0].userId)?.tagOrder ?? 1
                              ).color + "44",
                              background:  `linear-gradient(160deg, #fff 55%, ${tagCfg(
                                taggedUsers.find(u => u.userId === assignedList[0].userId)?.tagOrder ?? 1
                              ).bg} 100%)`,
                            } : {}}
                          >
                            <div className="tagging-step-head">
                              <span className="tagging-step-name">{step.label}</span>
                              <span className="tagging-step-num">Step {idx + 1}</span>
                              {hasAssigned && (
                                <span className="tagging-step-count-badge">{assignedList.length} assigned</span>
                              )}
                            </div>

                            <div className="tagging-step-badge-wrap">
                              {hasAssigned ? (
                                <div className="tagging-assigned-users-list">
                                  {assignedList.map((assignment) => {
                                    const tu = taggedUsers.find((u) => u.userId === assignment.userId);
                                    const cfg = tu ? tagCfg(tu.tagOrder) : null;
                                    return (
                                      <div key={assignment.rowId} className="tagging-assigned-user-item">
                                        <span 
                                          className="tagging-step-badge" 
                                          style={{ background: cfg?.bg, color: cfg?.color }}
                                        >
                                          {assignment.userName.toUpperCase()}
                                        </span>
                                        <button
                                          className="tagging-remove-assign-btn"
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
                                <span className="tagging-step-badge tagging-step-badge--none">Unassigned</span>
                              )}
                            </div>

                            <select
                              className="tagging-step-dropdown"
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

                            <div className="tagging-step-owner">
                              {hasAssigned ? (
                                <span className="chip chip--teal" style={{ 
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
                                <span className="chip chip--amber">Unassigned (remaining)</span>
                              )}
                            </div>

                            <div className="tagging-step-actions">
                              <button
                                className="btn btn-assign"
                                disabled={!canAssign}
                                onClick={() => handleAssignStep(step, draftVal)}
                              >
                                {isSaving ? "Saving…" : "Assign"}
                              </button>
                              <button
                                className="btn btn-clear"
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

              {/* ── ACCESS SUMMARY ── */}
              {taggedUsers.length > 0 && !stepsLoading && (
                <div className="tagging-section">
                  <p className="tagging-section-cap">ACCESS SUMMARY</p>
                  <p className="tagging-section-desc">Overview of what each tagged user can access.</p>
                  <div className="tagging-summary">
                    {taggedUsers.map((tu) => {
                      const cfg     = tagCfg(tu.tagOrder);
                      const uName   = users.find((u) => u.id === tu.userId)?.label ?? tu.userId;
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
                          className="tagging-summary-row"
                          style={{ "--row-accent": cfg.color, "--row-bg": cfg.bg }}
                        >
                          <div className="tagging-summary-meta">
                            <div style={{ display: "flex", alignItems: "center", gap: ".45rem" }}>
                              <span
                                className="tagging-order-badge"
                                style={{ color: cfg.color, background: cfg.bg, fontSize: ".65rem" }}
                              >
                                #{tu.tagOrder}
                              </span>
                              <strong className="tagging-summary-name">{uName.toUpperCase()}</strong>
                            </div>
                            <span className="tagging-summary-role" style={{ color: cfg.color }}>
                              {cfg.label}
                            </span>
                          </div>
                          <div className="tagging-summary-chips">
                            {mySteps.length > 0
                              ? mySteps.map((l) => (
                                  <span
                                    key={l}
                                    className="chip"
                                    style={{ background: cfg.bg, color: cfg.color, opacity: .85 }}
                                  >
                                    {l}
                                  </span>
                                ))
                                                            : <span className="chip chip--empty">No steps assigned yet</span>}
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
      </div>
  );
}

