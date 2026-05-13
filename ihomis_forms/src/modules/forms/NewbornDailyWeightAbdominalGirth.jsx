import { useMemo } from "react";
import styles from "./NewbornDailyWeightAbdominalGirth.module.css";

export default function NewbornDailyWeightAbdominalGirth({
  patientName,
  patientData,
}) {
  const caseNumber     = patientData?.caseNumber     || "";
  const hospitalNumber = patientData?.hospitalNumber || "";
  const name           = patientName                 || "";
  const dateOfBirth    = patientData?.dateOfBirth    || "";
  const rows           = patientData?.rows           || [];
  const ROW_COUNT = 25;
  const tableRows = Array.from({ length: ROW_COUNT }, (_, i) => rows[i] || {});

  return (
    <div className={styles.wrap}>
      <div className={styles.page}>
        <div className={styles.main}>

          {/* META SECTION - Standardized Header */}
          <div className={styles.metaSection}>
            <div className={styles.metaRow}>
              <span className={styles.metaCell}>
                <span className={styles.label}>Case Number:</span>
                <span>{caseNumber}</span>
              </span>
            </div>
            
            <div className={styles.metaRow}>
              <span className={styles.metaCell} style={{ flex: 1 }}>
                <span className={styles.label}>Hospital No.:</span>
                <span>{hospitalNumber}</span>
              </span>
            </div>

            <div className={styles.metaRowSpaceBetween}>
              <span className={styles.metaCell}>
                <span className={styles.label}>NAME:</span>
                <span>{name}</span>
              </span>
              <span className={styles.metaCell}>
                <span className={styles.label}>DATE OF BIRTH:</span>
                <span>{dateOfBirth}</span>
              </span>
            </div>
          </div>

          {/* ── Table ── */}
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colDate}>DATE</th>
                <th className={styles.colWeight}>WEIGHT (kg.)</th>
                <th className={styles.colHc}>HEAD CIRCUMFERENCE</th>
                <th className={styles.colAc}>ABDOMINAL<br />CIRCUMFERENCE</th>
                <th className={styles.colNod}>NOD</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i}>
                  <td>{row.date || ""}</td>
                  <td>{row.weight || ""}</td>
                  <td>{row.headCircumference || ""}</td>
                  <td>{row.abdominalCircumference || ""}</td>
                  <td>{row.nod || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}