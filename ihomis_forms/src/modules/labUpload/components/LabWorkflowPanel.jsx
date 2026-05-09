/**
 * LabWorkflowPanel
 *
 * Step-by-step UI for the Lab Upload workflow:
 *
 *   [Encounter Confirmed] → [Select Order] → [Select Procedure] → [Upload PDF] → [Finalize]
 *
 * Props:
 *   - patient: selected patient object (from useLabPatientPicker)
 *   - contextParams: { hpercode, enccode, ... }
 *   - onUploadComplete: (result) => void - called with docointkey after successful upload
 *   - onRequestPatientChange: () => void - request to go back and pick different patient
 */

import PropTypes from "prop-types";
import { useCallback, useRef, useState } from "react";
import { useLabUploadWorkflow } from "../hooks/useLabUploadWorkflow.js";
import { LAB_UPLOAD_API_TOKEN } from "../labUploadConfig.js";
import "./LabWorkflowPanel.css";

const STEP_ORDER = ["encounter", "order", "procedure", "upload"];

function WorkflowStepIndicator({ currentStep }) {
  const stepIndex = STEP_ORDER.indexOf(currentStep);
  const steps = [
    { key: "encounter", label: "Encounter", icon: "🏥" },
    { key: "order", label: "Order", icon: "📋" },
    { key: "procedure", label: "Procedure", icon: "💉" },
    { key: "upload", label: "Upload", icon: "📤" },
  ];

  return (
    <div className="lwp-steps">
      {steps.map((step, idx) => {
        const isCompleted = idx < stepIndex;
        const isActive = idx === stepIndex;

        return (
          <div key={step.key} className={`lwp-step ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}>
            <div className="lwp-step-icon">
              {isCompleted ? "✓" : step.icon}
            </div>
            <div className="lwp-step-info">
              <span className="lwp-step-number">Step {idx + 1}</span>
              <span className="lwp-step-label">{step.label}</span>
            </div>
            {idx < steps.length - 1 && <div className={`lwp-step-line ${isCompleted ? "completed" : ""}`} />}
          </div>
        );
      })}
    </div>
  );
}

WorkflowStepIndicator.propTypes = {
  currentStep: PropTypes.string.isRequired,
};

function OrderCard({ order, isSelected, onSelect }) {
  // Get order type label
  const getOrderTypeLabel = (code) => {
    const types = {
      'LAB': 'Laboratory',
      'RAD': 'Radiology',
      'MED': 'Medications',
      'PROC': 'Procedure',
      'SP': 'Supply',
    };
    return types[code] || code || 'Order';
  };

  // Get order status
  const getStatusBadge = (status) => {
    const statusMap = {
      'P': { label: 'Pending', class: 'pending' },
      'D': { label: 'Done', class: 'done' },
      'C': { label: 'Cancelled', class: 'cancelled' },
      'IP': { label: 'In Progress', class: 'progress' },
    };
    return statusMap[status] || { label: status || 'Active', class: 'pending' };
  };

  const orderType = getOrderTypeLabel(order.ordcode);
  const status = getStatusBadge(order.estatus);

  return (
    <div
      className={`lwp-card ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(order)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(order)}
    >
      <div className="lwp-card-accent" />
      <div className="lwp-card-content">
        <div className="lwp-card-header">
          <span className="lwp-card-code">{order.orcode}</span>
          <div className="lwp-card-badges">
            <span className="lwp-card-badge type">{orderType}</span>
            <span className={`lwp-card-badge status ${status.class}`}>{status.label}</span>
          </div>
        </div>
        <p className="lwp-card-title">{order.oritem}</p>
        {order.procdesc && order.procdesc !== order.oritem && (
          <p className="lwp-card-desc">{order.procdesc}</p>
        )}
        <div className="lwp-card-meta">
          <span className="lwp-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {order.ordate}
          </span>
          <span className="lwp-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            {order.ortime}
          </span>
          {order.entryby && (
            <span className="lwp-meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              {order.entryby}
            </span>
          )}
        </div>
      </div>
      {isSelected && <div className="lwp-card-check">✓</div>}
    </div>
  );
}

OrderCard.propTypes = {
  order: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

function ProcedureCard({ procedure, isSelected, onSelect }) {
  return (
    <div
      className={`lwp-card ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(procedure)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(procedure)}
    >
      <div className="lwp-card-accent procedure" />
      <div className="lwp-card-content">
        <div className="lwp-card-header">
          <span className="lwp-card-code">{procedure.procedureInstanceId}</span>
          <span className="lwp-card-badge success">{procedure.procedureStatus}</span>
        </div>
        <p className="lwp-card-title">{procedure.procedureDescription}</p>
        <div className="lwp-card-meta">
          <span className="lwp-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {procedure.procdateFormatted || procedure.procedureDate}
          </span>
        </div>
      </div>
      {isSelected && <div className="lwp-card-check">✓</div>}
    </div>
  );
}

ProcedureCard.propTypes = {
  procedure: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default function LabWorkflowPanel({
  patient = null,
  contextParams = {},
  onUploadComplete = null,
  onRequestPatientChange = null,
  onRequestEncounterChange = null,
}) {
  const {
    selectedOrder,
    setSelectedOrder,
    selectedProcedure,
    setSelectedProcedure,
    orders,
    ordersLoading,
    ordersError,
    fetchOrdersForEncounter,
    uploadResults,
    uploading,
    workflowError,
    submitLabResult,
    resetWorkflow,
  } = useLabUploadWorkflow();

  // ── Local UI state ─────────────────────────────────────────
  const [remarks, setRemarks] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadSubmitting, setUploadSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  
  // ── Order selection state (two-level) ───────────────────────
  const [selectedOrcode, setSelectedOrcode] = useState(null);
  
  // Get unique ORCODEs from orders
  const getOrcodes = () => {
    const orcodes = {};
    orders.forEach(order => {
      const orcode = order.orcode || 'UNKNOWN';
      if (!orcodes[orcode]) {
        orcodes[orcode] = {
          orcode,
          oritem: order.oritem || orcode,
          ordate: order.ordate || '',
          entryby: order.entryby || '',
          count: 0,
          procedures: []
        };
      }
      orcodes[orcode].count++;
      // Add procedure details
      orcodes[orcode].procedures.push({
        proccode: order.proccode || '',
        procdesc: order.procdesc || order.oritem || '',
        docointkey: order.docointkey,
        estatus: order.estatus || '',
        ortime: order.ortime || '',
        entryby: order.entryby || '',
      });
    });
    return Object.values(orcodes);
  };
  
  // Get selected ORCODE details
  const selectedOrcodeDetails = selectedOrcode 
    ? getOrcodes().find(o => o.orcode === selectedOrcode)
    : null;
  
  // Helper function to get status class
  const getStatusClass = (status) => {
    const statusMap = {
      'P': 'pending',
      'D': 'done',
      'C': 'cancelled',
      'IP': 'progress',
    };
    return statusMap[status] || 'pending';
  };

  // ── Derived state ────────────────────────────────────────────
  const procedureOptions = selectedOrder
    ? [
        {
          procedureInstanceId:
            selectedOrder.docointkey ||
            selectedOrder.proccode ||
            selectedOrder.orcode ||
            "",
          orcode: selectedOrder.orcode || "",
          enccode: selectedOrder.enccode || enccode,
          chrgcod: selectedOrder.proccode || "",
          procedureDescription:
            selectedOrder.procdesc ||
            selectedOrder.oritem ||
            selectedOrder.orcode ||
            "Procedure",
          procedureDate: selectedOrder.dodate || "",
          procedureTime: selectedOrder.ortime || "",
          procedureStatus: selectedOrder.estatus || "",
          providerCode: selectedOrder.entryby || "",
          enteredBy: selectedOrder.entryby || "",
          procdateFormatted: selectedOrder.dodate || "",
          proctimeFormatted: selectedOrder.ortime || "",
          ordcode: selectedOrder.orcode || "",
          oritem:
            selectedOrder.procdesc ||
            selectedOrder.oritem ||
            selectedOrder.orcode ||
            "",
        },
      ]
    : [];
  const proceduresLoading = false;
  const proceduresError = null;

  const currentStep = selectedProcedure
    ? "upload"
    : selectedOrder
      ? "procedure"
      : "order";

  const enccode = contextParams?.enccode || "";

  // ── Fetch orders when encounter is available ─────────────────
  const handleFetchOrders = useCallback(async () => {
    if (!enccode) return;
    try {
      await fetchOrdersForEncounter(enccode, {
        type: "all",
        contextParams,
      });
    } catch {
      // error handled by hook
    }
  }, [enccode, fetchOrdersForEncounter, contextParams]);

  // ── Fetch procedures when order is selected ─────────────────
  const handleSelectOrder = useCallback(
    async (order) => {
      setSelectedOrder(order);
      setSelectedProcedure(null);
    },
    [setSelectedOrder, setSelectedProcedure],
  );

  // ── File selection ───────────────────────────────────────────
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    setUploadError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files || []);
    const pdfs = files.filter(
      (f) => f.type === "application/pdf" || f.name.endsWith(".pdf"),
    );
    setSelectedFiles(pdfs);
    setUploadError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Upload submission ────────────────────────────────────────
  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) {
      setUploadError("Please select at least one PDF file.");
      return;
    }

    setUploadSubmitting(true);
    setUploadError(null);

    const results = [];
    const errors = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      try {
        const result = await submitLabResult({
          file,
          contextParams: {
            ...contextParams,
            hpercode:
              contextParams?.hpercode || patient?.contextParams?.hpercode,
            enccode,
            orcode: selectedOrder?.orcode,
            proccode: selectedOrder?.proccode || selectedProcedure?.chrgcod,
            procedureInstanceId: selectedProcedure?.procedureInstanceId,
            user: LAB_UPLOAD_API_TOKEN ? "system" : "",
          },
          patient,
          remarks,
        });
        results.push(result);
        if (onUploadComplete) {
          onUploadComplete(result);
        }
      } catch (err) {
        errors.push({
          fileName: file.name,
          message: err instanceof Error ? err.message : "Upload failed",
        });
      }
    }

    if (errors.length > 0) {
      setUploadError(
        `${errors.length} file(s) failed: ${errors.map((e) => `${e.fileName}: ${e.message}`).join("; ")}`,
      );
    }

    if (results.length > 0) {
      setSelectedFiles([]);
      setRemarks("");
    }

    setUploadSubmitting(false);
  };

  const handleReset = () => {
    resetWorkflow();
    setSelectedFiles([]);
    setRemarks("");
    setUploadError(null);
  };

  return (
    <div className="lwp-container">
      {/* Header */}
      <div className="lwp-header">
        <div className="lwp-header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
        </div>
        <div className="lwp-header-text">
          <h2>Lab Result Upload</h2>
          <p>Upload and manage laboratory PDF results</p>
        </div>
        <button
          type="button"
          className="lwp-btn-change"
          onClick={onRequestPatientChange}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Change Patient
        </button>
        {onRequestEncounterChange && (
          <button
            type="button"
            className="lwp-btn-change lwp-btn-change-enc"
            onClick={onRequestEncounterChange}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Change Encounter
          </button>
        )}
      </div>

      {/* Patient Context Bar */}
      <div className="lwp-context-bar">
        <div className="lwp-patient-info">
          <div className="lwp-patient-avatar">
            {(patient?.contextParams?.patlast || patient?.rawData?.patlast || "?")[0].toUpperCase()}
          </div>
          <div className="lwp-patient-details">
            <span className="lwp-patient-name">
              {patient?.contextParams?.patlast || patient?.rawData?.patlast || "—"}{", "}
              {patient?.contextParams?.patfirst || patient?.rawData?.patfirst || ""}
            </span>
            <span className="lwp-patient-id">HCI: {contextParams?.hpercode || "—"}</span>
          </div>
        </div>
        <div className="lwp-encounter-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          Encounter: <strong>{enccode || "—"}</strong>
        </div>
      </div>

      {/* Step indicator */}
      <WorkflowStepIndicator currentStep={currentStep} />

      {/* ── Step: Order Selection ─────────────────────────────── */}
      {currentStep === "order" && (
        <div className="lwp-step-content">
          <div className="lwp-step-header">
            <div className="lwp-step-title-group">
              <span className="lwp-step-icon-sm">📋</span>
              <div>
                <h3>Select Laboratory Order</h3>
                <p>Choose the laboratory order to attach results to</p>
              </div>
            </div>
            <button
              type="button"
              className="lwp-btn-primary"
              onClick={handleFetchOrders}
              disabled={ordersLoading || !enccode}
            >
              {ordersLoading ? (
                <>
                  <span className="lwp-spinner" />
                  Loading...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  Load Orders
                </>
              )}
            </button>
          </div>

          {ordersError && (
            <div className="lwp-alert error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div>
                <strong>Error loading orders</strong>
                <p>{ordersError}</p>
              </div>
              <button type="button" className="lwp-btn-retry" onClick={handleFetchOrders}>
                Retry
              </button>
            </div>
          )}

          {ordersLoading && (
            <div className="lwp-loading">
              <span className="lwp-spinner large" />
              <p>Fetching laboratory orders...</p>
            </div>
          )}

          {!ordersLoading && orders.length === 0 && !ordersError && (
            <div className="lwp-empty">
              <div className="lwp-empty-icon">📋</div>
              <h4>No Orders Found</h4>
              <p>No laboratory orders found for this encounter. Click Load Orders to search again.</p>
            </div>
          )}

          {orders.length > 0 && (
            <>
              {!selectedOrcode ? (
                <>
                  {/* ORCODE Selection - First Level */}
                  <p className="lwp-section-label">Select an Order Request:</p>
                  <div className="lwp-card-grid">
                    {getOrcodes().map((orcodeGroup) => (
                      <div
                        key={orcodeGroup.orcode}
                        className="lwp-card lwp-card-clickable"
                        onClick={() => setSelectedOrcode(orcodeGroup.orcode)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && setSelectedOrcode(orcodeGroup.orcode)}
                      >
                        <div className="lwp-card-accent" />
                        <div className="lwp-card-content">
                          <div className="lwp-card-header">
                            <span className="lwp-card-code">{orcodeGroup.orcode}</span>
                            <span className="lwp-card-badge">{orcodeGroup.count} procedure(s)</span>
                          </div>
                          <p className="lwp-card-title">{orcodeGroup.oritem}</p>
                          <div className="lwp-card-meta">
                            {orcodeGroup.ordate && (
                              <span className="lwp-meta-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                  <line x1="16" y1="2" x2="16" y2="6"/>
                                  <line x1="8" y1="2" x2="8" y2="6"/>
                                  <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                {orcodeGroup.ordate}
                              </span>
                            )}
                            {orcodeGroup.entryby && (
                              <span className="lwp-meta-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                  <circle cx="12" cy="7" r="4"/>
                                </svg>
                                {orcodeGroup.entryby}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="lwp-card-arrow">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Procedure Selection - Second Level */}
                  <button
                    type="button"
                    className="lwp-btn-back"
                    onClick={() => setSelectedOrcode(null)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                    Back to Order Requests
                  </button>
                  
                  <div className="lwp-selection-summary">
                    <span className="lwp-selection-label">Order Request:</span>
                    <span className="lwp-selection-value">{selectedOrcodeDetails?.oritem} ({selectedOrcode})</span>
                  </div>
                  
                  <p className="lwp-section-label">Select a Procedure:</p>
                  <div className="lwp-card-grid">
                    {selectedOrcodeDetails?.procedures.map((proc, idx) => (
                      <div
                        key={proc.docointkey || idx}
                        className={`lwp-card ${selectedOrder?.docointkey === proc.docointkey ? "selected" : ""}`}
                        onClick={() => {
                          // Create full order object from procedure
                          const fullOrder = orders.find(o => o.docointkey === proc.docointkey) || {
                            ...proc,
                            orcode: selectedOrcode,
                            enccode: contextParams?.enccode || '',
                          };
                          handleSelectOrder(fullOrder);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const fullOrder = orders.find(o => o.docointkey === proc.docointkey) || {
                              ...proc,
                              orcode: selectedOrcode,
                              enccode: contextParams?.enccode || '',
                            };
                            handleSelectOrder(fullOrder);
                          }
                        }}
                      >
                        <div className="lwp-card-accent" />
                        <div className="lwp-card-content">
                          <div className="lwp-card-header">
                            <span className="lwp-card-code">{proc.proccode || 'N/A'}</span>
                            <span className={`lwp-card-badge status ${getStatusClass(proc.estatus)}`}>
                              {proc.estatus || 'Active'}
                            </span>
                          </div>
                          <p className="lwp-card-title">{proc.procdesc}</p>
                          <div className="lwp-card-meta">
                            {proc.ortime && (
                              <span className="lwp-meta-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"/>
                                  <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                {proc.ortime}
                              </span>
                            )}
                            {proc.entryby && (
                              <span className="lwp-meta-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                  <circle cx="12" cy="7" r="4"/>
                                </svg>
                                {proc.entryby}
                              </span>
                            )}
                          </div>
                        </div>
                        {selectedOrder?.docointkey === proc.docointkey && (
                          <div className="lwp-card-check">✓</div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Step: Procedure Selection ─────────────────────────── */}
      {currentStep === "procedure" && (
        <div className="lwp-step-content">
          <div className="lwp-step-header">
            <div className="lwp-step-title-group">
              <span className="lwp-step-icon-sm">💉</span>
              <div>
                <h3>Select Procedure</h3>
                <p>Choose a procedure or skip to continue</p>
              </div>
            </div>
            <button
              type="button"
              className="lwp-btn-secondary"
              onClick={() => {
                setSelectedOrder(null);
                setSelectedProcedure(null);
              }}
            >
              ← Back
            </button>
          </div>

          <div className="lwp-selection-summary">
            <span className="lwp-selection-label">Selected Order:</span>
            <span className="lwp-selection-value">
              {selectedOrder?.oritem} ({selectedOrder?.orcode})
            </span>
          </div>

          {proceduresError && (
            <div className="lwp-alert error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {proceduresError}
            </div>
          )}

          {proceduresLoading && (
            <div className="lwp-loading">
              <span className="lwp-spinner large" />
              <p>Loading procedures...</p>
            </div>
          )}

          {!proceduresLoading &&
            procedureOptions.length === 0 &&
            !proceduresError && (
              <div className="lwp-empty">
                <div className="lwp-empty-icon">💉</div>
                <h4>No Procedures Found</h4>
                <p>You can proceed without selecting a specific procedure.</p>
              </div>
            )}

          {procedureOptions.length > 0 && (
            <div className="lwp-card-grid">
              {procedureOptions.map((proc) => (
                <ProcedureCard
                  key={proc.procedureInstanceId}
                  procedure={proc}
                  isSelected={
                    selectedProcedure?.procedureInstanceId ===
                    proc.procedureInstanceId
                  }
                  onSelect={setSelectedProcedure}
                />
              ))}
            </div>
          )}

          <div className="lwp-skip-row">
            <button
              type="button"
              className="lwp-btn-skip"
              onClick={() => setSelectedProcedure(null)}
            >
              Skip Procedure
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Step: Upload ─────────────────────────────────────── */}
      {currentStep === "upload" && (
        <div className="lwp-step-content">
          <div className="lwp-step-header">
            <div className="lwp-step-title-group">
              <span className="lwp-step-icon-sm">📤</span>
              <div>
                <h3>Upload Lab Result</h3>
                <p>Drop your PDF file or click to browse</p>
              </div>
            </div>
            <button
              type="button"
              className="lwp-btn-secondary"
              onClick={() => setSelectedProcedure(null)}
            >
              ← Back
            </button>
          </div>

          <div className="lwp-upload-summary">
            {selectedOrder && (
              <div className="lwp-summary-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                {selectedOrder.oritem}
              </div>
            )}
            {selectedProcedure && (
              <div className="lwp-summary-chip procedure">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                {selectedProcedure.procedureDescription}
              </div>
            )}
          </div>

          {/* File drop zone */}
          <div
            className={`lwp-dropzone ${dragActive ? "active" : ""} ${selectedFiles.length > 0 ? "has-files" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" && fileInputRef.current?.click()
            }
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              multiple
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            {selectedFiles.length === 0 ? (
              <div className="lwp-dropzone-content">
                <div className="lwp-dropzone-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                </div>
                <p className="lwp-dropzone-title">Drop PDF files here</p>
                <p className="lwp-dropzone-subtitle">or click to browse from your computer</p>
              </div>
            ) : (
              <div className="lwp-files-list">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="lwp-file-item">
                    <div className="lwp-file-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <div className="lwp-file-info">
                      <span className="lwp-file-name">{file.name}</span>
                      <span className="lwp-file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <button
                      type="button"
                      className="lwp-file-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(idx);
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Remarks */}
          <div className="lwp-remarks">
            <label htmlFor="remarks">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Notes (optional)
            </label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any additional notes about this upload..."
              rows={2}
            />
          </div>

          {/* Upload error */}
          {(uploadError || workflowError) && (
            <div className="lwp-alert error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {uploadError || workflowError}
            </div>
          )}

          {/* Upload button */}
          <button
            type="button"
            className="lwp-btn-upload"
            onClick={handleUploadSubmit}
            disabled={
              uploadSubmitting || uploading || selectedFiles.length === 0
            }
          >
            {uploadSubmitting || uploading ? (
              <>
                <span className="lwp-spinner white" />
                Uploading...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Upload {selectedFiles.length > 0 ? `(${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""})` : ""}
              </>
            )}
          </button>

          {/* Uploaded results */}
          {uploadResults.length > 0 && (
            <div className="lwp-results">
              <div className="lwp-results-header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <h4>Upload Successful!</h4>
              </div>
              {uploadResults.map((result, idx) => (
                <div key={idx} className="lwp-result-item">
                  <div className="lwp-result-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div className="lwp-result-info">
                    <span className="lwp-result-name">{result.fileName}</span>
                    <span className="lwp-result-key">
                      Docointkey: <code>{result.docointkey}</code>
                    </span>
                    <span className="lwp-result-time">
                      Uploaded: {new Date(result.submittedAt).toLocaleString()}
                    </span>
                  </div>
                  <a
                    href={result.uploadedPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lwp-btn-view"
                  >
                    View PDF
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Start new upload */}
          {uploadResults.length > 0 && (
            <button
              type="button"
              className="lwp-btn-reset"
              onClick={handleReset}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
              Start New Upload
            </button>
          )}
        </div>
      )}
    </div>
  );
}

LabWorkflowPanel.propTypes = {
  patient: PropTypes.object,
  contextParams: PropTypes.object,
  onUploadComplete: PropTypes.func,
  onRequestPatientChange: PropTypes.func,
  onRequestEncounterChange: PropTypes.func,
};
