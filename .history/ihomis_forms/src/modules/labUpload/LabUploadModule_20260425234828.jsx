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
        <section className="lab-panel lab-hero lab-reveal">
          <div className="lab-hero-top">
            <div>
              <p className="lab-kicker">Hospital Information System</p>
              <h1>Upload Laboratory Result</h1>
            </div>
            <div className="lab-hero-status" aria-live="polite">
              {contextLoading ? (
                <span className="lab-status-badge lab-status-loading">
                  <span className="lab-badge-spinner" aria-hidden="true" />
                  Loading context&hellip;
                </span>
              ) : requestContext.hasAnyContext ? (
                <span className="lab-status-badge lab-status-ready">
                  <svg aria-hidden="true" viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
                  </svg>
                  Context loaded
                </span>
              ) : (
                <span className="lab-status-badge lab-status-waiting">
                  Awaiting context
                </span>
              )}
            </div>
          </div>

          {patientPicker.selectionConfirmed && patientPicker.selectedPatient ? (
            <div className="lab-context-strip">
              <div className="lab-context-patient">
                <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span className="lab-context-label">Patient</span>
                <strong>{patientPicker.selectedPatient.displayName}</strong>
                <span className="lab-context-mono">{patientPicker.selectedPatient.id}</span>
                {patientPicker.selectedPatient.description ? (
                  <em>{patientPicker.selectedPatient.description}</em>
                ) : null}
              </div>
              <div className="lab-context-enc">
                <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108A2.251 2.251 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5z" />
                </svg>
                <span className="lab-context-label">Encounter</span>
                <strong>{displayContext.identifiers?.enccode || displayContext.requestedAt || "—"}</strong>
              </div>
              <button
                type="button"
                className="lab-context-change"
                onClick={handleChangeSelection}
              >
                Change Patient
              </button>
            </div>
          ) : (
            <p className="lab-hero-hint">
              Select a patient below to associate this lab result with their record.
            </p>
          )}
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
