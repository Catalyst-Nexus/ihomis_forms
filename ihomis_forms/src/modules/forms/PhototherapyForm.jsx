import { useMemo } from "react";
import "./PhototherapyForm.css";

export default function PhototherapyForm({ patientName, patientData }) {
  const hospitalNumber = patientData?.hospitalNumber || "";
  const caseNumber     = patientData?.caseNumber     || "";
  const name           = patientName                 || "";
  const dateOfBirth    = patientData?.dateOfBirth    || "";
  const rows           = patientData?.rows           || [];

  const ROW_COUNT = 21;
  const tableRows = Array.from({ length: ROW_COUNT }, (_, i) => rows[i] || {});

  const TableBlock = () => (
    <table className="pt-table">
      <thead>
        <tr>
          <th className="pt-col-date">DATE</th>
          <th className="pt-col-hours"># OF HOURS</th>
          <th className="pt-col-nod">NOD</th>
        </tr>
      </thead>
      <tbody>
        {tableRows.map((row, i) => (
          <tr key={i}>
            <td>{row.date  || ""}</td>
            <td>{row.hours || ""}</td>
            <td>{row.nod   || ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="pt-page">
      <br />
      <div className="pt-header">
        <div className="pt-header-left">
          <div className="pt-header-row">
            <strong>Hospital No.:</strong>&nbsp;{hospitalNumber}
          </div>
          <div className="pt-header-row">
            <strong>NAME:</strong>&nbsp;{name}
          </div>
        </div>
        <div className="pt-header-mid">
          <div className="pt-header-row">
            <strong>Case Number:</strong>&nbsp;{caseNumber}
          </div>
          <div className="pt-header-row">
            <strong>DATE OF BIRTH:</strong>&nbsp;{dateOfBirth}
          </div>
        </div>
      </div>

      {/* ── Two-column table layout ── */}
      <div className="pt-columns">
        <div className="pt-col-block">
          <TableBlock />
        </div>
        <div className="pt-col-gap" />
        <div className="pt-col-block">
          <TableBlock />
        </div>
      </div>

    </div>
  );
}