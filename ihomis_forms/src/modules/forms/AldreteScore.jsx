import { useMemo } from "react";
import styles from "./AldreteScore.module.css";

export default function AldreteScore({ patientName, patientData }) {
  const name = patientName || patientData?.patientName || patientData?.fullName || "";
  const caseNum = patientData?.caseNum || patientData?.caseNo || "";
  const age = patientData?.age || "";
  const sex = patientData?.sex || "";
  const room = patientData?.room || patientData?.ward || "";

  const { dateTimeStr } = useMemo(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const h = now.getHours();
    const m = now.getMinutes();
    const hh = String(h % 12 || 12).padStart(2, "0");
    const AMPM = h < 12 ? "AM" : "PM";

    const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const timeStr = `${hh}:${pad(m)} ${AMPM}`;
    const dateTimeStr = `Date: ${dateStr} Time: ${timeStr}`;
    return { dateTimeStr };
  }, []);

  const categories = [
    {
      name: "COLOR",
      items: [
        { label: "Pink", value: 2 },
        { label: "Pale/dusky", value: 1 },
        { label: "Cyanotic", value: 0 },
      ],
    },
    {
      name: "RESPIRATION",
      items: [
        { label: "Can breathe deeply", value: 2 },
        { label: "Shallow but adequate", value: 1 },
        { label: "Apnea or obstruction", value: 0 },
      ],
    },
    {
      name: "CIRCULATION",
      items: [
        { label: "Bp within 20% of normal", value: 2 },
        { label: "Bp within 21-50% of normal", value: 1 },
        { label: "Bp within >50% of normal", value: 0 },
      ],
    },
    {
      name: "CONSCIOUSNESS",
      items: [
        { label: "Awake, alert and oriented", value: 2 },
        { label: "Arousable but readily back to sleep", value: 1 },
        { label: "No response", value: 0 },
      ],
    },
    {
      name: "ACTIVITY",
      items: [
        { label: "Moves all extremities", value: 2 },
        { label: "Moves two extremities", value: 1 },
        { label: "No movement", value: 0 },
      ],
    },
  ];

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerGrid}>
          <div className={styles.headerCell}>
            <span className={styles.bold}>Case Number:</span>&nbsp;{caseNum}
          </div>
          <div className={styles.headerCell}>
            <span className={styles.bold}>Age:</span>&nbsp;{age}
          </div>
          <div className={styles.headerCell}>
            <span className={styles.bold}>Name of Patient:</span>&nbsp;{name}
          </div>
          <div className={styles.headerCell}>
            <span className={styles.bold}>Sex:</span>&nbsp;{sex}
          </div>
          <div className={`${styles.headerCell} ${styles.headerCellFull}`}>
            <span className={styles.bold}>ROOM:</span>&nbsp;{room}
          </div>
        </div>
      </div>

      {/* ── Discharge note ── */}
      <div className={styles.note}>*Patient discharged when the score is 10</div>

      {/* ── Score table ── */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", width: "80%" }}></th>
            <th style={{ textAlign: "center", width: "20%" }}>Point Value</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, ci) => (
            <>
              {/* Category header row */}
              <tr key={`cat-${ci}`} className={styles.catRow}>
                <td colSpan={2}>{cat.name}</td>
              </tr>
              {/* Item rows */}
              {cat.items.map((item, ii) => (
                <tr key={`item-${ci}-${ii}`} className={styles.itemRow}>
                  <td>{item.label}</td>
                  <td>{item.value}</td>
                </tr>
              ))}
            </>
          ))}
          {/* Total row */}
          <tr className={styles.totalRow}>
            <td>Total</td>
            <td></td>
          </tr>
        </tbody>
      </table>

      {/* ── Signature ── */}
      <div className={styles.sigSection}>
        <div className={styles.sigBlock}>
          <div className={styles.sigLine} />
          <div className={styles.sigLabel}>Signature over Printed Name of PACU Nurse</div>
          <div className={styles.sigDate}>{dateTimeStr}</div>
        </div>
      </div>

    </div>
  );
}
