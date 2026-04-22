import { useMemo } from "react";
import "./LaboratoryRequestOutside.css";

const Item = ({ label }) => (
  <div className="lro-item">[ ]{label}</div>
);

export default function LaboratoryRequestOutside({ patientName, patientData }) {
  const name      = patientName            || "BAYSA , BABY BOY";
  const age       = patientData?.age       || "1 hour(s)";
  const sex       = patientData?.sex       || "M";
  const birthdate = patientData?.birthdate || "April 22, 2026";
  const ward      = patientData?.ward      || "OB GYNE - OB 2 - BED 03 - NB";
  const category  = patientData?.category  || "NEWBORN";
  const caseNo    = patientData?.caseNo    || "ADM-2026-010651";
  const address   = patientData?.address   || "P10, DOÑA TELESFORA, TUBAY, AGUSAN DEL NORTE";
  const diagnosis = patientData?.diagnosis || "TERM MALE NEONATE DELIVERED NSVD CEPHALIC WITH AS 8,9 BS 40 WEEKS, BW 3.8 KGS, AGA";

  const { dateTimeStr, generatedOn } = useMemo(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const h = now.getHours();
    const m = now.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    const hh = String(h % 12 || 12).padStart(2, "0");
    const timeStr = `${hh}:${pad(m)} ${ampm}`;
    const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const dateTimeStr = `${dateStr} ${timeStr}`;
    const generatedOn = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${hh}:${pad(m)} ${ampm}`;
    return { dateTimeStr, generatedOn };
  }, []);

  return (
    <div className="lro-page">

      {/* ── Date/Time ── */}
      <div className="lro-datetime">Date and Time ordered: {dateTimeStr}</div>

      {/* ── Row 1 ── */}
      <div className="lro-row1">
        <div className="lro-field">
          <span className="lro-label">Name of Patient:</span>
          <span>{name}</span>
        </div>
        <div className="lro-field">
          <span className="lro-label">Age:</span>
          <span>{age}</span>
        </div>
        <div className="lro-field">
          <span className="lro-label">Sex:</span>
          <span>{sex}</span>
        </div>
        <div className="lro-field">
          <span className="lro-label">Birthdate:</span>
          <span>{birthdate}</span>
        </div>
      </div>

      {/* ── Row 2 ── */}
      <div className="lro-row2">
        <div className="lro-field">
          <span className="lro-label">Ward/OR#:</span>
          <span>{ward}</span>
        </div>
        <div className="lro-field">
          <span className="lro-label">Category:</span>
          <span>{category}</span>
        </div>
        <div className="lro-field">
          <span className="lro-label">Case Number:</span>
          <span>{caseNo}</span>
        </div>
      </div>

      {/* ── Address ── */}
      <div className="lro-address-row">
        <span className="lro-label">Address: </span>
        <span>{address}</span>
      </div>

      {/* ── Diagnosis ── */}
      <div className="lro-diag-row">
        <span className="lro-label">Diagnosis/Chief Complaint: </span>
        <span>{diagnosis}</span>
      </div>

      <hr className="lro-divider" />

      {/* ── Title ── */}
      <div className="lro-title">LABORATORY REQUEST</div>

      {/* ── Body: 2 columns ── */}
      <div className="lro-body">

        {/* LEFT */}
        <div>
          {/* HEMATOLOGY */}
          <div className="lro-section-title">HEMATOLOGY</div>
          <div className="lro-col-wrap">
            <div className="lro-col">
              <Item label="CBC" />
              <Item label="Platelet Count" />
              <Item label="Hemoglobin & Hematocrit" />
              <Item label="Bleeding Time" />
              <Item label="Clotting time" />
              <Item label="Peripheral Blood Smear" />
            </div>
            <div className="lro-col">
              <Item label="ESR" />
              <Item label="Malarial smear" />
              <Item label="PT" />
              <Item label="APTT" />
            </div>
          </div>

          {/* CLINICAL CHEMISTRY */}
          <div className="lro-section-title">CLINICAL CHEMISTRY</div>
          <div className="lro-col-wrap">
            <div className="lro-col">
              <Item label="FBS" />
              <Item label="RBS/2hr PPGT" />
              <Item label="HGT/CBG" />
              <Item label="Creatinine" />
              <Item label="BUA" />
              <Item label="SGOT" />
              <Item label="SGPT" />
              <Item label="ALP" />
              <Item label="ALBUMIN" />
              <Item label="Bilirubin (Total,B1,B2)" />
            </div>
            <div className="lro-col">
              <Item label="TOTAL CHOLESTEROL" />
              <Item label="LIPID PROFILE" />
              <Item label="BUN" />
              <Item label="TOTAL PROTEIN" />
              <Item label="AMYLASE" />
              <Item label="LIPASE" />
              <Item label="K" />
              <Item label="Na, K, Cl" />
              <Item label="CALCIUM" />
              <Item label="MAGNESIUM" />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          {/* IMMUNOLOGY/SEROLOGY/BLOOD BANKING */}
          <div className="lro-section-title">IMMUNOLOGY/SEROLOGY/BLOOD BANKING</div>
          <div className="lro-col-wrap">
            <div className="lro-col">
              <Item label="ABO and Rh typing" />
              <Item label="HBsAg" />
              <Item label="Dengue NS1Ag" />
              <Item label="Typhidot" />
              <Item label="HBA1c" />
              <Item label="ASO Titer" />
              <Item label="RPR/Syphilis/VDRL" />
              <Item label="Anti-HIV 1/2" />
            </div>
            <div className="lro-col">
              <Item label="Troponin I" />
              <Item label="T3" />
              <Item label="T4" />
              <Item label="TSH" />
              <Item label="Widal Test" />
              <Item label="Tubex" />
              <Item label="SARS-CoV 2" />
            </div>
          </div>

          {/* CLINICAL MICROSCOPY */}
          <div className="lro-section-title">CLINICAL MICROSCOPY</div>
          <div className="lro-col-wrap">
            <div className="lro-col">
              <Item label="URINALYSIS" />
              <Item label="HBsAg" />
              <Item label="FECALYSIS" />
              <Item label="KATO KATZ" />
            </div>
            <div className="lro-col">
              <Item label="PREGNANCY TEST" />
              <Item label="FECAL OCCULT BLOOD" />
            </div>
          </div>

          {/* OTHERS */}
          <div className="lro-others-label">OTHERS:</div>
          <div className="lro-line" />
          <div className="lro-line" />

          {/* MD */}
          <div className="lro-md-wrap">
            <div className="lro-md-line" />
            <span className="lro-md-label">,MD</span>
          </div>
          <div className="lro-req-physician">Requesting Physician</div>
        </div>

      </div>

      {/* ── Footer ── */}
      <div className="lro-footer">
        Generated by: TCP T. TCP on {generatedOn}
      </div>

    </div>
  );
}