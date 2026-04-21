import { useMemo } from "react";
import LabReviewPanel from "./components/LabReviewPanel.jsx";
import LabUploadFormPanel from "./components/LabUploadFormPanel.jsx";
import {
  LAB_UPLOAD_API_TOKEN,
  LAB_UPLOAD_API_URL,
  LAB_UPLOAD_CONTEXT_URL,
} from "./labUploadConfig.js";
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
  const contextParams = useMemo(() => getContextParamsFromLocation(), []);
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

  return (
    <div className="lab-page">
      <div className="lab-ambient lab-ambient-a" aria-hidden="true" />
      <div className="lab-ambient lab-ambient-b" aria-hidden="true" />

      <main className="lab-layout">
        <section className="lab-panel lab-hero lab-reveal">
          <p className="lab-kicker">Hospital Information System</p>
          <h1>Upload Result for {displayContext.panelName}</h1>
          <p>Requested on {displayContext.requestedAt}</p>

          <span
            className={`lab-api-state ${
              requestContext.hasAnyContext ? "lab-api-ready" : "lab-api-missing"
            }`}
          >
            {contextLoading
              ? "Loading request context from API..."
              : requestContext.hasAnyContext
                ? "Request context loaded from API"
                : "Waiting for request context from API response"}
          </span>
        </section>

        <section className="lab-grid lab-reveal">
          <LabUploadFormPanel
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
      </main>
    </div>
  );
}

export default LabUploadModule;
