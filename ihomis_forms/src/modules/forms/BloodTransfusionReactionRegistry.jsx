import "./BloodTransfusionReactionRegistry.css";

const formatGeneratedOn = (date = new Date()) => {
  const pad = (value) => String(value).padStart(2, "0");
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  const hour12 = String(hours % 12 || 12).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${hour12}:${pad(minutes)} ${ampm}`;
};

export default function BloodTransfusionReactionRegistry({ patientName, patientData = {} }) {
  const caseNum = patientData.caseNum || patientData.caseNo || "";
  const hospitalNo =
    patientData.hospitalNo || patientData.hospNo || patientData.hospitalNumber || "";
  const age = patientData.age || "";
  const birthDate =
    patientData.birthDate || patientData.birthdate || patientData.dob || "";
  const name = patientName || patientData.patientName || patientData.fullName || "";
  const sex = patientData.sex || "";
  const generatedOn = patientData.generatedOn || formatGeneratedOn();

  return (
    <div className="btrr-wrap">

      {/* ═══════════════ PAGE 1 ═══════════════ */}
      <div className="btrr-page">
        <div className="btrr-header-spacer" />
       <br></br>

        {/* META TOP */}
        <div className="btrr-meta-section">
          <div className="btrr-meta-row">
            <span className="btrr-label">Case Number:</span>
            <span>{caseNum}</span>
          </div>

          <div className="btrr-meta-row btrr-meta-row--4col">
            <div className="btrr-meta-cell">
              <span className="btrr-label">Hospital No.:</span>
              <span>{hospitalNo}</span>
            </div>
            <div className="btrr-meta-cell">
              <span className="btrr-label">Age:</span>
              <span>{age}</span>
            </div>
            <div className="btrr-meta-cell btrr-meta-cell--dob">
              <span className="btrr-label">Date of Birth:</span>
              <span>{birthDate}</span>
            </div>
          </div>

          <div className="btrr-meta-row btrr-meta-row--name">
            <div className="btrr-meta-cell btrr-meta-cell--name">
              <span className="btrr-label">Name:</span>
              <span>{name}</span>
            </div>
            <div className="btrr-meta-cell">
              <span className="btrr-label">Sex:</span>
              <span>{sex}</span>
            </div>
            <div className="btrr-meta-cell btrr-meta-cell--requesting">
              <span className="btrr-label">Requesting</span><br />
              <span className="btrr-label">Physician:</span>
              <span className="btrr-line btrr-line--sm" />
            </div>
          </div>
        </div>

        {/* TRANSFUSION DATES */}
        <div className="btrr-gap-sm" />
        <div className="btrr-field-row">
          <span>Transfusion began date:</span>
          <span className="btrr-line btrr-line--md" />
          <span className="btrr-spacer" />
          <span>Time:</span>
          <span className="btrr-line btrr-line--sm" />
        </div>
        <div className="btrr-field-row">
          <span>Transfusion ended date:</span>
          <span className="btrr-line btrr-line--md" />
          <span className="btrr-spacer" />
          <span>Time:</span>
          <span className="btrr-line btrr-line--sm" />
        </div>
        <div className="btrr-field-row">
          <span>Date of BTR:</span>
          <span className="btrr-line btrr-line--md" />
          <span className="btrr-spacer" />
          <span>Time:</span>
          <span className="btrr-line btrr-line--sm" />
        </div>

        {/* VITALS TABLE */}
        <div className="btrr-gap" />
        <table className="btrr-table btrr-vitals-table">
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
        <div className="btrr-gap" />
        <div className="btrr-symptoms-section">
          <p className="btrr-section-label">Symptoms:</p>
          <div className="btrr-symptoms-grid">
            <span>[ ] Hives</span>
            <span>[ ] Pain (Location)</span>
            <span>[ ] Itchiness</span>
            <span>[ ] Nausea</span>
            <span>[ ] Chills</span>
            <span>[ ] Rash</span>
            <span>[ ] Fever</span>
            <span>[ ] Hematuria</span>
            <span className="btrr-others-row">
              [ ]Others:
              <span className="btrr-line btrr-line--fill" />
            </span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="btrr-gap" />
        <div className="btrr-field-row">
          <span>Action:Anti-Histamine given:</span>
          <span className="btrr-line btrr-line--lg" />
          <span className="btrr-spacer" />
          <span>Medicine given:</span>
          <span className="btrr-line btrr-line--lg" />
        </div>
        <div className="btrr-field-row">
          <span>Volume received by patient:</span>
          <span className="btrr-line btrr-line--lg" />
          <span className="btrr-spacer" />
          <span>Response to Medicine:</span>
          <span className="btrr-line btrr-line--lg" />
        </div>
        <div className="btrr-field-row">
          <span>Nurse on-duty:</span>
          <span className="btrr-line btrr-line--lg" />
        </div>

        {/* DIVIDER */}
        <div className="btrr-gap" />
        <div className="btrr-divider" />
        <div className="btrr-gap-sm" />

        {/* BLOOD BANK USE */}
        <p className="btrr-section-bold">BLOOD BANK USE</p>
        <div className="btrr-field-row">
          <span>Blood Bank notified: Date &amp; Time:</span>
          <span className="btrr-line btrr-line--lg" />
          <span className="btrr-spacer" />
          <span>BTR form received: Date &amp; Time:</span>
          <span className="btrr-line btrr-line--lg" />
        </div>

        {/* BLOOD UNITS TABLE */}
        <div className="btrr-gap-sm" />
        <table className="btrr-table btrr-units-table">
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
        <div className="btrr-gap-sm" />
        <p className="btrr-plain">Complete steps 1-3 on all reported reactions:</p>
        <div className="btrr-gap-sm" />
        <p className="btrr-plain">
          1. Clerical check: Check patient and donor ID on all labels and records (include all blood
          components transfused in the last 24 hours)
        </p>
        <div className="btrr-gap-sm" />
        <div className="btrr-clerical-row">
          <span>[ ] No clerical error detected</span>
          <span>[ ] Clerical error detected</span>
        </div>
        <div className="btrr-field-row btrr-field-row--mt">
          <span>Explanation:</span>
          <span className="btrr-line btrr-line--xl" />
        </div>
        <div className="btrr-gap-sm" />
        <p className="btrr-plain">2. Check for patient sample</p>
        <div className="btrr-field-row">
          <span>2.1 Check for visible hemolysis:</span>
          <span className="btrr-line btrr-line--md" />
        </div>
        <div className="btrr-field-row">
          <span>2.2 Check for visible hemolysis:</span>
          <span className="btrr-line btrr-line--md" />
        </div>
        <p className="btrr-plain">2.3 Collect blood sample. Test for the following:</p>

        <div className="btrr-footer">
          Generated by: TCP T. TCP on {generatedOn}
        </div>
      </div>

      {/* ═══════════════ PAGE 2 ═══════════════ */}
      <div className="btrr-page">
        <div className="btrr-header-spacer" />

        {/* BILIRUBIN TEST */}
        <div className="btrr-field-row">
          <span className="btrr-label">Bilirubin Test:</span>
          <span>&nbsp; Result</span>
        </div>
        <div className="btrr-gap-sm" />
        <table className="btrr-table btrr-bilirubin-table">
          <tbody>
            <tr>
              <td className="btrr-row-label">Total Bilirubin:</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td className="btrr-row-label">B1(conjugated)</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td className="btrr-row-label">B2(unconjugated)</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        {/* URINE */}
        <div className="btrr-gap-sm" />
        <p className="btrr-plain">
          2.4 Collect 1st hour and 5th hour urine. Test for the following:
        </p>
        <div className="btrr-gap-sm" />
        <table className="btrr-table btrr-urine-table">
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
        <div className="btrr-gap-sm" />
        <p className="btrr-plain">
          Note: Attached copy of laboratory test results. Save patient blood and urine sample
          for pathologist verification.
        </p>

        {/* DAT */}
        <div className="btrr-gap-sm" />
        <p className="btrr-plain">3. DIRECT ANTIGLOUBIN TEST: (Recepient)</p>
        <div className="btrr-field-row btrr-field-row--mt">
          <span>Post Transfusion:</span>
          <span className="btrr-line btrr-line--sm" />
          <span className="btrr-spacer" />
          <span>If positive, Pre Transfusion:</span>
          <span className="btrr-line btrr-line--sm" />
        </div>

        {/* MED TECH */}
        <div className="btrr-gap-sm" />
        <div className="btrr-medtech-row">
          <span className="btrr-label btrr-medtech-label">MEDICAL TECHNOLOGIST:</span>
          <span className="btrr-line btrr-line--lg" />
          <span className="btrr-spacer" />
          <span className="btrr-label">DATE:</span>
          <span className="btrr-line btrr-line--lg" />
        </div>

        {/* PATHOLOGIST */}
        <div className="btrr-gap-sm" />
        <p className="btrr-plain">4. Refer to Pathologist on duty (Recepient)</p>
        <div className="btrr-centered-fields">
          <div className="btrr-centered-field">
            <span>Name of Pathologist:</span>
            <span className="btrr-line btrr-line--md" />
          </div>
          <div className="btrr-centered-field">
            <span>Findings:</span>
            <span className="btrr-line btrr-line--md" />
          </div>
          <div className="btrr-centered-field">
            <span>Recommendation:</span>
            <span className="btrr-line btrr-line--md" />
          </div>
        </div>

        {/* HEMOLYTIC NOTE */}
        <div className="btrr-gap-sm" />
        <p className="btrr-plain btrr-italic-note">
          If the above does not indicate a hemolytic reaction, further testing not required. If there is evidence of hemolysis of patient's
          condition indicates a hemolytic reaction continue with the following:
        </p>

        {/* REPEAT TESTING TABLE */}
        <div className="btrr-gap-sm" />
        <p className="btrr-plain">4. Repeat Testing</p>
        <div className="btrr-gap-sm" />
        <table className="btrr-table btrr-repeat-table">
          <thead>
            <tr>
              <th rowSpan={2}></th>
              <th colSpan={3} className="btrr-group-header">CELLS</th>
              <th colSpan={2} className="btrr-group-header">SERUM</th>
              <th colSpan={3} className="btrr-group-header">INTERPRETATION</th>
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
        <div className="btrr-gap-sm" />
        <p className="btrr-plain">5. Repeat Compatibility Testing</p>
        <div className="btrr-gap-sm" />
        <table className="btrr-table btrr-compat-table">
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
        <div className="btrr-gap-sm" />
        <p className="btrr-plain">
          Crossmatches should be repeated on all units transfused within 24 hours prior to reaction. Record on daily logbook.
        </p>
        <div className="btrr-gap-sm" />
        <p className="btrr-plain">
          All units on hold for future transfusion MUST be crossmatched with patient's post reaction specimen.
        </p>
        <div className="btrr-gap-sm" />
        <p className="btrr-plain">6. Other laboratory test performed:(Only if there is a 2C temperature rise)</p>
        <div className="btrr-gap-sm" />
        <p className="btrr-plain">a. Bacteriology Specimen: Blood segment/ Bag for:</p>
        <div className="btrr-centered-fields btrr-centered-fields--narrow">
          <div className="btrr-centered-field">
            <span>Gram's Stain</span>
            <span className="btrr-line btrr-line--lg" />
          </div>
          <div className="btrr-centered-field">
            <span>Culture</span>
            <span className="btrr-line btrr-line--lg" />
          </div>
        </div>
        <div className="btrr-gap-sm" />
        <div className="btrr-field-row">
          <span>7. Additional tests:</span>
          <span className="btrr-line btrr-line--xl" />
        </div>
        <div className="btrr-gap-sm" />
        <p className="btrr-plain">
          If there is evidenc of hemolytic reaction, notify the Blood Bank Head (Pathologist) immediately
        </p>

        <div className="btrr-footer">
          Generated by: TCP T. TCP on {generatedOn}
        </div>
      </div>

      {/* ═══════════════ PAGE 3 ═══════════════ */}
      <div className="btrr-page btrr-page--p3">
        <div className="btrr-header-spacer" />

        {/* TECHNOLOGIST / DATE */}
        <div className="btrr-centered-fields btrr-centered-fields--right">
          <div className="btrr-centered-field">
            <span>Technologist:</span>
            <span className="btrr-line btrr-line--lg" />
          </div>
          <div className="btrr-centered-field">
            <span>Date:</span>
            <span className="btrr-line btrr-line--lg" />
          </div>
        </div>

        {/* COMMENTS */}
        <div className="btrr-gap-sm" />
        <p className="btrr-label">COMMENTS/RECOMMENDATIONS:</p>
        <div className="btrr-reviewed-row">
          <span>REVIEWD BY:</span>
          <div className="btrr-reviewed-right">
            <span className="btrr-line btrr-line--xl" />
            <p className="btrr-sig-label-right">Head, Blood Transfusion Service</p>
          </div>
        </div>

        {/* IMPORTANT */}
        <div className="btrr-gap-sm" />
        <p className="btrr-important">
          IMPORTANT: To be accomplished in DUPLICATE: Please attach the ORIGINAL copy in chart
        </p>

        <div className="btrr-footer">
          Generated by: TCP T. TCP on {generatedOn}
        </div>
      </div>

    </div>
  );
}