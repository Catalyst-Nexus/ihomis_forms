function getFileKey(file) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function mergeUniqueFiles(existingFiles, incomingFiles) {
  const knownKeys = new Set(existingFiles.map((file) => getFileKey(file)));
  const mergedFiles = [...existingFiles];

  for (const file of incomingFiles) {
    const fileKey = getFileKey(file);

    if (knownKeys.has(fileKey)) {
      continue;
    }

    knownKeys.add(fileKey);
    mergedFiles.push(file);
  }

  return mergedFiles;
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleString();
}

function formatFileSize(bytes) {
  if (!bytes) {
    return "0 KB";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function isPdfFile(file) {
  if (!file) {
    return false;
  }

  const mimeType = (file.type || "").toLowerCase();
  const fileName = file.name.toLowerCase();

  return mimeType === "application/pdf" || fileName.endsWith(".pdf");
}

function normalizeLabContextParams(contextParams = {}) {
  const normalized = { ...contextParams };

  const encounterCode = normalized.enccode || normalized.enc || "";
  if (encounterCode) {
    normalized.enccode = encounterCode;
    normalized.enc = encounterCode;
  }

  const facilityCode =
    normalized.fhud ||
    normalized.facility_code ||
    normalized.facilityCode ||
    "";
  if (facilityCode) {
    normalized.fhud = facilityCode;
    normalized.facility_code = facilityCode;
  }

  const documentKey =
    normalized.docointkey || normalized.documentKey || normalized.docKey || "";
  if (documentKey) {
    normalized.docointkey = documentKey;
  }

  const resolvedUser =
    normalized.user ||
    normalized.userid ||
    normalized.username ||
    normalized.account ||
    "";
  if (resolvedUser) {
    normalized.user = resolvedUser;
  }

  return normalized;
}

function getContextParamsFromLocation() {
  if (typeof window === "undefined") {
    return {};
  }

  const params = {};
  const searchParams = new URLSearchParams(window.location.search);

  for (const [key, value] of searchParams.entries()) {
    const normalized = value.trim();
    if (!normalized) {
      continue;
    }

    params[key] = normalized;
  }

  return normalizeLabContextParams(params);
}

function mergeRequestContext(previousContext, nextContext) {
  if (!nextContext) {
    return previousContext;
  }

  return {
    ...previousContext,
    panelName: nextContext.panelName || previousContext.panelName,
    requestedAt: nextContext.requestedAt || previousContext.requestedAt,
    user: nextContext.user || previousContext.user || "",
    identifiers: {
      enccode:
        nextContext.identifiers?.enccode ||
        previousContext.identifiers?.enccode ||
        "",
      fhud:
        nextContext.identifiers?.fhud ||
        previousContext.identifiers?.fhud ||
        "",
      docointkey:
        nextContext.identifiers?.docointkey ||
        previousContext.identifiers?.docointkey ||
        "",
    },
    patient: {
      firstName:
        nextContext.patient?.firstName ||
        previousContext.patient?.firstName ||
        "",
      middleName:
        nextContext.patient?.middleName ||
        previousContext.patient?.middleName ||
        "",
      lastName:
        nextContext.patient?.lastName ||
        previousContext.patient?.lastName ||
        "",
    },
    hasAnyContext: nextContext.hasAnyContext ?? previousContext.hasAnyContext,
  };
}

function getFirstUploadedPreviewIndex(uploadedFiles) {
  return uploadedFiles.findIndex((item) => Boolean(item.previewUrl));
}

function mapSuccessToUploadedEntry(item) {
  return {
    id: `${item.fileKey}-${item.uploadedAt}`,
    fileName: item.fileName,
    fileSize: item.fileSize,
    previewUrl: item.uploadedPdfUrl,
    uploadedAtLabel: formatDateTime(item.uploadedAt),
  };
}

function buildDisplayContext(requestContext) {
  return {
    panelName: requestContext.panelName || "Laboratory Request",
    requestedAt: requestContext.requestedAt || "",
    user: requestContext.user || "",
    identifiers: {
      enccode: requestContext.identifiers?.enccode || "Not provided",
      fhud: requestContext.identifiers?.fhud || "Not provided",
      docointkey: requestContext.identifiers?.docointkey || "Not provided",
    },
    patient: {
      firstName: requestContext.patient?.firstName || "Not provided",
      middleName: requestContext.patient?.middleName || "Not provided",
      lastName: requestContext.patient?.lastName || "Not provided",
    },
  };
}

export {
  buildDisplayContext,
  formatFileSize,
  getContextParamsFromLocation,
  getFileKey,
  getFirstUploadedPreviewIndex,
  isPdfFile,
  mapSuccessToUploadedEntry,
  mergeRequestContext,
  mergeUniqueFiles,
  normalizeLabContextParams,
};
