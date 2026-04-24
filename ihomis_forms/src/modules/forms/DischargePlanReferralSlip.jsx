import { useMemo } from "react";
import "./DischargePlanReferralSlip.css";

export default function DischargePlanReferralSlip({ patientName, patientData }) {
  const name = patientName || "BAYSA , BABY BOY";

  const { admissionDate, generatedOn } = useMemo(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const h = now.getHours();
    const m = now.getMinutes();
    const hh = String(h % 12 || 12).padStart(2, "0");
    const ampm = h < 12 ? "am" : "pm";

    const admissionDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const generatedOn = `${admissionDate} ${hh}:${pad(m)} ${ampm}`;
    return { admissionDate, generatedOn };
  }, []);

  const medications = [
    "[ ] CEFALEXIN 500mg/CAP",
    "[ ] MEFENAMIC ACID 500mg/CAP",
    "[ ] MVS+ IRON TAB",
    "[ ] VIT B COMPLEX TABLET",
    "[ ] CEFADROXIL 500 mg/TAB",
    "[ ] CEFUROXIME 500 mg/TAB",
    "[ ] CO-AMOXICLAV 625 mg/TAB",
    "[ ] CELECOXIB 200 mg/TAB",
    "[ ] TRAMADOL +PARACETAMOL 550 mg/TAB",
  ];

  const teachings = [
    "Maghugas ug kamot sa dili pa ug sa pahuman ug kaon",
    "Mukaon sa masustansiyan pagkaon",
    "Pinabukalan o distilled water lang ang imnon",
    "Muinom sa lugar na daghan tao o mga tao nga gi ubo",
    "Saktu nga pahulay og tulog",
  ];

  return (
    <div className="dp-page">

      {/* ── Title ── */}
      <div className="dp-title">TO: TAKE HOME MEDICATION</div>

      {/* ── Address / Department ── */}
      <div className="dp-details-grid">
        <div className="dp-detail-row">
          <div className="dp-detail-cell">
            <strong>Hospital Number:</strong> 000000000021041
          </div>
          <div className="dp-detail-cell">
            <strong>Department:</strong> NEWBORN
          </div>
        </div>
        <div className="dp-detail-row">
          <div className="dp-detail-cell">
            <strong>Patient Name:</strong> {name}
          </div>
          <div className="dp-detail-cell">
            <strong>Sex:</strong> M
          </div>
        </div>
        <div className="dp-detail-row">
          <div className="dp-detail-cell">
            <strong>Address:</strong> P10, DOÑA TELESFORA, TUBAY, AGUSAN DEL NORTE
          </div>
          <div className="dp-detail-cell">
            <strong>Age:</strong> 1 hour(s)
          </div>
        </div>
        <div className="dp-detail-row dp-detail-row--full">
          <div className="dp-detail-cell">
            <strong>DATE/TIME OF ADMISSION:</strong> {admissionDate}
          </div>
          <div className="dp-detail-cell">
            <strong>DATE/TIME OF DISCHARGE:</strong>
          </div>
        </div>
      </div>

      {/* ── Diagnosis ── */}
      <div className="dp-section">DIAGNOSIS:</div>
      <hr className="dp-divider" />

      {/* ── Vital Signs ── */}
      <div className="dp-section">VITAL SIGNS:</div>
      <div className="dp-vitals-row">
        <span className="dp-vital-item">BP:<span className="dp-vital-line" /></span>
        <span className="dp-vital-item">TEMP:<span className="dp-vital-line" /></span>
        <span className="dp-vital-item">HR:<span className="dp-vital-line" /></span>
        <span className="dp-vital-item">RR:<span className="dp-vital-line" /></span>
        <span className="dp-vital-item">WEIGHT(kg):<span className="dp-vital-line" /></span>
      </div>

      {/* ── Disposition ── */}
      <div className="dp-disposition-row">
        <div>
          <span className="dp-disposition-label">DISPOSITION: </span>
          <span className="dp-disposition-sub">(Please check the box)</span>
        </div>
        <div className="dp-mgh-box">
          <div className="dp-mgh-title">[ ] MGH:</div>
          <div className="dp-mgh-item">[ ] RECOVERED</div>
          <div className="dp-mgh-item">[ ] UNIMPROVED</div>
          <div className="dp-home-item">[ ] HOME PER REQUEST/DAMA</div>
        </div>
      </div>

      {/* ── Diet ── */}
      <div className="dp-diet-row">DIET:</div>
      <hr className="dp-divider" />

      {/* ── Medications + OTHER box ── */}
      <div className="dp-med-other-row">
        <div className="dp-med-col">
          <div className="dp-med-title">TAKE HOME MEDICATIONS</div>
          <strong>{medications.map((med, i) => (
            <div key={i} className="dp-med-item">{med}</div>
          ))}</strong>
        </div>
        <div className="dp-other-box">
          <div className="dp-other-title">OTHER:</div>
          {[...Array(7)].map((_, i) => (
            <div key={i} className="dp-other-item">
              <span className="dp-other-bracket">[ ]</span>
              <span className="dp-other-line" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Treatment to Continue ── */}
      <div className="dp-treatment-section">
        <div className="dp-section">TREATMENT TO CONTINUE</div>
        <div className="dp-treatment-box" />

      </div>

      {/* ── Healthy Teachings ── */}
      <div className="dp-teachings-section">
        <div className="dp-section">HEALTHY TEACHINGS:</div>
        {teachings.map((t, i) => (
          <div key={i} className="dp-teaching-item">
            <span className="dp-check">✓</span>
            <span>{t}</span>
          </div>
        ))}
      </div>

      {/* ── Follow-up ── */}
      <div className="dp-bottom-section">
        <div className="dp-bottom-label">FOLLOW-UP CHECKUP(SCHEDULE):</div>
        <div className="dp-bottom-line" />
      </div>

      {/* ── Physician ── */}
      <div className="dp-bottom-section">
        <div className="dp-bottom-label">PHYSICIAN IN-CHARGE:</div>
        <div className="dp-bottom-line" />
      </div>

      {/* ── Nurse ── */}
      <div className="dp-bottom-section">
        <div className="dp-bottom-label">NURSE/NURSE ATTENDANT ON DUTY:</div>
        <div className="dp-bottom-line" />
      </div>

      {/* ── Footer ── */}
      <div className="dp-footer">
        Generated by: TCP T. TCP on {generatedOn}
      </div>

    </div>
  );
}