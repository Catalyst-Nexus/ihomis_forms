import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { useFormValidation } from "./hooks/useFormValidation.js";
import { ValidationModal } from "./components/ValidationModal.jsx";
import "./Validation.css";

function SummaryCard({ label, value, tone = "default" }) {
  const className =
    tone === "alert"
      ? "validation-card validation-card--alert"
      : "validation-card";

  return (
    <div className={className}>
      <span className="validation-card-label">{label}</span>
      <span className="validation-card-value">{value}</span>
    </div>
  );
}

SummaryCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  tone: PropTypes.string,
};

function resolvePatientLabel(selectedPatient) {
  const raw = selectedPatient?.rawData || {};
  const name =
    selectedPatient?.displayName ||
    raw.patient_name ||
    raw.patientName ||
    raw.patient ||
    "Selected patient";
  const hpercode =
    raw.hpercode ||
    selectedPatient?.contextParams?.hpercode ||
    (selectedPatient?.idSource === "hpercode" ? selectedPatient.id : "") ||
    selectedPatient?.id ||
    "";

  return {
    name,
    hpercode,
  };
}

function getPatientInitials(label) {
  const parts = String(label || "?")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function ValidationPage({ selectedPatient, onProceed, onChangePatient }) {
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [proceedAction, setProceedAction] = useState(null);

  const { enccode, loading, error, summary, refresh } = useFormValidation({
    selectedPatient,
  });

  const patientLabel = useMemo(
    () => resolvePatientLabel(selectedPatient),
    [selectedPatient],
  );

  const patientInitials = useMemo(
    () => getPatientInitials(patientLabel.name),
    [patientLabel.name],
  );

  const statusTone = loading
    ? "loading"
    : summary.hasIssues
      ? "attention"
      : "ready";
  const statusLabel = loading
    ? "Loading"
    : summary.hasIssues
      ? "Needs attention"
      : "Ready";

  const handleProceedClick = () => {
    // Show validation modal before proceeding
    setProceedAction(onProceed);
    setShowValidationModal(true);
  };

  const handleModalProceed = () => {
    setShowValidationModal(false);
    if (proceedAction) {
      proceedAction();
    }
    setProceedAction(null);
  };

  const handleModalClose = () => {
    setShowValidationModal(false);
    setProceedAction(null);
  };

  return (
    <div className="validation-page">
      <div
        className="validation-ambient validation-ambient-a"
        aria-hidden="true"
      />
      <div
        className="validation-ambient validation-ambient-b"
        aria-hidden="true"
      />
      <main className="validation-layout">
        <section className="validation-hero-wrap">
          <div className="validation-hero">
            <div className="validation-hero-left">
              <div className="validation-hero-eyebrow">
                <span className="validation-hero-system">Forms validation</span>
                <span
                  className={`validation-hero-status validation-hero-status--${statusTone}`}
                >
                  <span className="validation-hero-status-dot" />
                  {statusLabel}
                </span>
              </div>
              <h1 className="validation-hero-title">
                CHART Tracking checklist
              </h1>
              <p className="validation-hero-sub">
                Review missing form fields before generating patient forms.
              </p>
              <div className="validation-hero-meta">
                <span>Validation endpoint: /api/validation</span>
                {enccode && enccode !== patientLabel.hpercode ? (
                  <span>Resolved ENCCODE: {enccode}</span>
                ) : null}
              </div>
            </div>

            <div className="validation-hero-right">
              <div className="validation-hero-patient">
                <div className="validation-hero-avatar" aria-hidden="true">
                  {patientInitials}
                </div>
                <div className="validation-hero-patient-info">
                  <span className="validation-hero-patient-label">
                    Selected Patient
                  </span>
                  <span className="validation-hero-patient-name">
                    {patientLabel.name}
                  </span>
                  <span className="validation-hero-patient-meta">
                    HPER {patientLabel.hpercode || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="validation-actions">
            <button
              type="button"
              className="validation-btn validation-btn--ghost"
              onClick={refresh}
              disabled={loading}
            >
              Refresh
            </button>
            {onChangePatient ? (
              <button
                type="button"
                className="validation-btn validation-btn--ghost"
                onClick={onChangePatient}
              >
                Change patient
              </button>
            ) : null}
            <button
              type="button"
              className="validation-btn validation-btn--primary"
              onClick={handleProceedClick}
              disabled={!selectedPatient || loading}
            >
              Proceed to Forms
            </button>
          </div>
        </section>

        <section className="validation-summary">
          <SummaryCard label="Form Status" value={statusLabel} tone={statusTone === "ready" ? "default" : "alert"} />
          <SummaryCard 
            label="Admission Form" 
            value={summary.admissionComplete ? "✓ Complete" : "✗ Incomplete"}
            tone={summary.admissionComplete ? "default" : "alert"}
          />
          <SummaryCard 
            label="Discharge Form" 
            value={summary.dischargeComplete ? "✓ Complete" : "✗ Incomplete"}
            tone={summary.dischargeComplete ? "default" : "alert"}
          />
          <SummaryCard 
            label="Missing Fields" 
            value={summary.allMissing.length} 
            tone={summary.allMissing.length > 0 ? "alert" : "default"}
          />
        </section>

        {error ? (
          <div className="validation-message validation-message--error">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="validation-loading">
            Loading form validation status...
          </div>
        ) : summary.allMissing.length > 0 ? (
          <section className="validation-panel">
            <h2 className="validation-panel-title">Missing form fields</h2>
            <div className="validation-step-list">
              {summary.allMissing.map((field) => (
                <span
                  key={field}
                  className="validation-pill validation-pill--missing"
                >
                  {field}
                </span>
              ))}
            </div>
            <p className="validation-helper-text">
              Complete all missing fields in the forms before proceeding.
            </p>
          </section>
        ) : (
          <div className="validation-empty">
            ✓ All forms are complete and ready to proceed.
          </div>
        )}
        {/* Validation Modal */}
        <ValidationModal
          isOpen={showValidationModal}
          enccode={enccode}
          admissionMissing={summary.admissionMissing}
          dischargeMissing={summary.dischargeMissing}
          admissionComplete={summary.admissionComplete}
          dischargeComplete={summary.dischargeComplete}
          onClose={handleModalClose}
          onProceed={handleModalProceed}
        />
      </main>
    </div>
  );
}

ValidationPage.propTypes = {
  selectedPatient: PropTypes.shape({
    id: PropTypes.string,
    idSource: PropTypes.string,
    displayName: PropTypes.string,
    rawData: PropTypes.object,
    contextParams: PropTypes.object,
  }),
  onProceed: PropTypes.func.isRequired,
  onChangePatient: PropTypes.func,
};

export default ValidationPage;
