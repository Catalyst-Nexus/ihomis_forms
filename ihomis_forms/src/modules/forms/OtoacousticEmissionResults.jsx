import { useMemo } from "react";
import "./OtoacousticEmissionResults.css";

export default function OtoacousticEmissionResults({ patientName, patientData }) {
	const name        = patientName;
	const caseNum     = patientData?.caseNum;
	const hospitalNo  = patientData?.hospitalNo;
	const weight      = patientData?.weight;
	const dob         = patientData?.dob;
	const timeDelivery = patientData?.timeDelivery;
	const motherDob   = patientData?.motherDob;
	const contactNo   = patientData?.contactNo;
	const aog         = patientData?.aog;
	const address     = patientData?.address;

	const { generatedOn } = useMemo(() => {
		const now = new Date();
		const pad = (n) => String(n).padStart(2, "0");
		const h = now.getHours();
		const m = now.getMinutes();
		const ampm = h >= 12 ? "pm" : "am";
		const hh = String(h % 12 || 12).padStart(2, "0");
		const timeStr = `${hh}:${pad(m)} ${ampm}`;
		const generatedOn = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${timeStr}`;
		return { generatedOn };
	}, []);

	return (
		<div className="oer-page">
			<br />
			<div className="oer-info-block">
				<div className="oer-two-col">
					<div className="oer-col">
						<div className="oer-info-cell oer-info-line">
							<span className="oer-lbl">Case Number:</span>
							<span className="oer-val">&nbsp;{caseNum}</span>
						</div>
						<div className="oer-info-cell oer-info-line">
							<span className="oer-lbl">Patient's Name:</span>
							<span className="oer-val">&nbsp;{name}</span>
						</div>
						<div className="oer-info-cell oer-info-line">
							<span className="oer-lbl">Date of birth:</span>
							<span className="oer-val">&nbsp;{dob}</span>
						</div>
					</div>

					<div className="oer-col">
						<div className="oer-info-cell oer-info-line">
							<span className="oer-lbl">Hospital No.:</span>
							<span className="oer-val">&nbsp;{hospitalNo}</span>
						</div>
						<div className="oer-info-cell oer-info-line">
							<span className="oer-lbl">Weight:</span>
							<span className="oer-val">&nbsp;{weight}</span>
						</div>
						<div className="oer-info-cell oer-info-line">
							<span className="oer-lbl">Time of delivery:</span>
							<span className="oer-val">&nbsp;{timeDelivery}</span>
						</div>
					</div>
				</div>

				{/* Row: Mother's Date of Birth | Contact No. | AOG */}
				<div className="oer-info-row oer-info-row-multi">
					<div className="oer-info-cell">
						<span className="oer-lbl">Mother's Date of Birth:</span>
						<span className="oer-val">&nbsp;{motherDob}</span>
					</div>
					<div className="oer-info-cell">
						<span className="oer-lbl">Contact No.:</span>
						<span className="oer-val">&nbsp;{contactNo}</span>
					</div>
					<div className="oer-info-cell">
						<span className="oer-lbl">AOG:</span>
						<span className="oer-aog-line">{aog}</span>
					</div>
				</div>

				{/* Address — full width */}
				<div className="oer-info-row">
					<div className="oer-info-cell oer-full-width">
						<span className="oer-lbl">Address:</span>
						<span className="oer-val">&nbsp;{address}</span>
					</div>
				</div>

			</div>

			{/* ── Horizontal rule ── */}
			<hr className="oer-divider" />

			{/* Intro paragraph */}
			<p className="oer-intro">
				The Hearing Screening procedure was done using Transient Evoked Otoacoustic Emission (OAE). Below were the results obtained.
			</p>

			{/* REMARKS right-aligned label */}
			<div className="oer-remarks-row">
				<span className="oer-remarks-lbl">REMARKS:</span>
			</div>
            <br />

			{/* LEFT EAR row */}
			<div className="oer-ear-row">
				<span className="oer-ear-label">LEFT EAR</span>
				<span className="oer-ear-option">[ ] Pass</span>
				<span className="oer-ear-option">[ ] Refer</span>
				<span className="oer-ear-option">[ ] Not tested</span>
			</div>

			{/* RIGHT EAR row */}
			<div className="oer-ear-row">
				<span className="oer-ear-label">RIGHT EAR</span>
				<span className="oer-ear-option">[ ] Pass</span>
				<span className="oer-ear-option">[ ] Refer</span>
				<span className="oer-ear-option">[ ] Not tested</span>
			</div>

			{/* ── Interpretation section ── */}
			<div className="oer-section">
				<p className="oer-section-title">Interpretation</p>

				<p className="oer-body-para">
					<strong>PASS result</strong> means that the auditory pathway from the external ear up to the inner ear is intact. Transient-evoked OAE was detected and this usually suggests normal speech and language development unless there are other medical conditions.
				</p>

				<p className="oer-body-para">
					<strong>REFER result</strong> means that further evaluation is recommended to assess hearing status. There are other factors that leads to this result like ear wax or if the baby is noisy or very active during the time of testing.
				</p>
			</div>

			{/* ── Recommendation section ── */}
			<div className="oer-section">
				<p className="oer-section-title">Recommendation</p>

				<p className="oer-body-para">
					[ ] No further testing is recommended at this time. However, continous monitoring of hearing and speech development should be conducted throughout the first few years of life.
				</p>

				<p className="oer-body-para">
					[ ] Repeat Transient-evoked OAE testing is recommende after Two (2) weeks to One (1) month.
				</p>

				<p className="oer-body-para">
					[ ]Referred for further evaluation (ABR/ASSR/Pure Tone Audiometry)
				</p>
			</div>

			{/* ── Signature block ── */}
            <br />
			<div className="oer-sig-wrap">
				<div className="oer-sig-block">
					<div className="oer-sig-line" />
					<p className="oer-sig-label">Screener/Audiologist/ENT Specialist/Clinician</p>
				</div>
			</div>

			{/* ── Footer ── */}
			<div className="oer-footer">
				Generated by: TCP T. TCP on {generatedOn}
			</div>

		</div>
	);
}