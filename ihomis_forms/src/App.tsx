import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import LabUploadModule from "./modules/labUpload/components/LabUploadModule";
import { PdfPreviewProvider } from "./lib/PdfPreviewContext";
import FormsModule from "./modules/forms/FormsModule";
import LabPatientPickerPanel from "./modules/labUpload/components/LabPatientPickerPanel";
import {
  LAB_UPLOAD_API_TOKEN,
  LAB_UPLOAD_CONTEXT_URL,
  LAB_UPLOAD_PATIENT_SEARCH_URL,
} from "./modules/labUpload/labUploadConfig";
import Tracking from "./tracking/tracking";
import Tagging from "./tracking/Tagging";
import { ValidationAdminPanel } from "./modules/validation/ValidationModule";
import useLabPatientPicker from "./modules/labUpload/hooks/useLabPatientPicker";
import { getContextParamsFromLocation } from "./modules/labUpload/utils/labUploadUtils";
import { useUserSession } from "./tracking/hooks/useUserSession";
import LoginPage from "./components/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import "./modules/labUpload/LabUploadModule.css";
import "./App.css";

// ── Utility Functions for Encounter Display ─────────────────────────────────────
function formatDate(dateString, includeTime = false, timeString = null) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (includeTime && timeString) {
      const timeStr = formatTime(timeString);
      return `${dateStr} ${timeStr}`;
    }

    return dateStr;
  } catch {
    return dateString;
  }
}

function formatTime(timeString) {
  if (!timeString) return "";
  try {
    const [hours, minutes] = timeString.split(":");
    if (!hours || !minutes) return timeString;
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return timeString;
  }
}

function getEncounterTypeLabel(type) {
  const typeMap = {
    adm: "Admission",
    er: "Emergency Room",
    eradm: "Emergency Room",
    opd: "Outpatient",
    1: "Outpatient",
    2: "Inpatient",
    3: "Emergency",
    op: "Outpatient",
    ip: "Inpatient",
    inpatient: "Inpatient",
    outpatient: "Outpatient",
    emergency: "Emergency",
  };
  return typeMap[String(type).toLowerCase()] || type || "Encounter";
}

function getEncounterTypeColor(type) {
  const colorMap = {
    adm: "enc-type--adm",
    er: "enc-type--er",
    eradm: "enc-type--eradm",
    opd: "enc-type--opd",
    1: "enc-type--opd",
    2: "enc-type--adm",
    3: "enc-type--er",
    op: "enc-type--opd",
    ip: "enc-type--adm",
    inpatient: "enc-type--adm",
    outpatient: "enc-type--opd",
    emergency: "enc-type--er",
  };
  return colorMap[String(type).toLowerCase()] || "enc-type--default";
}

// ── Icon Components (inline SVG for consistency) ───────────────────────────────
const Icon = ({ name, size = 20 }) => {
  const icons = {
    Users: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    LayoutDashboard: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
    FileText: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    FlaskConical: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 22V2l12 8-12 8" />
        <path d="M6 12h12" />
        <path d="M6 16h12" />
      </svg>
    ),
    ArrowLeft: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
    ),
    ArrowRight: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    ),
    ClipboardList: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
      </svg>
    ),
    Check: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    Search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    LogOut: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
  };
  return icons[name] || null;
};

// ── Module Registry ─────────────────────────────────────────────────────────────
const modules = [
  {
    id: "forms",
    name: "Forms Management",
    description: "Search, select, and generate patient forms for medical records and documentation.",
    status: "Ready",
    icon: "FileText",
    Component: FormsModule,
  },
  {
    id: "lab-upload",
    name: "Diagnostic/s Upload",
    description: "Upload and review laboratory PDF results with workflow tracking.",
    status: "Ready",
    icon: "FlaskConical",
    Component: LabUploadModule,
  },
];

// ── Page Keys ───────────────────────────────────────────────────────────────────
const LANDING_PAGE = {
  LOGIN: "login",
  USER_PICKER: "user-picker",
  PATIENT_SELECTION: "patient-selection",
  MODULE_NAVIGATOR: "module-navigator",
  TRACKING: "tracking",
  TAGGING: "tagging",
};

// ── Custom Hook: Validate UID from URL ─────────────────────────────────────────
function useValidateUid({ onValidUser, currentUserId }) {
  const [validationState, setValidationState] = useState('validating');
  const [validatedUser, setValidatedUser] = useState(null);
  const onValidUserRef = useRef(onValidUser);
  onValidUserRef.current = onValidUser;
  const hasValidatedRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uid = params.get("uid");

    if (!uid) {
      // No uid in URL - check if user is already logged in
      if (currentUserId) {
        setValidationState('valid');
      } else {
        setValidationState('no_uid');
      }
      return;
    }

    // Always fetch fresh data when uid is in URL
    let cancelled = false;
    setValidationState('validating');

    const baseUrl = import.meta.env.VITE_TRACKING_USERS;
    if (!baseUrl) {
      setValidationState('invalid');
      return;
    }

    // Extract base API URL and construct user validation endpoint
    const apiBase = baseUrl.replace(/\/users\/?$/, '');
    const validateUrl = `${apiBase}/users/${uid}`;

    (async () => {
      try {
        const res = await fetch(validateUrl);
        if (cancelled) return;
        
        if (!res.ok) {
          setValidationState('invalid');
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        
        if (data.ok && data.data) {
          const user = data.data;
          const userName = user.full_name || user.username || uid;
          const userData = { id: uid, name: userName, deptcode: user.deptcode, data: user };
          setValidatedUser(userData);
          setValidationState('valid');
          // Always call onValidUser to update session with fresh data
          onValidUserRef.current(uid, userName, userData);
          hasValidatedRef.current = true;
        } else {
          setValidationState('invalid');
        }
      } catch {
        if (!cancelled) {
          setValidationState('invalid');
        }
      }
    })();

    return () => { cancelled = true; };
  }, []); // Run only once on mount - always fetch fresh data

  return { validationState, validatedUser };
}

// ── Component: Login Required Message ──────────────────────────────────────────
function LoginRequiredMessage({ state = 'no_uid' }) {
  const messages = {
    no_uid: { icon: '🔒', title: 'Access Required', text: 'Login in the ihomis first' },
    validating: { icon: '⏳', title: 'Validating...', text: 'Please wait while we verify your session' },
    invalid: { icon: '❌', title: 'Invalid User', text: 'User not found. Please login in the ihomis first' },
  };
  const msg = messages[state] || messages.no_uid;

  return (
    <div className="app-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem', 
        backgroundColor: '#fff', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '400px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '1rem' }}>{msg.icon}</div>
        <h2 style={{ margin: '0 0 1rem 0', color: '#333' }}>{msg.title}</h2>
        <p style={{ margin: 0, color: '#666' }}>{msg.text}</p>
      </div>
    </div>
  );
}

// ── Custom Hook: Patient Tracking Data ─────────────────────────────────────────
function usePatientTrackingData() {
  const initialContextParams = useMemo(() => getContextParamsFromLocation(), []);
  const patientPicker = useLabPatientPicker({
    patientSearchUrl: LAB_UPLOAD_PATIENT_SEARCH_URL,
    contextUrl: LAB_UPLOAD_CONTEXT_URL,
    token: LAB_UPLOAD_API_TOKEN,
    initialContextParams,
  });

  const trackingRows = useMemo(
    () =>
      patientPicker.patients.map((patient) => ({
        id: patient.id,
        hospitalNo: patient.contextParams?.enccode || patient.contextParams?.enc || patient.id,
        admittedDate: "2025-04-14 08:25:40",
        dischargedDate: "2025-04-15 10:48:54",
        patientName: patient.displayName,
        phic: "No PHIC",
        recordsReceived: "No Remarks",
        verify: "Not yet Verified",
        scan: "Not yet Scanned",
        send: "Not yet Sent",
        recordsFiled: "Not yet Filed",
        claimMap: "Not yet Submitted to PhilHealth",
        acpm: "No cheque yet",
      })),
    [patientPicker.patients],
  );

  return { patientPicker, trackingRows };
}

// ── Page: Patient Selection ────────────────────────────────────────────────────
function PatientSelectionPage({ patientPicker, onConfirmSelection, onConfirmEncounter, currentUserName, currentUserDeptcode, onLogout }) {
  const navigate = useNavigate();
  const hasSelection = Boolean(patientPicker.selectedPatientId);
  
  // Check if user has access to Chart Tracker based on deptcode
  const trackingDeptcode = (import.meta.env.VITE_SUPABASE_DEPTCODE_FOR_TRACKING || '').trim();
  const canAccessTracking = trackingDeptcode && (currentUserDeptcode || '').trim() === trackingDeptcode;
  
  // Debug log - remove after testing
  console.log('Chart Tracker Access:', { trackingDeptcode, currentUserDeptcode, canAccessTracking });

  const handleSelectPatient = (patient) => {
    const hpercode = patient?.rawData?.hpercode || patient?.contextParams?.hpercode || patient?.id || "";
    if (hpercode) {
      patientPicker.openEncounterModalForPatient(patient);
    } else {
      patientPicker.selectPatient(patient);
    }
  };

  const handleConfirmSelection = () => {
    if (patientPicker.selectedEncounter) {
      patientPicker.confirmEncounterSelection();
      onConfirmSelection();
    } else {
      patientPicker.confirmSelection();
      onConfirmSelection();
    }
  };

  const handleGoToTracker = () => {
    navigate("/tracking");
  };

  return (
    <div className="app-page">
      <div className="app-layout">
        <div className="app-hero-wrap">
          <div className="app-hero">
            <div className="app-hero-left">
              <div className="app-hero-eyebrow">
                <div className="app-hero-icon-wrap">
                  <Icon name="Users" size={18} />
                </div>
                <span className="app-hero-system">iHOMIS Forms</span>
                <span className="app-hero-status app-hero-status--ready">
                  <span className="app-hero-status-dot" />
                  System Ready
                </span>
              </div>
              <h1 className="app-hero-title">Welcome, {currentUserName ?? "—"}</h1>
              <p className="app-hero-description">
                Search and confirm patient record to proceed with form management
              </p>
            </div>
            <div className="app-hero-actions">
              {canAccessTracking && (
                <button
                  type="button"
                  className="app-btn app-btn-secondary"
                  onClick={handleGoToTracker}
                >
                  <Icon name="ClipboardList" size={16} />
                  Chart Tracker
                </button>
              )}
              {hasSelection && (
                <button
                  type="button"
                  className="app-btn app-btn-primary"
                  onClick={handleConfirmSelection}
                >
                  Continue to Modules
                  <Icon name="ArrowRight" size={16} />
                </button>
              )}
              <button
                type="button"
                className="app-btn app-btn-outline"
                onClick={onLogout}
                title="Logout"
              >
                <Icon name="LogOut" size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>

        <section className="app-patient-picker" aria-label="Patient picker">
          <LabPatientPickerPanel
            patients={patientPicker.patients}
            loading={patientPicker.loading}
            errorMessage={patientPicker.errorMessage}
            selectedPatientId={patientPicker.selectedPatientId}
            searchTerm={patientPicker.searchTerm}
            pageIndex={patientPicker.pageIndex}
            hasNextPage={patientPicker.hasNextPage}
            hasPreviousPage={patientPicker.hasPreviousPage}
            onSearchTermChange={patientPicker.setSearchTerm}
            onSelectPatient={handleSelectPatient}
            onNextPage={patientPicker.goToNextPage}
            onPreviousPage={patientPicker.goToPreviousPage}
            showEncounterModal={patientPicker.showEncounterModal}
            patientForEncounterSelection={patientPicker.patientForEncounterSelection}
            encounters={patientPicker.encounters}
            selectedEncounter={patientPicker.selectedEncounter}
            encountersLoading={patientPicker.encountersLoading}
            encountersError={patientPicker.encountersError}
            onOpenEncounterModal={patientPicker.openEncounterModalForPatient}
            onCloseEncounterModal={patientPicker.closeEncounterModal}
            onSelectEncounter={patientPicker.handleEncounterSelection}
            onConfirmEncounter={onConfirmEncounter}
            onRetryEncounters={() => patientPicker.loadPatientEncounters(patientPicker.patientForEncounterSelection)}
          />
        </section>
      </div>
    </div>
  );
}

// ── Page: Module Navigator ─────────────────────────────────────────────────────
function ModuleNavigatorPage({ selectedPatient, modulesList, onChangePatient, onOpenModule, currentUserName }) {
  const patientInitials = (selectedPatient?.displayName || "?")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="app-page">
      <div className="app-layout">
        <div className="app-hero-wrap">
          <div className="app-hero">
            <div className="app-hero-left">
              <div className="app-hero-eyebrow">
                <div className="app-hero-icon-wrap">
                  <Icon name="LayoutDashboard" size={18} />
                </div>
                <span className="app-hero-system">iHOMIS Forms</span>
                <span className="app-hero-status app-hero-status--ready">
                  <span className="app-hero-status-dot" />
                  System Ready
                </span>
              </div>
              <h1 className="app-hero-title">Welcome, {currentUserName ?? "—"}</h1>
              <p className="app-hero-description">
                Select a module to open for this patient
              </p>
            </div>

            <div className="app-hero-patient">
              <div className="app-hero-patient-avatar" aria-hidden="true">
                {patientInitials}
              </div>
              <div className="app-hero-patient-info">
                <span className="app-hero-patient-label">Selected Patient</span>
                <span className="app-hero-patient-hpercode">
                  {selectedPatient?.contextParams?.hpercode || selectedPatient?.id || "—"}
                </span>
                <span className="app-hero-patient-name">
                  {selectedPatient?.displayName || "—"}
                </span>
                {selectedPatient?.contextParams && (
                  <span className={`app-hero-patient-encounter ${getEncounterTypeColor(selectedPatient.contextParams.toecode || selectedPatient.contextParams.type || "")}`}>
                    {getEncounterTypeLabel(selectedPatient.contextParams.toecode || selectedPatient.contextParams.type || "")}
                    {selectedPatient.contextParams.encdates && (
                      <> • {formatDate(selectedPatient.contextParams.encdates, true, selectedPatient.contextParams.toa)}</>
                    )}
                  </span>
                )}
              </div>
              {typeof onChangePatient === "function" && (
                <button
                  type="button"
                  className="app-hero-patient-change"
                  onClick={onChangePatient}
                  aria-label="Change patient selection"
                >
                  <svg
                    viewBox="0 0 16 16"
                    width="13"
                    height="13"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.622.94a.253.253 0 0 0 .102.275l3.994 2.276a.75.75 0 1 1-.88 1.14l-3.994-2.276a.253.253 0 0 0-.177-.109l-.622-.94a.253.253 0 0 0-.064-.108l-6.286-6.286.041-.042a1.014 1.014 0 0 1 1.429.042l1.128 1.128a1.014 1.014 0 0 1-.042 1.43z" />
                  </svg>
                  Change Patient
                </button>
              )}
            </div>
          </div>
        </div>

        <section className="app-module-grid" aria-label="Available modules">
          {modulesList.map((moduleItem) => (
            <article key={moduleItem.id} className="app-module-card">
              <div className="app-module-card-header">
                <div className="app-module-card-title">
                  <div className="app-module-card-icon">
                    <Icon name={moduleItem.icon} size={22} />
                  </div>
                  <div className="app-module-card-title-text">
                    <h3>{moduleItem.name}</h3>
                  </div>
                </div>
                <span className="app-module-card-badge">
                  <Icon name="Check" size={12} />
                  {moduleItem.status}
                </span>
              </div>
              <p className="app-module-card-description">{moduleItem.description}</p>
              <div className="app-module-card-actions">
                <button
                  type="button"
                  className="app-btn app-btn-primary"
                  onClick={() => onOpenModule(moduleItem.id)}
                >
                  Open Module
                  <Icon name="ArrowRight" size={16} />
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

// ── Route: Tagging ─────────────────────────────────────────────────────────────
function TaggingRoute() {
  const navigate = useNavigate();
  const { currentUserId, currentUserName, setUser } = useUserSession();
  const { patientPicker, trackingRows } = usePatientTrackingData();

  const handleValidUser = useCallback((id, name, userData) => {
    setUser(id, name, userData);
  }, [setUser]);

  const { validationState } = useValidateUid({ onValidUser: handleValidUser, currentUserId });

  // Show appropriate message based on validation state
  if (!currentUserId) {
    if (validationState === 'validating' || validationState === 'idle') {
      return <LoginRequiredMessage state="validating" />;
    }
    return (
      <LoginPage
        onLoginSuccess={(userId, userName, userData) => {
          setUser(userId, userName, userData);
        }}
      />
    );
  }

  return (
    <Tagging
      selectedPatient={patientPicker.selectedPatient}
      trackingRows={trackingRows}
      onBackToTracking={() => navigate("/tracking")}
      onChangePatient={() => patientPicker.reopenSelection()}
      currentUserId={currentUserId}
      currentUserName={currentUserName}
    />
  );
}

// ── Component: Access Denied Message ────────────────────────────────────────────
function AccessDeniedMessage() {
  const navigate = useNavigate();
  return (
    <div className="app-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '400px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🚫</div>
        <h2 style={{ margin: '0 0 1rem 0', color: '#333' }}>Access Denied</h2>
        <p style={{ margin: '0 0 1rem 0', color: '#666' }}>You do not have permission to access Chart Tracking.</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#0d9488',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

// ── Route: Tracking ─────────────────────────────────────────────────────────────
function TrackingRoute() {
  const navigate = useNavigate();
  const { currentUserId, currentUserName, currentUserDeptcode, setUser, clearUser } = useUserSession();

  const handleValidUser = useCallback((id, name, userData) => {
    setUser(id, name, userData);
  }, [setUser]);

  const { validationState } = useValidateUid({ onValidUser: handleValidUser, currentUserId });

  // Check if user has access to Chart Tracker based on deptcode
  const trackingDeptcode = (import.meta.env.VITE_SUPABASE_DEPTCODE_FOR_TRACKING || '').trim();
  const canAccessTracking = trackingDeptcode && (currentUserDeptcode || '').trim() === trackingDeptcode;

  // Show appropriate message based on validation state
  if (!currentUserId) {
    if (validationState === 'validating' || validationState === 'idle') {
      return <LoginRequiredMessage state="validating" />;
    }
    return (
      <LoginPage
        onLoginSuccess={(userId, userName, userData) => {
          setUser(userId, userName, userData);
        }}
      />
    );
  }

  // Check department access after user is validated
  if (!canAccessTracking) {
    return <AccessDeniedMessage />;
  }

  return (
    <Tracking
      selectedPatient={null}
      onBackToModuleNavigator={() => navigate("/")}
      onChangePatient={() => navigate("/")}
      onOpenTagging={() => navigate("/tagging")}
      currentUserId={currentUserId}
      currentUserName={currentUserName}
      onSwitchUser={() => {
        clearUser();
        navigate("/tracking");
      }}
    />
  );
}

// ── Main App Shell ─────────────────────────────────────────────────────────────
function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUserId, currentUserName, currentUserDeptcode, setUser, clearUser } = useUserSession();

  const [activeModuleId, setActiveModuleId] = useState(null);
  const [returnModuleIdAfterEncounterChange, setReturnModuleIdAfterEncounterChange] = useState(null);
  const [landingPage, setLandingPage] = useState(LANDING_PAGE.LOGIN);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [accessVersion, setAccessVersion] = useState(0);

  const handleAccessChanged = useCallback(() => setAccessVersion((v) => v + 1), []);
  const { patientPicker, trackingRows } = usePatientTrackingData();
  const hasConfirmedPatient = Boolean(patientPicker.selectionConfirmed && patientPicker.selectedPatient);

  useEffect(() => {
    if (location?.pathname === "/" && !activeModuleId && location.state?.activeModuleId) {
      setActiveModuleId(location.state.activeModuleId);
    }
    if (currentUserId && (landingPage === LANDING_PAGE.USER_PICKER || landingPage === LANDING_PAGE.LOGIN)) {
      setLandingPage(LANDING_PAGE.PATIENT_SELECTION);
    }
  }, [currentUserId, landingPage, activeModuleId, location?.pathname, location.state?.activeModuleId]);

  useEffect(() => {
    if (!hasConfirmedPatient && [LANDING_PAGE.MODULE_NAVIGATOR, LANDING_PAGE.TRACKING, LANDING_PAGE.TAGGING].includes(landingPage)) {
      setLandingPage(LANDING_PAGE.PATIENT_SELECTION);
    }
  }, [hasConfirmedPatient, landingPage]);

  const activeModule = useMemo(() => modules.find((m) => m.id === activeModuleId) || null, [activeModuleId]);

  function handleOpenModule(moduleId) {
    if (!hasConfirmedPatient) return;
    setReturnModuleIdAfterEncounterChange(null);
    setActiveModuleId(moduleId);
  }

  function handleConfirmPatientSelection() {
    const patient = patientPicker.selectedPatient;
    if (patient) {
      patientPicker.openEncounterModalForPatient(patient);
    }
  }

  function handleEncounterConfirmed() {
    patientPicker.confirmEncounterSelection();
    if (returnModuleIdAfterEncounterChange) {
      setActiveModuleId(returnModuleIdAfterEncounterChange);
      setReturnModuleIdAfterEncounterChange(null);
      setLandingPage(LANDING_PAGE.MODULE_NAVIGATOR);
      return;
    }
    setLandingPage(LANDING_PAGE.MODULE_NAVIGATOR);
  }

  function handleOpenTaggingFromTracking() {
    setLandingPage(LANDING_PAGE.TAGGING);
  }

  function handleBackToTracking() {
    setLandingPage(LANDING_PAGE.TRACKING);
  }

  function handleChangeLandingPatient() {
    patientPicker.reopenSelection();
    setLandingPage(LANDING_PAGE.PATIENT_SELECTION);
  }

  function handleBackToLanding() {
    setActiveModuleId(null);
    setReturnModuleIdAfterEncounterChange(null);
    setLandingPage(hasConfirmedPatient ? LANDING_PAGE.MODULE_NAVIGATOR : LANDING_PAGE.PATIENT_SELECTION);
  }

  function handleRequestPatientChange() {
    setActiveModuleId(null);
    setReturnModuleIdAfterEncounterChange(null);
    patientPicker.reopenSelection();
    setLandingPage(LANDING_PAGE.PATIENT_SELECTION);
  }

  function handleRequestEncounterChange() {
    setReturnModuleIdAfterEncounterChange(activeModuleId);
    setActiveModuleId(null);
    const currentPatient = patientPicker.selectedPatient;
    if (currentPatient) {
      patientPicker.openEncounterModalForPatient(currentPatient);
    }
    setLandingPage(LANDING_PAGE.PATIENT_SELECTION);
  }

  function handleSwitchUser() {
    clearUser();
    setLandingPage(LANDING_PAGE.LOGIN);
    setActiveModuleId(null);
    setReturnModuleIdAfterEncounterChange(null);
    patientPicker.reopenSelection();
  }

  const handleValidUser = useCallback((id, name, userData) => {
    setUser(id, name, userData);
    setLandingPage(LANDING_PAGE.PATIENT_SELECTION);
  }, [setUser]);

  const { validationState } = useValidateUid({ onValidUser: handleValidUser, currentUserId });

  // 1. No user session - show login page
  if (!currentUserId) {
    // If uid is in URL, try to validate it first
    if (validationState === 'validating' || validationState === 'idle') {
      return <LoginRequiredMessage state="validating" />;
    }
    // Show login page for all other cases
    return (
      <LoginPage
        onLoginSuccess={(userId, userName, userData) => {
          setUser(userId, userName, userData);
          setLandingPage(LANDING_PAGE.PATIENT_SELECTION);
        }}
      />
    );
  }

  // 2. Active module
  if (activeModule) {
    const ActiveComponent = activeModule.Component;
    return (
      <DashboardLayout currentUserName={currentUserName} onLogout={handleSwitchUser}>
        <div className="app-module-host" data-theme={isDarkMode ? "dark" : undefined}>
          <header className="app-module-header">
            <div className="app-module-header-left">
              <div className="app-module-header-icon">
                <Icon name={activeModule.icon} size={20} />
              </div>
              <div className="app-module-header-info">
                <span className="app-module-header-title">{activeModule.name}</span>
                {patientPicker.selectedPatient && (
                  <span className="app-module-header-subtitle">
                    Patient: {patientPicker.selectedPatient.displayName}
                    {patientPicker.activeContextParams && (
                      <span className={`app-header-enc-badge ${getEncounterTypeColor((patientPicker.activeContextParams as any).toecode || (patientPicker.activeContextParams as any).type || "")}`}>
                        {getEncounterTypeLabel((patientPicker.activeContextParams as any).toecode || (patientPicker.activeContextParams as any).type || "")} {formatDate((patientPicker.activeContextParams as any).encdates, true, (patientPicker.activeContextParams as any).toa)}
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
            <button type="button" className="app-back-btn" onClick={handleBackToLanding}>
              <Icon name="ArrowLeft" size={16} />
              Back
            </button>
          </header>
          <PdfPreviewProvider>
            <ActiveComponent
              selectedPatient={patientPicker.selectedPatient}
              selectedContextParams={patientPicker.activeContextParams}
              onRequestPatientChange={handleRequestPatientChange}
              onRequestEncounterChange={handleRequestEncounterChange}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
            />
          </PdfPreviewProvider>
        </div>
      </DashboardLayout>
    );
  }

  // 3. Tagging
  if (landingPage === LANDING_PAGE.TAGGING) {
    return (
      <DashboardLayout currentUserName={currentUserName} onLogout={handleSwitchUser}>
        <Tagging
          selectedPatient={patientPicker.selectedPatient}
          trackingRows={trackingRows}
          onBackToTracking={handleBackToTracking}
          onChangePatient={handleChangeLandingPatient}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          onAccessChanged={handleAccessChanged}
        />
      </DashboardLayout>
    );
  }

  // 4. Tracking
  if (landingPage === LANDING_PAGE.TRACKING) {
    return (
      <DashboardLayout currentUserName={currentUserName} onLogout={handleSwitchUser}>
        <Tracking
          key={accessVersion}
          selectedPatient={patientPicker.selectedPatient}
          trackingRows={trackingRows}
          onBackToModuleNavigator={() => setLandingPage(LANDING_PAGE.MODULE_NAVIGATOR)}
          onChangePatient={handleChangeLandingPatient}
          onOpenTagging={handleOpenTaggingFromTracking}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          onSwitchUser={handleSwitchUser}
        />
      </DashboardLayout>
    );
  }

  // 5. Module Navigator
  if (landingPage === LANDING_PAGE.MODULE_NAVIGATOR) {
    return (
      <DashboardLayout currentUserName={currentUserName} onLogout={handleSwitchUser}>
        <ModuleNavigatorPage
          selectedPatient={patientPicker.selectedPatient}
          modulesList={modules}
          onChangePatient={handleChangeLandingPatient}
          onOpenModule={handleOpenModule}
          currentUserName={currentUserName}
        />
      </DashboardLayout>
    );
  }

  // 6. Patient Selection (default)
  return (
    <DashboardLayout currentUserName={currentUserName} onLogout={handleSwitchUser}>
      <PatientSelectionPage
        patientPicker={patientPicker}
        onConfirmSelection={handleConfirmPatientSelection}
        onConfirmEncounter={handleEncounterConfirmed}
        currentUserName={currentUserName}
        currentUserDeptcode={currentUserDeptcode}
        onLogout={handleSwitchUser}
      />
    </DashboardLayout>
  );
}

// ── App Entry ──────────────────────────────────────────────────────────────────
// ── Route: Forms Module Landing ─────────────────────────────────────────────────
function FormsRoute() {
  const navigate = useNavigate();
  const { currentUserId, currentUserName, setUser, clearUser } = useUserSession();
  const { patientPicker } = usePatientTrackingData();
  const hasConfirmedPatient = Boolean(patientPicker.selectionConfirmed && patientPicker.selectedPatient);

  const handleValidUser = useCallback((id, name, userData) => {
    setUser(id, name, userData);
  }, [setUser]);

  const { validationState } = useValidateUid({ onValidUser: handleValidUser, currentUserId });

  const handleSelectPatient = (patient) => {
    const hpercode = patient?.rawData?.hpercode || patient?.contextParams?.hpercode || patient?.id || "";
    if (hpercode) {
      patientPicker.openEncounterModalForPatient(patient);
    } else {
      patientPicker.selectPatient(patient);
    }
  };

  const handleConfirmEncounter = () => {
    patientPicker.confirmEncounterSelection();
  };

  // Show appropriate message based on validation state
  if (!currentUserId) {
    if (validationState === 'validating' || validationState === 'idle') {
      return <LoginRequiredMessage state="validating" />;
    }
    return (
      <LoginPage
        onLoginSuccess={(userId, userName, userData) => {
          setUser(userId, userName, userData);
        }}
      />
    );
  }

  // If no patient selected, show patient picker first
  if (!hasConfirmedPatient) {
    return (
      <DashboardLayout currentUserName={currentUserName} onLogout={() => { clearUser(); navigate('/'); }}>
        <div className="app-page">
          <div className="app-layout">
            <div className="app-hero-wrap">
              <div className="app-hero">
                <div className="app-hero-left">
                  <div className="app-hero-eyebrow">
                    <div className="app-hero-icon-wrap">
                      <Icon name="FileText" size={18} />
                    </div>
                    <span className="app-hero-system">Forms Module</span>
                  </div>
                  <h1 className="app-hero-title">Select Patient</h1>
                  <p className="app-hero-description">
                    Search and select a patient record to proceed with form generation
                  </p>
                </div>
              </div>
            </div>
            <section className="app-patient-picker" aria-label="Patient picker">
              <LabPatientPickerPanel
                patients={patientPicker.patients}
                loading={patientPicker.loading}
                errorMessage={patientPicker.errorMessage}
                selectedPatientId={patientPicker.selectedPatientId}
                searchTerm={patientPicker.searchTerm}
                pageIndex={patientPicker.pageIndex}
                hasNextPage={patientPicker.hasNextPage}
                hasPreviousPage={patientPicker.hasPreviousPage}
                onSearchTermChange={patientPicker.setSearchTerm}
                onSelectPatient={handleSelectPatient}
                onNextPage={patientPicker.goToNextPage}
                onPreviousPage={patientPicker.goToPreviousPage}
                showEncounterModal={patientPicker.showEncounterModal}
                patientForEncounterSelection={patientPicker.patientForEncounterSelection}
                encounters={patientPicker.encounters}
                selectedEncounter={patientPicker.selectedEncounter}
                encountersLoading={patientPicker.encountersLoading}
                encountersError={patientPicker.encountersError}
                onCloseEncounterModal={patientPicker.closeEncounterModal}
                onSelectEncounter={patientPicker.handleEncounterSelection}
                onConfirmEncounter={handleConfirmEncounter}
                onRetryEncounters={() => patientPicker.loadPatientEncounters(patientPicker.patientForEncounterSelection)}
              />
            </section>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Patient confirmed, show Forms module
  return (
    <DashboardLayout currentUserName={currentUserName} onLogout={() => { clearUser(); navigate('/'); }}>
      <FormsModule
        selectedPatient={patientPicker.selectedPatient}
        selectedContextParams={patientPicker.selectedPatient?.contextParams || {}}
        onRequestPatientChange={() => patientPicker.reopenSelection()}
      />
    </DashboardLayout>
  );
}

// ── Route: Lab Upload Module Landing ────────────────────────────────────────────
function LabUploadRoute() {
  const navigate = useNavigate();
  const { currentUserId, currentUserName, setUser, clearUser } = useUserSession();
  const { patientPicker } = usePatientTrackingData();
  const hasConfirmedPatient = Boolean(patientPicker.selectionConfirmed && patientPicker.selectedPatient);

  const handleValidUser = useCallback((id, name, userData) => {
    setUser(id, name, userData);
  }, [setUser]);

  const { validationState } = useValidateUid({ onValidUser: handleValidUser, currentUserId });

  const handleSelectPatient = (patient) => {
    const hpercode = patient?.rawData?.hpercode || patient?.contextParams?.hpercode || patient?.id || "";
    if (hpercode) {
      patientPicker.openEncounterModalForPatient(patient);
    } else {
      patientPicker.selectPatient(patient);
    }
  };

  const handleConfirmEncounter = () => {
    patientPicker.confirmEncounterSelection();
  };

  // Show appropriate message based on validation state
  if (!currentUserId) {
    if (validationState === 'validating' || validationState === 'idle') {
      return <LoginRequiredMessage state="validating" />;
    }
    return (
      <LoginPage
        onLoginSuccess={(userId, userName, userData) => {
          setUser(userId, userName, userData);
        }}
      />
    );
  }

  // If no patient selected, show patient picker first
  if (!hasConfirmedPatient) {
    return (
      <DashboardLayout currentUserName={currentUserName} onLogout={() => { clearUser(); navigate('/'); }}>
        <div className="app-page">
          <div className="app-layout">
            <div className="app-hero-wrap">
              <div className="app-hero">
                <div className="app-hero-left">
                  <div className="app-hero-eyebrow">
                    <div className="app-hero-icon-wrap">
                      <Icon name="FlaskConical" size={18} />
                    </div>
                    <span className="app-hero-system">Diagnostics Upload</span>
                  </div>
                  <h1 className="app-hero-title">Select Patient</h1>
                  <p className="app-hero-description">
                    Search and select a patient record to proceed with diagnostics upload
                  </p>
                </div>
              </div>
            </div>
            <section className="app-patient-picker" aria-label="Patient picker">
              <LabPatientPickerPanel
                patients={patientPicker.patients}
                loading={patientPicker.loading}
                errorMessage={patientPicker.errorMessage}
                selectedPatientId={patientPicker.selectedPatientId}
                searchTerm={patientPicker.searchTerm}
                pageIndex={patientPicker.pageIndex}
                hasNextPage={patientPicker.hasNextPage}
                hasPreviousPage={patientPicker.hasPreviousPage}
                onSearchTermChange={patientPicker.setSearchTerm}
                onSelectPatient={handleSelectPatient}
                onNextPage={patientPicker.goToNextPage}
                onPreviousPage={patientPicker.goToPreviousPage}
                showEncounterModal={patientPicker.showEncounterModal}
                patientForEncounterSelection={patientPicker.patientForEncounterSelection}
                encounters={patientPicker.encounters}
                selectedEncounter={patientPicker.selectedEncounter}
                encountersLoading={patientPicker.encountersLoading}
                encountersError={patientPicker.encountersError}
                onCloseEncounterModal={patientPicker.closeEncounterModal}
                onSelectEncounter={patientPicker.handleEncounterSelection}
                onConfirmEncounter={handleConfirmEncounter}
                onRetryEncounters={() => patientPicker.loadPatientEncounters(patientPicker.patientForEncounterSelection)}
              />
            </section>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Patient confirmed, show Lab Upload module
  return (
    <DashboardLayout currentUserName={currentUserName} onLogout={() => { clearUser(); navigate('/'); }}>
      <LabUploadModule
        selectedPatient={patientPicker.selectedPatient}
        selectedContextParams={patientPicker.selectedPatient?.contextParams || {}}
        onRequestPatientChange={() => patientPicker.reopenSelection()}
        onRequestEncounterChange={() => {
          const currentPatient = patientPicker.selectedPatient;
          if (currentPatient) {
            patientPicker.openEncounterModalForPatient(currentPatient);
          }
        }}
      />
    </DashboardLayout>
  );
}

// ── Route: Forms Validation ────────────────────────────────────────────────────
function FormsValidationRoute() {
  const { currentUserId, currentUserName, setUser, clearUser } = useUserSession();

  const handleValidUser = useCallback((id, name, userData) => {
    setUser(id, name, userData);
  }, [setUser]);

  const { validationState } = useValidateUid({ onValidUser: handleValidUser, currentUserId });

  if (!currentUserId) {
    if (validationState === 'validating' || validationState === 'idle') {
      return <LoginRequiredMessage state="validating" />;
    }
    return (
      <LoginPage
        onLoginSuccess={(userId, userName, userData) => {
          setUser(userId, userName, userData);
        }}
      />
    );
  }

  return (
    <DashboardLayout currentUserName={currentUserName} onLogout={() => clearUser()}>
      <ValidationAdminPanel />
    </DashboardLayout>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/modules/forms" element={<FormsRoute />} />
      <Route path="/modules/lab-upload" element={<LabUploadRoute />} />
      <Route path="/settings/forms-validation" element={<FormsValidationRoute />} />
      <Route path="/tagging" element={<TaggingRoute />} />
      <Route path="/tracking" element={<TrackingRoute />} />
      <Route path="/" element={<AppShell />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;