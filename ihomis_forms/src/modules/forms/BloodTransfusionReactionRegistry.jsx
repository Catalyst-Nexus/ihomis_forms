import styles from "./BloodTransfusionReactionRegistry.module.css";


export default function BloodTransfusionReactionRegistry({ patientName, patientData = {} }) {
  const caseNum = patientData.caseNum || patientData.caseNo || "";
  const hospitalNo = patientData.hospitalNo || patientData.hospNo || patientData.hospitalNumber || "";
  const age = patientData.age || "";
  const birthDate = patientData.birthDate || patientData.birthdate || patientData.dob || "";
  const name = patientName || patientData.patientName || patientData.fullName || "";
  const sex = patientData.sex || "";

  return (
    <div className={styles.wrap}>

      {/* ═══════════════ PAGE 1 ═══════════════ */}
      <div className={styles.page}>

        {/* META TOP */}
        <div className={styles.metaSection}>
          <div className={styles.metaRow}>
            <span className={styles.label}>Case Number:</span>
            <span>{caseNum}</span>
          </div>

          <div className={styles.metaRow}>
            <span className={`${styles.metaCell} ${styles.metaCellWide}`}>
              <span className={styles.label}>Hospital No.:</span>
              <span>{hospitalNo}</span>
            </span>
            <span className={styles.metaCell} style={{ flex: 1, justifyContent: "center" }}>
              <span className={styles.label}>Age:</span>
              <span>{age}</span>
            </span>
            <span className={styles.metaCell} style={{ flex: 1, justifyContent: "flex-end" }}>
              <span className={styles.label}>Date of Birth:</span>
              <span>{birthDate}</span>
            </span>
          </div>

          <div className={styles.metaRow}>
            <span className={`${styles.metaCell} ${styles.metaCellWide}`}>
              <span className={styles.label}>Name:</span>
              <span>{name}</span>
            </span>
            <span className={styles.metaCell} style={{ flex: 1, justifyContent: "center" }}>
              <span className={styles.label}>Sex:</span>
              <span>{sex}</span>
            </span>
            <span className={styles.metaCell} style={{ flex: 1, justifyContent: "flex-end" }}>
              <span className={styles.label}>Requesting Physician:</span>
              <span className={`${styles.line} ${styles.lineSm}`} />
            </span>
          </div>
        </div>

        {/* TRANSFUSION DATES */}
        <div className={styles.gapSm} />
        <div className={styles.inlineRow}>
          <span>Transfusion began date:</span>
          <span className={`${styles.line} ${styles.lineMd}`} />
          <span className={styles.spacer} />
          <span>Time:</span>
          <span className={`${styles.line} ${styles.lineSm}`} />
        </div>
        <div className={styles.inlineRow}>
          <span>Transfusion ended date:</span>
          <span className={`${styles.line} ${styles.lineMd}`} />
          <span className={styles.spacer} />
          <span>Time:</span>
          <span className={`${styles.line} ${styles.lineSm}`} />
        </div>
        <div className={styles.inlineRow}>
          <span>Date of BTR:</span>
          <span className={`${styles.line} ${styles.lineMd}`} />
          <span className={styles.spacer} />
          <span>Time:</span>
          <span className={`${styles.line} ${styles.lineSm}`} />
        </div>

        {/* VITALS TABLE */}
        <div className={styles.gap} />
        <table className={`${styles.table} ${styles.vitalsTable}`}>
          <thead>
            <tr>
              <th></th>
              <th>Temp</th>
              <th>Pulse</th>
              <th>RR</th>
              <th>BP</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Pre-transfusion</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Post-transfusion</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        {/* SYMPTOMS */}
        <div className={styles.gapSm} />
        <div className={styles.symptomsSection}>
          <p className={styles.sectionLabel}>Symptoms:</p>
          <div className={styles.symptomsGrid}>
            <span>[ ] Hives</span>
            <span>[ ] Pain (Location)</span>
            <span>[ ] Itchiness</span>
            <span>[ ] Nausea</span>
            <span>[ ] Chills</span>
            <span>[ ] Rash</span>
            <span>[ ] Fever</span>
            <span>[ ] Hematuria</span>
            <span className={styles.othersRow}>
              [ ] Others:
              <span className={`${styles.line} ${styles.lineFill}`} />
            </span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className={styles.gap} />
        <div className={styles.inlineRow}>
          <span>Action: Anti-Histamine given:</span>
          <span className={`${styles.line} ${styles.lineLg}`} />
          <span className={styles.spacer} />
          <span>Medicine given:</span>
          <span className={`${styles.line} ${styles.lineLg}`} />
        </div>
        <div className={styles.inlineRow}>
          <span>Volume received by patient:</span>
          <span className={`${styles.line} ${styles.lineLg}`} />
          <span className={styles.spacer} />
          <span>Response to Medicine:</span>
          <span className={`${styles.line} ${styles.lineLg}`} />
        </div>
        <div className={styles.inlineRow}>
          <span>Nurse on-duty:</span>
          <span className={`${styles.line} ${styles.lineLg}`} />
        </div>

        {/* DIVIDER */}
        <div className={styles.gap} />
        <div className={styles.divider} />
        <div className={styles.gap} />

        {/* BLOOD BANK USE */}
        <p className={styles.sectionBold}>BLOOD BANK USE</p>
        <div className={styles.inlineRow}>
          <span>Blood Bank notified: Date &amp; Time:</span>
          <span className={`${styles.line} ${styles.lineLg}`} />
          <span className={styles.spacer} />
          <span>BTR form received: Date &amp; Time:</span>
          <span className={`${styles.line} ${styles.lineLg}`} />
        </div>

        {/* BLOOD UNITS TABLE */}
        <div className={styles.gap} />
        <table className={`${styles.table} ${styles.unitsTable}`}>
          <thead>
            <tr>
              <th>Blood Unit No.</th>
              <th>Source</th>
              <th>Component</th>
              <th>Amount Transfused</th>
              <th>Volume returned</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>&nbsp;</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>&nbsp;</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        {/* STEPS */}
        <div className={styles.gap} />
        <p className={styles.plain}>Complete steps 1-3 on all reported reactions:</p>
        <div className={styles.gapSm} />
        <p className={styles.plain}>
          1. Clerical check: Check patient and donor ID on all labels and records (include all blood
          components transfused in the last 24 hours)
        </p>
        <div className={styles.gapSm} />
        <div className={styles.clericalRow}>
          <span>[ ] No clerical error detected</span>
          <span>[ ] Clerical error detected</span>
        </div>
        <div className={styles.inlineRow} style={{ marginTop: "0.25rem" }}>
          <span>Explanation:</span>
          <span className={`${styles.line} ${styles.lineXl}`} />
        </div>
        
        <div className={styles.gap} />
        <p className={styles.plain}>2. Check for patient sample</p>
        <div className={styles.inlineRow}>
          <span>2.1 Check for visible hemolysis:</span>
          <span className={`${styles.line} ${styles.lineMd}`} />
        </div>
        <div className={styles.inlineRow}>
          <span>2.2 Check for visible hemolysis:</span>
          <span className={`${styles.line} ${styles.lineMd}`} />
        </div>
        <p className={styles.plain}>2.3 Collect blood sample. Test for the following:</p>

        
      </div>

      {/* ═══════════════ PAGE 2 ═══════════════ */}
      <div className={`${styles.page} ${styles.pageP2}`}>

        {/* BILIRUBIN TEST */}
        <div className={styles.inlineRow}>
          <span className={styles.label}>Bilirubin Test:</span>
          <span>&nbsp; Result</span>
        </div>
        <div className={styles.gapSm} />
        <table className={`${styles.table} ${styles.bilirubinTable}`}>
          <tbody>
            <tr>
              <td className={styles.rowLabel}>Total Bilirubin:</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td className={styles.rowLabel}>B1(conjugated)</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td className={styles.rowLabel}>B2(unconjugated)</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        {/* URINE */}
        <div className={styles.gap} />
        <p className={styles.plain}>
          2.4 Collect 1st hour and 5th hour urine. Test for the following:
        </p>
        <div className={styles.gapSm} />
        <table className={`${styles.table} ${styles.urineTable}`}>
          <thead>
            <tr>
              <th>Urine</th>
              <th>Urobilinogen</th>
              <th>Bilirubin</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1st hour</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>2nd hour</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        {/* NOTE */}
        <div className={styles.gap} />
        <p className={styles.plain}>
          Note: Attached copy of laboratory test results. Save patient blood and urine sample
          for pathologist verification.
        </p>

        {/* DAT */}
        <div className={styles.gap} />
        <p className={styles.plain}>3. DIRECT ANTIGLOUBIN TEST: (Recepient)</p>
        <div className={styles.inlineRow} style={{ marginTop: "0.25rem" }}>
          <span>Post Transfusion:</span>
          <span className={`${styles.line} ${styles.lineSm}`} />
          <span className={styles.spacer} />
          <span>If positive, Pre Transfusion:</span>
          <span className={`${styles.line} ${styles.lineSm}`} />
        </div>

        {/* MED TECH */}
        <div className={styles.gap} />
        <div className={styles.medtechRow}>
          <span className={`${styles.label} ${styles.medtechLabel}`}>MEDICAL TECHNOLOGIST:</span>
          <span className={`${styles.line} ${styles.lineLg}`} />
          <span className={styles.spacer} />
          <span className={styles.label}>DATE:</span>
          <span className={`${styles.line} ${styles.lineLg}`} />
        </div>

        {/* PATHOLOGIST */}
        <div className={styles.gap} />
        <p className={styles.plain}>4. Refer to Pathologist on duty (Recepient)</p>
        <div className={styles.centeredFields}>
          <div className={styles.centeredField}>
            <span>Name of Pathologist:</span>
            <span className={`${styles.line} ${styles.lineMd}`} />
          </div>
          <div className={styles.centeredField}>
            <span>Findings:</span>
            <span className={`${styles.line} ${styles.lineMd}`} />
          </div>
          <div className={styles.centeredField}>
            <span>Recommendation:</span>
            <span className={`${styles.line} ${styles.lineMd}`} />
          </div>
        </div>

        {/* HEMOLYTIC NOTE */}
        <div className={styles.gap} />
        <p className={`${styles.plain} ${styles.italicNote}`}>
          If the above does not indicate a hemolytic reaction, further testing not required. If there is evidence of hemolysis of patient's
          condition indicates a hemolytic reaction continue with the following:
        </p>

        {/* REPEAT TESTING TABLE */}
        <div className={styles.gap} />
        <p className={styles.plain}>4. Repeat Testing</p>
        <div className={styles.gapSm} />
        <table className={`${styles.table} ${styles.repeatTable}`}>
          <thead>
            <tr>
              <th rowSpan={2}></th>
              <th colSpan={3} className={styles.groupHeader}>CELLS</th>
              <th colSpan={2} className={styles.groupHeader}>SERUM</th>
              <th colSpan={3} className={styles.groupHeader}>INTERPRETATION</th>
            </tr>
            <tr>
              <th>Anti A</th>
              <th>Anti B</th>
              <th>Anti D</th>
              <th>A cells</th>
              <th>B cells</th>
              <th>ABO</th>
              <th>RH</th>
              <th>Ab Screen</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Receipent</td>
              <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr>
              <td>Pre-Transfusion</td>
              <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr>
              <td>Receipent</td>
              <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr>
              <td>Post-Transfusion</td>
              <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr>
              <td>Donor</td>
              <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr>
              <td>Bag/segment</td>
              <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
          </tbody>
        </table>

        {/* COMPATIBILITY TABLE */}
        <div className={styles.gap} />
        <p className={styles.plain}>5. Repeat Compatibility Testing</p>
        <div className={styles.gapSm} />
        <table className={`${styles.table} ${styles.compatTable}`}>
          <thead>
            <tr>
              <th></th>
              <th>IS</th>
              <th>37C</th>
              <th>AHG</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Pre-Transfusion</td>
              <td></td><td></td><td></td>
            </tr>
            <tr>
              <td>Post-Transfusion</td>
              <td></td><td></td><td></td>
            </tr>
          </tbody>
        </table>

        {/* NOTES */}
        <div className={styles.gap} />
        <p className={styles.plain}>
          Crossmatches should be repeated on all units transfused within 24 hours prior to reaction. Record on daily logbook.
        </p>
        <div className={styles.gapSm} />
        <p className={styles.plain}>
          All units on hold for future transfusion MUST be crossmatched with patient's post reaction specimen.
        </p>
        <div className={styles.gap} />
        <p className={styles.plain}>6. Other laboratory test performed: (Only if there is a 2C temperature rise)</p>
        <div className={styles.gapSm} />
        <p className={styles.plain}>a. Bacteriology Specimen: Blood segment/ Bag for:</p>
        <div className={`${styles.centeredFields} ${styles.centeredFieldsNarrow}`}>
          <div className={styles.centeredField}>
            <span>Gram's Stain</span>
            <span className={`${styles.line} ${styles.lineLg}`} />
          </div>
          <div className={styles.centeredField}>
            <span>Culture</span>
            <span className={`${styles.line} ${styles.lineLg}`} />
          </div>
        </div>

        <div className={styles.gap} />
        <div className={styles.inlineRow}>
          <span>7. Additional tests:</span>
          <span className={`${styles.line} ${styles.lineXl}`} />
        </div>
        
        <div className={styles.gap} />
        <p className={styles.plain}>
          If there is evidence of hemolytic reaction, notify the Blood Bank Head (Pathologist) immediately
        </p>

        {/* TECHNOLOGIST / DATE */}
        <div className={styles.gapTall} />
        <div className={`${styles.centeredFields} ${styles.centeredFieldsRight}`}>
          <div className={styles.centeredField}>
            <span>Technologist:</span>
            <span className={`${styles.line} ${styles.lineLg}`} />
          </div>
          <div className={styles.centeredField}>
            <span>Date:</span>
            <span className={`${styles.line} ${styles.lineLg}`} />
          </div>
        </div>

        {/* COMMENTS */}
        <div className={styles.gapTall} />
        <p className={styles.label}>COMMENTS/RECOMMENDATIONS:</p>
        <div className={styles.gapTall} />
        <div className={styles.reviewedRow}>
          <span>REVIEWD BY:</span>
          <div className={styles.reviewedRight}>
            <span className={`${styles.line} ${styles.lineXl}`} />
            <p className={styles.sigLabelRight}>Head, Blood Transfusion Service</p>
          </div>
        </div>

        {/* IMPORTANT */}
        <div className={styles.gapTall} />
        <p className={styles.important}>
          IMPORTANT: To be accomplished in DUPLICATE: Please attach the ORIGINAL copy in chart
        </p>
        
      </div>

    </div>
  );
}