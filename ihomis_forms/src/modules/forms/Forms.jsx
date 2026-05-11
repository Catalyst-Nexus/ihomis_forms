import PropTypes from "prop-types";
import { useState, useMemo, useEffect, useCallback } from "react";
import "./Forms.css";
import Modal from "./Modal";
import { supabase } from "../../lib/supabaseClient.js";
// Native Browser Print imports
import { printForms as nativePrintForms } from "../../lib/printController.jsx";
import DNRForm from "./DNRForm";
import FormDocument from "../components/FormDocument.jsx";
import ApgarScoring from "./ApgarScoring";
import BTLConsent from "./BTLConsent";
import CardioPulmonaryClearance from "./CardioPulmonaryClearance";
import BloodCancellation from "./BloodCancellation";
import BloodRequestAdult from "./BloodRequestAdult";
import BloodRequestPediatric from "./BloodRequestPediatric";
import BloodTransfusionReactionRegistry from "./BloodTransfusionReactionRegistry";
import Abtcform from "./Abtcform";
import BloodtransfusionSheet from "./BloodTransfusionSheet";
import ClinicalReferralSlip from "./ClinicalReferralSlip";
import ClinicalCoverSheet from "./ClinicalCoverSheet";
import RandomBloodSugar from "./RandomBloodSugar";
import DoctorsOrder from "./DoctorsOrder";
import OxygenConsumptionSheet from "./OxygenConsumptionSheet";
import OtherLaboratoryRequest from "./OtherLaboratoryRequest";
import ConsentToCare from "./ConsentToCare";
import RefusalToTreatment from "./RefusalToTreatment";
import IntakeOutputSheet from "./IntakeOutputSheet";
import CertificateOfNoVacancy from "./CertificateOfNoVacancy";
import FamilyPlanning from "./FamilyPlanning";
import KardexSheet from "./KardexSheet";
import NewbornTag from "./NewbornTag";
import LaboratoryRequestOutside from "./LaboratoryRequestOutside";
import WardPreference from "./WardPreference";
import CertificatePatientWardPreference from "./CertificatePatientWardPreference";
import ClaimOfCadaver from "./ClaimOfCadaver";
import DischargePlanReferralSlip from "./DischargePlanReferralSlip";
import ConsentToSurgery from "./ConsentToSurgery";
import IVFSheet from "./IVFSheet";
import CommitmentToBreastfeeding from "./CommitmentToBreastfeeding";
import NewbornPhysicalExamination from "./NewbornPhysicalExamination";
import NewbornDailyWeightAbdominalGirth from "./NewbornDailyWeightAbdominalGirth";
import SpecialEndorsement from "./SpecialEndorsement";
import SurgicalMemorandum from "./SurgicalMemorandum";
import SurgicalMemorandumUmbiCat from "./SurgicalMemorandumUmbiCat";
import SpongeCountSheet from "./SpongeCountSheet";
import PhototherapyForm from "./PhototherapyForm";
import NursesNotes from "./NursesNotes";
import OtoacousticEmissionResults from "./OtoacousticEmissionResults";
import MedicalAbstractDischargeSummary from "./MedicalAbstractDischargeSummary";
import ECGTracing from "./ECGTracing";
import PreOperativeChecklist from "./PreOperativeChecklist";
import IsolationRecommendation from "./IsolationRecommendation";
import DAMAForm from "./DAMAForm";
import HistopathologyCytology from "./HistopathologyCytology";
import LaboratoryResults from "./LaboratoryResults";
import ChestTubeThoracostomy from "./ChestTubeThoracostomy";
import BallardScore from "./BallardScore";
import NeuroVitalSignsLessThan from "./NeuroVitalSignsLessThan";
import NeuroVitalSignsMoreThan from "./NeuroVitalSignsMoreThan";
import Neurologic from "./Neurologic";
import Partograph from "./Partograph";
import PostAnesthesiaSheet from "./PostAnesthesiaSheet";
import Lubchenco from "./Lubchenco";
import AnesthesiaRecord from "./AnesthesiaRecord";
import ChildImmunizationRecord from "./ChildImmunizationRecord";
import MIS from "./MIS";
import TPRSheet from "./TPRSheet";
import SurgicalSafetyChecklist from "./SurgicalSafetyChecklist";
import RequestBloodCompatibility from "./RequestBloodCompatibility";
import RadiologyRequestOutside from "./RadiologyRequestOutside";
import PagtugotWaiver from "./PagtugotWaiver";
import NewbornPersonalInfoSheet from "./NewbornPersonalInfoSheet";
import MonitoringSheet from "./MonitoringSheet";
import MedicationSheet from "./MedicationSheet";
import DoctorsOrderPedia from "./DoctorsOrderPedia";
import AnimalBiteTreatmentRecord from "./AnimalBiteTreatmentRecord";
import AldreteScore from "./AldreteScore";

// Component map for dynamic form rendering
const COMPONENT_MAP = {
  DNRForm,
  ApgarScoring,
  BTLConsent,
  CardioPulmonaryClearance,
  BloodCancellation,
  BloodRequestAdult,
  BloodRequestPediatric,
  BloodTransfusionReactionRegistry,
  Abtcform,
  BloodtransfusionSheet,
  // Alias for database component_name
  BloodTransfusionSheet: BloodtransfusionSheet,
  ClinicalReferralSlip,
  ClinicalCoverSheet,
  RandomBloodSugar,
  DoctorsOrder,
  OxygenConsumptionSheet,
  OtherLaboratoryRequest,
  ConsentToCare,
  RefusalToTreatment,
  IntakeOutputSheet,
  CertificateOfNoVacancy,
  FamilyPlanning,
  KardexSheet,
  NewbornTag,
  LaboratoryRequestOutside,
  WardPreference,
  CertificatePatientWardPreference,
  ClaimOfCadaver,
  DischargePlanReferralSlip,
  ConsentToSurgery,
  IVFSheet,
  CommitmentToBreastfeeding,
  NewbornPhysicalExamination,
  NewbornDailyWeightAbdominalGirth,
  SpecialEndorsement,
  SurgicalMemorandum,
  SurgicalMemorandumUmbiCat,
  SpongeCountSheet,
  PhototherapyForm,
  NursesNotes,
  OtoacousticEmissionResults,
  MedicalAbstractDischargeSummary,
  ECGTracing,
  PreOperativeChecklist,
  IsolationRecommendation,
  DAMAForm,
  HistopathologyCytology,
  LaboratoryResults,
  ChestTubeThoracostomy,
  BallardScore,
  NeuroVitalSignsLessThan,
  NeuroVitalSignsMoreThan,
  Neurologic,
  Partograph,
  PostAnesthesiaSheet,
  Lubchenco,
  AnesthesiaRecord,
  ChildImmunizationRecord,
  MIS,
  TPRSheet,
  SurgicalSafetyChecklist,
  RequestBloodCompatibility,
  RadiologyRequestOutside,
  PagtugotWaiver,
  NewbornPersonalInfoSheet,
  MonitoringSheet,
  MedicationSheet,
  DoctorsOrderPedia,
  AnimalBiteTreatmentRecord,
  AldreteScore,
};

const ThemeToggle = ({ isDarkMode, onToggle }) => (
  <button
    className="theme-toggle"
    onClick={onToggle}
    aria-label="Toggle dark mode"
    title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
  >
    {isDarkMode ? "☀️" : "🌙"}
  </button>
);

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function toSafeString(value) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function toTitleCase(value) {
  return toSafeString(value).replace(/\b\w+/g, (word) => {
    if (!word.length) {
      return word;
    }

    return word[0].toUpperCase() + word.slice(1).toLowerCase();
  });
}

function parseDateParts(value) {
  const text = toSafeString(value);

  if (!text) {
    return null;
  }

  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoMatch) {
    return {
      year: Number(isoMatch[1]),
      month: Number(isoMatch[2]),
      day: Number(isoMatch[3]),
    };
  }

  const parsedDate = new Date(text);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return {
    year: parsedDate.getFullYear(),
    month: parsedDate.getMonth() + 1,
    day: parsedDate.getDate(),
  };
}

function formatDateLabel(value) {
  const parts = parseDateParts(value);

  if (!parts) {
    return toSafeString(value);
  }

  const monthName = MONTH_NAMES[parts.month - 1];

  if (!monthName) {
    return toSafeString(value);
  }

  return `${monthName} ${parts.day}, ${parts.year}`;
}

function calculateAgeFromBirthDate(value) {
  const parts = parseDateParts(value);

  if (!parts) {
    return "";
  }

  const today = new Date();
  let age = today.getFullYear() - parts.year;

  const hasHadBirthdayThisYear =
    today.getMonth() + 1 > parts.month ||
    (today.getMonth() + 1 === parts.month && today.getDate() >= parts.day);

  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  if (!Number.isFinite(age) || age < 0) {
    return "";
  }

  return `${age} year(s)`;
}

function sanitizeFileName(value) {
  const text = toSafeString(value).toLowerCase();

  if (!text) {
    return "forms";
  }

  return (
    text
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .replace(/_{2,}/g, "_") || "forms"
  );
}

function normalizeSexValue(value) {
  const normalized = toSafeString(value).toLowerCase();

  if (!normalized) {
    return {
      code: "",
      label: "",
    };
  }

  if (["f", "female", "woman", "girl"].includes(normalized)) {
    return {
      code: "F",
      label: "Female",
    };
  }

  if (["m", "male", "man", "boy"].includes(normalized)) {
    return {
      code: "M",
      label: "Male",
    };
  }

  const fallback = normalized.toUpperCase();

  return {
    code: fallback,
    label: toTitleCase(fallback),
  };
}

function normalizeCivilStatusValue(value) {
  const code = toSafeString(value).toUpperCase();

  if (!code) {
    return {
      code: "",
      label: "",
    };
  }

  const labels = {
    S: "Single",
    M: "Married",
    W: "Widowed",
    D: "Divorced",
    SEP: "Separated",
    A: "Annulled",
  };

  return {
    code,
    label: labels[code] || toTitleCase(code),
  };
}

function normalizeNationalityValue(value) {
  const code = toSafeString(value).toUpperCase();

  if (!code) {
    return {
      code: "",
      label: "",
    };
  }

  const labels = {
    FILIP: "Filipino",
    FILIPINO: "Filipino",
  };

  return {
    code,
    label: labels[code] || toTitleCase(code),
  };
}

function normalizeReligionValue(value) {
  const code = toSafeString(value).toUpperCase();

  if (!code) {
    return {
      code: "",
      label: "",
    };
  }

  const labels = {
    CATHO: "Catholic",
    CATHOLIC: "Catholic",
  };

  return {
    code,
    label: labels[code] || toTitleCase(code),
  };
}

function buildPatientAddress(rawPatient) {
  const addressParts = [
    rawPatient?.street,
    rawPatient?.brgy_name || rawPatient?.barangay || rawPatient?.brgyName,
    rawPatient?.city_name || rawPatient?.city || rawPatient?.cityName,
    rawPatient?.province_name || rawPatient?.province || rawPatient?.provinceName,
    rawPatient?.region_name || rawPatient?.region || rawPatient?.regionName,
    rawPatient?.zip_code || rawPatient?.zipCode || rawPatient?.postalCode,
  ]
    .map(toSafeString)
    .filter(Boolean);

  return addressParts.join(", ");
}

function buildPatientFullName(rawPatient, requestPatient = {}) {
  const firstName = toSafeString(
    rawPatient?.first_name || rawPatient?.firstName || requestPatient.firstName,
  );
  const middleName = toSafeString(
    rawPatient?.middle_name || rawPatient?.middleName || requestPatient.middleName,
  );
  const lastName = toSafeString(
    rawPatient?.last_name || rawPatient?.lastName || requestPatient.lastName,
  );
  const extName = toSafeString(rawPatient?.ext_name || rawPatient?.extName);

  return [firstName, middleName, lastName, extName].filter(Boolean).join(" ");
}

function buildPatientFormData(selectedPatient) {
  const rawPatient = selectedPatient?.rawData || selectedPatient || {};
  const contextParams = selectedPatient?.contextParams || {};
  const requestPatient = selectedPatient?.requestContext?.patient || {};

  const fullName = buildPatientFullName(rawPatient, requestPatient);
  const sex = normalizeSexValue(
    rawPatient.sex || rawPatient.sex_code || rawPatient.sexCode || requestPatient.sex,
  );
  const civilStatus = normalizeCivilStatusValue(
    rawPatient.civil_status_code ||
      rawPatient.civilStatusCode ||
      rawPatient.civil_status ||
      rawPatient.civilStatus,
  );
  const nationality = normalizeNationalityValue(
    rawPatient.nationality_code ||
      rawPatient.nationalityCode ||
      rawPatient.nationality ||
      rawPatient.nationality_name,
  );
  const religion = normalizeReligionValue(
    rawPatient.religion_code ||
      rawPatient.religionCode ||
      rawPatient.religion ||
      rawPatient.religion_name,
  );
  const birthDateValue =
    rawPatient.birth_date ||
    rawPatient.birthDate ||
    rawPatient.birthdate ||
    rawPatient.dob ||
    "";
  const birthDateLabel = formatDateLabel(birthDateValue);
  const contactNumber = toSafeString(
    rawPatient.contact_number || rawPatient.contactNumber,
  );
  const hospitalNo = toSafeString(
    rawPatient.hpercode || rawPatient.id || selectedPatient?.id || contextParams.hpercode || contextParams.enccode,
  );
  const caseNumber = toSafeString(
    rawPatient.case_num ||
      rawPatient.caseNum ||
      rawPatient.case_number ||
      contextParams.caseNum ||
      contextParams.caseNo ||
      contextParams.case_number,
  );
  const address = buildPatientAddress(rawPatient);

  return {
    ...rawPatient,
    ...contextParams,
    id: hospitalNo,
    hpercode: hospitalNo,
    hospitalNo,
    hospitalNumber: hospitalNo,
    caseNum: caseNumber,
    caseNo: caseNumber,
    displayName: fullName || selectedPatient?.displayName || "",
    fullName: fullName || selectedPatient?.displayName || "",
    patientName: fullName || selectedPatient?.displayName || "",
    firstName: toSafeString(
      rawPatient.first_name || rawPatient.firstName || requestPatient.firstName,
    ),
    middleName: toSafeString(
      rawPatient.middle_name || rawPatient.middleName || requestPatient.middleName,
    ),
    lastName: toSafeString(
      rawPatient.last_name || rawPatient.lastName || requestPatient.lastName,
    ),
    extName: toSafeString(rawPatient.ext_name || rawPatient.extName),
    sex: sex.code,
    sexCode: sex.code,
    sexLabel: sex.label,
    birthDateISO: toSafeString(birthDateValue),
    birthdate: birthDateLabel,
    birthDate: birthDateLabel,
    dob: birthDateLabel,
    birthPlace: toSafeString(
      rawPatient.birth_place || rawPatient.birthPlace || "",
    ),
    age: calculateAgeFromBirthDate(birthDateValue),
    ageYears: calculateAgeFromBirthDate(birthDateValue),
    civilStatus: civilStatus.label,
    civilStatusCode: civilStatus.code,
    civilStatusLabel: civilStatus.label,
    nationality: nationality.label,
    nationalityCode: nationality.code,
    religion: religion.label,
    religionCode: religion.code,
    address,
    street: toSafeString(rawPatient.street || rawPatient.street_name || ""),
    barangay: toSafeString(
      rawPatient.brgy_name || rawPatient.barangay || rawPatient.brgyName || "",
    ),
    city: toSafeString(rawPatient.city_name || rawPatient.city || rawPatient.cityName || ""),
    province: toSafeString(
      rawPatient.province_name ||
        rawPatient.province ||
        rawPatient.provinceName ||
        "",
    ),
    region: toSafeString(
      rawPatient.region_name || rawPatient.region || rawPatient.regionName || "",
    ),
    zipCode: toSafeString(rawPatient.zip_code || rawPatient.zipCode || rawPatient.postalCode || ""),
    telNo: contactNumber,
    contactNo: contactNumber,
    contactNumber,
    facilityCode: toSafeString(
      rawPatient.facility_code || rawPatient.facilityCode || contextParams.fhud,
    ),
    facilityName: toSafeString(
      rawPatient.facility_name || rawPatient.facilityName || "",
    ),
    occupation: toSafeString(rawPatient.occupation || ""),
    indigenous: toSafeString(rawPatient.indigenous || ""),
    srCitizen: toSafeString(rawPatient.srCitizen || rawPatient.seniorCitizen || ""),
    patientRecord: rawPatient,
  };
}

ThemeToggle.propTypes = {
  isDarkMode: PropTypes.bool,
  onToggle: PropTypes.func,
};

export default function Forms({
  isDarkMode,
  setIsDarkMode,
  selectedPatient = null,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedForms, setSelectedForms] = useState(new Set());
  const [openForm, setOpenForm] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [dbForms, setDbForms] = useState([]);
  const patientData = useMemo(
    () => buildPatientFormData(selectedPatient),
    [selectedPatient],
  );
  const patientName =
    patientData.fullName || selectedPatient?.displayName || "DOE, JHON";

  // Fetch forms from Supabase
  useEffect(() => {
    const fetchForms = async () => {
      if (!supabase) {
        console.warn("Supabase client not configured");
        return;
      }

      const { data, error } = await supabase
        .from("hospital_forms")
        .select("*")
        .eq("is_active", true)
        .order("description", { ascending: true });

      if (error) {
        console.error("Error fetching forms:", error);
        return;
      }

      setDbForms(data || []);
    };

    fetchForms();
  }, []);

  const filteredForms = useMemo(() => {
    if (!searchTerm) return dbForms;
    return dbForms.filter((form) =>
      form.description.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [dbForms, searchTerm]);

  const handleSelectForm = (formId) => {
    const newSelected = new Set(selectedForms);
    if (newSelected.has(formId)) {
      newSelected.delete(formId);
    } else {
      newSelected.add(formId);
    }
    setSelectedForms(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedForms.size === filteredForms.length) {
      setSelectedForms(new Set());
    } else {
      setSelectedForms(new Set(filteredForms.map((form) => form.id)));
    }
  };

  const getHeaderConfig = (formObject) => {
    if (!formObject) {
      return { formNo: "", revised: "", title: "", leftLogoSrc: "", rightLogoSrc: "" };
    }

    const dbDescription = formObject.description;
    let headerTitle = dbDescription.toUpperCase();

    // Edge cases
    if (dbDescription === "Blood Request Form (Pedia)") {
      headerTitle = "BLOOD REQUEST FORM (PEDIATRIC)";
    } else if (dbDescription === "Clinical Cover Sheet") {
      headerTitle = "";
    }

    return {
      formNo: "",
      revised: "",
      title: headerTitle,
      leftLogoSrc: "",
      rightLogoSrc: "",
    };
  };

  const renderFormBody = (formObject) => {
    const FormComponent = COMPONENT_MAP[formObject.component_name];

    if (!FormComponent) {
      return (
        <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
          <p>Form component "{formObject.component_name}" not found.</p>
          <p>Please ensure the component is imported and mapped.</p>
        </div>
      );
    }

    // Edge case: ApgarScoring uses apiResponse prop
    if (formObject.component_name === "ApgarScoring") {
      return <FormComponent apiResponse={patientData} />;
    }

    // Edge case: ClinicalReferralSlip uses only patientName prop
    if (formObject.component_name === "ClinicalReferralSlip") {
      return <FormComponent patientName={patientName} />;
    }

    // Default: most forms use patientName and patientData props
    return <FormComponent patientName={patientName} patientData={patientData} />;
  };

  const renderFormDocument = (formObject) => (
    <FormDocument headerConfig={getHeaderConfig(formObject)}>
      {renderFormBody(formObject)}
    </FormDocument>
  );

  /**
   * Native Browser Print Handler
   * 
   * Uses the browser's native print engine to render forms with proper CSS support.
   * This replaces the html2canvas/jsPDF approach which failed to handle CSS Modules.
   * 
   * Key benefits:
   * - Full CSS support (including CSS Modules)
   * - Proper page breaks (break-after: page)
   * - 210mm width constraint maintained
   * - Combined preview of all selected forms
   */
  const handlePrintSelectedForms = useCallback(async () => {
    const selectedFormObjects = dbForms.filter((form) => selectedForms.has(form.id));

    if (selectedFormObjects.length === 0) {
      return;
    }

    setIsGeneratingPdf(true);

    try {
      // Build form configurations from selected forms
      // Pass the actual form objects directly - PrintRegistry handles component mapping
      const formConfigs = selectedFormObjects.map(formObject => ({
        id: formObject.id,
        component_name: formObject.component_name,
        description: formObject.description,
      }));

      if (formConfigs.length === 0) {
        window.alert("No valid forms could be printed.");
        return;
      }

      // Use the native print controller with PrintRegistry
      await nativePrintForms(formConfigs, {
        patientName,
        patientData,
        onBeforePrint: () => {
          console.log("Opening print dialog for", formConfigs.length, "forms");
        },
        onAfterPrint: () => {
          console.log("Print job completed");
        },
      });
    } catch (error) {
      console.error("Print error:", error);
      window.alert("Failed to print forms. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [selectedForms, dbForms, patientName, patientData]);

  // Legacy handler name for backwards compatibility (can be removed later)
  const handleGenerateSelectedFormsPdf = handlePrintSelectedForms;

  return (
    <div
      className="forms-container"
      data-theme={isDarkMode ? "dark" : undefined}
    >
      <div className="forms-header">
        <div className="header-top">
          <div className="patient-info">
            <h1>Generate Forms</h1>
            <p className="patient-name">Patient: {patientName}</p>
          </div>
          <ThemeToggle
            isDarkMode={isDarkMode}
            onToggle={() => setIsDarkMode(!isDarkMode)}
          />
        </div>
      </div>

      <div className="forms-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="form-stats">
          <span>
            Showing {filteredForms.length} of {dbForms.length} items
          </span>
          <span className="selected-count">{selectedForms.size} selected</span>
        </div>
      </div>

      <div className="forms-actions">
        <button className="btn btn-secondary" onClick={handleSelectAll}>
          {selectedForms.size === filteredForms.length &&
          filteredForms.length > 0
            ? "Deselect All"
            : "Select All"}
        </button>
        {selectedForms.size > 0 && (
          <button
            className="btn btn-primary"
            onClick={handleGenerateSelectedFormsPdf}
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf
              ? "Generating PDF..."
              : `Generate Selected Forms (${selectedForms.size})`}
          </button>
        )}
      </div>

      <div className="forms-table-wrapper">
        <table className="forms-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input
                  type="checkbox"
                  checked={
                    selectedForms.size === filteredForms.length &&
                    filteredForms.length > 0
                  }
                  onChange={handleSelectAll}
                  aria-label="Select all forms"
                />
              </th>
              <th className="form-col">Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredForms.map((form) => (
              <tr
                key={form.id}
                className="form-row"
                onClick={() => setOpenForm(form)}
              >
                <td
                  className="checkbox-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedForms.has(form.id)}
                    onChange={() => handleSelectForm(form.id)}
                    aria-label={`Select ${form.description}`}
                  />
                </td>
                <td className="form-col">{form.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredForms.length === 0 && (
          <div className="no-results">
            <p>No forms found matching "{searchTerm}"</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!openForm}
        onClose={() => setOpenForm(null)}
        title={openForm?.description}
        formConfig={openForm}
        patientName={patientName}
        patientData={patientData}
      >
        {openForm && renderFormDocument(openForm)}
      </Modal>
    </div>
  );
};

Forms.propTypes = {
  isDarkMode: PropTypes.bool,
  setIsDarkMode: PropTypes.func,
  selectedPatient: PropTypes.shape({
    displayName: PropTypes.string,
    id: PropTypes.string,
    contextParams: PropTypes.object,
  }),
};
