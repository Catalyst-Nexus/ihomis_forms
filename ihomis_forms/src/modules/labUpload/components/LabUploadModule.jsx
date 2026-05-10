import { useMemo } from "react";
import PropTypes from "prop-types";
import LabWorkflowPanel from "./LabWorkflowPanel.jsx";
import {
  LAB_UPLOAD_API_TOKEN,
  LAB_UPLOAD_CONTEXT_URL,
} from "../labUploadConfig.js";
import { canUseSupabaseUploads } from "../api/labUploadSupabase.js";
import useLabRequestContext from "../hooks/useLabRequestContext.js";
import "../LabUploadModule.css";

function LabUploadModule({
  selectedPatient = null,
  selectedContextParams = {},
  onRequestPatientChange,
  onRequestEncounterChange,
}) {
  const contextParams = useMemo(
    () => ({
      ...(selectedPatient?.contextParams || {}),
      ...selectedContextParams,
    }),
    [selectedPatient, selectedContextParams],
  );

  const hasSupabaseUpload = canUseSupabaseUploads();

  const patientName = useMemo(() => {
    const lastName =
      selectedPatient?.contextParams?.patlast ||
      selectedPatient?.rawData?.patlast ||
      "";
    const firstName =
      selectedPatient?.contextParams?.patfirst ||
      selectedPatient?.rawData?.patfirst ||
      "";
    const middleName =
      selectedPatient?.contextParams?.patmiddle ||
      selectedPatient?.rawData?.patmiddle ||
      "";

    return (
      [lastName, firstName, middleName].filter(Boolean).join(", ") ||
      selectedPatient?.displayName ||
      "—"
    );
  }, [selectedPatient]);

  const facilityName =
    contextParams?.facility_name ||
    selectedContextParams?.facility_name ||
    selectedPatient?.contextParams?.facility_name ||
    selectedPatient?.rawData?.facility_name ||
    contextParams?.facility ||
    "—";

  const departmentName =
    contextParams?.dept_name ||
    selectedContextParams?.dept_name ||
    selectedPatient?.contextParams?.dept_name ||
    selectedPatient?.rawData?.dept_name ||
    contextParams?.service ||
    "—";

  const admissionDate = useMemo(() => {
    const dateVal =
      contextParams?.admission_date ||
      selectedContextParams?.admission_date ||
      selectedPatient?.contextParams?.admission_date ||
      selectedPatient?.rawData?.admission_date ||
      contextParams?.admdate ||
      selectedContextParams?.admdate ||
      selectedPatient?.contextParams?.admdate ||
      selectedPatient?.rawData?.admdate ||
      contextParams?.encounter_date ||
      selectedPatient?.contextParams?.encounter_date ||
      selectedPatient?.rawData?.encounter_date ||
      "—";

    if (dateVal === "—") return "—";

    // Format date if it's in YYYY-MM-DD or similar format
    try {
      const date = new Date(dateVal);
      if (!isNaN(date.getTime())) {
        return new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(date);
      }
    } catch {
      // Invalid date format, return as-is
    }
    return dateVal;
  }, [selectedPatient, contextParams, selectedContextParams]);

  const encounterCode =
    contextParams?.enccode || selectedContextParams?.enccode || "—";

  const recordNo =
    contextParams?.hpercode ||
    selectedContextParams?.hpercode ||
    selectedPatient?.contextParams?.hpercode ||
    selectedPatient?.id ||
    "—";

  const patientSex =
    selectedPatient?.contextParams?.sex || selectedPatient?.rawData?.sex || "—";

  const patientAge =
    selectedPatient?.contextParams?.age || selectedPatient?.rawData?.age || "—";

  useLabRequestContext({
    contextUrl: LAB_UPLOAD_CONTEXT_URL,
    token: LAB_UPLOAD_API_TOKEN,
    contextParams,
  });

  function handleUploadComplete(result) {
    // Upload completion is handled inline in the lab workflow.
    // Keep this callback to preserve the existing prop contract.
    return result;
  }

  function handleRequestPatientChange() {
    if (typeof onRequestPatientChange === "function") {
      onRequestPatientChange();
    }
  }

  return (
    <div className="lab-page">
      <main className="lab-layout">
        {/* ── Hero Banner ─────────────────────────────────────── */}
        <div className="lab-hero-wrap">
          <div className="lab-hero">
            {/* Left: System branding + actions */}
            <div className="lab-hero-left">
              <div className="lab-hero-eyebrow">
                <div className="lab-hero-icon-wrap" aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                </div>
                <span className="lab-hero-system">
                  Hospital Information System
                </span>
                <div
                  className={`lab-hero-status ${
                    hasSupabaseUpload
                      ? "lab-hero-status--ready"
                      : "lab-hero-status--pending"
                  }`}
                >
                  <span className="lab-hero-status-dot" />
                  {hasSupabaseUpload ? "System Ready" : "Configure Supabase"}
                </div>
              </div>

              <h1 className="lab-hero-title">Lab Result Upload</h1>
              <p className="lab-hero-meta">
                {selectedPatient && facilityName !== "—"
                  ? `${facilityName}${departmentName !== "—" ? ` · ${departmentName}` : ""}`
                  : "Upload and manage laboratory PDF results for the selected patient."}
              </p>

              {selectedPatient && (
                <div className="lab-hero-actions">
                  <button
                    type="button"
                    className="lab-action-btn secondary"
                    onClick={handleRequestPatientChange}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Change Patient
                  </button>
                  <button
                    type="button"
                    className="lab-action-btn secondary"
                    onClick={() => {
                      if (typeof onRequestEncounterChange === "function") {
                        onRequestEncounterChange();
                      } else {
                        handleRequestPatientChange();
                      }
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Change Encounter
                  </button>
                </div>
              )}
            </div>

            {/* Right: Patient context card */}
            {selectedPatient ? (
              <div className="lab-hero-right">
                <div className="lab-hero-patient">
                  <div className="lab-hero-patient-avatar">
                    {(patientName || "?")[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="lab-hero-patient-info">
                    <span className="lab-hero-patient-label">
                      Current Patient
                    </span>
                    <span className="lab-hero-patient-name">{patientName}</span>
                    <div className="lab-hero-summary-grid">
                      <div className="lab-hero-summary-item">
                        <span className="lab-hero-summary-label">
                          Record No.
                        </span>
                        <span className="lab-hero-summary-value">
                          {recordNo}
                        </span>
                      </div>
                      <div className="lab-hero-summary-item">
                        <span className="lab-hero-summary-label">
                          Encounter
                        </span>
                        <span className="lab-hero-summary-value">
                          {encounterCode}
                        </span>
                      </div>
                      <div className="lab-hero-summary-item">
                        <span className="lab-hero-summary-label">
                          Age / Sex
                        </span>
                        <span className="lab-hero-summary-value">
                          {patientAge} / {patientSex}
                        </span>
                      </div>
                      <div className="lab-hero-summary-item">
                        <span className="lab-hero-summary-label">
                          Admission Date
                        </span>
                        <span className="lab-hero-summary-value">
                          {admissionDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="lab-hero-no-patient"
                aria-label="No patient selected"
              >
                <div className="lab-hero-no-patient-icon" aria-hidden="true">
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <p className="lab-hero-no-patient-text">No patient selected</p>
                <p className="lab-hero-no-patient-sub">
                  Go back to select a patient to continue.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Workflow Panel ───────────────────────────────────── */}
        <section className="lab-grid">
          <LabWorkflowPanel
            patient={selectedPatient}
            contextParams={contextParams}
            showContextBar={false}
            onUploadComplete={handleUploadComplete}
            onRequestPatientChange={handleRequestPatientChange}
            onRequestEncounterChange={onRequestEncounterChange}
          />
        </section>
      </main>
    </div>
  );
}

LabUploadModule.propTypes = {
  selectedPatient: PropTypes.shape({
    id: PropTypes.string,
    idSource: PropTypes.string,
    displayName: PropTypes.string,
    description: PropTypes.string,
    contextParams: PropTypes.object,
    rawData: PropTypes.object,
  }),
  selectedContextParams: PropTypes.object,
  onRequestPatientChange: PropTypes.func,
  onRequestEncounterChange: PropTypes.func,
};

export default LabUploadModule;
