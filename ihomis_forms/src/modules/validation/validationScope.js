const FIELD_LABELS = {
  vitalSigns: "Vital Signs",
  bmi: "BMI",
  historyGDPPR: "General Data",
  historyCOMPL: "Chief Complaint",
  historyPRHIS: "Present Illness History",
  historyPAHIS: "Past Medical History",
  historyOCENV: "Occupation/Environment",
  historyFAHIS: "Family History",
  historyDRTHE: "Drug Therapy",
  historyALCOH: "Alcohol History",
  historyTOBAC: "Tobacco History",
  historyDRUGA: "Drug Allergies",
  historyOTHAL: "Other Allergies",
  historyOB: "OB History",
  prenatal: "Prenatal Data",
  pertinentSignSymptoms: "Signs & Symptoms",
  physicalExam: "Physical Examination",
  systemReview: "System Review",
  courseWard: "Course in Ward",
  pharmacyClearance: "Pharmacy Clearance",
  csrClearance: "CSR Clearance",
  laboratoryClearance: "Laboratory Clearance",
  radiologyClearance: "Radiology Clearance",
  newbornClearance: "Newborn Clearance",
  dischargeOrder: "Discharge Order",
  finalDiagnosis: "Final Diagnosis",
  icdCode: "ICD Code",
};

const VALIDATION_CHECKS = {
  vitalSigns: {
    label: "Vital Signs",
    message: "Add at least one vital signs record for this encounter.",
  },
  bmi: {
    label: "BMI",
    message: "Record the patient's BMI for this encounter.",
  },
  historyGDPPR: {
    label: "General Data",
    message: "Complete the General Data section.",
  },
  historyCOMPL: {
    label: "Chief Complaint",
    message: "Document the patient's chief complaint.",
  },
  historyPRHIS: {
    label: "Present Illness History",
    message: "Document the history of present illness.",
  },
  historyPAHIS: {
    label: "Past Medical History",
    message: "Document past medical history.",
  },
  historyOCENV: {
    label: "Occupation/Environment",
    message: "Complete occupation and environment details.",
  },
  historyFAHIS: {
    label: "Family History",
    message: "Document relevant family history.",
  },
  historyDRTHE: {
    label: "Drug Therapy",
    message: "Document current or prior drug therapy.",
  },
  historyALCOH: {
    label: "Alcohol History",
    message: "Document alcohol use history.",
  },
  historyTOBAC: {
    label: "Tobacco History",
    message: "Document tobacco use history.",
  },
  historyDRUGA: {
    label: "Drug Allergies",
    message: "Document known drug allergies.",
  },
  historyOTHAL: {
    label: "Other Allergies",
    message: "Document non-drug allergies.",
  },
  historyOB: {
    label: "OB History",
    message: "For OB cases, complete OB history including gravida and LMP.",
  },
  prenatal: {
    label: "Prenatal Data",
    message: "For OB cases, complete required prenatal details and expected delivery date.",
  },
  pertinentSignSymptoms: {
    label: "Signs & Symptoms",
    message: "Record signs and symptoms, or provide details in other/pain site notes.",
  },
  physicalExam: {
    label: "Physical Examination",
    message: "Complete physical examination findings.",
  },
  systemReview: {
    label: "System Review",
    message: "Complete system review notes.",
  },
  courseWard: {
    label: "Course in Ward",
    message: "Add at least one course-in-ward entry.",
  },
  pharmacyClearance: {
    label: "Pharmacy Clearance",
    message: "Resolve all pending pharmacy clearance items.",
  },
  csrClearance: {
    label: "CSR Clearance",
    message: "Resolve all pending CSR clearance items.",
  },
  laboratoryClearance: {
    label: "Laboratory Clearance",
    message: "Resolve all pending laboratory clearance items.",
  },
  radiologyClearance: {
    label: "Radiology Clearance",
    message: "Resolve all pending radiology clearance items.",
  },
  newbornClearance: {
    label: "Newborn Clearance",
    message: "Resolve all pending newborn clearance items.",
  },
  dischargeOrder: {
    label: "Discharge Order",
    message: "For admitted patients, encode a discharge order.",
  },
  finalDiagnosis: {
    label: "Final Diagnosis",
    message: "Set a primary final diagnosis.",
  },
  icdCode: {
    label: "ICD Code",
    message: "Assign an ICD code for the final diagnosis.",
  },
  courseInWard: {
    label: "Course in Ward Discharge",
    message: "Ensure course-in-ward entries cover each day until discharge.",
  },
  phic: {
    label: "PHIC Status",
    message: "For PHIC claims, confirm PHIC claim and NBB fields are both set to Yes.",
  },
};

const REQUIREMENT_GROUPS = {
  admissionCore: [
    "vitalSigns",
    "bmi",
    "historyGDPPR",
    "historyCOMPL",
    "historyPRHIS",
    "historyPAHIS",
    "historyOCENV",
    "historyFAHIS",
    "historyDRTHE",
    "historyALCOH",
    "historyTOBAC",
    "historyDRUGA",
    "historyOTHAL",
    "pertinentSignSymptoms",
    "physicalExam",
    "systemReview",
    "courseWard",
  ],
  obCore: ["historyOB", "prenatal"],
  dischargeCore: ["dischargeOrder", "finalDiagnosis", "icdCode", "courseInWard"],
  clearanceCore: [
    "pharmacyClearance",
    "csrClearance",
    "laboratoryClearance",
    "radiologyClearance",
    "newbornClearance",
  ],
  phicCore: ["phic"],
};

const FORM_REQUIREMENT_RULES = [
  {
    test: /discharge against medical advice|dama|discharge plan|medical abstract/i,
    groups: ["admissionCore", "dischargeCore", "clearanceCore"],
    label: "Discharge validation",
  },
  {
    test: /ballard|apgar|aldrete|newborn|baby|neonate|maternal|obstetric|prenatal|antenatal/i,
    groups: ["admissionCore", "obCore"],
    label: "OB and prenatal validation",
  },
  {
    test:
      /anesthesia|surgical|pre-?operative|pacu|aldrete|chest tube|sponge count|mis safety|tpr sheet|monitoring sheet|medication sheet|kardex|intake and output|nurse's notes|oxygen consumption|ecg tracing|laboratory request|blood request|blood cancellation|random blood sugar|radiology request|clinical cover sheet|clinical referral slip|consent to care|consent to surgery|refusal to treatment|claim of cadaver|ward preference|no vacancy/i,
    groups: ["admissionCore"],
    label: "Admission validation",
  },
  {
    test: /phic|claim/i,
    groups: ["phicCore"],
    label: "PHIC validation",
  },
];

const DEFAULT_FORM_REQUIREMENT = {
  groups: ["admissionCore"],
  label: "Admission validation",
};

function normalizeSelectedForms(selectedForms) {
  if (!selectedForms) return [];
  if (selectedForms instanceof Set) return Array.from(selectedForms);
  if (typeof selectedForms === "string") return [selectedForms];
  if (Array.isArray(selectedForms)) return selectedForms;
  return [];
}

function normalizeFormName(formName) {
  return String(formName || "").trim();
}

function getFormRequirementDefinition(formName) {
  const normalized = normalizeFormName(formName);

  if (!normalized) {
    return DEFAULT_FORM_REQUIREMENT;
  }

  const matchedRule = FORM_REQUIREMENT_RULES.find((rule) => rule.test.test(normalized));

  return matchedRule || DEFAULT_FORM_REQUIREMENT;
}

function expandRequirementGroups(groups = []) {
  return groups.flatMap((groupName) => REQUIREMENT_GROUPS[groupName] || []);
}

function getValidationSnapshot(validationData = {}) {
  const validations = validationData?.details?.validations || validationData?.validations;

  if (!validations) {
    return null;
  }

  return {
    vitalSigns: Boolean(validations.admission?.vitalSigns),
    bmi: Boolean(validations.admission?.bmi),
    historyGDPPR: Boolean(validations.admission?.histories?.GDPPR),
    historyCOMPL: Boolean(validations.admission?.histories?.COMPL),
    historyPRHIS: Boolean(validations.admission?.histories?.PRHIS),
    historyPAHIS: Boolean(validations.admission?.histories?.PAHIS),
    historyOCENV: Boolean(validations.admission?.histories?.OCENV),
    historyFAHIS: Boolean(validations.admission?.histories?.FAHIS),
    historyDRTHE: Boolean(validations.admission?.histories?.DRTHE),
    historyALCOH: Boolean(validations.admission?.histories?.ALCOH),
    historyTOBAC: Boolean(validations.admission?.histories?.TOBAC),
    historyDRUGA: Boolean(validations.admission?.histories?.DRUGA),
    historyOTHAL: Boolean(validations.admission?.histories?.OTHAL),
    historyOB: Boolean(validations.admission?.ob),
    prenatal: Boolean(validations.admission?.prenatal),
    pertinentSignSymptoms: Boolean(validations.admission?.pertinentSignSymptoms),
    physicalExam: Boolean(validations.admission?.physicalExam),
    systemReview: Boolean(validations.admission?.systemReview),
    courseWard: Boolean(validations.admission?.courseWard),
    dischargeOrder: Boolean(validations.discharge?.order),
    pharmacyClearance: Boolean(validations.discharge?.clearances?.pharmacy),
    csrClearance: Boolean(validations.discharge?.clearances?.csr),
    laboratoryClearance: Boolean(validations.discharge?.clearances?.laboratory),
    radiologyClearance: Boolean(validations.discharge?.clearances?.radiology),
    newbornClearance: Boolean(validations.discharge?.clearances?.newborn),
    finalDiagnosis: Boolean(validations.discharge?.finalDiagnosis),
    icdCode: Boolean(validations.discharge?.icdCode),
    courseInWard: Boolean(validations.discharge?.courseInWard),
    phic: Boolean(validations.phic),
  };
}

function getValidationRequirementMessages(checkIds = []) {
  return checkIds
    .map((checkId) => ({
      id: checkId,
      label: VALIDATION_CHECKS[checkId]?.label || getFieldLabel(checkId),
      message: VALIDATION_CHECKS[checkId]?.message || getFieldLabel(checkId),
    }))
    .filter((check) => Boolean(check.id));
}

export function getFormValidationRequirements(formName) {
  const definition = getFormRequirementDefinition(formName);

  return {
    formName: normalizeFormName(formName),
    label: definition.label,
    groups: definition.groups,
    checks: getValidationRequirementMessages(expandRequirementGroups(definition.groups)),
  };
}

export function buildFormValidationBreakdown(validationData, selectedForms) {
  const normalized = normalizeSelectedForms(selectedForms);

  if (!normalized.length) {
    return [];
  }

  const snapshot = getValidationSnapshot(validationData);

  if (!snapshot) {
    return normalized.map((formName) => ({
      formName,
      label: getFormValidationRequirements(formName).label,
      checks: [],
      missingChecks: [],
      passedChecks: [],
      hasIssues: false,
      available: false,
    }));
  }

  return normalized.map((formName) => {
    const requirement = getFormValidationRequirements(formName);
    const checkIds = expandRequirementGroups(requirement.groups);
    const checks = getValidationRequirementMessages(checkIds).map((check) => ({
      ...check,
      passed: snapshot[check.id],
    }));

    const missingChecks = checks.filter((check) => !check.passed);
    const passedChecks = checks.filter((check) => check.passed);

    return {
      formName,
      label: requirement.label,
      checks,
      missingChecks,
      passedChecks,
      hasIssues: missingChecks.length > 0,
      available: true,
    };
  });
}

export function buildScopedValidationSummary(validationData, selectedForms) {
  const breakdown = buildFormValidationBreakdown(validationData, selectedForms);

  if (!breakdown.length) {
    const admission = validationData?.admission || validationData?.details?.admission;
    const discharge = validationData?.discharge || validationData?.details?.discharge;

    if (admission || discharge) {
      const admissionComplete = Boolean(admission?.isComplete ?? validationData?.admissionComplete ?? false);
      const dischargeComplete = Boolean(discharge?.isComplete ?? validationData?.dischargeComplete ?? false);
      const admissionMissing = admission?.missingFields || validationData?.admissionMissing || [];
      const dischargeMissing = discharge?.missingFields || validationData?.dischargeMissing || [];

      return {
        admissionComplete,
        dischargeComplete,
        admissionMissing,
        dischargeMissing,
        allMissing: [...admissionMissing, ...dischargeMissing],
        hasIssues: !admissionComplete || !dischargeComplete,
      };
    }

    return {
      admissionComplete: false,
      dischargeComplete: false,
      admissionMissing: [],
      dischargeMissing: [],
      allMissing: [],
      hasIssues: false,
    };
  }

  const admissionMissing = [];
  const dischargeMissing = [];
  const phicMissing = [];

  breakdown.forEach((entry) => {
    entry.missingChecks.forEach((check) => {
      if (REQUIREMENT_GROUPS.admissionCore.includes(check.id) || REQUIREMENT_GROUPS.obCore.includes(check.id)) {
        if (!admissionMissing.includes(check.id)) {
          admissionMissing.push(check.id);
        }
      }

      if (REQUIREMENT_GROUPS.dischargeCore.includes(check.id)) {
        if (!dischargeMissing.includes(check.id)) {
          dischargeMissing.push(check.id);
        }
      }

      if (REQUIREMENT_GROUPS.clearanceCore.includes(check.id)) {
        if (!dischargeMissing.includes(check.id)) {
          dischargeMissing.push(check.id);
        }
      }

      if (check.id === "phic" && !phicMissing.includes(check.id)) {
        phicMissing.push(check.id);
      }
    });
  });

  return {
    admissionMissing,
    dischargeMissing,
    allMissing: [...new Set([...admissionMissing, ...dischargeMissing, ...phicMissing])],
    admissionComplete: admissionMissing.length === 0,
    dischargeComplete: dischargeMissing.length === 0,
    hasIssues: admissionMissing.length > 0 || dischargeMissing.length > 0 || phicMissing.length > 0,
  };
}

export function buildValidationMessagesByForm(validationData, selectedForms) {
  return buildFormValidationBreakdown(validationData, selectedForms);
}

export function getFieldLabel(field) {
  return FIELD_LABELS[field] || String(field || "");
}

// --- New: Helpers to merge server-driven validations with local scope ---

/**
 * Transform server-provided validation rows into UI-friendly check objects.
 * Server validation rows are expected to have at least `id` and `description`.
 */
export function transformServerValidations(serverValidations = []) {
  if (!Array.isArray(serverValidations)) return [];
  return serverValidations.map((v) => ({
    id: String(v.id),
    label: v.description || getFieldLabel(v.id) || `Validation ${v.id}`,
    message: v.hint || v.description || getFieldLabel(v.id) || '',
    query: v.query || null,
    mappingId: v.mappingId || null,
    passed: null,
  }));
}

/**
 * Merge server checks into the same shape used by `buildFormValidationBreakdown`.
 * - `serverValidations` is the array returned from the backend `/api/validation/form/:formId`
 * - `results` is the runtime validation results object returned by the backend runner (optional)
 */
export function mergeServerValidations(serverValidations = [], results = null) {
  const checks = transformServerValidations(serverValidations);
  if (!results) return checks;

  // Map passed state from runtime results: results is expected to include
  // an array `results` with objects { validationId, success }
  const resultMap = {};
  if (Array.isArray(results.results)) {
    results.results.forEach((r) => {
      resultMap[String(r.validationId)] = Boolean(r.success);
    });
  }

  return checks.map((c) => ({ ...c, passed: resultMap[c.id] ?? c.passed }));
}

/**
 * Fetch form -> validation mappings from the backend.
 * Backend route: GET `/api/validation/form/:formId` (returns validations array)
 * Returns: { ok: true, formId, validations: [...] } or throws.
 */
export async function fetchFormValidations(formId) {
  if (!formId) return null;
  const resp = await fetch(`/api/validation/form/${encodeURIComponent(formId)}`);
  if (!resp.ok) throw new Error(`Failed to load validations for form ${formId}: ${resp.statusText}`);
  return resp.json();
}

// End new helpers
