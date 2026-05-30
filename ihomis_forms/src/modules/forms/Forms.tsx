import { useState, useMemo, useEffect, useCallback } from "react";
import "./Forms.css";
import Modal from "./Modal";
import { supabase } from "../../lib/supabaseClient";
import { fetchFormValidations, runEncounterValidations } from "../validation/validationScope";
// Native Browser Print imports
import { printForms as nativePrintForms } from "../../lib/printController";
import { getComponentProps, getFormComponent } from "../../lib/formRegistry";
import FormDocument from "../components/FormDocument";
// Form Bundling imports
import { useFormBundles } from "../../lib/formBundleQueries";
import FormBundleButtons from "./components/FormBundleButtons";


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
    rawPatient.enc ||
      contextParams.enc ||
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

const FORMS_LIST = [
  "ABTC Form",
  "ABTC Treatment Record",
  "Advance Directive Do Not Resuscitate (DNR) / Do not Intubate Form",
  "Aldrete Score (Post Anesthesia Recovery Score) Form",
  "Anesthesia Record",
  "APGAR Score Form",
  "Ballard Score",
  "Blood Cancellation Form",
  "Blood Request Form (Adult)",
  "Blood Request Form (Pedia)",
  "Blood Transfusion Reaction Registry",
  "Blood Transfusion Sheet",
  "BTL Consent Form",
  "Cardio-Pulmonary Clearance Form",
  "Certificate of No Vacancy",
  "Certificate of Patient Ward Preference",
  "Certificate of Ward Preference",
  "Certification of Isolation Recommendation",
  "Chest Tube Thoracostomy Sheet",
  "Child Immunization Record",
  "Claim of Cadaver",
  "Clinical Cover Sheet",
  "Clinical Referral Slip",
  "Commitment to Breastfeeding",
  "Consent to Care",
  "Consent to Surgery and Anesthesia Form",
  "Daily Weight and Abdominal Girth",
  "Discharge Against Medical Advice (DAMA) / Out on Pass Form",
  "Discharge Plan/Referral Slip",
  "Doctor's Order (for pedia)",
  "Doctor's Order Form",
  "ECG TRACING",
  "Family Planning",
  "Histopathology/Cytology Request Form",
  "Intake and Output Sheet",
  "IVF Sheet",
  "Kardex Sheet",
  "Laboratory Request Form (outside)",
  "Laboratory Results",
  "Lubchenco",
  "Medical Abstract / Discharge Summary Form",
  "Medication Sheet",
  "MIS Safety Checklist",
  "Monitoring Sheet",
  "Neuro Vital Signs Stats Glasgow Coma Scale Less Than 2 years old",
  "Neuro Vital Signs Stats Glasgow Coma Scale More Than 2 years old",
  "Neurologic Examination Form",
  "Newborn Personal Information Sheet",
  "Newborn Physical Examination Sheet",
  "Newborn Tag",
  "Nurse's Notes Form",
  "Other Laboratory Request",
  "Otoacoustic Emission Results",
  "Oxygen Consumption Sheet",
  "Pagtugot (Waiver)",
  "Partograph",
  "Phototherapy Form",
  "Post Anesthesia Care Unit Nurse's Notes Form",
  "Pre-Operative Checklist",
  "Radiology Request Form (Outside)",
  "Random Blood Sugar",
  "Refusal to Treatment and Procedure Form",
  "Request for Blood Compatibility Testing Form",
  "Special Endorsements (Transient)",
  "Sponge Count Sheet",
  "Surgical Memorandum",
  "Surgical Memorandum Umbi Cat",
  "Surgical Safety Checklist",
  "TPR Sheet",
];

export default function Forms({
  isDarkMode,
  setIsDarkMode,
  selectedPatient = null,
  // Optional: initial selected forms (array or Set) applied when component mounts
  initialSelectedForms = null,
  // If true and initialSelectedForms provided, auto-open the first selected form
  autoOpen = false,
  // Optional callback invoked before generating selected forms: (selectedFormsArray) => void
  onBeforeGenerate = null,
  // Optional callback to change patient
  onChangePatient = null,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedForms, setSelectedForms] = useState(new Set());
  const [openForm, setOpenForm] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [dbForms, setDbForms] = useState([]);
  
  // Validation modal state
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationResults, setValidationResults] = useState([]);
  const [validationSummary, setValidationSummary] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    allPassed: false,
    noValidations: false,
    noEnccode: false,
    error: null,
  });

  // Form Bundling: Use the hook to manage bundle functionality
  // This integrates with the existing selectedForms state
  const {
    bundles,
    toggleBundle,
    isBundleSelected,
    getBundleSelectionCount,
    loading: bundlesLoading,
  } = useFormBundles(selectedForms, setSelectedForms);

  const patientData = useMemo(
    () => buildPatientFormData(selectedPatient),
    [selectedPatient],
  );
  const patientName =
    patientData.fullName || selectedPatient?.displayName || "DOE, JHON";

  // Encounter info from contextParams or patient data
  const encounterInfo = useMemo(() => {
    const ctx = selectedPatient?.contextParams || {};
    const encounterType = ctx.toecode || ctx.encounterType || ctx.encounter_type || patientData.toecode || "";
    const admDate = ctx.admdate || ctx.encdates || ctx.admissionDate || patientData.admdate || "";
    const admTime = ctx.admtime || ctx.toa || ctx.admissionTime || patientData.admtime || "";
    
    // Format encounter type label
    const typeLabels = {
      ADM: "Admission",
      OPDAD: "OPD Admission", 
      ERADM: "ER Admission",
      OPDCON: "OPD Consultation",
      ERCON: "ER Consultation",
    };
    const typeLabel = typeLabels[encounterType?.toUpperCase?.()] || encounterType || "";
    
    // Format date/time
    let dateTimeStr = "";
    if (admDate) {
      dateTimeStr = admDate;
      if (admTime) {
        dateTimeStr += ` ${admTime}`;
      }
    }
    
    return { typeLabel, dateTimeStr };
  }, [selectedPatient, patientData]);

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

  // Apply initial selection when provided from parent (e.g., after validation)
  useEffect(() => {
    if (initialSelectedForms) {
      const setValue = initialSelectedForms instanceof Set ? initialSelectedForms : new Set(initialSelectedForms);
      setSelectedForms(setValue);
      if (autoOpen && setValue.size > 0) {
        setOpenForm(Array.from(setValue)[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSelectedForms]);

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
    const FormComponent = getFormComponent(formObject.component_name);

    if (!FormComponent) {
      return (
        <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
          <p>Form component "{formObject.component_name}" not found.</p>
          <p>Please ensure the component is imported and mapped.</p>
        </div>
      );
    }

    return <FormComponent {...getComponentProps(formObject.component_name, patientName, patientData)} />;
  };

  const renderFormDocument = (formObject) => (
    <FormDocument headerConfig={getHeaderConfig(formObject)}>
      {renderFormBody(formObject)}
    </FormDocument>
  );

  /**
   * Validate selected forms before generating
   * Fetches validations for each selected form and runs them against patient encounter
   */
  const handleValidateBeforeGenerate = useCallback(async () => {
    const selectedFormObjects = dbForms.filter((form) => selectedForms.has(form.id));
    if (selectedFormObjects.length === 0) return;

    setShowValidationModal(true);
    setValidationLoading(true);
    setValidationResults([]);
    setValidationSummary({ total: 0, passed: 0, failed: 0, allPassed: false, noValidations: false, noEnccode: false, error: null });

    try {
      // Get enccode from patient data
      const enccode = patientData?.enccode || selectedPatient?.contextParams?.enccode || "";
      const hpercode = patientData?.hpercode || selectedPatient?.contextParams?.hpercode || "";

      // Fetch validations for all selected forms
      const allValidations = [];
      const formValidationMap = new Map();

      for (const form of selectedFormObjects) {
        const result = await fetchFormValidations(form.id);
        if (result.ok && result.validations?.length > 0) {
          formValidationMap.set(form.id, {
            formName: form.description,
            validations: result.validations,
          });
          result.validations.forEach((v) => {
            allValidations.push({
              ...v,
              formId: form.id,
              formName: form.description,
            });
          });
        }
      }

      if (allValidations.length === 0) {
        // No validations configured for selected forms - allow generation
        setValidationResults([]);
        setValidationSummary({ total: 0, passed: 0, failed: 0, allPassed: false, noValidations: true, noEnccode: false, error: null });
        setValidationLoading(false);
        return;
      }

      // Run validations if enccode is available
      if (enccode) {
        const validationIds = [...new Set(allValidations.map((v) => v.id))];
        const runResult = await runEncounterValidations(enccode, validationIds, hpercode);

        if (runResult.ok && runResult.results) {
          // Map results back to form validations
          const resultMap = new Map();
          runResult.results.forEach((r) => {
            resultMap.set(r.validationId, r);
          });

          const enrichedResults = allValidations.map((v) => ({
            ...v,
            result: resultMap.get(v.id) || { success: null, pending: true },
          }));

          const passed = enrichedResults.filter((r) => r.result?.success === true).length;
          const failed = enrichedResults.filter((r) => r.result?.success === false).length;

          setValidationResults(enrichedResults);
          setValidationSummary({
            total: enrichedResults.length,
            passed,
            failed,
            allPassed: failed === 0,
            noValidations: false,
            noEnccode: false,
            error: null,
          });
        } else {
          // Validation run failed - show validations as pending
          const pendingResults = allValidations.map((v) => ({
            ...v,
            result: { success: null, pending: true, error: runResult.error },
          }));
          setValidationResults(pendingResults);
          setValidationSummary({
            total: pendingResults.length,
            passed: 0,
            failed: 0,
            allPassed: false,
            noValidations: false,
            noEnccode: false,
            error: runResult.error,
          });
        }
      } else {
        // No enccode - show validations as pending
        const pendingResults = allValidations.map((v) => ({
          ...v,
          result: { success: null, pending: true, noEnccode: true },
        }));
        setValidationResults(pendingResults);
        setValidationSummary({
          total: pendingResults.length,
          passed: 0,
          failed: 0,
          allPassed: false,
          noValidations: false,
          noEnccode: true,
          error: null,
        });
      }
    } catch (error) {
      console.error("Validation error:", error);
      setValidationSummary({
        total: 0,
        passed: 0,
        failed: 0,
        allPassed: false,
        noValidations: false,
        noEnccode: false,
        error: error instanceof Error ? error.message : "Validation failed",
      });
    } finally {
      setValidationLoading(false);
    }
  }, [selectedForms, dbForms, patientData, selectedPatient]);

  const handleCloseValidationModal = () => {
    setShowValidationModal(false);
    setValidationResults([]);
    setValidationSummary({ total: 0, passed: 0, failed: 0, allPassed: false, noValidations: false, noEnccode: false, error: null });
  };

  const handleProceedWithGeneration = () => {
    setShowValidationModal(false);
    handlePrintSelectedForms();
  };

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
            {(encounterInfo.typeLabel || encounterInfo.dateTimeStr) && (
              <p className="encounter-info">
                {encounterInfo.typeLabel && <span className="encounter-type">{encounterInfo.typeLabel}</span>}
                {encounterInfo.dateTimeStr && <span className="encounter-datetime">{encounterInfo.dateTimeStr}</span>}
              </p>
            )}
          </div>
          {onChangePatient && (
            <button className="btn btn-secondary btn-change-patient" onClick={onChangePatient}>
              Change Patient
            </button>
          )}
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
            onClick={handleValidateBeforeGenerate}
            disabled={isGeneratingPdf || validationLoading}
          >
            Generate Selected Forms ({selectedForms.size})
          </button>
        )}
        
        {/* Form Bundle Buttons - Dynamically rendered from database */}
        <FormBundleButtons
          bundles={bundles}
          onToggleBundle={toggleBundle}
          isBundleSelected={isBundleSelected}
          getBundleSelectionCount={getBundleSelectionCount}
          loading={bundlesLoading}
          disabled={isGeneratingPdf}
        />
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
              >
                <td className="checkbox-col">
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

      {/* Validation Modal */}
      {showValidationModal && (
        <div className="validation-modal-overlay" onClick={handleCloseValidationModal}>
          <div className="validation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="validation-modal-header">
              <h2>Patient Record Verification</h2>
              <button className="validation-modal-close" onClick={handleCloseValidationModal}>
                ×
              </button>
            </div>
            
            <div className="validation-modal-body">
              {validationLoading ? (
                <div className="validation-loading">
                  <div className="validation-spinner"></div>
                  <p>Validating patient records...</p>
                </div>
              ) : validationSummary.noValidations ? (
                <div className="validation-no-checks">
                  <div className="validation-icon validation-icon--info">ℹ️</div>
                  <p>No validation rules configured for the selected forms.</p>
                  <p className="validation-hint">You may proceed with form generation.</p>
                </div>
              ) : validationSummary.error ? (
                <div className="validation-error-state">
                  <div className="validation-icon validation-icon--error">⚠️</div>
                  <p>Validation check failed</p>
                  <p className="validation-error-message">{validationSummary.error}</p>
                </div>
              ) : validationSummary.noEnccode ? (
                <div className="validation-no-encounter">
                  <div className="validation-icon validation-icon--warning">⚠️</div>
                  <p>No encounter code available for validation.</p>
                  <p className="validation-hint">Patient encounter data is required to run validations.</p>
                </div>
              ) : (
                <>
                  <div className="validation-summary">
                    <div className={`validation-summary-badge ${validationSummary.allPassed ? 'validation-summary-badge--success' : 'validation-summary-badge--warning'}`}>
                      {validationSummary.allPassed ? '✓ All Checks Passed' : `${validationSummary.failed} Issue(s) Found`}
                    </div>
                    <div className="validation-summary-stats">
                      <span className="validation-stat validation-stat--passed">✓ {validationSummary.passed} Passed</span>
                      <span className="validation-stat validation-stat--failed">✗ {validationSummary.failed} Failed</span>
                      <span className="validation-stat validation-stat--total">Total: {validationSummary.total}</span>
                    </div>
                  </div>

                  <div className="validation-checklist">
                    <h3>Validation Checklist</h3>
                    <ul className="validation-list">
                      {validationResults.map((validation, index) => (
                        <li 
                          key={`${validation.id}-${index}`}
                          className={`validation-item ${
                            validation.result?.success === true 
                              ? 'validation-item--passed' 
                              : validation.result?.success === false 
                                ? 'validation-item--failed' 
                                : 'validation-item--pending'
                          }`}
                        >
                          <span className="validation-item-icon">
                            {validation.result?.success === true ? '✓' : validation.result?.success === false ? '✗' : '○'}
                          </span>
                          <span className="validation-item-form">{validation.formName}</span>
                          <span className="validation-item-desc">{validation.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>

            <div className="validation-modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseValidationModal}>
                Cancel
              </button>
              {validationSummary.failed === 0 && (
                <button 
                  className="btn btn-primary" 
                  onClick={handleProceedWithGeneration}
                  disabled={validationLoading}
                >
                  Generate Forms
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


