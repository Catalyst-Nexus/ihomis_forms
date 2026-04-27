import PropTypes from "prop-types";
import { formatFileSize, getFileKey } from "../utils/labUploadUtils.js";

function LabUploadFormPanel({
  selectedPatient,
  displayContext,
  onSubmit,
  isDragActive,
  onDragOver,
  onDragLeave,
  onDrop,
  fileInputRef,
  onFileChange,
  resultFiles,
  reviewSource,
  activeLocalFileIndex,
  onPreviewLocalFile,
  onRemoveLocalFile,
  failedUploads,
  submitting,
  retryingFileKey,
  onRetryFailedUpload,
  remarks,
  onRemarksChange,
  canSubmit,
  uploadProgressMessage,
  status,
  statusClassName,
}) {
  return (
    <form className="lab-panel lab-form" onSubmit={onSubmit}>
      <div className="lab-request-header">
        <div>
          <p className="lab-request-label">Laboratory Panel</p>
          <h2>{displayContext.panelName}</h2>
        </div>
        <p className="lab-request-time">{displayContext.requestedAt}</p>
      </div>

      <section className="lab-patient-card" aria-label="Patient information">
        <h3>Patient Information</h3>
        {selectedPatient ? (
          <dl className="lab-patient-grid">
            <div>
              <dt>Patient ID</dt>
              <dd>{selectedPatient.id || "Not provided"}</dd>
            </div>
            <div>
              <dt>Name</dt>
              <dd>{selectedPatient.displayName || "Not provided"}</dd>
            </div>
            <div>
              <dt>Facility</dt>
              <dd>{selectedPatient.description || "Not provided"}</dd>
            </div>
          </dl>
        ) : (
          <dl className="lab-patient-grid">
            <div>
              <dt>First Name</dt>
              <dd>{displayContext.patient.firstName}</dd>
            </div>
            <div>
              <dt>Middle Name</dt>
              <dd>{displayContext.patient.middleName}</dd>
            </div>
            <div>
              <dt>Last Name</dt>
              <dd>{displayContext.patient.lastName}</dd>
            </div>
          </dl>
        )}
      </section>

      <div
        className={`lab-dropzone ${isDragActive ? "lab-dropzone-active" : ""}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          id="resultFile"
          name="resultFile"
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={onFileChange}
          multiple
          className="lab-file-input-hidden"
        />

        <p className="lab-dropzone-title">Drag and drop PDF files here</p>
        <p className="lab-dropzone-subtitle">
          or choose files from your device
        </p>
        <button
          type="button"
          className="lab-dropzone-action"
          onClick={() => fileInputRef.current?.click()}
        >
          Browse PDF Files
        </button>
      </div>

      <p className="lab-file-hint">
        You can select multiple PDFs at once, add more anytime, and retry failed
        files individually.
      </p>

      {resultFiles.length ? (
        <section className="lab-file-queue" aria-label="Selected PDF files">
          <div className="lab-file-queue-head">
            <h3>Selected PDF Files</h3>
            <span>{resultFiles.length}</span>
          </div>

          <ul className="lab-file-list">
            {resultFiles.map((file, index) => (
              <li
                key={getFileKey(file)}
                className={`lab-file-item ${
                  reviewSource === "local" && activeLocalFileIndex === index
                    ? "active"
                    : ""
                }`}
              >
                <div className="lab-file-item-meta">
                  <strong>{file.name}</strong>
                  <span>{formatFileSize(file.size)}</span>
                </div>

                <div className="lab-file-item-actions">
                  <button
                    type="button"
                    className="lab-file-action"
                    onClick={() => onPreviewLocalFile(index)}
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    className="lab-file-action lab-file-action-danger"
                    onClick={() => onRemoveLocalFile(index)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {failedUploads.length ? (
        <section
          className="lab-file-queue lab-file-failures"
          aria-label="Failed uploads"
        >
          <div className="lab-file-queue-head">
            <h3>Failed Uploads</h3>
            <span>{failedUploads.length}</span>
          </div>

          <ul className="lab-file-list">
            {failedUploads.map((failedItem) => (
              <li
                key={failedItem.fileKey}
                className="lab-file-item lab-file-item-failed"
              >
                <div className="lab-file-item-meta">
                  <strong>{failedItem.fileName}</strong>
                  <span>{formatFileSize(failedItem.fileSize)}</span>
                  <small>{failedItem.message}</small>
                </div>

                <div className="lab-file-item-actions">
                  <button
                    type="button"
                    className="lab-file-action"
                    disabled={Boolean(submitting || retryingFileKey)}
                    onClick={() => onRetryFailedUpload(failedItem.fileKey)}
                  >
                    {retryingFileKey === failedItem.fileKey
                      ? "Retrying..."
                      : "Retry"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <label htmlFor="remarks" className="lab-field lab-textarea">
        Clinical Notes
        <textarea
          id="remarks"
          name="remarks"
          rows="4"
          value={remarks}
          onChange={(event) => onRemarksChange(event.target.value)}
          placeholder="Optional lab comments and critical details"
        />
      </label>

      <button type="submit" disabled={!canSubmit}>
        {submitting ? "Uploading PDF Files..." : "Upload PDF Files"}
      </button>

      {uploadProgressMessage ? (
        <p className="lab-upload-progress">{uploadProgressMessage}</p>
      ) : null}

      {status.message ? (
        <p className={`lab-status ${statusClassName}`} role="status">
          {status.message}
        </p>
      ) : null}
    </form>
  );
}

LabUploadFormPanel.propTypes = {
  displayContext: PropTypes.shape({
    panelName: PropTypes.string.isRequired,
    requestedAt: PropTypes.string.isRequired,
    patient: PropTypes.shape({
      firstName: PropTypes.string.isRequired,
      middleName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  isDragActive: PropTypes.bool.isRequired,
  onDragOver: PropTypes.func.isRequired,
  onDragLeave: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
  fileInputRef: PropTypes.object.isRequired,
  onFileChange: PropTypes.func.isRequired,
  resultFiles: PropTypes.array.isRequired,
  reviewSource: PropTypes.string.isRequired,
  activeLocalFileIndex: PropTypes.number.isRequired,
  onPreviewLocalFile: PropTypes.func.isRequired,
  onRemoveLocalFile: PropTypes.func.isRequired,
  failedUploads: PropTypes.array.isRequired,
  submitting: PropTypes.bool.isRequired,
  retryingFileKey: PropTypes.string.isRequired,
  onRetryFailedUpload: PropTypes.func.isRequired,
  remarks: PropTypes.string.isRequired,
  onRemarksChange: PropTypes.func.isRequired,
  canSubmit: PropTypes.bool.isRequired,
  uploadProgressMessage: PropTypes.string.isRequired,
  status: PropTypes.shape({
    type: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
  }).isRequired,
  statusClassName: PropTypes.string.isRequired,
};

export default LabUploadFormPanel;
