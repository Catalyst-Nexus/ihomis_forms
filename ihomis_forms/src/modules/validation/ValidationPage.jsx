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
                {resolvedEnccode ? (
                  <span>Resolved ENCCODE: {resolvedEnccode}</span>
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
              Continue to Generate
            </button>
          </div>
        </section>

        <section className="validation-summary">
          <SummaryCard label="Form Status" value={statusLabel} tone={statusTone === "ready" ? "default" : "alert"} />
          <SummaryCard
            label="Selected Forms"
            value={validationStats.totalForms}
            tone={validationStats.totalForms > 0 ? "default" : "alert"}
          />
          <SummaryCard
            label="Ready Forms"
            value={validationStats.readyForms}
            tone={validationStats.readyForms === validationStats.totalForms ? "default" : "alert"}
          />
          <SummaryCard
            label="Blocking Checks"
            value={validationStats.blockingChecks}
            tone={validationStats.blockingChecks > 0 ? "alert" : "default"}
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
        ) : validationBreakdown.length > 0 ? (
          <section className="validation-panel">
            <h2 className="validation-panel-title">Validation by selected form</h2>
            <p className="validation-helper-text">
              The page uses the backend encounter validation checks and shows the exact requirements for each selected form.
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
                      <p className="validation-helper-text">{entry.label}</p>
                    </div>
                    <span className={`validation-badge ${entry.hasIssues ? "validation-badge--unknown" : "validation-badge--adm"}`}>
                      {entry.hasIssues ? "Needs attention" : "Validated"}
                    </span>
                  </div>

                  <div className="validation-step-list">
                    {entry.checks.map((check) => (
                      <div
                        key={check.id}
                        className={`validation-check-row ${check.passed ? "validation-check-row--pass" : "validation-check-row--fail"}`}
                      >
                        <div className="validation-check-row__title">{check.label}</div>
                        <div className="validation-check-row__message">
                          {check.passed ? "Backend validation passed." : check.message}
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
            ✓ All forms are complete and ready to proceed.
          </div>
        )}

        {validationBreakdown.length > 0 ? (
          <section className="validation-panel">
            <h2 className="validation-panel-title">Validation requirement legend</h2>
            <div className="validation-step-list">
              {validationBreakdown.flatMap((entry) => entry.checks).map((check) => (
                <span key={`${check.id}-${check.label}`} className="validation-pill validation-pill--missing">
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
