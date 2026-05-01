import "./ApgarScoring.css";

const formatGeneratedOn = (date = new Date()) => {
  const pad = (value) => String(value).padStart(2, "0");
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  const hour12 = String(hours % 12 || 12).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${hour12}:${pad(minutes)} ${ampm}`;
};

export default function ApgarScoring({ babyName, babyData = {} }) {
  const caseNum = babyData.caseNum || babyData.caseNo || "";
  const babyDisplayName = babyName || babyData.patientName || babyData.fullName || "";
  const babySex = babyData.sex || "";
  const babyAge = babyData.age || "";
  const motherName =
    babyData.motherName ||
    babyData.mothersName ||
    babyData.motherFullName ||
    "";
  const motherSex = babyData.motherSex || "";
  const hospitalNo =
    babyData.hospitalNo || babyData.hospNo || babyData.hospitalNumber || "";
  const address = babyData.address || babyData.completeAddress || "";
  const deliveryType = babyData.deliveryType || "";
  const obstetrician = babyData.obstetrician || "";
  const anesthesia = babyData.anesthesia || "";
  const anesthesiologist = babyData.anesthesiologist || "";
  const generatedOn = babyData.generatedOn || formatGeneratedOn();

  return (
    <div className="a4-page">

      {/* Header replaced with spacer */}
      <div className="header-spacer" />

     
    <br></br>
      {/* Case Number */}
      <div className="case-number-row">
        <strong>Case Number:</strong>&nbsp; {caseNum}
      </div>

      {/* Patient Info Table */}
      <table className="info-table">
        <tbody>
          <tr>
            <td className="lbl">Baby's Name:</td>
            <td style={{ width: "42%" }}>{babyDisplayName}</td>
            <td className="lbl">Sex:</td>
            <td style={{ width: "8%", textAlign: "center" }}>{babySex}</td>
            <td className="lbl">Age:</td>
            <td style={{ width: "12%", textAlign: "center" }}>{babyAge}</td>
          </tr>
          <tr>
            <td className="lbl">Mother's Name:</td>
            <td style={{ textAlign: "center" }}>{motherName}</td>
            <td className="lbl">Sex:</td>
            <td
              colSpan={3}
              style={{ fontSize: "8pt", textAlign: "center", lineHeight: 1.4 }}
            >
              {motherSex}
            </td>
          </tr>
          <tr>
            <td className="lbl">Hospital No.</td>
            <td style={{ textAlign: "center" }}>{hospitalNo}</td>
            <td className="lbl">Complete Address:</td>
            <td colSpan={3} style={{ textAlign: "center" }}>
              {address}
            </td>
          </tr>
          <tr>
            <td className="lbl">Type of Delivery:</td>
            <td>{deliveryType}</td>
            <td className="lbl">Obstetrician:</td>
            <td colSpan={3}>{obstetrician}</td>
          </tr>
          <tr>
            <td className="lbl">Anesthesia:</td>
            <td>{anesthesia}</td>
            <td className="lbl">Anesthesiologist:</td>
            <td colSpan={3}>{anesthesiologist}</td>
          </tr>
        </tbody>
      </table>

      {/* Sign Reference Table */}
      <table className="sign-table">
        <thead>
          <tr>
            <th style={{ width: "18%" }}>SIGN</th>
            <th style={{ width: "18%" }}>0</th>
            <th style={{ width: "34%" }}>1</th>
            <th style={{ width: "30%" }}>2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Appearance</td>
            <td>Blue or pale</td>
            <td>Blue extremities, but torso is pink</td>
            <td>Completely pink</td>
          </tr>
          <tr>
            <td>Pulse</td>
            <td>Absent</td>
            <td>&lt;100</td>
            <td>&gt;100</td>
          </tr>
          <tr>
            <td>Grimace</td>
            <td>No response</td>
            <td>Weak grimace when stimulated</td>
            <td>Cries or pulls away when stimulated</td>
          </tr>
          <tr>
            <td>Activity</td>
            <td>None</td>
            <td>Some flexion of arms</td>
            <td>Arms flexed, legs resist extension</td>
          </tr>
          <tr>
            <td>Respiration</td>
            <td>Absent</td>
            <td>Weak, irregular or gasping</td>
            <td>Strong cry</td>
          </tr>
        </tbody>
      </table>

      {/* APGAR Scoring Table */}
      <table className="score-table">
        <thead>
          <tr>
            <th style={{ width: "25%" }}>APGAR</th>
            <th style={{ width: "25%" }}>1 MINUTE</th>
            <th style={{ width: "25%" }}>5 MINUTES</th>
            <th style={{ width: "25%" }}>10 MINUTES</th>
          </tr>
        </thead>
        <tbody>
          {["Appearance", "Pulse", "Grimace", "Activity", "Respiration"].map((sign) => (
            <tr key={sign}>
              <td>{sign}</td>
              <td className="blank-cell"></td>
              <td className="blank-cell"></td>
              <td className="blank-cell"></td>
            </tr>
          ))}
        </tbody>
      </table>
      <br />
      <br />
      <br />

      {/* Signature Footer */}
      <div className="footer-sig">
        <div className="sig-line" />
        <div className="sig-label">PEDIATRICIAN</div>
      </div>

      {/* Generated By */}
      <div className="generated-by">
        <em>Generated by: TCP T. TCP on {generatedOn}</em>
      </div>

    </div>
  );
}