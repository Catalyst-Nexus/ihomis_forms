import { useMemo } from 'react';
import styles from './ChildImmunizationRecord.module.css';

const chartPlaceholderSrc = 'src/modules/forms/img/child immunization record.jpg';
const imagePlaceholderSrc = 'src/modules/forms/img/child immunization record2.jpg';


const ChildImmunizationRecord = ({ patientName, patientData }) => {
  const caseNumber = patientData?.caseNumber || "";
    const patientNameVal = patientName || "";
    const hospitalNo = patientData?.hospitalNo || "";
  const sex = patientData?.sex || "";
  const age = patientData?.age || "";


  return (
    <div className={styles.container}>
      <div className={styles.record}>
        <section className={styles.chartSection} aria-label="Child immunization record chart image">
          <img
            className={styles.chartImage}
            src={chartPlaceholderSrc}
            alt="Child immunization record chart placeholder"
          />
              </section>
              <section className={styles.chartSection} aria-label="Child immunization record chart image">
          <img
            className={styles.chartImage}
            src={imagePlaceholderSrc}
            alt="Child immunization record chart placeholder"
          />
        </section>
      </div>
    </div>
  );
};

export default ChildImmunizationRecord;
