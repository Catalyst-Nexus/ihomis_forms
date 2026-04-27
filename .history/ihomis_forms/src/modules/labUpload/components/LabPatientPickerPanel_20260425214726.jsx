import PropTypes from "prop-types";
import { useMemo, useState } from "react";

function LabPatientPickerPanel({
  patients,
  loading,
  errorMessage,
  selectedPatientId,
  onSelectPatient,
  onConfirmSelection,
  onContinueWithoutSelection,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredPatients = useMemo(() => {
    if (!normalizedSearchTerm) {
      return patients;
    }

    return patients.filter((patient) => {
      const haystack = [
        patient.displayName,
        patient.description,
        patient.contextParams?.enccode,
        patient.contextParams?.fhud,
        patient.contextParams?.docointkey,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearchTerm);
    });
  }, [normalizedSearchTerm, patients]);

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
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Type enccode, fhud, docointkey, or patient name"
          disabled={loading || !patients.length}
        />
      </label>

      {loading ? (
        <div className="lab-picker-loading">Fetching patients from API...</div>
      ) : filteredPatients.length ? (
        <ul className="lab-picker-list">
          {filteredPatients.map((patient) => {
            const isSelected = selectedPatientId === patient.id;

            return (
              <li key={patient.id}>
                <button
                  type="button"
                  className={`lab-picker-item ${isSelected ? "active" : ""}`}
                  onClick={() => onSelectPatient(patient.id)}
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
        <button
          type="button"
          className="lab-review-action"
          onClick={onContinueWithoutSelection}
          disabled={loading}
        >
          Continue Without Selecting
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
  onSelectPatient: PropTypes.func.isRequired,
  onConfirmSelection: PropTypes.func.isRequired,
  onContinueWithoutSelection: PropTypes.func.isRequired,
};

export default LabPatientPickerPanel;
