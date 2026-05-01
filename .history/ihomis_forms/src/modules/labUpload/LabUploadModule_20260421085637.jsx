import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchLabRequestContext,
  uploadLabResultBatch,
} from "./api/labUploadApi.js";
import PdfCanvasPreview from "./components/PdfCanvasPreview.jsx";
import "./LabUploadModule.css";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim();

const LAB_UPLOAD_API_URL = (import.meta.env.VITE_LAB_UPLOAD_API_URL || "").trim();

const LAB_UPLOAD_CONTEXT_URL = (
  import.meta.env.VITE_LAB_UPLOAD_CONTEXT_URL ||
  (API_BASE_URL ? `${API_BASE_URL.replace(/\/+$/, "")}/api/db/henctr?limit=1` : "")
).trim();

const LAB_UPLOAD_API_TOKEN = (
  import.meta.env.VITE_LAB_UPLOAD_API_TOKEN || ""
).trim();

const defaultRequestContext = {
  panelName: "Laboratory Request",
  requestedAt: "",
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

function getFirstUploadedPreviewIndex(uploadedFiles) {
  return uploadedFiles.findIndex((item) => Boolean(item.previewUrl));
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
  if (!nextContext || !nextContext.hasAnyContext) {
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
        nextContext.patient?.firstName || previousContext.patient?.firstName || "",
      middleName:
        nextContext.patient?.middleName || previousContext.patient?.middleName || "",
      lastName: nextContext.patient?.lastName || previousContext.patient?.lastName || "",
    },
    hasAnyContext: true,
  };
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

function LabUploadModule() {
  const [remarks, setRemarks] = useState("");
  const [requestContext, setRequestContext] = useState(defaultRequestContext);
  const [contextLoading, setContextLoading] = useState(Boolean(LAB_UPLOAD_CONTEXT_URL));
  const [contextNotice, setContextNotice] = useState("");

  const [resultFiles, setResultFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [failedUploads, setFailedUploads] = useState([]);

  const [activeLocalFileIndex, setActiveLocalFileIndex] = useState(0);
  const [activeUploadedFileIndex, setActiveUploadedFileIndex] = useState(0);
  const [reviewSource, setReviewSource] = useState("local");
  const [isReviewFullscreen, setIsReviewFullscreen] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [retryingFileKey, setRetryingFileKey] = useState("");
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [status, setStatus] = useState({ type: "", message: "" });

  const fileInputRef = useRef(null);
  const contextParams = useMemo(() => getContextParamsFromLocation(), []);

  useEffect(() => {
    let isActive = true;

    async function loadRequestContext() {
      if (!LAB_UPLOAD_CONTEXT_URL) {
        setContextLoading(false);
        return;
      }

      setContextLoading(true);

      try {
        const response = await fetchLabRequestContext({
          contextUrl: LAB_UPLOAD_CONTEXT_URL,
          token: LAB_UPLOAD_API_TOKEN,
          contextParams,
        });

        if (!isActive) {
          return;
        }

        if (response.requestContext?.hasAnyContext) {
          setRequestContext((currentContext) =>
            mergeRequestContext(currentContext, response.requestContext),
          );
          setContextNotice("");
        } else {
          setContextNotice(
            "Context API returned no patient details. It will update after upload response if available.",
          );
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        setContextNotice(
          error instanceof Error
            ? error.message
            : "Unable to load request context from API.",
        );
      } finally {
        if (isActive) {
          setContextLoading(false);
        }
      }
    }

    loadRequestContext();

    return () => {
      isActive = false;
    };
  }, [contextParams]);

  useEffect(() => {
    if (!isReviewFullscreen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isReviewFullscreen]);

  useEffect(() => {
    if (!isReviewFullscreen) {
      return undefined;
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsReviewFullscreen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isReviewFullscreen]);

  useEffect(() => {
    if (!resultFiles.length) {
      setActiveLocalFileIndex(0);
      return;
    }

    if (activeLocalFileIndex >= resultFiles.length) {
      setActiveLocalFileIndex(resultFiles.length - 1);
    }
  }, [activeLocalFileIndex, resultFiles.length]);

  useEffect(() => {
    if (!uploadedFiles.length) {
      setActiveUploadedFileIndex(0);
      return;
    }

    if (activeUploadedFileIndex >= uploadedFiles.length) {
      setActiveUploadedFileIndex(uploadedFiles.length - 1);
      return;
    }

    if (uploadedFiles[activeUploadedFileIndex]?.previewUrl) {
      return;
    }

    const firstPreviewIndex = getFirstUploadedPreviewIndex(uploadedFiles);
    if (firstPreviewIndex >= 0) {
      setActiveUploadedFileIndex(firstPreviewIndex);
    }
  }, [activeUploadedFileIndex, uploadedFiles]);

  const hasApiUrl = Boolean(LAB_UPLOAD_API_URL);
  const hasLocalPreview = resultFiles.length > 0;
  const hasUploadedPreview = uploadedFiles.some((item) => Boolean(item.previewUrl));
  const canSubmit = Boolean(hasApiUrl && resultFiles.length > 0 && !submitting);
  const uploadEndpointNotice = hasApiUrl
    ? ""
    : "Upload endpoint is not configured yet. Set VITE_LAB_UPLOAD_API_URL when backend upload route is available.";

  const localPreviewFile = hasLocalPreview
    ? resultFiles[Math.min(activeLocalFileIndex, resultFiles.length - 1)]
    : null;

  const uploadedPreviewFile = uploadedFiles.length
    ? uploadedFiles[Math.min(activeUploadedFileIndex, uploadedFiles.length - 1)]
    : null;

  const activePreviewFile = reviewSource === "local" ? localPreviewFile : null;
  const activePreviewUrl =
    reviewSource === "uploaded" && uploadedPreviewFile?.previewUrl
      ? uploadedPreviewFile.previewUrl
      : "";
  const hasActivePreview = Boolean(activePreviewFile || activePreviewUrl);
  const hasAnyPdf = Boolean(resultFiles.length || uploadedFiles.length);

  const uploadProgressMessage =
    submitting && uploadProgress.total
      ? `Uploading ${uploadProgress.current} of ${uploadProgress.total} PDF files...`
      : "";

  const displayContext = {
    panelName: requestContext.panelName || "Laboratory Request",
    requestedAt: requestContext.requestedAt || "Waiting for API context",
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

  const uploadSummary = useMemo(
    () => [
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
      {
        label: "Attachment Queue",
        value: resultFiles.length
          ? `${resultFiles.length} PDF file(s) selected`
          : "No PDFs selected",
      },
      {
        label: "Uploaded Files",
        value: uploadedFiles.length
          ? `${uploadedFiles.length} uploaded item(s)`
          : "No uploaded PDFs yet",
      },
      {
        label: "Review Mode",
        value:
          reviewSource === "uploaded" && hasUploadedPreview
            ? "Uploaded PDF from API response"
            : "Local in-app preview",
      },
    ],
    [
      contextLoading,
      displayContext.panelName,
      displayContext.requestedAt,
      displayContext.identifiers.docointkey,
      displayContext.identifiers.enccode,
      hasApiUrl,
      hasUploadedPreview,
      requestContext.hasAnyContext,
      resultFiles.length,
      reviewSource,
      uploadedFiles.length,
    ],
  );

  const statusClassName =
    status.type === "success"
      ? "lab-status-success"
      : status.type === "warning"
        ? "lab-status-warning"
        : "lab-status-error";

  function applyContextFromApi(nextContext) {
    if (!nextContext?.hasAnyContext) {
      return;
    }

    setRequestContext((currentContext) =>
      mergeRequestContext(currentContext, nextContext),
    );
    setContextNotice("");
  }

  function clearPdfSelection() {
    setResultFiles([]);
    setUploadedFiles([]);
    setFailedUploads([]);
    setActiveLocalFileIndex(0);
    setActiveUploadedFileIndex(0);
    setReviewSource("local");
    setIsReviewFullscreen(false);
    setUploadProgress({ current: 0, total: 0 });
    setRetryingFileKey("");
    setStatus({ type: "", message: "" });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function addFilesToQueue(incomingFiles) {
    const validPdfFiles = incomingFiles.filter((file) => isPdfFile(file));
    const invalidFileCount = incomingFiles.length - validPdfFiles.length;

    if (!validPdfFiles.length) {
      setStatus({
        type: "error",
        message: "Only PDF files are allowed for laboratory result upload.",
      });
      return;
    }

    const mergedFiles = mergeUniqueFiles(resultFiles, validPdfFiles);
    const addedCount = mergedFiles.length - resultFiles.length;
    const duplicatePdfCount = validPdfFiles.length - addedCount;

    setResultFiles(mergedFiles);
    setReviewSource("local");

    if (!resultFiles.length && addedCount > 0) {
      setActiveLocalFileIndex(0);
    }

    if (addedCount === 0) {
      setStatus({
        type: "warning",
        message: "All selected PDF files are already in the queue.",
      });
      return;
    }

    if (invalidFileCount > 0 || duplicatePdfCount > 0) {
      const details = [];

      if (invalidFileCount > 0) {
        details.push(`${invalidFileCount} non-PDF file(s) ignored`);
      }

      if (duplicatePdfCount > 0) {
        details.push(`${duplicatePdfCount} duplicate PDF file(s) skipped`);
      }

      setStatus({
        type: "warning",
        message: `${addedCount} PDF file(s) added. ${details.join(". ")}.`,
      });
      return;
    }

    setStatus({
      type: "success",
      message: `${addedCount} PDF file(s) added to the queue.`,
    });
  }

  function handleFileChange(event) {
    const selectedFiles = Array.from(event.target.files || []);
    addFilesToQueue(selectedFiles);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    } else {
      event.target.value = "";
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragActive(false);
    const droppedFiles = Array.from(event.dataTransfer.files || []);
    addFilesToQueue(droppedFiles);
  }

  function handleDragOver(event) {
    event.preventDefault();
    setIsDragActive(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();

    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    setIsDragActive(false);
  }

  function previewLocalFile(index) {
    setReviewSource("local");
    setActiveLocalFileIndex(index);
  }

  function previewUploadedFile(index) {
    if (!uploadedFiles[index]?.previewUrl) {
      return;
    }

    setReviewSource("uploaded");
    setActiveUploadedFileIndex(index);
  }

  function removeLocalFile(index) {
    const removedFile = resultFiles[index];

    if (removedFile) {
      const removedFileKey = getFileKey(removedFile);
      setFailedUploads((currentItems) =>
        currentItems.filter((item) => item.fileKey !== removedFileKey),
      );
    }

    setResultFiles((currentFiles) =>
      currentFiles.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!hasApiUrl) {
      setStatus({
        type: "error",
        message: "Missing upload API URL. Set VITE_LAB_UPLOAD_API_URL in your .env file.",
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
      const { successes, failures } = await uploadLabResultBatch({
        uploadUrl: LAB_UPLOAD_API_URL,
        token: LAB_UPLOAD_API_TOKEN,
        resultFiles,
        remarks,
        contextParams,
        onProgress: ({ current, total }) => {
          setUploadProgress({ current, total });
        },
      });

      if (successes.length > 0) {
        const uploadedEntries = successes.map((item) => mapSuccessToUploadedEntry(item));

        setUploadedFiles((currentItems) => [...uploadedEntries, ...currentItems]);

        const firstPreviewIndex = getFirstUploadedPreviewIndex(uploadedEntries);
        if (firstPreviewIndex >= 0) {
          setReviewSource("uploaded");
          setActiveUploadedFileIndex(firstPreviewIndex);
        }

        const contextFromSuccess = successes.find(
          (item) => item.requestContext?.hasAnyContext,
        )?.requestContext;

        if (contextFromSuccess) {
          applyContextFromApi(contextFromSuccess);
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
        message: "Unable to retry because the original file is no longer available.",
      });
      return;
    }

    setRetryingFileKey(fileKey);
    setStatus({ type: "", message: "" });

    try {
      const { successes, failures } = await uploadLabResultBatch({
        uploadUrl: LAB_UPLOAD_API_URL,
        token: LAB_UPLOAD_API_TOKEN,
        resultFiles: [failedItem.file],
        remarks,
        contextParams,
      });

      if (successes.length > 0) {
        const uploadedEntries = successes.map((item) => mapSuccessToUploadedEntry(item));
        setUploadedFiles((currentItems) => [...uploadedEntries, ...currentItems]);

        const firstPreviewIndex = getFirstUploadedPreviewIndex(uploadedEntries);
        if (firstPreviewIndex >= 0) {
          setReviewSource("uploaded");
          setActiveUploadedFileIndex(firstPreviewIndex);
        }

        const contextFromSuccess = successes.find(
          (item) => item.requestContext?.hasAnyContext,
        )?.requestContext;

        if (contextFromSuccess) {
          applyContextFromApi(contextFromSuccess);
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

  return (
    <div className="lab-page">
      <div className="lab-ambient lab-ambient-a" aria-hidden="true" />
      <div className="lab-ambient lab-ambient-b" aria-hidden="true" />

      <main className="lab-layout">
        <section className="lab-panel lab-hero lab-reveal">
          <p className="lab-kicker">Hospital Information System</p>
          <h1>Upload Result for {displayContext.panelName}</h1>
          <p>Requested on {displayContext.requestedAt}</p>

          <span
            className={`lab-api-state ${
              requestContext.hasAnyContext ? "lab-api-ready" : "lab-api-missing"
            }`}
          >
            {contextLoading
              ? "Loading request context from API..."
              : requestContext.hasAnyContext
                ? "Request context loaded from API"
                : "Waiting for request context from API response"}
          </span>
        </section>

        <section className="lab-grid lab-reveal">
          <form className="lab-panel lab-form" onSubmit={handleSubmit}>
            <div className="lab-request-header">
              <div>
                <p className="lab-request-label">Laboratory Panel</p>
                <h2>{displayContext.panelName}</h2>
              </div>
              <p className="lab-request-time">{displayContext.requestedAt}</p>
            </div>

            <section className="lab-patient-card" aria-label="Patient information">
              <h3>Patient Information</h3>
              <dl className="lab-patient-grid">
                <div>
                  <dt>First Name</dt>
                  <dd>{displayContext.patient.firstName}</dd>
                </div>
                <div>
                  <dt>Middle Name</dt>
                  <dd>{displayContext.patient.middleName}</dd>
                </div>
                <div>
                  <dt>Last Name</dt>
                  <dd>{displayContext.patient.lastName}</dd>
                </div>
              </dl>
            </section>

            <div
              className={`lab-dropzone ${isDragActive ? "lab-dropzone-active" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                id="resultFile"
                name="resultFile"
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                multiple
                className="lab-file-input-hidden"
              />

              <p className="lab-dropzone-title">Drag and drop PDF files here</p>
              <p className="lab-dropzone-subtitle">
                or choose files from your device
              </p>
              <button
                type="button"
                className="lab-dropzone-action"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse PDF Files
              </button>
            </div>

            <p className="lab-file-hint">
              You can select multiple PDFs at once, add more anytime, and retry failed
              files individually.
            </p>

            {contextNotice ? <p className="lab-form-note">{contextNotice}</p> : null}
            {uploadEndpointNotice ? (
              <p className="lab-form-note">{uploadEndpointNotice}</p>
            ) : null}

            {resultFiles.length ? (
              <section className="lab-file-queue" aria-label="Selected PDF files">
                <div className="lab-file-queue-head">
                  <h3>Selected PDF Files</h3>
                  <span>{resultFiles.length}</span>
                </div>

                <ul className="lab-file-list">
                  {resultFiles.map((file, index) => (
                    <li
                      key={getFileKey(file)}
                      className={`lab-file-item ${
                        reviewSource === "local" && activeLocalFileIndex === index
                          ? "active"
                          : ""
                      }`}
                    >
                      <div className="lab-file-item-meta">
                        <strong>{file.name}</strong>
                        <span>{formatFileSize(file.size)}</span>
                      </div>

                      <div className="lab-file-item-actions">
                        <button
                          type="button"
                          className="lab-file-action"
                          onClick={() => previewLocalFile(index)}
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          className="lab-file-action lab-file-action-danger"
                          onClick={() => removeLocalFile(index)}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {failedUploads.length ? (
              <section className="lab-file-queue lab-file-failures" aria-label="Failed uploads">
                <div className="lab-file-queue-head">
                  <h3>Failed Uploads</h3>
                  <span>{failedUploads.length}</span>
                </div>

                <ul className="lab-file-list">
                  {failedUploads.map((failedItem) => (
                    <li key={failedItem.fileKey} className="lab-file-item lab-file-item-failed">
                      <div className="lab-file-item-meta">
                        <strong>{failedItem.fileName}</strong>
                        <span>{formatFileSize(failedItem.fileSize)}</span>
                        <small>{failedItem.message}</small>
                      </div>

                      <div className="lab-file-item-actions">
                        <button
                          type="button"
                          className="lab-file-action"
                          disabled={Boolean(submitting || retryingFileKey)}
                          onClick={() => retryFailedUpload(failedItem.fileKey)}
                        >
                          {retryingFileKey === failedItem.fileKey
                            ? "Retrying..."
                            : "Retry"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <label htmlFor="remarks" className="lab-field lab-textarea">
              Clinical Notes
              <textarea
                id="remarks"
                name="remarks"
                rows="4"
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                placeholder="Optional lab comments and critical details"
              />
            </label>

            <button type="submit" disabled={!canSubmit}>
              {submitting ? "Uploading PDF Files..." : "Upload PDF Files"}
            </button>

            {uploadProgressMessage ? (
              <p className="lab-upload-progress">{uploadProgressMessage}</p>
            ) : null}

            {status.message ? (
              <p className={`lab-status ${statusClassName}`} role="status">
                {status.message}
              </p>
            ) : null}
          </form>

          <section className="lab-panel lab-review">
            <h2>PDF Review</h2>

            <div className="lab-review-actions">
              <button
                type="button"
                className="lab-review-action"
                disabled={!hasActivePreview}
                onClick={() => setIsReviewFullscreen(true)}
              >
                Full Screen Preview
              </button>
              <button
                type="button"
                className="lab-review-action lab-review-cancel"
                disabled={!hasAnyPdf}
                onClick={clearPdfSelection}
              >
                Clear All PDFs
              </button>
            </div>

            {hasLocalPreview && hasUploadedPreview ? (
              <div
                className="lab-review-toggle"
                role="tablist"
                aria-label="Review mode"
              >
                <button
                  type="button"
                  className={reviewSource === "local" ? "active" : ""}
                  onClick={() => setReviewSource("local")}
                >
                  Local Preview
                </button>
                <button
                  type="button"
                  className={reviewSource === "uploaded" ? "active" : ""}
                  onClick={() => {
                    const firstPreviewIndex = getFirstUploadedPreviewIndex(uploadedFiles);
                    if (firstPreviewIndex >= 0) {
                      setReviewSource("uploaded");
                      setActiveUploadedFileIndex(firstPreviewIndex);
                    }
                  }}
                >
                  Uploaded PDF
                </button>
              </div>
            ) : null}

            {hasActivePreview ? (
              <div className="lab-pdf-wrap">
                <PdfCanvasPreview
                  file={activePreviewFile}
                  url={activePreviewUrl}
                  token={LAB_UPLOAD_API_TOKEN}
                />
              </div>
            ) : (
              <div className="lab-empty-preview">
                Select a PDF file to preview it here instantly on desktop,
                tablet, and mobile without downloading.
              </div>
            )}

            {uploadedFiles.length ? (
              <section className="lab-uploaded-files" aria-label="Uploaded PDF files">
                <div className="lab-file-queue-head">
                  <h3>Uploaded Files</h3>
                  <span>{uploadedFiles.length}</span>
                </div>

                <ul className="lab-file-list lab-uploaded-list">
                  {uploadedFiles.map((uploadedFile, index) => (
                    <li
                      key={uploadedFile.id}
                      className={`lab-file-item ${
                        reviewSource === "uploaded" && activeUploadedFileIndex === index
                          ? "active"
                          : ""
                      }`}
                    >
                      <div className="lab-file-item-meta">
                        <strong>{uploadedFile.fileName}</strong>
                        <span>{formatFileSize(uploadedFile.fileSize)}</span>
                        <small>{uploadedFile.uploadedAtLabel}</small>
                      </div>

                      <div className="lab-file-item-actions">
                        <button
                          type="button"
                          className="lab-file-action"
                          onClick={() => previewUploadedFile(index)}
                          disabled={!uploadedFile.previewUrl}
                        >
                          {uploadedFile.previewUrl ? "View" : "No Preview"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <ul className="lab-summary-list">
              {uploadSummary.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </li>
              ))}
            </ul>
          </section>
        </section>
      </main>

      {isReviewFullscreen && hasActivePreview ? (
        <div
          className="lab-fullscreen-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Full screen PDF preview"
        >
          <div className="lab-fullscreen-header">
            <h3>Full Screen PDF Review</h3>
            <button
              type="button"
              className="lab-fullscreen-close"
              onClick={() => setIsReviewFullscreen(false)}
            >
              Close
            </button>
          </div>

          <div className="lab-fullscreen-body">
            <PdfCanvasPreview
              file={activePreviewFile}
              url={activePreviewUrl}
              token={LAB_UPLOAD_API_TOKEN}
              fullscreen
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default LabUploadModule;
