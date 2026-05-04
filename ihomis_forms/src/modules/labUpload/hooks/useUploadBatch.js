import { useMemo, useState } from "react";
import { uploadLabResultBatch } from "../api/labUploadApi.js";
import {
  canUseSupabaseUploads,
  uploadLabResultBatchSupabase,
} from "../api/labUploadSupabase.js";
import { mapSuccessToUploadedEntry } from "../utils/labUploadUtils.js";

function getStatusClassName(type) {
  if (type === "success") {
    return "lab-status-success";
  }

  if (type === "warning") {
    return "lab-status-warning";
  }

  return "lab-status-error";
}

function useUploadBatch({
  uploadUrl,
  token,
  contextParams,
  patient,
  onContextFromSuccess,
}) {
  const [remarks, setRemarks] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [failedUploads, setFailedUploads] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [retryingFileKey, setRetryingFileKey] = useState("");
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
  });
  const [status, setStatus] = useState({ type: "", message: "" });

  const statusClassName = useMemo(
    () => getStatusClassName(status.type),
    [status.type],
  );

  const uploadProgressMessage =
    submitting && uploadProgress.total
      ? `Uploading ${uploadProgress.current} of ${uploadProgress.total} PDF files...`
      : "";

  const useSupabaseUploads = canUseSupabaseUploads();
  const hasApiUpload = Boolean(uploadUrl);

  function removeFailureForFileKey(fileKey) {
    setFailedUploads((currentItems) =>
      currentItems.filter((item) => item.fileKey !== fileKey),
    );
  }

  function resetUploadState() {
    setUploadedFiles([]);
    setFailedUploads([]);
    setUploadProgress({ current: 0, total: 0 });
    setRetryingFileKey("");
    setStatus({ type: "", message: "" });
  }

  async function handleSubmit(event, selectedFiles) {
    event.preventDefault();

    const resultFiles = Array.isArray(selectedFiles) ? selectedFiles : [];

    if (!useSupabaseUploads && !hasApiUpload) {
      setStatus({
        type: "error",
        message:
          "Missing upload destination. Configure Supabase lab uploads or set VITE_LAB_UPLOAD_API_URL.",
      });
      return;
    }

    if (!resultFiles.length) {
      setStatus({
        type: "error",
        message: "Please select at least one PDF file before uploading.",
      });
      return;
    }

    setSubmitting(true);
    setStatus({ type: "", message: "" });
    setUploadProgress({ current: 0, total: resultFiles.length });

    try {
      const { successes, failures } = useSupabaseUploads
        ? await uploadLabResultBatchSupabase({
            resultFiles,
            remarks,
            contextParams,
            patient,
            onProgress: ({ current, total }) => {
              setUploadProgress({ current, total });
            },
          })
        : await uploadLabResultBatch({
            uploadUrl,
            token,
            resultFiles,
            remarks,
            contextParams,
            onProgress: ({ current, total }) => {
              setUploadProgress({ current, total });
            },
          });

      if (successes.length > 0) {
        const uploadedEntries = successes.map((item) =>
          mapSuccessToUploadedEntry(item),
        );

        setUploadedFiles((currentItems) => [
          ...uploadedEntries,
          ...currentItems,
        ]);

        const contextFromSuccess = successes.find(
          (item) => item.requestContext?.hasAnyContext,
        )?.requestContext;

        if (contextFromSuccess) {
          onContextFromSuccess(contextFromSuccess);
        }
      }

      setFailedUploads(
        failures.map((failure) => ({
          ...failure,
          attempts: 1,
        })),
      );

      if (successes.length > 0 && failures.length > 0) {
        setStatus({
          type: "warning",
          message:
            `${successes.length} PDF file(s) uploaded successfully. ` +
            `${failures.length} file(s) failed. Retry failed files below.`,
        });
      } else if (successes.length > 0) {
        setStatus({
          type: "success",
          message: `${successes.length} PDF file(s) uploaded successfully.`,
        });
      } else {
        setStatus({
          type: "error",
          message:
            failures[0]?.message ||
            "Unable to upload the selected PDF files. Please try again.",
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during upload.",
      });
    } finally {
      setSubmitting(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  }

  async function retryFailedUpload(fileKey) {
    const failedItem = failedUploads.find((item) => item.fileKey === fileKey);

    if (!failedItem?.file) {
      setStatus({
        type: "error",
        message:
          "Unable to retry because the original file is no longer available.",
      });
      return;
    }

    setRetryingFileKey(fileKey);
    setStatus({ type: "", message: "" });

    try {
      const { successes, failures } = useSupabaseUploads
        ? await uploadLabResultBatchSupabase({
            resultFiles: [failedItem.file],
            remarks,
            contextParams,
            patient,
          })
        : await uploadLabResultBatch({
            uploadUrl,
            token,
            resultFiles: [failedItem.file],
            remarks,
            contextParams,
          });

      if (successes.length > 0) {
        const uploadedEntries = successes.map((item) =>
          mapSuccessToUploadedEntry(item),
        );
        setUploadedFiles((currentItems) => [
          ...uploadedEntries,
          ...currentItems,
        ]);

        const contextFromSuccess = successes.find(
          (item) => item.requestContext?.hasAnyContext,
        )?.requestContext;

        if (contextFromSuccess) {
          onContextFromSuccess(contextFromSuccess);
        }
      }

      if (failures.length > 0) {
        setFailedUploads((currentItems) =>
          currentItems.map((item) => {
            if (item.fileKey !== fileKey) {
              return item;
            }

            return {
              ...item,
              file: failures[0].file || item.file,
              message: failures[0].message,
              attempts: (item.attempts || 1) + 1,
            };
          }),
        );

        setStatus({
          type: "error",
          message: failures[0].message || "Retry failed for this PDF file.",
        });
      } else {
        setFailedUploads((currentItems) =>
          currentItems.filter((item) => item.fileKey !== fileKey),
        );

        setStatus({
          type: "success",
          message: `${failedItem.fileName} uploaded successfully on retry.`,
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Retry failed due to an unexpected error.",
      });
    } finally {
      setRetryingFileKey("");
    }
  }

  return {
    remarks,
    setRemarks,
    uploadedFiles,
    failedUploads,
    submitting,
    retryingFileKey,
    uploadProgressMessage,
    status,
    statusClassName,
    setStatus,
    handleSubmit,
    retryFailedUpload,
    removeFailureForFileKey,
    resetUploadState,
  };
}

export default useUploadBatch;
