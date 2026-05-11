import { useMemo } from 'react';
import chartPlaceholderSrc from './img/NEURO VITAL SIGNS STATUS.png';
import styles from './NeuroVitalSignsMoreThan.module.css';

const NeuroVitalSignsMoreThan = ({ patientName, patientData }) => {
  const caseNum = patientData?.caseNum || "";
  const hospitalNo = patientData?.hospitalNo || "";
  const name = patientName || "";
  const room = patientData?.room || "";
  const age = patientData?.age || "";
  const date = patientData?.date || "";


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
                <span className={styles.label}>Case Number:</span>
                <span>{caseNum}</span>
              </span>
              <span className={styles.metaCell} style={{ flex: 1 }}>
                <span className={styles.label}>Hospital No.:</span>
                <span>{hospitalNo}</span>
              </span>
            </div>

            <div className={styles.metaRowSpaceBetween}>
              <span className={styles.metaCell} style={{ flex: 1 }}>
                <span className={styles.label}>NAME OF PATIENT:</span>
                <span>{name}</span>
              </span>
              <span className={styles.metaCell} style={{ width: '75mm' }}>
                <span className={styles.label}>PHYSICIAN:</span>
                <span className={styles.lineFill} />
              </span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaCell}>
                <span className={styles.label}>Room:</span>
                <span>{room}</span>
              </span>
            </div>

            <div className={styles.metaRowSpaceBetween}>
              <span className={styles.metaCell}>
                <span className={styles.label}>Age:</span>
                <span>{age}</span>
              </span>
              <span className={styles.metaCell}>
                <span className={styles.label}>Date:</span>
                <span>{date}</span>
              </span>
            </div>
          </div>

          {/* CHART SECTION - Auto-scales to fill 1 page */}
          <section className={styles.chartSection} aria-label="Neuro vital signs chart">
            <img
              src={chartPlaceholderSrc}
              alt="Neuro vital signs status chart"
              className={styles.chartImage}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default NeuroVitalSignsMoreThan;