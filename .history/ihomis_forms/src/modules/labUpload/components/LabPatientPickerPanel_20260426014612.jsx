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
          Choose whose laboratory result you are uploading. Te selected IDs
          will be applied context loading and upload requests.
        </p>
      </div>

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

      {errorMessage ? (
        <div className="lab-picker-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {loading ? (
        <div className="lab-picker-loading">
          <span className="lab-picker-spinner" aria-hidden="true" />
          Fetching patients from API&hellip;
        </div>
      ) : patients.length ? (
        <>
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
                    <div className="lab-picker-item-primary">
                      <span className="lab-picker-item-name">
                        {patient.displayName}
                      </span>
                      <span className="lab-picker-item-id">{patient.id}</span>
                    </div>
                    {patient.description ? (
                      <span className="lab-picker-item-desc">
                        {patient.description}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          <div
            className="lab-picker-pagination"
            aria-label="Patient list pagination"
          >
            <button
              type="button"
              className="lab-pager-btn"
              onClick={onPreviousPage}
              disabled={!hasPreviousPage}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                width="13"
                height="13"
                fill="currentColor"
              >
                <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
              </svg>
              Previous
            </button>

            <span className="lab-pager-info" aria-live="polite">
              Page {pageIndex + 1}
              {hasNextPage ? " \u2022 more results" : " \u2022 last page"}
            </span>

            <button
              type="button"
              className="lab-pager-btn"
              onClick={onNextPage}
              disabled={!hasNextPage}
            >
              Next
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                width="13"
                height="13"
                fill="currentColor"
              >
                <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          </div>
        </>
      ) : (
        <div className="lab-picker-empty">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="36"
            height="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0z"
            />
          </svg>
          <p>No patients found.</p>
          <span>Try a different name or clear the search.</span>
        </div>
      )}

      <div className="lab-picker-actions">
        <button
          type="button"
          className="lab-picker-confirm"
          onClick={onConfirmSelection}
          disabled={!selectedPatientId}
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
