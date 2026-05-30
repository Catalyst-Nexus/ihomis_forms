import { useState, useEffect, useCallback } from "react";

const SESSION_KEY = "chart_active_user";
const SESSION_NAME_KEY = "chart_active_user_name";
const SESSION_DEPTCODE_KEY = "chart_active_user_deptcode";

export function useUserSession() {
  const [currentUserId, setCurrentUserId] = useState(
    () => localStorage.getItem(SESSION_KEY) ?? null,
  );
  const [currentUserName, setCurrentUserName] = useState(
    () => localStorage.getItem(SESSION_NAME_KEY) ?? null,
  );
  const [currentUserDeptcode, setCurrentUserDeptcode] = useState(
    () => localStorage.getItem(SESSION_DEPTCODE_KEY) ?? null,
  );

  function setUser(userId, userName, userData = null) {
    localStorage.setItem(SESSION_KEY, userId);
    localStorage.setItem(SESSION_NAME_KEY, userName ?? userId);
    // Always update deptcode if provided, or clear if not
    const deptcode = userData?.deptcode ?? null;
    if (deptcode) {
      localStorage.setItem(SESSION_DEPTCODE_KEY, deptcode);
    } else {
      localStorage.removeItem(SESSION_DEPTCODE_KEY);
    }
    setCurrentUserDeptcode(deptcode);
    setCurrentUserId(userId);
    setCurrentUserName(userName ?? userId);
  }

  function clearUser() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_NAME_KEY);
    localStorage.removeItem(SESSION_DEPTCODE_KEY);
    setCurrentUserId(null);
    setCurrentUserName(null);
    setCurrentUserDeptcode(null);
  }

  return { currentUserId, currentUserName, currentUserDeptcode, setUser, clearUser };
}
