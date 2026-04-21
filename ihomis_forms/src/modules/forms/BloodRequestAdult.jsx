import "./BloodRequestAdult.css";

export default function BloodRequestAdult() {
  return (
    <div className="brf-wrap">

      {/* ═══════════════ PAGE 1 ═══════════════ */}
      <div className="brf-page">
        <div className="brf-header-spacer" />
        <div className="brf-header">
          <p className="brf-title-main">BLOOD REQUEST FORM</p>
          <p className="brf-title-sub">(ADULT)</p>
        </div>

        {/* META */}
        <div className="brf-meta-section">
          <div className="brf-meta-row">
            <span className="brf-label">Hospital No.:</span>
            <span>00000000020971</span>
          </div>
          <div className="brf-meta-row">
            <span className="brf-meta-cell brf-meta-cell--wide">
              <span className="brf-label">Patient Name:</span>
              <span>MATILOS , EUGENIA MAMBA</span>
            </span>
            <span className="brf-meta-cell">
              <span className="brf-label"style={{ marginLeft: "50px" }}>Sex:</span>
              <span>F</span>
            </span>
            <span className="brf-meta-cell">
              <span className="brf-label" style={{ marginLeft: "200px" }}>Age:</span>
              <span>67 year(s)</span>
            </span>
          </div>
          <div className="brf-meta-row">
            <span className="brf-meta-cell brf-meta-cell--wide">
              <span className="brf-label">Case No.:</span>
              <span>ADM-2026-010617</span>
            </span>
            <span className="brf-meta-cell">
              <span className="brf-label" style={{ marginLeft: "68px" }}>BirthDate:</span>
              <span>January 11, 1959</span>
            </span>
            <span className="brf-meta-cell">
              <span className="brf-label" style={{ marginLeft: "60px" }}>Date:</span>
              <span>April 21, 2026</span>
            </span>
          </div>
          <div className="brf-meta-row">
            <span className="brf-meta-cell brf-meta-cell--wide">
              <span className="brf-label">Department:</span>
              <span>MEDICAL</span>
            </span>
            <span className="brf-meta-cell brf-meta-cell--rest">
              <span className="brf-label">Room No.:</span>
              <span>ISOLATION - 6SAIS - BED 03</span>
            </span>
          </div>
          <div className="brf-meta-row">
            <span className="brf-label">Address:</span>
            <span>P-1, ALIBUID, BUENAVISTA, AGUSAN DEL NORTE</span>
          </div>
          <div className="brf-meta-row">
            <span className="brf-label">Admitting Impression/Clinical Diagnosis:</span>
            <span>CAP-MR CHF, T/C ACS HPN STAGE 2</span>
          </div>
        </div>

        {/* HISTORY */}
        <div className="brf-gap" />
        <div className="brf-inline-row">
          <span>History of Previous Transfusion:</span>
          <span className="brf-ml4">When:</span>
          <span className="brf-line brf-line--md" />
        </div>
        <div className="brf-inline-row brf-indent-where">
          <span>Where:</span>
          <span className="brf-line brf-line--md" />
        </div>

        {/* TYPE OF REQUEST */}
        <div className="brf-gap" />
        <div className="brf-inline-row">
          <span>Type of Request:</span>
          <span className="brf-ml8">[ ] ROUTINE</span>
          <span className="brf-ml8">[ ] STAT</span>
        </div>

        {/* COMPONENTS HEADING */}
        <div className="brf-gap" />
        <p className="brf-section-heading">Check Components Needed and Indication for Transfusion:</p>

        {/* WHOLE BLOOD */}
        <div className="brf-comp-row">
          <span className="brf-chk">[ ]</span>
          <span>
            <strong>Whole Blood(approximate volume 500ml):</strong>{" "}
            Blood Type <span className="brf-line brf-line--sm" />{" "}
            Number of units needed<span className="brf-line brf-line--sm" />.
          </span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] WB-1 :</span>
          <span>
            <strong>Active bleeding</strong> with at least one of the following:<br />
            a. Loss of over 15% blood volume.<br />
            b. Hb less than 9g/dl<br />
            c. Blood pressure decrease over 20 &amp;, or less than 90mm Hg. Systolic
          </span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] WB-2 :</span>
          <span>
            Others. Please specify: (This code will automaticall trigger a review of your indication){" "}
            <span className="brf-line brf-line--fill" />
          </span>
        </div>

        {/* PACKED RBC */}
        <div className="brf-gap-sm" />
        <div className="brf-comp-row">
          <span className="brf-chk">[ ]</span>
          <span>
            <strong>PACKED RBC(approximate volume 250ml):</strong>{" "}
            Blood Type <span className="brf-line brf-line--sm" />{" "}
            Number of units needed<span className="brf-line brf-line--sm" />
          </span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] R-1 :</span>
          <span>Hgb less than 8 gm/dl of Hct less than 24% (if not due to treatable cause)</span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] R-2 :</span>
          <span>
            Patients receiving general anesthesia if:<br />
            a. Preoperative Hb less than 8g/dl of Hct less than 24%<br />
            b. Major blood letting operation and Hb less than 10g/dl or Hct less than 30%<br />
            c. Signs of homodynamic instability or inadequate oxygen carrying capacity(symptomatic anemia)
          </span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] R-3 :</span>
          <span>Symptomatic anemia regardless of Hb level (dyspnea, syncope, postural hypotension, tachycardia, chest-pains, TIA)</span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] R-4 :</span>
          <span>Hgb less than 8g/dl or Hct less than 24% with concomitant hemorrhage, COPD, CAD, hemoglobinopathy sepsis</span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] R-5 :</span>
          <span>
            Others. Please specify: (This code will automaticall trigger a review of your indication){" "}
            <span className="brf-line brf-line--fill" />
          </span>
        </div>

        {/* WASHED RBC */}
        <div className="brf-gap-sm" />
        <div className="brf-comp-row">
          <span className="brf-chk">[ ]</span>
          <span>
            <strong>Washed RBC(approximate volume 180ml):</strong>{" "}
            Blood Type <span className="brf-line brf-line--sm" />{" "}
            Number of units needed<span className="brf-line brf-line--sm" />.
          </span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] WP-1 :</span>
          <span>History of previous severe allergic transfusion reactions or anaplylactoid reactions in immunocompromised patients</span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] WP-2 :</span>
          <span>Transfusion of group "O" blood during emergencies when the specific blood is not immediately available</span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] WP-3 :</span>
          <span>Paroxysmal nocturnal hemoglobinuria</span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] WP-4 :</span>
          <span>
            Others. Please specify: (This code will automaticall trigger a review of your indication){" "}
            <span className="brf-line brf-line--fill" />
          </span>
        </div>

        {/* NOTE RBC */}
        <div className="brf-note-block">
          <p className="brf-note-title">NOTE : Comments on RBC products:</p>
          <p className="brf-note-item">1. Document pre and post-transfusion Hb&amp; Hct withing 24 hours</p>
          <p className="brf-note-item">2. Dose; Adults- give on a unit-to-unit basis</p>
          <p className="brf-note-item">Remember, 1 unit may suffice to alleviate symptoms of anemia</p>
          <p className="brf-note-item">Infants: 10ml/kg. BW</p>
        </div>

        <div className="brf-footer">
          Generated by: TCP T. TCP on 2026-04-21 12:16 pm
        </div>
      </div>

      {/* ═══════════════ PAGE 2 ═══════════════ */}
      <div className="brf-page brf-page--p2">

        {/* PLATELETS */}
        <div className="brf-comp-row">
          <span className="brf-chk">[ ]</span>
          <span>
            <strong>Platelets(approximate volume 50ml):</strong>{" "}
            Blood Type <span className="brf-line brf-line--sm" />{" "}
            Number of units needed<span className="brf-line brf-line--sm" />
          </span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] P-1 :</span>
          <span>Prophylactic administration with count &lt;=10,000 and not due to TTP, ITP, HUS</span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] P-2 :</span>
          <span>Active bleeding with count [50,000</span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] P-3 :</span>
          <span>Platelet count [50,000 and patient to undergo invasive procedure within 8 hours]</span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] P-4 :</span>
          <span>Platelet count [100,000 if surgery is on critical area (e.g. eye, brain, etc)]</span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] P-5 :</span>
          <span>Massive transfusion with diffuse microvascular bleeding and no time to obtain platelet count</span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] P-6 :</span>
          <span>
            Others. Please specify: (This code will automaticall trigger a review of your indication){" "}
            <span className="brf-line brf-line--fill" />
          </span>
        </div>
        <div className="brf-note-block">
          <p className="brf-note-title">NOTE :</p>
          <p className="brf-note-item">Document platelet count before (within 8 hours) and after (within 1 hour) transfusion</p>
          <p className="brf-note-item">Dose: 1 unit/10kg. BW with maximum of 5 units</p>
        </div>

        {/* CRYOPRECIPITATE */}
        <div className="brf-gap-sm" />
        <div className="brf-comp-row">
          <span className="brf-chk">[ ]</span>
          <span>
            <strong>Cryoprecipitate(approximate volume 20ml):</strong>{" "}
            Blood Type <span className="brf-line brf-line--sm" />{" "}
            Number of units needed<span className="brf-line brf-line--sm" />.
          </span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] C-1 :</span>
          <span>Signicant hypofibrinogemi (&lt; 100 mg/dl)</span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] C-2 :</span>
          <span>Hemophilia A with bleeding or will undergo surgery or invasive procedure</span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] C-3 :</span>
          <span>Von Willebrand disease or uremic bleeding with prolonged bleeding time</span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] C-4 :</span>
          <span>
            Others. Please specify: (This code will automaticall trigger a review of your indication){" "}
            <span className="brf-line brf-line--fill" />
          </span>
        </div>

        {/* FRESH FROZEN PLASMA */}
        <div className="brf-gap-sm" />
        <div className="brf-comp-row">
          <span className="brf-chk">[ ]</span>
          <span>
            <strong>Fresh Frozen Plasma(approximate volume 200-250ml):</strong>{" "}
            Blood Type <span className="brf-line brf-line--sm" />{" "}
            Number of units needed<span className="brf-line brf-line--sm" />
          </span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] F-1 :</span>
          <span>PT or PTT &gt; 1.5 times mid-normal range within 8 hours of transfusion (PT &gt; 17secs. PTT &gt; 47 secs)</span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] F-2 :</span>
          <span>Specific factor deficiencies not treatable with cryoprecipitate</span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] F-3 :</span>
          <span>Reversal of coumadin anticoagulation in patients who are bleeding and not treatable with vitamin K</span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] F-4 :</span>
          <span>Treatment of TTP</span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] F-5 :</span>
          <span>
            Clinical coagulopathy associated with<br />
            a. Massive transfusion (u 20 units of blood in 24 hours)<br />
            b. Late pregnancy termination or abruption placentae
          </span>
        </div>
        <div className="brf-item-row">
          <span className="brf-code">[ ] F-6 :</span>
          <span>
            Others. Please specify: (This code will automaticall trigger a review of your indication){" "}
            <span className="brf-line brf-line--fill" />
          </span>
        </div>

        {/* NOTE FFP */}
        <div className="brf-note-block">
          <p className="brf-note-title">NOTE :</p>
          <p className="brf-note-item">1. Document PT/PTT pre and post-transfusion within 4 hours.</p>
          <p className="brf-note-item">2. Dose: initial loading dose of 15 ml/kg. BW Correction of significant coagulopathy requires &gt;=2 units FFP</p>
        </div>

        {/* REQUESTED BY */}
        <div className="brf-gap" />
        <p className="brf-plain-label">Requested by:</p>

        {/* SIGNATURES */}
        <div className="brf-sig-row">
          <div className="brf-sig-block">
           <div className="olr-sig-row">
						<span className="olr-md">M.D.</span>
					</div>
            <p className="brf-sig-label">Signature over Printed Name of Physician</p>
          </div>
          <div className="brf-sig-block">
            <p className="brf-sig-label">Signature over Printed Name of Nurse on Duty</p>
          </div>
        </div>

        {/* REMARKS */}
        <div className="brf-gap-sm" />
        <div className="brf-remarks-row">
          <span>Remarks:</span>
          <span className="brf-line brf-line--full" />
        </div>

        {/* RECEIVED BY */}
        <div className="brf-gap brf-gap--tall" />
        <p className="brf-plain-label">Received by:</p>
        <div className="brf-gap brf-gap--tall" />
        <div className="brf-sig-row">
          <div className="brf-sig-block">
            <p className="brf-sig-label">(Blood Bank Staff)</p>
          </div>
          <div className="brf-sig-block">
            <p className="brf-sig-label">Date/Time</p>
          </div>
        </div>
    
              <br>
              </br>
               <br>
              </br>
               <br>
              </br>
               <br>
              </br>
              
        <div className="brf-footer">
          Generated by: TCP T. TCP on 2026-04-21 12:16 pm
        </div>
      </div>

    </div>
  );
}