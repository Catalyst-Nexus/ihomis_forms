import PropTypes from "prop-types";
import { useEffect } from "react";
import PdfCanvasPreview from "../components/PdfCanvasPreview.jsx";
import "./PdfPreviewPage.css";

function PdfPreviewPage({
  previewFile = null,
  previewUrl = "",
  previewToken = "",
  onBack = null,
}) {
  const hasPreview = Boolean(previewFile || previewUrl);
  const previewTitle = previewFile?.name || "Lab Result Preview";

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape" && onBack) {
        onBack();
      }
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [onBack]);

  return (
    <div className="pdf-preview-page">
      <header className="pdf-preview-header">
        <div className="pdf-preview-title-block">
          <div className="pdf-preview-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div>
            <h1>{previewTitle}</h1>
            <p>Fullscreen document preview with zoom and page navigation.</p>
          </div>
        </div>
        <div className="pdf-preview-header-controls">
          <div className="pdf-preview-hint">
            <span>Press ESC to close</span>
          </div>
          {onBack && (
            <button
              type="button"
              className="pdf-preview-back"
              onClick={onBack}
              title="Close preview (ESC)"
            >
              ✕
            </button>
          )}
        </div>
      </header>
      <div className="pdf-preview-body">
        {hasPreview ? (
          <div className="pdf-preview-frame">
            <PdfCanvasPreview
              file={previewFile}
              url={previewUrl}
              token={previewToken}
              fullscreen
              onCloseFullscreen={onBack}
            />
          </div>
        ) : (
          <div className="pdf-preview-empty">
            <p>No PDF selected for preview</p>
          </div>
        )}
      </div>
    </div>
  );
}

PdfPreviewPage.propTypes = {
  previewFile: PropTypes.object,
  previewUrl: PropTypes.string,
  previewToken: PropTypes.string,
  onBack: PropTypes.func,
};

export default PdfPreviewPage;
