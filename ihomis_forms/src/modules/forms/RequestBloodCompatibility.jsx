import { useMemo } from "react";
import styles from "./RequestBloodCompatibility.module.css";

export default function RequestBloodCompatibility({ patientName, patientData }) {
  const name      = patientName             || "";
  const hospNo    = patientData?.hospitalNo || "";
  const caseNo    = patientData?.caseNo     || "";
  const sex       = patientData?.sex        || "";
  const age       = patientData?.age        || "";
  const room      = patientData?.room       || "";
  const address   = patientData?.address    || "";
  const diagnosis = patientData?.diagnosis  || "";
  const admitting = patientData?.admitting  || "";

  return (
    <div className={styles.wrap}>
      <div className={styles.page}>
        <div className={styles.main}>
          
          {/* Preserved spacer for hospital letterhead */}
          <div className={styles.headerSpacer} aria-hidden="true" />

          {/* META SECTION - Standardized Header */}
          <div className={styles.metaSection}>
            <div className={styles.metaRow}>
              <span className={styles.metaCell} style={{ flex: 1 }}>
                <span className={styles.label}>Hospital No.:</span>
                <span>{hospNo}</span>
              </span>
              <span className={styles.metaCell} style={{ flex: 1 }}>
                <span className={styles.label}>Case Number:</span>
                <span>{caseNo}</span>
              </span>
            </div>

            <div className={styles.metaRowSpaceBetween}>
              <span className={styles.metaCell}>
                <span className={styles.label}>Patient Name:</span>
                <span>{name}</span>
              </span>
              <span className={styles.metaCell}>
                <span className={styles.label}>Sex:</span>
                <span>{sex}</span>
              </span>
              <span className={styles.metaCell}>
                <span className={styles.label}>Age:</span>
                <span>{age}</span>
              </span>
              <span className={styles.metaCell}>
                <span className={styles.label}>Room No.:</span>
                <span>{room}</span>
              </span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaCell} style={{ flex: 1 }}>
                <span className={styles.label}>Address:</span>
                <span>{address}</span>
              </span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaCell} style={{ flex: 1 }}>
                <span className={styles.label}>Admitting Impression/Clinical Diagnosis:</span>
                <span className={styles.value}> {admitting}{diagnosis}</span>
              </span>
            </div>
            {/* Secondary line for diagnosis if empty */}
            {!admitting && !diagnosis && <div className={styles.metaRow}><span className={styles.lineFull} /></div>}
          </div>

          {/* ── Blood type checklist ── */}
          <div className={styles.bloodGrid}>
            <div className={styles.checkItem}>[ ] Whole Blood</div>
            <div className={styles.checkItem}>[ ] Plasma</div>
            <div className={styles.checkItem}>[ ] Fresh Whole Blood</div>
            <div className={styles.checkItem}>[ ] Platelet Concentrate</div>
            <div className={styles.checkItem}>[ ] Packed Red Cells</div>
            <div className={styles.checkItem}>[ ] Fresh Frozen Plasma</div>
            <div className={styles.checkItem}>[ ] Washed Rec Cells</div>
            <div className={styles.checkItem}>[ ] Others</div>
          </div>

          <div className={styles.routineSection}>
            <span>[ ] ROUTINE</span>
            <span style={{ marginLeft: '40px' }}>[ ] EMERGENCY</span>
          </div>

          {/* ── Extreme Need Section ── */}
          <div className={styles.extremeSection}>
            <div className={styles.extremeTitle}>EXTREME NEED OF BLOOD: (TO BE FILLED UP BY CLINICIANS ONLY)</div>
            <div className={styles.extremeSubtitle}>I hereby direct the blood bank to release the following:</div>
            <div className={styles.extremeItems}>
              <div>[ ] ABO and RH Type - Specific <strong>UNCROSSMATCHED Blood</strong></div>
              <div>[ ] GROSS "O" <strong>UNCROSSMATCHED Blood</strong> (if available)</div>
              <div>[ ] Crossmatched Blood - <strong>SALINE</strong> Phase only (tube method)</div>
              <div>[ ] Crossmatched Blood - <strong>SALINE</strong> and <strong>ALBUMIN</strong> Phase only</div>
              <div>[ ] Crossmatched Blood - AHG Phase (30 min.)</div>
            </div>
          </div>

          {/* ── Justification ── */}
          <div className={styles.justRow}>
            <span>Justification for emergency release of blood:</span>
            <span className={styles.lineFull} />
          </div>
          <div className={styles.metaRow} style={{ marginTop: '2mm' }}><span className={styles.lineFull} /></div>

          <div className={styles.label} style={{ marginTop: '4mm' }}>Requested by:</div>

          {/* ── Signatures ── */}
          <div className={styles.sigRow}>
            <div className={styles.sigBlock}>
              <div className={styles.sigLineContainer}>
                <span className={styles.lineFull} />
                <span className={styles.sigSuffix}>, M.D.</span>
              </div>
              <div className={styles.sigLabel}>Printed Name & Signature of Physician</div>
            </div>
            <div className={styles.sigBlock}>
              <div className={styles.sigLineContainer}>
                <span className={styles.lineFull} />
                <span className={styles.sigSuffix}>, R.N.</span>
              </div>
              <div className={styles.sigLabel}>Printed Name & Signature of Nurse</div>
            </div>
          </div>

          <div className={styles.receivedRow}>
            <div className={styles.receivedField}>
              <span className={styles.label}>Received by:</span>
              <span className={styles.lineUnder} style={{ width: '50mm' }} />
            </div>
            <div className={styles.receivedField}>
              <span className={styles.label}>Date/Time:</span>
              <span className={styles.lineUnder} style={{ width: '50mm' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}