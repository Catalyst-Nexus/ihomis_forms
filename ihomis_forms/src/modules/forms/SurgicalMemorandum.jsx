import { useMemo } from "react";
import "./SurgicalMemorandum.css";

export default function SurgicalMemorandum({ patientName, patientData }) {
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
    <div className="sm-page">

      {/* ── Space reserved for header ── */}
      <div className="sm-header-space" />

      {/* ── Patient Info Block — 4 rows x 2 columns ── */}
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

      {/* ── Main Table ── */}
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

          {/* ── Row 1: Vitals ── */}
          <tr>
            <td className="sm-vl">Weight</td>
            <td className="sm-vv"></td>
            <td className="sm-vl">Temperature</td>
            <td className="sm-vv"></td>
            <td className="sm-vl">RR</td>
            <td className="sm-vv"></td>
            <td className="sm-vl">PR</td>
            <td className="sm-vv"></td>
            <td className="sm-vl">BP</td>
            <td className="sm-vv"></td>
            <td className="sm-vl">SPO2</td>
            <td className="sm-vv"></td>
            <td className="sm-vl sm-date-lbl">Date<br />Performed</td>
            <td className="sm-vv sm-date-val"></td>
          </tr>

          {/* ── Surgeon ── */}
          <tr>
            <td colSpan={3} className="sm-lbl">Surgeon</td>
            <td colSpan={11} className="sm-val"></td>
          </tr>

          {/* ── Assistant Surgeon ── */}
          <tr>
            <td colSpan={3} className="sm-lbl">Assistant Surgeon</td>
            <td colSpan={11} className="sm-val"></td>
          </tr>

          {/* ── Anesthesiologist + Type of Anesthesia ── */}
          <tr>
            <td colSpan={3} className="sm-lbl">Anesthesiologist</td>
            <td colSpan={4} className="sm-val"></td>
            <td colSpan={3} className="sm-lbl">Type of Anesthesia</td>
            <td colSpan={4} className="sm-val"></td>
          </tr>

          {/* ── Time of Induction + Time Ended ── */}
          <tr>
            <td colSpan={3} className="sm-lbl">Time of Induction</td>
            <td colSpan={4} className="sm-val"></td>
            <td colSpan={3} className="sm-lbl">Time Ended</td>
            <td colSpan={4} className="sm-val"></td>
          </tr>

          {/* ── Scrub Nurse ── */}
          <tr>
            <td colSpan={3} className="sm-lbl">Scrub Nurse</td>
            <td colSpan={11} className="sm-val"></td>
          </tr>

          {/* ── Circulating Nurse ── */}
          <tr>
            <td colSpan={3} className="sm-lbl">Circulating Nurse</td>
            <td colSpan={11} className="sm-val"></td>
          </tr>

          {/* ── Pre-Op Medication | Fluids | Blood Replacements headers ── */}
          <tr>
            <td colSpan={4} className="sm-sub-hdr">Pre-Operative Medication</td>
            <td colSpan={5} className="sm-sub-hdr">Fluids</td>
            <td colSpan={5} className="sm-sub-hdr">Blood Replacements</td>
          </tr>
          {[0, 1, 2].map(i => (
            <tr key={`mfb-${i}`} className="sm-mfb-row">
              <td colSpan={4} className="sm-val"></td>
              <td colSpan={5} className="sm-val"></td>
              <td colSpan={5} className="sm-val"></td>
            </tr>
          ))}

          {/* ── Pre-Operative Diagnosis ── */}
          <tr>
            <td colSpan={4} className="sm-lbl">Pre-Operative Diagnosis</td>
            <td colSpan={10} className="sm-val"></td>
          </tr>
          <tr className="sm-extra-row"><td colSpan={14} /></tr>
          <tr className="sm-extra-row"><td colSpan={14} /></tr>

          {/* ── Operation Performed ── */}
          <tr>
            <td colSpan={4} className="sm-lbl">Operation Performed</td>
            <td colSpan={10} className="sm-val"></td>
          </tr>
          <tr className="sm-extra-row"><td colSpan={14} /></tr>
          <tr className="sm-extra-row"><td colSpan={14} /></tr>
          <tr className="sm-extra-row"><td colSpan={14} /></tr>

          {/* ── Operation Started | Ended | RVS Code ── */}
          <tr>
            <td colSpan={2} className="sm-lbl sm-tall">Operation<br />Started</td>
            <td colSpan={3} className="sm-val"></td>
            <td colSpan={2} className="sm-lbl sm-tall">Operation<br />Ended</td>
            <td colSpan={3} className="sm-val"></td>
            <td colSpan={2} className="sm-lbl sm-tall">RVS<br />Code</td>
            <td colSpan={2} className="sm-val"></td>
          </tr>

          {/* ── Post-Operative Diagnosis ── */}
          <tr>
            <td colSpan={4} className="sm-lbl">Post-Operative Diagnosis</td>
            <td colSpan={10} className="sm-val"></td>
          </tr>
          <tr className="sm-extra-row"><td colSpan={14} /></tr>
          <tr className="sm-extra-row"><td colSpan={14} /></tr>
          <tr className="sm-extra-row"><td colSpan={14} /></tr>

          {/* ── Operation Technique ── */}
          <tr>
            <td colSpan={4} className="sm-lbl">Operation Technique</td>
            <td colSpan={10} className="sm-val"></td>
          </tr>
          <tr className="sm-extra-row"><td colSpan={14} /></tr>
          <tr className="sm-extra-row"><td colSpan={14} /></tr>
          <tr className="sm-extra-row"><td colSpan={14} /></tr>

          {/* ── For Deliveries/CS banner ── */}
          <tr>
            <td colSpan={14} className="sm-banner">
              FOR DELIVERIES/CAESAREAN SECTION ONLY (For Neonate)
            </td>
          </tr>

          {/* ── Time of Delivery | Sex | Weight | Temp | Apgar ── */}
          <tr>
            <td colSpan={2} className="sm-lbl">Time of Delivery</td>
            <td colSpan={2} className="sm-val"></td>
            <td colSpan={1} className="sm-lbl">Sex</td>
            <td colSpan={2} className="sm-val"></td>
            <td colSpan={1} className="sm-lbl">Weight</td>
            <td colSpan={2} className="sm-val"></td>
            <td colSpan={1} className="sm-lbl">Temp.</td>
            <td colSpan={2} className="sm-val"></td>
            <td colSpan={1} className="sm-lbl">Apgar</td>
          </tr>

          {/* ── HC | CC | AC | L ── */}
          <tr>
            <td colSpan={1} className="sm-lbl">HC</td>
            <td colSpan={2} className="sm-val"></td>
            <td colSpan={1} className="sm-lbl">CC</td>
            <td colSpan={2} className="sm-val"></td>
            <td colSpan={1} className="sm-lbl">AC</td>
            <td colSpan={2} className="sm-val"></td>
            <td colSpan={1} className="sm-lbl">L</td>
            <td colSpan={4} className="sm-val"></td>
          </tr>
        </tbody>
      </table>

      {/* ── Signatures ── */}
      <br />
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

      {/* ── Footer ── */}
      <div className="sm-footer">
        Generated by: TCP T. TCP on {generatedOn}
      </div>

    </div>
  );
}