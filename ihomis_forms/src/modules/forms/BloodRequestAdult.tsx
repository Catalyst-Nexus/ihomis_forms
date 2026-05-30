import styles from "./BloodRequestAdult.module.css";

export default function BloodRequestAdult({ patientName, patientData = {} }) {
  const hospitalNo = patientData.hospitalNo || patientData.hospNo || "";
  const name = patientName || patientData.patientName || "";
  const sex = patientData.sex || "";
  const age = patientData.age || "";
  const caseNo = patientData.caseNo || patientData.caseNum || "";
  const birthDate = patientData.birthDate || "";
  const date = patientData.date || "";
  const department = patientData.department || "";
  const roomNo = patientData.roomNo || "";
  const address = patientData.address || "";
  const admittingImpression = patientData.admittingImpression || "";
  return (
    <div className={styles.wrap}>

      {/* ═══════════════ PAGE 1 ═══════════════ */}
      <div className={styles.page}>
        {/* META */}
        <div className={styles.metaSection}>
          <div className={styles.metaRow}>
            <span className={styles.label}>Hospital No.:</span>
            <span>{hospitalNo}</span>
          </div>
          <div className={styles.metaRow}>
            <span className={`${styles.metaCell} ${styles.metaCellWide}`}>
              <span className={styles.label}>Patient Name:</span>
              <span>{name}</span>
            </span>
            <span className={styles.metaCell} style={{ flex: 1, justifyContent: "center" }}>
              <span className={styles.label}>Sex:</span>
              <span>{sex}</span>
            </span>
            <span className={styles.metaCell} style={{ flex: 1, justifyContent: "flex-end" }}>
              <span className={styles.label}>Age:</span>
              <span>{age}</span>
            </span>
          </div>
          <div className={styles.metaRow}>
            <span className={`${styles.metaCell} ${styles.metaCellWide}`}>
              <span className={styles.label}>Case No.:</span>
              <span>{caseNo}</span>
            </span>
            <span className={styles.metaCell} style={{ flex: 1, justifyContent: "center" }}>
              <span className={styles.label}>BirthDate:</span>
              <span>{birthDate}</span>
            </span>
            <span className={styles.metaCell} style={{ flex: 1, justifyContent: "flex-end" }}>
              <span className={styles.label}>Date:</span>
              <span>{date}</span>
            </span>
          </div>
          <div className={styles.metaRow}>
            <span className={`${styles.metaCell} ${styles.metaCellWide}`}>
              <span className={styles.label}>Department:</span>
              <span>{department}</span>
            </span>
            <span className={`${styles.metaCell} ${styles.metaCellRest}`} style={{ flex: 1, justifyContent: "flex-end" }}>
              <span className={styles.label}>Room No.:</span>
              <span>{roomNo}</span>
            </span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.label}>Address:</span>
            <span>{address}</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.label}>Admitting Impression/Clinical Diagnosis:</span>
            <span>{admittingImpression}</span>
          </div>
        </div>

        {/* HISTORY */}
        <div className={styles.gap} />
        <div className={styles.inlineRow}>
          <span>History of Previous Transfusion:</span>
          <span className={styles.ml4}>When:</span>
          <span className={`${styles.line} ${styles.lineMd}`} />
        </div>
        <div className={`${styles.inlineRow} ${styles.indentWhere}`}>
          <span>Where:</span>
          <span className={`${styles.line} ${styles.lineMd}`} />
        </div>

        {/* TYPE OF REQUEST */}
        <div className={styles.gap} />
        <div className={styles.inlineRow}>
          <span>Type of Request:</span>
          <span className={styles.ml8}>[ ] ROUTINE</span>
          <span className={styles.ml8}>[ ] STAT</span>
        </div>

        {/* COMPONENTS HEADING */}
        <div className={styles.gap} />
        <p className={styles.sectionHeading}>Check Components Needed and Indication for Transfusion:</p>

        {/* WHOLE BLOOD */}
        <div className={styles.compRow}>
          <span>
            <span className={styles.chk}>[ ]</span>
            <strong> Whole Blood(approximate volume 500ml):</strong>{" "}
            Blood Type <span className={`${styles.line} ${styles.lineSm}`} />{" "}
            Number of units needed<span className={`${styles.line} ${styles.lineSm}`} />.
          </span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] WB-1 :</span>
          <span>
            <strong>Active bleeding</strong> with at least one of the following:<br />
            a. Loss of over 15% blood volume.<br />
            b. Hb less than 9g/dl<br />
            c. Blood pressure decrease over 20 &, or less than 90mm Hg. Systolic
          </span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] WB-2 :</span>
          <span>
            Others. Please specify: (This code will automaticall trigger a review of your indication){" "}
            <span className={`${styles.line} ${styles.lineFill}`} />
          </span>
        </div>

        {/* PACKED RBC */}
        <div className={styles.gapSm} />
        <div className={styles.compRow}>
          <span>
            <span className={styles.chk}>[ ]</span>
            <strong> PACKED RBC(approximate volume 250ml):</strong>{" "}
            Blood Type <span className={`${styles.line} ${styles.lineSm}`} />{" "}
            Number of units needed<span className={`${styles.line} ${styles.lineSm}`} />
          </span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] R-1 :</span>
          <span>Hgb less than 8 gm/dl of Hct less than 24% (if not due to treatable cause)</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] R-2 :</span>
          <span>
            Patients receiving general anesthesia if:<br />
            a. Preoperative Hb less than 8g/dl of Hct less than 24%<br />
            b. Major blood letting operation and Hb less than 10g/dl or Hct less than 30%<br />
            c. Signs of homodynamic instability or inadequate oxygen carrying capacity(symptomatic anemia)
          </span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] R-3 :</span>
          <span>Symptomatic anemia regardless of Hb level (dyspnea, syncope, postural hypotension, tachycardia, chest-pains, TIA)</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] R-4 :</span>
          <span>Hgb less than 8g/dl or Hct less than 24% with concomitant hemorrhage, COPD, CAD, hemoglobinopathy sepsis</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] R-5 :</span>
          <span>
            Others. Please specify: (This code will automaticall trigger a review of your indication){" "}
            <span className={`${styles.line} ${styles.lineFill}`} />
          </span>
        </div>

        {/* WASHED RBC */}
        <div className={styles.gapSm} />
        <div className={styles.compRow}>
          <span>
            <span className={styles.chk}>[ ]</span>
            <strong> Washed RBC(approximate volume 180ml):</strong>{" "}
            Blood Type <span className={`${styles.line} ${styles.lineSm}`} />{" "}
            Number of units needed<span className={`${styles.line} ${styles.lineSm}`} />.
          </span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] WP-1 :</span>
          <span>History of previous severe allergic transfusion reactions or anaplylactoid reactions in immunocompromised patients</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] WP-2 :</span>
          <span>Transfusion of group "O" blood during emergencies when the specific blood is not immediately available</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] WP-3 :</span>
          <span>Paroxysmal nocturnal hemoglobinuria</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] WP-4 :</span>
          <span>
            Others. Please specify: (This code will automaticall trigger a review of your indication){" "}
            <span className={`${styles.line} ${styles.lineFill}`} />
          </span>
        </div>

      </div>

      {/* ═══════════════ PAGE 2 ═══════════════ */}
      <div className={`${styles.page} ${styles.pageP2}`}>

        {/* NOTE RBC */}
        <div className={styles.noteBlock}>
          <p className={styles.noteTitle}>NOTE : Comments on RBC products:</p>
          <p className={styles.noteItem}>1. Document pre and post-transfusion Hb& Hct withing 24 hours</p>
          <p className={styles.noteItem}>2. Dose; Adults- give on a unit-to-unit basis</p>
          <p className={styles.noteItem}>Remember, 1 unit may suffice to alleviate symptoms of anemia</p>
          <p className={styles.noteItem}>Infants: 10ml/kg. BW</p>
        </div>

        {/* PLATELETS */}
        <div className={styles.compRow}>
          <span className={styles.chk}>[ ]</span>
          <span>
            <strong>Platelets(approximate volume 50ml):</strong>{" "}
            Blood Type <span className={`${styles.line} ${styles.lineSm}`} />{" "}
            Number of units needed<span className={`${styles.line} ${styles.lineSm}`} />
          </span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] P-1 :</span>
          <span>Prophylactic administration with count &lt;=10,000 and not due to TTP, ITP, HUS</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] P-2 :</span>
          <span>Active bleeding with count &lt;50,000</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] P-3 :</span>
          <span>Platelet count &lt;50,000 and patient to undergo invasive procedure within 8 hours</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] P-4 :</span>
          <span>Platelet count &lt;100,000 if surgery is on critical area (e.g. eye, brain, etc)</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] P-5 :</span>
          <span>Massive transfusion with diffuse microvascular bleeding and no time to obtain platelet count</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] P-6 :</span>
          <span>
            Others. Please specify: (This code will automaticall trigger a review of your indication){" "}
            <span className={`${styles.line} ${styles.lineFill}`} />
          </span>
        </div>
        <div className={styles.noteBlock}>
          <p className={styles.noteTitle}>NOTE :</p>
          <p className={styles.noteItem}>Document platelet count before (within 8 hours) and after (within 1 hour) transfusion</p>
          <p className={styles.noteItem}>Dose: 1 unit/10kg. BW with maximum of 5 units</p>
        </div>

        {/* CRYOPRECIPITATE */}
        <div className={styles.gapSm} />
        <div className={styles.compRow}>
          <span className={styles.chk}>[ ]</span>
          <span>
            <strong>Cryoprecipitate(approximate volume 20ml):</strong>{" "}
            Blood Type <span className={`${styles.line} ${styles.lineSm}`} />{" "}
            Number of units needed<span className={`${styles.line} ${styles.lineSm}`} />.
          </span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] C-1 :</span>
          <span>Signicant hypofibrinogemi (&lt; 100 mg/dl)</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] C-2 :</span>
          <span>Hemophilia A with bleeding or will undergo surgery or invasive procedure</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] C-3 :</span>
          <span>Von Willebrand disease or uremic bleeding with prolonged bleeding time</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] C-4 :</span>
          <span>
            Others. Please specify: (This code will automaticall trigger a review of your indication){" "}
            <span className={`${styles.line} ${styles.lineFill}`} />
          </span>
        </div>

        {/* FRESH FROZEN PLASMA */}
        <div className={styles.gapSm} />
        <div className={styles.compRow}>
          <span>
            <strong>Fresh Frozen Plasma(approximate volume 200-250ml):</strong>{" "}
            Blood Type <span className={`${styles.line} ${styles.lineSm}`} />{" "}
            Number of units needed<span className={`${styles.line} ${styles.lineSm}`} />
          </span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] F-1 :</span>
          <span>PT or PTT &gt; 1.5 times mid-normal range within 8 hours of transfusion (PT &gt; 17secs. PTT &gt; 47 secs)</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] F-2 :</span>
          <span>Specific factor deficiencies not treatable with cryoprecipitate</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] F-3 :</span>
          <span>Reversal of coumadin anticoagulation in patients who are bleeding and not treatable with vitamin K</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] F-4 :</span>
          <span>Treatment of TTP</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] F-5 :</span>
          <span>
            Clinical coagulopathy associated with<br />
            a. Massive transfusion (u 20 units of blood in 24 hours)<br />
            b. Late pregnancy termination or abruption placentae
          </span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.code}>[ ] F-6 :</span>
          <span>
            Others. Please specify: (This code will automaticall trigger a review of your indication){" "}
            <span className={`${styles.line} ${styles.lineFill}`} />
          </span>
        </div>

        {/* NOTE FFP */}
        <div className={styles.noteBlock}>
          <p className={styles.noteTitle}>NOTE :</p>
          <p className={styles.noteItem}>1. Document PT/PTT pre and post-transfusion within 4 hours.</p>
          <p className={styles.noteItem}>2. Dose: initial loading dose of 15 ml/kg. BW Correction of significant coagulopathy requires &gt;=2 units FFP</p>
        </div>

        {/* REQUESTED BY */}
        <div className={styles.gap} />
        <p className={styles.plainLabel}>Requested by:</p>

        {/* SIGNATURES */}
        <div className={styles.sigRow}>
          <div className={styles.sigBlock}>
            <div className={styles.sigLineWithMd}>
              <span className={styles.sigMd}>M.D.</span>
            </div>
            <p className={styles.sigLabel}>Signature over Printed Name of Physician</p>
          </div>
          <div className={styles.sigBlock}>
            <p className={styles.sigLabel}>Signature over Printed Name of Nurse on Duty</p>
          </div>
        </div>

        {/* REMARKS */}
        <div className={styles.gapSm} />
        <div className={styles.remarksRow}>
          <span>Remarks:</span>
          <span className={`${styles.line} ${styles.lineFull}`} />
        </div>

        {/* RECEIVED BY */}
        <p className={styles.plainLabel}>Received by:</p>
        <div className={styles.sigRow}>
          <div className={styles.sigBlock}>
            <p className={styles.sigLabel}>(Blood Bank Staff)</p>
          </div>
          <div className={styles.sigBlock}>
            <p className={styles.sigLabel}>Date/Time</p>
          </div>
        </div>
      </div>

    </div>
  );
}