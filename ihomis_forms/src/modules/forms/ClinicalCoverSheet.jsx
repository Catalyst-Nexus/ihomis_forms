import { useEffect, useMemo, useState } from "react";
import "./ClinicalCoverSheet.css";

const splitNameParts = (fullName = "") => {
  const trimmed = String(fullName).trim();
  if (!trimmed) {
    return { lastName: "", firstName: "", middleName: "" };
  }

  if (trimmed.includes(",")) {
    const [last, rest] = trimmed.split(",");
    const parts = String(rest || "").trim().split(/\s+/).filter(Boolean);
    return {
      lastName: String(last || "").trim(),
      firstName: parts.shift() || "",
      middleName: parts.join(" "),
    };
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return { lastName: parts[0], firstName: "", middleName: "" };
  }

  return {
    lastName: parts[parts.length - 1],
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(" "),
  };
};

const formatDateOnly = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? dateStr : date.toISOString().split("T")[0];
};

const calculateTotalDays = (admission, discharge) => {
  if (!admission || !discharge) return "";
  const start = new Date(admission);
  const end = new Date(discharge);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";
  
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? diffDays : 0;
};

const checkMatch = (val, target) => String(val || "").toLowerCase() === target.toLowerCase();

const getUserByTitle = (users = [], title) =>
  users.find(u =>
    (u.postitle || "").toUpperCase().trim() === title.toUpperCase().trim()
  );

const buildInitialFormData = (patient = {}, chart = {}, users = [], patientName = "") => {
  const nameParts = splitNameParts(patientName);

  // Combine Ward/Room/Bed components
  const wardInfo = [
    patient.ward_name,
    patient.room_name,
    patient.bed_name,
    patient.room_number
  ].filter(Boolean).join(" / ");

  // Ensure dates are clean for both display and calculation
  const admDate = formatDateOnly(patient.admissionDate || patient.admission_date || "");
  const disDate = formatDateOnly(
  patient.discharge_date || patient.dischargeDate || chart.discharge_date || ""
  );

  // Mapping string values for checkboxes
  const mapAdmissionType = (raw) => {
    const normalized = String(raw || "").toLowerCase().trim();
    
    // Use .includes() instead of strict === to handle variations like "New Patient"
    return {
      isNew: normalized.includes("new"),
      isOld: normalized.includes("old"),
      isFormer: normalized.includes("former") || normalized.includes("opd")
    };
  };
  const { isNew: admissionTypeNew, isOld: admissionTypeOld, isFormer: admissionTypeFormer } = mapAdmissionType(patient.admission_type || patient.type_of_admission || "");
  const admissionType = admissionTypeNew ? "new" : admissionTypeOld ? "old" : admissionTypeFormer ? "former" : "";
  const disposition = patient.disposition || "";
  const condition = patient.condition || "";
  const admittingClerk = getUserByTitle(users, "ADMITTING CLERK");
  const attendingPhysician = getUserByTitle(users, "MOA PHYSICIAN");
  


  return {
    caseNo: patient.caseNum || patient.caseNo || chart.case_no || "",
    srCitizenNo: patient.srCitizen || patient.senior_citizen_no || "",
    hospitalNo: patient.hospitalNo || patient.hospital_number || "",
    
    lastName: patient.lastName || patient.last_name || nameParts.lastName || "",
    firstName: patient.firstName || patient.first_name || nameParts.firstName || "",
    middleName: patient.middleName || patient.middle_name || nameParts.middleName || "",
    
    wardRoomBed: wardInfo || patient.wardRoomBed || "",
    
    // Service mapping from ward_category
    service: patient.ward_category || patient.service || chart.service_type || "",
    
    address: patient.address || patient.permanent_address || "",
    telNo: patient.contactNo || patient.contactNumber || patient.mobile_no || "",
    sex: patient.sexLabel || patient.sex || "",
    civilStatus: patient.civilStatus || patient.civil_status || "",
    birthdate: formatDateOnly(patient.birthDate || patient.birthdate || ""),
    age: patient.age || "",
    birthPlace: patient.birthPlace || "",
    nationality: patient.nationality || "",
    religion: patient.religion || "",
    occupation: patient.occupation || "",
    indigenous: patient.indigenous || "",

    // Type of Admission
    typeAdmissionNew: admissionType === "new",
    typeAdmissionOld: admissionType === "old",
    typeAdmissionFormer: admissionType.includes("former") || admissionType.includes("opd"),
    
    // Referred By mapping from requesting_physician
    referredBy: patient.requesting_physician || patient.referredBy || patient.referred_by || "",
    
    admissionDate: admDate,
    admissionTime: patient.admissionTime || patient.admission_time || "",
    dischargeDate: disDate,
    dischargeTime: patient.discharge_time || patient.dischargeTime || chart.discharge_time || "",
    
    // Calculated Total Days
    totalDays: calculateTotalDays(admDate, disDate),
    
    admittingClerk: patient.admitting_clerk || patient.admittingClerk || admittingClerk?.full_name || "",
    admittingPhysician: patient.admittingPhysician || patient.admitting_dr || "",
    attendingPhysician: attendingPhysician?.full_name || "",

    admissionDiagnosis: patient.admission_diagnosis || patient.admitting_diagnosis || "",
    chiefComplaint: patient.chief_complaint || patient.complaint || "",
    dischargeDiagnosis: patient.discharge_diagnosis || patient.dischargeDiagnosis || "",
    icdCode: patient.icd_code || patient.icdCode || "",
    rvu: patient.rvu || chart.rvu_score || "",

    // Vitals Mapping (Corrected per requirements)
    bp: patient.bp || patient.blood_pressure || "",
    pr: patient.pr || patient.pulse || "",
    rr: patient.rr || patient.resp || "",
    temperature: patient.temperature || patient.temp || "",
    height: patient.height || "",
    weight: patient.weight || "",
    oxygenSat: patient.oxygenSat || patient.o2sats || "",
    fetalHeartRate: patient.fetalHeartRate || patient.fhr || "",

    // Disposition Logic
    dispositionDischarged: checkMatch(disposition, "discharged"),
    dispositionTransferred: checkMatch(disposition, "transferred"),
    dispositionDied: checkMatch(disposition, "died"),
    dispositionDama: checkMatch(disposition, "dama"),
    dispositionAbsconded: checkMatch(disposition, "absconded"),

    // Condition Logic
    conditionRecovered: checkMatch(condition, "recovered"),
    conditionImproved: checkMatch(condition, "improved"),
    conditionUnimproved: checkMatch(condition, "unimproved"),
    conditionDied: checkMatch(condition, "died"),
    conditionUnder48: checkMatch(condition, "under 48") || checkMatch(condition, "0-48 hours"),
    conditionOver48: checkMatch(condition, "over 48") || checkMatch(condition, "+48 hours"),
    conditionAutopsied: checkMatch(condition, "autopsied"),
    conditionNoAutopsied: checkMatch(condition, "no autopsied") || checkMatch(condition, "not autopsied"),

    signatureErDr: "",
    signatureWard: "",
  };
};

export default function ClinicalCoverSheet({ patientName, patientData = {}, users = [] }) {
  const [formData, setFormData] = useState(() =>
  buildInitialFormData(patientData, {}, users, patientName)
  );

  useEffect(() => {
  setFormData(buildInitialFormData(patientData, {}, users, patientName));
  }, [patientData, users, patientName]);

  const generatedOn = useMemo(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const timeStr = now
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate(),
    )} ${timeStr}`;
  }, []);

  const generatedBy = "TCP T. TCP";

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleCheckbox = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="ccs-page">
      <div className="ccs-row ccs-row-title">
        <div className="ccs-cell ccs-title">Clinical Cover Sheet</div>
        <div className="ccs-cell ccs-title">
          <span className="ccs-label">Case No.:</span>
          <input
            className="ccs-input"
            value={formData.caseNo}
            onChange={(e) => handleChange("caseNo", e.target.value)}
            type="text"
          />
        </div>
      </div>

      <div className="ccs-row ccs-row-identifiers">
        <div className="ccs-cell">
          <span className="ccs-label">Sr. Citizen No.:</span>
          <input
            className="ccs-input"
            value={formData.srCitizenNo}
            onChange={(e) => handleChange("srCitizenNo", e.target.value)}
            type="text"
          />
        </div>
        <div className="ccs-cell">
          <span className="ccs-label">Hospital No.:</span>
          <input
            className="ccs-input"
            value={formData.hospitalNo}
            onChange={(e) => handleChange("hospitalNo", e.target.value)}
            type="text"
          />
        </div>
      </div>

      <div className="ccs-row ccs-row-name">
        <div className="ccs-cell ccs-label-cell">Patient Name:</div>
        <div className="ccs-cell ccs-name-fields">
          <div className="ccs-name-grid">
            <div className="ccs-name-cell">
              <input
                className="ccs-input"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                type="text"
              />
              <span className="ccs-name-label">Last Name</span>
            </div>
            <div className="ccs-name-cell">
              <input
                className="ccs-input"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                type="text"
              />
              <span className="ccs-name-label">First Name</span>
            </div>
            <div className="ccs-name-cell">
              <input
                className="ccs-input"
                value={formData.middleName}
                onChange={(e) => handleChange("middleName", e.target.value)}
                type="text"
              />
              <span className="ccs-name-label">Middle Name</span>
            </div>
          </div>
        </div>
        <div className="ccs-cell ccs-side-block">
          <div className="ccs-side-grid">
            <div className="ccs-side-cell">
              <span className="ccs-label">Ward/Room/Bed</span>
              <input
                className="ccs-input"
                value={formData.wardRoomBed}
                onChange={(e) => handleChange("wardRoomBed", e.target.value)}
                type="text"
              />
            </div>
            <div className="ccs-side-cell">
              <span className="ccs-label">Service</span>
              <input
                className="ccs-input"
                value={formData.service}
                onChange={(e) => handleChange("service", e.target.value)}
                type="text"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="ccs-row ccs-row-address">
        <div className="ccs-cell">
          <span className="ccs-label">Permanent Address</span>
          <input
            className="ccs-input"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            type="text"
          />
        </div>
        <div className="ccs-cell ccs-side-block">
          <div className="ccs-side-grid">
            <div className="ccs-side-cell">
              <span className="ccs-label">Tel. No./CP No.</span>
              <input
                className="ccs-input"
                value={formData.telNo}
                onChange={(e) => handleChange("telNo", e.target.value)}
                type="text"
              />
            </div>
            <div className="ccs-side-cell ccs-side-split">
              <div className="ccs-split-cell">
                <span className="ccs-label">Sex</span>
                <input
                  className="ccs-input"
                  value={formData.sex}
                  onChange={(e) => handleChange("sex", e.target.value)}
                  type="text"
                />
              </div>
              <div className="ccs-split-cell">
                <span className="ccs-label">Civil Status</span>
                <input
                  className="ccs-input"
                  value={formData.civilStatus}
                  onChange={(e) => handleChange("civilStatus", e.target.value)}
                  type="text"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ccs-row ccs-row-birth">
        <div className="ccs-cell">
          <span className="ccs-label">Birthdate</span>
          <input
            className="ccs-input"
            value={formData.birthdate}
            onChange={(e) => handleChange("birthdate", e.target.value)}
            type="text"
          />
        </div>
        <div className="ccs-cell">
          <span className="ccs-label">Age</span>
          <input
            className="ccs-input"
            value={formData.age}
            onChange={(e) => handleChange("age", e.target.value)}
            type="text"
          />
        </div>
        <div className="ccs-cell">
          <span className="ccs-label">Birth Place</span>
          <input
            className="ccs-input"
            value={formData.birthPlace}
            onChange={(e) => handleChange("birthPlace", e.target.value)}
            type="text"
          />
        </div>
        <div className="ccs-cell">
          <span className="ccs-label">Nationality</span>
          <input
            className="ccs-input"
            value={formData.nationality}
            onChange={(e) => handleChange("nationality", e.target.value)}
            type="text"
          />
        </div>
        <div className="ccs-cell">
          <span className="ccs-label">Religion</span>
          <input
            className="ccs-input"
            value={formData.religion}
            onChange={(e) => handleChange("religion", e.target.value)}
            type="text"
          />
        </div>
        <div className="ccs-cell">
          <span className="ccs-label">Occupation</span>
          <input
            className="ccs-input"
            value={formData.occupation}
            onChange={(e) => handleChange("occupation", e.target.value)}
            type="text"
          />
        </div>
        <div className="ccs-cell">
          <span className="ccs-label">Indigenous</span>
          <input
            className="ccs-input"
            value={formData.indigenous}
            onChange={(e) => handleChange("indigenous", e.target.value)}
            type="text"
          />
        </div>
      </div>

      <div className="ccs-row ccs-row-admission-type">
        <div className="ccs-cell">
          <span className="ccs-label">Type of Admission</span>
          <div className="ccs-checkbox-row">
            <label className="ccs-checkbox">
              <input
                type="checkbox"
                checked={formData.typeAdmissionNew}
                onChange={() => toggleCheckbox("typeAdmissionNew")}
              />
              New
            </label>
            <label className="ccs-checkbox">
              <input
                type="checkbox"
                checked={formData.typeAdmissionOld}
                onChange={() => toggleCheckbox("typeAdmissionOld")}
              />
              Old
            </label>
            <label className="ccs-checkbox">
              <input
                type="checkbox"
                checked={formData.typeAdmissionFormer}
                onChange={() => toggleCheckbox("typeAdmissionFormer")}
              />
              Former OPD
            </label>
          </div>
        </div>
        <div className="ccs-cell ccs-cell--green">
          <span className="ccs-label">Referred by (Physician)</span>
          <input
            className="ccs-input"
            value={formData.referredBy}
            onChange={(e) => handleChange("referredBy", e.target.value)}
            type="text"
          />
        </div>
      </div>

      <div className="ccs-row ccs-row-admission">
        <div className="ccs-cell ccs-cell--blue">
          <span className="ccs-label">Admission</span>
          <div className="ccs-field-pair">
            <span className="ccs-sub-label">Date:</span>
            <input
              className="ccs-input"
              value={formData.admissionDate}
              onChange={(e) => handleChange("admissionDate", e.target.value)}
              type="text"
            />
          </div>
          <div className="ccs-field-pair">
            <span className="ccs-sub-label">Time:</span>
            <input
              className="ccs-input"
              value={formData.admissionTime}
              onChange={(e) => handleChange("admissionTime", e.target.value)}
              type="text"
            />
          </div>
        </div>
        <div className="ccs-cell ccs-cell--blue">
          <span className="ccs-label">Discharge</span>
          <div className="ccs-field-pair">
            <span className="ccs-sub-label">Date:</span>
            <input
              className="ccs-input"
              value={formData.dischargeDate}
              onChange={(e) => handleChange("dischargeDate", e.target.value)}
              type="text"
            />
          </div>
          <div className="ccs-field-pair">
            <span className="ccs-sub-label">Time:</span>
            <input
              className="ccs-input"
              value={formData.dischargeTime}
              onChange={(e) => handleChange("dischargeTime", e.target.value)}
              type="text"
            />
          </div>
        </div>
        <div className="ccs-cell ccs-cell--blue">
          <span className="ccs-label">Total No. of Days</span>
          <input
            className="ccs-input"
            value={formData.totalDays}
            onChange={(e) => handleChange("totalDays", e.target.value)}
            type="text"
          />
        </div>
      </div>

      <div className="ccs-row ccs-row-physicians">
        <div className="ccs-cell ccs-cell--blue">
          <span className="ccs-label">Admitting Clerk</span>
          <input
            className="ccs-input"
            value={formData.admittingClerk}
            onChange={(e) => handleChange("admittingClerk", e.target.value)}
            type="text"
          />
        </div>
        <div className="ccs-cell ccs-cell--blue">
          <span className="ccs-label">Admitting Physician</span>
          <input
            className="ccs-input"
            value={formData.admittingPhysician}
            onChange={(e) => handleChange("admittingPhysician", e.target.value)}
            type="text"
          />
          <div className="ccs-signature-line">Signature over Printed Name</div>
        </div>
        <div className="ccs-cell ccs-cell--blue">
          <span className="ccs-label">Attending Physician</span>
          <input
            className="ccs-input"
            value={formData.attendingPhysician}
            onChange={(e) => handleChange("attendingPhysician", e.target.value)}
            type="text"
          />
          <div className="ccs-signature-line">Signature over Printed Name</div>
        </div>
      </div>

      <div className="ccs-row ccs-row-diagnosis">
        <div className="ccs-cell">
          <span className="ccs-label">Admission Diagnosis</span>
          <textarea
            className="ccs-textarea"
            value={formData.admissionDiagnosis}
            onChange={(e) => handleChange("admissionDiagnosis", e.target.value)}
            rows={3}
          />
        </div>
        <div className="ccs-cell">
          <span className="ccs-label">Chief Complaint</span>
          <textarea
            className="ccs-textarea"
            value={formData.chiefComplaint}
            onChange={(e) => handleChange("chiefComplaint", e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="ccs-row ccs-row-discharge">
        <div className="ccs-cell">
          <span className="ccs-label">Discharge Diagnosis</span>
          <textarea
            className="ccs-textarea"
            value={formData.dischargeDiagnosis}
            onChange={(e) => handleChange("dischargeDiagnosis", e.target.value)}
            rows={3}
          />
        </div>
        <div className="ccs-cell ccs-icd-cell">
          <span className="ccs-label">ICD Code</span>
          <input
            className="ccs-input"
            value={formData.icdCode}
            onChange={(e) => handleChange("icdCode", e.target.value)}
            type="text"
          />
          <span className="ccs-label">RVU</span>
          <input
            className="ccs-input"
            value={formData.rvu}
            onChange={(e) => handleChange("rvu", e.target.value)}
            type="text"
          />
        </div>
      </div>

      <div className="ccs-row ccs-row-vitals">
        <div className="ccs-cell">
          <span className="ccs-label">Blood Pressure</span>
          <input
            className="ccs-input"
            value={formData.bp}
            onChange={(e) => handleChange("bp", e.target.value)}
            type="text"
          />
        </div>
        <div className="ccs-cell">
          <span className="ccs-label">Pulse Rate</span>
          <input
            className="ccs-input"
            value={formData.pr}
            onChange={(e) => handleChange("pr", e.target.value)}
            type="text"
          />
        </div>
        <div className="ccs-cell">
          <span className="ccs-label">Respiratory Rate</span>
          <input
            className="ccs-input"
            value={formData.rr}
            onChange={(e) => handleChange("rr", e.target.value)}
            type="text"
          />
        </div>
        <div className="ccs-cell">
          <span className="ccs-label">Temperature</span>
          <input
            className="ccs-input"
            value={formData.temperature}
            onChange={(e) => handleChange("temperature", e.target.value)}
            type="text"
          />
        </div>
      </div>

      <div className="ccs-row ccs-row-vitals">
        <div className="ccs-cell">
          <span className="ccs-label">Height</span>
          <input
            className="ccs-input"
            value={formData.height}
            onChange={(e) => handleChange("height", e.target.value)}
            type="text"
          />
        </div>
        <div className="ccs-cell">
          <span className="ccs-label">Weight</span>
          <input
            className="ccs-input"
            value={formData.weight}
            onChange={(e) => handleChange("weight", e.target.value)}
            type="text"
          />
        </div>
        <div className="ccs-cell">
          <span className="ccs-label">Oxygen Saturation</span>
          <input
            className="ccs-input"
            value={formData.oxygenSat}
            onChange={(e) => handleChange("oxygenSat", e.target.value)}
            type="text"
          />
        </div>
        <div className="ccs-cell">
          <span className="ccs-label">Fetal Heart Rate</span>
          <input
            className="ccs-input"
            value={formData.fetalHeartRate}
            onChange={(e) => handleChange("fetalHeartRate", e.target.value)}
            type="text"
          />
        </div>
      </div>

      <div className="ccs-row ccs-row-disposition">
        <div className="ccs-cell ccs-cell--blue">
          <span className="ccs-label">Disposition</span>
          <div className="ccs-checkbox-grid">
            <label className="ccs-checkbox">
              <input
                type="checkbox"
                checked={formData.dispositionDischarged}
                onChange={() => toggleCheckbox("dispositionDischarged")}
              />
              Discharged
            </label>
            <label className="ccs-checkbox">
              <input
                type="checkbox"
                checked={formData.dispositionTransferred}
                onChange={() => toggleCheckbox("dispositionTransferred")}
              />
              Transferred
            </label>
            <label className="ccs-checkbox">
              <input
                type="checkbox"
                checked={formData.dispositionDied}
                onChange={() => toggleCheckbox("dispositionDied")}
              />
              Died
            </label>
            <label className="ccs-checkbox">
              <input
                type="checkbox"
                checked={formData.dispositionDama}
                onChange={() => toggleCheckbox("dispositionDama")}
              />
              DAMA
            </label>
            <label className="ccs-checkbox">
              <input
                type="checkbox"
                checked={formData.dispositionAbsconded}
                onChange={() => toggleCheckbox("dispositionAbsconded")}
              />
              Absconded
            </label>
          </div>
        </div>
        <div className="ccs-cell ccs-cell--blue">
          <span className="ccs-label">Condition</span>
          <div className="ccs-checkbox-grid">
            <label className="ccs-checkbox">
              <input
                type="checkbox"
                checked={formData.conditionRecovered}
                onChange={() => toggleCheckbox("conditionRecovered")}
              />
              Recovered
            </label>
            <label className="ccs-checkbox">
              <input
                type="checkbox"
                checked={formData.conditionImproved}
                onChange={() => toggleCheckbox("conditionImproved")}
              />
              Improved
            </label>
            <label className="ccs-checkbox">
              <input
                type="checkbox"
                checked={formData.conditionUnimproved}
                onChange={() => toggleCheckbox("conditionUnimproved")}
              />
              Unimproved
            </label>
            <label className="ccs-checkbox">
              <input
                type="checkbox"
                checked={formData.conditionDied}
                onChange={() => toggleCheckbox("conditionDied")}
              />
              Died
            </label>
            <label className="ccs-checkbox">
              <input
                type="checkbox"
                checked={formData.conditionUnder48}
                onChange={() => toggleCheckbox("conditionUnder48")}
              />
              0-48 Hours
            </label>
            <label className="ccs-checkbox">
              <input
                type="checkbox"
                checked={formData.conditionOver48}
                onChange={() => toggleCheckbox("conditionOver48")}
              />
              +48 Hours
            </label>
            <label className="ccs-checkbox">
              <input
                type="checkbox"
                checked={formData.conditionAutopsied}
                onChange={() => toggleCheckbox("conditionAutopsied")}
              />
              Autopsied
            </label>
            <label className="ccs-checkbox">
              <input
                type="checkbox"
                checked={formData.conditionNoAutopsied}
                onChange={() => toggleCheckbox("conditionNoAutopsied")}
              />
              No Autopsied
            </label>
          </div>
        </div>
      </div>

      <div className="ccs-row ccs-row-signatures">
        <div className="ccs-cell ccs-cell--green">
          <input
            className="ccs-signature-input"
            value={formData.signatureErDr}
            onChange={(e) => handleChange("signatureErDr", e.target.value)}
            type="text"
          />
          <span className="ccs-signature-label">
            Signature of Attending Nurse/Nurse Attendant (ER/DR)
          </span>
        </div>
        <div className="ccs-cell ccs-cell--blue">
          <input
            className="ccs-signature-input"
            value={formData.signatureWard}
            onChange={(e) => handleChange("signatureWard", e.target.value)}
            type="text"
          />
          <span className="ccs-signature-label">
            Signature of Attending Nurse/Nurse Attendant (Ward)
          </span>
        </div>
      </div>

      <div className="ccs-footer">
        Generated by: {generatedBy} on {generatedOn}
      </div>
    </div>
  );
}
