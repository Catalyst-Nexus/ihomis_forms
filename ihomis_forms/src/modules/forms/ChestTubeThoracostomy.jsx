import { useMemo } from "react";
import "./ChestTubeThoracostomy.css";

export default function ChestTubeThoracostomy({ patientName, patientData }) {
  const name   = patientName             || "";
  const hospNo = patientData?.hospitalNo || "";
  const sex    = patientData?.sex        || "";
  const age    = patientData?.age        || "";
  const caseNo = patientData?.caseNo     || "";

  const columns = ["Date & Time", "Received", "End of Shift", "Output", "Signature"];

  return (
    <div className="ctt-page">

      {/* ── Main Table ── */}
      <table className="ctt-table">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 22 }).map((_, i) => (
            <tr key={i}>
              {columns.map((_, j) => (
                <td key={j} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Patient Info ── */}
      <div className="ctt-info-block">
        <div className="ctt-info-row">
          <span className="ctt-info-label">Hospital No.:</span>
          <span>{hospNo}</span>
        </div>
        <div className="ctt-info-row">
          <span className="ctt-info-label">Patient Name:</span>
          <span>{name}</span>
        </div>
        <div className="ctt-info-row">
          <span className="ctt-info-label">Sex:</span>
          <span>{sex}</span>
        </div>
        <div className="ctt-info-row">
          <span className="ctt-info-label">Age:</span>
          <span>{age}</span>
        </div>
        <div className="ctt-info-row">
          <span className="ctt-info-label">Case Number:</span>
          <span>{caseNo}</span>
        </div>
      </div>
    </div>
  );
}