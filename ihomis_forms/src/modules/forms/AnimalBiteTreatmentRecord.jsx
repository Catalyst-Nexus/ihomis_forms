import { useMemo } from "react";
import "./AnimalBiteTreatmentRecord.css";

export default function AnimalBiteTreatmentRecord({ patientName, patientData }) {
	const name        = patientName              || "SALUCANAN , NELLY JEAN LOFRANCO";
	const hospitalNo  = patientData?.hospitalNo  || "000000000021386";
	const caseNum     = patientData?.caseNum     || "ADM-2026-010707";
	const address     = patientData?.address     || "P-1E, AMPAYON, BUTUAN CITY (Capital), AGUSAN DEL NORTE";
	const telNo       = patientData?.telNo       || "09852299137";
	const sex         = patientData?.sex         || "F";
	const civilStatus = patientData?.civilStatus || "M";
	const birthdate   = patientData?.birthdate   || "July 27, 1993";
	const age         = patientData?.age         || "32 year(s)";
	const birthPlace  = patientData?.birthPlace  || "Unknown";
	const nationality = patientData?.nationality || "FILIPINO";
	const religion    = patientData?.religion    || "Catholic";
	const occupation  = patientData?.occupation  || "";
	const indigenous  = patientData?.indigenous  || "";
	const srCitizen   = patientData?.srCitizen   || "";
	const physician   = patientData?.physician   || "JANNETTE A. DEANG, RN";
	const licenseNo   = patientData?.licenseNo   || "LICENSE # 0251759";

	const { generatedOn } = useMemo(() => {
		const now = new Date();
		const pad = (n) => String(n).padStart(2, "0");
		const h = now.getHours();
		const m = now.getMinutes();
		const ampm = h >= 12 ? "am" : "am";
		const hh = String(h % 12 || 12).padStart(2, "0");
		const timeStr = `${hh}:${pad(m)} ${ampm}`;
		const generatedOn = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${timeStr}`;
		return { generatedOn };
	}, []);

	const UL = ({ width = "120px" }) => (
		<span className="abtr-ul" style={{ width }} />
	);

	const vacRows = [
		{ label: "Day 0" },
		{ label: "Day 3" },
		{ label: "Day 7" },
		{ label: "Day 28" },
		{ label: "Booster 1" },
		{ label: "Booster 2", showPhysician: true },
		{ label: "ERIG ___.5 ml" },
		{ label: "HRIG ___ ml" },
		{ label: "Tetanus toxoid" },
		{ label: "ATS" },
		{ label: "Tetagam/HTIG" },
	];

	return (
		<div className="abtr-page">

			{/* ══════════════════════════════
			    ROW 1: Title + Case No
			    ══════════════════════════════ */}
			<div className="abtr-outer-box">

				{/* Title row */}
				<div className="abtr-row abtr-title-row">
					<div className="abtr-title-left">
						<h2 className="abtr-title">Animal Bite Treatment Record</h2>
					</div>
					<div className="abtr-title-right">
						<span className="abtr-lbl">CASE NO.: </span>
						<span className="abtr-val">{caseNum}</span>
					</div>
				</div>

				{/* Row: SR. CITIZEN NO. | HOSPITAL NO. */}
				<div className="abtr-row abtr-row-2col">
					<div className="abtr-cell abtr-cell-half">
						<span className="abtr-lbl">SR. CITIZEN NO.: </span>
						<span className="abtr-val">{srCitizen}</span>
					</div>
					<div className="abtr-cell abtr-cell-half abtr-border-left">
						<span className="abtr-lbl">HOSPITAL NO.: </span>
						<span className="abtr-val">{hospitalNo}</span>
					</div>
				</div>

				{/* Row: PATIENT NAME | PHIC ID */}
				<div className="abtr-row abtr-row-2col">
					<div className="abtr-cell abtr-cell-half abtr-cell-tall">
						<div><span className="abtr-lbl">PATIENT NAME: </span><span className="abtr-val">{name}</span></div>
					</div>
					<div className="abtr-cell abtr-cell-half abtr-border-left abtr-cell-tall">
						<div style={{ display: "flex", alignItems: "flex-end", gap: "4px" }}>
							<span className="abtr-lbl">PHIC ID:</span>
							<UL width="170px" />
						</div>
						<div className="abtr-phic-row">
							<span className="abtr-val">( &nbsp;) Member &nbsp;&nbsp;( &nbsp;) Dependent</span>
						</div>
					</div>
				</div>

				{/* Row: PERMANENT ADDRESS | TEL | SEX | CIVIL STATUS */}
				<div className="abtr-row abtr-row-4col">
					<div className="abtr-cell abtr-cell-addr abtr-cell-tall">
						<div><span className="abtr-lbl">PERMANENT ADDRESS</span></div>
						<div><span className="abtr-val">{address}</span></div>
					</div>
					<div className="abtr-cell abtr-cell-tel abtr-border-left abtr-cell-tall">
						<div><span className="abtr-lbl">TEL.NO./CP NO.</span></div>
						<div><span className="abtr-val">{telNo}</span></div>
					</div>
					<div className="abtr-cell abtr-cell-sex abtr-border-left abtr-cell-tall">
						<div><span className="abtr-lbl">Sex</span></div>
						<div><span className="abtr-val">{sex}</span></div>
					</div>
					<div className="abtr-cell abtr-cell-civil abtr-border-left abtr-cell-tall">
						<div><span className="abtr-lbl">Civil Status</span></div>
						<div><span className="abtr-val">{civilStatus}</span></div>
					</div>
				</div>

				{/* Row: BIRTHDATE | AGE | BIRTH PLACE | NATIONALITY | RELIGION | OCCUPATION | INDIGENOUS */}
				<div className="abtr-row abtr-row-7col">
					{[
						{ label: "BIRTHDATE",    value: birthdate },
						{ label: "Age",           value: age },
						{ label: "BIRTH PLACE",   value: birthPlace },
						{ label: "NATIONALITY",   value: nationality },
						{ label: "RELIGION",      value: religion },
						{ label: "OCCUPATION",    value: occupation },
						{ label: "INDIGENOUS",    value: indigenous },
					].map((col, i) => (
						<div key={i} className={`abtr-cell abtr-cell-7 ${i > 0 ? "abtr-border-left" : ""}`}>
							<div className="abtr-th-lbl">{col.label}</div>
							<div className="abtr-val">{col.value}</div>
						</div>
					))}
				</div>

			</div>{/* end abtr-outer-box */}

			{/* ══════════════════════════════
			    CLINICAL SECTION
			    ══════════════════════════════ */}
			<div className="abtr-clinical">

				{/* Exposure Category + Dates */}
				<div className="abtr-exp-dates-row">
					<div className="abtr-exp-left">
						<span className="abtr-lbl">Exposure Category: </span>
						<span className="abtr-val">( &nbsp;)I &nbsp;&nbsp;( &nbsp;)II &nbsp;&nbsp;( &nbsp;)III</span>
					</div>
					<div className="abtr-exp-right">
						<div className="abtr-date-line">
							<span className="abtr-val">Date of Exposure:</span><UL width="150px" />
						</div>
						<div className="abtr-date-line">
							<span className="abtr-val">Date of Treatment:</span><UL width="150px" />
						</div>
					</div>
				</div>
                <br />


				{/* Two columns */}
				<div className="abtr-two-col">
					<div className="abtr-col">
						<p className="abtr-col-title"><strong>1. Mode of Animal Exposure</strong></p>
						{["Nibbling/licking of uncovered skin","Nibbling/licking of wound/broken skin","Scratch/Abrasion","Transdermal bite","Handling/ingestion of raw infected meat","Any combination of the above"].map((item, i) => (
							<div key={i} className="abtr-check-item">( &nbsp;) {item}</div>
						))}
					</div>
					<div className="abtr-col">
						<p className="abtr-col-title"><strong>2. Body Part Affected / Exposed to Animal Bite</strong></p>
						{["Head and/or Neck","other part of the body (L.Leg/R.Leg)","N/A (if by ingestion mode)"].map((item, i) => (
							<div key={i} className="abtr-check-item">( &nbsp;) {item}</div>
						))}
						<p className="abtr-col-item"><strong>3. Types of Animal:</strong> ( &nbsp;) Dog &nbsp;&nbsp;( &nbsp;) Others <UL width="60px" /></p>
						<p className="abtr-col-item"><strong>4. Past history of animal bite:</strong> ( &nbsp;) Yes &nbsp;&nbsp;( &nbsp;) No</p>
						<p className="abtr-col-item">If YES, Specify Date: <UL width="100px" /></p>
					</div>
				</div>
                <br />

				<p className="abtr-item5">
					<strong>5. Based on item no.3 was the PEP primary immunization schedule complete ( &nbsp;) Yes &nbsp;&nbsp;( &nbsp;) No</strong>
				</p>
                <br />

				<div className="abtr-icd-row">
					<span className="abtr-val">ICD Code</span>
					<UL width="110px" />
				</div>
                <br />

			</div>

			{/* ══════════════════════════════
			    VACCINATION TABLE
			    ══════════════════════════════ */}
			<table className="abtr-vac-table">
				<thead>
					<tr>
						<th className="abtr-vth" colSpan={5}>Post-Exposure Vaccination Record</th>
					</tr>
					<tr>
						<th className="abtr-vth abtr-vcol-period">Period</th>
						<th className="abtr-vth abtr-vcol-route">Adm. Route</th>
						<th className="abtr-vth abtr-vcol-date">Date</th>
						<th className="abtr-vth abtr-vcol-given">Given</th>
						<th className="abtr-vth abtr-vcol-sig">Signature</th>
					</tr>
				</thead>
				<tbody>
					{vacRows.map((row, i) => (
						<tr key={i} className="abtr-vtr">
							<td className="abtr-vtd abtr-vcol-period">{row.label}</td>
							<td className="abtr-vtd abtr-vcol-route" />
							<td className="abtr-vtd abtr-vcol-date" />
							<td className="abtr-vtd abtr-vcol-given" />
							{i === 0 && (
								<td className="abtr-vtd abtr-vcol-sig" rowSpan={vacRows.length}>
									<div className="abtr-physician">
										<div>{physician}</div>
										<div>{licenseNo}</div>
									</div>
								</td>
							)}
						</tr>
					))}
				</tbody>
			</table>

			{/* Footer */}
			<div className="abtr-footer">
				Generated by: TCP T. TCP on {generatedOn}
			</div>

		</div>
	);
}