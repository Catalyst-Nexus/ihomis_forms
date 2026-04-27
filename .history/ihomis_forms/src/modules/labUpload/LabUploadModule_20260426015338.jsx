import { useMemo } from "react";
import LabPatientPickerPanel from "./components/LabPatientPickerPanel.jsx";
import LabReviewPanel from "./components/LabReviewPanel.jsx";
import LabUploadFormPanel from "./components/LabUploadFormPanel.jsx";
import {
  LAB_UPLOAD_API_TOKEN,
  LAB_UPLOAD_API_URL,
  LAB_UPLOAD_CONTEXT_URL,
  LAB_UPLOAD_PATIENT_SEARCH_URL,
} from "./labUploadConfig.js";
import useLabPatientPicker from "./hooks/useLabPatientPicker.js";
import useLabRequestContext from "./hooks/useLabRequestContext.js";
import usePdfQueue from "./hooks/usePdfQueue.js";
import useUploadBatch from "./hooks/useUploadBatch.js";
import {
  buildDisplayContext,
  buildUploadSummary,
  getContextParamsFromLocation,
} from "./utils/labUploadUtils.js";
import "./LabUploadModule.css";

function LabUploadModule() {
  const initialContextParams = useMemo(
    () => getContextParamsFromLocation(),
    [],
  );
  const patientPicker = useLabPatientPicker({
    patientSearchUrl: LAB_UPLOAD_PATIENT_SEARCH_URL,
    contextUrl: LAB_UPLOAD_CONTEXT_URL,
    token: LAB_UPLOAD_API_TOKEN,
    initialContextParams,
  });

  const contextParams = patientPicker.activeContextParams;
  const hasApiUrl = Boolean(LAB_UPLOAD_API_URL);

  const { requestContext, contextLoading, applyContextFromApi } =
    useLabRequestContext({
      contextUrl: LAB_UPLOAD_CONTEXT_URL,
      token: LAB_UPLOAD_API_TOKEN,
      contextParams,
    });

  const {
    remarks,
    setRemarks,
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
    uploadUrl: LAB_UPLOAD_API_URL,
    token: LAB_UPLOAD_API_TOKEN,
    contextParams,
    onContextFromSuccess: applyContextFromApi,
  });

  const {
    fileInputRef,
    resultFiles,
    activeLocalFileIndex,
    activeUploadedFileIndex,
    reviewSource,
    isReviewFullscreen,
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
    openFullscreen,
    closeFullscreen,
  } = usePdfQueue({
    uploadedFiles,
    onStatusChange: setStatus,
    onLocalFileRemoved: removeFailureForFileKey,
    onClearAll: resetUploadState,
  });

  const canSubmit = Boolean(hasApiUrl && resultFiles.length > 0 && !submitting);
  const displayContext = useMemo(
    () => buildDisplayContext(requestContext),
    [requestContext],
  );

  const uploadSummary = useMemo(
    () =>
      buildUploadSummary({
        requestContext,
        contextLoading,
        displayContext,
        hasApiUrl,
        hasUploadedPreview,
        resultFileCount: resultFiles.length,
        reviewSource,
        uploadedFileCount: uploadedFiles.length,
      }),
    [
      contextLoading,
      displayContext,
      hasApiUrl,
      hasUploadedPreview,
      requestContext,
      resultFiles.length,
      reviewSource,
      uploadedFiles.length,
    ],
  );

  function handleFormSubmit(event) {
    handleSubmit(event, resultFiles);
  }

  function handleChangeSelection() {
    clearPdfSelection();
    patientPicker.reopenSelection();
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
                <span className="lab-hero-system">Hospital Information System</span>
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

              <h1 className="lab-hero-title">
                Upload Result
                <span className="lab-hero-panel-name">{displayContext.panelName}</span>
              </h1>

              {displayContext.requestedAt && (
                <p className="lab-hero-meta">
                  <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true">
                    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.5 8.5a.5.5 0 0 1 .5.5v2.5h1a.5.5 0 0 1 0 1h-3.5v-1h1.5v-.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1h.5a.5.5 0 0 1 0 1h-1v.5a.5.5 0 0 1-1 0v-2.5h-1a.5.5 0 0 1 0-1h3.5v1h-1.5v.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1H8.5a.5.5 0 0 1-.5-.5v-.5H7a.5.5 0 0 1 0-1h2.5v.5a.5.5 0 0 1-.5.5h-2z" />
                  </svg>
                  Requested {displayContext.requestedAt}
                </p>
              )}
            </div>

            <div className="lab-hero-right">
              {patientPicker.selectionConfirmed && patientPicker.selectedPatient ? (
                <div className="lab-hero-patient">
                  <div className="lab-hero-patient-avatar" aria-hidden="true">
                    {patientPicker.selectedPatient.displayName
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="lab-hero-patient-info">
                    <span className="lab-hero-patient-label">Selected Patient</span>
                    <span className="lab-hero-patient-name">{patientPicker.selectedPatient.displayName}</span>
                  </div>
                  <button
                    type="button"
                    className="lab-hero-patient-change"
                    onClick={handleChangeSelection}
                    aria-label="Change patient selection"
                  >
                    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true">
                      <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.622.94a.253.253 0 0 0 .102.275l3.994 2.276a.75.75 0 1 1-.88 1.14l-3.994-2.276a.253.253 0 0 0-.177-.109l-.622-.94a.253.253 0 0 0-.064-.108l-6.286-6.286.041-.042a1.014 1.014 0 0 1 1.429.042l1.128 1.128a1.014 1.014 0 0 1-.042 1.43z" />
                    </svg>
                    Change
                  </button>
                </div>
              ) : (
                <div className="lab-hero-badge lab-hero-badge--pending">
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
                    <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
                    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm1 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-4a1 1 0 0 1-2 0V5a1 1 0 1 1 2 0v4z" />
                  </svg>
                  No patient selected
                </div>
              )}
            </div>
          </div>
        </section>

        {patientPicker.shouldShowPicker ? (
          <section className="lab-reveal">
            <LabPatientPickerPanel
              patients={patientPicker.patients}
              loading={patientPicker.loading}
              errorMessage={patientPicker.errorMessage}
              selectedPatientId={patientPicker.selectedPatientId}
              searchTerm={patientPicker.searchTerm}
              pageIndex={patientPicker.pageIndex}
              hasNextPage={patientPicker.hasNextPage}
              hasPreviousPage={patientPicker.hasPreviousPage}
              onSearchTermChange={patientPicker.setSearchTerm}
              onSelectPatient={patientPicker.selectPatient}
              onConfirmSelection={patientPicker.confirmSelection}
              onNextPage={patientPicker.goToNextPage}
              onPreviousPage={patientPicker.goToPreviousPage}
            />
          </section>
        ) : (
          <section className="lab-grid lab-reveal">
            <LabUploadFormPanel
              selectedPatient={patientPicker.selectedPatient}
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
              remarks={remarks}
              onRemarksChange={setRemarks}
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
              token={LAB_UPLOAD_API_TOKEN}
              onOpenFullscreen={openFullscreen}
              onCloseFullscreen={closeFullscreen}
              onClearPdfSelection={clearPdfSelection}
              onShowLocalPreview={showLocalPreview}
              onShowUploadedPreview={showUploadedPreview}
              onPreviewUploadedFile={previewUploadedFile}
              uploadSummary={uploadSummary}
              isReviewFullscreen={isReviewFullscreen}
            />
          </section>
        )}
      </main>
    </div>
  );
}

export default LabUploadModule;
