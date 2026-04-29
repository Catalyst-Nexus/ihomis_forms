import PropTypes from "prop-types";
import "./MIS.css";
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
		<div className="mis-document">

			{/* ── PAGE 1 ── */}
			<div className="mis-page">
				<div className="mis-header-reserved-space" aria-hidden="true" />

				{/* Patient Info Row */}
				<div className="mis-patient-info">
					<div className="mis-info-row">
						<div className="mis-info-cell mis-cell-border-right">
							<span className="mis-label">Case Number:</span>
							<span>{caseNum}</span>
						</div>
						<div className="mis-info-cell">
							<span className="mis-label">Hospital No.:</span>
							<span>{hospitalNo}</span>
						</div>
					</div>

					<div className="mis-info-row">
						<div className="mis-info-cell">
							<span className="mis-label">Address:</span>
							<span>{address}</span>
						</div>
					</div>

					<div className="mis-info-row">
						<div className="mis-info-cell">
							<span className="mis-label">Name of Patient:</span>
							<span>{name}</span>
						</div>
						<div className="mis-info-cell mis-cell-age">
							<span className="mis-label">Age:</span>
							<span>{age}</span>
						</div>
						<div className="mis-info-cell mis-cell-sex">
							<span className="mis-label">Sex:</span>
							<span>{sex}</span>
						</div>
					</div>
				</div>

				{/* Section 1: Pre-Patient Entry */}
				<div className="mis-section">
					<h2 className="mis-section-title">1. Pre-Patient Entry</h2>

					{/* A. Circulating Nurse Duties */}
					<div className="mis-subsection">
						<h3 className="mis-subsection-title">A. Circulating Nurse Duties</h3>

						<table className="mis-table">
							<thead>
								<tr>
									<th>Parameter</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>Surgeon Preference Card</td>
									<td>
										<div>[ ] Reviewed</div>
									</td>
								</tr>
								<tr>
									<td>OR Table Position</td>
									<td>
										<div>[ ] Correct orientation and weight capacity</div>
										<div>[ ] Bean bag mattress(if indicated)</div>
										<div>[ ] Table accessories (eg spreader bars/leg supports/ foot board as indicated)</div>
										<div>[ ] Positioned for fluoroscopy if indicated</div>
									</td>
								</tr>
								<tr>
									<td>Power sources</td>
									<td>
										<div>[ ] Connected and linked to all devices</div>
									</td>
								</tr>
								<tr>
									<td>CO2 insufflator</td>
									<td>
										<div>[ ] Check CO2 volume, pressure and flow</div>
										<div>[ ] Backup cylinder and accessories(Wrench and key) in place Filer for CO2 unit or tubing</div>
									</td>
								</tr>
								<tr>
									<td>Video monitors</td>
									<td>
										<div>[ ] Position per procedure</div>
										<div>[ ] Test pattern present</div>
									</td>
								</tr>
								<tr>
									<td>Suction/irrigation</td>
									<td>
										<div>[ ] Cannister set</div>
										<div>[ ] Irrigation and pressure bag available</div>
									</td>
								</tr>
								<tr>
									<td>Alarms</td>
									<td>
										<div>[ ] Turned on and audible</div>
									</td>
								</tr>
								<tr>
									<td>Video documentation</td>
									<td>
										<div>[ ] Recording media available and operational (DVD,print, etc.)</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					{/* B. Scrub Person Duties */}
					<div className="mis-subsection">
						<h3 className="mis-subsection-title">B. Scrub Person Duties</h3>

						<table className="mis-table">
							<thead>
								<tr>
									<th>Parameter</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>Reusable instruments</td>
									<td>
										<div>[ ] Check movement handles and jaws, all screws present</div>
										<div>[ ] Check sealing caps</div>
										<div>[ ] Instrument vents closed</div>
										<div>[ ] Check cautery insulation</div>
									</td>
								</tr>
								<tr>
									<td>Veress needle</td>
									<td>
										<div>[ ] Check plunger/spring action</div>
										<div>[ ] Flush needle and stopcock, Saline solution available</div>
									</td>
								</tr>
								<tr>
									<td>Hasson Cannula</td>
									<td>
										<div>[ ] Check valves, plunger, and seals</div>
									</td>
								</tr>
								<tr>
									<td>Trocars/Ports</td>
									<td>
										<div>[ ] Check appropriate size/type</div>
										<div>[ ] Close stopcocks</div>
									</td>
								</tr>
								<tr>
									<td>Laparoscope</td>
									<td>
										<div>[ ] Size and type per preference</div>
										<div>[ ] Check lens clarity</div>
										<div>[ ] Anti-fog solution or warmed saline for lens cleaning</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				{/* Section 2: After Patient Entry */}
				<div className="mis-section">
					<h2 className="mis-section-title">2. After Patient Entry</h2>

					<table className="mis-table">
						<thead>
							<tr>
								<th>Parameter</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Patient position</td>
								<td>
									<div>[ ] Secured to OR table, safety strap on</div>
									<div>[ ] Pressure sites padded</div>
									<div>[ ] Arms out or tucked per procedure</div>
								</td>
							</tr>
							<tr>
								<td>Sequential compression device</td>
								<td>
									<div>[ ] On and connected to device</div>
								</td>
							</tr>
							<tr>
								<td>Electrosurgical unit</td>
								<td>
									<div>[ ] Ground pad applied</div>
								</td>
							</tr>
							<tr>
								<td>Foot controls</td>
								<td>
									<div>[ ] Positioned for surgeon access</div>
								</td>
							</tr>
							<tr>
								<td>Power sources(camera, insufflator, light source, monitors, cautery, ultrasonics, bipolar)</td>
								<td>
									<div>[ ] Turned on (on standby)</div>
								</td>
							</tr>
							<tr>
								<td>Miscellaneous</td>
								<td>
									<div>[ ] Foley catheter (if indicated)</div>
									<div>[ ] Naso or orogastric tube(bougies if indicated)</div>
								</td>
							</tr>
							<tr>
								<td>Antibiotics</td>
								<td>
									<div>[ ] Given as indicated</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
			{/* ── END PAGE 1 ── */}

			{/* ── PAGE 2 ── */}
			<div className="mis-page mis-page-2">
				<div className="mis-header-reserved-space" aria-hidden="true" />

				{/* Section 3: After Prep and Drape */}
				<div className="mis-section">
					<h2 className="mis-section-title">3. After Prep and Drape</h2>

					<table className="mis-table">
						<thead>
							<tr>
								<th>Parameter</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Electrosurgical unit</td>
								<td>
									<div>[ ] Cautery cords connected to unit</div>
								</td>
							</tr>
							<tr>
								<td>Monopolar cautery</td>
								<td>
									<div>[ ] Tip protected</div>
								</td>
							</tr>
							<tr>
								<td>Ultrasonic or bipolar device</td>
								<td>
									<div>[ ] Connected to unit</div>
									<div>[ ] Activation test performed</div>
								</td>
							</tr>
							<tr>
								<td>Line connections</td>
								<td>
									<div>[ ] Camera cord</div>
									<div>[ ] Light source (on standby)</div>
									<div>[ ] CO2 tubing (connected and flushed)</div>
									<div>[ ] Suction/irrigation (suction turned on)</div>
									<div>[ ] Smoke evacuation filter connected</div>
								</td>
							</tr>
							<tr>
								<td>Local anesthetic</td>
								<td>
									<div>[ ] Syringe labeled and filled with anesthetic of choice needle connected</div>
								</td>
							</tr>
							<tr>
								<td>Fluoroscopy case</td>
								<td>
									<div>[ ] Mix and dilute contrast appropriately and label</div>
									<div>[ ] Clear tubing, syringe, catheter of air bubbles, label syringes</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				{/* SAGES/AORN image — directly under Section 3 table */}
				<section aria-label="SAGES and AORN logos" className="mis-sages-image">
					<img
						src={chartPlaceholderSrc}
						alt="This checklist has been developed by SAGES and AORN to aid operating room personnel in the preparation of equipment and other duties unique to laparoscopic surgery cases. It should not supplant the surgical time out or other hospital-specific patient safety protocols."
						style={{ width: '100%', display: 'block' }}
					/>
				</section>
             
				<br></br>
				<br></br>
				{/* Signature lines — directly under SAGES image */}
				<div className="mis-signature-block">
					<div className="mis-signature-line">
						<span className="mis-sig-underline" />
						<span className="mis-signature-label">SCRUB NURSE</span>
					</div>
					<div className="mis-signature-line">
						<span className="mis-sig-underline" />
						<span className="mis-signature-label">CIRCULATING NURSE</span>
					</div>
				</div>

				{/* Spacer pushes generated timestamp to bottom */}
				<div className="mis-page2-spacer" />

				{/* Generated timestamp — pinned to bottom */}
				<div className="mis-generated">
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