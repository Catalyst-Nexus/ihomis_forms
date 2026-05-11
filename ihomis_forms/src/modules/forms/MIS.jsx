import PropTypes from "prop-types";
import styles from "./MIS.module.css";
import chartPlaceholderSrc from './img/sage.png';

const formatDateOnly = (date = new Date()) =>
	date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

const formatGeneratedOn = (date = new Date()) => {
	const pad = (value) => String(value).padStart(2, "0");
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const ampm = hours >= 12 ? "pm" : "am";
	const hour12 = String(hours % 12 || 12).padStart(2, "0");

	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${hour12}:${pad(minutes)} ${ampm}`;
};

export default function MISSafetyChecklist({ patientName, patientData = {} }) {
	const caseNum = patientData.caseNum || patientData.caseNo || "";
	const hospitalNo = patientData.hospitalNo || patientData.hospNo || "";
	const address = patientData.address || patientData.completeAddress || "";
	const name = patientName || patientData.patientName || "";
	const age = patientData.age || "";
	const sex = patientData.sex || "";
	const generatedOn = patientData.generatedOn || formatGeneratedOn();

	return (
		<div className={styles.document}>
			<div className={styles.page}>
				{/* Patient Info Row */}
				<div className={styles.patientInfo}>
					<div className={styles.infoRow}>
						<div className={`${styles.infoCell} ${styles.cellBorderRight}`}>
							<span className={styles.label}>Case Number:</span>
							<span>{caseNum}</span>
						</div>
						<div className={styles.infoCell}>
							<span className={styles.label}>Hospital No.:</span>
							<span>{hospitalNo}</span>
						</div>
					</div>

					<div className={styles.infoRow}>
						<div className={styles.infoCell}>
							<span className={styles.label}>Address:</span>
							<span>{address}</span>
						</div>
					</div>

					<div className={styles.infoRow}>
						<div className={styles.infoCell}>
							<span className={styles.label}>Name of Patient:</span>
							<span>{name}</span>
						</div>
						<div className={`${styles.infoCell} ${styles.cellAge}`}>
							<span className={styles.label}>Age:</span>
							<span>{age}</span>
						</div>
						<div className={`${styles.infoCell} ${styles.cellSex}`}>
							<span className={styles.label}>Sex:</span>
							<span>{sex}</span>
						</div>
					</div>
				</div>

				{/* Section 1: Pre-Patient Entry */}
				<div className={styles.section}>
					<h2 className={styles.sectionTitle}>1. Pre-Patient Entry</h2>

					{/* A. Circulating Nurse Duties */}
					<div className={styles.subsection}>
						<h3 className={styles.subsectionTitle}>A. Circulating Nurse Duties</h3>

						<table className={styles.table}>
							<thead>
								<tr>
									<th className={styles.tableTh}>Parameter</th>
									<th className={styles.tableTh}>Actions</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td className={styles.tableTd}>Surgeon Preference Card</td>
									<td className={styles.tableTd}>
										<div className={styles.tableTdDiv}>[ ] Reviewed</div>
									</td>
								</tr>
								<tr>
									<td className={styles.tableTd}>OR Table Position</td>
									<td className={styles.tableTd}>
										<div className={styles.tableTdDiv}>[ ] Correct orientation and weight capacity</div>
										<div className={styles.tableTdDiv}>[ ] Bean bag mattress(if indicated)</div>
										<div className={styles.tableTdDiv}>[ ] Table accessories (eg spreader bars/leg supports/ foot board as indicated)</div>
										<div className={styles.tableTdDiv}>[ ] Positioned for fluoroscopy if indicated</div>
									</td>
								</tr>
								<tr>
									<td className={styles.tableTd}>Power sources</td>
									<td className={styles.tableTd}>
										<div className={styles.tableTdDiv}>[ ] Connected and linked to all devices</div>
									</td>
								</tr>
								<tr>
									<td className={styles.tableTd}>CO2 insufflator</td>
									<td className={styles.tableTd}>
										<div className={styles.tableTdDiv}>[ ] Check CO2 volume, pressure and flow</div>
										<div className={styles.tableTdDiv}>[ ] Backup cylinder and accessories(Wrench and key) in place Filer for CO2 unit or tubing</div>
									</td>
								</tr>
								<tr>
									<td className={styles.tableTd}>Video monitors</td>
									<td className={styles.tableTd}>
										<div className={styles.tableTdDiv}>[ ] Position per procedure</div>
										<div className={styles.tableTdDiv}>[ ] Test pattern present</div>
									</td>
								</tr>
								<tr>
									<td className={styles.tableTd}>Suction/irrigation</td>
									<td className={styles.tableTd}>
										<div className={styles.tableTdDiv}>[ ] Cannister set</div>
										<div className={styles.tableTdDiv}>[ ] Irrigation and pressure bag available</div>
									</td>
								</tr>
								<tr>
									<td className={styles.tableTd}>Alarms</td>
									<td className={styles.tableTd}>
										<div className={styles.tableTdDiv}>[ ] Turned on and audible</div>
									</td>
								</tr>
								<tr>
									<td className={styles.tableTd}>Video documentation</td>
									<td className={styles.tableTd}>
										<div className={styles.tableTdDiv}>[ ] Recording media available and operational (DVD,print, etc.)</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					{/* B. Scrub Person Duties */}
					<div className={styles.subsection}>
						<h3 className={styles.subsectionTitle}>B. Scrub Person Duties</h3>

						<table className={styles.table}>
							<thead>
								<tr>
									<th className={styles.tableTh}>Parameter</th>
									<th className={styles.tableTh}>Actions</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td className={styles.tableTd}>Reusable instruments</td>
									<td className={styles.tableTd}>
										<div className={styles.tableTdDiv}>[ ] Check movement handles and jaws, all screws present</div>
										<div className={styles.tableTdDiv}>[ ] Check sealing caps</div>
										<div className={styles.tableTdDiv}>[ ] Instrument vents closed</div>
										<div className={styles.tableTdDiv}>[ ] Check cautery insulation</div>
									</td>
								</tr>
								<tr>
									<td className={styles.tableTd}>Veress needle</td>
									<td className={styles.tableTd}>
										<div className={styles.tableTdDiv}>[ ] Check plunger/spring action</div>
										<div className={styles.tableTdDiv}>[ ] Flush needle and stopcock, Saline solution available</div>
									</td>
								</tr>
								<tr>
									<td className={styles.tableTd}>Hasson Cannula</td>
									<td className={styles.tableTd}>
										<div className={styles.tableTdDiv}>[ ] Check valves, plunger, and seals</div>
									</td>
								</tr>
								<tr>
									<td className={styles.tableTd}>Trocars/Ports</td>
									<td className={styles.tableTd}>
										<div className={styles.tableTdDiv}>[ ] Check appropriate size/type</div>
										<div className={styles.tableTdDiv}>[ ] Close stopcocks</div>
									</td>
								</tr>
								<tr>
									<td className={styles.tableTd}>Laparoscope</td>
									<td className={styles.tableTd}>
										<div className={styles.tableTdDiv}>[ ] Size and type per preference</div>
										<div className={styles.tableTdDiv}>[ ] Check lens clarity</div>
										<div className={styles.tableTdDiv}>[ ] Anti-fog solution or warmed saline for lens cleaning</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				{/* Section 2: After Patient Entry */}
				<div className={styles.section}>
					<h2 className={styles.sectionTitle}>2. After Patient Entry</h2>

					<table className={styles.table}>
						<thead>
							<tr>
								<th className={styles.tableTh}>Parameter</th>
								<th className={styles.tableTh}>Actions</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td className={styles.tableTd}>Patient position</td>
								<td className={styles.tableTd}>
									<div className={styles.tableTdDiv}>[ ] Secured to OR table, safety strap on</div>
									<div className={styles.tableTdDiv}>[ ] Pressure sites padded</div>
									<div className={styles.tableTdDiv}>[ ] Arms out or tucked per procedure</div>
								</td>
							</tr>
							<tr>
								<td className={styles.tableTd}>Sequential compression device</td>
								<td className={styles.tableTd}>
									<div className={styles.tableTdDiv}>[ ] On and connected to device</div>
								</td>
							</tr>
							<tr>
								<td className={styles.tableTd}>Electrosurgical unit</td>
								<td className={styles.tableTd}>
									<div className={styles.tableTdDiv}>[ ] Ground pad applied</div>
								</td>
							</tr>
							<tr>
								<td className={styles.tableTd}>Foot controls</td>
								<td className={styles.tableTd}>
									<div className={styles.tableTdDiv}>[ ] Positioned for surgeon access</div>
								</td>
							</tr>
							<tr>
								<td className={styles.tableTd}>Power sources(camera, insufflator, light source, monitors, cautery, ultrasonics, bipolar)</td>
								<td className={styles.tableTd}>
									<div className={styles.tableTdDiv}>[ ] Turned on (on standby)</div>
								</td>
							</tr>
							<tr>
								<td className={styles.tableTd}>Miscellaneous</td>
								<td className={styles.tableTd}>
									<div className={styles.tableTdDiv}>[ ] Foley catheter (if indicated)</div>
									<div className={styles.tableTdDiv}>[ ] Naso or orogastric tube(bougies if indicated)</div>
								</td>
							</tr>
							<tr>
								<td className={styles.tableTd}>Antibiotics</td>
								<td className={styles.tableTd}>
									<div className={styles.tableTdDiv}>[ ] Given as indicated</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
			{/* ── END PAGE 1 ── */}

			{/* ── PAGE 2 ── */}
			<div className={`${styles.page} ${styles.page2}`}>
				<div className={styles.headerReservedSpace} aria-hidden="true" />

				{/* Section 3: After Prep and Drape */}
				<div className={styles.section}>
					<h2 className={styles.sectionTitle}>3. After Prep and Drape</h2>

					<table className={styles.table}>
						<thead>
							<tr>
								<th className={styles.tableTh}>Parameter</th>
								<th className={styles.tableTh}>Actions</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td className={styles.tableTd}>Electrosurgical unit</td>
								<td className={styles.tableTd}>
									<div className={styles.tableTdDiv}>[ ] Cautery cords connected to unit</div>
								</td>
							</tr>
							<tr>
								<td className={styles.tableTd}>Monopolar cautery</td>
								<td className={styles.tableTd}>
									<div className={styles.tableTdDiv}>[ ] Tip protected</div>
								</td>
							</tr>
							<tr>
								<td className={styles.tableTd}>Ultrasonic or bipolar device</td>
								<td className={styles.tableTd}>
									<div className={styles.tableTdDiv}>[ ] Connected to unit</div>
									<div className={styles.tableTdDiv}>[ ] Activation test performed</div>
								</td>
							</tr>
							<tr>
								<td className={styles.tableTd}>Line connections</td>
								<td className={styles.tableTd}>
									<div className={styles.tableTdDiv}>[ ] Camera cord</div>
									<div className={styles.tableTdDiv}>[ ] Light source (on standby)</div>
									<div className={styles.tableTdDiv}>[ ] CO2 tubing (connected and flushed)</div>
									<div className={styles.tableTdDiv}>[ ] Suction/irrigation (suction turned on)</div>
									<div className={styles.tableTdDiv}>[ ] Smoke evacuation filter connected</div>
								</td>
							</tr>
							<tr>
								<td className={styles.tableTd}>Local anesthetic</td>
								<td className={styles.tableTd}>
									<div className={styles.tableTdDiv}>[ ] Syringe labeled and filled with anesthetic of choice needle connected</div>
								</td>
							</tr>
							<tr>
								<td className={styles.tableTd}>Fluoroscopy case</td>
								<td className={styles.tableTd}>
									<div className={styles.tableTdDiv}>[ ] Mix and dilute contrast appropriately and label</div>
									<div className={styles.tableTdDiv}>[ ] Clear tubing, syringe, catheter of air bubbles, label syringes</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				{/* SAGES/AORN image — directly under Section 3 table */}
				<section aria-label="SAGES and AORN logos" className={styles.sagesImage}>
					<img
						src={chartPlaceholderSrc}
						alt="This checklist has been developed by SAGES and AORN to aid operating room personnel in the preparation of equipment and other duties unique to laparoscopic surgery cases. It should not supplant the surgical time out or other hospital-specific patient safety protocols."
						style={{ width: '100%', display: 'block' }}
					/>
				</section>
              
				<br></br>
				<br></br>
				{/* Signature lines — directly under SAGES image */}
				<div className={styles.signatureBlock}>
					<div className={styles.signatureLine}>
						<span className={styles.sigUnderline} />
						<span className={styles.signatureLabel}>SCRUB NURSE</span>
					</div>
					<div className={styles.signatureLine}>
						<span className={styles.sigUnderline} />
						<span className={styles.signatureLabel}>CIRCULATING NURSE</span>
					</div>
				</div>

				{/* Spacer pushes generated timestamp to bottom */}
				<div className={styles.page2Spacer} />

				{/* Generated timestamp — pinned to bottom */}
				<div className={styles.generated}>
					Generated by: TCP T. TCP on {generatedOn}
				</div>

			</div>
			{/* ── END PAGE 2 ── */}

		</div>
	);
}

MISSafetyChecklist.propTypes = {
	patientName: PropTypes.string,
	patientData: PropTypes.object,
};
