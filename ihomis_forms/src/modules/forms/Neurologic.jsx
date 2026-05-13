import { useMemo } from 'react';
import chartPlaceholderSrc from './img/neurologic examination.png';
import styles from './Neurologic.module.css';

const Neurological = ({ patientName, patientData }) => {
  const name      = patientName            || "";
  const caseNo    = patientData?.caseNo    || "";
  const age       = patientData?.age       || "";
  const sex       = patientData?.sex       || "";
  const date      = patientData?.date      || new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric"
  });
  const diagnosis = patientData?.diagnosis || "";

  return (
    <div className={styles.wrap}>
      <div className={styles.page}>
        <div className={styles.main}>
          
          {/* Preserved spacer for hospital letterhead */}
          <div className={styles.headerSpacer} aria-hidden="true" />

          {/* META SECTION - Standardized */}
          <div className={styles.metaSection}>
            <div className={styles.metaRow}>
              <span className={styles.metaCell}>
                <span className={styles.label}>Case Number:</span>
                <span>{caseNo}</span>
              </span>
            </div>
            
            <div className={styles.metaRowSpaceBetween}>
              <span className={styles.metaCell}>
                <span className={styles.label}>Patient's Name:</span>
                <span>{name}</span>
              </span>
              <span className={styles.metaCell}>
                <span className={styles.label}>Age:</span>
                <span>{age}</span>
              </span>
              <span className={styles.metaCell}>
                <span className={styles.label}>Sex:</span>
                <span>{sex}</span>
              </span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaCell} style={{ flex: 1 }}>
                <span className={styles.label}>Impression/Diagnosis:</span>
                <span className={styles.value}>{diagnosis || <span className={styles.lineFull} />}</span>
              </span>
              <span className={styles.metaCell} style={{ marginLeft: '40px' }}>
                <span className={styles.label}>Date:</span>
                <span>{date}</span>
              </span>
            </div>
            {/* Secondary line for long diagnosis */}
            {!diagnosis && <div className={styles.metaRow}><span className={styles.lineFull} /></div>}
          </div>

          {/* CHART SECTION - Fills available space */}
          <section aria-label="Neuro vital signs chart" className={styles.chartSection}>
            <img
              src={chartPlaceholderSrc}
              alt="Neurologic Examination Chart"
              className={styles.chartImage}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Neurological;