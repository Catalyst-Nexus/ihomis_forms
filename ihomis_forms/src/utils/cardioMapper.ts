export const mapCardioFormData = (data) => {
  // ✅ handle undefined, null, array, or object safely
  const patient = Array.isArray(data) ? data[0] : data || {};

  console.log("CARDIO RAW INPUT:", patient);

  return {
    caseNumber: patient.case_number ?? "—",
    department: patient.ward_category ?? "—",
    date: patient.admission_date ?? "—",
    hospitalNo: patient.hospital_number ?? "—",
    patientName: patient.patient_name ?? "—",
    sex: patient.patsex ?? "—",
    age: patient.age ?? "—",

    generatedOn: new Date().toLocaleString(),
    generatedBy: "TCP T. TCP",
  };
};