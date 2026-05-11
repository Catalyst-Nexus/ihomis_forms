import { useMemo } from "react";
import styles from "./NewbornPersonalInfoSheet.module.css";

export default function NewbornPersonalInfoSheet({ patientName, patientData }) {
  const babyName = patientName || "";
  const caseNum = patientData?.caseNum || "";
  const sex = patientData?.sex || "";
  const age = patientData?.age || "";
  const motherName = patientData?.motherName || "";
  const hospitalNo = patientData?.hospitalNo || "";
  const address = patientData?.address || "";

  const { dateStr, timeStr } = useMemo(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const h = now.getHours();
    const m = now.getMinutes();
    const hh = String(h % 12 || 12).padStart(2, "0");
    const AMPM = h < 12 ? "AM" : "PM";

    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeStr = `${hh}:${pad(m)} ${AMPM}`;
    return { dateStr, timeStr };
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
    <div className={styles.page}>
      <br />
      <div className={styles.caseRow}>
        <strong>Case Number:</strong>&nbsp;&nbsp;{caseNum}
      </div>

      {/* ── Baby / Mother info table ── */}
      <table className={styles.table}>
        <tbody>
          <tr>
            <td style={{ width: "22%" }}><span className={styles.label}>Baby's Name:</span></td>
            <td style={{ width: "28%" }}>{babyName}</td>
            <td style={{ width: "10%" }}><span className={styles.label}>Sex:</span></td>
            <td style={{ width: "10%", textAlign: "center" }}>{sex}</td>
            <td style={{ width: "8%" }}><span className={styles.label}>Age:</span></td>
            <td style={{ width: "22%", textAlign: "center" }}>{age}</td>
          </tr>
          <tr>
            <td><span className={styles.label}>Mother's Name:</span></td>
            <td style={{ textAlign: "center" }}>{motherName}</td>
            <td><span className={styles.label}>Sex:</span></td>
            <td style={{ textAlign: "center", fontStyle: "italic", fontSize: "7pt" }}>-</td>
            <td><span className={styles.label}>Age:</span></td>
            <td></td>
          </tr>
          <tr>
            <td><span className={styles.label}>Hospital No.</span></td>
            <td>{hospitalNo}</td>
            <td colSpan={1}><span className={styles.label}>Complete Address:</span></td>
            <td colSpan={3}>{address}</td>
          </tr>
        </tbody>
      </table>

      {/* ── Delivery info table ── */}
      <table className={styles.delTable}>
        <tbody>
          <tr>
            <td style={{ width: "20%" }}><span className={styles.label}>Date of Delivery:</span></td>
            <td style={{ width: "20%" }}>{dateStr}</td>
            <td style={{ width: "20%" }}><span className={styles.label}>Time of Delivery:</span></td>
            <td style={{ width: "40%" }}>{timeStr}</td>
          </tr>
          <tr>
            <td><span className={styles.label}>Manner of Delivery:</span></td>
            <td colSpan={3}>
              ( ) NSVD &nbsp;&nbsp;( ) VDAC &nbsp;&nbsp;( ) Breech Extraction &nbsp;&nbsp;( ) Forceps &nbsp;&nbsp;( ) C/S
            </td>
          </tr>
          <tr>
            <td><span className={styles.label}>Obstetrician:</span></td>
            <td></td>
            <td><span className={styles.label}>Pediatrician:</span></td>
            <td></td>
          </tr>
          <tr>
            <td><span className={styles.label}>APGAR:</span></td>
            <td></td>
            <td><span className={styles.label}>Anesthesiologist:</span></td>
            <td></td>
          </tr>
          <tr>
            <td colSpan={4}><span className={styles.label}>Anthropometric:</span></td>
          </tr>
          <tr>
            <td style={{ textAlign: "right" }}><span className={styles.italic}>Weight:</span></td>
            <td></td>
            <td style={{ textAlign: "right" }}><span className={styles.italic}>Head Circumference:</span></td>
            <td></td>
          </tr>
          <tr>
            <td style={{ textAlign: "right" }}><span className={styles.italic}>Length:</span></td>
            <td></td>
            <td style={{ textAlign: "right" }}><span className={styles.italic}>Chest Circumference:</span></td>
            <td></td>
          </tr>
          <tr>
            <td style={{ textAlign: "right" }}><span className={styles.italic}>Temperature:</span></td>
            <td>36.2 °C</td>
            <td style={{ textAlign: "right" }}><span className={styles.italic}>Abdominal Circumference:</span></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      {/* ── Essential Intrapartum Newborn Care ── */}
      <div className={styles.sectionTitle}>Essential Intrapartum Newborn Care:</div>
      {essentialItems.map((item, i) => (
        <div key={i} className={styles.item}>( ) {item}</div>
      ))}

      {/* ── Routine Newborn Care ── */}
      <div className={styles.sectionTitle}>Routine Newborn Care:</div>
      {routineItems.map((item, i) => (
        <div key={i} className={styles.item}>( ) {item}</div>
      ))}

      {/* ── Home Instructions ── */}
      <div className={styles.sectionTitle}>Home Instructions:</div>
      {homeInstructions.map((item, i) => (
        <div key={i} className={styles.numbered}>{i + 1}. {item}</div>
      ))}
      <div className={styles.numbered}>
        6. Additional instructions: <span className={styles.underline} />
      </div>
      <br />
      <br />

      {/* ── Signature section ── */}
      <div className={styles.sigSection}>
        <div className={styles.sigBlock}>
          <div className={styles.sigLine} />
          <div className={styles.sigLabel}>Nurse/ Midwife on Duty</div>
        </div>
        <div className={styles.sigBlock}>
          <div className={styles.sigLine} />
          <div className={styles.sigLabel}>Date and Time of Discharge</div>
        </div>
      </div>

    </div>
  );
}
