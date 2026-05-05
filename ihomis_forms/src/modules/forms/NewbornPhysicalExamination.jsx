import { useMemo } from "react";
import "./NewbornPhysicalExamination.css";

export default function NewbornPhysicalExamination({ patientName, patientData }) {
  const name = patientName || "BABY BOY BAYSA";
  const caseNum = patientData?.caseNum || "ADM-2026-010651";
  const sex = patientData?.sex || "M";
  const age = patientData?.age || "1 hour(s)";

  const { generatedOn, generatedBy } = useMemo(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const h = now.getHours();
    const m = now.getMinutes();
    const hh = String(h % 12 || 12).padStart(2, "0");
    const ampm = h < 12 ? "am" : "pm";
    const generatedOn = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${hh}:${pad(m)} ${ampm}`;
    return { generatedOn, generatedBy: "TCP T. TCP" };
  }, []);

  const U = ({ size }) => (
    <span className={size === "sm" ? "npe-underline-sm" : size === "lg" ? "npe-underline-lg" : "npe-underline"} />
  );

  return (
    <div className="npe-page">
      <br />
      <div className="npe-case-row">
        <strong>Case Number:</strong>&nbsp;&nbsp;{caseNum}
      </div>

      <table className="npe-main-table">
        <tbody>

          {/* ── Baby header row ── */}
          <tr className="npe-baby-header">
            <td style={{ width: "20%" }}><span className="npe-baby-label">Baby's Name:</span></td>
            <td style={{ width: "30%" }} className="npe-baby-name">{name}</td>
            <td style={{ width: "10%" }}><strong>Sex:</strong></td>
            <td style={{ width: "10%", textAlign: "center" }}>{sex}</td>
            <td style={{ width: "10%" }}><strong>Age:</strong></td>
            <td style={{ width: "20%", textAlign: "center" }}>{age}</td>
          </tr>

          {/* ── Vital Signs | Anthropometric Data headers ── */}
          <tr>
            <td colSpan={3} className="npe-section-header">VITAL SIGNS</td>
            <td colSpan={3} className="npe-section-header">ANTHROPOMETRIC DATA</td>
          </tr>

          {/* ── Vitals + Anthropometric rows ── */}
          <tr>
            <td colSpan={3} style={{ padding: 0, border: "1px solid #000" }}>
              <table className="npe-vs-table">
                <tbody>
                  <tr>
                    <td className="npe-vs-label">Heart rate:</td>
                    <td className="npe-vs-value"></td>
                  </tr>
                  <tr>
                    <td className="npe-vs-label">Temperatue:</td>
                    <td className="npe-vs-value">37.3 °C</td>
                  </tr>
                  <tr>
                    <td className="npe-vs-label">Respiratory rate:</td>
                    <td className="npe-vs-value">53</td>
                  </tr>
                  <tr>
                    <td className="npe-vs-label">Oxygen Saturation:</td>
                    <td className="npe-vs-value">99</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td colSpan={3} style={{ padding: 0, border: "1px solid #000" }}>
              <table className="npe-ant-table">
                <tbody>
                  <tr>
                    <td className="npe-ant-label">Weight:</td>
                    <td className="npe-ant-value">3800</td>
                  </tr>
                  <tr>
                    <td className="npe-ant-label">Length:</td>
                    <td className="npe-ant-value">55</td>
                  </tr>
                  <tr>
                    <td className="npe-ant-label">Head circumference:</td>
                    <td className="npe-ant-value">35</td>
                  </tr>
                  <tr>
                    <td className="npe-ant-label">Chest Circumference:</td>
                    <td className="npe-ant-value">34</td>
                  </tr>
                  <tr>
                    <td className="npe-ant-label">Abdominal Girth:</td>
                    <td className="npe-ant-value">34</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* ── General Appearance | Neck ── */}
          <tr>
            <td colSpan={3} className="npe-exam-cell">
              <div className="npe-exam-title">General Appearance::</div>
              <span>( )APGAR: <U/>1min <U/>5min <U/>10min</span><br />
              <span>( ) Active:</span><br />
              <span>( ) Limp:</span>
            </td>
            <td colSpan={3} className="npe-exam-cell">
              <div className="npe-exam-title">Neck:</div>
              <span>( ) Normal</span><br />
              <span>( ) Asymmetrical</span><br />
              <span>( ) Crepitus</span><br />
              <span>( )Others:</span>
            </td>
          </tr>

          {/* ── Skin | Chest ── */}
          <tr>
            <td colSpan={3} className="npe-exam-cell">
              <div className="npe-exam-title">Skin:</div>
              <span>( ) Color: <U size="sm"/>Pink <U size="sm"/>Cynotic <U size="sm"/>Acrocyanosis</span><br />
              <span>( ) Hematoma</span><br />
              <span>( ) Jaundice</span><br />
              <span>( ) Nevi/Marks:<U/></span>
            </td>
            <td colSpan={3} className="npe-exam-cell">
              <div className="npe-exam-title">Chest:</div>
              <span>( ) Chest expansion: <U size="sm"/>Symmetric</span><br />
              <span>&nbsp;&nbsp;&nbsp;&nbsp;<U size="sm"/>Asymetrical</span><br />
              <span>( ) Breath sounds: <U size="sm"/>Clear BS <U size="sm"/>Harsh BS</span><br />
              <span>( )Others:</span>
            </td>
          </tr>

          {/* ── Head | CVS ── */}
          <tr>
            <td colSpan={3} className="npe-exam-cell">
              <div className="npe-exam-title">Head:</div>
              <span>( )Anterior fontanelle:<U size="sm"/>Normal <U size="sm"/>Depressed <U size="sm"/>Bulging</span><br />
              <span>( )Posterior fontanelle:<U size="sm"/>Open <U size="sm"/>Closed</span><br />
              <span>( )Caput Succedaneum(crosses sutures)</span><br />
              <span>( )Others:<U/></span>
            </td>
            <td colSpan={3} className="npe-exam-cell">
              <div className="npe-exam-title">CVS:</div>
              <span>( ) Adynamic precordium</span><br />
              <span>( )Murmur</span><br />
              <span>( ) Pulses: <U size="sm"/>Good <U size="sm"/>Weak</span><br />
              <span>( )Others:<U/></span>
            </td>
          </tr>

          {/* ── Eyes | Abdomen ── */}
          <tr>
            <td colSpan={3} className="npe-exam-cell">
              <div className="npe-exam-title">Eyes:</div>
              <span>( )Conjunctival hemorrhage</span><br />
              <span>( )Others:<U/></span>
            </td>
            <td colSpan={3} className="npe-exam-cell">
              <div className="npe-exam-title">Abdomen:</div>
              <span>( ) <U size="sm"/>Soft <U size="sm"/>Globular <U size="sm"/>Scaphoid <U size="sm"/>Distended</span><br />
              <span>( ) Diastasis rectus? Hernia</span><br />
              <span>( )Cord: <U size="sm"/>3vessel</span><br />
              <span>( )Others:<U/></span>
            </td>
          </tr>

          {/* ── Nose | Genitalia/Anus ── */}
          <tr>
            <td colSpan={3} className="npe-exam-cell">
              <div className="npe-exam-title">Nose:</div>
              <span>( )Patent</span><br />
              <span>( )Others:<U/></span>
            </td>
            <td colSpan={3} className="npe-exam-cell">
              <div className="npe-exam-title">Genitalia/Anus</div>
              <span>( ) Normal: <U size="sm"/>male <U size="sm"/>female</span><br />
              <span>( ) Patent anal opening ( )</span><br />
              <span>Others:<U/></span>
            </td>
          </tr>

          {/* ── Ears | Extremities ── */}
          <tr>
            <td colSpan={3} className="npe-exam-cell">
              <div className="npe-exam-title">Ears:</div>
              <span>( )Patent</span><br />
              <span>( )Ear tags</span><br />
              <span>( )Others:<U/></span>
            </td>
            <td colSpan={3} className="npe-exam-cell">
              <div className="npe-exam-title">EXTREMITIES:</div>
              <span>( ) Normal</span><br />
              <span>( ) dEformities</span>
            </td>
          </tr>

          {/* ── Mouth | (empty right) ── */}
          <tr>
            <td colSpan={3} className="npe-exam-cell">
              <div className="npe-exam-title">Mouth:</div>
              <span>( )Normal</span><br />
              <span>( )Asymetrical</span><br />
              <span>( )Cleft lips/palate</span><br />
              <span>( )Others:<U/></span>
            </td>
            <td colSpan={3} className="npe-exam-cell"></td>
          </tr>

        </tbody>
      </table>

      {/* ── Pediatrician signature ── */}
      <br />
      <div className="npe-sig-section">
        <div className="npe-sig-line" />
        <div className="npe-sig-label">PEDIATRICIAN</div>
      </div>

      {/* ── Footer ── */}
      <div className="npe-footer">
        Generated by: {generatedBy} on {generatedOn}
      </div>

    </div>
  );
}