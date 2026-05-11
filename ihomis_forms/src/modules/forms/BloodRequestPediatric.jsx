import styles from "./BloodRequestPediatric.module.css";

export default function BloodRequestPediatric() {
  return (
    <div className={styles.wrap}>

      {/* ═══════════════ PAGE 1 ═══════════════ */}
      <div className={styles.page}>
        {/* META */}
        <div className={styles.metaSection}>
          <div className={styles.metaRow}>
            <span className={styles.label}>Hospital No.:</span>
            <span>00000000020971</span>
          </div>
          <div className={styles.metaRow}>
            <span className={`${styles.metaCell} ${styles.metaCellWide}`}>
              <span className={styles.label}>Patient Name:</span>
              <span>MATILOS , EUGENIA MAMBA</span>
            </span>
            <span className={styles.metaCell}>
              <span className={styles.label} style={{ marginLeft: "50px" }}>Sex:</span>
              <span>F</span>
            </span>
            <span className={styles.metaCell}>
              <span className={styles.label} style={{ marginLeft: "200px" }}>Age:</span>
              <span>67 year(s)</span>
            </span>
          </div>
          <div className={styles.metaRow}>
            <span className={`${styles.metaCell} ${styles.metaCellWide}`}>
              <span className={styles.label}>Case No.:</span>
              <span>ADM-2026-010617</span>
            </span>
            <span className={styles.metaCell}>
              <span className={styles.label} style={{ marginLeft: "68px" }}>BirthDate:</span>
              <span>January 11, 1959</span>
            </span>
            <span className={styles.metaCell}>
              <span className={styles.label} style={{ marginLeft: "60px" }}>Date:</span>
              <span>April 21, 2026</span>
            </span>
          </div>
          <div className={styles.metaRow}>
            <span className={`${styles.metaCell} ${styles.metaCellWide}`}>
              <span className={styles.label}>Department:</span>
              <span>MEDICAL</span>
            </span>
            <span className={`${styles.metaCell} ${styles.metaCellRest}`}>
              <span className={styles.label}>Room No.:</span>
              <span>ISOLATION - 6SAIS - BED 03</span>
            </span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.label}>Address:</span>
            <span>P-1, ALIBUJID, BUENAVISTA, AGUSAN DEL NORTE</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.label}>Admitting Impression/Clinical Diagnosis:</span>
            <span>CAP-MR CHF, T/C ACS HPN STAGE 2</span>
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
          <span className={styles.ml8}>&nbsp; [ ] STAT</span>
        </div>

        {/* COMPONENTS HEADING */}
        <div className={styles.gap} />
        <p className={styles.sectionHeading}>Check Components Needed and Indication for Transfusion:</p>

        {/* WHOLE BLOOD */}
        <div className={styles.compRow}>
          <span className={styles.chk}>[ ]</span>
          <span>
            <strong>Whole Blood::</strong>{" "}
            &nbsp;Blood Type: <span className={`${styles.line} ${styles.lineSm}`} />{" "}
            &nbsp;Number of units needed <span className={`${styles.line} ${styles.lineSm}`} />
          </span>
        </div>
        <div className={styles.subheadingRow}>
          <span>For Exchange Transfusion:</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          <span>Hyperbilirubinemia in infants with indirect bilirubin of 20mg/dl in the first week of life.</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          <span>Hyperbilirubinemia with prematurity and/ or other concomitant illnesses to include one or more of the following: Prenatal asphyxia, acidosis, prolonged hypoxemia, hypotermia, sepsis, and hemolysis.</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          <span>Other:<span className={`${styles.line} ${styles.lineFill}`} /></span>
        </div>

        {/* PACKED RBC */}
        <div className={styles.gapSm} />
        <div className={styles.compRow}>
          <span className={styles.chk}>[ ]</span>
          <span>
            <strong>PACKED RBC::</strong>{" "}
            &nbsp;Blood Type: <span className={`${styles.line} ${styles.lineSm}`} />{" "}
            &nbsp;Number of units needed <span className={`${styles.line} ${styles.lineSm}`} />
          </span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          {/* > must be &gt; in JSX text */}
          <span>Hypovolemia form acute blood loss with signs of shock or anticipated blood loss of &gt;10%</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          {/* < must be &lt; in JSX text */}
          <span>Candidates for Major Surgery and hematocrit &lt; 30% (Neonatal &lt; 35%)</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          <span>Hypertransfusion for chronic-hemolytic anemias; (Thalassemia)</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          <span>Hemoglobin less than 13gm/dl (Hct.40%) in neonates less than 24 hours old, severe pulmonary disease, with assisted ventilation, cyanotic heart disease or heart failure.</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          {/* >= must be &gt;= in JSX text */}
          <span>Neonates with phlebotomy lose &gt;= 5-10% of total blood volume.</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          <span>Hemoglobin level less than 8gm/dl or Hct less than 25% in stable newborn infants with clinical manisfestations anemia.</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          <span>Other:<span className={`${styles.line} ${styles.lineFill}`} /></span>
        </div>

        {/* PLATELETS CONCENTRATE */}
        <div className={styles.gapSm} />
        <div className={styles.compRow}>
          <span className={styles.chk}>[ ]</span>
          <span>
            <strong>Platelets Concentrate::</strong>{" "}
            &nbsp;Blood Type: <span className={`${styles.line} ${styles.lineSm}`} />{" "}
            &nbsp;Number of units needed <span className={`${styles.line} ${styles.lineSm}`} />
          </span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          <span>Active bleeding and thrombocytopenia &lt; 50,000/L or at risk for intracranial hemorrhage.</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          <span>Active bleeding and qualilative defect</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          <span>Prophylaxis for severe thrombocytopenia &lt; 20,000/L or associated qualilalitve defect.</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          <span>Schedule invasive procedure and thrombocytopenia &lt; 70,000/L or associated quality defect.</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          <span>Other:<span className={`${styles.line} ${styles.lineFill}`} /></span>
        </div>

        {/* FRESH FROZEN PLASMA */}
        <div className={styles.gapSm} />
        <div className={styles.compRow}>
          <span className={styles.chk}>[ ]</span>
          <span>
            <strong>Fresh Frozen Plasma::</strong>{" "}
            &nbsp;Blood Type: <span className={`${styles.line} ${styles.lineSm}`} />{" "}
            &nbsp;Number of units needed <span className={`${styles.line} ${styles.lineSm}`} />
          </span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          <span>Significant multiple coagulation factor deficiency or acquired factor deficiency (e.g. dengue, shock syndrome)</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          <span>Significant congenital factor deficiency</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          <span>Anti-thrombin III deficiency.</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          {/* > 1 Blood Volume — escape > */}
          <span>Bleeding in exchange transfucion or massive transfusion (&gt; 1 Blood Volume)</span>
        </div>

        {/* CRYOPRECIPITATE */}
        <div className={styles.gapSm} />
        <div className={styles.compRow}>
          <span className={styles.chk}>[ ]</span>
          <span>
            <strong>Cryoprecipitate ::</strong>{" "}
            &nbsp;Blood Type: <span className={`${styles.line} ${styles.lineSm}`} />{" "}
            &nbsp;Number of units needed <span className={`${styles.line} ${styles.lineSm}`} />
          </span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          <span>Factor VIII Deficiency (Hemophilia A)</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          <span>Von Willebrands Disease</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          <span>Disseminated Intravascular Coagulation</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          <span>Uremia with active bleeding or scheduled invasive procedure</span>
        </div>
        <div className={styles.itemRow}>
          <span className={styles.chkIndent}>[ ]</span>
          <span>Other:<span className={`${styles.line} ${styles.lineFill}`} /></span>
        </div>

        <div className="brp-footer">
          Generated by: TCP T. TCP on {generatedOn}
        </div>
      </div>

      {/* ═══════════════ PAGE 2 ═══════════════ */}
      <div className={`${styles.page} ${styles.pageP2}`}>

        {/* REQUESTED BY */}
        <div className={styles.plainLabel}>Requested by:</div>

        {/* SIGNATURES */}
        <div className={styles.sigRow}>
          <div className={styles.sigBlock}>
            <div className={styles.sigLineWithMd}>
              <span className={styles.sigMd} style={{ marginLeft: "300px" }}>M. D.</span>
            </div>
            <p className={styles.sigLabel}>Signature over Printed Name of Physician</p>
          </div>
          <div className={styles.sigBlock}>
            <div className={styles.sigLineEmpty} />
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
        <div className={styles.gap} />
        <div className={styles.plainLabel}>Received by:</div>
        <div className={`${styles.gap} ${styles.gapTall}`} />
        <div className={styles.sigRow}>
          <div className={styles.sigBlock}>
            <div className={styles.sigLineEmpty} />
            <p className={styles.sigLabel}>(Blood Bank Staff)</p>
          </div>
          <div className={styles.sigBlock}>
            <div className={styles.sigLineEmpty} />
            <p className={styles.sigLabel}>Date/Time</p>
          </div>
        </div>

        <div className={`${styles.footer} form-footer`}>
          Generated by: TCP T. TCP on 2026-04-21 01:07 pm
        </div>
      </div>

    </div>
  );
}