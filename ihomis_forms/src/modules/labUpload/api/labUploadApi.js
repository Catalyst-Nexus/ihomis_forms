import {
  API_BASE_URL,
  LAB_UPLOAD_PATIENT_SEARCH_URL,
} from "../labUploadConfig.js";
import { normalizeLabContextParams } from "../utils/labUploadUtils.js";

function parseResponsePayload(responseText) {
  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}

function getByPath(source, path) {
  const keys = path.split(".");
  let value = source;

  for (const key of keys) {
    if (!value || typeof value !== "object") {
      return "";
    }

    value = value[key];
  }

  return typeof value === "string" ? value.trim() : "";
}

function resolveFirstString(source, candidatePaths) {
  for (const path of candidatePaths) {
    const value = getByPath(source, path);
    if (value) {
      return value;
    }
  }

  return "";
}

function getEnvValue(name) {
  if (typeof import.meta === "undefined" || !import.meta.env) {
    return "";
  }

  const raw = import.meta.env[name];
  return typeof raw === "string" ? raw.trim() : "";
}

function parseKeyList(name, defaultKeys) {
  const raw = getEnvValue(name);
  const customKeys = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!customKeys.length) {
    return defaultKeys;
  }

  const merged = [...customKeys, ...defaultKeys];
  return Array.from(new Set(merged));
}

function buildRequestUrl(baseUrl, queryParams) {
  if (!baseUrl) {
    return "";
  }

  const hasAbsoluteProtocol = /^https?:\/\//i.test(baseUrl);
  const url = hasAbsoluteProtocol
    ? new URL(baseUrl)
    : new URL(baseUrl, window.location.origin);

  if (queryParams && typeof queryParams === "object") {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      const normalized = String(value).trim();
      if (!normalized) {
        return;
      }

      url.searchParams.set(key, normalized);
    });
  }

  return url.toString();
}

function stripQueryAndHash(value) {
  return String(value || "").split(/[?#]/)[0];
}

function resolveLatestEncounterBaseUrl({ apiBaseUrl, patientSearchUrl }) {
  const normalizedSearchUrl = stripQueryAndHash(patientSearchUrl);

  if (normalizedSearchUrl && !normalizedSearchUrl.includes("/api/db/henctr")) {
    return normalizedSearchUrl;
  }

  if (apiBaseUrl) {
    return `${apiBaseUrl.replace(/\/+$/, "")}/api/db/patients`;
  }

  return "";
}

function buildLatestEncounterUrl({ apiBaseUrl, patientSearchUrl, hpercode }) {
  const trimmed = String(hpercode || "").trim();
  if (!trimmed) {
    return "";
  }

  const baseUrl = resolveLatestEncounterBaseUrl({
    apiBaseUrl,
    patientSearchUrl,
  });

  if (!baseUrl) {
    return "";
  }

  const normalizedBase = baseUrl.replace(/\/+$/, "");
  return `${normalizedBase}/${encodeURIComponent(trimmed)}/encounters/latest`;
}

function resolveUploadedPdfUrl(payload) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const candidatePaths = [
    "pdfUrl",
    "fileUrl",
    "url",
    "documentUrl",
    "resultUrl",
    "data.pdfUrl",
    "data.fileUrl",
    "data.url",
    "data.documentUrl",
    "data.resultUrl",
    "result.pdfUrl",
    "result.fileUrl",
    "response.pdfUrl",
  ];

  return resolveFirstString(payload, candidatePaths);
}

function buildErrorMessage(response, payload) {
  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }

  if (payload && typeof payload === "object") {
    const message = payload.message || payload.error || payload.detail;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return `Request failed with status ${response.status}.`;
}

function createFileKey(file) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function buildPatientCandidate(source, fallbackIndex = 0) {
  const requestContext = resolveRequestContext(source);
  const identifiers = requestContext.identifiers || {};
  const resolvedUser = requestContext.user || "";

  let id = "";
  let idSource = "";

  if (source?.hpercode) {
    id = String(source.hpercode).trim();
    idSource = "hpercode";
  } else if (identifiers.docointkey) {
    id = identifiers.docointkey;
    idSource = "docointkey";
  } else if (identifiers.enccode) {
    id = identifiers.enccode;
    idSource = "enc";
  } else if (source?.id) {
    id = String(source.id).trim();

    if (source?.hpercode && id === String(source.hpercode).trim()) {
      idSource = "hpercode";
    } else if (identifiers.docointkey && id === identifiers.docointkey) {
      idSource = "docointkey";
    } else if (identifiers.enccode && id === identifiers.enccode) {
      idSource = "enc";
    } else if (identifiers.fhud && id === identifiers.fhud) {
      idSource = "fhud";
    } else if (resolvedUser && id === resolvedUser) {
      idSource = "user";
    }
  } else if (identifiers.fhud) {
    id = identifiers.fhud;
    idSource = "fhud";
  } else if (resolvedUser) {
    id = resolvedUser;
    idSource = "user";
  } else {
    const fallbackComposite = [identifiers.fhud, identifiers.docointkey]
      .filter(Boolean)
      .join("|");

    if (fallbackComposite) {
      id = fallbackComposite;
      idSource = identifiers.fhud ? "fhud" : "";
    }
  }

  if (!id) {
    id = `candidate-${fallbackIndex}`;
  }

  const fullName = [
    requestContext.patient?.firstName,
    requestContext.patient?.middleName,
    requestContext.patient?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const displayName =
    fullName || source?.hpercode || identifiers.enccode || "Unlabeled Patient";

  const facilityLabel = source?.facility_name
    ? `Facility ${source.facility_name}`
    : identifiers.fhud
      ? `Facility ${identifiers.fhud}`
      : "";

  const description = [
    facilityLabel,
    requestContext.panelName,
    requestContext.requestedAt,
  ]
    .filter(Boolean)
    .join(" \u2022 ");

  return {
    id,
    idSource,
    displayName,
    description,
    rawData: source,
    contextParams: {
      hpercode: source?.hpercode ? String(source.hpercode).trim() : "",
      enccode: identifiers.enccode || "",
      enc: identifiers.enccode || "",
      fhud: identifiers.fhud || identifiers.facility_code || "",
      docointkey: identifiers.docointkey || "",
      user: resolvedUser,
    },
    requestContext,
  };
}

const panelNameKeys = parseKeyList("VITE_LAB_CONTEXT_PANEL_KEYS", [
  "panelName",
  "panel",
  "laboratoryPanel",
  "laboratoryType",
  "testName",
  "request.panelName",
  "request.panel",
  "request.laboratoryPanel",
  "request.laboratoryType",
  "request.testName",
  "data.panelName",
  "data.panel",
  "data.laboratoryPanel",
  "data.laboratoryType",
  "data.testName",
  "context.panelName",
  "context.panel",
  "context.laboratoryPanel",
  "context.laboratoryType",
  "context.testName",
  "data.context.panelName",
  "data.context.panel",
  "data.context.laboratoryPanel",
  "data.context.laboratoryType",
  "metadata.panelName",
  "metadata.panel",
  "metadata.laboratoryPanel",
  "metadata.laboratoryType",
]);

const requestedAtKeys = parseKeyList("VITE_LAB_CONTEXT_REQUESTED_AT_KEYS", [
  "requestedAt",
  "requestDate",
  "requestedDate",
  "requestedDateTime",
  "requestedOn",
  "createdAt",
  "request.requestedAt",
  "request.requestDate",
  "request.requestedDate",
  "request.requestedDateTime",
  "request.requestedOn",
  "data.requestedAt",
  "data.requestDate",
  "data.requestedDate",
  "data.requestedDateTime",
  "data.requestedOn",
  "data.createdAt",
  "context.requestedAt",
  "context.requestDate",
  "context.requestedDate",
  "context.requestedDateTime",
  "context.requestedOn",
  "data.context.requestedAt",
  "data.context.requestDate",
  "metadata.requestedAt",
  "metadata.requestDate",
]);

const patientFirstNameKeys = parseKeyList(
  "VITE_LAB_CONTEXT_PATIENT_FIRST_KEYS",
  [
    "first_name",
    "firstName",
    "data.first_name",
    "data.firstName",
    "request.patient.firstName",
    "request.patient.fname",
    "data.patient.firstName",
    "data.patient.fname",
    "data.context.patient.firstName",
    "metadata.patient.firstName",
    "patient.firstName",
    "patient.fname",
  ],
);

const patientMiddleNameKeys = parseKeyList(
  "VITE_LAB_CONTEXT_PATIENT_MIDDLE_KEYS",
  [
    "middle_name",
    "middleName",
    "data.middle_name",
    "data.middleName",
    "request.patient.middleName",
    "request.patient.mname",
    "data.patient.middleName",
    "data.patient.mname",
    "data.context.patient.middleName",
    "metadata.patient.middleName",
    "patient.middleName",
    "patient.mname",
  ],
);

const patientLastNameKeys = parseKeyList("VITE_LAB_CONTEXT_PATIENT_LAST_KEYS", [
  "last_name",
  "lastName",
  "data.last_name",
  "data.lastName",
  "request.patient.lastName",
  "request.patient.lname",
  "data.patient.lastName",
  "data.patient.lname",
  "data.context.patient.lastName",
  "metadata.patient.lastName",
  "patient.lastName",
  "patient.lname",
]);

// const facilityNameKeys = parseKeyList("VITE_LAB_CONTEXT_FACILITY_NAME_KEYS", [
//   "facility_name",
//   "facilityName",
//   "data.facility_name",
//   "data.facilityName",
//   "request.facilityName",
//   "data.request.facilityName",
//   "context.facilityName",
//   "metadata.facilityName",
// ]);

const encounterCodeKeys = parseKeyList("VITE_LAB_CONTEXT_ENCCODE_KEYS", [
  "enccode",
  "enc",
  "data.0.enccode",
  "data.0.enc",
  "data.enccode",
  "data.enc",
  "request.enccode",
  "request.enc",
  "context.enccode",
  "context.enc",
  "metadata.enccode",
  "metadata.enc",
  "hpercode",
  "id",
  "data.hpercode",
  "data.id",
]);

const facilityRefKeys = parseKeyList("VITE_LAB_CONTEXT_FHUD_KEYS", [
  "fhud",
  "facility_code",
  "data.0.fhud",
  "data.fhud",
  "data.facility_code",
  "request.fhud",
  "context.fhud",
  "metadata.fhud",
]);

const docointkeyKeys = parseKeyList("VITE_LAB_CONTEXT_DOCOINTKEY_KEYS", [
  "docointkey",
  "data.0.docointkey",
  "data.docointkey",
  "request.docointkey",
  "context.docointkey",
  "metadata.docointkey",
]);

const userKeys = parseKeyList("VITE_LAB_CONTEXT_USER_KEYS", [
  "user",
  "userid",
  "username",
  "account",
  "data.user",
  "data.userid",
  "data.username",
  "data.account",
  "request.user",
  "request.userid",
  "request.username",
  "request.account",
  "context.user",
  "context.userid",
  "context.username",
  "context.account",
  "metadata.user",
  "metadata.userid",
  "metadata.username",
  "metadata.account",
]);

export function resolveRequestContext(payload) {
  if (!payload || typeof payload !== "object") {
    return {
      panelName: "",
      requestedAt: "",
      patient: {
        firstName: "",
        middleName: "",
        lastName: "",
      },
      hasAnyContext: false,
    };
  }

  const hasDataRows = Array.isArray(payload?.data) && payload.data.length > 0;
  const contextSource = hasDataRows ? payload.data[0] : payload;

  const identifiers = {
    enccode: resolveFirstString(contextSource, encounterCodeKeys),
    fhud: resolveFirstString(contextSource, facilityRefKeys),
    docointkey: resolveFirstString(contextSource, docointkeyKeys),
  };

  const user = resolveFirstString(contextSource, userKeys);

  const panelName = resolveFirstString(contextSource, panelNameKeys);

  const requestedAt = resolveFirstString(contextSource, requestedAtKeys);

  let firstName = resolveFirstString(contextSource, patientFirstNameKeys);
  let middleName = resolveFirstString(contextSource, patientMiddleNameKeys);
  let lastName = resolveFirstString(contextSource, patientLastNameKeys);

  const hasAnyContext =
    Boolean(
      panelName ||
      requestedAt ||
      firstName ||
      middleName ||
      lastName ||
      user ||
      identifiers.enccode ||
      identifiers.fhud ||
      identifiers.docointkey,
    ) || hasDataRows;

  return {
    panelName,
    requestedAt,
    identifiers,
    user,
    patient: {
      firstName,
      middleName,
      lastName,
    },
    hasAnyContext,
  };
}

export async function fetchLatestEncounterForPatient({
  hpercode,
  token,
  apiBaseUrl = API_BASE_URL,
  patientSearchUrl = LAB_UPLOAD_PATIENT_SEARCH_URL,
}) {
  const trimmed = String(hpercode || "").trim();

  if (!trimmed) {
    return {
      payload: null,
      enccode: "",
    };
  }

  const endpoint = buildLatestEncounterUrl({
    apiBaseUrl,
    patientSearchUrl,
    hpercode: trimmed,
  });

  if (!endpoint) {
    throw new Error(
      "Latest encounter lookup is not configured. Set VITE_API_URL or VITE_LAB_PATIENT_SEARCH_URL.",
    );
  }

  const requestUrl = buildRequestUrl(endpoint);
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(requestUrl, {
    method: "GET",
    headers,
  });

  const responseText = await response.text();
  const responsePayload = parseResponsePayload(responseText);

  if (!response.ok) {
    throw new Error(buildErrorMessage(response, responsePayload));
  }

  const enccode = resolveFirstString(responsePayload, [
    "data.enccode",
    "data.0.enccode",
    "enccode",
  ]);

  return {
    payload: responsePayload,
    enccode,
  };
}

export async function fetchPatientEncounters({
  hpercode,
  token,
  apiBaseUrl = API_BASE_URL,
  patientSearchUrl = LAB_UPLOAD_PATIENT_SEARCH_URL,
}) {
  const trimmedHpercode = String(hpercode || "").trim();

  if (!trimmedHpercode) {
    return { payload: null, encounters: [] };
  }

  const baseUrl = String(patientSearchUrl || apiBaseUrl || "").replace(
    /\/+$/,
    "",
  );

  if (!baseUrl) {
    throw new Error(
      "Patient search URL is not configured. Set VITE_LAB_PATIENT_SEARCH_URL or VITE_API_URL.",
    );
  }

  const requestUrl = buildRequestUrl(
    `${baseUrl}/${encodeURIComponent(trimmedHpercode)}/encounters`,
  );

  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(requestUrl, {
    method: "GET",
    headers,
  });

  const responseText = await response.text();
  const responsePayload = parseResponsePayload(responseText);

  if (!response.ok) {
    throw new Error(buildErrorMessage(response, responsePayload));
  }

  // Normalize response — supports { data: [] } or flat array or { data: [...] } pagination shapes
  let rows = [];
  if (Array.isArray(responsePayload)) {
    rows = responsePayload;
  } else if (Array.isArray(responsePayload?.data)) {
    rows = responsePayload.data;
  } else if (Array.isArray(responsePayload?.items)) {
    rows = responsePayload.items;
  } else if (Array.isArray(responsePayload?.results)) {
    rows = responsePayload.results;
  }

  return {
    payload: responsePayload,
    encounters: rows.map((row) => {
      const enccode = String(
        row.enccode || row.encounterCode || row.enc || "",
      ).trim();
      const encounterType = String(
        row.toecode ||
          row.encounterType ||
          row.encounter_type ||
          row.type ||
          "",
      ).trim();
      const admissionDate = String(
        row.admdate || row.encdate || row.encdates || row.admission_date || "",
      ).trim();
      const admissionTime = String(
        row.admtime || row.enctime || row.toa || "",
      ).trim();
      const dischargeDate = String(
        row.disdate || row.discharge_date || "",
      ).trim();
      const dischargeTime = String(row.distime || row.tod || "").trim();
      const fhud = String(row.fhud || "").trim();

      const dateStr = admissionDate
        ? admissionTime
          ? `${admissionDate} ${admissionTime}`
          : admissionDate
        : "";

      const displayLabel = [encounterType || "Encounter", dateStr, enccode]
        .filter(Boolean)
        .join(" | ");

      return {
        enccode,
        hpercode: trimmedHpercode,
        encounterType,
        admissionDate,
        admissionTime,
        dischargeDate,
        dischargeTime,
        fhud,
        toecode: encounterType,
        encdates: admissionDate,
        toa: admissionTime,
        tod: dischargeTime,
        displayLabel,
        rawData: row,
      };
    }),
  };
}

export async function fetchLabPatientCandidates({
  patientSearchUrl,
  contextUrl,
  token,
  contextParams,
  search = "",
  user = "",
  limit = 25,
  offset = 0,
}) {
  const searchUrl = patientSearchUrl || contextUrl;

  if (!searchUrl) {
    return {
      payload: null,
      candidates: [],
    };
  }

  const normalizedContextParams = normalizeLabContextParams(contextParams);
  const resolvedUser = user || normalizedContextParams.user || "";

  const requestUrl = buildRequestUrl(searchUrl, {
    ...normalizedContextParams,
    search,
    q: search,
    user: resolvedUser,
    limit,
    offset,
  });

  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(requestUrl, {
    method: "GET",
    headers,
  });

  const responseText = await response.text();
  const responsePayload = parseResponsePayload(responseText);

  if (!response.ok) {
    throw new Error(buildErrorMessage(response, responsePayload));
  }

  const payloadRows = Array.isArray(responsePayload?.data)
    ? responsePayload.data
    : Array.isArray(responsePayload)
      ? responsePayload
      : responsePayload && typeof responsePayload === "object"
        ? [responsePayload]
        : [];

  const dedupedCandidates = new Map();

  payloadRows.forEach((row, index) => {
    const candidate = buildPatientCandidate(row, index + 1);

    if (!candidate.id || candidate.id.startsWith("candidate-")) {
      candidate.id =
        row.hpercode ||
        candidate.requestContext?.identifiers?.docointkey ||
        candidate.requestContext?.identifiers?.enccode ||
        row.id ||
        `candidate-${index + 1}`;

      if (row.hpercode && candidate.id === String(row.hpercode).trim()) {
        candidate.idSource = "hpercode";
      } else if (
        candidate.requestContext?.identifiers?.docointkey === candidate.id
      ) {
        candidate.idSource = "docointkey";
      } else if (
        candidate.requestContext?.identifiers?.enccode === candidate.id
      ) {
        candidate.idSource = "enc";
      } else if (candidate.requestContext?.identifiers?.fhud === candidate.id) {
        candidate.idSource = "fhud";
      } else if (candidate.requestContext?.user === candidate.id) {
        candidate.idSource = "user";
      }
    }

    if (!dedupedCandidates.has(candidate.id)) {
      dedupedCandidates.set(candidate.id, candidate);
    }
  });

  if (!dedupedCandidates.size) {
    const fallbackCandidate = buildPatientCandidate(responsePayload, 1);

    if (fallbackCandidate.requestContext.hasAnyContext) {
      dedupedCandidates.set(fallbackCandidate.id, fallbackCandidate);
    }
  }

  return {
    payload: responsePayload,
    candidates: Array.from(dedupedCandidates.values()),
  };
}

export async function fetchLabRequestContext({
  contextUrl,
  token,
  contextParams,
}) {
  if (!contextUrl) {
    return {
      payload: null,
      requestContext: resolveRequestContext(null),
    };
  }

  const normalizedContextParams = normalizeLabContextParams(contextParams);
  const requestUrl = buildRequestUrl(contextUrl, normalizedContextParams);
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(requestUrl, {
    method: "GET",
    headers,
  });

  const responseText = await response.text();
  const responsePayload = parseResponsePayload(responseText);

  if (!response.ok) {
    throw new Error(buildErrorMessage(response, responsePayload));
  }

  return {
    payload: responsePayload,
    requestContext: resolveRequestContext(responsePayload),
  };
}

export async function uploadLabResult({
  uploadUrl,
  token,
  resultFile,
  remarks,
  contextParams,
}) {
  const normalizedContextParams = normalizeLabContextParams(contextParams);
  const payload = new FormData();
  payload.append("resultFile", resultFile);

  ["enccode", "enc", "fhud", "docointkey", "user"].forEach((key) => {
    const value = normalizedContextParams[key];

    if (typeof value === "string" && value.trim()) {
      payload.append(key, value.trim());
    }
  });

  if (remarks?.trim()) {
    payload.append("remarks", remarks.trim());
  }

  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const requestUrl = buildRequestUrl(uploadUrl, normalizedContextParams);
  const response = await fetch(requestUrl, {
    method: "POST",
    headers,
    body: payload,
  });

  const responseText = await response.text();
  const responsePayload = parseResponsePayload(responseText);

  if (!response.ok) {
    throw new Error(buildErrorMessage(response, responsePayload));
  }

  return {
    payload: responsePayload,
    uploadedPdfUrl: resolveUploadedPdfUrl(responsePayload),
    requestContext: resolveRequestContext(responsePayload),
  };
}

export async function uploadLabResultBatch({
  uploadUrl,
  token,
  resultFiles,
  remarks,
  contextParams,
  onProgress,
}) {
  const files = Array.isArray(resultFiles) ? resultFiles : [];
  const successes = [];
  const failures = [];
  const total = files.length;

  for (let index = 0; index < files.length; index += 1) {
    const currentFile = files[index];

    try {
      const response = await uploadLabResult({
        uploadUrl,
        token,
        resultFile: currentFile,
        remarks,
        contextParams,
      });

      successes.push({
        payload: response.payload,
        uploadedPdfUrl: response.uploadedPdfUrl,
        requestContext: response.requestContext,
        file: currentFile,
        fileKey: createFileKey(currentFile),
        fileName: currentFile.name,
        fileSize: currentFile.size,
        uploadedAt: new Date().toISOString(),
      });
    } catch (error) {
      failures.push({
        file: currentFile,
        fileKey: createFileKey(currentFile),
        fileName: currentFile.name,
        fileSize: currentFile.size,
        message:
          error instanceof Error
            ? error.message
            : "Upload failed for this PDF file.",
      });
    } finally {
      if (typeof onProgress === "function") {
        onProgress({
          current: index + 1,
          total,
          successCount: successes.length,
          failureCount: failures.length,
        });
      }
    }
  }

  return {
    successes,
    failures,
  };
}

/**
 * ============================================================
 * Lab Upload Workflow API functions
 * Step 2: Fetch Orders for an Encounter
 * Step 3: Fetch Procedures for an Order
 * Step 5: Upload Lab Result (via backend → Supabase)
 * ============================================================
 */

/**
 * GET /api/db/encounters/:enccode/orders
 *
 * Fetch lab and radiology orders for a specific encounter.
 * Used in the workflow after encounter selection.
 *
 * @param {Object} options
 * @param {string} options.enccode - Encounter ID (required)
 * @param {string} [options.type] - 'lab' | 'rad' | 'all'. Default: 'all'
 * @param {string} [options.status] - Order status filter. Default: 'S'
 * @param {string} [options.token] - Auth token
 * @param {string} [options.apiBaseUrl] - Override API base URL
 */
export async function fetchEncounterOrders({
  enccode,
  type = "all",
  status = "S",
  token,
  apiBaseUrl = LAB_UPLOAD_PATIENT_SEARCH_URL,
}) {
  const trimmedEnccode = String(enccode || "").trim();
  if (!trimmedEnccode) {
    throw new Error("enccode is required to fetch encounter orders.");
  }

  const baseUrl = String(apiBaseUrl || LAB_UPLOAD_PATIENT_SEARCH_URL || "").replace(
    /\/+$/,
    "",
  );
  // Replace /patients suffix with empty to get base API URL
  // Double-encode the enccode since it may contain special chars like / and :
  const encodedEnccode = encodeURIComponent(encodeURIComponent(trimmedEnccode));
  const requestUrl = buildRequestUrl(
    `${baseUrl.replace(/\/patients$/, "")}/encounters/${encodedEnccode}/orders`,
    { type, status },
  );

  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  let responsePayload;

  try {
    response = await fetch(requestUrl, { method: "GET", headers });
    responsePayload = await response.text();
  } catch (networkError) {
    throw new Error(
      `Network error fetching encounter orders: ${networkError.message}`,
    );
  }

  if (!response.ok) {
    const parsed = tryParseJson(responsePayload);
    const message =
      parsed?.message ||
      buildErrorMessage(response, responsePayload) ||
      `Server error: ${response.status}`;
    throw new Error(message);
  }

  let data;
  try {
    data = JSON.parse(responsePayload);
  } catch {
    throw new Error("Invalid JSON response when parsing encounter orders.");
  }

  // Normalize to array
  const rawOrders = Array.isArray(data?.data) ? data.data : [];

  return {
    ok: data?.ok ?? true,
    enccode: trimmedEnccode,
    orderType: type,
    count: rawOrders.length,
    data: rawOrders.map((order) => ({
      orcode: order.orcode,
      enccode: order.enccode,
      ordcode: order.ordcode,
      oritem: order.oritem,
      ordate: order.ordate || order.ordates,
      ortime: order.ortime,
      estatus: order.estatus,
      entryby: order.entryby,
      docointkey: order.docointkey,
      hpercode: order.hpercode,
      patlast: order.patlast,
      patfirst: order.patfirst,
      patmiddle: order.patmiddle,
    })),
  };
}

/**
 * GET /api/db/encounters/:enccode/orders/:orcode/procedures
 *
 * Fetch procedures/line items for a specific order (from pcchrgcod table).
 *
 * @param {Object} options
 * @param {string} options.enccode - Encounter ID (required)
 * @param {string} options.orcode - Order ID (required)
 * @param {string} [options.procedureInstanceId] - Filter by specific procedure ID
 * @param {string} [options.token] - Auth token
 * @param {string} [options.apiBaseUrl] - Override API base URL
 */
export async function fetchOrderProcedures({
  enccode,
  orcode,
  procedureInstanceId,
  token,
  apiBaseUrl = LAB_UPLOAD_PATIENT_SEARCH_URL,
}) {
  const trimmedEnccode = String(enccode || "").trim();
  const trimmedOrcode = String(orcode || "").trim();

  if (!trimmedEnccode || !trimmedOrcode) {
    throw new Error("Both enccode and orcode are required to fetch procedures.");
  }

  const baseUrl = String(apiBaseUrl || LAB_UPLOAD_PATIENT_SEARCH_URL || "").replace(
    /\/+$/,
    "",
  );
  // Double-encode both enccode and orcode since they may contain special chars
  const encodedEnccode = encodeURIComponent(encodeURIComponent(trimmedEnccode));
  const encodedOrcode = encodeURIComponent(encodeURIComponent(trimmedOrcode));
  const requestUrl = buildRequestUrl(
    `${baseUrl.replace(/\/patients$/, "")}/encounters/${encodedEnccode}/orders/${encodedOrcode}/procedures`,
    { procedureInstanceId },
  );

  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  let responsePayload;

  try {
    response = await fetch(requestUrl, { method: "GET", headers });
    responsePayload = await response.text();
  } catch (networkError) {
    throw new Error(
      `Network error fetching order procedures: ${networkError.message}`,
    );
  }

  if (!response.ok) {
    const parsed = tryParseJson(responsePayload);
    const message =
      parsed?.message ||
      buildErrorMessage(response, responsePayload) ||
      `Server error: ${response.status}`;
    throw new Error(message);
  }

  let data;
  try {
    data = JSON.parse(responsePayload);
  } catch {
    throw new Error("Invalid JSON response when parsing order procedures.");
  }

  const rawProcedures = Array.isArray(data?.data) ? data.data : [];

  return {
    ok: data?.ok ?? true,
    enccode: trimmedEnccode,
    orcode: trimmedOrcode,
    count: rawProcedures.length,
    data: rawProcedures.map((proc) => ({
      procedureInstanceId: proc.procedureInstanceId,
      orcode: proc.orcode,
      enccode: proc.enccode,
      chrgcod: proc.chrgcod,
      procedureDescription: proc.procedureDescription,
      procedureDate: proc.procedureDate,
      procedureTime: proc.procedureTime,
      procedureStatus: proc.procedureStatus,
      providerCode: proc.providerCode,
      enteredBy: proc.enteredBy,
      procdateFormatted: proc.procdate_formatted,
      proctimeFormatted: proc.proctime_formatted,
      ordcode: proc.ordcode,
      oritem: proc.oritem,
    })),
  };
}

/**
 * POST /api/db/lab-results
 *
 * Upload a lab result PDF via the backend (which handles Supabase storage).
 * This is the FINALIZE step in the workflow:
 *   1. Backend validates patient + encounter in MySQL
 *   2. Backend uploads PDF to Supabase
 *   3. Backend inserts metadata with auto-generated docointkey
 *   4. Backend returns docointkey for tracking
 *
 * @param {Object} options
 * @param {File} options.file - PDF File object (required)
 * @param {Object} options.contextParams - { hpercode, enccode, orcode, procedureInstanceId, docointkey, user }
 * @param {Object} options.patient - Patient object (for name/ID resolution)
 * @param {string} [options.remarks] - Upload remarks
 * @param {string} [options.token] - Auth token
 * @param {string} [options.uploadUrl] - Override upload URL
 */
export async function uploadMappedLabResult({
  file,
  contextParams = {},
  patient = null,
  remarks = "",
  token,
  uploadUrl,
}) {
  const resolvedUploadUrl =
    uploadUrl ||
    `${String(LAB_UPLOAD_PATIENT_SEARCH_URL || "").replace(/\/+$/, "").replace(/\/patients$/, "")}/lab-results`;

  if (!file) {
    throw new Error("A PDF file is required for lab result upload.");
  }

  const normalizedContextParams = normalizeLabContextParams(contextParams);

  // Resolve hpercode from patient if not in contextParams
  const resolvedHpercode =
    normalizedContextParams.hpercode ||
    (patient
      ? patient.rawData?.hpercode || patient.contextParams?.hpercode || ""
      : "");

  const formData = new FormData();
  formData.append("file", file);

  // Required fields
  formData.append("hpercode", resolvedHpercode);
  formData.append("enccode", normalizedContextParams.enccode || "");

  // Optional fields
  if (normalizedContextParams.orcode) {
    formData.append("orcode", normalizedContextParams.orcode);
  }
  if (normalizedContextParams.procode) {
    formData.append("procode", normalizedContextParams.procode);
  }
  if (normalizedContextParams.procedureInstanceId) {
    formData.append("procedureInstanceId", normalizedContextParams.procedureInstanceId);
  }
  if (normalizedContextParams.docointkey) {
    formData.append("docointkey", normalizedContextParams.docointkey);
  }
  if (normalizedContextParams.user) {
    formData.append("uploadedBy", normalizedContextParams.user);
  }
  if (remarks) {
    formData.append("remarks", remarks);
  }

  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  // NOTE: Do NOT set Content-Type: multipart/form-data — the browser
  // automatically sets the correct Content-Type with boundary.

  let response;
  let responsePayload;

  try {
    response = await fetch(resolvedUploadUrl, {
      method: "POST",
      headers,
      body: formData,
    });
    responsePayload = await response.text();
  } catch (networkError) {
    throw new Error(
      `Network error uploading lab result: ${networkError.message}`,
    );
  }

  if (!response.ok) {
    let parsed;
    try {
      parsed = JSON.parse(responsePayload);
    } catch {
      parsed = {};
    }
    const message =
      parsed?.message ||
      `Server error: ${response.status} — ${responsePayload}`.slice(0, 200);
    throw new Error(message);
  }

  let result;
  try {
    result = JSON.parse(responsePayload);
  } catch {
    throw new Error("Invalid JSON response when parsing lab upload result.");
  }

  return {
    ok: result?.ok ?? true,
    docointkey: result?.docointkey,
    uploadedPdfUrl: result?.uploadedPdfUrl,
    fileName: result?.fileName,
    fileSize: result?.fileSize,
    patientId: result?.patientId,
    encounterCode: result?.encounterCode,
    orderCode: result?.orderCode,
    procedureInstanceId: result?.procedureInstanceId,
    message: result?.message || "Lab result uploaded successfully.",
  };
}

// ============================================================
// Internal helpers
// ============================================================

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
