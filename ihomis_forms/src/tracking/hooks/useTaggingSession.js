/**
 * useTaggingSession - Standalone user session hook for tagging operations
 * 
 * This hook manages its own independent user session for the tagging module.
 * It does NOT inherit or share state with the tracking module's user picker.
 * 
 * Session is persisted in localStorage under a separate key to ensure isolation.
 */

import { useCallback, useEffect, useState } from "react";

const TAGGING_SESSION_KEY = "tagging_session_user";

function normalizeUser(u, i) {
  const id    = String(u?.user_id ?? u?.id ?? u?.userId ?? u?.uid ?? u?.email ?? i);
  const label = u?.full_name ?? u?.displayName ?? u?.fullName ?? u?.name
             ?? u?.username ?? u?.email ?? id;
  return { id, label, raw: u };
}

export function useTaggingSession() {
  const [taggingUser,     setTaggingUser]     = useState(null); // { id, name }
  const [taggingUserId,   setTaggingUserId]   = useState(null);
  const [taggingUserName, setTaggingUserName] = useState(null);
  const [users,           setUsers]           = useState([]);
  const [usersLoading,    setUsersLoading]    = useState(true);
  const [usersError,      setUsersError]      = useState("");
  const [initialized,     setInitialized]     = useState(false);

  // ── Load users from API ────────────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    const url = import.meta.env.VITE_TRACKING_USERS;
    if (!url) {
      setUsersError("VITE_TRACKING_USERS not set.");
      setUsersLoading(false);
      return;
    }
    setUsersLoading(true);
    setUsersError("");
    try {
      const res  = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw  = await res.json();
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)  ? raw.data
        : Array.isArray(raw?.users) ? raw.users
        : [];
      setUsers(list.map(normalizeUser));
    } catch (e) {
      setUsersError(e.message);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // ── Restore session from localStorage on mount ───────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TAGGING_SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id && parsed?.name) {
          setTaggingUser(parsed);
          setTaggingUserId(parsed.id);
          setTaggingUserName(parsed.name);
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
    setInitialized(true);
    loadUsers();
  }, [loadUsers]);

  // ── Persist session to localStorage ───────────────────────────────────────
  useEffect(() => {
    if (!initialized) return;
    if (taggingUser) {
      localStorage.setItem(TAGGING_SESSION_KEY, JSON.stringify(taggingUser));
    } else {
      localStorage.removeItem(TAGGING_SESSION_KEY);
    }
  }, [taggingUser, initialized]);

  // ── Select a user as the tagging session user ─────────────────────────────
  const selectTaggingUser = useCallback((userId, userName) => {
    setTaggingUser({ id: userId, name: userName });
    setTaggingUserId(userId);
    setTaggingUserName(userName);
  }, []);

  // ── Clear the tagging session ────────────────────────────────────────────
  const clearTaggingSession = useCallback(() => {
    setTaggingUser(null);
    setTaggingUserId(null);
    setTaggingUserName(null);
    localStorage.removeItem(TAGGING_SESSION_KEY);
  }, []);

  // ── Refresh users list ────────────────────────────────────────────────────
  const refreshUsers = useCallback(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    // Current tagging user (null if not logged in)
    taggingUser,
    taggingUserId,
    taggingUserName,
    
    // Is user logged in to tagging?
    isLoggedIn: !!taggingUserId,
    
    // Available users
    users,
    usersLoading,
    usersError,
    
    // Actions
    selectTaggingUser,
    clearTaggingSession,
    refreshUsers,
  };
}
