import PropTypes from "prop-types";
import { useMemo } from "react";
import styles from './CardioPulmonaryClearance.module.css';

export default function CardioPulmonaryClearance({ patientData = {} }) {
  const caseNumber         = patientData?.caseNumber        || "";
  const from_              = patientData?.from              || "MEDICAL";
  const department         = patientData?.department        || "";
  const date               = patientData?.date              || "";
  const hospitalNo         = patientData?.hospitalNo        || "";
  const patientName        = patientData?.patientName       || "";
  const sex                = patientData?.sex               || "";
  const age                = patientData?.age               || "";
  const surgeryContemplated   = patientData?.surgeryContemplated   || "";
  const anesthesiaContemplated = patientData?.anesthesiaContemplated || "";
  const generatedBy        = patientData?.generatedBy       || "TCP T. TCP";

  return (
    <div className={styles.wrap}>
      <div className={styles.page}>
        <div className={styles.main}>
          {/* META SECTION (Strict 2-Column) */}
          <div className={styles.metaSection}>
            <div className={styles.metaRow}>
              <span className={styles.metaCellHalf}>
                <span className={styles.label}>Case Number:</span>
                <span>{caseNumber}</span>
              </span>
              <span className={styles.metaCellHalf}>
                <span className={styles.label}>From:</span>
                <span>{from_}</span>
              </span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaCellHalf}>
                <span className={styles.label}>Hospital No.:</span>
                <span>{hospitalNo}</span>
              </span>
              <span className={styles.metaCellHalf}>
                <span className={styles.label}>Department:</span>
                {department ? <span>{department}</span> : <span className={`${styles.line} ${styles.lineXl}`} />}
              </span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaCellHalf}>
                <span className={styles.label}>Patient Name:</span>
                <span>{patientName}</span>
              </span>
              <span className={styles.metaCellHalf}>
                <span className={styles.label}>Date:</span>
                <span>{date}</span>
              </span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaCellHalf}>
                <span className={styles.label}>Sex:</span>
                <span>{sex}</span>
              </span>
              <span className={styles.metaCellHalf}>
                <span className={styles.label}>Age:</span>
                <span>{age ? `${age} year(s)` : ""}</span>
              </span>
            </div>

            <div className={styles.metaRowTight}>
              <span className={styles.metaCellFull}>
                <span className={styles.label}>Surgery Contemplated:</span>
                {surgeryContemplated ? <span>{surgeryContemplated}</span> : <span className={`${styles.line} ${styles.lineFill}`} />}
              </span>
            </div>

            <div className={styles.metaRowTight}>
              <span className={styles.metaCellFull}>
                <span className={styles.label}>Anesthesia Contemplated:</span>
                {anesthesiaContemplated ? <span>{anesthesiaContemplated}</span> : <span className={`${styles.line} ${styles.lineFill}`} />}
              </span>
            </div>
          </div>

          {/* REVIEW OF SYSTEMS */}
          <div className={styles.sectionTitle}>REVIEW OF SYSTEMS:</div>

          {/* Cardiovascular */}
          <div className={styles.subHeading}>Cardiovascular</div>
          <div className={styles.checkRow}><span className={styles.checkLabel}>Hypertension/Hypotension</span><span className={styles.checkOpt}>[ ] Yes</span><span className={styles.checkOpt}>[ ] No</span></div>
          <div className={styles.checkRow}><span className={styles.checkLabel}>Chest Pain</span><span className={styles.checkOpt}>[ ] Yes</span><span className={styles.checkOpt}>[ ] No</span></div>
          <div className={styles.checkRow}><span className={styles.checkLabel}>Exertional Dyspnea</span><span className={styles.checkOpt}>[ ] Yes</span><span className={styles.checkOpt}>[ ] No</span></div>
          <div className={styles.checkRow}><span className={styles.checkLabel}>Orthopnea</span><span className={styles.checkOpt}>[ ] Yes</span><span className={styles.checkOpt}>[ ] No</span></div>
          <div className={styles.checkRow}><span className={styles.checkLabel}>Paroxysmal Nocturnal Dyspnea</span><span className={styles.checkOpt}>[ ] Yes</span><span className={styles.checkOpt}>[ ] No</span></div>
          <div className={styles.checkRow}><span className={styles.checkLabel}>Ankle Swelling</span><span className={styles.checkOpt}>[ ] Yes</span><span className={styles.checkOpt}>[ ] No</span></div>

          <div className={styles.multiLineRow}>
            <span className={styles.multiLineLabel}>Other:</span>
            <span className={`${styles.line} ${styles.lineFill}`} />
            <span className={`${styles.line} ${styles.lineFill}`} />
          </div>
          <div className={styles.multiLineRow}>
            <span className={styles.multiLineLabel}>Medications Taken:</span>
            <span className={`${styles.line} ${styles.lineFill}`} />
            <span className={`${styles.line} ${styles.lineFill}`} />
          </div>

          {/* Chest & Lungs */}
          <div className={styles.subHeading}>Chest &amp; Lungs</div>
          <div className={styles.checkRow}><span className={styles.checkLabel}>Cough</span><span className={styles.checkOpt}>[ ] Yes</span><span className={styles.checkOpt}>[ ] No___</span></div>
          <div className={styles.checkRow}><span className={styles.checkLabel}>Fever</span><span className={styles.checkOpt}>[ ] Yes</span><span className={styles.checkOpt}>[ ] No___</span></div>
          <div className={styles.checkRow}><span className={styles.checkLabel}>(+) Hx of PTB</span><span className={styles.checkOpt}>[ ] Yes</span><span className={styles.checkOpt}>[ ] No___</span></div>
          <div className={styles.checkRow}><span className={styles.checkLabel}>Treated?</span><span className={styles.checkOpt}>[ ] Yes</span><span className={styles.checkOpt}>[ ] No___</span></div>
          <div className={styles.checkRow}><span className={styles.checkLabel}>Asthma</span><span className={styles.checkOpt}>[ ] Yes</span><span className={styles.checkOpt}>[ ] No___</span></div>
          <div className={styles.checkRow}><span className={styles.checkLabel}>Smoker</span><span className={styles.checkOpt}>[ ] Yes</span><span className={styles.checkOptLong}>[ ] No&nbsp;&nbsp;Pack-years:___</span></div>

          <div className={styles.multiLineRow}>
            <span className={styles.multiLineLabel}>Last sick smoke when?</span>
            <span className={`${styles.line} ${styles.lineFill}`} />
            <span className={`${styles.line} ${styles.lineFill}`} />
          </div>

          {/* Other Problems */}
          <div className={styles.subHeading}>Other Problems:</div>
          <div className={styles.checkRow}><span className={styles.checkLabel}>Diabetes</span><span className={styles.checkOpt}>[ ] Yes</span><span className={styles.checkOpt}>[ ] No___</span></div>

          <div className={styles.multiLineRow}>
            <span className={styles.multiLineLabel}>How long?</span>
            <span className={`${styles.line} ${styles.lineFill}`} />
            <span className={styles.multiLineLabel}>Medications:</span>
            <span className={`${styles.line} ${styles.lineFill}`} />
          </div>

          <div className={styles.checkRow}><span className={styles.checkLabel}>Renal failure</span><span className={styles.checkOpt}>[ ] Yes</span><span className={styles.checkOpt}>[ ] No___</span></div>
          <div className={styles.checkRow}><span className={styles.checkLabel}>on Dialysis:</span><span className={styles.checkOpt}>[ ] Yes</span><span className={styles.checkOpt}>[ ] No___</span></div>
          <div className={styles.checkRow}><span className={styles.checkLabel}>Anemia</span><span className={styles.checkOpt}>[ ] Yes</span><span className={styles.checkOpt}>[ ] No___</span></div>
          <div className={styles.checkRow}><span className={styles.checkLabel}>Bleeding Tendencies</span><span className={styles.checkOpt}>[ ] Yes</span><span className={styles.checkOpt}>[ ] No___</span></div>
          <div className={styles.checkRow}><span className={styles.checkLabel}>Stroke</span><span className={styles.checkOpt}>[ ] Yes</span><span className={styles.checkOpt}>[ ] No___</span></div>
          <div className={styles.checkRow}><span className={styles.checkLabel}>Allergies</span><span className={styles.checkOpt}>[ ] Yes</span><span className={styles.checkOpt}>[ ] No___</span></div>

          {/* PHYSICAL EXAMINATION */}
          <div className={styles.sectionTitle}>PHYSICAL EXAMINATION</div>
          <div className={styles.multiLineRow}>
            <span className={styles.multiLineLabel}>General Survey:</span>
            <span className={`${styles.line} ${styles.lineFill}`} />
            <span className={`${styles.line} ${styles.lineFill}`} />
            <span className={`${styles.line} ${styles.lineFill}`} />
          </div>

          <div className={styles.vitalsRow}>
            <span>Vital Signs: BP:</span><span className={`${styles.line} ${styles.lineFill}`} />
            <span>CHR:</span><span className={`${styles.line} ${styles.lineFill}`} />
            <span>RR:</span><span className={`${styles.line} ${styles.lineFill}`} />
            <span>TEMP:</span><span className={`${styles.line} ${styles.lineFill}`} />
          </div>

          <div className={styles.multiLineRow}>
            <span className={styles.multiLineLabel}>SHEENT:</span>
            <span className={`${styles.line} ${styles.lineFill}`} /><span className={`${styles.line} ${styles.lineFill}`} /><span className={`${styles.line} ${styles.lineFill}`} />
          </div>
          <div className={styles.multiLineRow}>
            <span className={styles.multiLineLabel}>CVS:</span>
            <span className={`${styles.line} ${styles.lineFill}`} /><span className={`${styles.line} ${styles.lineFill}`} /><span className={`${styles.line} ${styles.lineFill}`} />
          </div>
          <div className={styles.multiLineRow}>
            <span className={styles.multiLineLabel}>Chest/Lungs:</span>
            <span className={`${styles.line} ${styles.lineFill}`} /><span className={`${styles.line} ${styles.lineFill}`} /><span className={`${styles.line} ${styles.lineFill}`} />
          </div>
          <div className={styles.multiLineRow}>
            <span className={styles.multiLineLabel}>Abdomen:</span>
            <span className={`${styles.line} ${styles.lineFill}`} /><span className={`${styles.line} ${styles.lineFill}`} /><span className={`${styles.line} ${styles.lineFill}`} />
          </div>
          <div className={styles.multiLineRow}>
            <span className={styles.multiLineLabel}>Extremities:</span>
            <span className={`${styles.line} ${styles.lineFill}`} /><span className={`${styles.line} ${styles.lineFill}`} /><span className={`${styles.line} ${styles.lineFill}`} />
          </div>

          {/* LABORATORY DATA */}
          <div className={styles.sectionTitle}>LABORATORY DATA</div>
          <div className={styles.multiLineRow}>
            <span className={styles.multiLineLabel}>Chest Xray:</span>
            <span className={`${styles.line} ${styles.lineFill}`} /><span className={`${styles.line} ${styles.lineFill}`} /><span className={`${styles.line} ${styles.lineFill}`} />
          </div>
          <div className={styles.multiLineRow}>
            <span className={styles.multiLineLabel}>ECG:</span>
            <span className={`${styles.line} ${styles.lineFill}`} /><span className={`${styles.line} ${styles.lineFill}`} /><span className={`${styles.line} ${styles.lineFill}`} />
          </div>
          <div className={styles.multiLineRow}>
            <span className={styles.multiLineLabel}>CBC:</span>
            <span className={`${styles.line} ${styles.lineFill}`} /><span className={`${styles.line} ${styles.lineFill}`} /><span className={`${styles.line} ${styles.lineFill}`} />
          </div>

          <div className={styles.multiLineRow}>
            <span className={styles.multiLineLabel}>Urinalysis:</span><span className={`${styles.line} ${styles.lineFill}`} />
            <span className={styles.multiLineLabel}>ABG:</span><span className={`${styles.line} ${styles.lineFill}`} />
          </div>
          <div className={styles.multiLineRow}>
            <span className={styles.multiLineLabel}>RBS/FBS:</span><span className={`${styles.line} ${styles.lineFill}`} />
            <span className={styles.multiLineLabel}>S. Electrolytes:</span><span className={`${styles.line} ${styles.lineFill}`} />
          </div>
          <div className={styles.vitalsRow}>
            <span>APTT:</span><span className={`${styles.line} ${styles.lineFill}`} />
            <span>PTw/INR:</span><span className={`${styles.line} ${styles.lineFill}`} />
            <span>CTBT:</span><span className={`${styles.line} ${styles.lineFill}`} />
          </div>

          {/* RECOMMENDATIONS */}
          <div className={styles.sectionTitle}>RECOMMENDATIONS:</div>
          <div className={styles.recommendationsBlock}>
            <span className={`${styles.line} ${styles.lineFill} ${styles.recLine}`} />
            <span className={`${styles.line} ${styles.lineFill} ${styles.recLine}`} />
            <span className={`${styles.line} ${styles.lineFill}`} style={{ width: '100%', display: 'block' }} />
          </div>

          {/* PHYSICIAN SIGNATURE */}
          <div className={styles.physicianWrap}>
            <span className={`${styles.line} ${styles.lineFill}`} style={{ width: '100%', display: 'block' }} />
            <div className={styles.physicianLabel}>NAME &amp; SIGNATURE OF PHYSICIAN</div>
          </div>
        </div>
      </div>
    </div>
  );
}

CardioPulmonaryClearance.propTypes = {
  patientData: PropTypes.shape({
    caseNumber:              PropTypes.string,
    from:                    PropTypes.string,
    department:              PropTypes.string,
    date:                    PropTypes.string,
    hospitalNo:              PropTypes.string,
    patientName:             PropTypes.string,
    sex:                     PropTypes.string,
    age:                     PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    surgeryContemplated:     PropTypes.string,
    anesthesiaContemplated:  PropTypes.string,
  }),
};