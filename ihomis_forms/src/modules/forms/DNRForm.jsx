import "./DNRForm.css";

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

export default function DNRForm({ patientName, patientData = {} }) {
	const name = patientName || patientData.patientName || patientData.fullName || "";
	const signedOn =
		patientData.signedOn ||
		patientData.dateSigned ||
		patientData.signedDate ||
		patientData.date ||
		formatDateOnly();
	const generatedOn = patientData.generatedOn || formatGeneratedOn();

	return (
		<div className="dnr-page">
			



        <br></br>
			{/* Intro */}
			<p className="dnr-intro">
				I understand that effective today, emergency care for patient {name} will be limited
			</p>
			<p className="dnr-as-described">as described below:</p>

			{/* Section A */}
			<div className="dnr-section-label">
				A. In the event of <span>(put a check mark on you choice)</span>
			</div>
			<div className="dnr-checkbox-item">[ ] Full cardiopulmonary Arrest (When both breathing and heartbeat stops)</div>
			<div className="dnr-checkbox-item">[ ] Pre Arrest Emergency (When breathing is labored or stopped and heart is still breathing)</div>

			{/* Section B */}
			<div className="dnr-section-label" style={{ marginTop: "2mm" }}>
				B. No procedures to restart breathing or heart functioning will be instituted such as:
			</div>
			<div className="dnr-checkbox-header">(put a check mark on your choice)</div>
			<div className="dnr-checkbox-item">[ ] Chest compressions</div>
			<div className="dnr-checkbox-item">[ ] Assisted ventilations</div>
			<div className="dnr-checkbox-item">[ ] Intubations</div>
			<div className="dnr-checkbox-item">[ ] Defibrillations</div>
			<div className="dnr-checkbox-item">[ ] Administration of cardiotonic medications</div>

			{/* Other procedures */}
			<div className="dnr-other-procedures">
				Other related medical procedures, please specify: _____________________________________________
			</div>

			{/* Understand statements */}
			<p className="dnr-understand">I understand that DO NOT RESUSCITATE maybe revoked any time.</p>
			<p className="dnr-understand">I understand the purpose and effect of this document and sign it knowingly and voluntarily</p>

			{/* Signature row */}
			<div className="dnr-sig-row">
				<div className="dnr-sig-col">
					<div className="dnr-sig-line" />
					<div className="dnr-sig-label">SIGNATURE OVER PRINTED NAME OF NEXT OF<br />KIN</div>
				</div>
				<div className="dnr-sig-col">
					<div className="dnr-sig-line" />
					<div className="dnr-sig-label" style={{ marginBottom: "3mm" }}>RELATIONSHIP TO THE PATIENT</div>
				</div>
				<div className="dnr-sig-col-date">
					<div className="dnr-date-value">{signedOn}</div>
					<div className="dnr-date-label" style={{ marginBottom: "1mm" }}>DATE</div>
				</div>
			</div>

			{/* Witness */}
			<div className="dnr-witness-label">WITNESS:</div>
			<div className="dnr-witness-row">
				<div className="dnr-sig-col">
					<div className="dnr-sig-line" />
					<div className="dnr-sig-label">WITNESS SIGNATURE OVER PRINTED NAME</div>
				</div>
				<div className="dnr-sig-col-date">
					<div className="dnr-date-value">{signedOn}</div>
					<div className="dnr-date-label" style={{ marginBottom: "1mm" }}>DATE</div>
				</div>
			</div>

			<hr className="dnr-divider" />

			{/* Revocation */}
			<div className="dnr-revocation-title">REVOCATION</div>
			<p className="dnr-revocation-text">
				I hereby revoke the above DO NOT RESUSCITATE (DNR) / DO NOT INTUBATE request
			</p>

			{/* Revocation signature row */}
			<div className="dnr-sig-row">
				<div className="dnr-sig-col">
					<div className="dnr-sig-line" />
					<div className="dnr-sig-label">SIGNATURE OVER PRINTED NAME OF NEXT OF<br />KIN</div>
				</div>
				<div className="dnr-sig-col">
					<div className="dnr-sig-line" />
					<div className="dnr-sig-label" style={{ marginBottom: "3mm" }}>RELATIONSHIP TO THE PATIENT</div>
				</div>
				<div className="dnr-sig-col-date">
					<div className="dnr-date-value">{signedOn}</div>
					<div className="dnr-date-label" style={{ marginBottom: "1mm" }}>DATE</div>
				</div>
			</div>

			{/* Note block */}
			<div className="dnr-note-block">
				<div className="dnr-note-label">Note:</div>
				<div className="dnr-note-text">
					In case the patient is incapable of giving consent for healthcare decision and third party consent is required, the following persons, in the order of priority stated hereunder, may give consent as healthcare proxy:
				</div>
				<div className="dnr-note-list">
					<div>1. Spouse</div>
					<div>2. Son or daughter of legal age</div>
					<div>3. Parents</div>
					<div>4. Brother or sister of legal age</div>
					<div>5. Guardian</div>
				</div>
				<div>(As cited in Republic Act No. 4226 otherwise known as Hospital Licensure Act)</div>
			</div>

			{/* Footer */}
			<div className="dnr-footer">
				Generated by: TCP T. TCP on {generatedOn}
			</div>

		</div>
	);
}