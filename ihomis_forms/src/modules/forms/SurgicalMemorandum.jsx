import { useMemo } from "react";
import "./SurgicalMemorandum.css";

export default function SurgicalMemorandum({ patientName, patientData }) {
  const caseNumber  = patientData?.caseNumber  || "";
  const name        = patientName              || "";
  const address     = patientData?.address     || "";
  const contact     = patientData?.contact     || "";
  const sex         = patientData?.sex         || "";
  const civilStatus = patientData?.civilStatus || "";
  const age         = patientData?.age         || "";
  const birthDate   = patientData?.birthDate   || "";

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
    <div className="sm-page">
      <br />

      {/* PATIENT INFO */}
      <div className="sm-info-block">
        <div className="sm-info-grid">
          <div className="sm-info-row"><span className="sm-info-label">Case Number:</span><span>{caseNumber}</span></div>
          <div className="sm-info-row"><span className="sm-info-label">Sex:</span><span>{sex}</span></div>
          <div className="sm-info-row"><span className="sm-info-label">Name:</span><span>{name}</span></div>
          <div className="sm-info-row"><span className="sm-info-label">Civil Status:</span><span>{civilStatus}</span></div>
          <div className="sm-info-row"><span className="sm-info-label">Address:</span><span>{address}</span></div>
          <div className="sm-info-row"><span className="sm-info-label">Age:</span><span>{age}</span></div>
          <div className="sm-info-row"><span className="sm-info-label">Contact:</span><span>{contact}</span></div>
          <div className="sm-info-row"><span className="sm-info-label">Birth Date:</span><span>{birthDate}</span></div>
        </div>
      </div>

      {/* TABLE */}
      <table className="sm-table">
        <colgroup>
          <col style={{ width: "7%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "14%" }} />
        </colgroup>

        <tbody>
          <tr>
            <td className="sm-vl">Weight</td><td />
            <td className="sm-vl">Temperature</td><td />
            <td className="sm-vl">RR</td><td />
            <td className="sm-vl">PR</td><td />
            <td className="sm-vl">BP</td><td />
            <td className="sm-vl">SPO2</td><td />
            <td className="sm-vl sm-date-lbl">Date<br />Performed</td>
            <td />
          </tr>

          <tr><td colSpan={3} className="sm-lbl">Surgeon</td><td colSpan={11} /></tr>
          <tr><td colSpan={3} className="sm-lbl">Assistant Surgeon</td><td colSpan={11} /></tr>

          <tr>
            <td colSpan={3} className="sm-lbl">Anesthesiologist</td><td colSpan={4} />
            <td colSpan={3} className="sm-lbl">Type of Anesthesia</td><td colSpan={4} />
          </tr>

          <tr>
            <td colSpan={3} className="sm-lbl">Time of Induction</td><td colSpan={4} />
            <td colSpan={3} className="sm-lbl">Time Ended</td><td colSpan={4} />
          </tr>

          <tr><td colSpan={3} className="sm-lbl">Scrub Nurse</td><td colSpan={11} /></tr>
          <tr><td colSpan={3} className="sm-lbl">Circulating Nurse</td><td colSpan={11} /></tr>

          <tr>
            <td colSpan={4} className="sm-sub-hdr">Pre-Operative Medication</td>
            <td colSpan={5} className="sm-sub-hdr">Fluids</td>
            <td colSpan={5} className="sm-sub-hdr">Blood Replacements</td>
          </tr>

          {[0,1,2].map(i => (
            <tr key={i} className="sm-mfb-row">
              <td colSpan={4} /><td colSpan={5} /><td colSpan={5} />
            </tr>
          ))}

          <tr><td colSpan={4} className="sm-lbl">Pre-Operative Diagnosis</td><td colSpan={10} /></tr>
          <tr className="sm-extra-row"><td colSpan={14} /></tr>
          <tr className="sm-extra-row"><td colSpan={14} /></tr>

          <tr><td colSpan={4} className="sm-lbl">Operation Performed</td><td colSpan={10} /></tr>
          <tr className="sm-extra-row"><td colSpan={14} /></tr>
          <tr className="sm-extra-row"><td colSpan={14} /></tr>
          <tr className="sm-extra-row"><td colSpan={14} /></tr>

          <tr>
            <td colSpan={2} className="sm-lbl sm-tall">Operation<br />Started</td><td colSpan={3} />
            <td colSpan={2} className="sm-lbl sm-tall">Operation<br />Ended</td><td colSpan={3} />
            <td colSpan={2} className="sm-lbl sm-tall">RVS<br />Code</td><td colSpan={2} />
          </tr>

          <tr><td colSpan={4} className="sm-lbl">Post-Operative Diagnosis</td><td colSpan={10} /></tr>
          <tr className="sm-extra-row"><td colSpan={14} /></tr>
          <tr className="sm-extra-row"><td colSpan={14} /></tr>
          <tr className="sm-extra-row"><td colSpan={14} /></tr>

          <tr><td colSpan={4} className="sm-lbl">Operation Technique</td><td colSpan={10} /></tr>
          <tr className="sm-extra-row"><td colSpan={14} /></tr>
          <tr className="sm-extra-row"><td colSpan={14} /></tr>
          <tr className="sm-extra-row"><td colSpan={14} /></tr>

          <tr><td colSpan={14} className="sm-banner">FOR DELIVERIES/CAESAREAN SECTION ONLY (For Neonate)</td></tr>

          <tr>
            <td colSpan={2} className="sm-lbl">Time of Delivery</td><td colSpan={2} />
            <td className="sm-lbl">Sex</td><td colSpan={2} />
            <td className="sm-lbl">Weight</td><td colSpan={2} />
            <td className="sm-lbl">Temp.</td><td colSpan={2} />
            <td className="sm-lbl">Apgar</td>
          </tr>

          <tr>
            <td className="sm-lbl">HC</td><td colSpan={2} />
            <td className="sm-lbl">CC</td><td colSpan={2} />
            <td className="sm-lbl">AC</td><td colSpan={2} />
            <td className="sm-lbl">L</td><td colSpan={4} />
          </tr>
        </tbody>
      </table>
      <br />
      <br />
      <br />

      {/* SIGNATURES */}
      <div className="sm-sig-row">
        <div className="sm-sig-block">
          <div className="sm-sig-line" />
          <div className="sm-sig-label">Signature of Anesthesiologist</div>
        </div>
        <div className="sm-sig-block">
          <div className="sm-sig-line" />
          <div className="sm-sig-label">Signature of Surgeon</div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="sm-footer">
        Generated by: TCP T. TCP on {generatedOn}
      </div>

    </div>
  );
}