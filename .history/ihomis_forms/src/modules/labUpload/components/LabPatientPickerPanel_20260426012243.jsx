import PropTypes from "prop-types";

function getInitials(displayName) {
  const parts = (displayName || "?").trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

function getAvatarColor(id) {
  const colors = [
    "#1f9d95", "#3a8f7a", "#5b7fcb", "#8b5dcb",
    "#cb5b8f", "#cb8b5b", "#5bcb7a", "#7a8f3a",
  ];
  let hash = 0;
  for (let i = 0; i < (id || "").length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return colors[Math.abs(hash) % colors.length];
}

function PatientAvatar({ displayName, id }) {
  return (
    <div
      className="pk-avatar"
      style={{ background: getAvatarColor(id) }}
      aria-hidden="true"
    >
      {getInitials(displayName)}
    </div>
  );
}

function PatientCard({ patient, isSelected, onSelect }) {
  const { displayName, id, description, contextParams } = patient;
  return (
    <button
      type="button"
      className={`pk-card${isSelected ? " pk-card--selected" : ""}`}
      onClick={() => onSelect(patient)}
      aria-pressed={isSelected}
    >
      <PatientAvatar displayName={displayName} id={id} />

      <div className="pk-card-body">
        <div className="pk-card-primary">
          <span className="pk-card-name">{displayName}</span>
          {isSelected && (
            <span className="pk-card-badge" aria-label="Selected">
              <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor" aria-hidden="true">
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
              </svg>
            </span>
          )}
        </div>

        <div className="pk-card-meta">
          <code className="pk-card-id">{id}</code>
          {description && (
            <span className="pk-card-desc">{description}</span>
          )}
        </div>

        {contextParams && (
          <div className="pk-card-context">
            {contextParams.enccode && (
              <span className="pk-context-chip">
                <span className="pk-context-label">ENC</span>
                <span className="pk-context-value">{contextParams.enccode}</span>
              </span>
            )}
            {contextParams.fhud && (
              <span className="pk-context-chip">
                <span className="pk-context-label">FHUD</span>
                <span className="pk-context-value">{contextParams.fhud}</span>
              </span>
            )}
            {contextParams.docointkey && (
              <span className="pk-context-chip">
                <span className="pk-context-label">KEY</span>
                <span className="pk-context-value">{contextParams.docointkey}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

function PaginationBar({ pageIndex, hasNextPage, hasPreviousPage, onNext, onPrev }) {
  return (
    <div className="pk-pagination" role="navigation" aria-label="Patient list pagination">
      <button
        type="button"
        className="pk-page-btn"
        onClick={onPrev}
        disabled={!hasPreviousPage}
        aria-label="Previous page"
      >
        <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true">
          <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
        </svg>
        Prev
      </button>

      <div className="pk-page-indicator" aria-live="polite">
        <span className="pk-page-num">Page {pageIndex + 1}</span>
        <span className="pk-page-tip">{hasNextPage ? "more results below" : "last page"}</span>
      </div>

      <button
        type="button"
        className="pk-page-btn"
        onClick={onNext}
        disabled={!hasNextPage}
        aria-label="Next page"
      >
        Next
        <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true">
          <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
        </svg>
      </button>
    </div>
  );
}

function LabPatientPickerPanel({
  patients,
  loading,
  errorMessage,
  selectedPatientId,
  searchTerm,
  pageIndex,
  hasNextPage,
  hasPreviousPage,
  onSearchTermChange,
  onSelectPatient,
  onConfirmSelection,
  onNextPage,
  onPreviousPage,
}) {
  const hasSelection = Boolean(selectedPatientId);

  return (
    <section className="lab-panel pk-panel" aria-label="Patient selection">
      {/* Header */}
      <div className="pk-header">
        <div className="pk-header-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div className="pk-header-text">
          <h2>Select Patient</h2>
          <p>Choose whose laboratory result you are uploading. This links the result to the correct encounter.</p>
        </div>
      </div>

      {/* Search */}
      <div className="pk-search-wrap">
        <div className="pk-search-inner">
          <svg className="pk-search-icon" viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM2 8a6 6 0 1 1 12 0A6 6 0 0 1 2 8z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M11.5 11.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
          </svg>
          <input
            id="patientSearch"
            type="search"
            className="pk-search-input"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="Search by name, encounter code, or document key..."
            aria-label="Search patients"
            autoComplete="off"
          />
          {searchTerm && (
            <button
              type="button"
              className="pk-search-clear"
              onClick={() => onSearchTermChange("")}
              aria-label="Clear search"
            >
              <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {errorMessage ? (
        <div className="pk-alert pk-alert--error" role="alert">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-1 1v4a1 1 0 0 0 .293.707l2.828 2.829a1 1 0 1 0 1.414-1.415L11 9.586V5a1 1 0 0 0-1-1z" clipRule="evenodd" />
          </svg>
          {errorMessage}
        </div>
      ) : null}

      {/* Loading skeleton */}
      {loading ? (
        <div className="pk-list pk-list--loading" aria-busy="true" aria-label="Loading patients">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="pk-skeleton-card" aria-hidden="true">
              <div className="pk-skeleton-avatar" />
              <div className="pk-skeleton-body">
                <div className="pk-skeleton-line pk-skeleton-line--name" />
                <div className="pk-skeleton-line pk-skeleton-line--meta" />
              </div>
            </div>
          ))}
        </div>
      ) : patients.length > 0 ? (
        <>
          <ul className="pk-list" role="listbox" aria-label="Patient list">
            {patients.map((patient) => (
              <li key={patient.id}>
                <PatientCard
                  patient={patient}
                  isSelected={selectedPatientId === patient.id}
                  onSelect={onSelectPatient}
                />
              </li>
            ))}
          </ul>

          <PaginationBar
            pageIndex={pageIndex}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onNext={onNextPage}
            onPrev={onPreviousPage}
          />
        </>
      ) : (
        <div className="pk-empty">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <p className="pk-empty-title">No patients found</p>
          <p className="pk-empty-sub">
            {searchTerm
              ? `No results for "${searchTerm}". Try a different term.`
              : "No patient records are available for the current filters."}
          </p>
        </div>
      )}

      {/* Confirm action */}
      <div className="pk-footer">
        <p className="pk-footer-hint">
          {hasSelection
            ? "Patient selected — ready to continue."
            : "Click a patient row to select them."}
        </p>
        <button
          type="button"
          className="pk-confirm-btn"
          onClick={onConfirmSelection}
          disabled={!hasSelection}
        >
          <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-8.707l-3-3a1 1 0 0 0-1.414 1.414L10 9.414l-1.293-1.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0 0-1.414z" clipRule="evenodd" />
          </svg>
          Continue to Lab Upload
        </button>
      </div>
    </section>
  );
}

LabPatientPickerPanel.propTypes = {
  patients: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired,
      description: PropTypes.string,
      contextParams: PropTypes.shape({
        enccode: PropTypes.string,
        fhud: PropTypes.string,
        docointkey: PropTypes.string,
      }),
    }),
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  selectedPatientId: PropTypes.string.isRequired,
  searchTerm: PropTypes.string.isRequired,
  pageIndex: PropTypes.number.isRequired,
  hasNextPage: PropTypes.bool.isRequired,
  hasPreviousPage: PropTypes.bool.isRequired,
  onSearchTermChange: PropTypes.func.isRequired,
  onSelectPatient: PropTypes.func.isRequired,
  onConfirmSelection: PropTypes.func.isRequired,
  onNextPage: PropTypes.func.isRequired,
  onPreviousPage: PropTypes.func.isRequired,
};

export default LabPatientPickerPanel;
