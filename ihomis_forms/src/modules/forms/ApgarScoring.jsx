import { useEffect, useState } from "react";
import { formatGeneratedOn } from "../../utils/dateFormatter";
import { mapApgarFormData } from "../../utils/apgarMapper";

import "./ApgarScoring.css";

export default function ApgarForm({ apiResponse }) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (!apiResponse) return;

    const mapped = mapApgarFormData(apiResponse);
    setFormData(mapped);
  }, [apiResponse]);

  // 🧠 DEBUG (remove later if needed)
  useEffect(() => {
    console.log("RAW API RESPONSE:", apiResponse);
    console.log("MAPPED FORM DATA:", formData);
  }, [apiResponse, formData]);

  if (!apiResponse) return <div>Waiting for API response...</div>;

  if (!formData || Object.keys(formData).length === 0) {
    return <div>No valid patient data found</div>;
  }

  const {
    caseNum,
    babyDisplayName,
    babySex,
    babyAge,
    motherName,
    motherSex,
    hospitalNo,
    address,
    deliveryType,
    obstetrician,
    anesthesia,
    anesthesiologist,
    generatedOn,
  } = formData;

  return (
    <div className="a4-page">

      {/* Header spacer */}
      <div className="header-spacer" />

      <br />

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
            <td colSpan={3} style={{ textAlign: "center" }}>
              {motherSex || "N/A"}
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
            <td>{anesthesia || "N/A"}</td>
            <td className="lbl">Anesthesiologist:</td>
            <td colSpan={3}>{anesthesiologist || "N/A"}</td>
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
            <td>Cries or pulls away</td>
          </tr>
          <tr>
            <td>Activity</td>
            <td>None</td>
            <td>Some flexion</td>
            <td>Active movement</td>
          </tr>
          <tr>
            <td>Respiration</td>
            <td>Absent</td>
            <td>Weak / irregular</td>
            <td>Strong cry</td>
          </tr>
        </tbody>
      </table>

      {/* APGAR Table */}
      <table className="score-table">
        <thead>
          <tr>
            <th>APGAR</th>
            <th>1 MIN</th>
            <th>5 MIN</th>
            <th>10 MIN</th>
          </tr>
        </thead>
        <tbody>
          {["Appearance", "Pulse", "Grimace", "Activity", "Respiration"].map(
            (sign) => (
              <tr key={sign}>
                <td>{sign}</td>
                <td className="blank-cell"></td>
                <td className="blank-cell"></td>
                <td className="blank-cell"></td>
              </tr>
            )
          )}
        </tbody>
      </table>

      <br />
      <br />
      <br />

      {/* Signature */}
      <div className="footer-sig">
        <div className="sig-line" />
        <div className="sig-label">PEDIATRICIAN</div>
      </div>

      {/* Footer */}
      <div className="generated-by">
        <em>Generated on {generatedOn}</em>
      </div>
    </div>
  );
}