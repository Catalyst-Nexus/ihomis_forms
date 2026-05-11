import PropTypes from "prop-types";
import { useMemo } from "react";
import { useFormValidation } from "./hooks/useFormValidation.js";
import {
  buildFormValidationBreakdown,
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

function ValidationPage({ selectedPatient, enccode: enccodeOverride, selectedForms, onProceed, onBackToForms, onChangePatient }) {
  const { enccode, loading, error, refresh, validationData } = useFormValidation({
    selectedPatient,
    enccode: enccodeOverride || undefined,
  });

  const scopedSummary = useMemo(
    () => buildScopedValidationSummary(validationData, selectedForms),
    [validationData, selectedForms],
  );

  const validationBreakdown = useMemo(
    () => buildFormValidationBreakdown(validationData, selectedForms),
    [validationData, selectedForms],
  );

  const validationStats = useMemo(() => {
    const totalForms = validationBreakdown.length;
    const blockedForms = validationBreakdown.filter((entry) => entry.hasIssues).length;
    const readyForms = totalForms - blockedForms;
    const blockingChecks = validationBreakdown.reduce(
      (count, entry) => count + entry.missingChecks.length,
      0,
    );

    return {
      totalForms,
      blockedForms,
      readyForms,
      blockingChecks,
    };
  }, [validationBreakdown]);

  const legendChecks = useMemo(() => {
    const seen = new Set();
    return validationBreakdown
      .flatMap((entry) => entry.checks)
      .filter((check) => {
        if (seen.has(check.id)) return false;
        seen.add(check.id);
        return true;
      });
  }, [validationBreakdown]);

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
    ? "Checking"
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
                Patient Record Verification
              </h1>
              <p className="validation-hero-sub">
                Review incomplete form sections before generating the selected forms.
              </p>
              <div className="validation-hero-meta">
                <span>Source: Validation API</span>
                {resolvedEnccode ? (
                  <span>Encounter: {resolvedEnccode}</span>
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
                    Patient ID: {patientLabel.hpercode || "N/A"}
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
                  : "Proceed to forms"
              }
            >
              Continue
            </button>
          </div>
        </section>

        <section className="validation-summary">
          <SummaryCard label="Overall Status" value={statusLabel} tone={statusTone === "ready" ? "default" : "alert"} />
          <SummaryCard
            label="Forms Selected"
            value={validationStats.totalForms}
            tone={validationStats.totalForms > 0 ? "default" : "alert"}
          />
          <SummaryCard
            label="Forms Ready"
            value={validationStats.readyForms}
            tone={validationStats.readyForms === validationStats.totalForms ? "default" : "alert"}
          />
          <SummaryCard
            label="Items to Review"
            value={validationStats.blockingChecks}
            tone={validationStats.blockingChecks > 0 ? "alert" : "default"}
          />
        </section>

        {error ? (
          <div className="validation-message validation-message--error">
            Validation service issue: {error}
          </div>
        ) : null}

        {loading ? (
          <div className="validation-loading">
            Checking validation status...
          </div>
        ) : validationBreakdown.length > 0 ? (
          <section className="validation-panel">
            <h2 className="validation-panel-title">Validation Results by Selected Form</h2>
            <p className="validation-helper-text">
              Each row below shows what is complete and what still needs to be filled in.
            </p>
            <div className="validation-form-grid">
              {validationBreakdown.map((entry) => (
                <article
                  key={entry.formName}
                  className={`validation-form-card ${entry.hasIssues ? "validation-form-card--alert" : ""}`}
                >
                  <div className="validation-form-card__header">
                    <div>
                      <h3 className="validation-section-label">{entry.formName}</h3>
                      <p className="validation-helper-text">Rule set: {entry.label}</p>
                    </div>
                    <span className={`validation-badge ${entry.hasIssues ? "validation-badge--alert" : "validation-badge--success"}`}>
                      <span className="validation-badge-icon">{entry.hasIssues ? "⚠" : "✓"}</span>
                      {entry.hasIssues ? "Action needed" : "Ready"}
                    </span>
                  </div>

                  <div className="validation-step-list">
                    {entry.checks.map((check) => (
                      <div
                        key={check.id}
                        className={`validation-check-row ${check.passed ? "validation-check-row--pass" : "validation-check-row--fail"}`}
                      >
                        <div className="validation-check-row__icon" aria-hidden="true">
                          {check.passed ? "✓" : "●"}
                        </div>
                        <div className="validation-check-row__content">
                          <div className="validation-check-row__title-wrap">
                            <div className="validation-check-row__title">{check.label}</div>
                            <span
                              className={`validation-check-status ${check.passed ? "validation-check-status--pass" : "validation-check-status--fail"}`}
                            >
                              {check.passed ? "Complete" : "Missing"}
                            </span>
                          </div>
                          <div className="validation-check-row__message">
                            {check.passed ? "This requirement is complete." : check.message}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <div className="validation-empty">
            All selected forms are complete and ready to proceed.
          </div>
        )}

        {validationBreakdown.length > 0 ? (
          <section className="validation-panel">
            <h2 className="validation-panel-title">Checklist Coverage</h2>
            <p className="validation-helper-text">
              These are the checks used to evaluate your selected forms.
            </p>
            <div className="validation-step-list">
              {legendChecks.map((check) => (
                <span key={`${check.id}-${check.label}`} className="validation-pill">
                  {getFieldLabel(check.id)}
                </span>
              ))}
            </div>
          </section>
        ) : null}
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
  selectedForms: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  onProceed: PropTypes.func.isRequired,
  onBackToForms: PropTypes.func,
  onChangePatient: PropTypes.func,
};

export default ValidationPage;
