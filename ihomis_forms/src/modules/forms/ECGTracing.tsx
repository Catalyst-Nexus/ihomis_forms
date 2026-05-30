import { useMemo } from "react";
import "./ECGTracing.css";

export default function ECGTracing({ patientName, patientData }) {
	const name       = patientName             || "";
	const age        = patientData?.age        || "";
	const sex        = patientData?.sex        || "";
	const caseNum    = patientData?.caseNum    || "";
	const hospitalNo = patientData?.hospitalNo || "";
	const address    = patientData?.address    || "";
	const pertinent  = patientData?.pertinent  || "";

	return (
		<div className="ecg-page">
			<br />
			<div className="ecg-header">
				<div className="ecg-row">
					<span className="ecg-lbl">Case Number:</span>
					<span className="ecg-val">&nbsp;&nbsp;{caseNum}</span>
				</div>

				{/* Row 2: Hospital No. (bold label) */}
				<div className="ecg-row">
					<span className="ecg-lbl">Hospital No.:</span>
					<span className="ecg-val">&nbsp;&nbsp;{hospitalNo}</span>
				</div>

				{/* Row 3: Patient Name | Age | Sex (normal labels) */}
				<div className="ecg-row ecg-row-inline">
					<div className="ecg-inline-cell ecg-cell-name">
						<span className="ecg-lbl-normal">Patient Name:</span>
						<span className="ecg-val">&nbsp;{name}</span>
					</div>
					<div className="ecg-inline-cell">
						<span className="ecg-lbl-normal">Age:</span>
						<span className="ecg-val">&nbsp;{age}</span>
					</div>
					<div className="ecg-inline-cell">
						<span className="ecg-lbl-normal">Sex:</span>
						<span className="ecg-val">&nbsp;{sex}</span>
					</div>
				</div>

				{/* Row 4: Address (normal label, no space before value) */}
				<div className="ecg-row">
					<span className="ecg-lbl-normal">Address:</span>
					<span className="ecg-val">{address}</span>
				</div>

			</div>

			{/* ── Large blank ECG tracing area ── */}
			<div className="ecg-tracing-area" />

			{/* ── Bottom: Pertinent Findings + Signature of Physician ── */}
			<div className="ecg-bottom">
				<p className="ecg-pertinent">
					<span className="ecg-lbl-normal">PERTINENT FINDINGS:</span>{pertinent}
				</p>
				<div className="ecg-sig-row">
					<span className="ecg-lbl-normal">Signature of Physician:</span>
					<span className="ecg-sig-line" />
				</div>
			</div>

		</div>
	);
}