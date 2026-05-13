const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim();

const VALIDATION_API_URL = (
  import.meta.env.VITE_VALIDATION_API_URL ||
  import.meta.env.VITE_VALIDATION_API ||
  (API_BASE_URL ? `${API_BASE_URL.replace(/\/+$/, "")}/api/validation` : "")
).trim();

export function getValidationApiBaseUrl() {
  return VALIDATION_API_URL;
}
