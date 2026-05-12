import { useEffect, useState } from "react";
import "./UserPicker.css";

export default function UserPicker({ onSelect }) {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [chosen,  setChosen]  = useState("");
  const [search,  setSearch]  = useState("");

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

        setUsers(list.map((u, i) => {
          const id    = String(u?.user_id ?? u?.id ?? u?.userId ?? u?.uid ?? u?.email ?? i);
          const label = u?.full_name ?? u?.displayName ?? u?.fullName ?? u?.name ?? u?.username ?? u?.email ?? String(i);
          const isSuperUser = !!(u?.super_user ?? u?.is_super ?? u?.is_admin ?? u?.admin ?? (u?.role === 'admin' || u?.role === 'super'));
          return { id, label, isSuperUser };
        }));
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
        {loading && (
          <div className="up-loading">
            <span className="up-spinner" />
            Loading users…
          </div>
        )}

        {error && <p className="up-error">{error}</p>}

        {!loading && !error && (
          <>
            <div className="up-search">
              <svg className="up-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                className="up-search-input"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search users"
              />
              {search && (
                <button
                  className="up-search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <div className="up-list" role="listbox" aria-label="Select user">
              {users.filter((u) =>
                u.label.toLowerCase().includes(search.toLowerCase())
              ).map((u) => (
                <button
                  key={u.id}
                  role="option"
                  aria-selected={chosen === u.id}
                  className={`up-user-btn${chosen === u.id ? " up-user-btn--selected" : ""}`}
                  onClick={() => setChosen(u.id)}
                >
                  <span className="up-avatar" style={{ fontFamily: "inherit" }} aria-hidden="true">
                    {u.label.charAt(0).toUpperCase()}
                  </span>
                  <span className="up-user-name" style={{ fontFamily: "inherit" }}>{u.label.toUpperCase()}</span>
                  {chosen === u.id && (
                    <span className="up-check" aria-hidden="true">✓</span>
                  )}
                </button>
              ))}
              {users.filter((u) =>
                u.label.toLowerCase().includes(search.toLowerCase())
              ).length === 0 && (
                <p className="up-no-results">No users found matching "{search}"</p>
              )}
            </div>
          </>
        )}

        <button
          className="up-confirm"
          disabled={!chosen}
          onClick={handleConfirm}
        >
          Continue as {users.find((u) => u.id === chosen)?.label?.toUpperCase() ?? "…"}
        </button>
      </div>
    </div>
  );
}