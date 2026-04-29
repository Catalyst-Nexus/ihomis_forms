import PropTypes from "prop-types";
import { useMemo } from "react";
import './CardioPulmonaryClearance.css';

const formatGeneratedOn = (date = new Date()) => {
  const pad = (value) => String(value).padStart(2, "0");
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  const hour12 = String(hours % 12 || 12).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${hour12}:${pad(minutes)} ${ampm}`;
};

export default function CardioPulmonaryClearance({ patientData = {} }) {
  const caseNumber        = patientData?.caseNumber        || "";
  const from_             = patientData?.from              || "MEDICAL";
  const department        = patientData?.department        || "";
  const date              = patientData?.date              || "";
  const hospitalNo        = patientData?.hospitalNo        || "";
  const patientName       = patientData?.patientName       || "";
  const sex               = patientData?.sex               || "";
  const age               = patientData?.age               || "";
  const surgeryContemplated   = patientData?.surgeryContemplated   || "";
  const anesthesiaContemplated = patientData?.anesthesiaContemplated || "";
  const generatedBy       = patientData?.generatedBy       || "TCP T. TCP";
  const generatedOn       = useMemo(
    () => patientData?.generatedOn || formatGeneratedOn(),
    [patientData?.generatedOn]
  );

  return (
    <div className="cardio-clearance-page">
      <div className="cardio-clearance-main">
        <div className="cardio-header-spacer" aria-hidden="true" />

        <br />
        <div className="cardio-top-row">
          <span className="cardio-label">Case Number:</span>
          <span>{caseNumber}</span>
        </div>

        <div className="cardio-top-row">
          <span className="cardio-label">From:</span>
          <span>{from_}</span>
          <span className="cardio-label">Department:</span>
          <span>{department || <span className="cardio-short-line" aria-hidden="true" />}</span>
          <span className="cardio-label cardio-date-label">Date:</span>
          <span>{date}</span>
        </div>

        <div className="cardio-top-row">
          <span className="cardio-label">Hospital No.:</span>
          <span>{hospitalNo}</span>
        </div>

        <div className="cardio-top-row">
          <span className="cardio-label">Patient Name:</span>
          <span className="cardio-name-value">{patientName}</span>
          <span className="cardio-label">Sex:</span>
          <span>{sex}</span>
          <span className="cardio-label">Age:</span>
          <span>{age ? `${age} year(s)` : ""}</span>
        </div>

        <div className="cardio-top-row">
          <span className="cardio-label">Surgery Contemplated:</span>
          <span>{surgeryContemplated || <span className="cardio-long-line" aria-hidden="true" />}</span>
        </div>

        <div className="cardio-top-row cardio-top-row-last">
          <span className="cardio-label">Anesthesia Contemplated:</span>
          <span>{anesthesiaContemplated || <span className="cardio-long-line" aria-hidden="true" />}</span>
        </div>

        <div className="cardio-section-title">REVIEW OF SYSTEMS:</div>

        <div className="cardio-subheading">Cardiovascular</div>
        <div className="cardio-check-row"><span>Hypertension/Hypotension</span><span>[ ] Yes</span><span>[ ] No</span></div>
        <div className="cardio-check-row"><span>Chest Pain</span><span>[ ] Yes</span><span>[ ] No</span></div>
        <div className="cardio-check-row"><span>Exertional Dyspnea</span><span>[ ] Yes</span><span>[ ] No</span></div>
        <div className="cardio-check-row"><span>Orthopnea</span><span>[ ] Yes</span><span>[ ] No</span></div>
        <div className="cardio-check-row"><span>Paroxysmal Nocturnal Dyspnea</span><span>[ ] Yes</span><span>[ ] No</span></div>
        <div className="cardio-check-row"><span>Ankle Swelling</span><span>[ ] Yes</span><span>[ ] No</span></div>

        <div className="cardio-line-row">
          <span>Other:</span>
          <span className="cardio-line" aria-hidden="true" />
          <span className="cardio-line" aria-hidden="true" />
          <span className="cardio-line" aria-hidden="true" />
        </div>

        <div className="cardio-line-row cardio-line-row-tight">
          <span>Medications Taken:</span>
          <span className="cardio-line" aria-hidden="true" />
          <span className="cardio-line" aria-hidden="true" />
          <span className="cardio-line" aria-hidden="true" />
        </div>

        <div className="cardio-subheading cardio-subheading-gap">Chest &amp; Lungs</div>
        <div className="cardio-check-row"><span>Cough</span><span>[ ] Yes</span><span>[ ] No___</span></div>
        <div className="cardio-check-row"><span>Fever</span><span>[ ] Yes</span><span>[ ] No___</span></div>
        <div className="cardio-check-row"><span>(+) Hx of PTB</span><span>[ ] Yes</span><span>[ ] No___</span></div>
        <div className="cardio-check-row"><span>Treated?</span><span>[ ] Yes</span><span>[ ] No___</span></div>
        <div className="cardio-check-row"><span>Asthma</span><span>[ ] Yes</span><span>[ ] No___</span></div>
        <div className="cardio-check-row"><span>Smoker</span><span>[ ] Yes</span><span>[ ] No&nbsp;&nbsp;Pack-years:___</span></div>

        <div className="cardio-line-row cardio-line-row-double">
          <span>Last sick smoke when?</span>
          <span className="cardio-line" aria-hidden="true" />
          <span className="cardio-line" aria-hidden="true" />
          <span className="cardio-line" aria-hidden="true" />
        </div>

        <div className="cardio-subheading cardio-subheading-gap">Other Problems:</div>
        <div className="cardio-check-row"><span>Diabetes</span><span>[ ] Yes</span><span>[ ] No___</span></div>

        <div className="cardio-two-line-row">
          <span>How long?</span>
          <span className="cardio-line" aria-hidden="true" />
          <span>Medications:</span>
          <span className="cardio-line" aria-hidden="true" />
        </div>

        <div className="cardio-check-row"><span>Renal failure</span><span>[ ] Yes</span><span>[ ] No___</span></div>
        <div className="cardio-check-row"><span>on Dialysis:</span><span>[ ] Yes</span><span>[ ] No___</span></div>
        <div className="cardio-check-row"><span>Anemia</span><span>[ ] Yes</span><span>[ ] No___</span></div>
        <div className="cardio-check-row"><span>Bleeding Tendencies</span><span>[ ] Yes</span><span>[ ] No___</span></div>
        <div className="cardio-check-row"><span>Stroke</span><span>[ ] Yes</span><span>[ ] No___</span></div>
        <div className="cardio-check-row"><span>Allergies</span><span>[ ] Yes</span><span>[ ] No___</span></div>

        <div className="cardio-section-title cardio-section-gap">PHYSICAL EXAMINATION</div>
        <div className="cardio-three-line-row">
          <span>General Survey:</span>
          <span className="cardio-line" aria-hidden="true" />
          <span className="cardio-line" aria-hidden="true" />
          <span className="cardio-line" aria-hidden="true" />
        </div>

        <div className="cardio-vitals-row">
          <span>Vital Signs: BP:</span>
          <span className="cardio-line" aria-hidden="true" />
          <span>CHR:</span>
          <span className="cardio-line" aria-hidden="true" />
          <span>RR:</span>
          <span className="cardio-line" aria-hidden="true" />
          <span>TEMP:</span>
          <span className="cardio-line" aria-hidden="true" />
        </div>

        <div className="cardio-three-line-row"><span>SHEENT:</span><span className="cardio-line" aria-hidden="true" /><span className="cardio-line" aria-hidden="true" /><span className="cardio-line" aria-hidden="true" /></div>
        <div className="cardio-three-line-row"><span>CVS:</span><span className="cardio-line" aria-hidden="true" /><span className="cardio-line" aria-hidden="true" /><span className="cardio-line" aria-hidden="true" /></div>
        <div className="cardio-three-line-row"><span>Chest/Lungs:</span><span className="cardio-line" aria-hidden="true" /><span className="cardio-line" aria-hidden="true" /><span className="cardio-line" aria-hidden="true" /></div>
        <div className="cardio-three-line-row"><span>Abdomen:</span><span className="cardio-line" aria-hidden="true" /><span className="cardio-line" aria-hidden="true" /><span className="cardio-line" aria-hidden="true" /></div>
        <div className="cardio-three-line-row"><span>Extremities:</span><span className="cardio-line" aria-hidden="true" /><span className="cardio-line" aria-hidden="true" /><span className="cardio-line" aria-hidden="true" /></div>

        <div className="cardio-section-title cardio-section-gap">LABORATORY DATA</div>
        <div className="cardio-three-line-row"><span>Chest Xray:</span><span className="cardio-line" aria-hidden="true" /><span className="cardio-line" aria-hidden="true" /><span className="cardio-line" aria-hidden="true" /></div>
        <div className="cardio-three-line-row"><span>ECG:</span><span className="cardio-line" aria-hidden="true" /><span className="cardio-line" aria-hidden="true" /><span className="cardio-line" aria-hidden="true" /></div>
        <div className="cardio-three-line-row"><span>CBC:</span><span className="cardio-line" aria-hidden="true" /><span className="cardio-line" aria-hidden="true" /><span className="cardio-line" aria-hidden="true" /></div>

        <div className="cardio-two-line-row">
          <span>Urinalysis:</span>
          <span className="cardio-line" aria-hidden="true" />
          <span>ABG:</span>
          <span className="cardio-line" aria-hidden="true" />
        </div>

        <div className="cardio-two-line-row">
          <span>RBS/FBS:</span>
          <span className="cardio-line" aria-hidden="true" />
          <span>S. Electrolytes:</span>
          <span className="cardio-line" aria-hidden="true" />
        </div>

        <div className="cardio-lab-triple-row">
          <span>APTT:</span>
          <span className="cardio-line" aria-hidden="true" />
          <span>PTw/INR:</span>
          <span className="cardio-line" aria-hidden="true" />
          <span>CTBT:</span>
          <span className="cardio-line" aria-hidden="true" />
        </div>

        <div className="cardio-section-title cardio-section-gap">RECOMMENDATIONS:</div>
        <div className="cardio-recommendations-block">
          <span className="cardio-recommendations-line" aria-hidden="true" />
          <span className="cardio-recommendations-line" aria-hidden="true" />
          <span className="cardio-recommendations-line" aria-hidden="true" />
        </div>

        <div className="cardio-physician-wrap">
          <div className="cardio-physician-line" aria-hidden="true" />
          <div className="cardio-physician-label">NAME &amp; SIGNATURE OF PHYSICIAN</div>
        </div>
      </div>

      <div className="cardio-footer">Generated by: {generatedBy} on {generatedOn}</div>
    </div>
  );
}

CardioPulmonaryClearance.propTypes = {
  patientData: PropTypes.shape({
    caseNumber:              PropTypes.string,
    from:                    PropTypes.string,
    department:              PropTypes.string,
    date:                    PropTypes.string,
    hospitalNo:              PropTypes.string,
    patientName:             PropTypes.string,
    sex:                     PropTypes.string,
    age:                     PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    surgeryContemplated:     PropTypes.string,
    anesthesiaContemplated:  PropTypes.string,
    generatedOn:             PropTypes.string,
    generatedBy:             PropTypes.string,
  }),
};