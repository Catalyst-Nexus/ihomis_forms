import { useMemo } from "react";
import PropTypes from "prop-types";
import LabWorkflowPanel from "./components/LabWorkflowPanel.jsx";
import {
  LAB_UPLOAD_API_TOKEN,
  LAB_UPLOAD_CONTEXT_URL,
} from "./labUploadConfig.js";
import { canUseSupabaseUploads } from "./api/labUploadSupabase.js";
import useLabRequestContext from "./hooks/useLabRequestContext.js";
import { usePdfPreview } from "../../lib/PdfPreviewContext.jsx";
import "./LabUploadModule.css";

function LabUploadModule({
  selectedPatient = null,
  selectedContextParams = {},
  onRequestPatientChange,
  onNavigateToPreview = null,
}) {
  /**
   * Build the full contextParams from patient + explicit overrides.
   * The encounter (enccode) is set by useLabPatientPicker before navigating here.
   */
  const contextParams = useMemo(
    () => ({
      ...(selectedPatient?.contextParams || {}),
      ...selectedContextParams,
    }),
    [selectedPatient, selectedContextParams],
  );

  const hasSupabaseUpload = canUseSupabaseUploads();
  const { openPreview } = usePdfPreview();

  /**
   * Load request context from the hospital API (optional — does not
   * block the workflow if unavailable since we already have
   * patient + encounter from the picker).
   */
  const { requestContext, contextLoading, contextError } = useLabRequestContext({
    contextUrl: LAB_UPLOAD_CONTEXT_URL,
    token: LAB_UPLOAD_API_TOKEN,
    contextParams,
  });

  /**
   * Called after each successful upload with the result { docointkey, uploadedPdfUrl, ... }
   */
  function handleUploadComplete(result) {
    if (result?.uploadedPdfUrl) {
      openPreview({
        url: result.uploadedPdfUrl,
        token: LAB_UPLOAD_API_TOKEN,
        source: "lab-upload",
      });
    }
  }

  /**
   * Triggered by "Change Patient" button inside LabWorkflowPanel.
   */
  function handleRequestPatientChange() {
    if (typeof onRequestPatientChange === "function") {
      onRequestPatientChange();
    }
  }

  return (
    <div className="lab-page">
      <div className="lab-ambient lab-ambient-a" aria-hidden="true" />
      <div className="lab-ambient lab-ambient-b" aria-hidden="true" />

      <main className="lab-layout">
        <section className="lab-hero-wrap lab-reveal">
          <div className="lab-hero">
            <div className="lab-hero-left">
              <div className="lab-hero-eyebrow">
                <span className="lab-hero-system">
                  Hospital Information System
                </span>
                <span
                  className={`lab-hero-status lab-hero-status--${
                    hasSupabaseUpload ? "ready" : "pending"
                  }`}
                >
                  <span className="lab-hero-status-dot" aria-hidden="true" />
                  {hasSupabaseUpload ? "Ready" : "Configure Supabase"}
                </span>
              </div>

              <h1 className="lab-hero-title">Lab Result Upload</h1>
            </div>
          </div>
        </section>

        <section className="lab-grid lab-reveal">
          <LabWorkflowPanel
            patient={selectedPatient}
            contextParams={contextParams}
            onUploadComplete={handleUploadComplete}
            onRequestPatientChange={handleRequestPatientChange}
          />
        </section>
      </main>
    </div>
  );
}

LabUploadModule.propTypes = {
  selectedPatient: PropTypes.shape({
    id: PropTypes.string,
    idSource: PropTypes.string,
    displayName: PropTypes.string,
    description: PropTypes.string,
    contextParams: PropTypes.object,
    rawData: PropTypes.object,
  }),
  selectedContextParams: PropTypes.object,
  onRequestPatientChange: PropTypes.func,
  onNavigateToPreview: PropTypes.func,
};

export default LabUploadModule;
