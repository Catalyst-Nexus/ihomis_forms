import { useMemo } from "react";
import "./SurgicalMemorandumUmbiCat.css";

export default function SurgicalMemorandumUmbiCat({ patientName, patientData }) {
  const caseNumber  = patientData?.caseNumber;
  const name        = patientName;
  const address     = patientData?.address;
  const contact     = patientData?.contact;
  const sex         = patientData?.sex;
  const civilStatus = patientData?.civilStatus;
  const age         = patientData?.age;
  const birthDate   = patientData?.birthDate;

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
    <div className="smuc-page">

      {/* ── Patient Info Block ── */}
      <div className="smuc-info-block">
        <div className="smuc-info-row"><span className="smuc-info-label">Case Number:</span><span>{caseNumber}</span></div>
        <div className="smuc-info-row"><span className="smuc-info-label">Name</span><span>{name}</span></div>
        <div className="smuc-info-row"><span className="smuc-info-label">Address:</span><span>{address}</span></div>
        <div className="smuc-info-row"><span className="smuc-info-label">Contact:</span><span>{contact}</span></div>
        <div className="smuc-info-row"><span className="smuc-info-label">Sex:</span><span>{sex}</span></div>
        <div className="smuc-info-row"><span className="smuc-info-label">Civil Status:</span><span>{civilStatus}</span></div>
        <div className="smuc-info-row"><span className="smuc-info-label">Age:</span><span>{age}</span></div>
        <div className="smuc-info-row"><span className="smuc-info-label">Birth Date:</span><span>{birthDate}</span></div>
      </div>

      {/* ── Main Table ── */}
      <table className="smuc-table">
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

          {/* ── Row 1: Vitals ── */}
          <tr>
            <td className="smuc-vl">Weight</td>
            <td className="smuc-vv"></td>
            <td className="smuc-vl">Temperature</td>
            <td className="smuc-vv"></td>
            <td className="smuc-vl">RR</td>
            <td className="smuc-vv"></td>
            <td className="smuc-vl">PR</td>
            <td className="smuc-vv"></td>
            <td className="smuc-vl">BP</td>
            <td className="smuc-vv"></td>
            <td className="smuc-vl">SPO2</td>
            <td className="smuc-vv"></td>
            <td className="smuc-vl smuc-date-lbl">Date<br />Performed</td>
            <td className="smuc-vv smuc-date-val"></td>
          </tr>

          {/* ── Surgeon ── */}
          <tr>
            <td colSpan={3} className="smuc-lbl">Surgeon</td>
            <td colSpan={11}></td>
          </tr>

          {/* ── Assistant Surgeon ── */}
          <tr>
            <td colSpan={3} className="smuc-lbl">Assistant Surgeon</td>
            <td colSpan={11}></td>
          </tr>

          {/* ── Anesthesiologist + Type of Anesthesia ── */}
          <tr>
            <td colSpan={3} className="smuc-lbl">Anesthesiologist</td>
            <td colSpan={4}></td>
            <td colSpan={3} className="smuc-lbl">Type of Anesthesia</td>
            <td colSpan={4}></td>
          </tr>

          {/* ── Time of Induction + Time Ended ── */}
          <tr>
            <td colSpan={3} className="smuc-lbl">Time of Induction</td>
            <td colSpan={4}></td>
            <td colSpan={3} className="smuc-lbl">Time Ended</td>
            <td colSpan={4}></td>
          </tr>

          {/* ── Scrub Nurse ── */}
          <tr>
            <td colSpan={3} className="smuc-lbl">Scrub Nurse</td>
            <td colSpan={11}></td>
          </tr>

          {/* ── Circulating Nurse ── */}
          <tr>
            <td colSpan={3} className="smuc-lbl">Circulating Nurse</td>
            <td colSpan={11}></td>
          </tr>

          {/* ── Pre-Op Medication | Fluids | Blood Replacements ── */}
          <tr>
            <td colSpan={4} className="smuc-sub-hdr">Pre-Operative Medication</td>
            <td colSpan={5} className="smuc-sub-hdr">Fluids</td>
            <td colSpan={5} className="smuc-sub-hdr">Blood Replacements</td>
          </tr>
          {[0, 1, 2].map(i => (
            <tr key={`mfb-${i}`} className="smuc-data-row">
              <td colSpan={4}></td>
              <td colSpan={5}></td>
              <td colSpan={5}></td>
            </tr>
          ))}

          {/* ── Pre-Operative Diagnosis ── */}
          <tr>
            <td colSpan={4} className="smuc-lbl">Pre-Operative Diagnosis</td>
            <td colSpan={10}></td>
          </tr>
          <tr className="smuc-data-row"><td colSpan={14}></td></tr>
          <tr className="smuc-data-row"><td colSpan={14}></td></tr>

          {/* ── Operation Performed — pre-filled ── */}
          <tr>
            <td colSpan={4} className="smuc-lbl">Operation Performed</td>
            <td colSpan={10} className="smuc-prefilled smuc-center">UMBILICAL CATETHERIZATION</td>
          </tr>
          <tr className="smuc-data-row"><td colSpan={14}></td></tr>
          <tr className="smuc-data-row"><td colSpan={14}></td></tr>
          <tr className="smuc-data-row"><td colSpan={14}></td></tr>

          {/* ── Operation Started | Ended | RVS Code — pre-filled ── */}
          <tr>
            <td colSpan={2} className="smuc-lbl smuc-tall smuc-center">Operation<br />Started</td>
            <td colSpan={3}></td>
            <td colSpan={2} className="smuc-lbl smuc-tall smuc-center">Operation<br />Ended</td>
            <td colSpan={3}></td>
            <td colSpan={2} className="smuc-lbl smuc-tall smuc-center">RVS<br />Code</td>
            <td colSpan={2} className="smuc-prefilled smuc-center">36510</td>
          </tr>

          {/* ── Post-Operative Diagnosis ── */}
          <tr>
            <td colSpan={4} className="smuc-lbl">Post-Operative Diagnosis</td>
            <td colSpan={10}></td>
          </tr>
          <tr className="smuc-data-row"><td colSpan={14}></td></tr>
          <tr className="smuc-data-row"><td colSpan={14}></td></tr>
          <tr className="smuc-data-row"><td colSpan={14}></td></tr>

          {/* ── Operation Technique — pre-filled ── */}
          <tr>
            <td colSpan={4} className="smuc-lbl">Operation Technique</td>
            <td colSpan={10} className="smuc-prefilled smuc-technique-cell">
              The umbilical cord stump and the surrounding abdomen are sterilized with An anti bactericidal solution. Sterile drapes are placed.
            </td>
          </tr>
          {/* Continuation row for technique */}
          <tr>
            <td colSpan={14} className="smuc-prefilled smuc-technique-cont">
              A purse-string suture or umbilical tape is tied around the base of the stump to provide hemostatsis and to anchor the line after the procedure.
            </td>
          </tr>
          <tr className="smuc-data-row"><td colSpan={14}></td></tr>
          <tr className="smuc-data-row"><td colSpan={14}></td></tr>

          {/* ── For Deliveries/CS banner ── */}
          <tr>
            <td colSpan={14} className="smuc-banner">
              FOR DELIVERIES/CAESAREAN SECTION ONLY (For Neonate)
            </td>
          </tr>

          {/* ── Time of Delivery | Sex | Weight | Temp | Apgar ── */}
          <tr>
            <td colSpan={2} className="smuc-lbl">Time of Delivery</td>
            <td colSpan={2}></td>
            <td colSpan={1} className="smuc-lbl smuc-center">Sex</td>
            <td colSpan={2}></td>
            <td colSpan={1} className="smuc-lbl smuc-center">Weight</td>
            <td colSpan={2}></td>
            <td colSpan={1} className="smuc-lbl smuc-center">Temp.</td>
            <td colSpan={2}></td>
            <td colSpan={1} className="smuc-lbl smuc-center">Apgar</td>
          </tr>

          {/* ── HC | CC | AC | L ── */}
          <tr>
            <td colSpan={1} className="smuc-lbl smuc-center">HC</td>
            <td colSpan={2}></td>
            <td colSpan={1} className="smuc-lbl smuc-center">CC</td>
            <td colSpan={2}></td>
            <td colSpan={1} className="smuc-lbl smuc-center">AC</td>
            <td colSpan={2}></td>
            <td colSpan={1} className="smuc-lbl smuc-center">L</td>
            <td colSpan={4}></td>
          </tr>

        </tbody>
      </table>

      {/* ── Signatures ── */}
      <div className="smuc-sig-row">
        <div className="smuc-sig-block">
          <div className="smuc-sig-line" />
          <div className="smuc-sig-label">Signature of Anesthesiologist</div>
        </div>
        <div className="smuc-sig-block">
          <div className="smuc-sig-line" />
          <div className="smuc-sig-label">Signature of Surgeon</div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="smuc-footer">
        Generated by: TCP T. TCP on {generatedOn}
      </div>

    </div>
  );
}