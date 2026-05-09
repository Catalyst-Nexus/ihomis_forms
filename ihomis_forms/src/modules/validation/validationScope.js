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

const FORM_VALIDATION_REQUIREMENTS = {
  "Medical Abstract / Discharge Summary Form": {
    discharge: ["finalDiagnosis", "icdCode", "dischargeOrder", "courseWard"],
  },
  "Discharge Plan/Referral Slip": {
    discharge: ["dischargeOrder"],
  },
  "Discharge Against Medical Advice (DAMA) / Out on Pass Form": {
    discharge: ["dischargeOrder"],
  },
};

function normalizeSelectedForms(selectedForms) {
  if (!selectedForms) return [];
  if (selectedForms instanceof Set) return Array.from(selectedForms);
  if (Array.isArray(selectedForms)) return selectedForms;
  return [];
}

function normalizeFormName(formName) {
  return String(formName || "").trim();
}

function getRequirementsForForm(formName) {
  const normalized = normalizeFormName(formName);
  if (!normalized) return { admission: [], discharge: [] };

  const direct = FORM_VALIDATION_REQUIREMENTS[normalized];
  if (direct) {
    return {
      admission: direct.admission || [],
      discharge: direct.discharge || [],
    };
  }

  return { admission: [], discharge: [] };
}

export function buildScopedValidationSummary(summary, selectedForms) {
  const normalized = normalizeSelectedForms(selectedForms);

  if (!normalized.length) {
    return summary;
  }

  const admissionMissingSet = new Set(summary.admissionMissing || []);
  const dischargeMissingSet = new Set(summary.dischargeMissing || []);

  const scopedAdmissionMissing = new Set();
  const scopedDischargeMissing = new Set();

  normalized.forEach((formName) => {
    const { admission, discharge } = getRequirementsForForm(formName);

    admission.forEach((field) => {
      if (admissionMissingSet.has(field)) scopedAdmissionMissing.add(field);
    });

    discharge.forEach((field) => {
      if (dischargeMissingSet.has(field)) scopedDischargeMissing.add(field);
    });
  });

  const admissionMissing = Array.from(scopedAdmissionMissing);
  const dischargeMissing = Array.from(scopedDischargeMissing);
  const admissionComplete = admissionMissing.length === 0;
  const dischargeComplete = dischargeMissing.length === 0;

  return {
    ...summary,
    admissionMissing,
    dischargeMissing,
    allMissing: [...admissionMissing, ...dischargeMissing],
    admissionComplete,
    dischargeComplete,
    hasIssues: admissionMissing.length > 0 || dischargeMissing.length > 0,
  };
}

export function buildMissingByForm(summary, selectedForms) {
  const normalized = normalizeSelectedForms(selectedForms);
  const admissionMissingSet = new Set(summary.admissionMissing || []);
  const dischargeMissingSet = new Set(summary.dischargeMissing || []);

  return normalized
    .map((formName) => {
      const { admission, discharge } = getRequirementsForForm(formName);
      const admissionMissing = admission.filter((field) => admissionMissingSet.has(field));
      const dischargeMissing = discharge.filter((field) => dischargeMissingSet.has(field));
      const allMissing = [...admissionMissing, ...dischargeMissing];

      return {
        formName,
        admissionMissing,
        dischargeMissing,
        allMissing,
      };
    })
    .filter((entry) => entry.allMissing.length > 0);
}

export function getFieldLabel(field) {
  return FIELD_LABELS[field] || String(field || "");
}

export function getFormValidationRequirements() {
  return FORM_VALIDATION_REQUIREMENTS;
}
