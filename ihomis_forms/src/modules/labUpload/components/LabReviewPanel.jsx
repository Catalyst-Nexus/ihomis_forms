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
  onClearPdfSelection,
  onShowLocalPreview,
  onShowUploadedPreview,
  onPreviewUploadedFile,
}) {
  return (
    <>
      <section className="lab-panel lab-review">
        <h2>PDF Review</h2>

        <div className="lab-review-toolbar">
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

          {hasLocalPreview && hasUploadedPreview ? (
            <>
              <button
                type="button"
                className={`lab-review-action ${
                  reviewSource === "local" ? "is-active" : ""
                }`}
                onClick={onShowLocalPreview}
              >
                Local Preview
              </button>
              <button
                type="button"
                className={`lab-review-action ${
                  reviewSource === "uploaded" ? "is-active" : ""
                }`}
                onClick={onShowUploadedPreview}
              >
                Uploaded PDF
              </button>
            </>
          ) : null}
        </div>

        {hasActivePreview ? (
          <div className="lab-pdf-wrap">
            <PdfCanvasPreview
              file={activePreviewFile}
              url={activePreviewUrl}
              token={token}
            />
          </div>
        ) : (
          <div className="lab-empty-preview">Select a PDF file to preview.</div>
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
      </section>
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
  onClearPdfSelection: PropTypes.func.isRequired,
  onShowLocalPreview: PropTypes.func.isRequired,
  onShowUploadedPreview: PropTypes.func.isRequired,
  onPreviewUploadedFile: PropTypes.func.isRequired,
};

export default LabReviewPanel;
