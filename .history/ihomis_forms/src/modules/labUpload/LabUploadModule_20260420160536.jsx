import { useEffect, useMemo, useRef, useState } from "react";
import { uploadLabResult } from "./api/labUploadApi.js";
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

const initialFormState = {
  laboratoryType: "",
  remarks: "",
};

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
  const [resultFile, setResultFile] = useState(null);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState("");
  const [reviewSource, setReviewSource] = useState("local");
  const [isReviewFullscreen, setIsReviewFullscreen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const fileInputRef = useRef(null);

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

  const hasApiUrl = Boolean(LAB_UPLOAD_API_URL);
  const canSubmit = Boolean(hasApiUrl && resultFile && !submitting);
  const hasLocalPreview = Boolean(resultFile);
  const hasUploadedPreview = Boolean(uploadedPdfUrl);

  const activePreviewFile =
    reviewSource === "uploaded" && hasUploadedPreview ? null : resultFile;
  const activePreviewUrl =
    reviewSource === "uploaded" && hasUploadedPreview
      ? uploadedPdfUrl
      : "";
  const hasActivePreview = Boolean(activePreviewFile || activePreviewUrl);

  const hasAnyPdf = Boolean(resultFile || uploadedPdfUrl);

  const uploadSummary = useMemo(
    () => [
      {
        label: "Workflow Context",
        value: "Context metadata is resolved securely by the backend workflow.",
      },
      {
        label: "Laboratory Type",
        value: formState.laboratoryType || "General laboratory result",
      },
      {
        label: "Attachment",
        value: resultFile
          ? `${resultFile.name} (${formatFileSize(resultFile.size)})`
          : "No PDF selected",
      },
      {
        label: "Review Mode",
        value:
          reviewSource === "uploaded" && hasUploadedPreview
            ? "Uploaded PDF from API response"
            : "Local in-app preview",
      },
    ],
    [formState.laboratoryType, hasUploadedPreview, resultFile, reviewSource],
  );

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormState((currentState) => ({
      ...currentState,
      [name]: value,
    }));
  }

  function clearPdfSelection() {
    setResultFile(null);
    setUploadedPdfUrl("");
    setReviewSource("local");
    setIsReviewFullscreen(false);
    setStatus({ type: "", message: "" });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0] || null;

    if (selectedFile && !isPdfFile(selectedFile)) {
      setResultFile(null);
      setUploadedPdfUrl("");
      setReviewSource("local");
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

    setResultFile(selectedFile);
    setUploadedPdfUrl("");
    setReviewSource("local");
    setStatus({ type: "", message: "" });
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

    if (!resultFile) {
      setStatus({
        type: "error",
        message: "Please select a PDF file before uploading.",
      });
      return;
    }

    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await uploadLabResult({
        uploadUrl: LAB_UPLOAD_API_URL,
        token: LAB_UPLOAD_API_TOKEN,
        resultFile,
        laboratoryType: formState.laboratoryType,
        remarks: formState.remarks,
      });

      if (response.uploadedPdfUrl) {
        setUploadedPdfUrl(response.uploadedPdfUrl);
        setReviewSource("local");
        setStatus({
          type: "success",
          message:
            "PDF uploaded successfully. Local preview remains active, and uploaded copy is available in review mode.",
        });
      } else {
        setStatus({
          type: "success",
          message:
            "PDF uploaded successfully. API did not return a preview URL, so local review remains visible.",
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
    }
  }

  return (
    <div className="lab-page">
      <div className="lab-ambient lab-ambient-a" aria-hidden="true" />
      <div className="lab-ambient lab-ambient-b" aria-hidden="true" />

      <main className="lab-layout">
        <section className="lab-panel lab-hero lab-reveal">
          <p className="lab-kicker">Hospital Information System</p>
          <h1>Laboratory Upload</h1>
          <p>
            Upload and review laboratory results in a dedicated module with a
            secure backend-driven workflow context.
          </p>
        </section>

        <section className="lab-grid lab-reveal">
          <form className="lab-panel lab-form" onSubmit={handleSubmit}>
            <h2>Upload PDF Result</h2>

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
                Result PDF Attachment
                <input
                  id="resultFile"
                  name="resultFile"
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  required
                />
              </label>
            </div>

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
              {submitting ? "Uploading PDF..." : "Upload Laboratory PDF"}
            </button>

            {status.message ? (
              <p
                className={`lab-status ${
                  status.type === "success"
                    ? "lab-status-success"
                    : "lab-status-error"
                }`}
                role="status"
              >
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
                Cancel PDF
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
                  onClick={() => setReviewSource("uploaded")}
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
