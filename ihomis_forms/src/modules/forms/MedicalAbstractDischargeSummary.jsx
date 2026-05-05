import { useMemo } from "react";
import "./MedicalAbstractDischargeSummary.css";

export default function MedicalAbstractDischargeSummary({ patientName, patientData }) {
	const name           = patientName                   || "BAYSA , BABY BOY";
	const hospitalNo     = patientData?.hospitalNo       || "000000000021041";
	const caseNum        = patientData?.caseNum          || "ADM-2026-010651";
	const dob            = patientData?.dob              || "April 22, 2026";
	const age            = patientData?.age              || "1 hour(s) old";
	const sex            = patientData?.sex              || "M";
	const civilStatus    = patientData?.civilStatus      || "N";
	const address        = patientData?.address          || "P10, DOÑA TELESFORA, TUBAY, AGUSAN DEL NORTE";
	const room           = patientData?.ward             || "OB GYNE - OB 2 - BED 03 - NB";
	const attendingPhysician = patientData?.attendingPhysician || "";
	const briefHistory   = patientData?.briefHistory     || "NSVD, CEPHALIC, NO CORD COIL, NO MECONIUM STAIN. 18 YO MOTHER G1P1 (1001). NO UTI, HPN, GDM. RBOW 1-2 HOURS.";
	const physicalFindings = patientData?.physicalFindings || "AWAKEALERT,  HEENT ESSENTIALLYNORMAL,  CL ESSENTIALLYNORMAL,  CVS ESSENTIALLYNORMAL,  ABD ESSENTIALLYNORMAL,  GUIE ESSENTIALLYNORMAL,  SKINEX ESSENTIALLYNORMAL,  NEURO ESSENTIALLYNORMAL,";
	const impression     = patientData?.impression       || "TERM MALE NEONATE DELIVERED NSVD CEPHALIC WITH AS 8,9 BS 40 WEEKS, BW 3.8 KGS, AGA";
	const medication     = patientData?.medication       || "Erythromycin";
	const procedures     = patientData?.procedures       || "";
	const finalDiagnosis = patientData?.finalDiagnosis   || "()";
	const recommendation = patientData?.recommendation   || "";

	const { dateEntered, timeEntered, generatedOn, generatedBy } = useMemo(() => {
		const now = new Date();
		const pad = (n) => String(n).padStart(2, "0");
		const h = now.getHours();
		const m = now.getMinutes();
		const ampm = h >= 12 ? "PM" : "AM";
		const hh = String(h % 12 || 12).padStart(2, "0");
		const timeEntered = `${hh}:${pad(m)} ${ampm}`;
		const y = now.getFullYear();
		const mo = pad(now.getMonth() + 1);
		const d = pad(now.getDate());
		const dateEntered = `${y}-${mo}-${d}`;
		const ampmLow = ampm.toLowerCase();
		const generatedOn = `${y}-${mo}-${d} ${hh}:${pad(m)} ${ampmLow}`;
		return { dateEntered, timeEntered, generatedOn, generatedBy: "TCP T. TCP" };
	}, []);

	return (
		<div className="mads-page">
			<br />
			<div className="mads-header">
				<div className="mads-header-col mads-col-left">
					<div className="mads-info-row">
						<span className="mads-lbl">Health Record No.:</span>
						<span className="mads-val">&nbsp;{hospitalNo}</span>
					</div>
					<div className="mads-info-row">
						<span className="mads-lbl">Name:</span>
						<span className="mads-val">&nbsp;{name}</span>
					</div>
					<div className="mads-info-row">
						<span className="mads-lbl">Date of Birth and Age:</span>
						<span className="mads-val">&nbsp;{dob} - {age}</span>
					</div>
					<div className="mads-info-row">
						<span className="mads-lbl">Sex:</span>
						<span className="mads-val">&nbsp;{sex}</span>
					</div>
					<div className="mads-info-row">
						<span className="mads-lbl">Civil Status:</span>
						<span className="mads-val">&nbsp;{civilStatus}</span>
					</div>
					<div className="mads-info-row">
						<span className="mads-lbl">Address:</span>
						<span className="mads-val">&nbsp;{address}</span>
					</div>
					<div className="mads-info-row">
						<span className="mads-lbl">Room:</span>
						<span className="mads-val">&nbsp;{room}</span>
					</div>
					<div className="mads-info-row">
						<span className="mads-lbl">Attending Physician:</span>
						<span className="mads-val">&nbsp;{attendingPhysician}</span>
					</div>
				</div>

				<div className="mads-header-col mads-col-right">
					<div className="mads-info-row">
						<span className="mads-lbl">Case Number:</span>
						<span className="mads-val">&nbsp;{caseNum}</span>
					</div>
					<div className="mads-info-row">
						<span className="mads-lbl">Date Entered:</span>
						<span className="mads-val">&nbsp;{dateEntered}</span>
					</div>
					<div className="mads-info-row">
						<span className="mads-lbl">Time Entered:</span>
						<span className="mads-val">&nbsp;{timeEntered}</span>
					</div>
				</div>
			</div>

			{/* ── Divider ── */}
			<hr className="mads-divider" />

			{/* ══════════════════════════════════════
			    ORDER OF RECORDING
			    ══════════════════════════════════════ */}
			<p className="mads-order-title">ORDER OF RECORDING:</p>

			{/* Each numbered item: label left, value right */}
			<div className="mads-item">
				<div className="mads-item-label">1. Brief History:</div>
				<div className="mads-item-value">{briefHistory}</div>
			</div>

			<div className="mads-item">
				<div className="mads-item-label">2. Pertinent Physical Findings:</div>
				<div className="mads-item-value">{physicalFindings}</div>
			</div>

			<div className="mads-item">
				<div className="mads-item-label">3. Impression:</div>
				<div className="mads-item-value">{impression}</div>
			</div>

			<div className="mads-item">
				<div className="mads-item-label">4. Medication:</div>
				<div className="mads-item-value">{medication}</div>
			</div>

			<div className="mads-item">
				<div className="mads-item-label">5. Procedures:</div>
				<div className="mads-item-value">{procedures}</div>
			</div>

			<div className="mads-item">
				<div className="mads-item-label">6. Final Diagnosis:</div>
				<div className="mads-item-value">{finalDiagnosis}</div>
			</div>

			<div className="mads-item">
				<div className="mads-item-label">7. Recommendation:</div>
				<div className="mads-item-value">{recommendation}</div>
			</div>

			{/* ── Signature block ── */}
            <br />
			<div className="mads-sig-wrap">
				<div className="mads-sig-block">
					<div className="mads-sig-line" />
					<p className="mads-sig-label">Physician's Signature Over Printed Name</p>
					<div className="mads-lic-row">
						<span className="mads-lic-lbl">Lic No.</span>
						<span className="mads-lic-line" />
					</div>
				</div>
			</div>

			{/* ── Footer ── */}
			<div className="mads-footer">
			Generated by: {generatedBy} on {generatedOn}
		</div>
		</div>	);
}