import { useMemo } from "react";
import "./RandomBloodSugar.css";

export default function RandomBloodSugar({ patientName, patientData }) {
  const name     = patientName           || "PELISCO , BABY GIRL";
  const address  = patientData?.address  || "P-1, MATABAO, BUENAVISTA, AGUSAN DEL NORTE";
  const age      = patientData?.age      || "1 hour(s)";
  const sex      = patientData?.sex      || "F";
  const ward     = patientData?.ward     || "No room assigned";
  const category = patientData?.category || "NEWBORN";
  const caseNum  = patientData?.caseNum  || "ADM-2026-010623";

  const { dateStr, generatedOn } = useMemo(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
    const pad = (n) => String(n).padStart(2, "0");
    const h = now.getHours(), m = now.getMinutes();
    const ampm = h >= 12 ? "pm" : "am";
    const hh = String(h % 12 || 12).padStart(2, "0");
    const timeStr = `${hh}:${pad(m)} ${ampm}`;
    const generatedOn = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${timeStr}`;
    return { dateStr, generatedOn };
  }, []);

  const ROW_COUNT = 14;

  return (
    <div className="rbs-page">

      {/* ── 15mm header space ── */}
      <div className="rbs-header-space" />

      {/* ── Case Number | Date ── */}
      <div className="rbs-top-row">
        <div className="rbs-case">
          <span className="rbs-lbl">Case Number:</span>
          <span className="rbs-val">&nbsp;{caseNum}</span>
        </div>
        <div className="rbs-date-right">
          <span className="rbs-lbl">Date:</span>
          <span className="rbs-val">&nbsp;{dateStr}</span>
        </div>
      </div>

      {/* ── Patient info block ── */}
      <div className="rbs-info-block">

        {/* Row 1: Name | Age / Sex */}
        <div className="rbs-info-row">
          <div className="rbs-info-left-cell">
            <span className="rbs-lbl">Name:</span>
            <span className="rbs-val">&nbsp;{name}</span>
          </div>
          <div className="rbs-info-right-cells">
            <span className="rbs-lbl">Age:</span>
            <span className="rbs-val">&nbsp;{age}</span>
            <span style={{ display: "inline-block", width: "10mm" }} />
            <span className="rbs-lbl">Sex:</span>
            <span className="rbs-val">&nbsp;{sex}</span>
          </div>
        </div>

        {/* Row 2: Ward | Category */}
        <div className="rbs-info-row">
          <div className="rbs-info-left-cell">
            <span className="rbs-lbl">Ward:</span>
            <span className="rbs-val">&nbsp;{ward}</span>
          </div>
          <div className="rbs-info-right-cells">
            <span className="rbs-lbl">Category:</span>
            <span className="rbs-val">&nbsp;{category}</span>
          </div>
        </div>

        {/* Row 3: Address | Case */}
        <div className="rbs-info-row">
          <div className="rbs-info-left-cell">
            <span className="rbs-lbl">Address:</span>
            <span className="rbs-val">&nbsp;{address}</span>
          </div>
          <div className="rbs-info-right-cells">
            <span className="rbs-lbl">Case:</span>
            <span className="rbs-ul" style={{ width: "28mm" }} />
          </div>
        </div>

        {/* Row 4: Requesting Physician */}
        <div className="rbs-info-row">
          <div className="rbs-info-left-cell rbs-req-row">
            <span className="rbs-lbl">Requesting Physician:</span>
            <span className="rbs-ul" style={{ width: "85mm" }} />
          </div>
        </div>

      </div>

      {/* ── Table ── */}
      <table className="rbs-table">
        <thead>
          <tr>
            <th className="rbs-th rbs-col-date">Date</th>
            <th className="rbs-th rbs-col-time">Time</th>
            <th className="rbs-th rbs-col-result">Result</th>
            <th className="rbs-th rbs-col-sig">Signature</th>
            <th className="rbs-th rbs-col-rem">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: ROW_COUNT }).map((_, i) => (
            <tr key={i} className="rbs-tr">
              <td className="rbs-td rbs-col-date" />
              <td className="rbs-td rbs-col-time" />
              <td className="rbs-td rbs-col-result">
                <div className="rbs-result-cell">
                  <span className="rbs-mgdl">mg/dl</span>
                </div>
              </td>
              <td className="rbs-td rbs-col-sig" />
              <td className="rbs-td rbs-col-rem" />
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Spacer ── */}
      <div className="rbs-spacer" />

      {/* ── Signature block ── */}
      <div className="rbs-sig-wrap">
        <div className="rbs-sig-block">
          <div className="rbs-sig-line" />
          <div className="rbs-sig-label">Pathologist</div>
          <div className="rbs-license-row">
            <span className="rbs-lbl">License No.</span>
            <span className="rbs-ul" style={{ width: "28mm" }} />
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="rbs-footer form-footer">
        <div className="rbs-footer-border" />
        <div className="rbs-footer-text">Generated by: TCP T. TCP on {generatedOn}</div>
      </div>

    </div>
  );
}