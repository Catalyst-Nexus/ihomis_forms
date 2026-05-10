import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import LabWorkflowPanel from "./LabWorkflowPanel.jsx";
import {
  LAB_UPLOAD_API_TOKEN,
  LAB_UPLOAD_CONTEXT_URL,
} from "../labUploadConfig.js";
import {
  canUseSupabaseUploads,
  fetchPatientUploadedFilesSupabase,
} from "../api/labUploadSupabase.js";
import { fetchPatientUploadedFiles } from "../api/labUploadApi.js";
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
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [historyFiles, setHistoryFiles] = useState([]);
  const [historyCount, setHistoryCount] = useState(0);
  const historyRefreshRequestRef = useRef(0);

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

  const selectedPatientHpercode =
    selectedPatient?.contextParams?.hpercode ||
    selectedPatient?.rawData?.hpercode ||
    selectedPatient?.id ||
    "";

  const selectedEnccode =
    contextParams?.enccode || selectedContextParams?.enccode || "";

  const fetchUploadedPdfHistory = useCallback(
    async ({ includeFiles = false } = {}) => {
      const requestId = historyRefreshRequestRef.current + 1;
      historyRefreshRequestRef.current = requestId;

      if (!selectedPatientHpercode || !selectedEnccode) {
        if (historyRefreshRequestRef.current === requestId) {
          setHistoryCount(0);
          if (includeFiles) {
            setHistoryFiles([]);
            setCurrentPage(1);
            setHistoryError("");
          }
        }
        return [];
      }

      const selectedEnccodeRaw = String(selectedEnccode || "").trim();
      const matchEnccode = (value) => {
        if (!value) return false;

        try {
          const decoded = decodeURIComponent(String(value));
          return (
            decoded.trim() === selectedEnccodeRaw ||
            String(value).trim() === selectedEnccodeRaw
          );
        } catch {
          return String(value).trim() === selectedEnccodeRaw;
        }
      };

      const applyResponse = (responseData) => {
        if (historyRefreshRequestRef.current !== requestId) {
          return [];
        }

        const rawFiles = Array.isArray(responseData) ? responseData : [];
        const filteredFiles = rawFiles.filter(
          (file) =>
            matchEnccode(file?.enccode) ||
            matchEnccode(file?.encounter_code) ||
            matchEnccode(file?.enccode_raw),
        );

        setHistoryCount(filteredFiles.length);

        if (includeFiles) {
          setHistoryFiles(filteredFiles);
          setCurrentPage(1);
          setHistoryError("");
        }

        return filteredFiles;
      };

      try {
        const response = await fetchPatientUploadedFiles({
          hpercode: selectedPatientHpercode,
          enccode: selectedEnccodeRaw,
          token: LAB_UPLOAD_API_TOKEN,
        });

        return applyResponse(response.data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";

        if (
          /supabase(?:\s+is)?\s+not\s+configured|route not found|request failed with status\s+500|\b404\b|\b500\b/i.test(
            message,
          )
        ) {
          try {
            const fallbackResponse = await fetchPatientUploadedFilesSupabase({
              hpercode: selectedPatientHpercode,
              enccode: selectedEnccodeRaw,
            });

            return applyResponse(fallbackResponse.data);
          } catch {
            if (historyRefreshRequestRef.current === requestId) {
              setHistoryCount(0);
              if (includeFiles) {
                setHistoryFiles([]);
                setCurrentPage(1);
              }
            }

            return [];
          }
        }

        if (historyRefreshRequestRef.current === requestId) {
          setHistoryCount(0);
          if (includeFiles) {
            setHistoryFiles([]);
            setCurrentPage(1);
          }
        }

        return [];
      }
    },
    [selectedEnccode, selectedPatientHpercode],
  );

  const refreshUploadedPdfCount = useCallback(async () => {
    const files = await fetchUploadedPdfHistory({ includeFiles: false });
    return files.length;
  }, [fetchUploadedPdfHistory]);

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const openHistoryModal = useCallback(async () => {
    if (!selectedPatientHpercode) return;

    setIsHistoryModalOpen(true);

    setHistoryLoading(true);
    setHistoryError("");

    try {
      await fetchUploadedPdfHistory({ includeFiles: true });
    } finally {
      setHistoryLoading(false);
    }
  }, [fetchUploadedPdfHistory, selectedPatientHpercode]);

  const closeHistoryModal = useCallback(() => {
    setIsHistoryModalOpen(false);
  }, []);

  useEffect(() => {
    // Reset loaded history when the selected patient or encounter changes.
    setHistoryFiles([]);
    setHistoryCount(0);
    setHistoryError("");
    setIsHistoryModalOpen(false);
  }, [selectedPatientHpercode, selectedEnccode]);

  useEffect(() => {
    refreshUploadedPdfCount();
  }, [refreshUploadedPdfCount]);

  useEffect(() => {
    if (!isHistoryModalOpen) {
      return undefined;
    }

    let isActive = true;
    const refreshHistory = async () => {
      if (!isActive) return;
      setHistoryLoading(true);
      try {
        await fetchUploadedPdfHistory({ includeFiles: true });
      } finally {
        if (isActive) {
          setHistoryLoading(false);
        }
      }
    };

    refreshHistory();
    const intervalId = window.setInterval(refreshHistory, 60000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [fetchUploadedPdfHistory, isHistoryModalOpen]);

  useEffect(() => {
    if (!isHistoryModalOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeHistoryModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeHistoryModal, isHistoryModalOpen]);

  const formatHistoryDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  const formatReadableValue = (value) => {
    const text = String(value || "").trim();
    return text || "—";
  };

  const totalPages = Math.max(1, Math.ceil(historyFiles.length / pageSize));
  const pagedFiles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return historyFiles.slice(start, start + pageSize);
  }, [historyFiles, currentPage, pageSize]);

  useLabRequestContext({
    contextUrl: LAB_UPLOAD_CONTEXT_URL,
    token: LAB_UPLOAD_API_TOKEN,
    contextParams,
  });

  function handleUploadComplete(result) {
    refreshUploadedPdfCount();
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
                  <button
                    type="button"
                    className="lab-action-btn secondary lab-action-btn--history"
                    onClick={openHistoryModal}
                    disabled={!selectedPatientHpercode}
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
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <path d="M8 13h2" />
                      <path d="M8 17h8" />
                    </svg>
                    Uploaded PDFs
                    <span className="lab-action-btn__count">
                      {historyCount}
                    </span>
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

      {isHistoryModalOpen && (
        <div
          className="lab-history-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lab-history-title"
          onClick={closeHistoryModal}
        >
          <div
            className="lab-history-modal__panel"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header */}
            <div className="lab-history-modal__header">
              <div className="lab-history-modal__header-left">
                <div className="lab-history-modal__icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="9" y1="13" x2="15" y2="13" />
                    <line x1="9" y1="17" x2="15" y2="17" />
                  </svg>
                </div>
                <div className="lab-history-modal__title-group">
                  <p className="lab-history-modal__eyebrow">Patient Uploads</p>
                  <h2
                    id="lab-history-title"
                    className="lab-history-modal__title"
                  >
                    Uploaded PDFs
                  </h2>
                  <div className="lab-history-modal__patient-info">
                    <span className="lab-history-modal__patient-name">
                      {patientName}
                    </span>
                    <span className="lab-history-modal__patient-separator">
                      ·
                    </span>
                    <span className="lab-history-modal__patient-code">
                      HCI <code>{selectedPatientHpercode || "—"}</code>
                    </span>
                    <span className="lab-history-modal__patient-separator">
                      ·
                    </span>
                    <span className="lab-history-modal__patient-code">
                      Enc <code>{selectedEnccode || "—"}</code>
                    </span>
                  </div>
                </div>
              </div>
              <div className="lab-history-modal__header-actions">
                <button
                  type="button"
                  className="lab-action-btn secondary"
                  onClick={openHistoryModal}
                  disabled={historyLoading}
                  style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem" }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  {historyLoading ? "Loading..." : "Refresh"}
                </button>
                <button
                  type="button"
                  className="lab-history-modal__close"
                  onClick={closeHistoryModal}
                  aria-label="Close"
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
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="lab-history-modal__body">
              {/* documents toolbar removed per request */}

              {/* States */}
              {historyLoading ? (
                <div className="lab-history-modal__state">
                  <div className="lab-history-modal__loading">
                    <div className="lab-history-modal__spinner" />
                    <p className="lab-history-modal__loading-text">
                      Loading...
                    </p>
                  </div>
                </div>
              ) : historyError ? (
                <div className="lab-history-modal__state lab-history-modal__state--error">
                  <div className="lab-history-modal__state-icon">
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
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <p className="lab-history-modal__state-message">Error</p>
                  <p className="lab-history-modal__state-description">
                    {historyError}
                  </p>
                </div>
              ) : historyFiles.length === 0 ? (
                <div className="lab-history-modal__state lab-history-modal__state--empty">
                  <div className="lab-history-modal__state-icon">
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
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                  </div>
                  <p className="lab-history-modal__state-message">No uploads</p>
                  <p className="lab-history-modal__state-description">
                    No PDFs uploaded for this patient yet.
                  </p>
                </div>
              ) : (
                <>
                  {/* Pagination */}
                  {historyFiles.length > pageSize && (
                    <div className="lab-history-pagination">
                      <button
                        type="button"
                        className="lab-action-btn secondary"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        style={{
                          padding: "0.35rem 0.6rem",
                          fontSize: "0.7rem",
                        }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Prev
                      </button>
                      <span className="lab-history-pagination__info">
                        {currentPage}/{totalPages}
                      </span>
                      <button
                        type="button"
                        className="lab-action-btn secondary"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage >= totalPages}
                        style={{
                          padding: "0.35rem 0.6rem",
                          fontSize: "0.7rem",
                        }}
                      >
                        Next
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value) || 10);
                          setCurrentPage(1);
                        }}
                        className="lab-history-pagination__select"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                      </select>
                    </div>
                  )}

                  {/* File List */}
                  <div className="lab-history-list">
                    {pagedFiles.map((file, index) => {
                      const docointkey =
                        file.docointkey || file.procedure_instance_id || "—";
                      const orderCode = file.orcode || file.order_code || "—";
                      const remarks =
                        file.remarks || file.note || file.comment || "—";
                      const procedureCode =
                        file.proccode || file.procedure_code || "—";
                      const uploadedAt =
                        file.created_at ||
                        file.submittedAt ||
                        file.uploaded_at ||
                        "";

                      return (
                        <article
                          key={`${docointkey}-${index}`}
                          className="lab-history-item"
                        >
                          <div
                            className="lab-history-item__icon"
                            aria-hidden="true"
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
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="9" y1="13" x2="15" y2="13" />
                              <line x1="9" y1="17" x2="15" y2="17" />
                            </svg>
                          </div>

                          <div className="lab-history-item__content">
                            <div className="lab-history-item__topline">
                              <h3>
                                {formatReadableValue(
                                  file.file_name || file.fileName,
                                )}
                              </h3>
                              <a
                                href={file.file_url || file.uploadedPdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="lab-history-item__link"
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                  <polyline points="15 3 21 3 21 9" />
                                  <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                                Open
                              </a>
                            </div>

                            <div className="lab-history-item__meta-grid">
                              <div className="lab-history-meta">
                                <span className="lab-history-meta__label">
                                  docointkey
                                </span>
                                <code className="lab-history-meta__code">
                                  {formatReadableValue(docointkey)}
                                </code>
                              </div>
                              <div className="lab-history-meta">
                                <span className="lab-history-meta__label">
                                  Order
                                </span>
                                <span className="lab-history-meta__value">
                                  {formatReadableValue(orderCode)}
                                </span>
                              </div>
                              <div className="lab-history-meta">
                                <span className="lab-history-meta__label">
                                  Procedure
                                </span>
                                <span className="lab-history-meta__value">
                                  {formatReadableValue(procedureCode)}
                                </span>
                              </div>
                              <div className="lab-history-meta">
                                <span className="lab-history-meta__label">
                                  Uploaded
                                </span>
                                <span className="lab-history-meta__value">
                                  {formatHistoryDate(uploadedAt)}
                                </span>
                              </div>
                              <div className="lab-history-meta">
                                <span className="lab-history-meta__label">
                                  Uploaded By
                                </span>
                                <span className="lab-history-meta__value">
                                  {formatReadableValue(
                                    file.uploaded_by ||
                                      file.uploadedBy ||
                                      file.source,
                                  )}
                                </span>
                              </div>
                              <div className="lab-history-meta">
                                <span className="lab-history-meta__label">
                                  Remarks
                                </span>
                                <span className="lab-history-meta__value">
                                  {formatReadableValue(remarks)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
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
