import { useMemo } from "react";
import "./RequestBloodCompatibility.css";

export default function RequestBloodCompatibility({ patientName, patientData }) {
  const name      = patientName             || "SALUCANA , NELLY JEAN LOFRANCO";
  const hospNo    = patientData?.hospitalNo || "000000000021386";
  const caseNo    = patientData?.caseNo     || "ADM-2026-010707";
  const sex       = patientData?.sex        || "F";
  const age       = patientData?.age        || "32";
  const birthdate = patientData?.birthdate  || "July 27, 1993";
  const room      = patientData?.room       || "OB GYNE - POST-OP OB - BED 07";
  const bloodType = patientData?.bloodType  || "";
  const address   = patientData?.address    || "P-1E, AMPAYON, BUTUAN CITY (Capital), AGUSAN DEL NORTE";
  const diagnosis = patientData?.diagnosis  || "G2P1 (1001) PREGNANCY UTERINE 38 4/7 WEEKS AOG BY LMP, CEPHALIC NOT IN LABOR, S/P PRIMARY LSCS FOR IAI (JAN 2023, MJSH)";
  const admitting = patientData?.admitting  || "";

  const { generatedOn } = useMemo(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const h = now.getHours();
    const m = now.getMinutes();
    const ampm = h >= 12 ? "pm" : "am";
    const hh = String(h % 12 || 12).padStart(2, "0");
    return {
      generatedOn: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${hh}:${pad(m)} ${ampm}`,
    };
  }, []);

  return (
    <div className="rbc-page">
      <div className="rbc-header">
        <br />
        <div className="rbc-info-grid">
          <div className="rbc-info-cell">
            <span className="rbc-lbl">Hospital No.:</span>
            <span className="rbc-val"> {hospNo}</span>
          </div>
          <div className="rbc-info-cell">
            <span className="rbc-lbl">Case Number:</span>
            <span className="rbc-val"> {caseNo}</span>
          </div>

          <div className="rbc-info-cell">
            <span className="rbc-lbl">Patient Name:</span>
            <span className="rbc-val"> {name}</span>
          </div>
          <div className="rbc-info-cell">
            <span className="rbc-lbl">Sex:</span>
            <span className="rbc-val"> {sex}</span>
          </div>

          <div className="rbc-info-cell">
            <span className="rbc-lbl">Room No.:</span>
            <span className="rbc-val"> {room}</span>
          </div>
          <div className="rbc-info-cell">
            <span className="rbc-lbl">Age:</span>
            <span className="rbc-val"> {age}</span>
          </div>
        </div>

        {/* Address — full width */}
        <div className="rbc-address-row">
          <span className="rbc-lbl">Address: </span>
          <span className="rbc-val">{address}</span>
        </div>

        {/* Admitting Impression */}
        <div className="rbc-diag-row">
          <span className="rbc-lbl">Admitting Impression/Clinical Diagnosis:</span>
          <span className="rbc-val"> {admitting}{diagnosis}</span>
          <span className="rbc-ul" style={{ width: "20mm" }} />
        </div>
      </div>

      {/* ── Blood type checklist ── */}
      <div className="rbc-blood-grid">
        <div className="rbc-check-item">[ ] Whole Blood</div>
        <div className="rbc-check-item">[ ] Plasma</div>
        <div className="rbc-check-item">[ ] Fresh Whole Blood</div>
        <div className="rbc-check-item">[ ] Platelet Concentrate</div>
        <div className="rbc-check-item">[ ] Packed Red Cells</div>
        <div className="rbc-check-item">[ ] Fresh Frozen Plasma</div>
        <div className="rbc-check-item">[ ] Washed Rec Cells</div>
        <div className="rbc-check-item">[ ] Others</div>
      </div>

      {/* ── Routine / Emergency ── */}
      <div className="rbc-routine-section">
        <div>[ ] ROUTINE</div>
        <div>[ ] EMERGENCY</div>
      </div>

      {/* ── Extreme Need Section ── */}
      <div className="rbc-extreme-section">
        <div className="rbc-extreme-title">EXTREME NEED OF BLOOD: (TO BE FILLED UP BY CLINICIANS ONLY)</div>
        <div className="rbc-extreme-subtitle">I hereby direct the blood bank to release the following.</div>
        <div className="rbc-extreme-sub2">(Please check the appropriate box or boxes needed)</div>
        <div className="rbc-extreme-items">
          <div className="rbc-extreme-item">[ ] ABO and RH Type - Specific <strong>UNCROSSMATCHED Blood</strong></div>
          <div className="rbc-extreme-item">[ ] GROSS "O" <strong>UNCROSSMATCHED Blood</strong>(if available)</div>
          <div className="rbc-extreme-item">[ ] Crossmatched Blood - <strong>SALINE</strong> Phase only (tube method)</div>
          <div className="rbc-extreme-item">[ ] Crossmatched Blood - <strong>SALINE</strong> and <strong>ALBUMIN</strong>Phase only (tube method)</div>
          <div className="rbc-extreme-item">[ ]Crossmatched Blood - AHG Phase (30 min.)</div>
        </div>
      </div>

      {/* ── Justification ── */}
      <div className="rbc-just-row">
        <span>Justification for emergency release of blood</span>
        <span className="rbc-just-line" />
      </div>
      <div className="rbc-full-line" />

      {/* ── Requested by ── */}
      <div className="rbc-req-row">
        <span className="rbc-lbl">Requested by:</span>
      </div>

      {/* ── MD / RN Signatures ── */}
      <div className="rbc-sig-row">
        <div className="rbc-sig-block">
          <div className="rbc-sig-line-row">
            <span className="rbc-sig-line" />
            <span className="rbc-sig-suffix">,M.D.</span>
          </div>
          <div className="rbc-sig-label">Signature over Printed Name of Physician</div>
        </div>
        <div className="rbc-sig-block">
          <div className="rbc-sig-line-row">
            <span className="rbc-sig-line" />
            <span className="rbc-sig-suffix">,R.N.</span>
          </div>
          <div className="rbc-sig-label">Signature over Printed Name of Nurse</div>
        </div>
      </div>

      {/* ── Received / Date ── */}
      <div className="rbc-received-row">
        <div className="rbc-received-field">
          <span className="rbc-lbl">Received by:</span>
          <span className="rbc-received-line" />
        </div>
        <div className="rbc-received-field">
          <span className="rbc-lbl">Date/Time:</span>
          <span className="rbc-received-line" />
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="rbc-footer">
        Generated by: TCP T. TCP on {generatedOn}
      </div>

    </div>
  );
}