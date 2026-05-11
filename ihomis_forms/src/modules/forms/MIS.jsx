import PropTypes from "prop-types";
import styles from "./MIS.module.css";
import chartPlaceholderSrc from './img/sage.png';

export default function MISSafetyChecklist({ patientName, patientData = {} }) {
	const caseNum = patientData.caseNum || patientData.caseNo || "";
	const hospitalNo = patientData.hospitalNo || patientData.hospNo || "";
	const address = patientData.address || patientData.completeAddress || "";
	const name = patientName || patientData.patientName || "";
	const age = patientData.age || "";
	const sex = patientData.sex || "";

	return (
		<div className={styles.wrap}>
			{/* ═══════════════ PAGE 1 ═══════════════ */}
			<div className={styles.pageP1}>
				<div className={styles.main}>
					{/* META SECTION (Standardized Header) */}
					<div className={styles.metaSection}>
						<div className={styles.metaRow}>
							<span className={styles.metaCell} style={{ flex: 1 }}>
								<span className={styles.label}>Case Number:</span>
								<span>{caseNum}</span>
							</span>
							<span className={styles.metaCell} style={{ flex: 1 }}>
								<span className={styles.label}>Hospital No.:</span>
								<span>{hospitalNo}</span>
							</span>
						</div>
						<div className={styles.metaRow}>
							<span className={styles.metaCell} style={{ flex: 1 }}>
								<span className={styles.label}>Address:</span>
								<span>{address}</span>
							</span>
						</div>
						<div className={styles.metaRow}>
							<span className={styles.metaCell} style={{ flex: 2 }}>
								<span className={styles.label}>Name of Patient:</span>
								<span>{name}</span>
							</span>
							<span className={styles.metaCell} style={{ flex: 0.5, justifyContent: "center" }}>
								<span className={styles.label}>Age:</span>
								<span>{age}</span>
							</span>
							<span className={styles.metaCell} style={{ flex: 0.5, justifyContent: "flex-end" }}>
								<span className={styles.label}>Sex:</span>
								<span>{sex}</span>
							</span>
						</div>
					</div>

					{/* Section 1 */}
					<div className={styles.section}>
						<h2 className={styles.sectionTitle}>1. Pre-Patient Entry</h2>
						<div className={styles.subsection}>
							<h3 className={styles.subsectionTitle}>A. Circulating Nurse Duties</h3>
							<table className={styles.table}>
								<thead>
									<tr>
										<th style={{ width: '30%' }}>Parameter</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td className={styles.boldCell}>Surgeon Preference Card</td>
										<td>[ ] Reviewed</td>
									</tr>
									<tr>
										<td className={styles.boldCell}>OR Table Position</td>
										<td>
											<div>[ ] Correct orientation and weight capacity</div>
											<div>[ ] Bean bag mattress(if indicated)</div>
											<div>[ ] Table accessories (foot board as indicated)</div>
											<div>[ ] Positioned for fluoroscopy if indicated</div>
										</td>
									</tr>
									<tr>
										<td className={styles.boldCell}>Power sources</td>
										<td>[ ] Connected and linked to all devices</td>
									</tr>
									<tr>
										<td className={styles.boldCell}>CO2 insufflator</td>
										<td>
											<div>[ ] Check CO2 volume, pressure and flow</div>
											<div>[ ] Backup cylinder in place / Filter for CO2 tubing</div>
										</td>
									</tr>
									<tr>
										<td className={styles.boldCell}>Video monitors</td>
										<td>
											<div>[ ] Position per procedure</div>
											<div>[ ] Test pattern present</div>
										</td>
									</tr>
									<tr>
										<td className={styles.boldCell}>Suction/irrigation</td>
										<td>
											<div>[ ] Cannister set</div>
											<div>[ ] Irrigation and pressure bag available</div>
										</td>
									</tr>
								</tbody>
							</table>
						</div>

						<div className={styles.subsection}>
							<h3 className={styles.subsectionTitle}>B. Scrub Person Duties</h3>
							<table className={styles.table}>
								<thead>
									<tr>
										<th style={{ width: '30%' }}>Parameter</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td className={styles.boldCell}>Reusable instruments</td>
										<td>
											<div>[ ] Check movement handles/jaws, all screws present</div>
											<div>[ ] Check sealing caps / vents closed</div>
											<div>[ ] Check cautery insulation</div>
										</td>
									</tr>
									<tr>
										<td className={styles.boldCell}>Veress needle</td>
										<td>[ ] Check plunger/spring action, Saline available</td>
									</tr>
									<tr>
										<td className={styles.boldCell}>Trocars/Ports</td>
										<td>[ ] Check appropriate size/type and close stopcocks</td>
									</tr>
									<tr>
										<td className={styles.boldCell}>Laparoscope</td>
										<td>[ ] Check lens clarity / Anti-fog solution available</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					{/* Section 2 */}
					<div className={styles.section}>
						<h2 className={styles.sectionTitle}>2. After Patient Entry</h2>
						<table className={styles.table}>
							<tbody>
								<tr>
									<td className={styles.boldCell} style={{ width: '30%' }}>Patient position</td>
									<td>
										<div>[ ] Secured to OR table, safety strap on</div>
										<div>[ ] Pressure sites padded</div>
									</td>
								</tr>
								<tr>
									<td className={styles.boldCell}>Miscellaneous</td>
									<td>
										<div>[ ] Foley catheter / NG tube (if indicated)</div>
									</td>
								</tr>
								<tr>
									<td className={styles.boldCell}>Antibiotics</td>
									<td>[ ] Given as indicated</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* ═══════════════ PAGE 2 ═══════════════ */}
			<div className={styles.pageP2}>
				<div className={styles.main}>
					<div className={styles.section}>
						<h2 className={styles.sectionTitle}>3. After Prep and Drape</h2>
						<table className={styles.table}>
							<thead>
								<tr>
									<th style={{ width: '30%' }}>Parameter</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td className={styles.boldCell}>Electrosurgical unit</td>
									<td>[ ] Cautery cords connected / Tip protected</td>
								</tr>
								<tr>
									<td className={styles.boldCell}>Ultrasonic/Bipolar</td>
									<td>[ ] Connected / Activation test performed</td>
								</tr>
								<tr>
									<td className={styles.boldCell}>Line connections</td>
									<td>
										<div>[ ] Camera cord / Light source (standby)</div>
										<div>[ ] CO2 tubing / Suction irrigation connected</div>
									</td>
								</tr>
								<tr>
									<td className={styles.boldCell}>Local anesthetic</td>
									<td>[ ] Syringe labeled and filled</td>
								</tr>
							</tbody>
						</table>
					</div>

					{/* SAGES Image */}
					<section className={styles.imageSection}>
						<img
							src={chartPlaceholderSrc}
							alt="SAGES AORN Checklist Note"
							className={styles.chartImage}
						/>
					</section>

					<div className={styles.gapTall} />

					{/* Signature Block */}
					<div className={styles.sigRow}>
						<div className={styles.sigBlock}>
							<div className={styles.sigLine} />
							<div className={styles.sigLabel}>SCRUB NURSE</div>
						</div>
						<div className={styles.sigBlock}>
							<div className={styles.sigLine} />
							<div className={styles.sigLabel}>CIRCULATING NURSE</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

MISSafetyChecklist.propTypes = {
	patientName: PropTypes.string,
	patientData: PropTypes.object,
};