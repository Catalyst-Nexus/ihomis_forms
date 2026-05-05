import { useMemo } from "react";
import "./NewbornPersonalInfoSheet.css";

export default function NewbornPersonalInfoSheet({ patientName, patientData }) {
  const babyName = patientName || "BABY GIRL";
  const caseNum = patientData?.caseNum || "ADM-2026-010707";
  const sex = patientData?.sex || "F";
  const age = patientData?.age || "32 year(s)";
  const motherName = patientData?.motherName || "Error: No newborn record found.";
  const hospitalNo = patientData?.hospitalNo || "000000000021386";
  const address = patientData?.address || "P-1E, AMPAYON, BUTUAN CITY (Capital), AGUSAN DEL NORTE";

  const { dateStr, timeStr, generatedOn, generatedBy } = useMemo(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const h = now.getHours();
    const m = now.getMinutes();
    const hh = String(h % 12 || 12).padStart(2, "0");
    const ampm = h < 12 ? "am" : "pm";
    const AMPM = h < 12 ? "AM" : "PM";

    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeStr = `${hh}:${pad(m)} ${AMPM}`;
    const generatedOn = `${dateStr} ${hh}:${pad(m)} ${ampm}`;
    return { dateStr, timeStr, generatedOn, generatedBy: "TCP T. TCP" };
  }, []);

  const essentialItems = [
    "Immediate and thorough drying",
    "Early skin-to-skin contact with mother",
    "Properly timed cord clamping",
    "Non-separation of the newborn from the mother for early initiation of breastfeeding",
  ];

  const routineItems = [
    "Crede's Prophylaxis",
    "Vitamin K 0.1 mL Right thigh",
    "Hepa B Vaccine 0.5mL Left thigh",
    "Newborn Screening",
    "Newborn Hearing Test",
    "BCG 0.05 R DELTOID",
  ];

  const homeInstructions = [
    "Exclusive breastfeeding until baby is 6 months old",
    "Bath baby daily",
    "Do not apply alcohol/ betadine and binder on umbilical stump",
    "Do not use prelacteal, pacifier and feeding bottles",
    "Immunization c/o local health center",
  ];

  return (
    <div className="npis-page">
      <br />
      <div className="npis-case-row">
        <strong>Case Number:</strong>&nbsp;&nbsp;{caseNum}
      </div>

      {/* ── Baby / Mother info table ── */}
      <table className="npis-table">
        <tbody>
          <tr>
            <td style={{ width: "22%" }}><span className="npis-label">Baby's Name:</span></td>
            <td style={{ width: "28%" }}>{babyName}</td>
            <td style={{ width: "10%" }}><span className="npis-label">Sex:</span></td>
            <td style={{ width: "10%", textAlign: "center" }}>{sex}</td>
            <td style={{ width: "8%" }}><span className="npis-label">Age:</span></td>
            <td style={{ width: "22%", textAlign: "center" }}>{age}</td>
          </tr>
          <tr>
            <td><span className="npis-label">Mother's Name:</span></td>
            <td style={{ textAlign: "center" }}>{motherName}</td>
            <td><span className="npis-label">Sex:</span></td>
            <td style={{ textAlign: "center", fontStyle: "italic", fontSize: "7pt" }}>-</td>
            <td><span className="npis-label">Age:</span></td>
            <td></td>
          </tr>
          <tr>
            <td><span className="npis-label">Hospital No.</span></td>
            <td>{hospitalNo}</td>
            <td colSpan={1}><span className="npis-label">Complete Address:</span></td>
            <td colSpan={3}>{address}</td>
          </tr>
        </tbody>
      </table>

      {/* ── Delivery info table ── */}
      <table className="npis-del-table">
        <tbody>
          <tr>
            <td style={{ width: "20%" }}><span className="npis-label">Date of Delivery:</span></td>
            <td style={{ width: "20%" }}>{dateStr}</td>
            <td style={{ width: "20%" }}><span className="npis-label">Time of Delivery:</span></td>
            <td style={{ width: "40%" }}>{timeStr}</td>
          </tr>
          <tr>
            <td><span className="npis-label">Manner of Delivery:</span></td>
            <td colSpan={3}>
              ( ) NSVD &nbsp;&nbsp;( ) VDAC &nbsp;&nbsp;( ) Breech Extraction &nbsp;&nbsp;( ) Forceps &nbsp;&nbsp;( ) C/S
            </td>
          </tr>
          <tr>
            <td><span className="npis-label">Obstetrician:</span></td>
            <td></td>
            <td><span className="npis-label">Pediatrician:</span></td>
            <td></td>
          </tr>
          <tr>
            <td><span className="npis-label">APGAR:</span></td>
            <td></td>
            <td><span className="npis-label">Anesthesiologist:</span></td>
            <td></td>
          </tr>
          <tr>
            <td colSpan={4}><span className="npis-label">Anthropometric:</span></td>
          </tr>
          <tr>
            <td style={{ textAlign: "right" }}><span className="npis-italic">Weight:</span></td>
            <td></td>
            <td style={{ textAlign: "right" }}><span className="npis-italic">Head Circumference:</span></td>
            <td></td>
          </tr>
          <tr>
            <td style={{ textAlign: "right" }}><span className="npis-italic">Length:</span></td>
            <td></td>
            <td style={{ textAlign: "right" }}><span className="npis-italic">Chest Circumference:</span></td>
            <td></td>
          </tr>
          <tr>
            <td style={{ textAlign: "right" }}><span className="npis-italic">Temperature:</span></td>
            <td>36.2 °C</td>
            <td style={{ textAlign: "right" }}><span className="npis-italic">Abdominal Circumference:</span></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      {/* ── Essential Intrapartum Newborn Care ── */}
      <div className="npis-section-title">Essential Intrapartum Newborn Care:</div>
      {essentialItems.map((item, i) => (
        <div key={i} className="npis-item">( ) {item}</div>
      ))}

      {/* ── Routine Newborn Care ── */}
      <div className="npis-section-title">Routine Newborn Care:</div>
      {routineItems.map((item, i) => (
        <div key={i} className="npis-item">( ) {item}</div>
      ))}

      {/* ── Home Instructions ── */}
      <div className="npis-section-title">Home Instructions:</div>
      {homeInstructions.map((item, i) => (
        <div key={i} className="npis-numbered">{i + 1}. {item}</div>
      ))}
      <div className="npis-numbered">
        6. Additional instructions: <span className="npis-underline" />
      </div>
      <br />
      <br />

      {/* ── Signature section ── */}
      <div className="npis-sig-section">
        <div className="npis-sig-block">
          <div className="npis-sig-line" />
          <div style={{ fontSize: "8.5pt", textAlign: "center", marginTop: "1mm" }}>Nurse/ Midwife on Duty</div>
        </div>
        <div className="npis-sig-block">
          <div className="npis-sig-line" />
          <div style={{ fontSize: "8.5pt", textAlign: "center", marginTop: "1mm" }}>Date and Time of Discharge</div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="npis-footer">
        Generated by: {generatedBy} on {generatedOn}
      </div>

    </div>
  );
}