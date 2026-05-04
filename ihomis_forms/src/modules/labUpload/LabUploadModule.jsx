import { useMemo } from "react";
import PropTypes from "prop-types";
import LabReviewPanel from "./components/LabReviewPanel.jsx";
import LabUploadFormPanel from "./components/LabUploadFormPanel.jsx";
import SelectedPatientIndicator from "./components/SelectedPatientIndicator.jsx";
import {
  LAB_UPLOAD_API_TOKEN,
  LAB_UPLOAD_CONTEXT_URL,
} from "./labUploadConfig.js";
import { canUseSupabaseUploads } from "./api/labUploadSupabase.js";
import useLabRequestContext from "./hooks/useLabRequestContext.js";
import usePdfQueue from "./hooks/usePdfQueue.js";
import useUploadBatch from "./hooks/useUploadBatch.js";
import { usePdfPreview } from "../../lib/PdfPreviewContext.jsx";
import { buildDisplayContext } from "./utils/labUploadUtils.js";
import "./LabUploadModule.css";

function LabUploadModule({
  selectedPatient = null,
  selectedContextParams = {},
  onRequestPatientChange,
  onNavigateToPreview = null,
}) {
  const contextParams = selectedContextParams;
  const hasSupabaseUpload = canUseSupabaseUploads();
  const { openPreview } = usePdfPreview();

  const { requestContext, contextLoading, applyContextFromApi } =
    useLabRequestContext({
      contextUrl: LAB_UPLOAD_CONTEXT_URL,
      token: LAB_UPLOAD_API_TOKEN,
      contextParams,
    });

  const {
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
  } = useUploadBatch({
    contextParams,
    patient: selectedPatient,
    onContextFromSuccess: applyContextFromApi,
  });

  const {
    fileInputRef,
    resultFiles,
    activeLocalFileIndex,
    activeUploadedFileIndex,
    reviewSource,
    isDragActive,
    hasLocalPreview,
    hasUploadedPreview,
    hasActivePreview,
    hasAnyPdf,
    activePreviewFile,
    activePreviewUrl,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    previewLocalFile,
    previewUploadedFile,
    removeLocalFile,
    clearPdfSelection,
    showLocalPreview,
    showUploadedPreview,
  } = usePdfQueue({
    uploadedFiles,
    onStatusChange: setStatus,
    onLocalFileRemoved: removeFailureForFileKey,
    onClearAll: resetUploadState,
  });

  const canSubmit = Boolean(
    hasSupabaseUpload && resultFiles.length > 0 && !submitting,
  );
  const displayContext = useMemo(
    () => buildDisplayContext(requestContext),
    [requestContext],
  );

  function handleFormSubmit(event) {
    handleSubmit(event, resultFiles);
  }

  function handleChangeSelection() {
    clearPdfSelection();
    if (typeof onRequestPatientChange === "function") {
      onRequestPatientChange();
    }
  }

  function handleOpenPreview() {
    openPreview({
      file: activePreviewFile,
      url: activePreviewUrl,
      token: "",
      source: reviewSource,
    });

    if (typeof onNavigateToPreview === "function") {
      onNavigateToPreview();
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
                  className={`lab-hero-status ${
                    contextLoading
                      ? "lab-hero-status--loading"
                      : requestContext.hasAnyContext
                        ? "lab-hero-status--ready"
                        : "lab-hero-status--pending"
                  }`}
                >
                  <span className="lab-hero-status-dot" aria-hidden="true" />
                  {contextLoading
                    ? "Loading"
                    : requestContext.hasAnyContext
                      ? "Context Ready"
                      : "Awaiting Context"}
                </span>
              </div>

              <h1 className="lab-hero-title">Upload Result</h1>

              {displayContext.requestedAt && (
                <p className="lab-hero-meta">
                  <svg
                    viewBox="0 0 16 16"
                    width="13"
                    height="13"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.5 8.5a.5.5 0 0 1 .5.5v2.5h1a.5.5 0 0 1 0 1h-3.5v-1h1.5v-.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1h.5a.5.5 0 0 1 0 1h-1v.5a.5.5 0 0 1-1 0v-2.5h-1a.5.5 0 0 1 0-1h3.5v1h-1.5v.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1H8.5a.5.5 0 0 1-.5-.5v-.5H7a.5.5 0 0 1 0-1h2.5v.5a.5.5 0 0 1-.5.5h-2z" />
                  </svg>
                  Requested {displayContext.requestedAt}
                </p>
              )}
            </div>

            <div className="lab-hero-right">
              <SelectedPatientIndicator
                selectedPatient={selectedPatient}
                onChangeSelection={handleChangeSelection}
              />
            </div>
          </div>
        </section>

        <section className="lab-grid lab-reveal">
          <LabUploadFormPanel
            selectedPatient={selectedPatient}
            displayContext={displayContext}
            onSubmit={handleFormSubmit}
            isDragActive={isDragActive}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            fileInputRef={fileInputRef}
            onFileChange={handleFileChange}
            resultFiles={resultFiles}
            reviewSource={reviewSource}
            activeLocalFileIndex={activeLocalFileIndex}
            onPreviewLocalFile={previewLocalFile}
            onRemoveLocalFile={removeLocalFile}
            failedUploads={failedUploads}
            submitting={submitting}
            retryingFileKey={retryingFileKey}
            onRetryFailedUpload={retryFailedUpload}
            canSubmit={canSubmit}
            uploadProgressMessage={uploadProgressMessage}
            status={status}
            statusClassName={statusClassName}
          />

          <LabReviewPanel
            uploadedFiles={uploadedFiles}
            reviewSource={reviewSource}
            activeUploadedFileIndex={activeUploadedFileIndex}
            hasLocalPreview={hasLocalPreview}
            hasUploadedPreview={hasUploadedPreview}
            hasActivePreview={hasActivePreview}
            hasAnyPdf={hasAnyPdf}
            activePreviewFile={activePreviewFile}
            activePreviewUrl={activePreviewUrl}
            token=""
            onOpenFullscreen={handleOpenPreview}
            onClearPdfSelection={clearPdfSelection}
            onShowLocalPreview={showLocalPreview}
            onShowUploadedPreview={showUploadedPreview}
            onPreviewUploadedFile={previewUploadedFile}
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
