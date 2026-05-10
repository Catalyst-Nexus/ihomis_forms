import { useEffect, useMemo, useState, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from "react-router-dom";
import LabUploadModule from "./modules/labUpload/components/LabUploadModule.jsx";
import { PdfPreviewProvider } from "./lib/PdfPreviewContext.jsx";
import FormsModule from "./modules/forms/FormsModule.jsx";
import LabPatientPickerPanel from "./modules/labUpload/components/LabPatientPickerPanel.jsx";
import SelectedPatientIndicator from "./modules/labUpload/components/SelectedPatientIndicator.jsx";
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

// ── Module registry ───────────────────────────────────────────────────────────
const modules = [
  {
    id: "forms",
    name: "Forms",
    description: "Search, select, and generate patient forms.",
    status: "Ready",
    Component: FormsModule,
  },
  {
    id: "lab-upload",
    name: "Laboratory Upload",
    description: "Upload and review laboratory PDF results.",
    status: "Ready",
    Component: LabUploadModule,
  },
];

// ── Page keys ─────────────────────────────────────────────────────────────────
const LANDING_PAGE = {
  USER_PICKER: "user-picker",
  PATIENT_SELECTION: "patient-selection",
  MODULE_NAVIGATOR: "module-navigator",
  TRACKING: "tracking",
  TAGGING: "tagging",
};

function usePatientTrackingData() {
  const initialContextParams = useMemo(
    () => getContextParamsFromLocation(),
    [],
  );
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
        hospitalNo:
          patient.contextParams?.enccode ||
          patient.contextParams?.enc ||
          patient.id,
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

// ── Patient Selection Page ──────────────────────────────────────────────────
function PatientSelectionPage({
  patientPicker,
  onConfirmSelection,
  onConfirmEncounter,
}) {
  const handleSelectPatient = (patient) => {
    const hpercode =
      patient?.rawData?.hpercode ||
      patient?.contextParams?.hpercode ||
      patient?.id ||
      "";

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

  return (
    <div className="app-landing-page">
      <main className="app-landing-shell">
        {/* Header - Matching lab workflow style */}
        <header className="app-landing-header">
          <div className="app-header-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="app-header-text">
            <h2>Select Patient</h2>
            <p>Choose and confirm a patient first.</p>
          </div>
        </header>

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
            onConfirmSelection={handleConfirmSelection}
            onNextPage={patientPicker.goToNextPage}
            onPreviousPage={patientPicker.goToPreviousPage}
            title="Select Patient Before Continuing"
            subtitle="Choose the patient record first, then continue to Module Navigator."
            confirmLabel="Continue to Module Navigator"
            showEncounterModal={patientPicker.showEncounterModal}
            patientForEncounterSelection={
              patientPicker.patientForEncounterSelection
            }
            encounters={patientPicker.encounters}
            selectedEncounter={patientPicker.selectedEncounter}
            encountersLoading={patientPicker.encountersLoading}
            encountersError={patientPicker.encountersError}
            onOpenEncounterModal={patientPicker.openEncounterModalForPatient}
            onCloseEncounterModal={patientPicker.closeEncounterModal}
            onSelectEncounter={patientPicker.handleEncounterSelection}
            onConfirmEncounter={onConfirmEncounter}
            onRetryEncounters={() =>
              patientPicker.loadPatientEncounters(
                patientPicker.patientForEncounterSelection,
              )
            }
          />
        </section>
      </main>
    </div>
  );
}

PatientSelectionPage.propTypes = {
  patientPicker: PropTypes.object.isRequired,
  onConfirmSelection: PropTypes.func.isRequired,
  onConfirmEncounter: PropTypes.func.isRequired,
};

// ── Module Navigator Page ────────────────────────────────────────────────────
function ModuleNavigatorPage({
  selectedPatient,
  modulesList,
  onChangePatient,
  onOpenModule,
}) {
  return (
    <div className="app-landing-page">
      <main className="app-landing-shell">
        {/* Header - Matching lab workflow style */}
        <header className="app-landing-header">
          <div className="app-header-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="22 3 13.46 13.46 2 2 2 22 22 22" />
            </svg>
          </div>
          <div className="app-header-text">
            <h2>Module Navigator</h2>
            <p>Choose which module to open for the selected patient.</p>
          </div>
        </header>

        {/* Selected Patient */}
        <section
          className="app-selected-patient-panel"
          aria-label="Selected patient"
        >
          <div className="app-selected-patient-card">
            <SelectedPatientIndicator
              selectedPatient={selectedPatient}
              onChangeSelection={onChangePatient}
              changeLabel="Change Patient"
            />
          </div>
        </section>

        {/* Module Grid */}
        <section className="app-module-grid" aria-label="Available modules">
          {modulesList.map((moduleItem) => (
            <article key={moduleItem.id} className="app-module-card">
              <div className="app-module-card-head">
                <h2>{moduleItem.name}</h2>
                <span>{moduleItem.status}</span>
              </div>
              <p>{moduleItem.description}</p>
              <button
                type="button"
                className="app-open-module"
                onClick={() => onOpenModule(moduleItem.id)}
              >
                Open Module
              </button>
            </article>
          ))}
        </section>
      </main>
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
    }),
  ).isRequired,
  onChangePatient: PropTypes.func.isRequired,
  onOpenModule: PropTypes.func.isRequired,
};

// ── Route Components ─────────────────────────────────────────────────────────
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

function TrackingRoute() {
  const navigate = useNavigate();
  const { currentUserId, currentUserName, setUser, clearUser } =
    useUserSession();

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

// ════════════════════════════════════════════════════════════════════════════
function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUserId, currentUserName, setUser, clearUser } =
    useUserSession();

  const [activeModuleId, setActiveModuleId] = useState(null);
  const [
    returnModuleIdAfterEncounterChange,
    setReturnModuleIdAfterEncounterChange,
  ] = useState(null);
  const [landingPage, setLandingPage] = useState(LANDING_PAGE.USER_PICKER);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [accessVersion, setAccessVersion] = useState(0);
  const handleAccessChanged = useCallback(
    () => setAccessVersion((v) => v + 1),
    [],
  );

  const { patientPicker, trackingRows } = usePatientTrackingData();

  const hasConfirmedPatient = Boolean(
    patientPicker.selectionConfirmed && patientPicker.selectedPatient,
  );

  useEffect(() => {
    // Restore active module if navigation state includes it (e.g., returning from /preview)
    if (
      location?.pathname === "/" &&
      !activeModuleId &&
      location.state?.activeModuleId
    ) {
      setActiveModuleId(location.state.activeModuleId);
    }

    if (currentUserId && landingPage === LANDING_PAGE.USER_PICKER) {
      setLandingPage(LANDING_PAGE.PATIENT_SELECTION);
    }
  }, [
    currentUserId,
    landingPage,
    activeModuleId,
    location?.pathname,
    location.state?.activeModuleId,
  ]);

  useEffect(() => {
    if (
      !hasConfirmedPatient &&
      (landingPage === LANDING_PAGE.MODULE_NAVIGATOR ||
        landingPage === LANDING_PAGE.TRACKING ||
        landingPage === LANDING_PAGE.TAGGING)
    ) {
      setLandingPage(LANDING_PAGE.PATIENT_SELECTION);
    }
  }, [hasConfirmedPatient, landingPage]);

  const activeModule = useMemo(
    () => modules.find((m) => m.id === activeModuleId) || null,
    [activeModuleId],
  );

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
    setLandingPage(
      hasConfirmedPatient
        ? LANDING_PAGE.MODULE_NAVIGATOR
        : LANDING_PAGE.PATIENT_SELECTION,
    );
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

  // 1. No user session yet → UserPicker
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

  // 2. Active module (Forms / Lab Upload)
  if (activeModule) {
    const ActiveComponent = activeModule.Component;
    return (
      <div
        className="app-module-host"
        data-theme={isDarkMode ? "dark" : undefined}
      >
        <header className="app-module-header">
          <button
            type="button"
            className="app-back-button"
            onClick={handleBackToLanding}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Landing
          </button>
          <strong>
            {activeModule.name}
            {patientPicker.selectedPatient
              ? ` | Patient: ${patientPicker.selectedPatient.displayName}`
              : ""}
          </strong>
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
        onBackToModuleNavigator={() =>
          setLandingPage(LANDING_PAGE.MODULE_NAVIGATOR)
        }
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

  // 6. Patient Selection (default after login)
  return (
    <PatientSelectionPage
      patientPicker={patientPicker}
      onConfirmSelection={handleConfirmPatientSelection}
      onConfirmEncounter={handleEncounterConfirmed}
    />
  );
}

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
