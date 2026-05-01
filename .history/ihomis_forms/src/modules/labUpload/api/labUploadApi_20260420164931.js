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

  const panelName = resolveFirstString(payload, [
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

  const requestedAt = resolveFirstString(payload, [
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

  let firstName = resolveFirstString(payload, [
    "patient.firstName",
    "patient.fname",
    "request.patient.firstName",
    "request.patient.fname",
    "data.patient.firstName",
    "data.patient.fname",
    "context.patient.firstName",
    "context.patient.fname",
    "data.context.patient.firstName",
    "metadata.patient.firstName",
  ]);

  let middleName = resolveFirstString(payload, [
    "patient.middleName",
    "patient.mname",
    "request.patient.middleName",
    "request.patient.mname",
    "data.patient.middleName",
    "data.patient.mname",
    "context.patient.middleName",
    "context.patient.mname",
    "data.context.patient.middleName",
    "metadata.patient.middleName",
  ]);

  let lastName = resolveFirstString(payload, [
    "patient.lastName",
    "patient.lname",
    "request.patient.lastName",
    "request.patient.lname",
    "data.patient.lastName",
    "data.patient.lname",
    "context.patient.lastName",
    "context.patient.lname",
    "data.context.patient.lastName",
    "metadata.patient.lastName",
  ]);

  if (!firstName || !lastName) {
    const fullName = resolveFirstString(payload, [
      "patient.fullName",
      "patient.name",
      "request.patient.fullName",
      "request.patient.name",
      "data.patient.fullName",
      "data.patient.name",
      "context.patient.fullName",
      "context.patient.name",
      "data.context.patient.fullName",
      "metadata.patient.fullName",
      "patientName",
      "request.patientName",
      "data.patientName",
      "context.patientName",
      "metadata.patientName",
    ]);

    if (fullName) {
      const parsedName = splitFullName(fullName);
      firstName = firstName || parsedName.firstName;
      middleName = middleName || parsedName.middleName;
      lastName = lastName || parsedName.lastName;
    }
  }

  const hasAnyContext = Boolean(
    panelName || requestedAt || firstName || middleName || lastName,
  );

  return {
    panelName,
    requestedAt,
    patient: {
      firstName,
      middleName,
      lastName,
    },
    hasAnyContext,
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
