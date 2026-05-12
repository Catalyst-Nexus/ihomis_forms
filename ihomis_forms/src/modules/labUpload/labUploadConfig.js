const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim();

const LAB_UPLOAD_CONTEXT_URL = (
  import.meta.env.VITE_LAB_UPLOAD_CONTEXT_URL ||
  (API_BASE_URL
    ? `${API_BASE_URL.replace(/\/+$/, "")}/api/db/henctr?limit=1`
    : "")
).trim();

const LAB_UPLOAD_PATIENT_SEARCH_URL = (
  import.meta.env.VITE_LAB_PATIENT_SEARCH_URL ||
  (API_BASE_URL ? `${API_BASE_URL.replace(/\/+$/, "")}/api/db/patients` : "")
).trim();

const LAB_UPLOAD_API_TOKEN = (
  import.meta.env.VITE_LAB_UPLOAD_API_TOKEN || ""
).trim();

const LAB_UPLOAD_SUPABASE_BUCKET = (
  import.meta.env.VITE_SUPABASE_LAB_RESULTS_BUCKET || "lab-results"
).trim();

const LAB_UPLOAD_SUPABASE_TABLE = (
  import.meta.env.VITE_SUPABASE_LAB_RESULTS_TABLE || "lab_result_uploads"
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
  LAB_UPLOAD_CONTEXT_URL,
  LAB_UPLOAD_PATIENT_SEARCH_URL,
  LAB_UPLOAD_SUPABASE_BUCKET,
  LAB_UPLOAD_SUPABASE_TABLE,
  defaultRequestContext,
};
