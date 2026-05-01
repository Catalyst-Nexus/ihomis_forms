import { useEffect, useMemo, useRef, useState } from "react";
import { uploadLabResultBatch } from "./api/labUploadApi.js";
import PdfCanvasPreview from "./components/PdfCanvasPreview.jsx";
import "./LabUploadModule.css";

const LAB_UPLOAD_API_URL = (
  import.meta.env.VITE_LAB_UPLOAD_API_URL ||
  import.meta.env.VITE_API_URL ||
  ""
).trim();
const LAB_UPLOAD_API_TOKEN = (
  import.meta.env.VITE_LAB_UPLOAD_API_TOKEN || ""
).trim();

const requestContext = {
  panelName: "CBC - Complete Blood Count",
  requestedAt: "2026-04-18 19:51:22",
  patient: {
    firstName: "FRANCES SOFIA",
    middleName: "HORMACHUELOS",
    lastName: "SAGA",
  },
};

const initialFormState = {
  laboratoryType: requestContext.panelName,
  remarks: "",
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

function LabUploadModule() {
  const [formState, setFormState] = useState(initialFormState);
  const [resultFiles, setResultFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeLocalFileIndex, setActiveLocalFileIndex] = useState(0);
  const [activeUploadedFileIndex, setActiveUploadedFileIndex] = useState(0);
  const [reviewSource, setReviewSource] = useState("local");
  const [isReviewFullscreen, setIsReviewFullscreen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [status, setStatus] = useState({ type: "", message: "" });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isReviewFullscreen) {
      return undefined;
    }
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

    const uploadSummary = useMemo(
      () => [
        {
          label: "Workflow Context",
          value: "Context metadata is resolved securely by the backend workflow.",
        },
        {
          label: "Laboratory Type",
          value: formState.laboratoryType || requestContext.panelName,
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
        formState.laboratoryType,
        hasUploadedPreview,
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

    function handleInputChange(event) {
      const { name, value } = event.target;
      setFormState((currentState) => ({
        ...currentState,
        [name]: value,
      }));
    }

    function clearPdfSelection() {
      setResultFiles([]);
      setUploadedFiles([]);
      setActiveLocalFileIndex(0);
      setActiveUploadedFileIndex(0);
      setReviewSource("local");
      setIsReviewFullscreen(false);
      setUploadProgress({ current: 0, total: 0 });
      setStatus({ type: "", message: "" });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }

    function handleFileChange(event) {
      const selectedFiles = Array.from(event.target.files || []);
      const validPdfFiles = selectedFiles.filter((file) => isPdfFile(file));
      const invalidFileCount = selectedFiles.length - validPdfFiles.length;

      if (!validPdfFiles.length) {
        setStatus({
          type: "error",
          message: "Only PDF files are allowed for laboratory result upload.",
        });

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        } else {
          event.target.value = "";
        }
        return;
      }

      const mergedFiles = mergeUniqueFiles(resultFiles, validPdfFiles);
      setResultFiles(mergedFiles);
      setReviewSource("local");

      if (!resultFiles.length) {
        setActiveLocalFileIndex(0);
      }

      if (invalidFileCount > 0) {
        setStatus({
          type: "warning",
          message:
            `${validPdfFiles.length} PDF file(s) added. ` +
            `${invalidFileCount} non-PDF file(s) were ignored.`,
        });
      } else {
        setStatus({
          type: "success",
          message: `${validPdfFiles.length} PDF file(s) added to the queue.`,
        });
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      } else {
        event.target.value = "";
      }
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
      setResultFiles((currentFiles) =>
        currentFiles.filter((_, currentIndex) => currentIndex !== index),
      );
    }

    async function handleSubmit(event) {
      event.preventDefault();

      if (!hasApiUrl) {
        setStatus({
          type: "error",
          message:
            "Missing API URL. Set VITE_LAB_UPLOAD_API_URL or VITE_API_URL in your .env file.",
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
          laboratoryType: formState.laboratoryType,
          remarks: formState.remarks,
          onProgress: ({ current, total }) => {
            setUploadProgress({ current, total });
          },
        });

        if (successes.length > 0) {
          const uploadedEntries = successes.map((item) => ({
            id: `${item.fileName}-${item.uploadedAt}`,
            fileName: item.fileName,
            fileSize: item.fileSize,
            previewUrl: item.uploadedPdfUrl,
            uploadedAtLabel: formatDateTime(item.uploadedAt),
          }));

          setUploadedFiles((currentItems) => [...uploadedEntries, ...currentItems]);

          const firstPreviewIndex = getFirstUploadedPreviewIndex(uploadedEntries);
          if (firstPreviewIndex >= 0) {
            setReviewSource("uploaded");
            setActiveUploadedFileIndex(firstPreviewIndex);
          }
        }

        if (successes.length > 0 && failures.length > 0) {
          setStatus({
            type: "warning",
            message:
              `${successes.length} PDF file(s) uploaded successfully. ` +
              `${failures.length} file(s) failed to upload.`,
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

    return (
      <div className="lab-page">
        <div className="lab-ambient lab-ambient-a" aria-hidden="true" />
        <div className="lab-ambient lab-ambient-b" aria-hidden="true" />

        <main className="lab-layout">
          <section className="lab-panel lab-hero lab-reveal">
            <p className="lab-kicker">Hospital Information System</p>
            <h1>Upload Result for {requestContext.panelName}</h1>
            <p>Requested on {requestContext.requestedAt}</p>
          </section>

          <section className="lab-grid lab-reveal">
            <form className="lab-panel lab-form" onSubmit={handleSubmit}>
              <div className="lab-request-header">
                <div>
                  <p className="lab-request-label">Laboratory Panel</p>
                  <h2>{requestContext.panelName}</h2>
                </div>
                <p className="lab-request-time">{requestContext.requestedAt}</p>
              </div>

              <section className="lab-patient-card" aria-label="Patient information">
                <h3>Patient Information</h3>
                <dl className="lab-patient-grid">
                  <div>
                    <dt>First Name</dt>
                    <dd>{requestContext.patient.firstName}</dd>
                  </div>
                  <div>
                    <dt>Middle Name</dt>
                    <dd>{requestContext.patient.middleName}</dd>
                  </div>
                  <div>
                    <dt>Last Name</dt>
                    <dd>{requestContext.patient.lastName}</dd>
                  </div>
                </dl>
              </section>

              <div className="lab-field-grid">
                <label htmlFor="laboratoryType" className="lab-field">
                  Laboratory Type
                  <input
                    id="laboratoryType"
                    name="laboratoryType"
                    value={formState.laboratoryType}
                    onChange={handleInputChange}
                    placeholder="e.g. Hematology"
                  />
                </label>

                <label htmlFor="resultFile" className="lab-field">
                  Select PDF Files
                  <input
                    id="resultFile"
                    name="resultFile"
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    multiple
                    required={!resultFiles.length}
                  />
                </label>
              </div>

              <p className="lab-file-hint">
                You can select multiple PDFs at once, or add more files anytime.
              </p>

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

              <label htmlFor="remarks" className="lab-field lab-textarea">
                Clinical Notes
                <textarea
                  id="remarks"
                  name="remarks"
                  rows="4"
                  value={formState.remarks}
                  onChange={handleInputChange}
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
            </div>
        </div>
      ) : null}
    </div>
  );
}

export default LabUploadModule;
