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
import {
  LAB_UPLOAD_API_TOKEN,
} from "../labUploadConfig.js";
import PdfCanvasPreview from "./PdfCanvasPreview.jsx";
import "./LabWorkflowPanel.css";

// Status mapping for display
const STATUS_LABELS = {
  S: "Scheduled",
  C: "Completed",
  P: "Pending",
  X: "Cancelled",
  R: "Resulted",
  I: "In Progress",
};

const STEP_ORDER = ["encounter", "order", "procedure", "upload"];

function WorkflowStepIndicator({ currentStep }) {
  const stepIndex = STEP_ORDER.indexOf(currentStep);
  const steps = [
    { key: "encounter", label: "Encounter" },
    { key: "order", label: "Order" },
    { key: "procedure", label: "Procedure" },
    { key: "upload", label: "Upload" },
  ];

  return (
    <div className="workflow-step-indicator">
      {steps.map((step, idx) => {
        const isCompleted = idx < stepIndex;
        const isActive = idx === stepIndex;
        const isLast = idx === steps.length - 1;

        return (
          <span key={step.key} className="step-wrapper">
            <div
              className={`step-badge ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
            >
              {isCompleted ? "✓" : idx + 1}
            </div>
            <span className={`step-label ${isActive ? "active" : ""}`}>
              {step.label}
            </span>
            {!isLast && (
              <div className={`step-connector ${isCompleted ? "completed" : ""}`} />
            )}
          </span>
        );
      })}
    </div>
  );
}

WorkflowStepIndicator.propTypes = {
  currentStep: PropTypes.string.isRequired,
};

function OrderCard({ order, isSelected, onSelect }) {
  // orcode in Supabase = hdocord.docointkey in MySQL
  const orderCode = order.docointkey || order.orcode;
  const statusLabel = STATUS_LABELS[order.estatus] || order.estatus || "Unknown";
  return (
    <div
      className={`order-card ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(order)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(order)}
    >
      <div className="order-card-header">
        <span className="order-code">{orderCode}</span>
        <span className={`order-status order-status--${order.estatus?.toLowerCase() || 'unknown'}`}>
          {statusLabel}
        </span>
      </div>
      <div className="order-card-body">
        <p className="order-desc">Lab/Radiology Order</p>
        <div className="order-meta">
          <span>📅 {order.ordate}</span>
          <span>🕐 {order.ortime}</span>
        </div>
      </div>
      {isSelected && <div className="order-selected-indicator">✓ Selected</div>}
    </div>
  );
}

OrderCard.propTypes = {
  order: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

function ProcedureCard({ procedure, isSelected, onSelect }) {
  // procode = actual lab test code (CBC, U/A, etc.)
  const procedureCode = procedure.chrgcod || procedure.procode;
  return (
    <div
      className={`procedure-card ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(procedure)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(procedure)}
    >
      <div className="procedure-card-header">
        <span className="procedure-code">{procedureCode}</span>
        <span className="procedure-status">{procedure.procedureStatus}</span>
      </div>
      <div className="procedure-card-body">
        <p className="procedure-desc">{procedure.procedureDescription || procedureCode}</p>
        <div className="procedure-meta">
          <span>{procedure.procdateFormatted || procedure.procedureDate}</span>
          <span>{procedure.proctimeFormatted || procedure.procedureTime}</span>
        </div>
      </div>
      {isSelected && (
        <div className="procedure-selected-indicator">✓ Selected</div>
      )}
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
    procedures,
    proceduresLoading,
    proceduresError,
    fetchProceduresForOrder,
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
  const [statusFilter, setStatusFilter] = useState("all"); // Status filter: all, S, C, P, R
  const [showPreview, setShowPreview] = useState(false); // PDF preview state
  const [activePreviewIndex, setActivePreviewIndex] = useState(0); // Which file to preview
  const fileInputRef = useRef(null);

  // ── Derived state ────────────────────────────────────────────
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
        status: statusFilter, // Pass status filter to API
        hpercode: contextParams?.hpercode || patient?.contextParams?.hpercode || null,
        contextParams,
      });
    } catch {
      // error handled by hook
    }
  }, [enccode, fetchOrdersForEncounter, contextParams, patient, statusFilter]);

  // ── Fetch procedures when order is selected ─────────────────
  const handleSelectOrder = useCallback(
    async (order) => {
      setSelectedOrder(order);
      setSelectedProcedure(null);
      if (enccode && order?.docointkey) {
        try {
          await fetchProceduresForOrder(enccode, order.docointkey, { contextParams });
        } catch {
          // error handled by hook
        }
      }
    },
    [enccode, fetchProceduresForOrder, setSelectedOrder, setSelectedProcedure, contextParams],
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
        // orcode in Supabase = hdocord.docointkey in MySQL
        const orderCode = selectedOrder?.docointkey || selectedOrder?.orcode;
        const result = await submitLabResult({
          file,
          contextParams: {
            ...contextParams,
            hpercode: contextParams?.hpercode || patient?.contextParams?.hpercode,
            enccode,
            orcode: orderCode,
            procode: selectedProcedure?.chrgcod,
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
    <div className="lab-workflow-panel">
      {/* Header */}
      <div className="workflow-header">
        <h2 className="workflow-title">Lab Result Upload</h2>
        <button
          type="button"
          className="btn-change-patient"
          onClick={onRequestPatientChange}
        >
          ← Change Patient
        </button>
      </div>

      {/* Patient / Encounter summary */}
      <div className="workflow-context-summary">
        <span className="context-chip patient">
          👤 {patient?.contextParams?.patlast || patient?.rawData?.patlast || "—"}
        </span>
        <span className="context-chip encounter">
          🏥 Encounter: {enccode}
        </span>
      </div>

      {/* Step indicator */}
      <WorkflowStepIndicator currentStep={currentStep} />

      {/* ── Step: Order Selection ─────────────────────────────── */}
      {currentStep === "order" && (
        <div className="workflow-step order-step">
          <div className="step-header">
            <h3>Select Order</h3>
            <div className="step-header-actions">
              <select
                className="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="S">Scheduled</option>
                <option value="P">Pending</option>
                <option value="C">Completed</option>
                <option value="R">Resulted</option>
                <option value="X">Cancelled</option>
              </select>
              <button
                type="button"
                className="btn-fetch-orders"
                onClick={handleFetchOrders}
                disabled={ordersLoading || !enccode}
              >
                {ordersLoading ? "Loading..." : "Load Orders"}
              </button>
            </div>
          </div>

          {ordersError && (
            <div className="step-error">
              ⚠️ {ordersError}
              <button
                type="button"
                className="btn-retry"
                onClick={handleFetchOrders}
              >
                Retry
              </button>
            </div>
          )}

          {ordersLoading && (
            <div className="step-loading">
              <span className="spinner" />
              Loading orders...
            </div>
          )}

          {!ordersLoading && orders.length === 0 && !ordersError && (
            <div className="step-empty">
              No orders found for this encounter.
              <br />
              Click &quot;Load Orders&quot; to search.
            </div>
          )}

          {orders.length > 0 && (
            <div className="order-list">
              {orders.map((order) => (
                <OrderCard
                  key={order.docointkey}
                  order={order}
                  isSelected={selectedOrder?.docointkey === order.docointkey}
                  onSelect={handleSelectOrder}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Step: Procedure Selection ─────────────────────────── */}
      {currentStep === "procedure" && (
        <div className="workflow-step procedure-step">
          <div className="step-header">
            <h3>Select Procedure</h3>
            <button
              type="button"
              className="btn-back"
              onClick={() => {
                setSelectedOrder(null);
                setSelectedProcedure(null);
              }}
            >
              ← Back to Orders
            </button>
          </div>

          <div className="selected-order-badge">
            Order: {selectedOrder?.docointkey}
          </div>

          {proceduresError && (
            <div className="step-error">
              ⚠️ {proceduresError}
            </div>
          )}

          {proceduresLoading && (
            <div className="step-loading">
              <span className="spinner" />
              Loading procedures...
            </div>
          )}

          {!proceduresLoading && procedures.length === 0 && !proceduresError && (
            <div className="step-empty">
              No procedures found for this order.
              <br />
              You can proceed without selecting a procedure.
              <button
                type="button"
                className="btn-skip-procedure"
                onClick={() => setSelectedProcedure(null)}
              >
                Continue without procedure →
              </button>
            </div>
          )}

          {procedures.length > 0 && (
            <div className="procedure-list">
              {procedures.map((proc) => (
                <ProcedureCard
                  key={proc.procedureInstanceId}
                  procedure={proc}
                  isSelected={selectedProcedure?.procedureInstanceId === proc.procedureInstanceId}
                  onSelect={setSelectedProcedure}
                />
              ))}
            </div>
          )}

          <div className="procedure-skip-row">
            <button
              type="button"
              className="btn-skip-procedure"
              onClick={() => setSelectedProcedure(null)}
            >
              Skip / Continue without procedure →
            </button>
          </div>
        </div>
      )}

      {/* ── Step: Upload ─────────────────────────────────────── */}
      {currentStep === "upload" && (
        <div className="workflow-step upload-step">
          <div className="step-header">
            <h3>Upload Lab Result</h3>
            <button
              type="button"
              className="btn-back"
              onClick={() => setSelectedProcedure(null)}
            >
              ← Back
            </button>
          </div>

          <div className="upload-context-summary">
            {selectedOrder && (
              <span className="context-chip">
                📋 Order: {selectedOrder.oritem}
              </span>
            )}
            {selectedProcedure && (
              <span className="context-chip">
                💉 Procedure: {selectedProcedure.procedureDescription}
              </span>
            )}
          </div>

          {/* File drop zone */}
          <div
            className={`file-drop-zone ${dragActive ? "drag-active" : ""} ${selectedFiles.length > 0 ? "has-files" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
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
              <div className="drop-zone-empty">
                <span className="drop-icon">📄</span>
                <p>Drop PDF file(s) here or click to browse</p>
              </div>
            ) : (
              <div className="selected-files-list">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="selected-file-item">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <button
                      type="button"
                      className="btn-preview-file"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePreviewIndex(idx);
                        setShowPreview(true);
                      }}
                    >
                      👁️ Preview
                    </button>
                    <button
                      type="button"
                      className="btn-remove-file"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(idx);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PDF Preview Panel */}
          {showPreview && selectedFiles.length > 0 && (
            <div className="pdf-preview-section">
              <div className="pdf-preview-header">
                <h4>PDF Preview: {selectedFiles[activePreviewIndex]?.name}</h4>
                <button
                  type="button"
                  className="btn-close-preview"
                  onClick={() => setShowPreview(false)}
                >
                  ✕ Close
                </button>
              </div>
              <div className="pdf-preview-container">
                <PdfCanvasPreview
                  file={selectedFiles[activePreviewIndex]}
                  token={LAB_UPLOAD_API_TOKEN}
                />
              </div>
            </div>
          )}

          {/* Remarks */}
          <div className="upload-remarks">
            <label htmlFor="remarks">Remarks (optional):</label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter any remarks about this upload..."
              rows={2}
            />
          </div>

          {/* Upload error */}
          {(uploadError || workflowError) && (
            <div className="upload-error">
              ⚠️ {uploadError || workflowError}
            </div>
          )}

          {/* Upload button */}
          <button
            type="button"
            className="btn-upload-submit"
            onClick={handleUploadSubmit}
            disabled={uploadSubmitting || uploading || selectedFiles.length === 0}
          >
            {uploadSubmitting || uploading
              ? "Uploading..."
              : `Upload ${selectedFiles.length > 0 ? `(${selectedFiles.length} file(s))` : ""}`}
          </button>

          {/* Uploaded results */}
          {uploadResults.length > 0 && (
            <div className="upload-results">
              <h4>Uploaded Results</h4>
              {uploadResults.map((result, idx) => (
                <div key={idx} className="upload-result-item">
                  <div className="result-item-header">
                    <span className="result-file-name">{result.fileName}</span>
                    <span className="result-docointkey">
                      Docointkey: <strong>{result.docointkey}</strong>
                    </span>
                  </div>
                  <div className="result-item-url">
                    <a
                      href={result.uploadedPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View PDF ↗
                    </a>
                  </div>
                  <div className="result-item-time">
                    Uploaded: {new Date(result.submittedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Start new upload */}
          {uploadResults.length > 0 && (
            <button
              type="button"
              className="btn-reset-workflow"
              onClick={handleReset}
            >
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
};
