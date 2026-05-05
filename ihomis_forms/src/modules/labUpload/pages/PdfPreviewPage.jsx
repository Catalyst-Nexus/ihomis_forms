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

  return (
    <div className="pdf-preview-page">
      <div className="pdf-preview-body">
        {hasPreview ? (
          <PdfCanvasPreview
            file={previewFile}
            url={previewUrl}
            token={previewToken}
            fullscreen
            onCloseFullscreen={onBack}
          />
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
