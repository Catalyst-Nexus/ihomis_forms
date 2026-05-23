import { useState, useCallback } from "react";

const SESSION_KEY = "chart_active_user";
const SESSION_NAME_KEY = "chart_active_user_name";

export function useCurrentUser() {
  const [currentUserId] = useState(
    () => localStorage.getItem(SESSION_KEY) ?? null,
  );
  const [currentUserName] = useState(
    () => localStorage.getItem(SESSION_NAME_KEY) ?? null,
  );

  return { currentUserId, currentUserName };
}