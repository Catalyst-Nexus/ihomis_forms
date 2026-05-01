import PropTypes from "prop-types";
import PdfCanvasPreview from "./PdfCanvasPreview.jsx";
import { formatFileSize } from "../utils/labUploadUtils.js";

function LabReviewPanel({
  uploadedFiles,
  reviewSource,
  activeUploadedFileIndex,
  hasLocalPreview,
  hasUploadedPreview,
  hasActivePreview,
  hasAnyPdf,
  activePreviewFile,
  activePreviewUrl,
  token,
  onOpenFullscreen,
  onCloseFullscreen,
  onClearPdfSelection,
  onShowLocalPreview,
  onShowUploadedPreview,
  onPreviewUploadedFile,
  uploadSummary,
  isReviewFullscreen,
}) {
  return (
    <>
      <section className="lab-panel lab-review">
        <h2>PDF Review</h2>

        <div className="lab-review-actions">
          <button
            type="button"
            className="lab-review-action"
            disabled={!hasActivePreview}
            onClick={onOpenFullscreen}
          >
            Full Screen Preview
          </button>
          <button
            type="button"
            className="lab-review-action lab-review-cancel"
            disabled={!hasAnyPdf}
            onClick={onClearPdfSelection}
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
              onClick={onShowLocalPreview}
            >
              Local Preview
            </button>
            <button
              type="button"
              className={reviewSource === "uploaded" ? "active" : ""}
              onClick={onShowUploadedPreview}
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
              token={token}
            />
          </div>
        ) : (
          <div className="lab-empty-preview">
            Select a PDF file to preview it here instantly on desktop, tablet,
            and mobile without downloading.
          </div>
        )}

        {uploadedFiles.length ? (
          <section
            className="lab-uploaded-files"
            aria-label="Uploaded PDF files"
          >
            <div className="lab-file-queue-head">
              <h3>Uploaded Files</h3>
              <span>{uploadedFiles.length}</span>
            </div>

            <ul className="lab-file-list lab-uploaded-list">
              {uploadedFiles.map((uploadedFile, index) => (
                <li
                  key={uploadedFile.id}
                  className={`lab-file-item ${
                    reviewSource === "uploaded" &&
                    activeUploadedFileIndex === index
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
                      onClick={() => onPreviewUploadedFile(index)}
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

      {isReviewFullscreen && hasActivePreview ? (
        <div
          className="lab-fullscreen-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Full screen PDF preview"
        >
          <div className="lab-fullscreen-body">
            <PdfCanvasPreview
              file={activePreviewFile}
              url={activePreviewUrl}
              token={token}
              fullscreen
              onCloseFullscreen={onCloseFullscreen}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

LabReviewPanel.propTypes = {
  uploadedFiles: PropTypes.array.isRequired,
  reviewSource: PropTypes.string.isRequired,
  activeUploadedFileIndex: PropTypes.number.isRequired,
  hasLocalPreview: PropTypes.bool.isRequired,
  hasUploadedPreview: PropTypes.bool.isRequired,
  hasActivePreview: PropTypes.bool.isRequired,
  hasAnyPdf: PropTypes.bool.isRequired,
  activePreviewFile: PropTypes.object,
  activePreviewUrl: PropTypes.string.isRequired,
  token: PropTypes.string.isRequired,
  onOpenFullscreen: PropTypes.func.isRequired,
  onCloseFullscreen: PropTypes.func.isRequired,
  onClearPdfSelection: PropTypes.func.isRequired,
  onShowLocalPreview: PropTypes.func.isRequired,
  onShowUploadedPreview: PropTypes.func.isRequired,
  onPreviewUploadedFile: PropTypes.func.isRequired,
  uploadSummary: PropTypes.array.isRequired,
  isReviewFullscreen: PropTypes.bool.isRequired,
};

export default LabReviewPanel;
