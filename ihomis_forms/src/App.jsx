import { useEffect, useMemo, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import LabUploadModule from "./modules/labUpload/components/LabUploadModule.jsx";
import { PdfPreviewProvider } from "./lib/PdfPreviewContext.jsx";
import FormsModule from "./modules/forms/FormsModule.jsx";
import LabPatientPickerPanel from "./modules/labUpload/components/LabPatientPickerPanel.jsx";
import {
  LAB_UPLOAD_API_TOKEN,
  LAB_UPLOAD_CONTEXT_URL,
  LAB_UPLOAD_PATIENT_SEARCH_URL,
} from "./modules/labUpload/labUploadConfig.js";
import Tracking from "./tracking/tracking.jsx";
import Tagging from "./tracking/Tagging.jsx";
import UserPicker from "./tracking/UserPicker.jsx";
import useLabPatientPicker from "./modules/labUpload/hooks/useLabPatientPicker.js";
import { getContextParamsFromLocation } from "./modules/labUpload/utils/labUploadUtils.js";
import { useUserSession } from "./tracking/hooks/useUserSession.js";
import "./modules/labUpload/LabUploadModule.css";
import "./App.css";

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
  };
  return icons[name] || null;
};

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.number,
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
    name: "Laboratory Upload",
    description: "Upload and review laboratory PDF results with workflow tracking.",
    status: "Ready",
    icon: "FlaskConical",
    Component: LabUploadModule,
  },
];

// ── Page Keys ───────────────────────────────────────────────────────────────────
const LANDING_PAGE = {
  USER_PICKER: "user-picker",
  PATIENT_SELECTION: "patient-selection",
  MODULE_NAVIGATOR: "module-navigator",
  TRACKING: "tracking",
  TAGGING: "tagging",
};

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
function PatientSelectionPage({ patientPicker, onConfirmSelection, onConfirmEncounter }) {
  const navigate = useNavigate();
  const hasSelection = Boolean(patientPicker.selectedPatientId);

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
        {/* Hero Header - matches Lab Upload style */}
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
              <h1 className="app-hero-title">Patient Selection</h1>
              <p className="app-hero-description">
                Search and confirm patient record to proceed with form management
              </p>
            </div>
            <div className="app-hero-actions">
              <button
                type="button"
                className="app-btn app-btn-secondary"
                onClick={handleGoToTracker}
              >
                <Icon name="ClipboardList" size={16} />
                Chart Tracker
              </button>
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
            </div>
          </div>
        </div>

        {/* Patient Picker */}
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

PatientSelectionPage.propTypes = {
  patientPicker: PropTypes.object.isRequired,
  onConfirmSelection: PropTypes.func.isRequired,
  onConfirmEncounter: PropTypes.func.isRequired,
};

// ── Page: Module Navigator ─────────────────────────────────────────────────────
function ModuleNavigatorPage({ selectedPatient, modulesList, onChangePatient, onOpenModule }) {
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
        {/* Hero Header - matches Patient Picker style */}
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
              <h1 className="app-hero-title">Module Navigator</h1>
              <p className="app-hero-description">
                Select a module to open for this patient
              </p>
            </div>

            {/* Patient Info - matches Patient Picker header style */}
            <div className="app-hero-patient">
              <div className="app-hero-patient-avatar" aria-hidden="true">
                {patientInitials}
              </div>
              <div className="app-hero-patient-info">
                <span className="app-hero-patient-label">Selected Patient</span>
                <span className="app-hero-patient-name">
                  {selectedPatient?.displayName || "—"}
                </span>
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

        {/* Module Grid */}
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

ModuleNavigatorPage.propTypes = {
  selectedPatient: PropTypes.object,
  modulesList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      icon: PropTypes.string,
    }),
  ).isRequired,
  onChangePatient: PropTypes.func.isRequired,
  onOpenModule: PropTypes.func.isRequired,
};

// ── Route: Tagging ─────────────────────────────────────────────────────────────
function TaggingRoute() {
  const navigate = useNavigate();
  const { currentUserId, currentUserName, setUser } = useUserSession();
  const { patientPicker, trackingRows } = usePatientTrackingData();

  if (!currentUserId) {
    return (
      <UserPicker
        onSelect={(id, name) => {
          setUser(id, name);
          navigate("/tagging");
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

// ── Route: Tracking ─────────────────────────────────────────────────────────────
function TrackingRoute() {
  const navigate = useNavigate();
  const { currentUserId, currentUserName, setUser, clearUser } = useUserSession();

  if (!currentUserId) {
    return (
      <UserPicker
        onSelect={(id, name) => {
          setUser(id, name);
          navigate("/tracking");
        }}
      />
    );
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
  const { currentUserId, currentUserName, setUser, clearUser } = useUserSession();

  const [activeModuleId, setActiveModuleId] = useState(null);
  const [returnModuleIdAfterEncounterChange, setReturnModuleIdAfterEncounterChange] = useState(null);
  const [landingPage, setLandingPage] = useState(LANDING_PAGE.USER_PICKER);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [accessVersion, setAccessVersion] = useState(0);

  const handleAccessChanged = useCallback(() => setAccessVersion((v) => v + 1), []);
  const { patientPicker, trackingRows } = usePatientTrackingData();
  const hasConfirmedPatient = Boolean(patientPicker.selectionConfirmed && patientPicker.selectedPatient);

  // Restore active module on navigation
  useEffect(() => {
    if (location?.pathname === "/" && !activeModuleId && location.state?.activeModuleId) {
      setActiveModuleId(location.state.activeModuleId);
    }
    if (currentUserId && landingPage === LANDING_PAGE.USER_PICKER) {
      setLandingPage(LANDING_PAGE.PATIENT_SELECTION);
    }
  }, [currentUserId, landingPage, activeModuleId, location?.pathname, location.state?.activeModuleId]);

  // Redirect if patient not confirmed
  useEffect(() => {
    if (!hasConfirmedPatient && [LANDING_PAGE.MODULE_NAVIGATOR, LANDING_PAGE.TRACKING, LANDING_PAGE.TAGGING].includes(landingPage)) {
      setLandingPage(LANDING_PAGE.PATIENT_SELECTION);
    }
  }, [hasConfirmedPatient, landingPage]);

  const activeModule = useMemo(() => modules.find((m) => m.id === activeModuleId) || null, [activeModuleId]);

  // ── Handlers ──
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
    setLandingPage(LANDING_PAGE.USER_PICKER);
    setActiveModuleId(null);
    setReturnModuleIdAfterEncounterChange(null);
    patientPicker.reopenSelection();
  }

  // ── Render ──
  // 1. No user session
  if (!currentUserId || landingPage === LANDING_PAGE.USER_PICKER) {
    return (
      <UserPicker
        onSelect={(id, name) => {
          setUser(id, name);
          navigate("/tracking");
        }}
      />
    );
  }

  // 2. Active module
  if (activeModule) {
    const ActiveComponent = activeModule.Component;
    return (
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
    );
  }

  // 3. Tagging
  if (landingPage === LANDING_PAGE.TAGGING) {
    return (
      <Tagging
        selectedPatient={patientPicker.selectedPatient}
        trackingRows={trackingRows}
        onBackToTracking={handleBackToTracking}
        onChangePatient={handleChangeLandingPatient}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        onAccessChanged={handleAccessChanged}
      />
    );
  }

  // 4. Tracking
  if (landingPage === LANDING_PAGE.TRACKING) {
    return (
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
    );
  }

  // 5. Module Navigator
  if (landingPage === LANDING_PAGE.MODULE_NAVIGATOR) {
    return (
      <ModuleNavigatorPage
        selectedPatient={patientPicker.selectedPatient}
        modulesList={modules}
        onChangePatient={handleChangeLandingPatient}
        onOpenModule={handleOpenModule}
      />
    );
  }

  // 6. Patient Selection (default)
  return (
    <PatientSelectionPage
      patientPicker={patientPicker}
      onConfirmSelection={handleConfirmPatientSelection}
      onConfirmEncounter={handleEncounterConfirmed}
    />
  );
}

// ── App Entry ──────────────────────────────────────────────────────────────────
function App() {
  return (
    <Routes>
      <Route path="/tagging" element={<TaggingRoute />} />
      <Route path="/tracking" element={<TrackingRoute />} />
      <Route path="/" element={<AppShell />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
