import PropTypes from "prop-types";
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

  return (
    <div className="pdf-preview-page">
      <header className="pdf-preview-header">
        <div className="pdf-preview-title-block">
          <span className="pdf-preview-kicker">Hospital PDF Review</span>
          <h1>{previewTitle}</h1>
          <p>Fullscreen document preview with zoom and page navigation.</p>
        </div>
        {onBack && (
          <button type="button" className="pdf-preview-back" onClick={onBack}>
            Back to Lab Upload
          </button>
        )}
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
