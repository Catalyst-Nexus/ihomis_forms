import { useMemo } from "react";
import "./PostAnesthesiaNursesNotes.css";

const U = ({ size = "md" }) => (
  <span className={`pacu-u pacu-u-${size}`} />
);

export default function PostAnesthesiaNursesNotes({ patientName, patientData }) {
  const hospitalNumber = patientData?.hospitalNumber || "000000000021386";
  const caseNumber     = patientData?.caseNumber     || "ADM-2026-010707";
  const name           = patientName                 || "SALUCANA , NELLY JEAN LOFRANCO";
  const sex            = patientData?.sex            || "F";
  const age            = patientData?.age            || "32";

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
    <div className="pacu-page">

      {/* ── Header ── */}
      <div className="pacu-header">
        <div className="pacu-header-row">
          <span><strong>Hospital No.:</strong> {hospitalNumber}</span>
          <span><strong>Case Number:</strong> {caseNumber}</span>
        </div>
        <div className="pacu-header-row">
          <span><strong>Patient Name:</strong> {name}</span>
          <span><strong>Sex:</strong> {sex}</span>
          <span><strong>Age:</strong> {age}</span>
        </div>
      </div>

      {/* ── Main Table ── */}
      <table className="pacu-table">
        <thead>
          <tr>
            <th className="pacu-col-datetime">Date/<br />Time</th>
            <th className="pacu-col-focus">Focus/Problems</th>
            <th className="pacu-col-data">Data</th>
            <th className="pacu-col-action">Action</th>
            <th className="pacu-col-response">Response</th>
          </tr>
        </thead>
        <tbody>
          <tr className="pacu-content-row">

            {/* Date/Time */}
            <td className="pacu-cell-datetime"></td>

            {/* Focus/Problems */}
            <td className="pacu-cell pacu-cell-focus">
              <div className="pacu-subsection-title">Actual:</div>

              <div className="pacu-subsection-title pacu-mt">Airway and Breathing:</div>
              <div>( ) Ineffective Airway Clearance</div>
              <div>( ) Impaired Gas Exchange</div>

              <div className="pacu-subsection-title pacu-mt">Circulation:</div>
              <div>( ) Altered Cardiac Output:</div>
              <div className="pacu-indent">( ) Increased</div>
              <div className="pacu-indent">( ) Decreased</div>
              <div>( ) Hypertension</div>
              <div>( ) Hypotension</div>
              <div>( ) Bleeding</div>

              <div className="pacu-subsection-title pacu-mt">Other actual problems:</div>
              <div>( ) Altered Body Temperature</div>
              <div className="pacu-indent">( ) Hypothermia</div>
              <div className="pacu-indent">( ) Hyperthermia</div>
              <div>( ) Fluid Volume Deficit</div>
              <div>( ) Fluid Volume Excess</div>
              <div>( ) Urinary Retention</div>
              <div>( ) Hyperglycemia</div>
              <div>( ) Hypoglycemia</div>
              <div>( ) Seizure</div>
              <div>( ) Alteration in Comfort Pain</div>
              <div>( ) Acute Confusion</div>
              <div>( ) Anxiety</div>

              <div className="pacu-subsection-title pacu-mt">Potential:</div>
              <div>( ) Risk for Bleeding</div>
              <div>( ) Risk for Fall</div>

              <div className="pacu-subsection-title pacu-mt">Others:</div>
              <div><U size="lg" /></div>
              <div><U size="lg" /></div>
              <div><U size="lg" /></div>
              <div><U size="lg" /></div>
              <div><U size="lg" /></div>
            </td>

            {/* Data */}
            <td className="pacu-cell pacu-cell-data">
              <div className="pacu-subsection-title">Objective:</div>
              <div className="pacu-subsection-title">Vital Signs:</div>
              <div>BP:<U /> CR:<U /></div>
              <div>RR:<U /> Temp:<U /></div>
              <div>O2 Sat:<U /></div>
              <div className="pacu-mt">GCS:<U /></div>

              <div className="pacu-subsection-title pacu-mt">Airway and Breathing:</div>
              <div>( ) Presence of OETTT/NET/ Tracheostomy</div>
              <div>( ) Retained Oral/Tube Secretions</div>
              <div>( ) <U size="sm" /> Breath Sounds</div>
              <div>( ) Cyanosis</div>
              <div>( ) Shallow/Labored Breathing</div>
              <div>( ) Slow Capillary Refill <U size="sm" /> sec.</div>

              <div className="pacu-subsection-title pacu-mt">Circulation:</div>
              <div>( ) Vaginal Bleeding:</div>
              <div className="pacu-indent">( ) Mild</div>
              <div className="pacu-indent">( ) Moderate</div>
              <div className="pacu-indent">( ) Severe</div>
              <div>( ) Post-op Site Bleeding</div>

              <div className="pacu-subsection-title pacu-mt">Other data:</div>
              <div>( ) Shivering</div>
              <div>( ) Flushing</div>
              <div>( ) Pallor</div>
              <div>( ) Cool/Warm Skin To Skin</div>
              <div>( ) Decreased Urine Output: <U size="sm" /> cc/hr</div>
              <div>( ) Dry Mucous Membrane</div>
              <div>( ) Sunken Eyeballs</div>
              <div>( ) Distended Bladder</div>
              <div>( ) Increased/Decreased HGT: <U size="sm" /> mg/dl</div>
              <div>( ) Grimaced Face</div>
              <div>( ) Expressive Behavior: Crying/Moaning/ Irritability/Restlessnes</div>

              <div className="pacu-subsection-title pacu-mt">Subjective:</div>
              <div>Pain Scale: <U size="sm" /> /10</div>
              <div>VAS: <U /></div>
              <div>Verbalization: <U /></div>
            </td>

            {/* Action */}
            <td className="pacu-cell pacu-cell-action">
              <div className="pacu-subsection-title">Airway and Breathing:</div>
              <div>( ) O2 @ <U size="sm" /> LPM started per <U /></div>
              <div>( ) Hooked to pulse oximeter/ cardiac monitor</div>
              <div>( ) VS checked and recorded</div>
              <div>( ) Suctioned secretions PRN</div>
              <div>( ) Placed on MHBR</div>

              <div className="pacu-subsection-title pacu-mt">Circulation:</div>
              <div>( ) Ice pack placed on hypogastric area</div>
              <div>( ) Uterine massage done</div>
              <div>( ) Changed/Reinforced dressing</div>
              <div>( ) IVF regulated @ <U size="sm" /> cc/hr</div>

              <div className="pacu-subsection-title pacu-mt">Other interventions:</div>
              <div>( ) Kept warm and thermoregulated</div>
              <div className="pacu-indent">( ) Provided thermal blanket</div>
              <div className="pacu-indent">( ) Provided droplight</div>
              <div>( ) TSB done</div>
              <div>( ) I &amp; O monitored and recorded</div>
              <div>( ) Foley/Straight catheterization done as ordered</div>
              <div>( ) Applied hot/cold compress</div>
              <div className="pacu-mt">( ) Available meds given as ordered:</div>
              <div className="pacu-indent">( ) Antibiotics</div>
              <div className="pacu-indent">( ) Pain med/s</div>
              <div className="pacu-indent">( ) PRN med/s</div>
              <div><U size="lg" /></div>
              <div><U size="lg" /></div>
              <div><U size="lg" /></div>
              <div className="pacu-mt">( ) Raised side rails</div>
              <div>( ) Comfort measures rendered:</div>
              <div className="pacu-indent">( ) Quiet environment</div>
              <div className="pacu-indent">( ) Adequate ventilation</div>
              <div className="pacu-mt">( ) Referred to Dr/s: <U size="sm" /></div>
              <div><U size="lg" /></div>
              <div className="pacu-subsection-title pacu-mt">Others:</div>
              <div><U size="lg" /></div>
              <div><U size="lg" /></div>
            </td>
            {/* Response */}
            <td className="pacu-cell-response"></td>
          </tr>
        </tbody>
      </table>
      <br />
      <br />
      <br />

      {/* ── Nurse Signature ── */}
      <div className="pacu-nurse-sig">
        <div className="pacu-nurse-sig-line" />
        <div className="pacu-nurse-sig-text">NURSE ON DUTY NAME AND SIGNATURE</div>
      </div>

      {/* ── Footer ── */}
      <div className="pacu-footer">
        Generated by: TCP T. TCP on {generatedOn}
      </div>

    </div>
  );
}