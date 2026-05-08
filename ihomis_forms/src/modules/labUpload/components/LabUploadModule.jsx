import PropTypes from "prop-types";
import { useCallback, useEffect, useState } from "react";
import { fetchEncounterOrders, fetchPatientUploadedFiles } from "../api/labUploadApi.js";
import { LAB_UPLOAD_API_TOKEN } from "../labUploadConfig.js";
import LabReviewPanel from "./LabReviewPanel.jsx";

// ── Patient Avatar ─────────────────────────────────────────────────────────────
function getInitials(displayName) {
  const parts = (displayName || "?").trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

function getAvatarColor(id) {
  const colors = [
    "#1f9d95",
    "#3a8f7a",
    "#5b7fcb",
    "#8b5dcb",
    "#cb5b8f",
    "#cb8b5b",
    "#5bcb7a",
    "#7a8f3a",
  ];
  let hash = 0;
  for (let i = 0; i < (id || "").length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return colors[Math.abs(hash) % colors.length];
}

function PatientBadge({ patient }) {
  const displayName = patient?.displayName || "Unknown Patient";
  const id = patient?.id || "";
  const hpercode = patient?.contextParams?.hpercode || patient?.rawData?.hpercode || "";

  return (
    <div className="lab-hero-patient">
      <div
        className="lab-hero-patient-avatar"
        style={{ background: getAvatarColor(id) }}
      >
        {getInitials(displayName)}
      </div>
      <div className="lab-hero-patient-info">
        <span className="lab-hero-patient-label">Patient</span>
        <span className="lab-hero-patient-name">{displayName}</span>
      </div>
      {hpercode && (
        <span className="enc-modal-hper">{hpercode}</span>
      )}
    </div>
  );
}

PatientBadge.propTypes = {
  patient: PropTypes.shape({
    id: PropTypes.string,
    displayName: PropTypes.string,
    rawData: PropTypes.object,
    contextParams: PropTypes.shape({
      hpercode: PropTypes.string,
    }),
  }),
};

// ── Step Indicator ───────────────────────────────────────────────────────────
const WORKFLOW_STEPS = [
  { id: "orderType", label: "Order Type", icon: "📋" },
  { id: "labTests", label: "Lab Tests", icon: "🧪" },
  { id: "upload", label: "Upload", icon: "📄" },
  { id: "review", label: "Review", icon: "✅" },
];

function StepIndicator({ currentStep, completedSteps }) {
  return (
    <div className="lum-step-indicator" role="list" aria-label="Workflow steps">
      {WORKFLOW_STEPS.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = step.id === currentStep;

        return (
          <div
            key={step.id}
            className={`lum-step ${isCurrent ? "lum-step--current" : ""} ${isCompleted ? "lum-step--completed" : ""}`}
            role="listitem"
            aria-current={isCurrent ? "step" : undefined}
          >
            <div className="lum-step-btn">
              <span className="lum-step-icon">{step.icon}</span>
              <span className="lum-step-label">{step.label}</span>
            </div>
            {index < WORKFLOW_STEPS.length - 1 && (
              <div
                className={`lum-step-connector ${isCompleted ? "lum-step-connector--active" : ""}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

StepIndicator.propTypes = {
  currentStep: PropTypes.string.isRequired,
  completedSteps: PropTypes.arrayOf(PropTypes.string).isRequired,
};

// ── Order Type Selection ──────────────────────────────────────────────────────
const ORDER_TYPES = [
  {
    code: "LABOR",
    label: "Laboratory",
    icon: "🔬",
    description: "Laboratory test results",
  },
  {
    code: "RADIO",
    label: "Radiology",
    icon: "📷",
    description: "X-ray, ultrasound, CT scan results",
  },
];

function OrderTypeStep({ selectedType, onSelect, onNext }) {
  return (
    <div className="lum-step-content">
      <h2 className="lum-step-title">Select Order Type</h2>
      <p className="lum-step-desc">
        Choose the type of order results you are uploading.
      </p>
      <div className="lum-order-types">
        {ORDER_TYPES.map((type) => (
          <button
            key={type.code}
            type="button"
            className={`lum-order-card ${selectedType === type.code ? "lum-order-card--selected" : ""}`}
            onClick={() => onSelect(type.code)}
          >
            <span className="lum-order-icon">{type.icon}</span>
            <span className="lum-order-label">{type.label}</span>
            <span className="lum-order-desc">{type.description}</span>
          </button>
        ))}
      </div>
      <div className="lum-step-actions">
        <button
          type="button"
          className="lum-btn lum-btn--primary"
          onClick={onNext}
          disabled={!selectedType}
        >
          Continue to Lab Tests
        </button>
      </div>
    </div>
  );
}

OrderTypeStep.propTypes = {
  selectedType: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
};

// ── Lab Tests Selection ───────────────────────────────────────────────────────
function LabTestsStep({
  enccode,
  hpercode,
  orderType,
  selectedProcs,
  onToggleProc,
  onNext,
  onBack,
  onLoadOrders,
  orders,
  ordersLoading,
  ordersError,
  statusFilter,
  onStatusFilterChange,
}) {
  useEffect(() => {
    if (enccode && orderType) {
      onLoadOrders(enccode, orderType, hpercode, statusFilter);
    }
  }, [enccode, hpercode, onLoadOrders, orderType, statusFilter]);

  return (
    <div className="lum-step-content">
      <h2 className="lum-step-title">Select Lab Tests</h2>
      <p className="lum-step-desc">
        Choose the tests you are uploading results for.
      </p>

      {/* Status Filter */}
      <div className="lum-status-filter-wrap">
        <label htmlFor="status-filter" className="lum-status-filter-label">Filter by Status:</label>
        <select
          id="status-filter"
          className="lum-status-filter"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
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
          className="lum-btn lum-btn--secondary"
          onClick={() => onLoadOrders(enccode, orderType, hpercode, statusFilter)}
          disabled={ordersLoading}
        >
          Refresh
        </button>
      </div>

      {ordersLoading && (
        <div className="lum-loading">
          <div className="lum-spinner" aria-hidden="true" />
          <span>Loading orders...</span>
        </div>
      )}

      {ordersError && (
        <div className="lum-alert lum-alert--error" role="alert">
          <svg
            viewBox="0 0 20 20"
            width="16"
            height="16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-1 1v4a1 1 0 0 0 .293.707l2.828 2.829a1 1 0 1 0 1.414-1.415L11 9.586V5a1 1 0 0 0-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {ordersError}
        </div>
      )}

      {!ordersLoading && !ordersError && orders.length === 0 && (
        <div className="lum-empty">
          <span className="lum-empty-icon">📋</span>
          <p>No orders found for this encounter.</p>
        </div>
      )}

      {!ordersLoading && orders.length > 0 && (
        <div className="lum-order-list">
          {orders.map((order) => {
            const isSelected = selectedProcs.includes(order.docointkey);
            return (
              <button
                key={order.docointkey}
                type="button"
                className={`lum-order-item ${isSelected ? "lum-order-item--selected" : ""}`}
                onClick={() => onToggleProc(order.docointkey)}
                aria-pressed={isSelected}
              >
                <div className="lum-order-check">
                  {isSelected ? (
                    <svg
                      viewBox="0 0 20 20"
                      width="16"
                      height="16"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 20 20"
                      width="16"
                      height="16"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM9.555 7.168A1 1 0 0 0 8 8v4a1 1 0 0 0 1.555.832l3-2a1 1 0 0 0 0-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="lum-order-info">
                  <span className="lum-order-proc">{order.proccode}</span>
                  <span className="lum-order-desc">{order.procedureDescription}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="lum-step-actions">
        <button
          type="button"
          className="lum-btn lum-btn--secondary"
          onClick={onBack}
        >
          Back
        </button>
        <button
          type="button"
          className="lum-btn lum-btn--primary"
          onClick={onNext}
          disabled={selectedProcs.length === 0}
        >
          Continue to Upload ({selectedProcs.length} selected)
        </button>
      </div>
    </div>
  );
}

LabTestsStep.propTypes = {
  enccode: PropTypes.string,
  hpercode: PropTypes.string,
  orderType: PropTypes.string,
  selectedProcs: PropTypes.arrayOf(PropTypes.string).isRequired,
  onToggleProc: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onLoadOrders: PropTypes.func.isRequired,
  orders: PropTypes.array.isRequired,
  ordersLoading: PropTypes.bool.isRequired,
  ordersError: PropTypes.string,
  statusFilter: PropTypes.string,
  onStatusFilterChange: PropTypes.func.isRequired,
};

// ── Upload Step ────────────────────────────────────────────────────────────────
function UploadStep({
  selectedProcs,
  orders,
  uploads,
  onFileChange,
  onRemoveFile,
  onComplete,
  onBack,
}) {
  return (
    <div className="lum-step-content">
      <h2 className="lum-step-title">Upload Results</h2>
      <p className="lum-step-desc">Upload PDF files for the selected tests.</p>

      <div className="lum-upload-list">
        {selectedProcs.map((docointkey) => {
          const order = orders.find((o) => o.docointkey === docointkey);
          const upload = uploads.find((u) => u.docointkey === docointkey);

          return (
            <div key={docointkey} className="lum-upload-item">
              <div className="lum-upload-info">
                <span className="lum-upload-proc">
                  {order?.proccode || docointkey}
                </span>
                <span className="lum-upload-desc">
                  {order?.procedureDescription || "Unknown test"}
                </span>
              </div>
              <div className="lum-upload-action">
                {upload ? (
                  <div className="lum-upload-complete">
                    <svg
                      viewBox="0 0 20 20"
                      width="16"
                      height="16"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{upload.fileName}</span>
                    <button
                      type="button"
                      className="lum-upload-remove"
                      onClick={() => onRemoveFile(docointkey)}
                      aria-label="Remove file"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        width="14"
                        height="14"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414z" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="lum-upload-btn">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) =>
                        onFileChange(docointkey, e.target.files?.[0])
                      }
                      aria-label={`Upload PDF for ${order?.procdesc || docointkey}`}
                    />
                    <svg
                      viewBox="0 0 20 20"
                      width="16"
                      height="16"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zM6.293 6.707a1 1 0 0 1 1.414-1.414l3 3a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414-1.414L8.586 8 6.293 5.707a1 1 0 0 1 0-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Choose PDF
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="lum-step-actions">
        <button
          type="button"
          className="lum-btn lum-btn--secondary"
          onClick={onBack}
        >
          Back
        </button>
        <button
          type="button"
          className="lum-btn lum-btn--primary"
          onClick={onComplete}
          disabled={uploads.length !== selectedProcs.length}
        >
          Complete Upload
        </button>
      </div>
    </div>
  );
}

UploadStep.propTypes = {
  selectedProcs: PropTypes.arrayOf(PropTypes.string).isRequired,
  orders: PropTypes.array.isRequired,
  uploads: PropTypes.array.isRequired,
  onFileChange: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

// ── Review Step with PDF Preview & Uploaded Files ─────────────────────────────
function ReviewStep({ 
  patient, 
  encounter, 
  orderType, 
  uploads, 
  onFinish,
  uploadedFiles = [],
  activePreviewFile,
  activePreviewUrl,
  onOpenFullscreen,
  onClearPdfSelection,
  onShowLocalPreview,
  onShowUploadedPreview,
  onPreviewUploadedFile,
  reviewSource,
  activeUploadedFileIndex,
}) {
  const orderTypeLabel =
    ORDER_TYPES.find((t) => t.code === orderType)?.label || orderType;

  const hasLocalPreview = uploads.length > 0;
  const hasUploadedPreview = uploadedFiles.length > 0;
  const hasActivePreview = Boolean(activePreviewFile || activePreviewUrl);
  const hasAnyPdf = hasLocalPreview || hasUploadedPreview;

  return (
    <div className="lum-step-content lum-review-step">
      <div className="lum-review-main">
        <div className="lum-review-success">
          <svg
            viewBox="0 0 20 20"
            width="48"
            height="48"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <h2>Upload Complete!</h2>
          <p>{uploads.length} file(s) uploaded successfully.</p>
        </div>

        <div className="lum-review-summary">
          <h3>Summary</h3>
          <div className="lum-summary-item">
            <span className="lum-summary-label">Patient</span>
            <span className="lum-summary-value">
              {patient?.displayName || "Unknown"}
            </span>
          </div>
          <div className="lum-summary-item">
            <span className="lum-summary-label">Encounter</span>
            <span className="lum-summary-value">
              {encounter?.enccode || "Unknown"}
            </span>
          </div>
          <div className="lum-summary-item">
            <span className="lum-summary-label">Order Type</span>
            <span className="lum-summary-value">{orderTypeLabel}</span>
          </div>
          <div className="lum-summary-item">
            <span className="lum-summary-label">Files Uploaded</span>
            <span className="lum-summary-value">{uploads.length}</span>
          </div>
        </div>

        <div className="lum-review-files">
          <h3>Uploaded Files</h3>
          {uploads.map((upload) => (
            <div key={upload.docointkey} className="lum-review-file">
              <svg
                viewBox="0 0 20 20"
                width="16"
                height="16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 0 1 2-2h4.586A2 2 0 0 1 12 2.586L15.414 6A2 2 0 0 1 16 7.414V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{upload.fileName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PDF Preview Section */}
      <div className="lum-review-panel">
        <LabReviewPanel
          uploadedFiles={uploadedFiles}
          reviewSource={reviewSource}
          activeUploadedFileIndex={activeUploadedFileIndex}
          hasLocalPreview={hasLocalPreview}
          hasUploadedPreview={hasUploadedPreview}
          hasActivePreview={hasActivePreview}
          hasAnyPdf={hasAnyPdf}
          activePreviewFile={activePreviewFile}
          activePreviewUrl={activePreviewUrl}
          token={LAB_UPLOAD_API_TOKEN}
          onOpenFullscreen={onOpenFullscreen}
          onClearPdfSelection={onClearPdfSelection}
          onShowLocalPreview={onShowLocalPreview}
          onShowUploadedPreview={onShowUploadedPreview}
          onPreviewUploadedFile={onPreviewUploadedFile}
        />
      </div>

      <div className="lum-step-actions">
        <button
          type="button"
          className="lum-btn lum-btn--primary"
          onClick={onFinish}
        >
          Start New Upload
        </button>
      </div>
    </div>
  );
}

ReviewStep.propTypes = {
  patient: PropTypes.shape({
    displayName: PropTypes.string,
  }),
  encounter: PropTypes.shape({
    enccode: PropTypes.string,
  }),
  orderType: PropTypes.string.isRequired,
  uploads: PropTypes.array.isRequired,
  onFinish: PropTypes.func.isRequired,
  uploadedFiles: PropTypes.array,
  activePreviewFile: PropTypes.object,
  activePreviewUrl: PropTypes.string,
  onOpenFullscreen: PropTypes.func,
  onClearPdfSelection: PropTypes.func,
  onShowLocalPreview: PropTypes.func,
  onShowUploadedPreview: PropTypes.func,
  onPreviewUploadedFile: PropTypes.func,
  reviewSource: PropTypes.string,
  activeUploadedFileIndex: PropTypes.number,
};

// ── Main Module ───────────────────────────────────────────────────────────────
function LabUploadModule({ selectedPatient, selectedContextParams }) {
  const [currentStep, setCurrentStep] = useState("orderType");
  const [completedSteps, setCompletedSteps] = useState([]);
  const [orderType, setOrderType] = useState("");
  const [selectedProcs, setSelectedProcs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [uploads, setUploads] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  // PDF Preview & Uploaded Files State
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [reviewSource, setReviewSource] = useState("local"); // "local" or "uploaded"
  const [activeUploadedFileIndex, setActiveUploadedFileIndex] = useState(-1);
  const [activePreviewUrl, setActivePreviewUrl] = useState("");

  const hpercode = selectedContextParams?.hpercode || selectedPatient?.id || "";
  const enccode = selectedContextParams?.enccode || selectedContextParams?.enc || "";

  // Load uploaded files when entering review step
  useEffect(() => {
    if (currentStep === "review" && hpercode) {
      loadUploadedFiles();
    }
  }, [currentStep, hpercode]);

  const loadUploadedFiles = async () => {
    if (!hpercode) return;

    try {
      const response = await fetchPatientUploadedFiles({
        hpercode,
        enccode: enccode || null,
        token: LAB_UPLOAD_API_TOKEN,
      });

      const files = response.data.map((file) => ({
        id: file.id,
        docointkey: file.docointkey,
        fileName: file.fileName || file.file_name,
        fileSize: file.fileSize || file.file_size,
        fileUrl: file.fileUrl || file.file_url,
        previewUrl: file.fileUrl || file.file_url,
        uploadedAt: file.uploadedAt || file.uploaded_at,
        uploadedAtLabel: file.uploadedAt 
          ? new Date(file.uploadedAt).toLocaleString() 
          : file.uploaded_at 
            ? new Date(file.uploaded_at).toLocaleString() 
            : "Unknown",
      }));

      setUploadedFiles(files);
    } catch (err) {
      console.error("Failed to load uploaded files:", err);
      setUploadedFiles([]);
    }
  };

  const handleOpenFullscreen = () => {
    // Open fullscreen preview in new window/tab
    if (activePreviewUrl) {
      window.open(activePreviewUrl, "_blank");
    }
  };

  const handleClearPdfSelection = () => {
    setActivePreviewUrl("");
    setActiveUploadedFileIndex(-1);
    setReviewSource("local");
  };

  const handleShowLocalPreview = () => {
    setReviewSource("local");
    setActiveUploadedFileIndex(-1);
  };

  const handleShowUploadedPreview = () => {
    setReviewSource("uploaded");
    if (uploadedFiles.length > 0) {
      setActiveUploadedFileIndex(0);
      setActivePreviewUrl(uploadedFiles[0].previewUrl || "");
    }
  };

  const handlePreviewUploadedFile = (index) => {
    setReviewSource("uploaded");
    setActiveUploadedFileIndex(index);
    if (uploadedFiles[index]) {
      setActivePreviewUrl(uploadedFiles[index].previewUrl || "");
    }
  };

  const markStepComplete = (stepId) => {
    setCompletedSteps((prev) => [...new Set([...prev, stepId])]);
  };

  const handleOrderTypeSelect = (type) => {
    setOrderType(type);
  };

  const handleOrderTypeNext = () => {
    if (orderType) {
      markStepComplete("orderType");
      setCurrentStep("labTests");
    }
  };

  const handleToggleProc = (docointkey) => {
    setSelectedProcs((prev) =>
      prev.includes(docointkey)
        ? prev.filter((k) => k !== docointkey)
        : [...prev, docointkey],
    );
  };

  const handleLabTestsNext = () => {
    if (selectedProcs.length > 0) {
      markStepComplete("labTests");
      setCurrentStep("upload");
    }
  };

  const handleLabTestsBack = () => {
    setCurrentStep("orderType");
  };

  const loadOrders = useCallback(async (enc, type, hpercode, status = "all") => {
    if (!enc) return;

    setOrdersLoading(true);
    setOrdersError("");

    try {
      // Backend expects: 'lab' for LABOR, 'rad' for RADIO
      const orderTypeCode = type === "RADIO" ? "rad" : "lab";
      const response = await fetchEncounterOrders({
        enccode: enc,
        hpercode: hpercode,
        type: orderTypeCode,
        status: status, // Pass status filter to backend
        token: LAB_UPLOAD_API_TOKEN,
      });

      // API returns orders in response.data
      setOrders(response.data || []);
    } catch (err) {
      setOrdersError(
        err instanceof Error ? err.message : "Failed to load orders",
      );
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const handleFileChange = (docointkey, file) => {
    if (!file) return;

    setUploads((prev) => {
      const existing = prev.find((u) => u.docointkey === docointkey);
      if (existing) {
        return prev.map((u) =>
          u.docointkey === docointkey ? { ...u, file, fileName: file.name } : u,
        );
      }
      return [...prev, { docointkey, file, fileName: file.name }];
    });
  };

  const handleRemoveFile = (docointkey) => {
    setUploads((prev) => prev.filter((u) => u.docointkey !== docointkey));
  };

  const handleComplete = () => {
    markStepComplete("upload");
    setCurrentStep("review");
  };

  const handleUploadBack = () => {
    setCurrentStep("labTests");
  };

  const handleReviewFinish = () => {
    setCurrentStep("orderType");
    setCompletedSteps([]);
    setOrderType("");
    setSelectedProcs([]);
    setOrders([]);
    setUploads([]);
  };

  return (
    <div className="lab-page">
      <div className="lab-ambient lab-ambient-a" aria-hidden="true" />
      <div className="lab-ambient lab-ambient-b" aria-hidden="true" />
      
      <div className="lab-layout">
        {/* Hero Header with Patient Info */}
        <div className="lab-hero-wrap">
          <div className="lab-hero">
            <div className="lab-hero-left">
              <div className="lab-hero-eyebrow">
                <span className="lab-hero-system">Lab Upload</span>
                <div className={`lab-hero-status ${currentStep === "review" ? "lab-hero-status--ready" : "lab-hero-status--loading"}`}>
                  <span className="lab-hero-status-dot" />
                  {currentStep === "review" ? "Complete" : "In Progress"}
                </div>
              </div>
              <h1 className="lab-hero-title">
                Upload <span className="lab-hero-panel-name">Laboratory Results</span>
              </h1>
              <p className="lab-hero-meta">
                Upload and manage laboratory test results for patient encounters.
              </p>
            </div>
            <div className="lab-hero-right">
              <PatientBadge patient={selectedPatient} />
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator
          currentStep={currentStep}
          completedSteps={completedSteps}
        />

        {/* Step Content */}
        {currentStep === "orderType" && (
          <div className="lab-panel">
            <OrderTypeStep
              selectedType={orderType}
              onSelect={handleOrderTypeSelect}
              onNext={handleOrderTypeNext}
            />
          </div>
        )}

        {currentStep === "labTests" && (
          <div className="lab-panel">
            <LabTestsStep
              enccode={enccode}
              hpercode={selectedContextParams?.hpercode}
              orderType={orderType}
              selectedProcs={selectedProcs}
              onToggleProc={handleToggleProc}
              onNext={handleLabTestsNext}
              onBack={handleLabTestsBack}
              onLoadOrders={loadOrders}
              orders={orders}
              ordersLoading={ordersLoading}
              ordersError={ordersError}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
          </div>
        )}

        {currentStep === "upload" && (
          <div className="lab-panel">
            <UploadStep
              selectedProcs={selectedProcs}
              orders={orders}
              uploads={uploads}
              onFileChange={handleFileChange}
              onRemoveFile={handleRemoveFile}
              onComplete={handleComplete}
              onBack={handleUploadBack}
            />
          </div>
        )}

        {currentStep === "review" && (
          <div className="lab-panel">
            <ReviewStep
              patient={selectedPatient}
              encounter={selectedContextParams}
              orderType={orderType}
              uploads={uploads}
              onFinish={handleReviewFinish}
              uploadedFiles={uploadedFiles}
              activePreviewFile={null}
              activePreviewUrl={activePreviewUrl}
              onOpenFullscreen={handleOpenFullscreen}
              onClearPdfSelection={handleClearPdfSelection}
              onShowLocalPreview={handleShowLocalPreview}
              onShowUploadedPreview={handleShowUploadedPreview}
              onPreviewUploadedFile={handlePreviewUploadedFile}
              reviewSource={reviewSource}
              activeUploadedFileIndex={activeUploadedFileIndex}
            />
          </div>
        )}
      </div>
    </div>
  );
}

LabUploadModule.propTypes = {
  selectedPatient: PropTypes.shape({
    id: PropTypes.string,
    displayName: PropTypes.string,
    rawData: PropTypes.object,
    contextParams: PropTypes.shape({
      enccode: PropTypes.string,
      enc: PropTypes.string,
      hpercode: PropTypes.string,
    }),
  }),
  selectedContextParams: PropTypes.shape({
    enccode: PropTypes.string,
    enc: PropTypes.string,
    hpercode: PropTypes.string,
  }),
};

export default LabUploadModule;
