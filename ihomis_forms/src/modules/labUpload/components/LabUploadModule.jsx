/**
 * LabUploadModule
 * 
 * Complete Lab Result Upload Workflow
 * 
 * Flow:
 *   1. Patient Picker → Select patient
 *   2. Encounter Selection → Select encounter (enccode)
 *   3. Order Selection → Select ORCODE (LABOR/RADIO) from hdocord
 *   4. Procedure Selection → Select PROCCODE (lab tests) from hdocord.proccode → hprocm.procdesc
 *   5. Upload Phase → Upload PDF per PROCCODE
 *   6. Finalize → All uploads tied to DOCOINTKEY
 * 
 * Backend Data Sources:
 *   - MySQL hdocord: enccode, orcode (LABOR/RADIO), proccode, docointkey
 *   - MySQL hprocm: proccode → procdesc (procedure descriptions)
 *   - Supabase lab_result_uploads: stores upload metadata with docointkey
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { 
  fetchPatientEncounters, 
  fetchEncounterOrders,
  uploadMappedLabResult 
} from "../api/labUploadApi.js";
import { LAB_UPLOAD_API_TOKEN } from "../labUploadConfig.js";
import "./LabUploadModule.css";

// ── Step Configuration ─────────────────────────────────────────
const WORKFLOW_STEPS = {
  PATIENT: "patient",
  ENCOUNTER: "encounter", 
  ORDER: "order",       // ORCODE selection (LABOR/RADIO)
  PROCEDURE: "procedure", // PROCCODE selection (actual lab tests)
  UPLOAD: "upload",
  REVIEW: "review"
};

const STEP_ORDER = [
  { key: WORKFLOW_STEPS.PATIENT, label: "Patient", icon: "👤" },
  { key: WORKFLOW_STEPS.ENCOUNTER, label: "Encounter", icon: "🏥" },
  { key: WORKFLOW_STEPS.ORDER, label: "Order Type", icon: "📋" },
  { key: WORKFLOW_STEPS.PROCEDURE, label: "Lab Tests", icon: "🧪" },
  { key: WORKFLOW_STEPS.UPLOAD, label: "Upload", icon: "📄" },
  { key: WORKFLOW_STEPS.REVIEW, label: "Review", icon: "✅" },
];

// ── Step Indicator Component ───────────────────────────────────
function StepIndicator({ currentStep, completedSteps }) {
  const currentIndex = STEP_ORDER.findIndex(s => s.key === currentStep);
  
  return (
    <div className="step-indicator">
      {STEP_ORDER.map((step, idx) => {
        const isCompleted = completedSteps.includes(step.key);
        const isActive = step.key === currentStep;
        const isPast = idx < currentIndex;
        
        return (
          <div key={step.key} className="step-item">
            <div className={`step-circle ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
              {isCompleted ? "✓" : step.icon}
            </div>
            <span className={`step-label ${isActive ? 'active' : ''}`}>{step.label}</span>
            {idx < STEP_ORDER.length - 1 && (
              <div className={`step-line ${isPast || isCompleted ? 'completed' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Patient Picker Component ───────────────────────────────────
function PatientPickerPanel({ onPatientSelect, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchTimeout = useRef(null);

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setPatients([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to fetch from the patient search endpoint
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_LAB_PATIENT_SEARCH_URL || "";
      const url = `${baseUrl.replace(/\/+$/, "")}/patients?q=${encodeURIComponent(query)}&limit=20`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Search failed");
      
      const data = await response.json();
      const patientList = Array.isArray(data) ? data : (data?.data || []);
      setPatients(patientList);
    } catch (err) {
      // Fallback: try simple patient list
      try {
        const baseUrl = import.meta.env.VITE_API_URL || "";
        const url = `${baseUrl.replace(/\/+$/, "")}/api/db/patients?q=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json();
        const patientList = Array.isArray(data) ? data : (data?.data || []);
        setPatients(patientList);
      } catch {
        setError("Failed to search patients. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  const handleSelectPatient = (patient) => {
    const hpercode = patient.hpercode || patient.hpercode;
    const name = [patient.patlast, patient.patfirst, patient.patmiddle]
      .filter(Boolean)
      .join(", ");
    
    onPatientSelect({
      hpercode,
      name: name || `Patient ${hpercode}`,
      rawData: patient
    });
  };

  return (
    <div className="panel patient-picker-panel">
      <div className="panel-header">
        <h2>🔍 Select Patient</h2>
        <button className="btn-close" onClick={onClose}>×</button>
      </div>
      
      <div className="search-box">
        <input
          type="text"
          placeholder="Search by name or patient ID..."
          value={searchQuery}
          onChange={handleSearchChange}
          autoFocus
        />
      </div>

      {loading && (
        <div className="loading-state">
          <span className="spinner"></span> Searching...
        </div>
      )}

      {error && (
        <div className="error-state">
          ⚠️ {error}
        </div>
      )}

      <div className="patient-list">
        {patients.length === 0 && !loading && searchQuery && (
          <div className="empty-state">
            No patients found matching "{searchQuery}"
          </div>
        )}
        
        {patients.map((patient, idx) => {
          const hpercode = patient.hpercode || patient.id || "";
          const name = [
            patient.patlast || patient.lastName,
            patient.patfirst || patient.firstName,
            patient.patmiddle || patient.middleName
          ].filter(Boolean).join(", ") || "Unknown";
          
          return (
            <div 
              key={hpercode || idx} 
              className="patient-card"
              onClick={() => handleSelectPatient(patient)}
            >
              <div className="patient-avatar">👤</div>
              <div className="patient-info">
                <div className="patient-name">{name}</div>
                <div className="patient-id">ID: {hpercode}</div>
              </div>
              <div className="patient-action">Select →</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Encounter Selection Component ───────────────────────────────
function EncounterSelectionPanel({ patient, onSelect, onBack, onClose }) {
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEncounters = async () => {
      if (!patient?.hpercode) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await fetchPatientEncounters({
          hpercode: patient.hpercode,
          token: LAB_UPLOAD_API_TOKEN
        });
        setEncounters(result.encounters || []);
      } catch (err) {
        setError(err.message || "Failed to load encounters");
      } finally {
        setLoading(false);
      }
    };

    loadEncounters();
  }, [patient?.hpercode]);

  return (
    <div className="panel encounter-selection-panel">
      <div className="panel-header">
        <h2>🏥 Select Encounter</h2>
        <button className="btn-close" onClick={onClose}>×</button>
      </div>

      <div className="patient-summary">
        <span className="patient-badge">👤 {patient.name}</span>
        <span className="patient-id-badge">ID: {patient.hpercode}</span>
      </div>

      {loading && (
        <div className="loading-state">
          <span className="spinner"></span> Loading encounters...
        </div>
      )}

      {error && (
        <div className="error-state">
          ⚠️ {error}
          <button className="btn-retry" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}

      {!loading && encounters.length === 0 && !error && (
        <div className="empty-state">
          No encounters found for this patient.
        </div>
      )}

      <div className="encounter-list">
        {encounters.map((enc, idx) => (
          <div 
            key={enc.enccode || idx}
            className="encounter-card"
            onClick={() => onSelect(enc)}
          >
            <div className="encounter-header">
              <span className="encounter-type">{enc.encounterType || "Encounter"}</span>
              <span className="encounter-date">{enc.admissionDate}</span>
            </div>
            <div className="encounter-id">Code: {enc.enccode}</div>
            <div className="encounter-details">
              {enc.dischargeDate && <span>Discharge: {enc.dischargeDate}</span>}
            </div>
            <div className="encounter-action">Select →</div>
          </div>
        ))}
      </div>

      <div className="panel-footer">
        <button className="btn-back" onClick={onBack}>← Back to Patient Search</button>
      </div>
    </div>
  );
}

// ── Order Type Selection Component ─────────────────────────────
function OrderTypePanel({ encounter, onSelect, onBack }) {
  // Order types are fetched from hdocord.orcode
  // LABOR = Laboratory, RADIO = Radiology
  const orderTypes = [
    { 
      code: "LABOR", 
      label: "Laboratory", 
      description: "Laboratory test orders",
      icon: "🧪",
      color: "#3b82f6"
    },
    { 
      code: "RADIO", 
      label: "Radiology", 
      description: "Radiology/imaging orders",
      icon: "📷",
      color: "#8b5cf6"
    }
  ];

  const handleSelect = (orderType) => {
    onSelect({
      ...encounter,
      selectedOrderType: orderType.code,
      orderTypeLabel: orderType.label
    });
  };

  return (
    <div className="panel order-type-panel">
      <div className="panel-header">
        <h2>📋 Select Order Type</h2>
      </div>

      <div className="context-summary">
        <span className="chip">👤 {encounter.patientName || "Patient"}</span>
        <span className="chip">🏥 {encounter.enccode}</span>
      </div>

      <div className="order-type-grid">
        {orderTypes.map((type) => (
          <div 
            key={type.code}
            className="order-type-card"
            onClick={() => handleSelect(type)}
            style={{ borderColor: type.color }}
          >
            <div className="order-type-icon">{type.icon}</div>
            <div className="order-type-label">{type.label}</div>
            <div className="order-type-desc">{type.description}</div>
            <div className="order-type-code">{type.code}</div>
          </div>
        ))}
      </div>

      <div className="panel-footer">
        <button className="btn-back" onClick={onBack}>← Back to Encounter</button>
      </div>
    </div>
  );
}

// ── Procedure/Tests Selection Component ────────────────────────
function ProcedureSelectionPanel({ context, onSelect, onBack }) {
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProcs, setSelectedProcs] = useState([]);

  const { encounter, orderType } = context;

  useEffect(() => {
    const loadOrders = async () => {
      if (!encounter?.enccode) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await fetchEncounterOrders({
          enccode: encounter.enccode,
          type: orderType.code.toLowerCase(), // 'lab' or 'rad'
          status: "S"
        });
        
        // Group by proccode to show distinct tests
        const procMap = new Map();
        (result.data || []).forEach(order => {
          const proccode = order.proccode;
          if (proccode && !procMap.has(proccode)) {
            procMap.set(proccode, {
              proccode,
              description: order.procedureDescription || proccode,
              orcode: order.orcode,
              docointkey: order.docointkey,
              orderDate: order.ordate,
              count: 1
            });
          } else if (procMap.has(proccode)) {
            const existing = procMap.get(proccode);
            existing.count += 1;
          }
        });
        
        setProcedures(Array.from(procMap.values()));
      } catch (err) {
        setError(err.message || "Failed to load lab tests");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [encounter?.enccode, orderType?.code]);

  const toggleProcedure = (proc) => {
    setSelectedProcs(prev => {
      const exists = prev.find(p => p.proccode === proc.proccode);
      if (exists) {
        return prev.filter(p => p.proccode !== proc.proccode);
      }
      return [...prev, proc];
    });
  };

  const handleContinue = () => {
    if (selectedProcs.length > 0) {
      onSelect(selectedProcs);
    }
  };

  return (
    <div className="panel procedure-selection-panel">
      <div className="panel-header">
        <h2>🧪 Select Lab Tests</h2>
      </div>

      <div className="context-summary">
        <span className="chip">👤 {encounter?.patientName || "Patient"}</span>
        <span className="chip">🏥 {encounter?.enccode}</span>
        <span className="chip order-type-chip">{orderType.icon} {orderType.label}</span>
      </div>

      {loading && (
        <div className="loading-state">
          <span className="spinner"></span> Loading lab tests...
        </div>
      )}

      {error && (
        <div className="error-state">
          ⚠️ {error}
        </div>
      )}

      {!loading && procedures.length === 0 && !error && (
        <div className="empty-state">
          No {orderType.label.toLowerCase()} orders found for this encounter.
        </div>
      )}

      <div className="procedure-list">
        {procedures.map((proc, idx) => {
          const isSelected = selectedProcs.some(p => p.proccode === proc.proccode);
          return (
            <div 
              key={proc.proccode || idx}
              className={`procedure-card ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleProcedure(proc)}
            >
              <div className="procedure-checkbox">
                {isSelected ? "✓" : ""}
              </div>
              <div className="procedure-info">
                <div className="procedure-desc">{proc.description}</div>
                <div className="procedure-meta">
                  <span className="procedure-code">Code: {proc.proccode}</span>
                  <span className="procedure-count">
                    {proc.count > 1 ? `×${proc.count} orders` : ""}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedProcs.length > 0 && (
        <div className="selection-summary">
          {selectedProcs.length} test(s) selected
        </div>
      )}

      <div className="panel-footer">
        <button className="btn-back" onClick={onBack}>← Back to Order Type</button>
        <button 
          className="btn-primary" 
          onClick={handleContinue}
          disabled={selectedProcs.length === 0}
        >
          Continue with {selectedProcs.length} test(s) →
        </button>
      </div>
    </div>
  );
}

// ── Upload Panel Component ──────────────────────────────────────
function UploadPanel({ context, onComplete, onBack }) {
  const [selectedProcs, setSelectedProcs] = useState(context.selectedProcedures || []);
  const [files, setFiles] = useState({}); // proc.proccode -> File
  const [remarks, setRemarks] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [error, setError] = useState(null);
  const fileInputRefs = useRef({});

  const { encounter, orderType, patient } = context;

  const handleFileSelect = (procCode, fileList) => {
    const file = fileList?.[0];
    if (file && (file.type === "application/pdf" || file.name.endsWith(".pdf"))) {
      setFiles(prev => ({ ...prev, [procCode]: file }));
      setError(null);
    } else {
      setError("Please select a PDF file");
    }
  };

  const handleUpload = async () => {
    const filesToUpload = Object.entries(files).filter(([_, f]) => f);
    
    if (filesToUpload.length === 0) {
      setError("Please select at least one PDF file");
      return;
    }

    setUploading(true);
    setError(null);

    const results = [];
    const errors = [];

    for (const [procCode, file] of filesToUpload) {
      const proc = selectedProcs.find(p => p.proccode === procCode);
      
      try {
        const result = await uploadMappedLabResult({
          file,
          contextParams: {
            hpercode: encounter.hpercode,
            enccode: encounter.enccode,
            orcode: orderType.code, // LABOR or RADIO
            procode: procCode,
            user: LAB_UPLOAD_API_TOKEN ? "system" : ""
          },
          patient,
          remarks
        });
        
        results.push({
          ...result,
          proccode: procCode,
          description: proc?.description,
          fileName: file.name
        });
      } catch (err) {
        errors.push({
          proccode: procCode,
          fileName: file.name,
          message: err.message
        });
      }
    }

    setUploading(false);
    setUploadResults(results);

    if (errors.length > 0) {
      setError(`${errors.length} upload(s) failed: ${errors.map(e => `${e.proccode}: ${e.message}`).join("; ")}`);
    }
  };

  const handleDone = () => {
    onComplete(uploadResults);
  };

  const allFilesSelected = selectedProcs.every(p => files[p.proccode]);
  const hasResults = uploadResults.length > 0;

  return (
    <div className="panel upload-panel">
      <div className="panel-header">
        <h2>📄 Upload Lab Results</h2>
      </div>

      <div className="context-summary">
        <span className="chip">👤 {encounter?.patientName || patient?.name}</span>
        <span className="chip">🏥 {encounter?.enccode}</span>
        <span className="chip order-type-chip">{orderType.icon} {orderType.label}</span>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {!hasResults ? (
        <>
          <div className="upload-instructions">
            <p>Upload a PDF result for each selected lab test:</p>
          </div>

          <div className="upload-list">
            {selectedProcs.map((proc, idx) => (
              <div key={proc.proccode || idx} className="upload-item">
                <div className="upload-item-info">
                  <div className="upload-item-name">{proc.description}</div>
                  <div className="upload-item-code">Code: {proc.proccode}</div>
                </div>
                <div className="upload-item-action">
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    ref={el => fileInputRefs.current[proc.proccode] = el}
                    onChange={(e) => handleFileSelect(proc.proccode, e.target.files)}
                    style={{ display: 'none' }}
                  />
                  <button 
                    className={`btn-select-file ${files[proc.proccode] ? 'has-file' : ''}`}
                    onClick={() => fileInputRefs.current[proc.proccode]?.click()}
                  >
                    {files[proc.proccode] ? (
                      <>✓ {files[proc.proccode].name}</>
                    ) : (
                      <>📄 Select PDF</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="remarks-section">
            <label>Remarks (optional):</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any remarks about this upload..."
              rows={2}
            />
          </div>

          <div className="panel-footer">
            <button className="btn-back" onClick={onBack}>← Back to Tests</button>
            <button 
              className="btn-primary"
              onClick={handleUpload}
              disabled={uploading || !allFilesSelected}
            >
              {uploading ? (
                <><span className="spinner"></span> Uploading...</>
              ) : (
                <>📤 Upload {Object.keys(files).filter(k => files[k]).length} File(s)</>
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="upload-results">
            <h3>✅ Upload Complete</h3>
            <p>{uploadResults.length} file(s) uploaded successfully</p>
            
            <div className="results-list">
              {uploadResults.map((result, idx) => (
                <div key={idx} className="result-item">
                  <div className="result-header">
                    <span className="result-file">{result.fileName}</span>
                    <span className="result-badge">Success</span>
                  </div>
                  <div className="result-details">
                    <span>Test: {result.description}</span>
                    <span>Code: {result.proccode}</span>
                  </div>
                  <div className="result-docointkey">
                    📋 Tracking ID: <strong>{result.docointkey}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-footer">
            <button className="btn-primary" onClick={handleDone}>
              Done
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Lab Upload Module Component ───────────────────────────
export default function LabUploadModule({ onComplete, onClose }) {
  const [currentStep, setCurrentStep] = useState(WORKFLOW_STEPS.PATIENT);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [patient, setPatient] = useState(null);
  const [encounter, setEncounter] = useState(null);
  const [orderType, setOrderType] = useState(null);
  const [selectedProcedures, setSelectedProcedures] = useState([]);
  const [uploadResults, setUploadResults] = useState([]);

  const markStepComplete = (step) => {
    setCompletedSteps(prev => 
      prev.includes(step) ? prev : [...prev, step]
    );
  };

  const handlePatientSelect = (selectedPatient) => {
    setPatient(selectedPatient);
    setEncounter(null);
    setOrderType(null);
    setSelectedProcedures([]);
    markStepComplete(WORKFLOW_STEPS.PATIENT);
    setCurrentStep(WORKFLOW_STEPS.ENCOUNTER);
  };

  const handleEncounterSelect = (selectedEncounter) => {
    setEncounter({
      ...selectedEncounter,
      hpercode: patient.hpercode,
      patientName: patient.name
    });
    markStepComplete(WORKFLOW_STEPS.ENCOUNTER);
    setCurrentStep(WORKFLOW_STEPS.ORDER);
  };

  const handleOrderTypeSelect = (selectedOrderType) => {
    setOrderType(selectedOrderType);
    markStepComplete(WORKFLOW_STEPS.ORDER);
    setCurrentStep(WORKFLOW_STEPS.PROCEDURE);
  };

  const handleProceduresSelect = (procs) => {
    setSelectedProcedures(procs);
    markStepComplete(WORKFLOW_STEPS.PROCEDURE);
    setCurrentStep(WORKFLOW_STEPS.UPLOAD);
  };

  const handleUploadComplete = (results) => {
    setUploadResults(results);
    markStepComplete(WORKFLOW_STEPS.UPLOAD);
    markStepComplete(WORKFLOW_STEPS.REVIEW);
  };

  const handleReset = () => {
    setCurrentStep(WORKFLOW_STEPS.PATIENT);
    setCompletedSteps([]);
    setPatient(null);
    setEncounter(null);
    setOrderType(null);
    setSelectedProcedures([]);
    setUploadResults([]);
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  const workflowContext = {
    patient,
    encounter,
    orderType,
    selectedProcedures,
    patientName: patient?.name,
    hpercode: patient?.hpercode
  };

  return (
    <div className="lab-upload-module">
      <div className="lab-upload-header">
        <h1>🧪 Lab Result Upload</h1>
        <button className="btn-close" onClick={handleClose}>×</button>
      </div>

      <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />

      <div className="lab-upload-content">
        {currentStep === WORKFLOW_STEPS.PATIENT && (
          <PatientPickerPanel 
            onPatientSelect={handlePatientSelect}
            onClose={handleClose}
          />
        )}

        {currentStep === WORKFLOW_STEPS.ENCOUNTER && (
          <EncounterSelectionPanel
            patient={patient}
            onSelect={handleEncounterSelect}
            onBack={() => setCurrentStep(WORKFLOW_STEPS.PATIENT)}
            onClose={handleClose}
          />
        )}

        {currentStep === WORKFLOW_STEPS.ORDER && (
          <OrderTypePanel
            encounter={encounter}
            onSelect={handleOrderTypeSelect}
            onBack={() => setCurrentStep(WORKFLOW_STEPS.ENCOUNTER)}
          />
        )}

        {currentStep === WORKFLOW_STEPS.PROCEDURE && (
          <ProcedureSelectionPanel
            context={{ encounter, orderType }}
            onSelect={handleProceduresSelect}
            onBack={() => setCurrentStep(WORKFLOW_STEPS.ORDER)}
          />
        )}

        {currentStep === WORKFLOW_STEPS.UPLOAD && (
          <UploadPanel
            context={{ 
              encounter, 
              orderType, 
              selectedProcedures,
              patient 
            }}
            onComplete={handleUploadComplete}
            onBack={() => setCurrentStep(WORKFLOW_STEPS.PROCEDURE)}
          />
        )}

        {currentStep === WORKFLOW_STEPS.REVIEW && (
          <div className="panel review-panel">
            <div className="panel-header">
              <h2>✅ Upload Summary</h2>
            </div>
            
            <div className="review-summary">
              <div className="summary-item">
                <span className="summary-label">Patient:</span>
                <span className="summary-value">{patient?.name}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Patient ID:</span>
                <span className="summary-value">{patient?.hpercode}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Encounter:</span>
                <span className="summary-value">{encounter?.enccode}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Order Type:</span>
                <span className="summary-value">{orderType?.label}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Tests Uploaded:</span>
                <span className="summary-value">{uploadResults.length}</span>
              </div>
            </div>

            <div className="review-results">
              <h3>Uploaded Files</h3>
              {uploadResults.map((result, idx) => (
                <div key={idx} className="review-result-item">
                  <span className="review-file-name">{result.fileName}</span>
                  <span className="review-tracking-id">
                    📋 {result.docointkey}
                  </span>
                </div>
              ))}
            </div>

            <div className="panel-footer">
              <button className="btn-secondary" onClick={handleReset}>
                Upload More Results
              </button>
              <button className="btn-primary" onClick={handleClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
