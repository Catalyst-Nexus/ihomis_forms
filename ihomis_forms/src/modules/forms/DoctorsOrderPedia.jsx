import { useMemo } from "react";
import "./DoctorsOrderPedia.css";

export default function DoctorsOrderPedia({ patientName, patientData }) {
  const name       = patientName             || "SALUCANA , NELLY JEAN LOFRANCO";
  const hospitalNo = patientData?.hospitalNo || "000000000021386";
  const caseNo     = patientData?.caseNo     || "ADM-2026-010707";
  const sex        = patientData?.sex        || "F";
  const age        = patientData?.age        || "32";

  const { generatedOn } = useMemo(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const h = now.getHours();
    const m = now.getMinutes();
    const hh = String(h % 12 || 12).padStart(2, "0");
    const ampm = h < 12 ? "am" : "pm";
    const generatedOn = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${hh}:${pad(m)} ${ampm}`;
    return { generatedOn };
  }, []);

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
    <div className="dop-page">
      <br />
      <table className="dop-table">
        <thead>
          <tr>
            <th className="dop-col-left">PROGRESS NOTES</th>
            <th className="dop-col-right">DOCTOR'S ORDER</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="dop-cell">Date:</td>
            <td className="dop-cell">-Dry thoroughly and cover with warm linen</td>
          </tr>
          <tr>
            <td className="dop-cell">Time of Delivery:</td>
            <td className="dop-cell">-Skin to skin contact with mother</td>
          </tr>
          <tr>
            <td className="dop-cell dop-indent">o CS 2° to <U w="28mm" /></td>
            <td className="dop-cell">-Initiate breastfeeding as tolerated</td>
          </tr>
          <tr>
            <td className="dop-cell dop-indent">o NSVD</td>
            <td className="dop-cell">-Keep thermo-regulated</td>
          </tr>
          <tr>
            <td className="dop-cell dop-indent">o Breech <U w="22mm" /></td>
            <td className="dop-cell"></td>
          </tr>
          <tr>
            <td className="dop-cell"><span className="dop-bold">APGAR Score:</span></td>
            <td className="dop-cell">-Pls. admit patient</td>
          </tr>
          <tr>
            <td className="dop-cell">1min<U w="28mm" /> 5min<U w="28mm" /></td>
            <td className="dop-cell">-Secure consent to care</td>
          </tr>
          <tr>
            <td className="dop-cell"></td>
            <td className="dop-cell dop-indent">o Bed in with mother</td>
          </tr>
          <tr>
            <td className="dop-cell"><span className="dop-bold">BIRTH WEIGHT:<U w="10mm" />kg.</span></td>
            <td className="dop-cell">-Vital signs every 4 hours</td>
          </tr>
          <tr>
            <td className="dop-cell dop-indent">o AGA &nbsp;o LGA &nbsp;o SGA</td>
            <td className="dop-cell">-Breastfeeding per demand</td>
          </tr>
          <tr>
            <td className="dop-cell"></td>
            <td className="dop-cell">-Diagnostics</td>
          </tr>
          <tr>
            <td className="dop-cell"><span className="dop-bold">BALLARD SCORE:<U w="10mm" />weeks</span></td>
            <td className="dop-cell dop-indent">o NBS post 24 hours of life</td>
          </tr>
          <tr>
            <td className="dop-cell">o Term &nbsp;o Pre-term &nbsp;o Post-term</td>
            <td className="dop-cell dop-indent">o Hearing test</td>
          </tr>
          <tr>
            <td className="dop-cell"></td>
            <td className="dop-cell dop-indent">o Others:</td>
          </tr>
          <tr>
            <td className="dop-cell"><span className="dop-bold">o Male &nbsp;&nbsp;&nbsp;o Female</span></td>
            <td className="dop-cell dop-indent">o Hearing test</td>
          </tr>
          <tr>
            <td className="dop-cell"></td>
            <td className="dop-cell">-Routine Newborn Care</td>
          </tr>
          <tr>
            <td className="dop-cell">o Meconium-stained AF<U w="18mm" /></td>
            <td className="dop-cell dop-indent">o CREDE's Prophylaxis OU</td>
          </tr>
          <tr>
            <td className="dop-cell">o Cord Coil<U w="18mm" /></td>
            <td className="dop-cell dop-indent">o Vitamin K 1mg IM now</td>
          </tr>
          <tr>
            <td className="dop-cell">o LMP<U w="18mm" /></td>
            <td className="dop-cell dop-indent">o Hepatitis B 0.5cc IM now</td>
          </tr>
          <tr>
            <td className="dop-cell"></td>
            <td className="dop-cell dop-indent">o BCG 0.05cc Right Deltoid ID</td>
          </tr>
          <tr>
            <td className="dop-cell"></td>
            <td className="dop-cell">-Daily Cord Care</td>
          </tr>
          <tr>
            <td className="dop-cell"><span className="dop-bold">Maternal co-morbidities:</span></td>
            <td className="dop-cell">-Keep thermoregulated bet. 36.5°C-37.5°C at all times</td>
          </tr>
          <tr>
            <td className="dop-cell">RBOW<U w="18mm" />Hrs.</td>
            <td className="dop-cell">-Monitor I &amp; O q shift</td>
          </tr>
          <tr>
            <td className="dop-cell dop-indent">o UTI</td>
            <td className="dop-cell">-Refer accordingly</td>
          </tr>
          <tr>
            <td className="dop-cell dop-indent">o GDM</td>
            <td className="dop-cell"></td>
          </tr>
          <tr>
            <td className="dop-cell dop-indent">o HPN</td>
            <td className="dop-cell"></td>
          </tr>
          <tr>
            <td className="dop-cell">o Others:<U w="18mm" /></td>
            <td className="dop-cell"></td>
          </tr>
        </tbody>
      </table>

      {/* ── Patient info ── */}
      <div className="dop-patient-info-grid">
        <div className="dop-patient-info-row">
          <div className="dop-patient-info-cell">
            <span className="dop-info-label">Hospital No.:</span>&nbsp;{hospitalNo}
          </div>
          <div className="dop-patient-info-cell">
            <span className="dop-info-label">Case Number:</span>&nbsp;{caseNo}
          </div>
        </div>
        <div className="dop-patient-info-row">
          <div className="dop-patient-info-cell">
            <span className="dop-info-label">Patient Name:</span>&nbsp;{name}
          </div>
          <div className="dop-patient-info-cell">
            <span className="dop-info-label">Sex:</span>&nbsp;{sex}&nbsp;&nbsp;&nbsp;
            <span className="dop-info-label">Age:</span>&nbsp;{age}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="dop-footer">
        Generated by: TCP T. TCP on {generatedOn}
      </div>

    </div>
  );
}