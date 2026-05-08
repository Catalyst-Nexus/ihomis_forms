// ============================================================
// labUploadUtils.js
// Shared utility helpers for the lab upload module
// ============================================================

// ── File key helpers ─────────────────────────────────────────

function getFileKey(file) {
  if (!file) return "";
  if (typeof file === "string") return file;
  const name = file.name || file.filename || String(file);
  const size = file.size;
  return size ? `${name}::${size}` : name;
}

// ============================================================
// normalizeLabContextParams
//
// Normalizes all possible alias names for the core identifiers
// used across the lab upload workflow.
//
// Handles:
//   enccode  ← enc, encounter_code, encounterCode
//   hpercode ← patient_id, patientId
//   fhud     ← facility_code, facilityCode
//   docointkey ← documentKey, docKey
//   user     ← userid, username, account
//   orcode   ← order_code, orderCode
//   proccode ← procedure_id, procedureInstanceId, procedureCode (matches MySQL column name)
// ============================================================
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

  const patientId =
    normalized.hpercode || normalized.patient_id || normalized.patientId || "";
  if (patientId) {
    normalized.hpercode = patientId;
    normalized.patient_id = patientId;
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

  // Normalize order and procedure IDs
  const resolvedOrcode =
    normalized.orcode || normalized.order_code || normalized.orderCode || "";
  if (resolvedOrcode) {
    normalized.orcode = resolvedOrcode;
  }

  const resolvedProccode =
    normalized.proccode ||
    normalized.procedure_id ||
    normalized.procedureInstanceId ||
    normalized.procedureCode ||
    "";
  if (resolvedProccode) {
    normalized.proccode = resolvedProccode;
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
    ...nextContext,
    identifiers: {
      ...(previousContext.identifiers || {}),
      ...(nextContext.identifiers || {}),
    },
    patient: {
      ...(previousContext.patient || {}),
      ...(nextContext.patient || {}),
    },
  };
}

function mergeUniqueFiles(existing, incoming) {
  const all = [...existing];
  const existingKeys = new Set(all.map(getFileKey));

  for (const file of incoming) {
    const key = getFileKey(file);
    if (!existingKeys.has(key)) {
      all.push(file);
      existingKeys.add(key);
    }
  }

  return all;
}

function isPdfFile(file) {
  if (!file) {
    return false;
  }

  return (
    file.type === "application/pdf" ||
    String(file.name || "").toLowerCase().endsWith(".pdf")
  );
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) {
    return "0 Bytes";
  }

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function buildDisplayContext(requestContext = {}) {
  return {
    ...requestContext,
    hasAnyContext: Boolean(
      requestContext.identifiers?.enccode ||
        requestContext.identifiers?.docointkey ||
        requestContext.identifiers?.hpercode ||
        requestContext.patient?.lastName ||
        requestContext.requestedAt,
    ),
  };
}

function mapSuccessToUploadedEntry(successEntry) {
  if (!successEntry) return null;

  return {
    payload: successEntry.payload || successEntry,
    file: successEntry.file,
    fileKey: successEntry.fileKey || getFileKey(successEntry.file),
    fileName:
      successEntry.file?.name ||
      successEntry.payload?.file_name ||
      "Unknown",
    fileSize:
      successEntry.file?.size ||
      successEntry.payload?.file_size || 0,
    uploadedAt:
      successEntry.uploadedAt ||
      successEntry.payload?.created_at ||
      new Date().toISOString(),
    uploadedPdfUrl:
      successEntry.uploadedPdfUrl ||
      successEntry.payload?.file_url || "",
  };
}

function getFirstUploadedPreviewIndex(files, uploadedFiles) {
  if (!uploadedFiles || uploadedFiles.length === 0) return -1;

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const key = getFileKey(file);
    const uploaded = uploadedFiles.find(
      (u) => getFileKey(u.file || u) === key,
    );
    if (uploaded) return i;
  }

  return -1;
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
