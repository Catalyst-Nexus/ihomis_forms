import styles from "./TPRSheet.module.css";

export default function TPRSheet({ patientName, patientData }) {
  const chartSrc = "src/modules/forms/img/tpr.png";

  const hospitalNumber = patientData?.hospitalNumber || "";
  const caseNumber     = patientData?.caseNumber     || "";
  const name           = patientName                 || "";
  const sex            = patientData?.sex            || "";
  const age            = patientData?.age            || "";
  const ward           = patientData?.ward           || "";

  return (
    <div className={styles.wrap}>
      <div className={styles.page}>
        <div className={styles.main}>
          
          {/* Preserved spacer for hospital letterhead */}
          <div className={styles.headerSpacer} aria-hidden="true" />

          {/* CHART SECTION - Auto-scales to fill available space */}
          <div className={styles.chartWrap}>
            <img
              className={styles.chart}
              src={chartSrc}
              alt="TPR Sheet Chart"
            />
          </div>

          {/* META SECTION - Standardized Bottom Alignment */}
          <div className={styles.metaSection}>
            <div className={styles.metaRow}>
              <span className={styles.metaCell} style={{ flex: 1 }}>
                <span className={styles.label}>Hospital No.:</span>
                <span>{hospitalNumber}</span>
              </span>
              <span className={styles.metaCell} style={{ flex: 1 }}>
                <span className={styles.label}>Case Number:</span>
                <span>{caseNumber}</span>
              </span>
              <span className={styles.metaCell}>
                <span className={styles.label}>Ward:</span>
                <span>{ward}</span>
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
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}