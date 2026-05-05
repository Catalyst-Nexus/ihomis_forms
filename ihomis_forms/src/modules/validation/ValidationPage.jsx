import PropTypes from "prop-types";
import { useMemo } from "react";
import { useChartValidation } from "./hooks/useChartValidation.js";
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

function EncounterCard({ encounter }) {
  const badgeClass = encounter.encounterType
    ? `validation-badge validation-badge--${encounter.encounterType.toLowerCase()}`
    : "validation-badge validation-badge--unknown";

  return (
    <article className="validation-encounter-card">
      <header className="validation-encounter-header">
        <div>
          <span className={badgeClass}>
            {encounter.encounterType || "Unknown"}
          </span>
          <div className="validation-encounter-meta">
            <span>Encounter {encounter.enccode || "N/A"}</span>
            <span>Hospital No. {encounter.hospitalNo || "N/A"}</span>
            <span>Admitted {encounter.admittedDate || "N/A"}</span>
            <span>Discharged {encounter.dischargedDate || "Not recorded"}</span>
          </div>
        </div>
        <div className="validation-pill validation-pill--complete">
          {encounter.completedSteps.length}/{encounter.totalSteps} steps done
        </div>
      </header>

      <div>
        <p className="validation-section-label">Missing steps</p>
        <div className="validation-step-list">
          {encounter.missingSteps.length ? (
            encounter.missingSteps.map((step) => (
              <span
                key={step.id}
                className="validation-pill validation-pill--missing"
              >
                {step.label}
              </span>
            ))
          ) : (
            <span className="validation-pill validation-pill--complete">
              All chart steps completed
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

EncounterCard.propTypes = {
  encounter: PropTypes.shape({
    key: PropTypes.string.isRequired,
    enccode: PropTypes.string,
    encounterType: PropTypes.string,
    hospitalNo: PropTypes.string,
    admittedDate: PropTypes.string,
    dischargedDate: PropTypes.string,
    missingSteps: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.any,
        label: PropTypes.string,
      }),
    ).isRequired,
    completedSteps: PropTypes.array.isRequired,
    totalSteps: PropTypes.number.isRequired,
  }).isRequired,
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
  const { encounters, loading, error, summary, refresh, patientHpercode } =
    useChartValidation({ selectedPatient });

  const patientLabel = useMemo(
    () => resolvePatientLabel(selectedPatient),
    [selectedPatient],
  );

  const hasEncounters = encounters.length > 0;
  const missingTone = summary.missingSteps > 0 ? "alert" : "default";
  const patientInitials = useMemo(
    () => getPatientInitials(patientLabel.name),
    [patientLabel.name],
  );
  const statusTone = loading
    ? "loading"
    : summary.missingSteps > 0
      ? "attention"
      : "ready";
  const statusLabel = loading
    ? "Loading"
    : summary.missingSteps > 0
      ? "Needs attention"
      : "Ready";
  const missingStepSummary = useMemo(() => {
    const uniqueSteps = new Map();

    encounters.forEach((encounter) => {
      encounter.missingSteps.forEach((step) => {
        if (!uniqueSteps.has(step.id)) {
          uniqueSteps.set(step.id, step.label);
        }
      });
    });

    return Array.from(uniqueSteps.values());
  }, [encounters]);

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
                Review missing chart steps before generating patient forms.
              </p>
              <div className="validation-hero-meta">
                <span>Tracking records: {summary.encounters}</span>
                {patientHpercode &&
                patientHpercode !== patientLabel.hpercode ? (
                  <span>Resolved HPER: {patientHpercode}</span>
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
              onClick={onProceed}
              disabled={!selectedPatient}
            >
              Proceed to Forms
            </button>
          </div>
        </section>

        <section className="validation-summary">
          <SummaryCard label="Encounters" value={summary.encounters} />
          <SummaryCard label="Total steps" value={summary.totalSteps} />
          <SummaryCard
            label="Missing steps"
            value={summary.missingSteps}
            tone={missingTone}
          />
          <SummaryCard label="Completed" value={summary.completedSteps} />
        </section>

        <section className="validation-panel">
          <h2 className="validation-panel-title">Missing steps overview</h2>
          <div className="validation-step-list">
            {missingStepSummary.length ? (
              missingStepSummary.map((stepLabel) => (
                <span
                  key={stepLabel}
                  className="validation-pill validation-pill--missing"
                >
                  {stepLabel}
                </span>
              ))
            ) : (
              <span className="validation-pill validation-pill--complete">
                No missing steps detected
              </span>
            )}
          </div>
        </section>

        {error ? (
          <div className="validation-message validation-message--error">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="validation-loading">
            Loading chart tracking status...
          </div>
        ) : hasEncounters ? (
          <section className="validation-encounters">
            {encounters.map((encounter) => (
              <EncounterCard key={encounter.key} encounter={encounter} />
            ))}
          </section>
        ) : (
          <div className="validation-empty">
            No CHART tracking records were found for this patient.
          </div>
        )}
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
