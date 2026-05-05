import "./BloodRequestAdult.css";
import PropTypes from "prop-types";

const formatGeneratedOn = (date = new Date()) => {
	const pad = (value) => String(value).padStart(2, "0");
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const ampm = hours >= 12 ? "pm" : "am";
	const hour12 = String(hours % 12 || 12).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${hour12}:${pad(minutes)} ${ampm}`;
};

export default function BloodRequestAdult({ patientName, patientData = {} }) {
	const hospitalNo = patientData.hospitalNo || patientData.hospNo || "";
	const name = patientName || patientData.patientName || "";
	const sex = patientData.sex || "";
	const age = patientData.age || "";
	const caseNo = patientData.caseNo || patientData.caseNum || "";
	const birthDate = patientData.birthDate || "";
	const date = patientData.date || "";
	const department = patientData.department || "";
	const roomNo = patientData.roomNo || "";
	const address = patientData.address || "";
	const admittingImpression = patientData.admittingImpression || "";
	const generatedOn = patientData.generatedOn || formatGeneratedOn();


	return (
		<div className="brf-document brf-adult-document">
			<div className="brf-page">
				{/* Header reserved space for hospital letterhead */}
				<div className="brf-header-spacer" aria-hidden="true" />

				{/* Patient Info */}
				<div className="brf-patient-info">
					<div className="brf-info-row">
						<div className="brf-info-cell brf-cell-wide">
							<span className="brf-label">Hospital No.: </span>
							<span className="brf-value brf-underline-value">{hospitalNo}</span>
						</div>
					</div>
					<div className="brf-info-row">
						<div className="brf-info-cell brf-cell-flex3">
							<span className="brf-label">Patient Name: </span>
							<span className="brf-value brf-underline-value">{name}</span>
						</div>
						<div className="brf-info-cell brf-cell-fixed">
							<span className="brf-label">Sex: </span>
							<span className="brf-value brf-underline-value">{sex}</span>
						</div>
						<div className="brf-info-cell brf-cell-fixed">
							<span className="brf-label">Age: </span>
							<span className="brf-value brf-underline-value">{age}</span>
						</div>
					</div>
					<div className="brf-info-row">
						<div className="brf-info-cell brf-cell-flex2">
							<span className="brf-label">Case No.: </span>
							<span className="brf-value brf-underline-value">{caseNo}</span>
						</div>
						<div className="brf-info-cell brf-cell-flex2">
							<span className="brf-label">BirthDate: </span>
							<span className="brf-value brf-underline-value">{birthDate}</span>
						</div>
						<div className="brf-info-cell brf-cell-flex2">
							<span className="brf-label">Date: </span>
							<span className="brf-value brf-underline-value">{date}</span>
						</div>
					</div>
					<div className="brf-info-row">
						<div className="brf-info-cell brf-cell-flex2">
							<span className="brf-label">Department: </span>
							<span className="brf-value brf-underline-value">{department}</span>
						</div>
						<div className="brf-info-cell brf-cell-flex3">
							<span className="brf-label">Room No./OB: </span>
							<span className="brf-value brf-underline-value">{roomNo}</span>
						</div>
					</div>
					{address && (
						<div className="brf-info-row">
							<div className="brf-info-cell brf-cell-wide">
								<span className="brf-label">Address: </span>
								<span className="brf-value brf-underline-value">{address}</span>
							</div>
						</div>
					)}
					<div className="brf-info-row brf-impression-row">
						<span className="brf-label">Admitting Impression/Clinical Diagnosis: </span>
						<br></br>
						<span className="brf-value">{admittingImpression}</span>
					</div>
				</div>

				{/* History of Previous Transfusion */}
				<div className="brf-history-row">
					<span className="brf-label">History of Previous Transfusion: When: </span>
					<span className="brf-underline-blank brf-blank-md" />
					<span className="brf-label"> Where: </span>
					<span className="brf-underline-blank brf-blank-lg" />
				</div>

				{/* Type of Request */}
				<div className="brf-type-row">
					<span className="brf-label">Type of Request: </span>
					<span className="brf-checkbox">[ ] ROUTINE</span>
					<span className="brf-checkbox">[ ] STAT</span>
				</div>

				{/* Section Header */}
				<div className="brf-section-header">
					Check Components Needed and Indication for Transfusion:
				</div>

				{/* Whole Blood */}
				<div className="brf-component-block">
					<div className="brf-component-title">
						<span className="brf-checkbox">[ ]</span>
						<strong> Whole Blood</strong>(approximate volume 500ml): Blood Type <span className="brf-underline-blank brf-blank-sm" /> Number of units needed <span className="brf-underline-blank brf-blank-sm" />.
					</div>
					<div className="brf-indications">
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] WB-1 :</span>
							<span className="brf-ind-text">
								<strong>Active bleeding</strong> with at least one of the following:<br />
								a. Loss of over 15% blood volume.<br />
								b. Hb less than 9g/dl.<br />
								c. Blood pressure decrease over 20 &amp;, or less than 90mm Hg. Systolic
							</span>
						</div>
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] WB-2 :</span>
							<span className="brf-ind-text">
								Others. Please specify: (This code will automaticall trigger a review of your indication) <span className="brf-underline-blank brf-blank-lg" />
							</span>
						</div>
					</div>
				</div>

				{/* Packed RBC */}
				<div className="brf-component-block">
					<div className="brf-component-title">
						<span className="brf-checkbox">[ ]</span>
						<strong> PACKED RBC</strong>(approximate volume 250ml): Blood Type <span className="brf-underline-blank brf-blank-sm" /> Number of units needed <span className="brf-underline-blank brf-blank-sm" />.
					</div>
					<div className="brf-indications">
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] R-1 :</span>
							<span className="brf-ind-text">Hgb less than 8 gm/dl of Hct less than 24% (if not due to treatable cause)</span>
						</div>
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] R-2 :</span>
							<span className="brf-ind-text">
								Patients receiving general anesthesia if:<br />
								a. Preoperative Hb less than 8g/dl or Hct less than 24%<br />
								b. Major blood letting operation and Hb less than 10g/dl or Hct less than 30%<br />
								c. Signs of homodynamic instability or inadequate oxygen carrying capacity(symptomatic anemia)
							</span>
						</div>
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] R-3 :</span>
							<span className="brf-ind-text">Symptomatic anemia regardless of Hb level (dyspnea, syncope, postural hypotension, tachycardia, chest-pains, TIA)</span>
						</div>
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] R-4 :</span>
							<span className="brf-ind-text">Hgb less than 8g/dl or Hct less than 24% with concomitant hemorrhage, COPD, CAD, hemoglobinopathy sepsis</span>
						</div>
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] R-5 :</span>
							<span className="brf-ind-text">
								Others. Please specify: (This code will automaticall trigger a review of your indication) <span className="brf-underline-blank brf-blank-lg" />
							</span>
						</div>
					</div>
				</div>

				{/* Washed RBC */}
				<div className="brf-component-block">
					<div className="brf-component-title">
						<span className="brf-checkbox">[ ]</span>
						<strong> Washed RBC</strong>(approximate volume 180ml): Blood Type <span className="brf-underline-blank brf-blank-sm" /> Number of units needed <span className="brf-underline-blank brf-blank-sm" />.
					</div>
					<div className="brf-indications">
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] WP-1 :</span>
							<span className="brf-ind-text">History of previous severe allergic transfusion reactions or anaplactoid reactions in immunocompromised patients</span>
						</div>
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] WP-2 :</span>
							<span className="brf-ind-text">Transfusion of group "O" blood during emergencies when the specific blood is not immediately available</span>
						</div>
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] WP-3 :</span>
							<span className="brf-ind-text">Paroxysmal nocturnal hemoglobinuria</span>
						</div>
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] WP-4 :</span>
							<span className="brf-ind-text">
								Others. Please specify: (This code will automaticall trigger a review of your indication) <span className="brf-underline-blank brf-blank-lg" />
							</span>
						</div>
					</div>
				</div>

				{/* NOTE for RBC */}
				<div className="brf-note-block">
					<div className="brf-note-title">NOTE : Comments on RBC products:</div>
					<div className="brf-note-content">
						1. Document pre and post-transfusion Hb&amp; Hct withing 24 hours<br />
						2. Dose: Adults- give on a unit-to-unit basis<br />
						<span style={{ paddingLeft: "1.5rem" }}>Remember, 1 unit may suffice to alleviate symptoms of anemia</span><br />
						<span style={{ paddingLeft: "1.5rem" }}>Infants: 10ml/kg. BW</span>
					</div>
				</div>

				{/* Generated timestamp */}
				<div className="brf-generated">
					Generated by: TCP T. TCP on {generatedOn}
				</div>
			</div>
			{/* ── END PAGE 1 ── */}

			{/* ── PAGE 2 ── */}
			<div className="brf-page brf-page-2">

				{/* Platelets */}
				<div className="brf-component-block">
					<div className="brf-component-title">
						<span className="brf-checkbox">[ ]</span>
						<strong> Platelets</strong>(approximate volume 50ml): Blood Type <span className="brf-underline-blank brf-blank-sm" /> Number of units needed <span className="brf-underline-blank brf-blank-sm" />.
					</div>
					<div className="brf-indications">
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] P-1 :</span>
							<span className="brf-ind-text">Prophylactic administration with count &lt;=10,000 and not due to TTP, ITP, HUS</span>
						</div>
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] P-2 :</span>
							<span className="brf-ind-text">Active bleeding with count [50,000]</span>
						</div>
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] P-3 :</span>
							<span className="brf-ind-text">Platelet count [50,000 and patient to undergo invasive procedure within 8 hours]</span>
						</div>
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] P-4 :</span>
							<span className="brf-ind-text">Platelet count [100,000 if surgery is on critical area (e.g. eye, brain, etc)]</span>
						</div>
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] P-5 :</span>
							<span className="brf-ind-text">Massive transfusion with diffuse microvascular bleeding and no time to obtain platelet count</span>
						</div>
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] P-6 :</span>
							<span className="brf-ind-text">
								Others. Please specify: (This code will automaticall trigger a review of your indication) <span className="brf-underline-blank brf-blank-lg" />
							</span>
						</div>
					</div>
				</div>

				{/* NOTE for Platelets */}
				<div className="brf-note-block">
					<div className="brf-note-title">NOTE :</div>
					<div className="brf-note-content">
						Document platelet count before (within 8 hours) and after (within 1 hour) transfusion<br />
						Dose: 1 unit/10kg. BW with maximum of 5 units
					</div>
				</div>

				{/* Cryoprecipitate */}
				<div className="brf-component-block">
					<div className="brf-component-title">
						<span className="brf-checkbox">[ ]</span>
						<strong> Cryoprecipitate</strong>(approximate volume 20ml): Blood Type <span className="brf-underline-blank brf-blank-sm" /> Number of units needed <span className="brf-underline-blank brf-blank-sm" />.
					</div>
					<div className="brf-indications">
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] C-1 :</span>
							<span className="brf-ind-text">Signicant hypofibrinogemi (&lt; 100 mg/dl)</span>
						</div>
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] C-2 :</span>
							<span className="brf-ind-text">Hemophilia A with bleeding or will undergo surgery or invasive procedure</span>
						</div>
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] C-3 :</span>
							<span className="brf-ind-text">Von Willebrand disease or uremic bleeding with prolonged bleeding time</span>
						</div>
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] C-4 :</span>
							<span className="brf-ind-text">
								Others. Please specify: (This code will automaticall trigger a review of your indication) <span className="brf-underline-blank brf-blank-lg" />
							</span>
						</div>
					</div>
				</div>

				{/* Fresh Frozen Plasma */}
				<div className="brf-component-block">
					<div className="brf-component-title">
						<span className="brf-checkbox">[ ]</span>
						<strong> Fresh Frozen Plasma</strong>(approximate volume 200-250ml): Blood Type <span className="brf-underline-blank brf-blank-sm" /> Number of units needed <span className="brf-underline-blank brf-blank-sm" />.
					</div>
					<div className="brf-indications">
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] F-1 :</span>
							<span className="brf-ind-text">PT or PTT &gt; 1.5 times mid-normal range within 8 hours of transfusion (PT &gt; 17secs. PTT &gt; 47 secs)</span>
						</div>
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] F-2 :</span>
							<span className="brf-ind-text">Specific factor deficiencies not treatable with cryoprecipitate</span>
						</div>
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] F-3 :</span>
							<span className="brf-ind-text">Reversal of coumadin anticoagulation in patients who are bleeding and not treatable with vitamin K</span>
						</div>
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] F-4 :</span>
							<span className="brf-ind-text">Treatment of TTP</span>
						</div>
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] F-5 :</span>
							<span className="brf-ind-text">
								Clinical coagulopathy associated with<br />
								a. Massive transfusion (u 20 units of blood in 24 hours)<br />
								b. Late pregnancy termination or abruption placentae
							</span>
						</div>
						<div className="brf-indication-item">
							<span className="brf-checkbox">[ ] F-6 :</span>
							<span className="brf-ind-text">
								Others. Please specify: (This code will automaticall trigger a review of your indication) <span className="brf-underline-blank brf-blank-lg" />
							</span>
						</div>
					</div>
				</div>

				{/* NOTE for FFP */}
				<div className="brf-note-block">
					<div className="brf-note-title">NOTE :</div>
					<div className="brf-note-content">
						1. Document PT/PTT pre and post-transfusion within 4 hours.<br />
						2. Dose: Initial loading dose of 15 ml/kg. BW Correction of significant coagulopathy requires &gt;=2 units FFP
					</div>
				</div>

				{/* Requested By */}
				<div className="brf-requested-section">
					<div className="brf-req-label">Requested by:</div>
					<div className="brf-signature-row">
						<div className="brf-sig-block">
							<div className="brf-sig-line-wrap brf-sig-line-wrap--suffix">
								<span className="brf-sig-line" />
								<span className="brf-sig-suffix">M. D.</span>
							</div>
							<div className="brf-sig-label">Signature over Printed Name of Physician</div>
						</div>
						<div className="brf-sig-block">
							<div className="brf-sig-stack">
								<div className="brf-sig-line" />
								<div className="brf-sig-label">Signature over Printed Name of Nurse on Duty</div>
							</div>
						</div>
					</div>
				</div>

				{/* Remarks */}
				<div className="brf-remarks-row">
					<span className="brf-label">Remarks: </span>
					<span className="brf-underline-blank brf-blank-full" />
				</div>

				{/* Received By */}
				<div className="brf-received-section">
					<div className="brf-req-label">Received by:</div>
					<div className="brf-signature-row brf-signature-row--offset">
						<div className="brf-sig-block">
							<div className="brf-sig-stack">
								<div className="brf-sig-line" />
								<div className="brf-sig-label">(Blood Bank Staff)</div>
							</div>
						</div>
						<div className="brf-sig-block">
							<div className="brf-sig-stack">
								<div className="brf-sig-line" />
								<div className="brf-sig-label">Date/Time</div>
							</div>
						</div>
					</div>
				</div>

				{/* Spacer */}
				<div className="brf-page2-spacer" />

				{/* Generated timestamp page 2 */}
				<div className="brf-generated">
					Generated by: TCP T. TCP on {generatedOn}
				</div>
			</div>
			{/* ── END PAGE 2 ── */}
		</div>
	);
}

BloodRequestAdult.propTypes = {
	patientName: PropTypes.string,
	patientData: PropTypes.object,
};