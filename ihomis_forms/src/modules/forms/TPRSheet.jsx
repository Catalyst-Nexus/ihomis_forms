import { useMemo } from "react";
import styles from "./TPRSheet.module.css";

export default function TPRSheet({ patientName, patientData }) {
  const chartSrc = "src/modules/forms/img/tpr.png";

  const hospitalNumber = patientData?.hospitalNumber;
  const caseNumber     = patientData?.caseNumber;
  const name           = patientName;
  const sex            = patientData?.sex;
  const age            = patientData?.age;
  const ward           = patientData?.ward;

  const { generatedOn } = useMemo(() => {
    const now  = new Date();
    const pad  = (n) => String(n).padStart(2, "0");
    const h    = now.getHours();
    const hh   = String(h % 12 || 12).padStart(2, "0");
    const ampm = h < 12 ? "am" : "pm";
    return {
      generatedOn: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${hh}:${pad(now.getMinutes())} ${ampm}`,
    };
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.chartWrap}>
        <img
          className={styles.chart}
          src={chartSrc}
          alt="TPR Sheet"
        />
      </div>

      {/* ── Patient Info Block (2-column layout) ── */}
      <div className={styles.infoBlock}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Hospital No.:</span>
          <span className={styles.infoValue}>{hospitalNumber}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Case Number:</span>
          <span className={styles.infoValue}>{caseNumber}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Patient Name:</span>
          <span className={styles.infoValue}>{name}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Sex:</span>
          <span className={styles.infoValue}>{sex}</span>
          <span className={styles.infoLabelSpacer}>Age:</span>
          <span className={styles.infoValue}>{age}</span>
          <span className={styles.infoLabelSpacer}>Ward:</span>
          <span className={styles.infoValue}>{ward}</span>
        </div>
      </div>

    </div>
  );
}
