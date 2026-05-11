import styles from "./AnimalBiteTreatmentRecord.module.css";

export default function AnimalBiteTreatmentRecord({ patientName, patientData }) {
	const name        = patientName              || "";
	const hospitalNo  = patientData?.hospitalNo  || "";
	const caseNum     = patientData?.caseNum     || "";
	const address     = patientData?.address     || "";
	const telNo       = patientData?.telNo       || "";
	const sex         = patientData?.sex         || "";
	const civilStatus = patientData?.civilStatus || "";
	const birthdate   = patientData?.birthdate   || "";
	const age         = patientData?.age         || "";
	const birthPlace  = patientData?.birthPlace  || "";
	const nationality = patientData?.nationality || "";
	const religion    = patientData?.religion    || "";
	const occupation  = patientData?.occupation  || "";
	const indigenous  = patientData?.indigenous  || "";
	const srCitizen   = patientData?.srCitizen   || "";
	const physician   = patientData?.physician   || "";
	const licenseNo   = patientData?.licenseNo   || "";

	const UL = ({ width = "120px" }) => (
		<span className={styles.ul} style={{ width }} />
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
		<div className={styles.page}>
			<div className={styles.outerBox}>

				{/* Title row */}
				<div className={`${styles.row} ${styles.titleRow}`}>
					<div className={styles.titleLeft}>
						<h2 className={styles.title}>Animal Bite Treatment Record</h2>
					</div>
					<div className={styles.titleRight}>
						<span className={styles.lbl}>CASE NO.: </span>
						<span className={styles.val}>{caseNum}</span>
					</div>
				</div>

				{/* Row: SR. CITIZEN NO. | HOSPITAL NO. */}
				<div className={`${styles.row} ${styles.row2Col}`}>
					<div className={`${styles.cell} ${styles.cellHalf}`}>
						<span className={styles.lbl}>SR. CITIZEN NO.: </span>
						<span className={styles.val}>{srCitizen}</span>
					</div>
					<div className={`${styles.cell} ${styles.cellHalf} ${styles.borderLeft}`}>
						<span className={styles.lbl}>HOSPITAL NO.: </span>
						<span className={styles.val}>{hospitalNo}</span>
					</div>
				</div>

				{/* Row: PATIENT NAME | PHIC ID */}
				<div className={`${styles.row} ${styles.row2Col}`}>
					<div className={`${styles.cell} ${styles.cellHalf} ${styles.cellTall}`}>
						<div><span className={styles.lbl}>PATIENT NAME: </span><span className={styles.val}>{name}</span></div>
					</div>
					<div className={`${styles.cell} ${styles.cellHalf} ${styles.borderLeft} ${styles.cellTall}`}>
						<div style={{ display: "flex", alignItems: "flex-end", gap: "4px" }}>
							<span className={styles.lbl}>PHIC ID:</span>
							<UL width="170px" />
						</div>
						<div className={styles.phicRow}>
							<span className={styles.val}>( &nbsp;) Member &nbsp;&nbsp;( &nbsp;) Dependent</span>
						</div>
					</div>
				</div>

				{/* Row: PERMANENT ADDRESS | TEL | SEX | CIVIL STATUS */}
				<div className={`${styles.row} ${styles.row4Col}`}>
					<div className={`${styles.cell} ${styles.cellAddr} ${styles.cellTall}`}>
						<div><span className={styles.lbl}>PERMANENT ADDRESS</span></div>
						<div><span className={styles.val}>{address}</span></div>
					</div>
					<div className={`${styles.cell} ${styles.cellTel} ${styles.borderLeft} ${styles.cellTall}`}>
						<div><span className={styles.lbl}>TEL.NO./CP NO.</span></div>
						<div><span className={styles.val}>{telNo}</span></div>
					</div>
					<div className={`${styles.cell} ${styles.cellSex} ${styles.borderLeft} ${styles.cellTall}`}>
						<div><span className={styles.lbl}>Sex</span></div>
						<div><span className={styles.val}>{sex}</span></div>
					</div>
					<div className={`${styles.cell} ${styles.cellCivil} ${styles.borderLeft} ${styles.cellTall}`}>
						<div><span className={styles.lbl}>Civil Status</span></div>
						<div><span className={styles.val}>{civilStatus}</span></div>
					</div>
				</div>

				{/* Row: BIRTHDATE | AGE | BIRTH PLACE | NATIONALITY | RELIGION | OCCUPATION | INDIGENOUS */}
				<div className={styles.row}>
					{[
						{ label: "BIRTHDATE",    value: birthdate },
						{ label: "Age",           value: age },
						{ label: "BIRTH PLACE",   value: birthPlace },
						{ label: "NATIONALITY",   value: nationality },
						{ label: "RELIGION",      value: religion },
						{ label: "OCCUPATION",    value: occupation },
						{ label: "INDIGENOUS",    value: indigenous },
					].map((col, i) => (
						<div key={i} className={`${styles.cell} ${styles.cell7} ${i > 0 ? styles.borderLeft : ""}`}>
							<div className={styles.thLbl}>{col.label}</div>
							<div className={styles.val}>{col.value}</div>
						</div>
					))}
				</div>

			</div>

			{/* CLINICAL SECTION */}
			<div className={styles.clinical}>

				{/* Exposure Category + Dates */}
				<div className={styles.expDatesRow}>
					<div className={styles.expLeft}>
						<span className={styles.lbl}>Exposure Category: </span>
						<span className={styles.val}>( &nbsp;)I &nbsp;&nbsp;( &nbsp;)II &nbsp;&nbsp;( &nbsp;)III</span>
					</div>
					<div className={styles.expRight}>
						<div className={styles.dateLine}>
							<span className={styles.val}>Date of Exposure:</span><UL width="150px" />
						</div>
						<div className={styles.dateLine}>
							<span className={styles.val}>Date of Treatment:</span><UL width="150px" />
						</div>
					</div>
				</div>

				{/* Two columns */}
				<div className={styles.twoCol}>
					<div className={styles.col}>
						<p className={styles.colTitle}><strong>1. Mode of Animal Exposure</strong></p>
						{["Nibbling/licking of uncovered skin","Nibbling/licking of wound/broken skin","Scratch/Abrasion","Transdermal bite","Handling/ingestion of raw infected meat","Any combination of the above"].map((item, i) => (
							<div key={i} className={styles.checkItem}>( &nbsp;) {item}</div>
						))}
					</div>
					<div className={styles.col}>
						<p className={styles.colTitle}><strong>2. Body Part Affected / Exposed to Animal Bite</strong></p>
						{["Head and/or Neck","other part of the body (L.Leg/R.Leg)","N/A (if by ingestion mode)"].map((item, i) => (
							<div key={i} className={styles.checkItem}>( &nbsp;) {item}</div>
						))}
						<p className={styles.colItem}><strong>3. Types of Animal:</strong> ( &nbsp;) Dog &nbsp;&nbsp;( &nbsp;) Others <UL width="60px" /></p>
						<p className={styles.colItem}><strong>4. Past history of animal bite:</strong> ( &nbsp;) Yes &nbsp;&nbsp;( &nbsp;) No</p>
						<p className={styles.colItem}>If YES, Specify Date: <UL width="100px" /></p>
					</div>
				</div>

				<p className={styles.item5}>
					<strong>5. Based on item no.3 was the PEP primary immunization schedule complete ( &nbsp;) Yes &nbsp;&nbsp;( &nbsp;) No</strong>
				</p>

				<div className={styles.icdRow}>
					<span className={styles.val}>ICD Code</span>
					<UL width="110px" />
				</div>

			</div>

			{/* VACCINATION TABLE */}
			<table className={styles.vacTable}>
				<thead>
					<tr>
						<th className={styles.vth} colSpan={5}>Post-Exposure Vaccination Record</th>
					</tr>
					<tr>
						<th className={`${styles.vth} ${styles.vcolPeriod}`}>Period</th>
						<th className={`${styles.vth} ${styles.vcolRoute}`}>Adm. Route</th>
						<th className={`${styles.vth} ${styles.vcolDate}`}>Date</th>
						<th className={`${styles.vth} ${styles.vcolGiven}`}>Given</th>
						<th className={`${styles.vth} ${styles.vcolSig}`}>Signature</th>
					</tr>
				</thead>
				<tbody>
					{vacRows.map((row, i) => (
						<tr key={i} className={styles.vtr}>
							<td className={`${styles.vtd} ${styles.vcolPeriod}`}>{row.label}</td>
							<td className={`${styles.vtd} ${styles.vcolRoute}`} />
							<td className={`${styles.vtd} ${styles.vcolDate}`} />
							<td className={`${styles.vtd} ${styles.vcolGiven}`} />
							{i === 0 && (
								<td className={`${styles.vtd} ${styles.vcolSig}`} rowSpan={vacRows.length}>
									<div className={styles.physician}>
										<div>{physician}</div>
										<div>{licenseNo}</div>
									</div>
								</td>
							)}
						</tr>
					))}
				</tbody>
			</table>

		</div>
	);
}
