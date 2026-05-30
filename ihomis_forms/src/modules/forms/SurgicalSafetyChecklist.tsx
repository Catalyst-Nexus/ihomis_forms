import { useMemo } from "react";
import styles from "./SurgicalSafetyChecklist.module.css";

export default function SurgicalSafetyChecklist({ patientName, patientData }) {
  const caseNumber      = patientData?.caseNumber      || "";
  const name            = patientName                  || "";
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
    <span className={`${styles.u} ${styles[`u${size.charAt(0).toUpperCase() + size.slice(1)}`]}`} />
  );

  return (
    <div className={styles.page}>
      {/* ── Reserved space for header ── */}
      <div className={styles.headerSpace} />
      {/* ── Top Patient Info Table ── */}
      <table className={styles.infoTable}>
        <tbody>
          <tr>
            <td className={`${styles.infoTableTd} ${styles.infoLabel}`}>Name of Patient:</td>
            <td className={`${styles.infoTableTd} ${styles.infoValue} ${styles.nameVal}`}>{name}</td>
            <td className={`${styles.infoTableTd} ${styles.infoLabel}`}>Date:</td>
            <td className={`${styles.infoTableTd} ${styles.infoValue}`}>{date}</td>
          </tr>
          <tr>
            <td className={`${styles.infoTableTd} ${styles.infoLabel}`}>Pre-op Diagnosis:</td>
            <td className={`${styles.infoTableTd} ${styles.infoValue}`}>{preOpDiagnosis}</td>
            <td className={`${styles.infoTableTd} ${styles.infoLabel}`}>Case Number:</td>
            <td className={`${styles.infoTableTd} ${styles.infoValue} ${styles.bold}`}>{caseNumber}</td>
          </tr>
          <tr>
            <td className={`${styles.infoTableTd} ${styles.infoLabel}`}>Surgeon:</td>
            <td className={`${styles.infoTableTd} ${styles.infoValue}`}>{surgeon}</td>
            <td className={`${styles.infoTableTd} ${styles.infoLabel}`}>Anesthesiologist:</td>
            <td className={`${styles.infoTableTd} ${styles.infoValue}`}>{anesthesiologist}</td>
          </tr>
        </tbody>
      </table>

      {/* ── Title ── */}
      <div className={styles.title}>SURGICAL SAFETY CHECKLIST</div>
      <div className={styles.subtitle}>(Operating Room)</div>

      {/* ── Main Checklist Table ── */}
      <table className={styles.mainTable}>
        <thead>
          <tr>
            <th className={`${styles.mainTableTh} ${styles.colBefore}`}>
              <div><strong>BEFORE INDUCTION OF</strong></div>
              <div><strong>ANESTHESIA</strong> (Sign In)</div>
            </th>
            <th className={`${styles.mainTableTh} ${styles.colIncision}`}>
              <div><strong>BEFORE SKIN INCISION</strong></div>
              <div>Time Out</div>
            </th>
            <th className={`${styles.mainTableTh} ${styles.colLeaves}`}>
              <div><strong>BEFORE PATIENT LEAVES OR</strong></div>
              <div>(Sign Out)</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className={styles.contentRowTd}>

            {/* ── BEFORE INDUCTION ── */}
            <td className={`${styles.mainTableTd} ${styles.cell}`}>
              <div>[ ] Patient has confirmed:</div>
              <div className={styles.indent}>● Identity</div>
              <div className={styles.indent}>● Site</div>
              <div className={styles.indent}>● Procedure</div>
              <div className={styles.indent}>● Consent</div>
              <div className={styles.mt}>( ) Site Marked/Not Applicable</div>
              <div className={styles.blankLine} />
              <div className={styles.mt}>[ ] Anesthesia Safety Check Completed</div>
              <div className={styles.blankLine} />
              <div className={styles.mt}>[ ] Pulse Oximeter on patient and functioning</div>
              <div className={styles.blankLine} />
              <div className={styles.mt}>Does the patient have a known allergy?</div>
              <div>[ ] No</div>
              <div>[ ] Yes</div>
              <div className={styles.blankLine} />
              <div className={styles.blankLine} />
              <div className={styles.mt}>Difficult Airway/Aspiration Risk</div>
              <div>[ ] No</div>
              <div>[ ] Yes/And equipment/ assistance available</div>
              <div className={styles.blankLine} />
              <div className={styles.blankLine} />
              <div className={styles.blankLine} />
              <div className={styles.mt}>Risk of {'>'}500mL blood loss (7mL/kg in children)?</div>
              <div>[ ] No</div>
              <div>[ ] Yes/And equipment/ assistance available</div>
              <div className={styles.blankLine} />
              <div className={styles.blankLine} />
            </td>

            {/* ── BEFORE SKIN INCISION ── */}
            <td className={`${styles.mainTableTd} ${styles.cell}`}>
              <div>[ ] Confirm all team members have introduced themselves by name and role</div>
              <div className={styles.blankLine} />
              <div className={styles.blankLine} />
              <div className={styles.mt}>( ) Surgeon, Anesthesia professional, and nurse verbally confirm:</div>
              <div className={styles.indent}>● Patient</div>
              <div className={styles.indent}>● Site</div>
              <div className={styles.indent}>● Position</div>
              <div className={styles.mt}><strong>• Anticipated Critical Review</strong></div>
              <div>[ ] <strong><em>Surgeon Review:</em></strong> What are the critical or unexpected steps, operative duration anticipated blood loss?</div>
              <div className={styles.blankLine} />
              <div className={styles.blankLine} />
              <div className={styles.blankLine} />
              <div className={styles.mt}>[ ]<em>Anesthesis Team Review:</em></div>
              <div className={styles.indent}>Are there any patient specific concerns?</div>
              <div>[ ]<em>Nursing Team Review: Has sterility</em> (including indicator results) been confirmed? Are there equipment issues or any concern?</div>
              <div className={styles.blankLine} />
              <div className={styles.blankLine} />
              <div className={styles.mt}>• Has antibiotic prophylaxis been given the last 60 minutes?</div>
              <div>[ ] Yes</div>
              <div>[ ] Not Applicable</div>
              <div>• Is Essential imaging displayed?</div>
              <div>[ ] Yes</div>
              <div>[ ] Not Applicable</div>
            </td>

            {/* ── BEFORE PATIENT LEAVES ── */}
            <td className={`${styles.mainTableTd} ${styles.cell}`}>
              <div>• Nurse verbally confirms with the team:</div>
              <div>[ ] The name of the procedure recorded:</div>
              <div className={styles.blankLine} />
              <div className={styles.blankLine} />
              <div className={styles.blankLine} />
              <div className={styles.mt}>[ ] The instrument, sponges and needles are complete.</div>
              <div className={styles.blankLine} />
              <div className={styles.blankLine} />
              <div className={styles.mt}>[ ] How the specimen is labelled (including patient's name)</div>
              <div className={styles.blankLine} />
              <div className={styles.blankLine} />
              <div className={styles.blankLine} />
              <div className={styles.mt}>[ ] Whether there are any instruments problem to be addressed.</div>
              <div className={styles.blankLine} />
              <div className={styles.blankLine} />
              <div className={styles.mt}>[ ] Surgeon, Anesthesia Professional and Nurse review the key concerns for recovery and management of this patient.</div>
              <div className={styles.blankLine} />
              <div className={styles.blankLine} />
              <div className={styles.blankLine} />
              <div className={`${styles.mt} ${styles.bold} ${styles.center}`}>SCRUB/CIRCULATING NURSE</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
