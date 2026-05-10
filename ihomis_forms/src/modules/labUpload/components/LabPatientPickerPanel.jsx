import PropTypes from "prop-types";
import EncounterSelectionModal from "./EncounterSelectionModal.jsx";

function getInitials(displayName) {
  const parts = (displayName || "?").trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

function getAvatarColor(id) {
  const colors = [
    "#1f9d95",
    "#3a8f7a",
    "#5b7fcb",
    "#8b5dcb",
    "#cb5b8f",
    "#cb8b5b",
    "#5bcb7a",
    "#7a8f3a",
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

PatientAvatar.propTypes = {
  displayName: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

function PatientCard({ patient, isSelected, onSelect }) {
  const { displayName, id, description, contextParams } = patient;
  const hpercode = contextParams?.hpercode || patient.rawData?.hpercode || "";

  const handleClick = () => {
    onSelect(patient);
  };

  return (
    <button
      type="button"
      className={`pk-card${isSelected ? " pk-card--selected" : ""}`}
      onClick={handleClick}
      aria-pressed={isSelected}
    >
      <PatientAvatar displayName={displayName} id={id} />

      <div className="pk-card-body">
        <div className="pk-card-primary">
          <div className="pk-card-name-wrap">
            <span className="pk-card-name">{displayName}</span>
            {hpercode && (
              <span className="pk-card-hper" title={`Patient ID: ${hpercode}`}>
                <svg
                  viewBox="0 0 20 20"
                  width="11"
                  height="11"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm1-8.414V7h-2v2.586l-1.293 1.293-.707-.707L10.707 6H10V4h4v4h-2v2.586l1.293 1.293.707-.707L12 6.414z" />
                </svg>
                <code>{hpercode}</code>
              </span>
            )}
          </div>
          {isSelected && (
            <span className="pk-card-badge" aria-label="Selected">
              <svg
                viewBox="0 0 16 16"
                width="10"
                height="10"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
              </svg>
            </span>
          )}
        </div>
        {description && <p className="pk-card-desc">{description}</p>}
      </div>
    </button>
  );
}

PatientCard.propTypes = {
  patient: PropTypes.shape({
    id: PropTypes.string.isRequired,
    idSource: PropTypes.string,
    displayName: PropTypes.string.isRequired,
    description: PropTypes.string,
    rawData: PropTypes.object,
    contextParams: PropTypes.shape({
      enc: PropTypes.string,
      enccode: PropTypes.string,
      fhud: PropTypes.string,
      hpercode: PropTypes.string,
      docointkey: PropTypes.string,
      user: PropTypes.string,
    }),
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

function PaginationBar({
  pageIndex,
  hasNextPage,
  hasPreviousPage,
  onNext,
  onPrev,
}) {
  return (
    <div
      className="pk-pagination"
      role="navigation"
      aria-label="Patient list pagination"
    >
      <button
        type="button"
        className="pk-page-btn"
        onClick={onPrev}
        disabled={!hasPreviousPage}
        aria-label="Previous page"
      >
        <svg
          viewBox="0 0 16 16"
          width="13"
          height="13"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
        </svg>
        Prev
      </button>

      <div className="pk-page-indicator" aria-live="polite">
        <span className="pk-page-num">Page {pageIndex + 1}</span>
        <span className="pk-page-tip">
          {hasNextPage ? "more results below" : "last page"}
        </span>
      </div>

      <button
        type="button"
        className="pk-page-btn"
        onClick={onNext}
        disabled={!hasNextPage}
        aria-label="Next page"
      >
        Next
        <svg
          viewBox="0 0 16 16"
          width="13"
          height="13"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
        </svg>
      </button>
    </div>
  );
}

PaginationBar.propTypes = {
  pageIndex: PropTypes.number.isRequired,
  hasNextPage: PropTypes.bool.isRequired,
  hasPreviousPage: PropTypes.bool.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
};

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
  onNextPage,
  onPreviousPage,
  showEncounterModal = false,
  patientForEncounterSelection = null,
  encounters = [],
  selectedEncounter = null,
  encountersLoading = false,
  encountersError = "",
  onCloseEncounterModal,
  onSelectEncounter,
  onConfirmEncounter,
  onRetryEncounters,
}) {
  return (
    <>
      <section className="lab-panel pk-panel" aria-label="Patient selection">
        {/* Search */}
        <div className="pk-search-wrap">
          <label htmlFor="patientSearch" className="pk-search-label">
            <svg
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
            </svg>
            Find Patient Record
          </label>
          <div className="pk-search-box">
            <input
              id="patientSearch"
              type="search"
              className="pk-search-input"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              placeholder="Search by name, hospital number, or encounter code..."
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
                <svg
                  viewBox="0 0 16 16"
                  width="12"
                  height="12"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {errorMessage ? (
          <div className="pk-alert pk-alert--error" role="alert">
            <svg
              viewBox="0 0 20 20"
              width="16"
              height="16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-1 1v4a1 1 0 0 0 .293.707l2.828 2.829a1 1 0 1 0 1.414-1.415L11 9.586V5a1 1 0 0 0-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errorMessage}
          </div>
        ) : null}

        {/* Loading skeleton */}
        {loading ? (
          <div
            className="pk-list pk-list--loading"
            aria-busy="true"
            aria-label="Loading patients"
          >
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
            <svg
              viewBox="0 0 24 24"
              width="40"
              height="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <p className="pk-empty-title">No patients found</p>
            <p className="pk-empty-sub">
              {searchTerm
                ? `No results for "${searchTerm}". Try a different term.`
                : "No patient records are available for the current filters."}
            </p>
            {searchTerm && (
              <button
                type="button"
                className="pk-empty-clear"
              onClick={() => onSearchTermChange("")}
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Footer — hint only */}
        <div className="pk-footer">
          <p className="pk-footer-hint">
            {selectedPatientId
              ? "Patient selected \u2014 ready to continue."
              : searchTerm
                ? "Click a patient row to select them."
                : "Select a patient from the list above."}
          </p>
        </div>
      </section>

      {/* Encounter Selection Modal */}
      <EncounterSelectionModal
        isOpen={showEncounterModal}
        patient={patientForEncounterSelection}
        encounters={encounters}
        selectedEncounter={selectedEncounter}
        loading={encountersLoading}
        error={encountersError}
        onSelectEncounter={onSelectEncounter}
        onClose={onCloseEncounterModal}
        onConfirm={onConfirmEncounter}
        onRetry={onRetryEncounters}
      />
    </>
  );
}

LabPatientPickerPanel.propTypes = {
  patients: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      idSource: PropTypes.string,
      displayName: PropTypes.string.isRequired,
      description: PropTypes.string,
      rawData: PropTypes.object,
      contextParams: PropTypes.shape({
        enc: PropTypes.string,
        enccode: PropTypes.string,
        fhud: PropTypes.string,
        hpercode: PropTypes.string,
        docointkey: PropTypes.string,
        user: PropTypes.string,
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
  onNextPage: PropTypes.func.isRequired,
  onPreviousPage: PropTypes.func.isRequired,
  showEncounterModal: PropTypes.bool,
  patientForEncounterSelection: PropTypes.object,
  encounters: PropTypes.array,
  selectedEncounter: PropTypes.object,
  encountersLoading: PropTypes.bool,
  encountersError: PropTypes.string,
  onCloseEncounterModal: PropTypes.func,
  onSelectEncounter: PropTypes.func,
  onConfirmEncounter: PropTypes.func,
  onRetryEncounters: PropTypes.func,
};

export default LabPatientPickerPanel;
