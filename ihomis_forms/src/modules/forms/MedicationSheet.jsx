import styles from "./MedicationSheet.module.css";

export default function MedicationSheet({ patientName, patientData }) {
  const name = patientName || "";
  const caseNum = patientData?.caseNum || "";
  const hospitalNo = patientData?.hospitalNo || "";
  const sex = patientData?.sex || "";
  const age = patientData?.age || "";

  const DATA_ROWS = 18;
  const DATE_COLS = 7;

  return (
    <div className={styles.page}>
      <table className={styles.table}>
        <thead>
          <tr>
            <td className={styles.thMed} style={{ border: "1px solid #000" }}></td>
            <td style={{ border: "1px solid #000" }}></td>
            <td colSpan={DATE_COLS} className={styles.thDate} style={{ border: "1px solid #000" }}>DATE</td>
          </tr>
          {/* Row 2: MEDICATION ORDER | TIME | date col headers */}
          <tr>
            <th className={styles.thMed}>MEDICATION ORDER</th>
            <th className={styles.thTime}>TIME</th>
            {Array.from({ length: DATE_COLS }).map((_, i) => (
              <th key={i} className={styles.thDateCol}></th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* Data rows */}
          {Array.from({ length: DATA_ROWS }).map((_, i) => (
            <tr key={i} className={styles.dataRow}>
              <td></td>
              <td></td>
              {Array.from({ length: DATE_COLS }).map((_, j) => (
                <td key={j}></td>
              ))}
            </tr>
          ))}

          {/* SHIFT | SPECIMEN SIGNATURES header */}
          <tr className={styles.shiftHeader}>
            <td>SHIFT</td>
            <td colSpan={DATE_COLS + 1}>SPECIMEN SIGNATURES</td>
          </tr>

          {/* DAWN row */}
          <tr className={styles.shiftRow}>
            <td>DAWN</td>
            <td></td>
            {Array.from({ length: DATE_COLS }).map((_, i) => (
              <td key={i}></td>
            ))}
          </tr>

          {/* AM row */}
          <tr className={styles.shiftRow}>
            <td>AM</td>
            <td></td>
            {Array.from({ length: DATE_COLS }).map((_, i) => (
              <td key={i}></td>
            ))}
          </tr>

          {/* PM row */}
          <tr className={styles.shiftRow}>
            <td>PM</td>
            <td></td>
            {Array.from({ length: DATE_COLS }).map((_, i) => (
              <td key={i}></td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* ── Patient info ── */}
      <div className={styles.patientInfo}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Case No.</span>
          <span className={styles.infoColon}>:</span>
          <span>{caseNum}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Hospital No.</span>
          <span className={styles.infoColon}>:</span>
          <span>{hospitalNo}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Patient's Name</span>
          <span className={styles.infoColon}>:</span>
          <span>{name}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Sex</span>
          <span className={styles.infoColon}>:</span>
          <span>{sex}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Age</span>
          <span className={styles.infoColon}>:</span>
          <span>{age}</span>
        </div>
      </div>

    </div>
  );
}
