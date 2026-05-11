import styles from "./DoctorsOrderPedia.module.css";

export default function DoctorsOrderPedia({ patientName, patientData }) {
  const name       = patientName             || "";
  const hospitalNo = patientData?.hospitalNo || "";
  const caseNo     = patientData?.caseNo     || "";
  const sex        = patientData?.sex        || "";
  const age        = patientData?.age        || "";

  const U = ({ w }) => (
    <span style={{
      display: "inline-block",
      borderBottom: "1px solid #000",
      minWidth: w || "22mm",
      height: "1px",
      verticalAlign: "bottom",
      margin: "0 0.5mm"
    }} />
  );

  return (
    <div className={styles.page}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.colLeft}>PROGRESS NOTES</th>
            <th className={styles.colRight}>DOCTOR'S ORDER</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={styles.cell}>Date:</td>
            <td className={styles.cell}>-Dry thoroughly and cover with warm linen</td>
          </tr>
          <tr>
            <td className={styles.cell}>Time of Delivery:</td>
            <td className={styles.cell}>-Skin to skin contact with mother</td>
          </tr>
          <tr>
            <td className={`${styles.cell} ${styles.indent}`}>o CS 2° to <U w="28mm" /></td>
            <td className={styles.cell}>-Initiate breastfeeding as tolerated</td>
          </tr>
          <tr>
            <td className={`${styles.cell} ${styles.indent}`}>o NSVD</td>
            <td className={styles.cell}>-Keep thermo-regulated</td>
          </tr>
          <tr>
            <td className={`${styles.cell} ${styles.indent}`}>o Breech <U w="22mm" /></td>
            <td className={styles.cell}></td>
          </tr>
          <tr>
            <td className={styles.cell}><span className={styles.bold}>APGAR Score:</span></td>
            <td className={styles.cell}>-Pls. admit patient</td>
          </tr>
          <tr>
            <td className={styles.cell}>1min<U w="28mm" /> 5min<U w="28mm" /></td>
            <td className={styles.cell}>-Secure consent to care</td>
          </tr>
          <tr>
            <td className={styles.cell}></td>
            <td className={`${styles.cell} ${styles.indent}`}>o Bed in with mother</td>
          </tr>
          <tr>
            <td className={styles.cell}><span className={styles.bold}>BIRTH WEIGHT:<U w="10mm" />kg.</span></td>
            <td className={styles.cell}>-Vital signs every 4 hours</td>
          </tr>
          <tr>
            <td className={`${styles.cell} ${styles.indent}`}>o AGA &nbsp;o LGA &nbsp;o SGA</td>
            <td className={styles.cell}>-Breastfeeding per demand</td>
          </tr>
          <tr>
            <td className={styles.cell}></td>
            <td className={styles.cell}>-Diagnostics</td>
          </tr>
          <tr>
            <td className={styles.cell}><span className={styles.bold}>BALLARD SCORE:<U w="10mm" />weeks</span></td>
            <td className={`${styles.cell} ${styles.indent}`}>o NBS post 24 hours of life</td>
          </tr>
          <tr>
            <td className={styles.cell}>o Term &nbsp;o Pre-term &nbsp;o Post-term</td>
            <td className={`${styles.cell} ${styles.indent}`}>o Hearing test</td>
          </tr>
          <tr>
            <td className={styles.cell}></td>
            <td className={`${styles.cell} ${styles.indent}`}>o Others:</td>
          </tr>
          <tr>
            <td className={styles.cell}><span className={styles.bold}>o Male &nbsp;&nbsp;&nbsp;o Female</span></td>
            <td className={`${styles.cell} ${styles.indent}`}>o Hearing test</td>
          </tr>
          <tr>
            <td className={styles.cell}></td>
            <td className={styles.cell}>-Routine Newborn Care</td>
          </tr>
          <tr>
            <td className={styles.cell}>o Meconium-stained AF<U w="18mm" /></td>
            <td className={`${styles.cell} ${styles.indent}`}>o CREDE's Prophylaxis OU</td>
          </tr>
          <tr>
            <td className={styles.cell}>o Cord Coil<U w="18mm" /></td>
            <td className={`${styles.cell} ${styles.indent}`}>o Vitamin K 1mg IM now</td>
          </tr>
          <tr>
            <td className={styles.cell}>o LMP<U w="18mm" /></td>
            <td className={`${styles.cell} ${styles.indent}`}>o Hepatitis B 0.5cc IM now</td>
          </tr>
          <tr>
            <td className={styles.cell}></td>
            <td className={`${styles.cell} ${styles.indent}`}>o BCG 0.05cc Right Deltoid ID</td>
          </tr>
          <tr>
            <td className={styles.cell}></td>
            <td className={styles.cell}>-Daily Cord Care</td>
          </tr>
          <tr>
            <td className={styles.cell}><span className={styles.bold}>Maternal co-morbidities:</span></td>
            <td className={styles.cell}>-Keep thermoregulated bet. 36.5°C-37.5°C at all times</td>
          </tr>
          <tr>
            <td className={styles.cell}>RBOW<U w="18mm" />Hrs.</td>
            <td className={styles.cell}>-Monitor I & O q shift</td>
          </tr>
          <tr>
            <td className={`${styles.cell} ${styles.indent}`}>o UTI</td>
            <td className={styles.cell}>-Refer accordingly</td>
          </tr>
          <tr>
            <td className={`${styles.cell} ${styles.indent}`}>o GDM</td>
            <td className={styles.cell}></td>
          </tr>
          <tr>
            <td className={`${styles.cell} ${styles.indent}`}>o HPN</td>
            <td className={styles.cell}></td>
          </tr>
          <tr>
            <td className={styles.cell}>o Others:<U w="18mm" /></td>
            <td className={styles.cell}></td>
          </tr>
        </tbody>
      </table>

      {/* ── Patient info ── */}
      <div className={styles.patientInfoGrid}>
        <div className={styles.patientInfoRow}>
          <div className={styles.patientInfoCell}>
            <span className={styles.infoLabel}>Hospital No.:</span>&nbsp;{hospitalNo}
          </div>
          <div className={styles.patientInfoCell}>
            <span className={styles.infoLabel}>Case Number:</span>&nbsp;{caseNo}
          </div>
        </div>
        <div className={styles.patientInfoRow}>
          <div className={styles.patientInfoCell}>
            <span className={styles.infoLabel}>Patient Name:</span>&nbsp;{name}
          </div>
          <div className={styles.patientInfoCell}>
            <span className={styles.infoLabel}>Sex:</span>&nbsp;{sex}&nbsp;&nbsp;&nbsp;
            <span className={styles.infoLabel}>Age:</span>&nbsp;{age}
          </div>
        </div>
      </div>

    </div>
  );
}
