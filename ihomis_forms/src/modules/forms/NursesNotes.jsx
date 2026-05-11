import { useMemo } from "react";
import "./NursesNotes.css";

export default function NursesNotes({ patientName, patientData }) {
  const caseNumber     = patientData?.caseNumber     || "";
  const hospitalNumber = patientData?.hospitalNumber || "";
  const name           = patientName                 || "";
  const sex            = patientData?.sex            || "";
  const age            = patientData?.age            || "";
  const room           = patientData?.room           || "";
  const rows           = patientData?.rows           || [];

  const ROW_COUNT = 27;
  const tableRows = Array.from({ length: ROW_COUNT }, (_, i) => rows[i] || {});

  return (
    <div className="nn-page">
      <br />
      <table className="nn-table">
        <thead>
          <tr>
            <th className="nn-col-date">Date</th>
            <th className="nn-col-time">Time</th>
            <th className="nn-col-focus">Focus</th>
            <th className="nn-col-dar">DAR</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, i) => (
            <tr key={i}>
              <td>{row.date  || ""}</td>
              <td>{row.time  || ""}</td>
              <td>{row.focus || ""}</td>
              <td>{row.dar   || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Patient Info Block (bottom) ── */}
      <div className="nn-info-block">
        <div><strong>Case No.:</strong> {caseNumber}</div>
        <div><strong>Hospital No.:</strong> {hospitalNumber}</div>
        <div><strong>Patient Name:</strong> {name}</div>
        <div><strong>Sex:</strong> {sex}</div>
        <div><strong>Age:</strong> {age}</div>
        <div><strong>Room No.:</strong> {room}</div>
      </div>

    </div>
  );
}