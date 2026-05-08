/**
 * TaggingUserPicker
 * 
 * A standalone user picker component for the tagging module.
 * Uses users passed from useTaggingSession hook (not its own internal fetch).
 * 
 * Features:
 * - Displays users from the tagging session
 * - Stores selected user in a separate localStorage key
 * - Provides a clean, dedicated UI for tagging user selection
 */

import { useState } from "react";
import "./TaggingUserPicker.css";

export default function TaggingUserPicker({ 
  users = [], 
  usersLoading = false, 
  usersError = "", 
  onSelect, 
  onRefresh 
}) {
  const [chosen,  setChosen]  = useState("");
  const [search,  setSearch]  = useState("");

  function handleConfirm() {
    const user = users.find((u) => u.id === chosen);
    if (user) {
      onSelect(user.id, user.label);
    }
  }

  const filteredUsers = users.filter((u) =>
    u.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="tg-up-bg">
      {/* Decorative orbs */}
      <span className="tg-up-orb tg-up-orb--1" aria-hidden="true" />
      <span className="tg-up-orb tg-up-orb--2" aria-hidden="true" />
      <span className="tg-up-orb tg-up-orb--3" aria-hidden="true" />

      <div className="tg-up-card">
        <div className="tg-up-logo" aria-hidden="true">
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
            <rect width="38" height="38" rx="12" fill="#1f9d95"/>
            <path d="M10 19c0-5 4-9 9-9s9 4 9 9-4 9-9 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="19" cy="19" r="3.5" fill="#fff"/>
          </svg>
        </div>

        <h1 className="tg-up-heading">CHART Tagging System</h1>
        <p className="tg-up-sub">Agusan del Norte Provincial Health Office</p>

        <div className="tg-up-divider" />
        <p className="tg-up-prompt">Select your identity for tagging</p>
        <p className="tg-up-hint">
          Choose your name to manage user tagging. This session is independent from the tracking module.
        </p>

        {usersLoading && (
          <div className="tg-up-loading">
            <span className="tg-up-spinner" />
            Loading users…
          </div>
        )}

        {usersError && (
          <div className="tg-up-error-container">
            <p className="tg-up-error">{usersError}</p>
            <button className="tg-up-refresh-btn" onClick={onRefresh}>
              Retry
            </button>
          </div>
        )}

        {!usersLoading && !usersError && (
          <>
            <div className="tg-up-search">
              <svg className="tg-up-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                className="tg-up-search-input"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search users"
              />
              {search && (
                <button
                  className="tg-up-search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <div className="tg-up-list" role="listbox" aria-label="Select user">
              {filteredUsers.map((u) => (
                <button
                  key={u.id}
                  role="option"
                  aria-selected={chosen === u.id}
                  className={`tg-up-user-btn${chosen === u.id ? " tg-up-user-btn--selected" : ""}`}
                  onClick={() => setChosen(u.id)}
                >
                  <span className="tg-up-avatar" aria-hidden="true">
                    {u.label.charAt(0).toUpperCase()}
                  </span>
                  <span className="tg-up-user-name">{u.label}</span>
                  {chosen === u.id && (
                    <span className="tg-up-check" aria-hidden="true">✓</span>
                  )}
                </button>
              ))}
              {filteredUsers.length === 0 && (
                <p className="tg-up-no-results">No users found: {search || '(empty search)'}</p>
              )}
            </div>
          </>
        )}

        <button
          className="tg-up-confirm"
          disabled={!chosen}
          onClick={handleConfirm}
        >
          Continue as {users.find((u) => u.id === chosen)?.label ?? "…"}
        </button>
      </div>
    </div>
  );
}
