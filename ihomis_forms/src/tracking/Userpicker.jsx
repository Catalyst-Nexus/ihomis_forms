import { useEffect, useState } from "react";
import "./UserPicker.css";

/**
 * UserPicker
 * Shown when no active session exists. Fetches users from VITE_TRACKING_USERS
 * and lets one select their identity. Calls onSelect(userId, userName).
 */
export default function UserPicker({ onSelect }) {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [chosen,  setChosen]  = useState("");

  useEffect(() => {
    const url = import.meta.env.VITE_TRACKING_USERS;
    if (!url) { setError("VITE_TRACKING_USERS is not configured."); setLoading(false); return; }

    (async () => {
      try {
        const res  = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw  = await res.json();
        const list = Array.isArray(raw)        ? raw
                   : Array.isArray(raw?.data)  ? raw.data
                   : Array.isArray(raw?.users) ? raw.users
                   : [];

        setUsers(list.map((u, i) => ({
          id:    String(u?.user_id ?? u?.id ?? u?.userId ?? u?.uid ?? u?.email ?? i),
          label: u?.full_name ?? u?.displayName ?? u?.fullName ?? u?.name ?? u?.username ?? u?.email ?? String(i),
        })));
      } catch (e) {
        setError(`Failed to load users: ${e.message}`);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function handleConfirm() {
    const user = users.find((u) => u.id === chosen);
    if (user) onSelect(user.id, user.label);
  }

  return (
    <div className="userpicker-bg">
      {/* Decorative orbs */}
      <span className="up-orb up-orb--1" aria-hidden="true" />
      <span className="up-orb up-orb--2" aria-hidden="true" />
      <span className="up-orb up-orb--3" aria-hidden="true" />

      <div className="up-card">
        <div className="up-logo" aria-hidden="true">
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
            <rect width="38" height="38" rx="12" fill="#1f9d95"/>
            <path d="M10 19c0-5 4-9 9-9s9 4 9 9-4 9-9 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="19" cy="19" r="3.5" fill="#fff"/>
          </svg>
        </div>

        <h1 className="up-heading">CHART System</h1>
        <p className="up-sub">Agusan del Norte Provincial Health Office</p>

        <div className="up-divider" />

        <p className="up-prompt">Who are you?</p>
        <p className="up-hint">Select your name to continue. Your session will be saved locally.</p>

        {loading && (
          <div className="up-loading">
            <span className="up-spinner" />
            Loading users…
          </div>
        )}

        {error && <p className="up-error">{error}</p>}

        {!loading && !error && (
          <div className="up-list" role="listbox" aria-label="Select user">
            {users.map((u) => (
              <button
                key={u.id}
                role="option"
                aria-selected={chosen === u.id}
                className={`up-user-btn${chosen === u.id ? " up-user-btn--selected" : ""}`}
                onClick={() => setChosen(u.id)}
              >
                <span className="up-avatar" aria-hidden="true">
                  {u.label.charAt(0).toUpperCase()}
                </span>
                <span className="up-user-name">{u.label}</span>
                {chosen === u.id && (
                  <span className="up-check" aria-hidden="true">✓</span>
                )}
              </button>
            ))}
          </div>
        )}

        <button
          className="up-confirm"
          disabled={!chosen}
          onClick={handleConfirm}
        >
          Continue as {users.find((u) => u.id === chosen)?.label ?? "…"}
        </button>
      </div>
    </div>
  );
}