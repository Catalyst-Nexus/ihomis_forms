import styles from "./MonitoringSheet.module.css";

export default function MonitoringSheet({ patientName, patientData }) {
  const name = patientName || "";
  const caseNum = patientData?.caseNum || "";
  const age = patientData?.age || "";
  const sex = patientData?.sex || "";

  const ROWS = 26;
  const columns = [
    { label: "Date",      cls: styles.colDate },
    { label: "Time",      cls: styles.colTime },
    { label: "TEMP",      cls: styles.colTemp },
    { label: "BP",        cls: styles.colBp   },
    { label: "PR",        cls: styles.colPr   },
    { label: "RR",        cls: styles.colRr   },
    { label: "O2 SAT",    cls: styles.colO2   },
    { label: "FHT",       cls: styles.colFht  },
    { label: "SIGNATURE", cls: styles.colSig  },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerRow1}>
          <span className={styles.label}>Case Number:</span>
          <span className={styles.value}>&nbsp;{caseNum}</span>
        </div>
        <div className={styles.headerRow2}>
          <span className={styles.label}>Name of Patient:</span>
          <span className={styles.value}>&nbsp;{name}</span>
          <div className={styles.rightInfo}>
            <span><span className={styles.label}>Age:</span>&nbsp;{age}</span>
            <span><span className={styles.label}>Sex:</span>&nbsp;{sex}</span>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={col.cls}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: ROWS }).map((_, i) => (
            <tr key={i}>
              {columns.map((_, j) => <td key={j} />)}
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
