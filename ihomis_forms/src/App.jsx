import { useEffect, useMemo, useState } from "react";
import LabUploadModule from "./modules/labUpload/LabUploadModule.jsx";
import FormsModule from "./modules/forms/FormsModule.jsx";
import LabPatientPickerPanel from "./modules/labUpload/components/LabPatientPickerPanel.jsx";
import SelectedPatientIndicator from "./modules/labUpload/components/SelectedPatientIndicator.jsx";
import {
  LAB_UPLOAD_API_TOKEN,
  LAB_UPLOAD_CONTEXT_URL,
  LAB_UPLOAD_PATIENT_SEARCH_URL,
} from "./modules/labUpload/labUploadConfig.js";
import useLabPatientPicker from "./modules/labUpload/hooks/useLabPatientPicker.js";
import { getContextParamsFromLocation } from "./modules/labUpload/utils/labUploadUtils.js";
import "./modules/labUpload/LabUploadModule.css";
import "./App.css";

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

const LANDING_PAGE = {
  PATIENT_SELECTION: "patient-selection",
  MODULE_NAVIGATOR: "module-navigator",
};

function PatientSelectionPage({ patientPicker, onConfirmSelection }) {
  return (
    <div className="app-landing-page">
      <div
        className="app-landing-ambient app-landing-ambient-a"
        aria-hidden="true"
      />
      <div
        className="app-landing-ambient app-landing-ambient-b"
        aria-hidden="true"
      />

      <main className="app-landing-shell">
        <section className="app-landing-hero">
          <p className="app-landing-kicker">IHOMIS Forms</p>
          <h1>Select Patient</h1>
          <p>
            Choose and confirm a patient first. After that, you will proceed to
            the Module Navigator page.
          </p>
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
          />
        </section>
      </main>
    </div>
  );
}

function ModuleNavigatorPage({
  selectedPatient,
  modulesList,
  onChangePatient,
  onOpenModule,
}) {
  return (
    <div className="app-landing-page">
      <div
        className="app-landing-ambient app-landing-ambient-a"
        aria-hidden="true"
      />
      <div
        className="app-landing-ambient app-landing-ambient-b"
        aria-hidden="true"
      />

      <main className="app-landing-shell">
        <section className="app-landing-hero">
          <p className="app-landing-kicker">IHOMIS Forms</p>
          <h1>Module Navigator</h1>
          <p>Choose which module to open for the selected patient.</p>
        </section>

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

function App() {
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [landingPage, setLandingPage] = useState(
    LANDING_PAGE.PATIENT_SELECTION,
  );

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

  const hasConfirmedPatient = Boolean(
    patientPicker.selectionConfirmed && patientPicker.selectedPatient,
  );

  useEffect(() => {
    if (!hasConfirmedPatient && landingPage === LANDING_PAGE.MODULE_NAVIGATOR) {
      setLandingPage(LANDING_PAGE.PATIENT_SELECTION);
    }
  }, [hasConfirmedPatient, landingPage]);

  const activeModule = useMemo(
    () =>
      modules.find((moduleItem) => moduleItem.id === activeModuleId) || null,
    [activeModuleId],
  );

  function handleOpenModule(moduleId) {
    if (!hasConfirmedPatient) {
      return;
    }

    setActiveModuleId(moduleId);
  }

  function handleConfirmPatientSelection() {
    patientPicker.confirmSelection();

    if (patientPicker.selectedPatientId) {
      setLandingPage(LANDING_PAGE.MODULE_NAVIGATOR);
    }
  }

  function handleChangeLandingPatient() {
    patientPicker.reopenSelection();
    setLandingPage(LANDING_PAGE.PATIENT_SELECTION);
  }

  function handleBackToLanding() {
    setActiveModuleId(null);
    setLandingPage(
      hasConfirmedPatient
        ? LANDING_PAGE.MODULE_NAVIGATOR
        : LANDING_PAGE.PATIENT_SELECTION,
    );
  }

  function handleRequestPatientChange() {
    setActiveModuleId(null);
    patientPicker.reopenSelection();
    setLandingPage(LANDING_PAGE.PATIENT_SELECTION);
  }

  if (!activeModule) {
    if (landingPage === LANDING_PAGE.PATIENT_SELECTION) {
      return (
        <PatientSelectionPage
          patientPicker={patientPicker}
          onConfirmSelection={handleConfirmPatientSelection}
        />
      );
    }

    return (
      <ModuleNavigatorPage
        selectedPatient={patientPicker.selectedPatient}
        modulesList={modules}
        onChangePatient={handleChangeLandingPatient}
        onOpenModule={handleOpenModule}
      />
    );
  }

  const ActiveComponent = activeModule.Component;

  return (
    <div className="app-module-host">
      <header className="app-module-header">
        <button
          type="button"
          className="app-back-button"
          onClick={handleBackToLanding}
        >
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
      />
    </div>
  );
}

export default App;
