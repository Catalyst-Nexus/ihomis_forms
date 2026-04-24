import { useMemo } from "react";
import "./SurgicalSafetyChecklist.css";

export default function SurgicalSafetyChecklist({ patientName, patientData }) {
  const caseNumber      = patientData?.caseNumber      || "ADM-2026-010707";
  const name            = patientName                  || "SALUCANA , NELLY JEAN LOFRANCO";
  const date            = patientData?.date            || "";
  const preOpDiagnosis  = patientData?.preOpDiagnosis  || "";
  const surgeon         = patientData?.surgeon         || "";
  const anesthesiologist= patientData?.anesthesiologist|| "";

  const { generatedOn } = useMemo(() => {
    const now  = new Date();
    const pad  = (n) => String(n).padStart(2, "0");
    const h    = now.getHours();
    const hh   = String(h % 12 || 12).padStart(2, "0");
    const ampm = h < 12 ? "am" : "pm";
    return {
      generatedOn: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${hh}:${pad(now.getMinutes())} ${ampm}`,
    };
  }, []);

  const U = ({ size = "md" }) => (
    <span className={`ssc-u ssc-u-${size}`} />
  );

  return (
    <div className="ssc-page">

      {/* ── Reserved space for header ── */}
      <div className="ssc-header-space" />

      {/* ── Top Patient Info Table ── */}
      <table className="ssc-info-table">
        <tbody>
          <tr>
            <td className="ssc-info-label">Name of Patient:</td>
            <td className="ssc-info-value ssc-name-val">{name}</td>
            <td className="ssc-info-label">Date:</td>
            <td className="ssc-info-value">{date}</td>
          </tr>
          <tr>
            <td className="ssc-info-label">Pre-op Diagnosis:</td>
            <td className="ssc-info-value">{preOpDiagnosis}</td>
            <td className="ssc-info-label">Case Number:</td>
            <td className="ssc-info-value ssc-bold">{caseNumber}</td>
          </tr>
          <tr>
            <td className="ssc-info-label">Surgeon:</td>
            <td className="ssc-info-value">{surgeon}</td>
            <td className="ssc-info-label">Anesthesiologist:</td>
            <td className="ssc-info-value">{anesthesiologist}</td>
          </tr>
        </tbody>
      </table>

      {/* ── Title ── */}
      <div className="ssc-title">SURGICAL SAFETY CHECKLIST</div>
      <div className="ssc-subtitle">(Operating Room)</div>

      {/* ── Main Checklist Table ── */}
      <table className="ssc-main-table">
        <thead>
          <tr>
            <th className="ssc-col-before">
              <div><strong>BEFORE INDUCTION OF</strong></div>
              <div><strong>ANESTHESIA</strong> (Sign In)</div>
            </th>
            <th className="ssc-col-incision">
              <div><strong>BEFORE SKIN INCISION</strong></div>
              <div>Time Out</div>
            </th>
            <th className="ssc-col-leaves">
              <div><strong>BEFORE PATIENT LEAVES OR</strong></div>
              <div>(Sign Out)</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="ssc-content-row">

            {/* ── BEFORE INDUCTION ── */}
            <td className="ssc-cell">
              <div>[ ] Patient has confirmed:</div>
              <div className="ssc-indent">● Identity</div>
              <div className="ssc-indent">● Site</div>
              <div className="ssc-indent">● Procedure</div>
              <div className="ssc-indent">● Consent</div>
              <div className="ssc-mt">( ) Site Marked/Not Applicable</div>
              <div className="ssc-blank-line" />
              <div className="ssc-mt">[ ] Anesthesia Safety Check Completed</div>
              <div className="ssc-blank-line" />
              <div className="ssc-mt">[ ] Pulse Oximeter on patient and functioning</div>
              <div className="ssc-blank-line" />
              <div className="ssc-mt">Does the patient have a known allergy?</div>
              <div>[ ] No</div>
              <div>[ ] Yes</div>
              <div className="ssc-blank-line" />
              <div className="ssc-blank-line" />
              <div className="ssc-mt">Difficult Airway/Aspiration Risk</div>
              <div>[ ] No</div>
              <div>[ ] Yes/And equipment/ assistance available</div>
              <div className="ssc-blank-line" />
              <div className="ssc-blank-line" />
              <div className="ssc-blank-line" />
              <div className="ssc-mt">Risk of &gt;500mL blood loss (7mL/kg in children)?</div>
              <div>[ ] No</div>
              <div>[ ] Yes/And equipment/ assistance available</div>
              <div className="ssc-blank-line" />
              <div className="ssc-blank-line" />
            </td>

            {/* ── BEFORE SKIN INCISION ── */}
            <td className="ssc-cell">
              <div>[ ] Confirm all team members have introduced themselves by name and role</div>
              <div className="ssc-blank-line" />
              <div className="ssc-blank-line" />
              <div className="ssc-mt">( ) Surgeon, Anesthesia professional, and nurse verbally confirm:</div>
              <div className="ssc-indent">● Patient</div>
              <div className="ssc-indent">● Site</div>
              <div className="ssc-indent">● Position</div>
              <div className="ssc-mt"><strong>• Anticipated Critical Review</strong></div>
              <div>[ ] <strong><em>Surgeon Review:</em></strong> What are the critical or unexpected steps, operative duration anticipated blood loss?</div>
              <div className="ssc-blank-line" />
              <div className="ssc-blank-line" />
              <div className="ssc-blank-line" />
              <div className="ssc-mt">[ ]<em>Anesthesis Team Review:</em></div>
              <div className="ssc-indent">Are there any patient specific concerns?</div>
              <div>[ ]<em>Nursing Team Review: Has sterility</em> (including indicator results) been confirmed? Are there equipment issues or any concern?</div>
              <div className="ssc-blank-line" />
              <div className="ssc-blank-line" />
              <div className="ssc-mt">• Has antibiotic prophylaxis been given the last 60 minutes?</div>
              <div>[ ] Yes</div>
              <div>[ ] Not Applicable</div>
              <div>• Is Essential imaging displayed?</div>
              <div>[ ] Yes</div>
              <div>[ ] Not Applicable</div>
            </td>

            {/* ── BEFORE PATIENT LEAVES ── */}
            <td className="ssc-cell">
              <div>• Nurse verbally confirms with the team:</div>
              <div>[ ] The name of the procedure recorded:</div>
              <div className="ssc-blank-line" />
              <div className="ssc-blank-line" />
              <div className="ssc-blank-line" />
              <div className="ssc-mt">[ ] The instrument, sponges and needles are complete.</div>
              <div className="ssc-blank-line" />
              <div className="ssc-blank-line" />
              <div className="ssc-mt">[ ] How the specimen is labelled (including patient's name)</div>
              <div className="ssc-blank-line" />
              <div className="ssc-blank-line" />
              <div className="ssc-blank-line" />
              <div className="ssc-mt">[ ] Whether there are any instruments problem to be addressed.</div>
              <div className="ssc-blank-line" />
              <div className="ssc-blank-line" />
              <div className="ssc-mt">[ ] Surgeon, Anesthesia Professional and Nurse review the key concerns for recovery and management of this patient.</div>
              <div className="ssc-blank-line" />
              <div className="ssc-blank-line" />
              <div className="ssc-blank-line" />
              <div className="ssc-mt ssc-bold ssc-center">SCRUB/CIRCULATING NURSE</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Footer ── */}
      <div className="ssc-footer">
        <div className="ssc-footer-line" />
        <div className="ssc-footer-text">Generated by: TCP T. TCP on {generatedOn}</div>
      </div>
    </div>
  );
}