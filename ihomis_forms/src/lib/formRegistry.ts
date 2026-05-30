const FORM_MODULES = import.meta.glob("../modules/forms/!(*Forms*|Modal|Sidebar).{js,jsx,ts,tsx}", {
  eager: true,
});

function getComponentNameFromPath(path) {
  const match = path.match(/\/([^/]+)\.[jt]sx?$/);

  return match ? match[1] : "";
}

const FORM_COMPONENT_MAP = {};

for (const [path, module] of Object.entries(FORM_MODULES)) {
  const componentName = getComponentNameFromPath(path);
  const component = module?.default;

  if (componentName && component) {
    FORM_COMPONENT_MAP[componentName] = component;
  }
}

const COMPONENT_ALIASES = {
  BloodTransfusionSheet: "BloodtransfusionSheet",
  PagtugotWaizer: "PagtugotWaiver",
};

const MULTI_PAGE_COMPONENTS = new Set([
  "BloodRequestAdult",
  "BloodRequestPediatric",
  "BloodtransfusionSheet",
  "BloodTransfusionSheet",
  "BloodTransfusionReactionRegistry",
  "TPRSheet",
  "MonitoringSheet",
  "MedicationSheet",
  "IntakeOutputSheet",
  "KardexSheet",
  "NursesNotes",
  "Partograph",
  "Neurologic",
  "PostAnesthesiaSheet",
  "MIS",
]);

function resolveComponentName(componentName) {
  return COMPONENT_ALIASES[componentName] || componentName || "";
}

export function getFormComponent(componentName) {
  return FORM_COMPONENT_MAP[resolveComponentName(componentName)] || null;
}

export function isMultiPageComponent(componentName) {
  return MULTI_PAGE_COMPONENTS.has(resolveComponentName(componentName));
}

export function getComponentProps(componentName, patientName, patientData) {
  if (componentName === "ApgarScoring") {
    return { apiResponse: patientData };
  }

  if (componentName === "ClinicalReferralSlip") {
    return { patientName };
  }

  return { patientName, patientData };
}

export function getFormTitle(description) {
  if (!description) {
    return "";
  }

  let title = description.toUpperCase();

  if (description === "Blood Request Form (Pedia)") {
    title = "BLOOD REQUEST FORM (PEDIATRIC)";
  } else if (description === "Clinical Cover Sheet") {
    title = "";
  }

  return title;
}

export { FORM_COMPONENT_MAP as COMPONENT_MAP, MULTI_PAGE_COMPONENTS };