import PropTypes from "prop-types";
import { useMemo } from "react";
import { useFormValidation } from "./hooks/useFormValidation.js";
import {
  buildMissingByForm,
  buildScopedValidationSummary,
  getFieldLabel,
} from "./validationScope.js";
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

function ValidationPage({
  selectedPatient,
  enccode: enccodeOverride,
  selectedForms,
  onProceed,
  onBackToForms,
  onChangePatient,
}) {
  const { enccode, loading, error, summary, refresh, validationData } =
    useFormValidation({
      selectedPatient,
      enccode: enccodeOverride || undefined,
    });

  const scopedSummary = useMemo(
    () => buildScopedValidationSummary(summary, selectedForms),
    [summary, selectedForms],
  );

  const missingByForm = useMemo(
    () => buildMissingByForm(summary, selectedForms),
    [summary, selectedForms],
  );

  const patientLabel = useMemo(
    () => resolvePatientLabel(selectedPatient),
    [selectedPatient],
  );

  const patientInitials = useMemo(
    () => getPatientInitials(patientLabel.name),
    [patientLabel.name],
  );

  const resolvedEnccode =
    validationData?.details?.DEBUG_INFO?.resolvedEnccode || enccode;

  const statusTone = loading
    ? "loading"
    : scopedSummary.hasIssues
      ? "attention"
      : "ready";
  const statusLabel = loading
    ? "Loading"
    : scopedSummary.hasIssues
      ? "Needs attention"
      : "Ready";

  const handleProceedClick = () => {
    if (onProceed) {
      onProceed({
        canProceed: !scopedSummary.hasIssues,
        selectedForms,
      });
    }
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
        {/* Header Section */}
        <div className="validation-header">
          <div className="validation-header-content">
            <div className="validation-header-meta">
              <span className="validation-header-label">Patient Forms</span>
              <span
                className={`validation-header-status validation-header-status--${statusTone}`}
              >
                <span className="validation-header-status-dot" />
                {statusLabel}
              </span>
            </div>
            <h1 className="validation-header-title">
              Patient Form Verification
            </h1>
            <p className="validation-header-desc">
              Verify all required form fields are complete before proceeding to
              generate patient documents.
            </p>
          </div>

          {/* Patient Card */}
          <div className="validation-patient-card">
            <div className="validation-patient-avatar" aria-hidden="true">
              {patientInitials}
            </div>
            <div className="validation-patient-details">
              <span className="validation-patient-title">Selected Patient</span>
              <span className="validation-patient-name">
                {patientLabel.name}
              </span>
              <span className="validation-patient-id">
                HPER {patientLabel.hpercode || "N/A"}
              </span>
            </div>
            {onChangePatient ? (
              <button
                type="button"
                className="validation-patient-change"
                onClick={onChangePatient}
                title="Change patient"
              >
                ✎
              </button>
            ) : null}
          </div>
        </div>

        {/* Summary Cards Grid */}
        <section className="validation-summary">
          <SummaryCard
            label="Form Status"
            value={statusLabel}
            tone={statusTone === "ready" ? "default" : "alert"}
          />
          <SummaryCard
            label="Admission Form"
            value={
              scopedSummary.admissionComplete ? "✓ Complete" : "✗ Incomplete"
            }
            tone={scopedSummary.admissionComplete ? "default" : "alert"}
          />
          <SummaryCard
            label="Discharge Form"
            value={
              scopedSummary.dischargeComplete ? "✓ Complete" : "✗ Incomplete"
            }
            tone={scopedSummary.dischargeComplete ? "default" : "alert"}
          />
          <SummaryCard
            label="Missing Fields"
            value={scopedSummary.allMissing.length}
            tone={scopedSummary.allMissing.length > 0 ? "alert" : "default"}
          />
        </section>

        {/* Error Message */}
        {error ? (
          <div className="validation-message validation-message--error">
            <span className="validation-message-icon">⚠</span>
            <span className="validation-message-text">{error}</span>
          </div>
        ) : null}

        {/* Content Section */}
        {loading ? (
          <div className="validation-loading-container">
            <div className="validation-loading-spinner"></div>
            <p className="validation-loading-text">Validating form data...</p>
          </div>
        ) : scopedSummary.allMissing.length > 0 ? (
          <section className="validation-issues-panel">
            <div className="validation-issues-header">
              <h2 className="validation-issues-title">Missing Form Fields</h2>
              <span className="validation-issues-badge">
                {scopedSummary.allMissing.length}
              </span>
            </div>
            <div className="validation-step-list">
              {scopedSummary.allMissing.map((field) => (
                <span
                  key={field}
                  className="validation-pill validation-pill--missing"
                >
                  {getFieldLabel(field)}
                </span>
              ))}
            </div>
            <p className="validation-issues-note">
              Please complete all highlighted fields before proceeding to form
              generation.
            </p>
          </section>
        ) : (
          <div className="validation-complete-panel">
            <div className="validation-complete-icon">✓</div>
            <p className="validation-complete-text">
              All forms are complete and ready to proceed.
            </p>
          </div>
        )}

        {/* Missing By Form Section */}
        {missingByForm.length > 0 ? (
          <section className="validation-breakdown-panel">
            <h2 className="validation-breakdown-title">Missing Data by Form</h2>
            <div className="validation-form-list">
              {missingByForm.map((entry) => (
                <div key={entry.formName} className="validation-form-item">
                  <h3 className="validation-form-name">{entry.formName}</h3>
                  <div className="validation-step-list">
                    {entry.allMissing.map((field) => (
                      <span
                        key={`${entry.formName}-${field}`}
                        className="validation-pill validation-pill--missing"
                      >
                        {getFieldLabel(field)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Debug Info */}
        {resolvedEnccode ? (
          <div className="validation-debug-info">
            <small>Resolved ENCCODE: {resolvedEnccode}</small>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="validation-footer">
          <button
            type="button"
            className="validation-btn validation-btn--ghost"
            onClick={refresh}
            disabled={loading}
          >
            Refresh
          </button>
          {onBackToForms ? (
            <button
              type="button"
              className="validation-btn validation-btn--ghost"
              onClick={onBackToForms}
              disabled={loading}
            >
              Back to Forms
            </button>
          ) : null}
          <button
            type="button"
            className="validation-btn validation-btn--primary"
            onClick={handleProceedClick}
            disabled={!selectedPatient || loading || scopedSummary.hasIssues}
            title={
              scopedSummary.hasIssues
                ? "Complete missing data before proceeding"
                : "Proceed to form generation"
            }
          >
            Continue to Generate
          </button>
        </div>
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
  enccode: PropTypes.string,
  selectedForms: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  onProceed: PropTypes.func.isRequired,
  onBackToForms: PropTypes.func,
  onChangePatient: PropTypes.func,
};

export default ValidationPage;
