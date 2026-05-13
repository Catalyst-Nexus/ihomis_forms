import { useMemo } from "react";
import "./IVFSheet.css";

export default function IVFSheet({ patientName, patientData }) {
  const name       = patientName            || "";
  const hospitalNo = patientData?.hospitalNo || "";
  const sex        = patientData?.sex       || "";
  const age        = patientData?.age       || "";
  const caseNo     = patientData?.caseNo    || "";

  const ROWS = 23;

  const headers = [
    { label: "Date",              cls: "ivf-col-date"    },
    { label: "BOT. NO.",          cls: "ivf-col-bot"     },
    { label: "NAME OF IVF",       cls: "ivf-col-name"    },
    { label: "INCORPO-\nRATION",  cls: "ivf-col-incorp"  },
    { label: "FLOW RATE",         cls: "ivf-col-flow"    },
    { label: "TIME",              cls: "ivf-col-time"    },
    { label: "REMARKS",           cls: "ivf-col-remarks" },
    { label: "SIGNATURE",         cls: "ivf-col-sig"     },
  ];

  return (
    <div className="ivf-page">
      <br />
      <table className="ivf-table">
        <colgroup>
          {headers.map((h, i) => (
            <col key={i} className={h.cls} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>
                {h.label.split("\n").map((line, j) => (
                  <span key={j}>{line}{j < h.label.split("\n").length - 1 && <br />}</span>
                ))}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: ROWS }).map((_, i) => (
            <tr key={i}>
              {headers.map((_, j) => <td key={j} />)}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Patient info ── */}
      <div className="ivf-patient-info">
        <div className="ivf-info-row">
          <span className="ivf-info-label">Hospital No.:</span>
          <span className="ivf-info-value">{hospitalNo}</span>
        </div>
        <div className="ivf-info-row">
          <span className="ivf-info-label">Patient Name:</span>
          <span className="ivf-info-value">{name}</span>
        </div>
        <div className="ivf-info-row">
          <span className="ivf-info-label">Sex:</span>
          <span className="ivf-info-value">{sex}</span>
        </div>
        <div className="ivf-info-row">
          <span className="ivf-info-label">Age:</span>
          <span className="ivf-info-value">{age}</span>
        </div>
        <div className="ivf-info-row">
          <span className="ivf-info-label">Case Number:</span>
          <span className="ivf-info-value">&nbsp;&nbsp;{caseNo}</span>
        </div>
      </div>
    </div>
  );
}