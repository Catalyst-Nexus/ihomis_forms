import PropTypes from "prop-types";

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
  return (
    <section className="lab-panel lab-picker" aria-label="Patient selection">
      <div className="lab-picker-header">
        <h2>Select Patient Before Upload</h2>
        <p>
          Choose whose laboratory result you are uploading. The selected IDs
          will be applied to context loading and upload requests.
        </p>
      </div>

      {errorMessage ? (
        <p className="lab-status lab-status-warning" role="status">
          {errorMessage}
        </p>
      ) : null}

      <label htmlFor="patientSearch" className="lab-field lab-picker-search">
        Search by Name, Encounter, Facility, or Document Key
        <input
          id="patientSearch"
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder="Type enccode, fhud, docointkey, or patient name"
        />
      </label>

      <div className="lab-picker-pagination" aria-label="Patient list pagination">
        <button
          type="button"
          className="lab-review-action"
          onClick={onPreviousPage}
          disabled={loading || !hasPreviousPage}
        >
          Previous
        </button>
        <span className="lab-picker-page-indicator">Page {pageIndex + 1}</span>
        <button
          type="button"
          className="lab-review-action"
          onClick={onNextPage}
          disabled={loading || !hasNextPage}
        >
          Next
        </button>
      </div>

      {loading ? (
        <div className="lab-picker-loading">Fetching patients from API...</div>
      ) : patients.length ? (
        <ul className="lab-picker-list">
          {patients.map((patient) => {
            const isSelected = selectedPatientId === patient.id;

            return (
              <li key={patient.id}>
                <button
                  type="button"
                  className={`lab-picker-item ${isSelected ? "active" : ""}`}
                  onClick={() => onSelectPatient(patient)}
                >
                  <strong>{patient.displayName}</strong>
                  <span>{patient.description || "No additional details"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="lab-empty-preview">
          No patient records found for the current filters.
        </div>
      )}

      <div className="lab-picker-actions">
        <button
          type="button"
          className="lab-picker-confirm"
          onClick={onConfirmSelection}
          disabled={loading || !selectedPatientId}
        >
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
