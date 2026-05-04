import { supabase } from "../../../lib/supabaseClient.js";
import {
  LAB_UPLOAD_SUPABASE_BUCKET,
  LAB_UPLOAD_SUPABASE_TABLE,
  LAB_UPLOAD_SUPABASE_USE_SIGNED_URL,
  LAB_UPLOAD_SUPABASE_SIGNED_URL_TTL,
} from "../labUploadConfig.js";
import {
  getFileKey,
  normalizeLabContextParams,
} from "../utils/labUploadUtils.js";

function isConfigured() {
  return Boolean(
    supabase && LAB_UPLOAD_SUPABASE_BUCKET && LAB_UPLOAD_SUPABASE_TABLE,
  );
}

function sanitizeFileName(fileName) {
  return String(fileName || "")
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "_");
}

function buildStoragePath({ fileName, encounterCode, patientId }) {
  const safeName = sanitizeFileName(fileName);
  const base = encounterCode || patientId || "unknown";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `lab-results/${base}/${timestamp}-${safeName}`;
}

async function resolveFileUrl({ bucket, path }) {
  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  const ttlSeconds =
    Number.isFinite(LAB_UPLOAD_SUPABASE_SIGNED_URL_TTL) &&
    LAB_UPLOAD_SUPABASE_SIGNED_URL_TTL > 0
      ? LAB_UPLOAD_SUPABASE_SIGNED_URL_TTL
      : 3600;

  if (LAB_UPLOAD_SUPABASE_USE_SIGNED_URL) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, ttlSeconds);

    if (!error && data?.signedUrl) {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
      return {
        url: data.signedUrl,
        isSigned: true,
        expiresAt,
      };
    }
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error("Unable to resolve the Supabase file URL.");
  }

  return {
    url: data.publicUrl,
    isSigned: false,
    expiresAt: null,
  };
}

async function uploadLabResult({ file, contextParams, patient, remarks }) {
  if (!isConfigured()) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_LAB_RESULTS_BUCKET and VITE_SUPABASE_LAB_RESULTS_TABLE.",
    );
  }

  const normalizedContextParams = normalizeLabContextParams(contextParams);
  const patientId =
    patient?.id ||
    normalizedContextParams.hpercode ||
    normalizedContextParams.patient_id ||
    "";
  const encounterCode = normalizedContextParams.enccode || "";
  const docointkey = normalizedContextParams.docointkey || "";
  const uploadedBy = normalizedContextParams.user || "";

  const storagePath = buildStoragePath({
    fileName: file.name,
    encounterCode,
    patientId,
  });

  const { error: uploadError } = await supabase.storage
    .from(LAB_UPLOAD_SUPABASE_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type || "application/pdf",
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message || "Unable to upload PDF to Supabase.");
  }

  const { url, isSigned, expiresAt } = await resolveFileUrl({
    bucket: LAB_UPLOAD_SUPABASE_BUCKET,
    path: storagePath,
  });

  const insertPayload = {
    patient_id: patientId || null,
    encounter_code: encounterCode || null,
    docointkey: docointkey || null,
    file_name: file.name,
    file_url: url,
    storage_path: storagePath,
    file_size: file.size,
    content_type: file.type || "application/pdf",
    uploaded_by: uploadedBy || null,
    remarks: remarks?.trim() || null,
    source: "lab-upload",
    is_signed_url: isSigned,
    url_expires_at: expiresAt,
  };

  const { data, error: insertError } = await supabase
    .from(LAB_UPLOAD_SUPABASE_TABLE)
    .insert(insertPayload)
    .select()
    .single();

  if (insertError) {
    await supabase.storage
      .from(LAB_UPLOAD_SUPABASE_BUCKET)
      .remove([storagePath]);

    throw new Error(
      insertError.message || "Unable to save the upload record to Supabase.",
    );
  }

  return {
    payload: data,
    uploadedPdfUrl: url,
  };
}

export function canUseSupabaseUploads() {
  return isConfigured();
}

export async function uploadLabResultBatchSupabase({
  resultFiles,
  remarks,
  contextParams,
  patient,
  onProgress,
}) {
  if (!isConfigured()) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_LAB_RESULTS_BUCKET and VITE_SUPABASE_LAB_RESULTS_TABLE.",
    );
  }

  const files = Array.isArray(resultFiles) ? resultFiles : [];
  const successes = [];
  const failures = [];
  const total = files.length;

  for (let index = 0; index < files.length; index += 1) {
    const currentFile = files[index];

    try {
      const response = await uploadLabResult({
        file: currentFile,
        contextParams,
        patient,
        remarks,
      });

      successes.push({
        payload: response.payload,
        uploadedPdfUrl: response.uploadedPdfUrl,
        file: currentFile,
        fileKey: getFileKey(currentFile),
        fileName: currentFile.name,
        fileSize: currentFile.size,
        uploadedAt: new Date().toISOString(),
      });
    } catch (error) {
      failures.push({
        file: currentFile,
        fileKey: getFileKey(currentFile),
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
