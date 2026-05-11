/**
 * PrintRegistry Component
 * 
 * A wrapper component that maps selected form data to their React components.
 * Handles both single-page and multi-page forms with proper A4 sandboxing.
 */

import React from 'react';
import styles from './PrintRegistry.module.css';

// Import FormSheetHeader component
import FormSheetHeader from '../modules/components/FormSheetHeader.jsx';

// Import all form components
import Abtcform from '../modules/forms/Abtcform';
import TPRSheet from '../modules/forms/TPRSheet';
import MonitoringSheet from '../modules/forms/MonitoringSheet';
import Neurologic from '../modules/forms/Neurologic';
import BloodRequestAdult from '../modules/forms/BloodRequestAdult';
import BloodRequestPediatric from '../modules/forms/BloodRequestPediatric';
import DoctorsOrder from '../modules/forms/DoctorsOrder';
import DoctorsOrderPedia from '../modules/forms/DoctorsOrderPedia';
import ConsentToSurgery from '../modules/forms/ConsentToSurgery';
import ConsentToCare from '../modules/forms/ConsentToCare';
import RefusalToTreatment from '../modules/forms/RefusalToTreatment';
import NursesNotes from '../modules/forms/NursesNotes';
import IntakeOutputSheet from '../modules/forms/IntakeOutputSheet';
import MedicationSheet from '../modules/forms/MedicationSheet';
import KardexSheet from '../modules/forms/KardexSheet';
import NewbornTag from '../modules/forms/NewbornTag';
import LaboratoryRequestOutside from '../modules/forms/LaboratoryRequestOutside';
import RadiologyRequestOutside from '../modules/forms/RadiologyRequestOutside';
import BloodtransfusionSheet from '../modules/forms/BloodtransfusionSheet';
import BloodCancellation from '../modules/forms/BloodCancellation';
import RandomBloodSugar from '../modules/forms/RandomBloodSugar';
import OtherLaboratoryRequest from '../modules/forms/OtherLaboratoryRequest';
import SurgicalSafetyChecklist from '../modules/forms/SurgicalSafetyChecklist';
import RequestBloodCompatibility from '../modules/forms/RequestBloodCompatibility';
import IsolationRecommendation from '../modules/forms/IsolationRecommendation';
import PreOperativeChecklist from '../modules/forms/PreOperativeChecklist';
import DAMAForm from '../modules/forms/DAMAForm';
import DNRForm from '../modules/forms/DNRForm';
import BTLConsent from '../modules/forms/BTLConsent';
import CardioPulmonaryClearance from '../modules/forms/CardioPulmonaryClearance';
import BloodTransfusionReactionRegistry from '../modules/forms/BloodTransfusionReactionRegistry';
import ClinicalCoverSheet from '../modules/forms/ClinicalCoverSheet';
import ClinicalReferralSlip from '../modules/forms/ClinicalReferralSlip';
import OxygenConsumptionSheet from '../modules/forms/OxygenConsumptionSheet';
import CertificateOfNoVacancy from '../modules/forms/CertificateOfNoVacancy';
import FamilyPlanning from '../modules/forms/FamilyPlanning';
import WardPreference from '../modules/forms/WardPreference';
import CertificatePatientWardPreference from '../modules/forms/CertificatePatientWardPreference';
import ClaimOfCadaver from '../modules/forms/ClaimOfCadaver';
import DischargePlanReferralSlip from '../modules/forms/DischargePlanReferralSlip';
import IVFSheet from '../modules/forms/IVFSheet';
import CommitmentToBreastfeeding from '../modules/forms/CommitmentToBreastfeeding';
import NewbornPhysicalExamination from '../modules/forms/NewbornPhysicalExamination';
import NewbornDailyWeightAbdominalGirth from '../modules/forms/NewbornDailyWeightAbdominalGirth';
import SpecialEndorsement from '../modules/forms/SpecialEndorsement';
import SurgicalMemorandum from '../modules/forms/SurgicalMemorandum';
import SurgicalMemorandumUmbiCat from '../modules/forms/SurgicalMemorandumUmbiCat';
import SpongeCountSheet from '../modules/forms/SpongeCountSheet';
import PhototherapyForm from '../modules/forms/PhototherapyForm';
import OtoacousticEmissionResults from '../modules/forms/OtoacousticEmissionResults';
import MedicalAbstractDischargeSummary from '../modules/forms/MedicalAbstractDischargeSummary';
import ECGTracing from '../modules/forms/ECGTracing';
import HistopathologyCytology from '../modules/forms/HistopathologyCytology';
import LaboratoryResults from '../modules/forms/LaboratoryResults';
import ChestTubeThoracostomy from '../modules/forms/ChestTubeThoracostomy';
import BallardScore from '../modules/forms/BallardScore';
import NeuroVitalSignsLessThan from '../modules/forms/NeuroVitalSignsLessThan';
import NeuroVitalSignsMoreThan from '../modules/forms/NeuroVitalSignsMoreThan';
import Partograph from '../modules/forms/Partograph';
import PostAnesthesiaSheet from '../modules/forms/PostAnesthesiaSheet';
import Lubchenco from '../modules/forms/Lubchenco';
import AnesthesiaRecord from '../modules/forms/AnesthesiaRecord';
import ChildImmunizationRecord from '../modules/forms/ChildImmunizationRecord';
import MIS from '../modules/forms/MIS';
import PagtugotWaiver from '../modules/forms/PagtugotWaiver';
import NewbornPersonalInfoSheet from '../modules/forms/NewbornPersonalInfoSheet';
import AnimalBiteTreatmentRecord from '../modules/forms/AnimalBiteTreatmentRecord';
import AldreteScore from '../modules/forms/AldreteScore';
import ApgarScoring from '../modules/forms/ApgarScoring';

/**
 * MULTI-PAGE COMPONENTS
 * Forms that have internal page breaks (Page 1, Page 2, etc.)
 * These use FLUID containers instead of strict A4 lock.
 */
const MULTI_PAGE_COMPONENTS = [
  'BloodRequestAdult',
  'BloodRequestPediatric',
  'BloodtransfusionSheet',
  'BloodTransfusionSheet', // alias
  'BloodTransfusionReactionRegistry',
  'TPRSheet',
  'MonitoringSheet',
  'MedicationSheet',
  'IntakeOutputSheet',
  'KardexSheet',
  'NursesNotes',
  'Partograph',
  'Neurologic',
  'PostAnesthesiaSheet',
  'MIS',
];

/**
 * Component Map
 */
const COMPONENT_MAP = {
  Abtcform,
  TPRSheet,
  MonitoringSheet,
  Neurologic,
  BloodRequestAdult,
  BloodRequestPediatric,
  DoctorsOrder,
  DoctorsOrderPedia,
  ConsentToSurgery,
  ConsentToCare,
  RefusalToTreatment,
  NursesNotes,
  IntakeOutputSheet,
  MedicationSheet,
  KardexSheet,
  NewbornTag,
  LaboratoryRequestOutside,
  RadiologyRequestOutside,
  BloodtransfusionSheet,
  // Alias for database component_name
  BloodTransfusionSheet: BloodtransfusionSheet,
  BloodCancellation,
  RandomBloodSugar,
  OtherLaboratoryRequest,
  SurgicalSafetyChecklist,
  RequestBloodCompatibility,
  IsolationRecommendation,
  PreOperativeChecklist,
  DAMAForm,
  DNRForm,
  BTLConsent,
  CardioPulmonaryClearance,
  BloodTransfusionReactionRegistry,
  ClinicalCoverSheet,
  ClinicalReferralSlip,
  OxygenConsumptionSheet,
  CertificateOfNoVacancy,
  FamilyPlanning,
  WardPreference,
  CertificatePatientWardPreference,
  ClaimOfCadaver,
  DischargePlanReferralSlip,
  IVFSheet,
  CommitmentToBreastfeeding,
  NewbornPhysicalExamination,
  NewbornDailyWeightAbdominalGirth,
  SpecialEndorsement,
  SurgicalMemorandum,
  SurgicalMemorandumUmbiCat,
  SpongeCountSheet,
  PhototherapyForm,
  OtoacousticEmissionResults,
  MedicalAbstractDischargeSummary,
  ECGTracing,
  HistopathologyCytology,
  LaboratoryResults,
  ChestTubeThoracostomy,
  BallardScore,
  NeuroVitalSignsLessThan,
  NeuroVitalSignsMoreThan,
  Partograph,
  PostAnesthesiaSheet,
  Lubchenco,
  AnesthesiaRecord,
  ChildImmunizationRecord,
  MIS,
  PagtugotWaizer: PagtugotWaiver,
  PagtugotWaiver,
  NewbornPersonalInfoSheet,
  AnimalBiteTreatmentRecord,
  AldreteScore,
  ApgarScoring,
};

/**
 * Check if a component is multi-page
 */
function isMultiPageComponent(componentName) {
  return MULTI_PAGE_COMPONENTS.includes(componentName);
}

/**
 * Get component props based on component name
 */
function getComponentProps(componentName, patientName, patientData) {
  if (componentName === 'ApgarScoring') {
    return { apiResponse: patientData };
  }
  if (componentName === 'ClinicalReferralSlip') {
    return { patientName };
  }
  return { patientName, patientData };
}

/**
 * Get header title from form description
 */
function getFormTitle(description) {
  if (!description) return '';
  
  let title = description.toUpperCase();
  
  if (description === "Blood Request Form (Pedia)") {
    title = "BLOOD REQUEST FORM (PEDIATRIC)";
  } else if (description === "Clinical Cover Sheet") {
    title = "";
  }
  
  return title;
}

/**
 * Single Form Page Container
 * 
 * For SINGLE-PAGE forms: Uses strict A4 container (297mm height)
 * For MULTI-PAGE forms: Uses fluid container (height: auto) to allow natural page flow
 */
function PrintPageContainer({ formConfig, patientName, patientData, isLast }) {
  const { component_name, description } = formConfig;
  const Component = COMPONENT_MAP[component_name];
  const formTitle = getFormTitle(description);
  const isMultiPage = isMultiPageComponent(component_name);
  
  // Determine container class based on form type
  let containerClass = isMultiPage ? styles.fluidPageBreak : styles.pageBreak;
  if (isLast) {
    containerClass = isMultiPage ? styles.fluidPageBreakLast : styles.pageBreakLast;
  }
  
  if (!Component) {
    return (
      <div className={containerClass}>
        <p>Component not found: {component_name}</p>
      </div>
    );
  }
  
  const props = getComponentProps(component_name, patientName, patientData);
  
  return (
    <div className={containerClass}>
      {/* FormSheetHeader - only at top, not repeated for multi-page */}
      <FormSheetHeader 
        title={formTitle}
        formNo=""
        revised=""
      />
      
      {/* Form Body */}
      <Component {...props} />
    </div>
  );
}

/**
 * PrintRegistry Component
 * 
 * Renders all selected forms for combined print output.
 * Multi-page forms get fluid containers, single-page forms get strict A4.
 */
export default function PrintRegistry({ formConfigs = [], patientName = "", patientData = {} }) {
  if (!formConfigs || formConfigs.length === 0) {
    return null;
  }
  
  return (
    <div className={styles.printRegistryWrapper}>
      {formConfigs.map((formConfig, index) => (
        <PrintPageContainer
          key={formConfig.id || `form-${index}`}
          formConfig={formConfig}
          patientName={patientName}
          patientData={patientData}
          isLast={index === formConfigs.length - 1}
        />
      ))}
    </div>
  );
}

export { COMPONENT_MAP, MULTI_PAGE_COMPONENTS };
