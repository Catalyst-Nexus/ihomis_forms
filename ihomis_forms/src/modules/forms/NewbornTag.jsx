import { useMemo } from "react";
import "./NewbornTag.css";

export default function NewbornTag({ patientName, patientData }) {
  const name       = patientName             || "";
  const hospitalNo = patientData?.hospitalNo || "";
  const weight     = patientData?.weight     || "";
  const dob        = patientData?.dob        || "";

  return (
    <div className="nbt-page">
      <br />
      <div className="nbt-tag-block">
        <div className="nbt-tag-left">
          <span className="nbt-hospital-no">{hospitalNo}</span>
          <span className="nbt-patient-name">{name}</span>
          <span className="nbt-db-line">DB: {dob}</span>
        </div>

        {/* Right: Weight */}
        <div className="nbt-tag-right">
          W:{weight}
        </div>
      </div>
    </div>
  );
}