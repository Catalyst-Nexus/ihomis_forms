import styles from './Lubchenco.module.css';
import chartPlaceholderSrc from './img/lubchenco chart.png';

const Lubchenco = ({ patientName, patientData }) => {
  const name = patientName || "";
  const caseNum = patientData?.caseNum || "";
  const hospitalNo = patientData?.hospitalNo || "";
  const dateOfBirth = patientData?.dateOfBirth || "";
  const timeOfBirth = patientData?.timeOfBirth || "";

  return (
    <div className={styles.wrap}>
      <div className={styles.page}>
        <div className={styles.main}>

          {/* ── META HEADER ── */}
          <div className={styles.metaRowOutside}>
            <span className={styles.label}>Case Number:</span>
            <span className={styles.value}>{caseNum}</span>
          </div>

          <div className={styles.tableBorder}>
            <div className={styles.metaRow}>
              <div className={styles.metaCellHalfWithBorder}>
                <span className={styles.label}>Name of Patient:</span>
                <span className={styles.value}>{name}</span>
              </div>
              <div className={styles.metaCellHalf}>
                <span className={styles.label}>Hospital No.:</span>
                <span className={styles.value}>{hospitalNo}</span>
              </div>
            </div>
            <div className={styles.metaRow}>
              <div className={styles.metaCellHalfWithBorder}>
                <span className={styles.label}>Date of Birth:</span>
                <span className={styles.value}>{dateOfBirth}</span>
              </div>
              <div className={styles.metaCellHalf}>
                <span className={styles.label}>Time of Birth:</span>
                <span className={styles.value}>{timeOfBirth}</span>
              </div>
            </div>
          </div>

          <div className={styles.subtitle}>
            Classification of newborns (both sexes) by intrauterine growth and gestational age
          </div>

          {/* ── CHART ── */}
          <section className={styles.chartSection} aria-label="Lubchenco chart">
            <img
              src={chartPlaceholderSrc}
              alt="Lubchenco growth chart"
              className={styles.chartImage}
            />
          </section>

          {/* ── SIGNATURE ── */}
          <div className={styles.signatureWrap}>
            <div className={styles.signatureLine}></div>
            <div className={styles.signatureLabel}>PEDIATRICIAN</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Lubchenco;