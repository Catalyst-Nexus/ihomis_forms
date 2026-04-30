import { useEffect, useMemo, useState } from "react";
import "./Tagging.css";

const TRACKING_STEPS = [
  { key: "phic", label: "PHIC" },
  { key: "records_received", label: "Records Received" },
  { key: "verify", label: "Verify" },
  { key: "scan", label: "Scan" },
  { key: "send", label: "Send" },
  { key: "records_filed", label: "Records Filed" },
  { key: "claim_map", label: "Claim Map" },
  { key: "acpm", label: "ACPM" },
];

function Tagging({
  selectedPatient,
  trackingRows = [],
  onBackToTracking,
  onChangePatient,
  tagUsers = [],
  tagUsersLoading = false,
  tagUsersError = "",
  onAssignTag,
  onClearTag,
  onRefreshTagUsers,
}) {
  const [taggedRecordId, setTaggedRecordId] = useState(
    () => trackingRows[0]?.id ?? "",
  );
  const [tagAssignmentsByRecord, setTagAssignmentsByRecord] = useState({});
  const [tagDraftsByRecord, setTagDraftsByRecord] = useState({});

  const normalizedUsers = useMemo(
    () =>
      tagUsers
        .map((user, index) => {
          const id =
            user?.id ??
            user?.user_id ??
            user?.userId ??
            user?.uid ??
            user?.username ??
            user?.email ??
            String(index);
          const label =
            user?.displayName ??
            user?.fullName ??
            user?.name ??
            user?.username ??
            user?.email ??
            id;

          return { id, label, raw: user };
        })
        .filter((user) => user.id),
    [tagUsers],
  );

  useEffect(() => {
    if (trackingRows.length === 0) {
      setTaggedRecordId("");
      return;
    }

    const recordExists = trackingRows.some((row) => row.id === taggedRecordId);
    if (!recordExists) {
      setTaggedRecordId(trackingRows[0].id);
    }
  }, [taggedRecordId, trackingRows]);

  const activeAssignments = tagAssignmentsByRecord[taggedRecordId] ?? {};
  const activeDrafts = tagDraftsByRecord[taggedRecordId] ?? {};
  const hasUsers = normalizedUsers.length > 0;
  const taggingDisabled = !taggedRecordId || tagUsersLoading || !hasUsers;

  function handleDraftChange(stepKey, userId) {
    if (!taggedRecordId) {
      return;
    }

    setTagDraftsByRecord((prev) => ({
      ...prev,
      [taggedRecordId]: {
        ...(prev[taggedRecordId] ?? {}),
        [stepKey]: userId,
      },
    }));
  }

  function handleAssign(stepKey) {
    if (!taggedRecordId) {
      return;
    }

    const userId = activeDrafts[stepKey];
    if (!userId) {
      return;
    }

    const selectedUser = normalizedUsers.find((user) => user.id === userId);
    const assignment = {
      userId,
      userName: selectedUser?.label ?? userId,
      assignedAt: new Date().toISOString(),
    };

    setTagAssignmentsByRecord((prev) => ({
      ...prev,
      [taggedRecordId]: {
        ...(prev[taggedRecordId] ?? {}),
        [stepKey]: assignment,
      },
    }));

    if (onAssignTag) {
      onAssignTag({
        recordId: taggedRecordId,
        stepKey,
        userId,
        user: selectedUser?.raw ?? null,
      });
    }
  }

  function handleClear(stepKey) {
    if (!taggedRecordId) {
      return;
    }

    setTagAssignmentsByRecord((prev) => {
      const updatedAssignments = { ...(prev[taggedRecordId] ?? {}) };
      delete updatedAssignments[stepKey];

      return {
        ...prev,
        [taggedRecordId]: updatedAssignments,
      };
    });

    setTagDraftsByRecord((prev) => {
      const updatedDrafts = { ...(prev[taggedRecordId] ?? {}) };
      delete updatedDrafts[stepKey];

      return {
        ...prev,
        [taggedRecordId]: updatedDrafts,
      };
    });

    if (onClearTag) {
      onClearTag({ recordId: taggedRecordId, stepKey });
    }
  }

  return (
    <div className="tagging-page">
      <main className="tagging-shell">
        <header className="tagging-title-box">
          <h1>Agusan del Norte Provincial Health Office</h1>
          <p>CHART Tagging System</p>
          {selectedPatient ? (
            <small>Selected Patient: {selectedPatient.displayName}</small>
          ) : null}
        </header>

        <section className="tagging-actions">
          <button type="button" onClick={onBackToTracking}>
            Back to Tracking
          </button>
          <button type="button" onClick={onChangePatient}>
            Change Patient
          </button>
        </section>

        <section className="tagging-panel" aria-label="Tagging panel">
          <div className="tagging-panel-header">
            <div>
              <h2>Tagging Panel</h2>
              <p>Assign users from the API to each tracking step.</p>
            </div>
            <div className="tagging-panel-summary">
              {tagUsersLoading ? (
                <span>Loading users...</span>
              ) : tagUsersError ? (
                <span className="tagging-panel-error">{tagUsersError}</span>
              ) : (
                <span>{normalizedUsers.length} users loaded</span>
              )}
              <button
                type="button"
                onClick={onRefreshTagUsers}
                disabled={!onRefreshTagUsers}
              >
                Refresh Users
              </button>
            </div>
          </div>

          <div className="tagging-panel-controls">
            <label htmlFor="tagging-record">Select Record</label>
            <select
              id="tagging-record"
              value={taggedRecordId}
              onChange={(event) => setTaggedRecordId(event.target.value)}
              disabled={trackingRows.length === 0}
            >
              {trackingRows.length === 0 ? (
                <option value="">No records available</option>
              ) : (
                trackingRows.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.patientName} ({row.hospitalNo})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="tagging-board">
            {TRACKING_STEPS.map((step, index) => {
              const assignedUser = activeAssignments[step.key];
              const draftValue = activeDrafts[step.key] ?? "";

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
                      value={draftValue}
                      onChange={(event) =>
                        handleDraftChange(step.key, event.target.value)
                      }
                      disabled={taggingDisabled}
                    >
                      <option value="">
                        {hasUsers ? "Select user" : "No users loaded"}
                      </option>
                      {normalizedUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="tagging-status">
                    <span>Current:</span>
                    <strong>
                      {assignedUser ? assignedUser.userName : "Unassigned"}
                    </strong>
                  </div>

                  <div className="tagging-actions-row">
                    <button
                      type="button"
                      onClick={() => handleAssign(step.key)}
                      disabled={taggingDisabled || !draftValue}
                    >
                      Tag
                    </button>
                    <button
                      type="button"
                      className="tagging-clear"
                      onClick={() => handleClear(step.key)}
                      disabled={!assignedUser}
                    >
                      Clear
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Tagging;
