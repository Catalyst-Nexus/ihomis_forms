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
  dischargeOrder: "Discharge Order",
  finalDiagnosis: "Final Diagnosis",
  icdCode: "ICD Code",
};

const VALIDATION_CHECKS = {
  vitalSigns: {
    label: "Vital Signs",
    message: "Hvitalsign must exist for the encounter.",
  },
  bmi: {
    label: "BMI",
    message: "Hvsothr must exist for the encounter.",
  },
  historyGDPPR: {
    label: "General Data",
    message: "Hmrhisto must exist with histype = GDPPR.",
  },
  historyCOMPL: {
    label: "Chief Complaint",
    message: "Hmrhisto must exist with histype = COMPL.",
  },
  historyPRHIS: {
    label: "Present Illness History",
    message: "Hmrhisto must exist with histype = PRHIS.",
  },
  historyPAHIS: {
    label: "Past Medical History",
    message: "Hmrhisto must exist with histype = PAHIS.",
  },
  historyOCENV: {
    label: "Occupation/Environment",
    message: "Hmrhisto must exist with histype = OCENV.",
  },
  historyFAHIS: {
    label: "Family History",
    message: "Hmrhisto must exist with histype = FAHIS.",
  },
  historyDRTHE: {
    label: "Drug Therapy",
    message: "Hmrhisto must exist with histype = DRTHE.",
  },
  historyALCOH: {
    label: "Alcohol History",
    message: "Hmrhisto must exist with histype = ALCOH.",
  },
  historyTOBAC: {
    label: "Tobacco History",
    message: "Hmrhisto must exist with histype = TOBAC.",
  },
  historyDRUGA: {
    label: "Drug Allergies",
    message: "Hmrhisto must exist with histype = DRUGA.",
  },
  historyOTHAL: {
    label: "Other Allergies",
    message: "Hmrhisto must exist with histype = OTHAL.",
  },
  historyOB: {
    label: "OB History",
    message: "OB cases require Hmrhistoob with non-null obg and oblmp.",
  },
  prenatal: {
    label: "Prenatal Data",
    message:
      "OB cases require Hprenatal with mcp, prenataldte2, prenataldte3, prenataldte4, and expectdeliverydte.",
  },
  pertinentSignSymptoms: {
    label: "Signs & Symptoms",
    message:
      "Hsignsymptoms must exist, or Hpesignsothers must exist with pesigntype = others or painsite.",
  },
  physicalExam: {
    label: "Physical Examination",
    message: "Hphyexam must exist for the encounter.",
  },
  systemReview: {
    label: "System Review",
    message: "Hmrsrev must exist for the encounter.",
  },
  courseWard: {
    label: "Course in Ward",
    message: "Hcrsward must exist for the encounter.",
  },
  dischargeOrder: {
    label: "Discharge Order",
    message: "ADM encounters require Hdocord with orcode = DISCH.",
  },
  finalDiagnosis: {
    label: "Final Diagnosis",
    message: "Hencdiag must exist with tdcode = FINDX and primediag = Y.",
  },
  icdCode: {
    label: "ICD Code",
    message: "Hencdiag must exist with tdcode = FINDX.",
  },
  courseInWard: {
    label: "Course in Ward Discharge",
    message:
      "Course-in-ward entries must cover each day from admission to discharge.",
  },
  phic: {
    label: "PHIC Status",
    message:
      "Henctr.phicclaim must be Y and Hpatcon.nbb must be Y for PHIC validation.",
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
  phicCore: ["phic"],
};

const FORM_REQUIREMENT_RULES = [
  {
    test: /discharge against medical advice|dama|discharge plan|medical abstract/i,
    groups: ["admissionCore", "dischargeCore"],
    label: "Discharge validation",
  },
  {
    test:
      /family planning|newborn|apgar|ballard|lubchenco|phototherapy|otoacoustic|child immunization|commitment to breastfeeding|partograph|pagtugot/i,
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
