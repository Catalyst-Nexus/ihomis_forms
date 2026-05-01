const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim();

const LAB_UPLOAD_API_URL = (
  import.meta.env.VITE_LAB_UPLOAD_API_URL || ""
).trim();

const LAB_UPLOAD_CONTEXT_URL = (
  import.meta.env.VITE_LAB_UPLOAD_CONTEXT_URL ||
  (API_BASE_URL
    ? `${API_BASE_URL.replace(/\/+$/, "")}/api/db/henctr?limit=1`
    : "")
).trim();

const LAB_UPLOAD_PATIENT_SEARCH_URL = (
  import.meta.env.VITE_LAB_PATIENT_SEARCH_URL ||
  (API_BASE_URL
    ? `${API_BASE_URL.replace(/\/+$/, "")}/api/db/patients`
    : LAB_UPLOAD_CONTEXT_URL)
).trim();

const LAB_UPLOAD_API_TOKEN = (
  import.meta.env.VITE_LAB_UPLOAD_API_TOKEN || ""
).trim();

const defaultRequestContext = {
  panelName: "Laboratory Request",
  requestedAt: "",
  user: "",
  identifiers: {
    enccode: "",
    fhud: "",
    docointkey: "",
  },
  patient: {
    firstName: "",
    middleName: "",
    lastName: "",
  },
  hasAnyContext: false,
};

export {
  API_BASE_URL,
  LAB_UPLOAD_API_TOKEN,
  LAB_UPLOAD_API_URL,
  LAB_UPLOAD_CONTEXT_URL,
  LAB_UPLOAD_PATIENT_SEARCH_URL,
  defaultRequestContext,
};
