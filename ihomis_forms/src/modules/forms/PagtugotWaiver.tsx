import styles from "./PagtugotWaiver.module.css";

export default function PagtugotWaiver({ patientName, patientData }) {
  const name = patientName || "";
  const caseNo = patientData?.caseNo || "";
  const hospitalNo = patientData?.hospitalNo || "";
  const sex = patientData?.sex || "";
  const age = patientData?.age || "";

  const pad = (n) => String(n).padStart(2, "0");
  const now = new Date();
  const dateStr = `${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${now.getFullYear()}`;

  const items = [
    "Wala nay kwarto nga masudlan busa sa hallway na lang iplastar ang pasyente gamit ang hospital folding bed.",
    "Kung wala nay bakante nga folding bed, ang wheel chair/linkuranan o stretcher una sa ward ang gamiton samtang maghulat nga adunay mabakante nga katre/folding bed.",
    "Kung walay bakante nga infant incubator, ang bata iplastar una sa bassinet o lamesa.",
    "Walay bakante/Supply nga medical oxygen.",
    "Walay ICU ang Hospital",
    "Walay neuro-surgeon",
  ];

  return (
    <div className={styles.page}>
      <div className={styles.patientInfo}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Case No.</span>
          <span className={styles.infoColon}>:</span>
          <span>{caseNo}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Hospital No.</span>
          <span className={styles.infoColon}>:</span>
          <span>{hospitalNo}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Patient's Name</span>
          <span className={styles.infoColon}>:</span>
          <span>{name}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Sex</span>
          <span className={styles.infoColon}>:</span>
          <span>{sex}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Age</span>
          <span className={styles.infoColon}>:</span>
          <span>{age}</span>
        </div>
      </div>

      {/* ── Opening paragraph ── */}
      <div className={styles.opening}>
        Human &nbsp; sa &nbsp; maayo &nbsp; nga &nbsp; pagpasabot &nbsp; kanako, &nbsp; ako &nbsp; si{" "}
        <span className={styles.openingLine} /> nga ana sa ensaktong pangidaron
        nagatugot nga ako/akong pasyente masulod/ma-admit diri sa Agusan del Norte
        Provincial Hospital bisan pa sa mga sumusunod na nga sitwasyon:
      </div>

      {/* ── Checkbox items ── */}
      <div className={styles.items}>
        {items.map((item, i) => (
          <div key={i} className={styles.item}>
            <span className={styles.itemBracket}>( )</span>
            <span className={styles.itemText}>{item}</span>
          </div>
        ))}
        <div className={styles.item}>
          <span className={styles.itemBracket}>( )</span>
          <span className={styles.itemText}>
            Uban pa <span className={styles.ubanLine} />.
          </span>
        </div>
      </div>

      {/* ── Closing paragraph ── */}
      <div className={styles.closing}>
        Akong gikuhaan ang mga hospital staff/personnel sa AGUSAN DEL NORTE
        PROVINCIAL HOSPITAL sa unsa mang responsibilidad kung unsa man ugaling ang
        dangatan kanako/akong pasyente sa akong desisyon nga gihimo.
      </div>

      {/* ── Signature section ── */}
      <div className={styles.sigSection}>

        {/* Patient name centered above left signature line */}
        <div className={styles.sigRow}>
          <div className={styles.sigLeft}>
            <div className={styles.sigName}>{name}</div>
            <div className={styles.sigLineFull} />
          </div>
          <div className={styles.sigRight}>
            <div className={styles.sigLineFull} />
          </div>
        </div>

        {/* Labels row */}
        <div className={styles.sigLabelRow}>
          <div className={styles.sigLabelLeft}>
            Ngalan ug pirma ibabaw sa pangalan sa nitugot
          </div>
          <div className={styles.sigLabelRight}>
            Ngalan ug pirma ibabaw sa pangalan sa testigo
          </div>
        </div>

        {/* Date centered below both labels */}
        <div className={styles.dateRow}>{dateStr}</div>
      </div>

    </div>
  );
}
