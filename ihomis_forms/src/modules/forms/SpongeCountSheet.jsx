import { useMemo } from "react";
import "./SpongeCountSheet.css";

export default function SpongeCountSheet({ patientName, patientData }) {
  const caseNumber  = patientData?.caseNumber  || "ADM-2026-010651";
  const name        = patientName              || "BAYSA , BABY BOY";
  const department  = patientData?.department  || "";
  const date        = patientData?.date        || "";
  const age         = patientData?.age         || "1 hour(s)";
  const sex         = patientData?.sex         || "M";
  const anesthesia  = patientData?.anesthesia  || "";
  const surgeon     = patientData?.surgeon     || "";
  const anesthesiologist = patientData?.anesthesiologist || "";
  const operation   = patientData?.operation   || "";

  const { generatedOn } = useMemo(() => {
    const now  = new Date();
    const pad  = (n) => String(n).padStart(2, "0");
    const h    = now.getHours();
    const hh   = String(h % 12 || 12).padStart(2, "0");
    const ampm = h < 12 ? "am" : "pm";
    return {
      generatedOn: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${hh}:${pad(now.getMinutes())} ${ampm}`,
    };
  }, []);

  const SPONGES = [
    "OS 4X8",
    "Visceral/Square Pack",
    "Vaginal Pack/ Uterine Strip",
    "Peanut Balls",
    "OS 4X4",
  ];

  const INSTRUMENTS = [
    "Ovum Forceps",
    "Needle Holder",
    "Mixter",
    "Babcock",
    "Allis",
    "Kocker's forceps, Straight",
    "Kocker's forceps, Curve",
    "Peans forceps, Straight",
    "Peans forceps, Curve",
    "Kelly forceps, Curve",
    "Tower Clips",
    "Tissue Forceps w/ Teeth",
    "Tissue Forceps w/o Teeth",
    "Blade Holder #3",
    "Blade Holder #4",
    "Mayo Scissor Curve",
    "Metz Scissor Curve",
    "Heany forceps, Straight",
    "Heany forceps, Curve",
  ];

  const ADDITIONAL_COUNT = 6;
  const RETRACTORS_COUNT = 5;

  const EmptyRow = ({ label, bold }) => (
    <tr>
      <td className={bold ? "scs-kind-bold" : "scs-kind"}>{label}</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  );

  return (
    <div className="scs-page">

      {/* ── Case Number ── */}
      <div className="scs-case-row">
        <strong>Case Number:</strong>&nbsp;&nbsp;{caseNumber}
      </div>

      {/* ── Header Table ── */}
      <table className="scs-header-table">
        <tbody>
          <tr>
            <td className="scs-hl">Name:</td>
            <td className="scs-hv scs-name-val">{name}</td>
            <td className="scs-hl">Department:</td>
            <td className="scs-hv">{department}</td>
            <td className="scs-hl">Date:</td>
            <td className="scs-hv scs-date-val">{date}</td>
          </tr>
          <tr>
            <td className="scs-hl">Age:</td>
            <td className="scs-hv">{age}</td>
            <td className="scs-hl">Sex:</td>
            <td className="scs-hv">{sex}</td>
            <td className="scs-hl">Anesthesia</td>
            <td className="scs-hv"></td>
          </tr>
          <tr>
            <td className="scs-hl">Surgeon:</td>
            <td className="scs-hv" colSpan={2}>{surgeon}</td>
            <td className="scs-hl">Anesthesiologist:</td>
            <td className="scs-hv" colSpan={2}>{anesthesiologist}</td>
          </tr>
          <tr>
            <td className="scs-hl">Operation Performed</td>
            <td className="scs-hv" colSpan={5}>{operation}</td>
          </tr>
        </tbody>
      </table>

      {/* ── Main Count Table ── */}
      <table className="scs-main-table">
        <thead>
          <tr>
            <th className="scs-col-kind">KIND OF SPONGE</th>
            <th className="scs-col-init">INITIAL</th>
            <th className="scs-col-add">ADDITIONAL</th>
            <th className="scs-col-total">TOTAL</th>
            <th className="scs-col-first">1st COUNT</th>
            <th className="scs-col-final">FINAL COUNT</th>
          </tr>
        </thead>
        <tbody>

          {/* Sponges */}
          {SPONGES.map((s, i) => <EmptyRow key={`s-${i}`} label={s} />)}

          {/* INSTRUMENTS header row */}
          <tr>
            <td className="scs-section-hdr" colSpan={6}><em><strong>INSTRUMENTS</strong></em></td>
          </tr>

          {/* Instruments */}
          {INSTRUMENTS.map((inst, i) => <EmptyRow key={`i-${i}`} label={inst} />)}

          {/* Additional header */}
          <tr>
            <td className="scs-kind scs-bold-label" colSpan={6}><strong>Additional</strong></td>
          </tr>
          {Array.from({ length: ADDITIONAL_COUNT }, (_, i) => (
            <EmptyRow key={`a-${i}`} label={`${i + 1}.`} />
          ))}

          {/* RETRACTORS header row */}
          <tr>
            <td className="scs-section-hdr" colSpan={6}><em><strong>RETRACTORS:</strong></em></td>
          </tr>
          {Array.from({ length: RETRACTORS_COUNT }, (_, i) => (
            <EmptyRow key={`r-${i}`} label={`${i + 1}.`} />
          ))}

        </tbody>
      </table>

      {/* ── Verification Block ── */}
      <br />
      <div className="scs-verify-block">
        <div className="scs-verify-left">
          <div>Verified and Actually Counter by:</div>
          <div className="scs-verify-line-row">
            Time Verified:&nbsp;<span className="scs-underline-sm"></span>
          </div>
        </div>
        <div className="scs-verify-right">
          <div>Sponge Count Verified by:</div>
          <div className="scs-verify-line-row">
            Time Verified:&nbsp;<span className="scs-underline-sm"></span>
          </div>
        </div>
      </div>

      {/* ── Signature Lines ── */}
      <br />
      <div className="scs-sig-row">
        <div className="scs-sig-block">
          <div className="scs-sig-line" />
          <div className="scs-sig-label">CIRCULATING NURSE</div>
        </div>
        <div className="scs-sig-block">
          <div className="scs-sig-line" />
          <div className="scs-sig-label">SCRUB NURSE</div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="scs-footer form-footer">
        Generated by: TCP T. TCP on {generatedOn}
      </div>

    </div>
  );
}