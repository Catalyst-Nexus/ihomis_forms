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

function splitFullName(fullName) {
  if (!fullName) {
    return { firstName: "", middleName: "", lastName: "" };
  }

  const cleanedName = fullName.trim();
  if (!cleanedName) {
    return { firstName: "", middleName: "", lastName: "" };
  }

  if (cleanedName.includes(",")) {
    const [lastPart, restPart = ""] = cleanedName
      .split(",")
      .map((piece) => piece.trim());
    const restTokens = restPart.split(/\s+/).filter(Boolean);

    return {
      firstName: restTokens[0] || "",
      middleName: restTokens.slice(1).join(" "),
      lastName: lastPart,
    };
  }

  const tokens = cleanedName.split(/\s+/).filter(Boolean);
  if (!tokens.length) {
    return { firstName: "", middleName: "", lastName: "" };
  }

  if (tokens.length === 1) {
    return {
      firstName: tokens[0],
      middleName: "",
      lastName: "",
    };
  }

  return {
    firstName: tokens[0],
    middleName: tokens.slice(1, -1).join(" "),
    lastName: tokens[tokens.length - 1],
  };
}

function deriveContextFromDocointkey(docointkey) {
  if (!docointkey) {
    return {
      requestedAt: "",
      panelName: "",
    };
  }

  const parts = String(docointkey)
    .split("-")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!parts.length) {
    return {
      requestedAt: "",
      panelName: "",
    };
  }

  const requestedAt = parts[1] || "";
  const codeToken = parts[parts.length - 1] || "";

  let panelName = "";
  if (codeToken) {
    if (/^LABOR/i.test(codeToken)) {
      panelName = `Laboratory ${codeToken}`;
    } else if (/^RADIO/i.test(codeToken)) {
      panelName = `Radiology ${codeToken}`;
    } else if (/^DISCH$/i.test(codeToken)) {
      panelName = "Discharge Document";
    } else {
      panelName = codeToken;
    }
  }

  return {
    requestedAt,
    panelName,
  };
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

  const id =
    [identifiers.enccode, identifiers.fhud, identifiers.docointkey]
      .filter(Boolean)
      .join("|") || `candidate-${fallbackIndex}`;

  const fullName = [
    requestContext.patient?.firstName,
    requestContext.patient?.middleName,
    requestContext.patient?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const displayName =
    fullName ||
    (identifiers.enccode
      ? `Encounter ${identifiers.enccode}`
      : "Unlabeled Patient");

  const description = [
    identifiers.fhud ? `Facility ${identifiers.fhud}` : "",
    identifiers.docointkey ? `Document ${identifiers.docointkey}` : "",
    requestContext.panelName,
    requestContext.requestedAt,
  ]
    .filter(Boolean)
    .join(" • ");

  return {
    id,
    displayName,
    description,
    contextParams: {
      enccode: identifiers.enccode || "",
      fhud: identifiers.fhud || "",
      docointkey: identifiers.docointkey || "",
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

const facilityNameKeys = parseKeyList(
  "VITE_LAB_CONTEXT_FACILITY_NAME_KEYS",
  [
    "facility_name",
    "facilityName",
    "data.facility_name",
    "data.facilityName",
    "request.facilityName",
    "data.request.facilityName",
    "context.facilityName",
    "metadata.facilityName",
  ],
);

const encounterCodeKeys = parseKeyList("VITE_LAB_CONTEXT_ENCCODE_KEYS", [
  "hpercode",
  "id",
  "enccode",
  "data.0.enccode",
  "data.enccode",
  "data.hpercode",
  "data.id",
  "request.enccode",
  "context.enccode",
  "metadata.enccode",
]);

const facilityRefKeys = parseKeyList("VITE_LAB_CONTEXT_FHUD_KEYS", [
  "facility_code",
  "fhud",
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

  const identifiers = {
    enccode: resolveFirstString(payload, encounterCodeKeys),
    fhud: resolveFirstString(payload, facilityRefKeys),
    docointkey: resolveFirstString(payload, docointkeyKeys),
  };

  const derivedContext = deriveContextFromDocointkey(identifiers.docointkey);

  const panelName =
    resolveFirstString(payload, panelNameKeys) || derivedContext.panelName;

  const requestedAt =
    resolveFirstString(payload, requestedAtKeys) || derivedContext.requestedAt;

  let firstName = resolveFirstString(payload, patientFirstNameKeys);

  let middleName = resolveFirstString(payload, patientMiddleNameKeys);

  let lastName = resolveFirstString(payload, patientLastNameKeys);

  if (!firstName || !lastName) {
    const fullName = resolveFirstString(payload, patientFullNameKeys);

    if (fullName) {
      const parsedName = splitFullName(fullName);
      firstName = firstName || parsedName.firstName;
      middleName = middleName || parsedName.middleName;
      lastName = lastName || parsedName.lastName;
    }
  }

  const hasAnyContext = Boolean(
    panelName ||
    requestedAt ||
    firstName ||
    middleName ||
    lastName ||
    identifiers.enccode ||
    identifiers.fhud ||
    identifiers.docointkey,
  );

  return {
    panelName,
    requestedAt,
    identifiers,
    patient: {
      firstName,
      middleName,
      lastName,
    },
    hasAnyContext,
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

  const requestUrl = buildRequestUrl(searchUrl, {
    ...contextParams,
    search,
    q: search,
    user,
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

    if (!candidate.requestContext.hasAnyContext) {
      return;
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

  const requestUrl = buildRequestUrl(contextUrl, contextParams);
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
  const payload = new FormData();
  payload.append("resultFile", resultFile);

  if (remarks?.trim()) {
    payload.append("remarks", remarks.trim());
  }

  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const requestUrl = buildRequestUrl(uploadUrl, contextParams);
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
