import { useMemo } from "react";
import "./LaboratoryResults.css";

export default function LaboratoryResults({ patientName, patientData }) {
  const name   = patientName             || "";
  const caseNo = patientData?.caseNo     || "";
  const hospNo = patientData?.hospitalNo || "";
  const sex    = patientData?.sex        || "";
  const age    = patientData?.age        || "";

  const infoFields = [
    { label: "Case No.",       value: caseNo },
    { label: "Hospital No.",   value: hospNo },
    { label: "Patient's Name", value: name   },
    { label: "Sex",            value: sex    },
    { label: "Age",            value: age    },
  ];

  return (
    <div className="lr-page">
      <br />
      <table className="lr-lines-table">
        <tbody>
          {Array.from({ length: 21 }).map((_, i) => (
            <tr key={i}><td /></tr>
          ))}
        </tbody>
      </table>

      {/* ── Attach label ── */}
      <div className="lr-attach-label">
        (ATTACH LABORATORY RESULTS CHRONOLOGICALLY)
      </div>

      {/* ── Patient info ── */}
      <div className="lr-info-block">
        {infoFields.map((f, i) => (
          <div key={i} className="lr-info-row">
            <span className="lr-info-label">{f.label}</span>
            <span className="lr-info-colon">:</span>
            <span className="lr-info-value">{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}