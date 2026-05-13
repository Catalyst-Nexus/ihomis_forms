import styles from "./RadiologyRequestOutside.module.css";

export default function RadiologyRequestOutside({ patientName, patientData }) {
  const name        = patientName              || "";
  const age         = patientData?.age         || "";
  const sex         = patientData?.sex         || "";
  const civilStatus = patientData?.civilStatus || "";
  const birthdate   = patientData?.birthdate   || "";
  const address     = patientData?.address     || "";
  const ward        = patientData?.ward        || "";
  const caseNo      = patientData?.caseNo      || "";
  const category    = patientData?.category    || "";

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className={styles.page}>
      <br />
      <div className={styles.dateRow}>
        <strong>Date ordered:</strong> {dateStr}
      </div>
      {/* ── Patient details ── */}
      <div className={styles.patientGrid}>
        <div className={styles.patientRow}>
          <div className={styles.field}>
            <span className={styles.label}>Name of the Patient:</span>
            <span className={styles.value}>{name}</span>
          </div>
          <div className={`${styles.field} ${styles.fieldRight}`}>
            <span className={styles.label}>Sex:</span>
            <span className={styles.value}>{sex}</span>
          </div>
        </div>

        <div className={styles.patientRow}>
          <div className={styles.field}>
            <span className={styles.label}>Address:</span>
            <span className={styles.value}>{address}</span>
          </div>
          <div className={`${styles.field} ${styles.fieldRight}`}>
            <span className={styles.label}>Civil Status:</span>
            <span className={styles.value}>{civilStatus}</span>
          </div>
        </div>

        <div className={styles.patientRow}>
          <div className={styles.field}>
            <span className={styles.label}>Ward:</span>
            <span className={styles.value}>{ward}</span>
          </div>
          <div className={`${styles.field} ${styles.fieldRight}`}>
            <span className={styles.label}>Birthdate:</span>
            <span className={styles.value}>{birthdate}</span>
          </div>
        </div>

        <div className={styles.patientRow}>
          <div className={styles.field}>
            <span className={styles.label}>Case Number:</span>
            <span className={styles.value}>{caseNo}</span>
          </div>
          <div className={`${styles.field} ${styles.fieldRight}`}>
            <span className={styles.label}>Category:</span>
            <span className={styles.value}>{category}</span>
          </div>
        </div>
      </div>

      {/* ── Age row ── */}
      <div className={styles.ageRow}>
        <span className={styles.label}>Age:</span>
        <span className={styles.value}>{age}</span>
      </div>

      {/* ── History of Present Illness ── */}
      <div className={styles.historyLabel}>History of Present Illness:</div>

      <hr className={styles.divider} />

      {/* ── Title ── */}
      <div className={styles.title}>X-RAY/ULTRASONOGRAPHY REQUEST</div>

      <hr className={styles.divider} />

      {/* ── Blank request lines ── */}
      <div className={styles.blankLine} />
      <div className={styles.blankLine} />
      <div className={styles.blankLine} />
      <br />

      {/* ── Signature row ── */}
      <div className={styles.sigRow}>
        <div className={styles.sigLeft}>
          <span className={styles.sigLineLeft} />
          <span className={styles.sigSuffix}>,M.D.</span>
        </div>
        <span className={styles.sigLineRight} />
      </div>

      {/* ── Sig labels ── */}
      <div className={styles.sigLabelsRow}>
        <div className={styles.sigLabelLeft}>Requesting Physician</div>
        <div className={styles.sigLabelRight}>Rad. Tech on duty</div>
      </div>
      <br />

    </div>
  );
}
