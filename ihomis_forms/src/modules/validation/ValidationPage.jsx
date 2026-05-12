import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { buildFallbackForms } from "../forms/formCatalog.js";
import {
  buildValidationResults,
  fetchFormValidations,
  runEncounterValidations,
} from "./validationScope.js";
import { supabase } from "../../lib/supabaseClient.js";
import "./Validation.css";

function StatCard({ icon, label, value, tone = "neutral", sublabel = "" }) {
  const className = `validation-stat-card validation-stat-card--${tone}`;

  return (
    <div className={className}>
      <div className="validation-stat-icon">{icon}</div>
      <div className="validation-stat-content">
        <span className="validation-stat-label">{label}</span>
        <span className="validation-stat-value">{value}</span>
        {sublabel && (
          <span className="validation-stat-sublabel">{sublabel}</span>
        )}
      </div>
    </div>
  );
}

StatCard.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  tone: PropTypes.string,
  sublabel: PropTypes.string,
};

function resolvePatientLabel(selectedPatient, patientData = null) {
  const raw = patientData || selectedPatient?.rawData || {};
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

function resolvePatientHpercode(selectedPatient, patientData = null) {
  const raw = patientData || selectedPatient?.rawData || {};
  return String(
    raw.hpercode ||
      selectedPatient?.contextParams?.hpercode ||
      (selectedPatient?.idSource === "hpercode" ? selectedPatient.id : "") ||
      selectedPatient?.id ||
      "",
  ).trim();
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

function getFormDisplayLabel(form) {
  if (!form) return "";

  if (typeof form === "string") {
    return form.trim();
  }

  if (typeof form !== "object") {
    return String(form).trim();
  }

  return (
    form.description ||
    form.name ||
    form.component_name ||
    form.label ||
    form.title ||
    form.formName ||
    form.id ||
    ""
  )
    .toString()
    .trim();
}

function normalizeSelectedForms(selectedFormsValue) {
  if (!selectedFormsValue) return [];

  const items = Array.isArray(selectedFormsValue)
    ? selectedFormsValue
    : [selectedFormsValue];

  return items
    .map((item) => {
      if (typeof item === "string") {
        return { label: item.trim(), value: item };
      }

      if (!item || typeof item !== "object") {
        const fallbackLabel = String(item || "").trim();
        return fallbackLabel ? { label: fallbackLabel, value: item } : null;
      }

      const label = getFormDisplayLabel(item);
      if (!label) return null;

      return {
        label,
        value: item,
        id: item.id ?? null,
      };
    })
    .filter(Boolean);
}

function ValidationPage({
  selectedPatient,
  enccode: enccodeOverride,
  selectedForms,
  onProceed,
  onBackToForms,
  onChangePatient,
}) {
  const [formId, setFormId] = useState(null);
  const [formsLoading, setFormsLoading] = useState(false);
  const fallbackForms = useMemo(() => buildFallbackForms(), []);
  const selectedFormItems = useMemo(
    () => normalizeSelectedForms(selectedForms),
    [selectedForms],
  );
  const selectedFormLabels = useMemo(
    () => selectedFormItems.map((item) => item.label).filter(Boolean),
    [selectedFormItems],
  );
  const selectedFormSummary = useMemo(() => {
    if (selectedFormLabels.length === 0) return "No form selected";
    if (selectedFormLabels.length === 1) return selectedFormLabels[0];
    if (selectedFormLabels.length === 2)
      return `${selectedFormLabels[0]} and ${selectedFormLabels[1]}`;
    return `${selectedFormLabels[0]} + ${selectedFormLabels.length - 1} more`;
  }, [selectedFormLabels]);

  // Resolve form ID by looking up the form name in Supabase
  useEffect(() => {
    const resolveFormId = async () => {
      if (selectedFormItems.length === 0) {
        setFormId(null);
        return;
      }

      try {
        setFormsLoading(true);
        const selectedFormName = selectedFormItems[0]?.label || "";

        if (!selectedFormName) {
          setFormId(null);
          return;
        }

        // Try to fetch from Supabase if available
        if (supabase) {
          const { data: loadedForms, error } = await supabase
            .from("hospital_forms")
            .select("*");

          if (!error && loadedForms && Array.isArray(loadedForms)) {
            // Find the matching form by description or component_name
            const matchedForm = loadedForms.find(
              (form) =>
                form.description === selectedFormName ||
                form.component_name === selectedFormName ||
                form.description?.includes(selectedFormName),
            );

            if (matchedForm) {
              setFormId(matchedForm.id);
              return;
            }
          }
        }

        // Fallback: search in fallback forms
        const matchedFallback = fallbackForms.find(
          (form) =>
            form.description === selectedFormName ||
            form.component_name === selectedFormName ||
            form.description?.includes(selectedFormName),
        );

        setFormId(matchedFallback?.id || null);
      } catch (error) {
        console.error("Error resolving form ID:", error);
        const selectedFormName = selectedFormItems[0]?.label || "";

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
  }, [fallbackForms, selectedFormItems]);

  // Resolve enccode from selectedPatient or use override
  function normalizeEncounterCode(rawValue) {
    const text = String(rawValue || "").trim();
    if (!text) return "";
    const firstToken = text.split(/[\s/]/)[0].trim();
    return firstToken || text;
  }

  function resolveEnccode(selectedPatient) {
    return normalizeEncounterCode(
      selectedPatient?.rawData?.enccode ||
        selectedPatient?.contextParams?.enccode ||
        selectedPatient?.contextParams?.enc ||
        selectedPatient?.selectedEncounter?.enccode ||
        (selectedPatient?.idSource === "enccode" ? selectedPatient.id : "") ||
        selectedPatient?.id ||
        "",
    );
  }

  const enccode = useMemo(
    () => enccodeOverride || resolveEnccode(selectedPatient),
    [enccodeOverride, selectedPatient],
  );

  const [validationData, setValidationData] = useState(null);
  const hpercode = useMemo(
    () => resolvePatientHpercode(selectedPatient, validationData?.patient),
    [selectedPatient, validationData?.patient],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load and run validations dynamically
  const [runtimeResults, setRuntimeResults] = useState(null);
  const [validationRunning, setValidationRunning] = useState(false);
  const [runtimeError, setRuntimeError] = useState("");

  // Refresh function to re-run validations
  const refresh = useCallback(() => {
    setRuntimeResults(null);
    setRuntimeError("");
    setError("");
    // Re-trigger the validation by clearing and re-fetching
  }, []);

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
    return () => {
      cancelled = true;
    };
  }, [formId]);

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
        const validationIds = serverValidations.map((v) => v.id);
        const result = await runEncounterValidations(
          enccode,
          validationIds,
          hpercode,
        );

        if (!cancelled) {
          if (result?.ok) {
            setRuntimeResults(result);
            setValidationData(result?.encounter || null);
            setRuntimeError("");
          } else {
            setRuntimeResults(null);
            setValidationData(null);
            setRuntimeError(
              result?.error || "Validation returned an unexpected response.",
            );
          }
        }
      } catch (e) {
        console.error("Error running validations:", e);
        if (!cancelled) {
          setRuntimeResults(null);
          setRuntimeError(
            e instanceof Error ? e.message : "Unable to run validations.",
          );
        }
      } finally {
        if (!cancelled) {
          setValidationRunning(false);
        }
      }
    }

    void runValidations();
    return () => {
      cancelled = true;
    };
  }, [enccode, hpercode, serverValidations]);

  // Build validation results from server validations and runtime results
  const validationResults = useMemo(() => {
    if (!serverValidations || serverValidations.length === 0) {
      return {
        checks: [],
        summary: {
          total: 0,
          passed: 0,
          failed: 0,
          allPassed: true,
          hasIssues: false,
        },
      };
    }
    return buildValidationResults(serverValidations, runtimeResults);
  }, [serverValidations, runtimeResults]);

  const validationStats = useMemo(() => {
    const summary = validationResults.summary;
    return {
      selectedForms: selectedFormItems.length,
      totalChecks: summary.total,
      blockedForms: summary.failed,
      readyForms: summary.passed,
      blockingChecks: summary.failed,
    };
  }, [validationResults, selectedFormItems.length]);

  const patientLabel = useMemo(
    () => resolvePatientLabel(selectedPatient, validationData?.patient),
    [selectedPatient, validationData?.patient],
  );

  const patientInitials = useMemo(
    () => getPatientInitials(patientLabel.name),
    [patientLabel.name],
  );

  const resolvedEnccode =
    validationData?.encounter?.resolvedEnccode ||
    validationData?.resolvedEnccode ||
    runtimeResults?.encounter?.resolvedEnccode ||
    enccode;

  const hasRenderedChecks = validationResults.checks.some(
    (check) => check.passed !== null,
  );
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
        <h1 className="validation-page-title">Patient Record Verification</h1>

        {/* Header Section */}
        <section className="validation-header">
          <div className="validation-header-badge">
            <span className="validation-header-system">Forms Validation</span>
            <span
              className={`validation-header-status validation-header-status--${statusTone}`}
            >
              <span className="validation-header-status-dot" />
              {statusLabel}
            </span>
          </div>

          <div className="validation-header-top">
            <div className="validation-header-left">
              <div className="validation-patient-badge">
                <div className="validation-patient-avatar" aria-hidden="true">
                  {patientInitials}
                </div>
                <div className="validation-patient-details">
                  <span className="validation-patient-label">Patient</span>
                  <span className="validation-patient-name">
                    {patientLabel.name}
                  </span>
                  <span className="validation-patient-id">
                    ID: {patientLabel.hpercode || "N/A"}
                  </span>
                </div>
              </div>  
            </div>
          </div>

          <div className="validation-header-info">
            <span className="validation-info-item">
              <strong>API:</strong> Validation
            </span>
            {resolvedEnccode && (
              <span className="validation-info-item">
                <strong>Encounter:</strong> {resolvedEnccode}
              </span>
            )}
            <span className="validation-info-item">
              <strong>Form:</strong> {selectedFormSummary}
            </span>
          </div>

          <p className="validation-header-description">
            Review incomplete form sections before generating the selected
            forms.
          </p>

          <div className="validation-action-bar">
            <div className="validation-action-group">
              <button
                type="button"
                className="validation-btn validation-btn--ghost"
                onClick={refresh}
                disabled={loading}
              >
                Refresh
              </button>
              {onChangePatient && (
                <button
                  type="button"
                  className="validation-btn validation-btn--ghost"
                  onClick={onChangePatient}
                >
                  Change Patient
                </button>
              )}
              {onBackToForms && (
                <button
                  type="button"
                  className="validation-btn validation-btn--ghost"
                  onClick={onBackToForms}
                  disabled={loading}
                >
                  Back to Forms
                </button>
              )}
            </div>
            <button
              type="button"
              className="validation-btn validation-btn--primary"
              onClick={handleProceedClick}
              disabled={
                !selectedPatient ||
                loading ||
                validationResults.summary.hasIssues
              }
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
          <StatCard
            icon="☑"
            label="Forms Selected"
            value={validationStats.selectedForms}
            tone={validationStats.selectedForms > 0 ? "neutral" : "warning"}
          />
          <StatCard
            icon="✓"
            label="Checks Completed"
            value={validationStats.readyForms}
            sublabel={`of ${validationStats.totalChecks}`}
            tone={
              validationStats.readyForms === validationStats.totalChecks
                ? "success"
                : "warning"
            }
          />
          <StatCard
            icon="⚠"
            label="Items to Review"
            value={validationStats.blockingChecks}
            tone={validationStats.blockingChecks > 0 ? "danger" : "success"}
          />
        </section>

        {displayError ? (
          <div className="validation-message validation-message--error">
            Validation service issue: {displayError}
          </div>
        ) : null}

        {loading || isLoading ? (
          <div className="validation-loading">
            <span
              style={{
                fontSize: "2rem",
                marginBottom: "1rem",
                display: "block",
              }}
            >
              ◐
            </span>
            Checking validation status...
          </div>
        ) : validationResults.checks.length > 0 ? (
          <section className="validation-panel">
            <h2 className="validation-panel-title">Validation Checklist</h2>
            <p className="validation-helper-text">
              Review each validation requirement below. All items must be
              complete before you can proceed.
            </p>
            <div className="validation-form-grid">
              <article
                className={`validation-form-card ${validationResults.summary.hasIssues ? "validation-form-card--alert" : ""}`}
              >
                <div className="validation-form-card__header">
                  <div>
                    <h3>Required Checks</h3>
                    <p
                      className="validation-helper-text"
                      style={{ marginTop: "0.25rem", marginBottom: "0" }}
                    >
                      {validationResults.summary.passed} of{" "}
                      {validationResults.summary.total} complete
                    </p>
                  </div>
                  <span
                    className={`validation-badge ${validationResults.summary.hasIssues ? "validation-badge--alert" : "validation-badge--success"}`}
                  >
                    {validationResults.summary.hasIssues
                      ? "⚠ Action Needed"
                      : "✓ All Complete"}
                  </span>
                </div>
                <div className="validation-step-list">
                  {validationResults.checks.map((check) => (
                    <div
                      key={check.id}
                      className={`validation-check-row ${check.passed === true ? "validation-check-row--pass" : check.passed === false ? "validation-check-row--fail" : "validation-check-row--pending"}`}
                    >
                      <div
                        className="validation-check-row__icon"
                        aria-hidden="true"
                      >
                        {check.passed === true
                          ? "✓"
                          : check.passed === false
                            ? "●"
                            : "—"}
                      </div>
                      <div className="validation-check-row__content">
                        <div className="validation-check-row__title-wrap">
                          <div className="validation-check-row__title">
                            {check.description}
                          </div>
                          <span
                            className={`validation-check-status ${check.passed === true ? "validation-check-status--pass" : check.passed === false ? "validation-check-status--fail" : ""}`}
                          >
                            {check.passed === true
                              ? "Complete"
                              : check.passed === false
                                ? "Missing"
                                : "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>
        ) : (
          <div className="validation-empty">
            <span
              style={{
                fontSize: "2rem",
                marginBottom: "1rem",
                display: "block",
              }}
            >
              ◊
            </span>
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
