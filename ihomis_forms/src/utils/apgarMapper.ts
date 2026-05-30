export const extractDeliveryType = (text = "") => {
  const value = String(text).toUpperCase();

  if (value.includes("CESAREAN")) return "Cesarean Section";
  if (value.includes("NORMAL")) return "Normal Delivery";
  if (value.includes("VAGINAL")) return "Vaginal Delivery";

  return "Unknown";
};

export const mapApgarFormData = (raw) => {
  // ✅ Normalize API shape (handles ALL cases)
  const patient =
    raw?.data?.[0] ||
    raw?.[0] ||
    raw ||
    {};

  return {
    caseNum: patient.case_number ?? "",

    babyDisplayName: patient.patient_name ?? "",
    babySex: patient.patsex ?? patient.sex ?? "",
    babyAge: patient.age ?? "",

    motherName:
      patient.mothers_name ??
      `${patient.mother_first_name ?? ""} ${patient.mother_middle_name ?? ""} ${patient.mother_last_name ?? ""}`.trim(),

    motherSex: "",

    address: patient.patient_address ?? "",

    hospitalNo: patient.hospital_number ?? "",

    deliveryType: extractDeliveryType(
      patient.icd_code ?? patient.chief_complaint ?? ""
    ),

    obstetrician: patient.requesting_physician ?? "",

    anesthesia: "",
    anesthesiologist: "",

    generatedOn: new Date().toLocaleString(),
  };
};