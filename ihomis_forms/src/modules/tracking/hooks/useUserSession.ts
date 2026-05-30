import { useState, useEffect, useCallback } from "react";

const SESSION_KEY = "chart_active_user";
const SESSION_NAME_KEY = "chart_active_user_name";
const SESSION_DEPTCODE_KEY = "chart_active_user_deptcode";
const SESSION_EMAIL_KEY = "chart_active_user_email";

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
  const [currentUserEmail, setCurrentUserEmail] = useState(
    () => localStorage.getItem(SESSION_EMAIL_KEY) ?? null,
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
    // Always update email if provided, or clear if not
    const email = userData?.email ?? userData?.data?.email ?? null;
    if (email) {
      localStorage.setItem(SESSION_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(SESSION_EMAIL_KEY);
    }
    setCurrentUserEmail(email);
    setCurrentUserId(userId);
    setCurrentUserName(userName ?? userId);
  }

  function clearUser() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_NAME_KEY);
    localStorage.removeItem(SESSION_DEPTCODE_KEY);
    localStorage.removeItem(SESSION_EMAIL_KEY);
    setCurrentUserId(null);
    setCurrentUserName(null);
    setCurrentUserDeptcode(null);
    setCurrentUserEmail(null);
  }

  return { currentUserId, currentUserName, currentUserDeptcode, currentUserEmail, setUser, clearUser };
}
