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
    <div className={styles.wrap}>
      <div className={styles.page}>
        <div className={styles.main}>
          
          {/* META SECTION - Matches Reference Image Exactly */}
          <div className={styles.metaSection}>
            <div className={styles.metaRow}>
              <span className={styles.metaCell}>
                <span className={styles.label}>Case Number:</span>
                <span>{caseNum}</span>
              </span>
            </div>
            
            <div className={styles.metaRowSpaceBetween}>
              <span className={styles.metaCell}>
                <span className={styles.label}>Name of Patient:</span>
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
      </div>
    </div>
  );
}