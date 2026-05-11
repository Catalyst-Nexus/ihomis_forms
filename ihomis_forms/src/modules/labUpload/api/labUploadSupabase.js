import { supabase } from "../../../lib/supabaseClient.js";
import {
  LAB_UPLOAD_SUPABASE_BUCKET,
  LAB_UPLOAD_SUPABASE_TABLE,
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

export async function uploadLabResult({
  file,
  contextParams,
  patient,
  remarks,
}) {
  if (!isConfigured()) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_LAB_RESULTS_BUCKET and VITE_SUPABASE_LAB_RESULTS_TABLE.",
    );
  }

  const normalizedContextParams = normalizeLabContextParams(contextParams);
  const patientId =
    patient?.rawData?.hpercode ||
    patient?.contextParams?.hpercode ||
    normalizedContextParams.hpercode ||
    normalizedContextParams.patient_id ||
    (patient?.idSource === "hpercode" ? patient.id : "") ||
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

  const { url } = await resolveFileUrl({
    bucket: LAB_UPLOAD_SUPABASE_BUCKET,
    path: storagePath,
  });

  const insertPayload = {
    hpercode: patientId || null,
    enccode: encounterCode || null,
    orcode: normalizedContextParams.orcode || null,
    proccode:
      normalizedContextParams.proccode ||
      normalizedContextParams.procedureInstanceId ||
      null,
    procedure_instance_id:
      normalizedContextParams.procedureInstanceId ||
      normalizedContextParams.docointkey ||
      null,
    docointkey: docointkey || null,
    file_name: file.name,
    file_url: url,
    storage_path: storagePath,
    file_size: file.size,
    content_type: file.type || "application/pdf",
    uploaded_by: uploadedBy || null,
    remarks: remarks?.trim() || null,
    source: "lab-upload",
    is_signed_url: false,
    url_expires_at: null,
    is_active: true,
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

export async function fetchPatientUploadedFilesSupabase({
  hpercode,
  enccode = null,
  orcode = null,
  proccode = null,
  procedureInstanceId = null,
}) {
  if (!isConfigured()) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_LAB_RESULTS_BUCKET and VITE_SUPABASE_LAB_RESULTS_TABLE.",
    );
  }

  const trimmedHpercode = String(hpercode || "").trim();
  if (!trimmedHpercode) {
    throw new Error("hpercode is required to fetch patient uploaded files.");
  }

  let query = supabase
    .from(LAB_UPLOAD_SUPABASE_TABLE)
    .select("*")
    .eq("hpercode", trimmedHpercode)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(100);

  if (enccode) {
    query = query.eq("enccode", String(enccode).trim());
  }

  if (orcode) {
    query = query.eq("orcode", String(orcode).trim());
  }

  if (proccode) {
    query = query.eq("proccode", String(proccode).trim());
  }

  if (procedureInstanceId) {
    query = query.eq("procedure_instance_id", String(procedureInstanceId).trim());
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(
      error.message || "Unable to fetch uploaded PDFs from Supabase.",
    );
  }

  const normalizedData = (data || []).map((row) => {
    const storagePath = String(row?.storage_path || "").trim();
    let publicUrl = String(row?.file_url || "").trim();

    if (supabase && LAB_UPLOAD_SUPABASE_BUCKET && storagePath) {
      const { data: publicData } = supabase.storage
        .from(LAB_UPLOAD_SUPABASE_BUCKET)
        .getPublicUrl(storagePath);

      if (publicData?.publicUrl) {
        publicUrl = publicData.publicUrl;
      }
    }

    return {
      ...row,
      file_url: publicUrl,
      uploadedPdfUrl: publicUrl,
      is_signed_url: false,
      url_expires_at: null,
    };
  });

  return {
    ok: true,
    hpercode: trimmedHpercode,
    enccode: enccode || null,
    count: typeof count === "number" ? count : normalizedData.length || 0,
    data: normalizedData,
  };
}

export function canUseSupabaseUploads() {
  return isConfigured();
}

export async function softDeleteLabResult(id) {
  if (!isConfigured()) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_LAB_RESULTS_BUCKET and VITE_SUPABASE_LAB_RESULTS_TABLE.",
    );
  }

  if (id == null) {
    throw new Error("Record ID is required to soft delete.");
  }

  // Try direct update first
  const { error: updateError } = await supabase
    .from(LAB_UPLOAD_SUPABASE_TABLE)
    .update({ is_active: false })
    .eq("id", id);

  if (!updateError) {
    return { ok: true };
  }

  // If direct update fails (RLS issue), try RPC function with SECURITY DEFINER
  const { error: rpcError } = await supabase.rpc("soft_delete_lab_result", { p_id: id });

  if (rpcError) {
    throw new Error(`Delete failed: ${rpcError.message}`);
  }

  return { ok: true };
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
