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

  return params;
}

function mergeRequestContext(previousContext, nextContext) {
  if (!nextContext) {
    return previousContext;
  }

  return {
    ...previousContext,
    panelName: nextContext.panelName || previousContext.panelName,
    requestedAt: nextContext.requestedAt || previousContext.requestedAt,
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
    requestedAt: requestContext.requestedAt || "Waiting for API context",
    identifiers: {
      enccode: requestContext.identifiers?.enccode || "Not provided",
      docointkey: requestContext.identifiers?.docointkey || "Not provided",
    },
    patient: {
      firstName: requestContext.patient?.firstName || "Not provided",
      middleName: requestContext.patient?.middleName || "Not provided",
      lastName: requestContext.patient?.lastName || "Not provided",
    },
  };
}

function buildUploadSummary({
  requestContext,
  contextLoading,
  displayContext,
  hasApiUrl,

  
}) {
  return [
    {
      label: "Context Source",
      value: requestContext.hasAnyContext
        ? "Live API response"
        : contextLoading
          ? "Loading from API"
          : "Awaiting context response",
    },
    {
      label: "Upload Endpoint",
      value: hasApiUrl ? "Configured" : "Not configured",
    },
    {
      label: "Laboratory Panel",
      value: displayContext.panelName,
    },
    {
      label: "Requested At",
      value: displayContext.requestedAt,
    },
    {
      label: "Encounter Code",
      value: displayContext.identifiers.enccode,
    },
    {
      label: "Document Key",
      value: displayContext.identifiers.docointkey,
    },
  ];
}

export {
  buildDisplayContext,
  buildUploadSummary,
  formatFileSize,
  getContextParamsFromLocation,
  getFileKey,
  getFirstUploadedPreviewIndex,
  isPdfFile,
  mapSuccessToUploadedEntry,
  mergeRequestContext,
  mergeUniqueFiles,
};
