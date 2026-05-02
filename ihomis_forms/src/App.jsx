import { useEffect, useMemo, useState, useCallback } from "react";
import LabUploadModule from "./modules/labUpload/LabUploadModule.jsx";
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
  USER_PICKER:        "user-picker",        // ← new: identity gate
  PATIENT_SELECTION:  "patient-selection",
  MODULE_NAVIGATOR:   "module-navigator",
  TRACKING:           "tracking",
  TAGGING:            "tagging",
};

// ── Sub-pages (unchanged from your original) ─────────────────────────────────
function PatientSelectionPage({ patientPicker, onConfirmSelection, onOpenTracking }) {
  return (
    <div className="app-landing-page">
      <div className="app-landing-ambient app-landing-ambient-a" aria-hidden="true" />
      <div className="app-landing-ambient app-landing-ambient-b" aria-hidden="true" />
      <main className="app-landing-shell">
        <section className="app-landing-hero">
          <p className="app-landing-kicker">IHOMIS Forms</p>
          <h1>Select Patient</h1>
          <p>Choose and confirm a patient first. After that, you will proceed to the Module Navigator page.</p>
        </section>
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
            onSelectPatient={patientPicker.selectPatient}
            onConfirmSelection={onConfirmSelection}
            onNextPage={patientPicker.goToNextPage}
            onPreviousPage={patientPicker.goToPreviousPage}
            title="Select Patient Before Continuing"
            subtitle="Choose the patient record first, then continue to Module Navigator."
            confirmLabel="Continue to Module Navigator"
            secondaryActionLabel="Tracking System"
            onSecondaryAction={onOpenTracking}
          />
        </section>
      </main>
    </div>
  );
}

function ModuleNavigatorPage({ selectedPatient, modulesList, onChangePatient, onOpenModule }) {
  return (
    <div className="app-landing-page">
      <div className="app-landing-ambient app-landing-ambient-a" aria-hidden="true" />
      <div className="app-landing-ambient app-landing-ambient-b" aria-hidden="true" />
      <main className="app-landing-shell">
        <section className="app-landing-hero">
          <p className="app-landing-kicker">IHOMIS Forms</p>
          <h1>Module Navigator</h1>
          <p>Choose which module to open for the selected patient.</p>
        </section>
        <section className="app-selected-patient-panel" aria-label="Selected patient">
          <div className="app-selected-patient-card">
            <SelectedPatientIndicator
              selectedPatient={selectedPatient}
              onChangeSelection={onChangePatient}
              changeLabel="Change Patient"
            />
          </div>
        </section>
        <section className="app-module-grid" aria-label="Available modules">
          {modulesList.map((moduleItem) => (
            <article key={moduleItem.id} className="app-module-card">
              <div className="app-module-card-head">
                <h2>{moduleItem.name}</h2>
                <span>{moduleItem.status}</span>
              </div>
              <p>{moduleItem.description}</p>
              <button type="button" className="app-open-module" onClick={() => onOpenModule(moduleItem.id)}>
                Open Module
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
function App() {
  // ── User session (identity, no login system) ──────────────────────────────
  const { currentUserId, currentUserName, setUser, clearUser } = useUserSession();

  // ── App routing ───────────────────────────────────────────────────────────
  const [activeModuleId,  setActiveModuleId]  = useState(null);
  const [landingPage,     setLandingPage]     = useState(LANDING_PAGE.USER_PICKER);
  const [isDarkMode,      setIsDarkMode]      = useState(false);

  // ── Access version: bump after any tag write to re-mount Tracking ─────────
  const [accessVersion, setAccessVersion] = useState(0);
  const handleAccessChanged = useCallback(() => setAccessVersion((v) => v + 1), []);

  // ── Patient picker ────────────────────────────────────────────────────────
  const initialContextParams = useMemo(() => getContextParamsFromLocation(), []);
  const patientPicker = useLabPatientPicker({
    patientSearchUrl: LAB_UPLOAD_PATIENT_SEARCH_URL,
    contextUrl:       LAB_UPLOAD_CONTEXT_URL,
    token:            LAB_UPLOAD_API_TOKEN,
    initialContextParams,
  });

  const hasConfirmedPatient = Boolean(
    patientPicker.selectionConfirmed && patientPicker.selectedPatient,
  );

  // ── trackingRows derived from patientPicker ───────────────────────────────
  const trackingRows = useMemo(
    () =>
      patientPicker.patients.map((patient) => ({
        id:             patient.id,
        hospitalNo:     patient.contextParams?.enccode || patient.contextParams?.enc || patient.id,
        admittedDate:   "2025-04-14 08:25:40",
        dischargedDate: "2025-04-15 10:48:54",
        patientName:    patient.displayName,
        phic:           "No PHIC",
        recordsReceived:"No Remarks",
        verify:         "Not yet Verified",
        scan:           "Not yet Scanned",
        send:           "Not yet Sent",
        recordsFiled:   "Not yet Filed",
        claimMap:       "Not yet Submitted to PhilHealth",
        acpm:           "No cheque yet",
      })),
    [patientPicker.patients],
  );

  // ── Once user session is set, move to patient selection if not yet there ──
  useEffect(() => {
    if (currentUserId && landingPage === LANDING_PAGE.USER_PICKER) {
      setLandingPage(LANDING_PAGE.PATIENT_SELECTION);
    }
  }, [currentUserId, landingPage]);

  // ── Guard: if patient is deselected, bounce back ──────────────────────────
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

  // ── Handlers ──────────────────────────────────────────────────────────────
  const activeModule = useMemo(
    () => modules.find((m) => m.id === activeModuleId) || null,
    [activeModuleId],
  );

  function handleOpenModule(moduleId) {
    if (!hasConfirmedPatient) return;
    setActiveModuleId(moduleId);
  }

  function handleConfirmPatientSelection() {
    patientPicker.confirmSelection();
    if (patientPicker.selectedPatientId) {
      setLandingPage(LANDING_PAGE.MODULE_NAVIGATOR);
    }
  }

  function handleOpenTrackingFromSelection() {
    patientPicker.confirmSelection();
    if (patientPicker.selectedPatientId) {
      setLandingPage(LANDING_PAGE.TRACKING);
    }
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
    setLandingPage(
      hasConfirmedPatient ? LANDING_PAGE.MODULE_NAVIGATOR : LANDING_PAGE.PATIENT_SELECTION,
    );
  }

  function handleRequestPatientChange() {
    setActiveModuleId(null);
    patientPicker.reopenSelection();
    setLandingPage(LANDING_PAGE.PATIENT_SELECTION);
  }

  // ── Switch user: clear session → return to UserPicker ────────────────────
  function handleSwitchUser() {
    clearUser();
    setLandingPage(LANDING_PAGE.USER_PICKER);
    setActiveModuleId(null);
    patientPicker.reopenSelection();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ── Render tree ───────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════

  // 1. No user session yet → UserPicker
  if (!currentUserId || landingPage === LANDING_PAGE.USER_PICKER) {
    return (
      <UserPicker
        onSelect={(id, name) => {
          setUser(id, name);
          // useEffect above will advance landingPage once currentUserId is set
        }}
      />
    );
  }

  // 2. Active module (Forms / Lab Upload)
  if (activeModule) {
    const ActiveComponent = activeModule.Component;
    return (
      <div className="app-module-host" data-theme={isDarkMode ? "dark" : undefined}>
        <header className="app-module-header">
          <button type="button" className="app-back-button" onClick={handleBackToLanding}>
            Back to Landing
          </button>
          <strong>
            {activeModule.name}
            {patientPicker.selectedPatient
              ? ` | Patient: ${patientPicker.selectedPatient.displayName}`
              : ""}
          </strong>
        </header>
        <ActiveComponent
          selectedPatient={patientPicker.selectedPatient}
          selectedContextParams={patientPicker.activeContextParams}
          onRequestPatientChange={handleRequestPatientChange}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
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

  // 6. Patient Selection (default after login)
  return (
    <PatientSelectionPage
      patientPicker={patientPicker}
      onConfirmSelection={handleConfirmPatientSelection}
      onOpenTracking={handleOpenTrackingFromSelection}
    />
  );
}

export default App;