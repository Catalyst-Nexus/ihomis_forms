import PropTypes from "prop-types";
import { useMemo, useState, useEffect} from "react";
import { useFormValidation } from "./hooks/useFormValidation.js";
import { buildFallbackForms } from "../forms/formCatalog.js";
import {
  buildValidationResults,
  fetchFormValidations,
  runEncounterValidations,
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
  const [formId, setFormId] = useState(null);
  const [formsLoading, setFormsLoading] = useState(false);
  const fallbackForms = useMemo(() => buildFallbackForms(), []);

  // Resolve form ID by looking up the form name in the hospital_forms table
  useEffect(() => {
    const resolveFormId = async () => {
      if (!selectedForms || selectedForms.length === 0) {
        setFormId(null);
        return;
      }

      try {
        setFormsLoading(true);
        const response = await fetch("/api/validation/forms");
        const data = await response.json();

        const loadedForms = data.ok && Array.isArray(data.forms) && data.forms.length > 0
          ? data.forms
          : fallbackForms;

        // Get the first selected form name
        const selectedFormName = Array.isArray(selectedForms)
          ? selectedForms[0]
          : selectedForms?.description || selectedForms?.name;

        if (!selectedFormName) {
          setFormId(null);
          return;
        }

        // Find the matching form by description or component_name
        const matchedForm = loadedForms.find(
          (form) =>
            form.description === selectedFormName ||
            form.component_name === selectedFormName ||
            form.description?.includes(selectedFormName),
        );

        setFormId(matchedForm?.id || null);
      } catch (error) {
        console.error("Error resolving form ID:", error);
        const selectedFormName = Array.isArray(selectedForms)
          ? selectedForms[0]
          : selectedForms?.description || selectedForms?.name;

        const matchedFallback = fallbackForms.find(
          (form) =>
            form.description === selectedFormName ||
            form.component_name === selectedFormName ||
            form.description?.includes(selectedFormName),
        );

        setFormId(matchedFallback?.id || null);
      } finally {
        setFormsLoading(false);
      }
    };

    resolveFormId();
  }, [fallbackForms, selectedForms]);

  const { enccode, loading, error, refresh, validationData } = useFormValidation({
    selectedPatient,
    enccode: enccodeOverride || undefined,
    formId,
  });

  const [serverValidations, setServerValidations] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function loadServerValidations() {
      if (!formId) {
        setServerValidations([]);
        return;
      }
      try {
        const resp = await fetchFormValidations(formId);
        if (!resp || !resp.ok) {
          setServerValidations([]);
          return;
        }
        if (!cancelled) setServerValidations(resp.validations || []);
      } catch {
        setServerValidations([]);
      }
    }
    void loadServerValidations();
    return () => { cancelled = true; };
  }, [formId]);

  // Load and run validations dynamically
  const [runtimeResults, setRuntimeResults] = useState(null);
  const [validationRunning, setValidationRunning] = useState(false);
  const [runtimeError, setRuntimeError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function runValidations() {
      if (!enccode || !serverValidations || serverValidations.length === 0) {
        if (!cancelled) {
          setRuntimeResults(null);
          setRuntimeError("");
        }
        return;
      }

      try {
        setValidationRunning(true);
        setRuntimeError("");
        const validationIds = serverValidations.map(v => v.id);
        const result = await runEncounterValidations(enccode, validationIds);

        if (!cancelled) {
          if (result?.ok) {
            setRuntimeResults(result);
            setRuntimeError("");
          } else {
            setRuntimeResults(null);
            setRuntimeError(result?.error || "Validation returned an unexpected response.");
          }
        }
      } catch (e) {
        console.error("Error running validations:", e);
        if (!cancelled) {
          setRuntimeResults(null);
          setRuntimeError(e instanceof Error ? e.message : "Unable to run validations.");
        }
      } finally {
        if (!cancelled) {
          setValidationRunning(false);
        }
      }
    }

    void runValidations();
    return () => { cancelled = true; };
  }, [enccode, serverValidations]);

  // Build validation results from server validations and runtime results
  const validationResults = useMemo(() => {
    if (!serverValidations || serverValidations.length === 0) {
      return { checks: [], summary: { total: 0, passed: 0, failed: 0, allPassed: true, hasIssues: false } };
    }
    return buildValidationResults(serverValidations, runtimeResults);
  }, [serverValidations, runtimeResults]);

  const validationStats = useMemo(() => {
    const summary = validationResults.summary;
    return {
      totalForms: summary.total,
      blockedForms: summary.failed,
      readyForms: summary.passed,
      blockingChecks: summary.failed,
    };
  }, [validationResults]);

  const patientLabel = useMemo(
    () => resolvePatientLabel(selectedPatient),
    [selectedPatient],
  );

  const patientInitials = useMemo(
    () => getPatientInitials(patientLabel.name),
    [patientLabel.name],
  );

  const resolvedEnccode =
    runtimeResults?.encounter?.resolvedEnccode ||
    validationData?.details?.DEBUG_INFO?.resolvedEnccode ||
    enccode;

  const hasRenderedChecks = validationResults.checks.some((check) => check.passed !== null);
  const displayError = runtimeError || (!hasRenderedChecks ? error : "");

  const isLoading = loading || formsLoading || validationRunning;
  const statusTone = isLoading
    ? "loading"
    : validationResults.summary.hasIssues
      ? "attention"
      : "ready";
  const statusLabel = isLoading
    ? "Checking"
    : validationResults.summary.hasIssues
      ? "Needs attention"
      : "Ready";

  const handleProceedClick = () => {
    if (onProceed) {
      onProceed({
        canProceed: !validationResults.summary.hasIssues,
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
              disabled={!selectedPatient || loading || validationResults.summary.hasIssues}
              title={
                validationResults.summary.hasIssues
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

        {displayError ? (
          <div className="validation-message validation-message--error">
            Validation service issue: {displayError}
          </div>
        ) : null}

        {loading || isLoading ? (
          <div className="validation-loading">
            Checking validation status...
          </div>
        ) : validationResults.checks.length > 0 ? (
          <section className="validation-panel">
            <h2 className="validation-panel-title">Validation Results</h2>
            <p className="validation-helper-text">
              Review the validation status for each requirement below.
            </p>
            <div className="validation-form-grid">
              <article className={`validation-form-card ${validationResults.summary.hasIssues ? "validation-form-card--alert" : ""}`}>
                <div className="validation-step-list">
                  {validationResults.checks.map((check) => (
                    <div
                      key={check.id}
                      className={`validation-check-row ${check.passed ? "validation-check-row--pass" : check.passed === false ? "validation-check-row--fail" : "validation-check-row--pending"}`}
                    >
                      <div className="validation-check-row__icon" aria-hidden="true">
                        {check.passed === true ? "✓" : check.passed === false ? "●" : "—"}
                      </div>
                      <div className="validation-check-row__content">
                        <div className="validation-check-row__title-wrap">
                          <div className="validation-check-row__title">{check.description}</div>
                          <span
                            className={`validation-check-status ${check.passed === true ? "validation-check-status--pass" : check.passed === false ? "validation-check-status--fail" : ""}`}
                          >
                            {check.passed === true ? "Complete" : check.passed === false ? "Missing" : "Pending"}
                          </span>
                        </div>
                        {check.info && Object.keys(check.info).length > 0 ? (
                          <div className="validation-check-row__message">
                            {Object.entries(check.info)
                              .map(([key, val]) => `${key}: ${val}`)
                              .join(", ")}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>
        ) : (
          <div className="validation-empty">
            No validations available for this form.
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
  enccode: PropTypes.string,
  selectedForms: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  onProceed: PropTypes.func,
  onBackToForms: PropTypes.func,
  onChangePatient: PropTypes.func,
};

ValidationPage.defaultProps = {
  selectedPatient: null,
  enccode: undefined,
  selectedForms: [],
  onProceed: undefined,
  onBackToForms: undefined,
  onChangePatient: undefined,
};

export default ValidationPage;
