import PropTypes from "prop-types";
import { X, AlertCircle, CheckCircle, Clock } from "lucide-react";
import "./ValidationModal.css";

/**
 * Converts validation field names to human-readable labels
 */
function formatFieldName(field) {
  return field
    .split(/(?=[A-Z])|_/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Maps field names to form section names for better UX
 */
function getFieldSection(field) {
  const fieldToSection = {
    vitalSigns: "Vital Signs",
    bmi: "BMI",
    historyGDPPR: "General Data",
    historyCOMPL: "Chief Complaint",
    historyPRHIS: "Present Illness History",
    historyPAHIS: "Past Medical History",
    historyOCENV: "Occupation/Environment",
    historyFAHIS: "Family History",
    historyDRTHE: "Drug Therapy",
    historyALCOH: "Alcohol History",
    historyTOBAC: "Tobacco History",
    historyDRUGA: "Drug Allergies",
    historyOTHAL: "Other Allergies",
    historyOB: "OB History",
    prenatal: "Prenatal Data",
    pertinentSignSymptoms: "Signs & Symptoms",
    physicalExam: "Physical Examination",
    systemReview: "System Review",
    courseWard: "Course in Ward",
    dischargeOrder: "Discharge Order",
    finalDiagnosis: "Final Diagnosis",
    icdCode: "ICD Code",
  };

  return fieldToSection[field] || formatFieldName(field);
}

export function ValidationModal({
  isOpen,
  enccode,
  admissionMissing = [],
  dischargeMissing = [],
  admissionComplete = false,
  dischargeComplete = false,
  missingByForm = [],
  onClose,
  onProceed,
}) {
  if (!isOpen) return null;

  const allMissing = [...admissionMissing, ...dischargeMissing];
  const canProceed = admissionComplete && dischargeComplete;

  return (
    <div className="validation-modal-overlay">
      <div className="validation-modal">
        <header className="validation-modal__header">
          <div className="validation-modal__title">
            <AlertCircle size={24} className="validation-modal__icon" />
            <h2>Form Validation Status</h2>
          </div>
          <button
            className="validation-modal__close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </header>

        <div className="validation-modal__body">
          <div className="validation-modal__encounter">
            <p className="validation-modal__encounter-code">
              Encounter: <strong>{enccode || "N/A"}</strong>
            </p>
          </div>

          {/* Admission Section */}
          <section className="validation-modal__section">
            <div className="validation-modal__section-header">
              <div className="validation-modal__section-title">
                <span>Admission Form</span>
                {admissionComplete ? (
                  <span className="validation-modal__status validation-modal__status--complete">
                    <CheckCircle size={16} /> Complete
                  </span>
                ) : (
                  <span className="validation-modal__status validation-modal__status--incomplete">
                    <Clock size={16} /> Incomplete
                  </span>
                )}
              </div>
            </div>

            {admissionMissing.length > 0 ? (
              <div className="validation-modal__missing-fields">
                <p className="validation-modal__missing-label">
                  Missing fields ({admissionMissing.length}):
                </p>
                <ul className="validation-modal__field-list">
                  {admissionMissing.map((field) => (
                    <li key={field} className="validation-modal__field-item">
                      <span className="validation-modal__field-icon">•</span>
                      {getFieldSection(field)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="validation-modal__complete-message">
                ✓ All admission fields are complete
              </div>
            )}
          </section>

          {/* Discharge Section */}
          <section className="validation-modal__section">
            <div className="validation-modal__section-header">
              <div className="validation-modal__section-title">
                <span>Discharge Form</span>
                {dischargeComplete ? (
                  <span className="validation-modal__status validation-modal__status--complete">
                    <CheckCircle size={16} /> Complete
                  </span>
                ) : (
                  <span className="validation-modal__status validation-modal__status--incomplete">
                    <Clock size={16} /> Incomplete
                  </span>
                )}
              </div>
            </div>

            {dischargeMissing.length > 0 ? (
              <div className="validation-modal__missing-fields">
                <p className="validation-modal__missing-label">
                  Missing fields ({dischargeMissing.length}):
                </p>
                <ul className="validation-modal__field-list">
                  {dischargeMissing.map((field) => (
                    <li key={field} className="validation-modal__field-item">
                      <span className="validation-modal__field-icon">•</span>
                      {getFieldSection(field)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="validation-modal__complete-message">
                ✓ All discharge fields are complete
              </div>
            )}
          </section>

          {missingByForm.length > 0 && (
            <section className="validation-modal__section">
              <div className="validation-modal__section-header">
                <div className="validation-modal__section-title">
                  <span>Selected Forms With Missing Data</span>
                </div>
              </div>
              <div className="validation-modal__missing-fields">
                {missingByForm.map((entry) => (
                  <div key={entry.formName} className="validation-modal__field-item">
                    <div>
                      <strong>{entry.formName}</strong>
                    </div>
                    <ul className="validation-modal__field-list">
                      {entry.allMissing.map((field) => (
                        <li key={`${entry.formName}-${field}`}>
                          <span className="validation-modal__field-icon">•</span>
                          {getFieldSection(field)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {allMissing.length > 0 && (
            <div className="validation-modal__warning">
              <AlertCircle size={18} />
              <p>
                Please complete all missing fields before proceeding. Missing
                fields are blocking form completion.
              </p>
            </div>
          )}
        </div>

        <footer className="validation-modal__footer">
          <button className="validation-modal__btn validation-modal__btn--secondary" onClick={onClose}>
            Close
          </button>
          <button
            className={`validation-modal__btn validation-modal__btn--primary ${
              !canProceed ? "validation-modal__btn--disabled" : ""
            }`}
            onClick={onProceed}
            disabled={!canProceed}
            title={
              !canProceed
                ? "Complete all missing fields before proceeding"
                : "Proceed with form submission"
            }
          >
            {canProceed ? "Proceed" : "Cannot Proceed"}
          </button>
        </footer>
      </div>
    </div>
  );
}

ValidationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  enccode: PropTypes.string,
  admissionMissing: PropTypes.arrayOf(PropTypes.string),
  dischargeMissing: PropTypes.arrayOf(PropTypes.string),
  admissionComplete: PropTypes.bool,
  dischargeComplete: PropTypes.bool,
  missingByForm: PropTypes.arrayOf(
    PropTypes.shape({
      formName: PropTypes.string,
      admissionMissing: PropTypes.arrayOf(PropTypes.string),
      dischargeMissing: PropTypes.arrayOf(PropTypes.string),
      allMissing: PropTypes.arrayOf(PropTypes.string),
    }),
  ),
  onClose: PropTypes.func.isRequired,
  onProceed: PropTypes.func.isRequired,
};
