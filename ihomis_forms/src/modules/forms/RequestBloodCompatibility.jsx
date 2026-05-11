import styles from "./RequestBloodCompatibility.module.css";

export default function RequestBloodCompatibility({ patientName, patientData }) {
  const name      = patientName             || "";
  const hospNo    = patientData?.hospitalNo || "";
  const caseNo    = patientData?.caseNo     || "";
  const sex       = patientData?.sex        || "";
  const age       = patientData?.age        || "";
  const birthdate = patientData?.birthdate  || "";
  const room      = patientData?.room       || "";
  const bloodType = patientData?.bloodType  || "";
  const address   = patientData?.address    || "";
  const diagnosis = patientData?.diagnosis  || "";
  const admitting = patientData?.admitting  || "";

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <br />
        <div className={styles.infoGrid}>
          <div className={styles.infoCell}>
            <span className={styles.label}>Hospital No.:</span>
            <span className={styles.value}> {hospNo}</span>
          </div>
          <div className={styles.infoCell}>
            <span className={styles.label}>Case Number:</span>
            <span className={styles.value}> {caseNo}</span>
          </div>

          <div className={styles.infoCell}>
            <span className={styles.label}>Patient Name:</span>
            <span className={styles.value}> {name}</span>
          </div>
          <div className={styles.infoCell}>
            <span className={styles.label}>Sex:</span>
            <span className={styles.value}> {sex}</span>
          </div>

          <div className={styles.infoCell}>
            <span className={styles.label}>Room No.:</span>
            <span className={styles.value}> {room}</span>
          </div>
          <div className={styles.infoCell}>
            <span className={styles.label}>Age:</span>
            <span className={styles.value}> {age}</span>
          </div>
        </div>

        {/* Address — full width */}
        <div className={styles.addressRow}>
          <span className={styles.label}>Address: </span>
          <span className={styles.value}>{address}</span>
        </div>

        {/* Admitting Impression */}
        <div className={styles.diagRow}>
          <span className={styles.label}>Admitting Impression/Clinical Diagnosis:</span>
          <span className={styles.value}> {admitting}{diagnosis}</span>
          <span className={styles.underline} style={{ width: "20mm" }} />
        </div>
      </div>

      {/* ── Blood type checklist ── */}
      <div className={styles.bloodGrid}>
        <div className={styles.checkItem}>[ ] Whole Blood</div>
        <div className={styles.checkItem}>[ ] Plasma</div>
        <div className={styles.checkItem}>[ ] Fresh Whole Blood</div>
        <div className={styles.checkItem}>[ ] Platelet Concentrate</div>
        <div className={styles.checkItem}>[ ] Packed Red Cells</div>
        <div className={styles.checkItem}>[ ] Fresh Frozen Plasma</div>
        <div className={styles.checkItem}>[ ] Washed Rec Cells</div>
        <div className={styles.checkItem}>[ ] Others</div>
      </div>

      {/* ── Routine / Emergency ── */}
      <div className={styles.routineSection}>
        <div>[ ] ROUTINE</div>
        <div>[ ] EMERGENCY</div>
      </div>

      {/* ── Extreme Need Section ── */}
      <div className={styles.extremeSection}>
        <div className={styles.extremeTitle}>EXTREME NEED OF BLOOD: (TO BE FILLED UP BY CLINICIANS ONLY)</div>
        <div className={styles.extremeSubtitle}>I hereby direct the blood bank to release the following.</div>
        <div className={styles.extremeSub2}>(Please check the appropriate box or boxes needed)</div>
        <div className={styles.extremeItems}>
          <div className={styles.extremeItem}>[ ] ABO and RH Type - Specific <strong>UNCROSSMATCHED Blood</strong></div>
          <div className={styles.extremeItem}>[ ] GROSS "O" <strong>UNCROSSMATCHED Blood</strong>(if available)</div>
          <div className={styles.extremeItem}>[ ] Crossmatched Blood - <strong>SALINE</strong> Phase only (tube method)</div>
          <div className={styles.extremeItem}>[ ] Crossmatched Blood - <strong>SALINE</strong> and <strong>ALBUMIN</strong>Phase only (tube method)</div>
          <div className={styles.extremeItem}>[ ]Crossmatched Blood - AHG Phase (30 min.)</div>
        </div>
      </div>

      {/* ── Justification ── */}
      <div className={styles.justRow}>
        <span>Justification for emergency release of blood</span>
        <span className={styles.justLine} />
      </div>
      <div className={styles.fullLine} />

      {/* ── Requested by ── */}
      <div className={styles.reqRow}>
        <span className={styles.label}>Requested by:</span>
      </div>

      {/* ── MD / RN Signatures ── */}
      <div className={styles.sigRow}>
        <div className={styles.sigBlock}>
          <div className={styles.sigLineRow}>
            <span className={styles.sigLine} />
            <span className={styles.sigSuffix}>,M.D.</span>
          </div>
          <div className={styles.sigLabel}>Signature over Printed Name of Physician</div>
        </div>
        <div className={styles.sigBlock}>
          <div className={styles.sigLineRow}>
            <span className={styles.sigLine} />
            <span className={styles.sigSuffix}>,R.N.</span>
          </div>
          <div className={styles.sigLabel}>Signature over Printed Name of Nurse</div>
        </div>
      </div>

      {/* ── Received / Date ── */}
      <div className={styles.receivedRow}>
        <div className={styles.receivedField}>
          <span className={styles.label}>Received by:</span>
          <span className={styles.receivedLine} />
        </div>
        <div className={styles.receivedField}>
          <span className={styles.label}>Date/Time:</span>
          <span className={styles.receivedLine} />
        </div>
      </div>

    </div>
  );
}
