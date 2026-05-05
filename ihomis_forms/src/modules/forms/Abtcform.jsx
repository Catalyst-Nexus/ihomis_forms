import { useMemo } from "react";
import "./AbtcForm.css";

export default function AbtcForm({ patientName, patientData }) {
	const name        = patientName;
	const caseNo      = patientData?.caseNo;
	const srCitizen   = patientData?.srCitizen;
	const hospitalNo  = patientData?.hospitalNo;
	const address     = patientData?.address;
	const telNo       = patientData?.telNo;
	const sex         = patientData?.sex;
	const civilStatus = patientData?.civilStatus;
	const religion    = patientData?.religion
	const nationality = patientData?.nationality;
	const birthPlace  = patientData?.birthPlace;
	const birthdate   = patientData?.birthdate;
	const age         = patientData?.age;
	const occupation  = patientData?.occupation;
	const indigenous  = patientData?.indigenous;

	const generatedOn = useMemo(() => {
		const now = new Date();
		const pad = (n) => String(n).padStart(2, "0");
		const timeStr = now.toLocaleTimeString("en-US", {
			hour: "2-digit", minute: "2-digit", hour12: true,
		}).toLowerCase();
		return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${timeStr}`;
	}, []);

	const generatedBy = "TCP T. TCP";

	return (
		<div className="abtc-page">
			<br />
			<table className="abtc-table">
				<colgroup>
					<col style={{ width: "79%" }} />
					<col style={{ width: "21%" }} />
				</colgroup>
				<tbody>

					{/* Row 1 */}
					<tr>
						<td className="abtc-td-title">
							ABTC OUT-PATIENT RECORD
						</td>
						<td className="abtc-td-caseno" rowSpan={2}>
							<span className="abtc-caseno-label">CASE NO.: </span>
							<span className="abtc-caseno-value">{caseNo}</span>
						</td>
					</tr>

					{/* Row 2 */}
					<tr>
						<td className="abtc-td-inner">
							<table className="abtc-inner-table">
								<colgroup>
									<col style={{ width: "35%" }} />
									<col style={{ width: "65%" }} />
								</colgroup>
								<tbody>
									<tr>
										<td className="abtc-inner-cell abtc-inner-border-r">
											<strong>SR. CITIZEN NO.:</strong>
											{srCitizen ? <span> {srCitizen}</span> : null}
										</td>
										<td className="abtc-inner-cell">
											<strong>HOSPITAL NO.: </strong>{hospitalNo}
										</td>
									</tr>
								</tbody>
							</table>
						</td>
					</tr>

					{/* Row 3 — Patient Name */}
					<tr>
						<td className="abtc-td-patname" colSpan={2}>
							<span className="abtc-patname-label">PATIENT NAME: </span>
							<span className="abtc-patname-value">{name}</span>
						</td>
					</tr>

					{/* Row 4 — Address + right fields */}
					<tr>
						<td className="abtc-td-inner" colSpan={2}>
							<table className="abtc-inner-table">
								<colgroup>
									<col style={{ width: "55%" }} />
									<col style={{ width: "19%" }} />
									<col style={{ width: "13%" }} />
									<col style={{ width: "13%" }} />
								</colgroup>
								<tbody>
									<tr>
										<td className="abtc-inner-cell abtc-inner-border-r">
											<span className="abtc-addr-label">PERMANENT ADDRESS</span>
											<span className="abtc-addr-value">{address}</span>
										</td>
										<td className="abtc-inner-cell abtc-inner-border-r">
											<span className="abtc-right-label">TEL.NO./CP NO.</span>
											<span className="abtc-right-value">{telNo}</span>
										</td>
										<td className="abtc-inner-cell abtc-inner-border-r">
											<span className="abtc-right-label">Sex</span>
											<span className="abtc-right-value">{sex}</span>
										</td>
										<td className="abtc-inner-cell">
											<span className="abtc-right-label">Civil Status</span>
											<span className="abtc-right-value">{civilStatus}</span>
										</td>
									</tr>
								</tbody>
							</table>
						</td>
					</tr>

				</tbody>
			</table>

			<table className="abtc-table abtc-demo-table">
				<colgroup>
					<col style={{ width: "15%" }} />
					<col style={{ width: "11%" }} />
					<col style={{ width: "16%" }} />
					<col style={{ width: "14%" }} />
					<col style={{ width: "14%" }} />
					<col style={{ width: "16%" }} />
					<col style={{ width: "14%" }} />
				</colgroup>
				<tbody>
					{/* Header labels row */}
					<tr>
						<td className="abtc-td-demo-hdr">BIRTHDATE</td>
						<td className="abtc-td-demo-hdr">AGE</td>
						<td className="abtc-td-demo-hdr">BIRTH PLACE</td>
						<td className="abtc-td-demo-hdr">NATIONALITY</td>
						<td className="abtc-td-demo-hdr">RELIGION</td>
						<td className="abtc-td-demo-hdr">OCCUPATION</td>
						<td className="abtc-td-demo-hdr">INDIGENOUS</td>
					</tr>
					{/* Values row */}
					<tr>
						<td className="abtc-td-demo-val">{birthdate}</td>
						<td className="abtc-td-demo-val">{age}</td>
						<td className="abtc-td-demo-val">{birthPlace}</td>
						<td className="abtc-td-demo-val">{nationality}</td>
						<td className="abtc-td-demo-val">{religion}</td>
						<td className="abtc-td-demo-val">{occupation}</td>
						<td className="abtc-td-demo-val">{indigenous}</td>
					</tr>
				</tbody>
			</table>

			{/* ═══════════════════════════════════════════════
			    HISTORY OF EXPOSURE
			    ═══════════════════════════════════════════════ */}
			<p className="abtc-section-title">HISTORY OF EXPOSURE</p>

			<div className="abtc-exposure-grid">
				<div className="abtc-exp-field">
					<span className="abtc-exp-label">Date of Exposure:</span>
					<span className="abtc-exp-line" />
				</div>
				<div className="abtc-exp-field">
					<span className="abtc-exp-label">Time of Exposure:</span>
					<span className="abtc-exp-line" />
				</div>

				<div className="abtc-exp-field">
					<span className="abtc-exp-label">Source of Exposure:</span>
					<span className="abtc-exp-line" />
				</div>
				<div className="abtc-exp-field">
					<span className="abtc-exp-label">Animal Status:</span>
					<span className="abtc-exp-line" />
				</div>

				<div className="abtc-exp-field">
					<span className="abtc-exp-label">Type of Exposure:</span>
					<span className="abtc-exp-line" />
				</div>
				<div className="abtc-exp-field">
					<span className="abtc-exp-label">Category Exposure:</span>
					<span className="abtc-exp-line" />
				</div>

				<div className="abtc-exp-field">
					<span className="abtc-exp-label">Place of Incident:</span>
					<span className="abtc-exp-line" />
				</div>
				<div />
			</div>

			<p className="abtc-remarks-title">REMARKS:</p>
			<div className="abtc-footer">
				Generated by: {generatedBy} on {generatedOn}
			</div>

		</div>
	);
}