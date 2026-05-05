import { useState, useEffect, useCallback } from "react";

const SESSION_KEY = "chart_active_user";
const SESSION_NAME_KEY = "chart_active_user_name";

export function useUserSession() {
  const [currentUserId, setCurrentUserId] = useState(
    () => localStorage.getItem(SESSION_KEY) ?? null,
  );
  const [currentUserName, setCurrentUserName] = useState(
    () => localStorage.getItem(SESSION_NAME_KEY) ?? null,
  );

  function setUser(userId, userName) {
    localStorage.setItem(SESSION_KEY, userId);
    localStorage.setItem(SESSION_NAME_KEY, userName ?? userId);
    setCurrentUserId(userId);
    setCurrentUserName(userName ?? userId);
  }

  function clearUser() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_NAME_KEY);
    setCurrentUserId(null);
    setCurrentUserName(null);
  }

  return { currentUserId, currentUserName, setUser, clearUser };
}
