import "./BloodRequestPediatric.css";

export default function BloodRequestPediatric() {
  return (
    <div className="brp-wrap">

      {/* ═══════════════ PAGE 1 ═══════════════ */}
      <div className="brp-page">
        <div className="brp-header-spacer" />
        <div className="brp-header">
          <p className="brp-title-main">BLOOD REQUEST FORM</p>
          <p className="brp-title-sub">(PEDIATRIC)</p>
        </div>

        {/* META */}
        <div className="brp-meta-section">
          <div className="brp-meta-row">
            <span className="brp-label">Hospital No.:</span>
            <span>00000000020971</span>
          </div>
          <div className="brp-meta-row">
            <span className="brp-meta-cell brp-meta-cell--wide">
              <span className="brp-label">Patient Name:</span>
              <span>MATILOS , EUGENIA MAMBA</span>
            </span>
            <span className="brp-meta-cell">
              <span className="brp-label" style={{ marginLeft: "50px" }}>Sex:</span>
              <span>F</span>
            </span>
            <span className="brp-meta-cell">
              <span className="brp-label" style={{ marginLeft: "200px" }}>Age:</span>
              <span>67 year(s)</span>
            </span>
          </div>
          <div className="brp-meta-row">
            <span className="brp-meta-cell brp-meta-cell--wide">
              <span className="brp-label">Case No.:</span>
              <span>ADM-2026-010617</span>
            </span>
            <span className="brp-meta-cell">
              <span className="brp-label" style={{ marginLeft: "68px" }}>BirthDate:</span>
              <span>January 11, 1959</span>
            </span>
            <span className="brp-meta-cell">
              <span className="brp-label" style={{ marginLeft: "60px" }}>Date:</span>
              <span>April 21, 2026</span>
            </span>
          </div>
          <div className="brp-meta-row">
            <span className="brp-meta-cell brp-meta-cell--wide">
              <span className="brp-label">Department:</span>
              <span>MEDICAL</span>
            </span>
            <span className="brp-meta-cell brp-meta-cell--rest">
              <span className="brp-label">Room No.:</span>
              <span>ISOLATION - 6SAIS - BED 03</span>
            </span>
          </div>
          <div className="brp-meta-row">
            <span className="brp-label">Address:</span>
            <span>P-1, ALIBUJID, BUENAVISTA, AGUSAN DEL NORTE</span>
          </div>
          <div className="brp-meta-row">
            <span className="brp-label">Admitting Impression/Clinical Diagnosis:</span>
            <span>CAP-MR CHF, T/C ACS HPN STAGE 2</span>
          </div>
        </div>

        {/* HISTORY */}
        <div className="brp-gap" />
        <div className="brp-inline-row">
          <span>History of Previous Transfusion:</span>
          <span className="brp-ml4">When:</span>
          <span className="brp-line brp-line--md" />
        </div>
        <div className="brp-inline-row brp-indent-where">
          <span>Where:</span>
          <span className="brp-line brp-line--md" />
        </div>

        {/* TYPE OF REQUEST */}
        <div className="brp-gap" />
        <div className="brp-inline-row">
          <span>Type of Request:</span>
          <span className="brp-ml8">[ ] ROUTINE</span>
          <span className="brp-ml8">&nbsp; [ ] STAT</span>
        </div>

        {/* COMPONENTS HEADING */}
        <div className="brp-gap" />
        <p className="brp-section-heading">Check Components Needed and Indication for Transfusion:</p>

        {/* WHOLE BLOOD */}
        <div className="brp-comp-row">
          <span className="brp-chk">[ ]</span>
          <span>
            <strong>Whole Blood::</strong>{" "}
            &nbsp;Blood Type: <span className="brp-line brp-line--sm" />{" "}
            &nbsp;Number of units needed <span className="brp-line brp-line--sm" />
          </span>
        </div>
        <div className="brp-subheading-row">
          <span>For Exchange Transfusion:</span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Hyperbilirubinemia in infants with indirect bilirubin of 20mg/dl in the first week of life.</span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Hyperbilirubinemia with prematurity and/ or other concomitant illnesses to include one or more of the following: Prenatal asphyxia, acidosis, prolonged hypoxemia, hypotermia, sepsis, and hemolysis.</span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Other:<span className="brp-line brp-line--fill" /></span>
        </div>

        {/* PACKED RBC */}
        <div className="brp-gap-sm" />
        <div className="brp-comp-row">
          <span className="brp-chk">[ ]</span>
          <span>
            <strong>PACKED RBC::</strong>{" "}
            &nbsp;Blood Type: <span className="brp-line brp-line--sm" />{" "}
            &nbsp;Number of units needed <span className="brp-line brp-line--sm" />
          </span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Hypovolemia form acute blood loss with signs of shock or anticipated blood loss of &gt;10%</span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Candidates for Major Surgery and hematocrit &lt; 30% (Neonatal &lt; 35%)</span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Hypertransfusion for chronic-hemolytic anemias; (Thalassemia)</span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Hemoglobin less than 13gm/dl (Hct.40%) in neonates less than 24 hours old, severe pulmonary disease, with assisted ventilation, cyanotic heart disease or heart failure.</span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Neonates with phlebotomy lose &gt;= 5-10% of total blood volume.</span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Hemoglobin level less than 8gm/dl or Hct less than 25% in stable newborn infants with clinical manisfestations anemia.</span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Other:<span className="brp-line brp-line--fill" /></span>
        </div>

        {/* PLATELETS CONCENTRATE */}
        <div className="brp-gap-sm" />
        <div className="brp-comp-row">
          <span className="brp-chk">[ ]</span>
          <span>
            <strong>Platelets Concentrate::</strong>{" "}
            &nbsp;Blood Type: <span className="brp-line brp-line--sm" />{" "}
            &nbsp;Number of units needed <span className="brp-line brp-line--sm" />
          </span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Active bleeding and thrombocytopenia &lt; 50,000/L or at risk for intracranial hemorrhage.</span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Active bleeding and qualilative defect</span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Prophylaxis for severe thrombocytopenia &lt; 20,000/L or associated qualilalitve defect.</span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Schedule invasive procedure and thrombocytopenia &lt; 70,000/L or associated quality defect.</span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Other:<span className="brp-line brp-line--fill" /></span>
        </div>

        {/* FRESH FROZEN PLASMA */}
        <div className="brp-gap-sm" />
        <div className="brp-comp-row">
          <span className="brp-chk">[ ]</span>
          <span>
            <strong>Fresh Frozen Plasma::</strong>{" "}
            &nbsp;Blood Type: <span className="brp-line brp-line--sm" />{" "}
            &nbsp;Number of units needed <span className="brp-line brp-line--sm" />
          </span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Significant multiple coagulation factor deficiency or acquired factor deficiency (e.g. dengue, shock syndrome)</span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Significant congenital factor deficiency</span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Anti-thrombin III deficiency.</span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Bleeding in exchange transfucion or massive transfusion (&gt; 1 Blood Volume)</span>
        </div>

        {/* CRYOPRECIPITATE */}
        <div className="brp-gap-sm" />
        <div className="brp-comp-row">
          <span className="brp-chk">[ ]</span>
          <span>
            <strong>Cryoprecipitate ::</strong>{" "}
            &nbsp;Blood Type: <span className="brp-line brp-line--sm" />{" "}
            &nbsp;Number of units needed <span className="brp-line brp-line--sm" />
          </span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Factor VIII Deficiency (Hemophilia A)</span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Von Willebrands Disease</span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Disseminated Intravascular Coagulation</span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Uremia with active bleeding or scheduled invasive procedure</span>
        </div>
        <div className="brp-item-row">
          <span className="brp-chk-indent">[ ]</span>
          <span>Other:<span className="brp-line brp-line--fill" /></span>
        </div>

        <div className="brp-footer">
          Generated by: TCP T. TCP on 2026-04-21 01:07 pm
        </div>
      </div>

      {/* ═══════════════ PAGE 2 ═══════════════ */}
      <div className="brp-page brp-page--p2">

        {/* REQUESTED BY */}
        <div className="brp-plain-label">Requested by:</div>

        {/* SIGNATURES */}
        <div className="brp-sig-row">
          <div className="brp-sig-block">
            <div className="brp-sig-line-with-md">
              <span className="brp-sig-md" style={{ marginLeft: "300px" }}>M. D.</span>
            </div>
            <p className="brp-sig-label">Signature over Printed Name of Physician</p>
          </div>
          <div className="brp-sig-block">
            <div className="brp-sig-line-empty" />
            <p className="brp-sig-label">Signature over Printed Name of Nurse on Duty</p>
          </div>
        </div>

        {/* REMARKS */}
        <div className="brp-gap-sm" />
        <div className="brp-remarks-row">
          <span>Remarks:</span>
          <span className="brp-line brp-line--full" />
        </div>

        {/* RECEIVED BY */}
        <div className="brp-gap" />
        <div className="brp-plain-label">Received by:</div>
        <div className="brp-gap brp-gap--tall" />
        <div className="brp-sig-row">
          <div className="brp-sig-block">
            <div className="brp-sig-line-empty" />
            <p className="brp-sig-label">(Blood Bank Staff)</p>
          </div>
          <div className="brp-sig-block">
            <div className="brp-sig-line-empty" />
            <p className="brp-sig-label">Date/Time</p>
          </div>
        </div>

        <div className="brp-footer">
          Generated by: TCP T. TCP on 2026-04-21 01:07 pm
        </div>
      </div>

    </div>
  );
}