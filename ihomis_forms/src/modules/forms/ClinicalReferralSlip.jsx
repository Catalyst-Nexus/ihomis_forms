import { useMemo } from "react";
import "./ClinicalReferralSlip.css";

export default function ClinicalReferralSlip({ patientName, patientData }) {
	const name    = patientName          || "PELISCO , BABY GIRL";
	const address = patientData?.address || "";
	const age     = patientData?.age     || "";
	const sex     = patientData?.sex     || "F";

	const { dateStr, timeStr, generatedOn } = useMemo(() => {
		const now = new Date();
		const dateStr = now.toLocaleDateString("en-US", {
			year: "numeric", month: "long", day: "numeric",
		});
		const timeStr = now.toLocaleTimeString("en-US", {
			hour: "2-digit", minute: "2-digit",
		});
		const pad = (n) => String(n).padStart(2, "0");
		const generatedOn = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${timeStr}`;
		return { dateStr, timeStr, generatedOn };
	}, []);

	const generatedBy = "TCP T. TCP";

	return (
		<div className="crs-wrapper">

			{/* ════════════════════════════════════════════════
			    PAGE 1 — CLINICAL REFERRAL SLIP
			    ════════════════════════════════════════════════ */}
			<div className="crs-page">

				<div className="crs-border-top" />

				<p className="crs-instruction">
					Instruction: Fill up 1 copy only then 1 photocopy after filling up
				</p>

				<div className="crs-datetime-row">
					<span>
						<span className="crs-field-label">Date:</span>
						<span className="crs-value">{dateStr}</span>
					</span>
					<span>
						<span className="crs-field-label">Time:</span>
						<span className="crs-value">{timeStr}</span>
					</span>
				</div>

				<div className="crs-field-row">
					<span className="crs-field-label">REFERRED TO:</span>
					<span className="crs-line" />
				</div>

				<p className="crs-plain-row">
					<span className="crs-field-label">Name of Patient: </span>
					<span className="crs-value">{name}</span>
				</p>

				<p className="crs-plain-row">
					<span className="crs-field-label">Address: </span>
					<span className="crs-value">{address}</span>
				</p>

				<div className="crs-multi-row">
					<div className="crs-multi-pair">
						<span className="crs-field-label">Occupation:</span>
						<span className="crs-line-fixed" style={{ minWidth: "130px" }} />
					</div>
					<div className="crs-multi-pair">
						<span className="crs-field-label">Age:</span>
						<span className="crs-value">{age}</span>
					</div>
					<div className="crs-multi-pair">
						<span className="crs-field-label">SEX:</span>
						<span className="crs-value">{sex}</span>
					</div>
				</div>

				<div className="crs-field-row">
					<span className="crs-field-label">CHIEF COMPLAINTS:</span>
					<span className="crs-value" style={{ marginLeft: "4px" }}>------</span>
				</div>

				<div className="crs-field-row">
					<span className="crs-field-label">PERTINENT FINDINGS:</span>
					<span className="crs-line" />
				</div>

				<div className="crs-vitals-row">
					<div className="crs-vital-pair">
						<span className="crs-field-label">VITAL SIGNS:&nbsp;&nbsp;BP:</span>
						<span className="crs-line-fixed" style={{ minWidth: "110px" }} />
					</div>
					<div className="crs-vital-pair">
						<span className="crs-field-label">T:</span>
						<span className="crs-line-fixed" style={{ minWidth: "110px" }} />
					</div>
					<div className="crs-vital-pair">
						<span className="crs-field-label">HR:</span>
						<span className="crs-line-fixed" style={{ minWidth: "110px" }} />
					</div>
				</div>

				<div className="crs-vitals-row" style={{ paddingLeft: "84px" }}>
					<div className="crs-vital-pair">
						<span className="crs-field-label">RR:</span>
						<span className="crs-line-fixed" style={{ minWidth: "110px" }} />
					</div>
					<div className="crs-vital-pair">
						<span className="crs-field-label">WT:</span>
						<span className="crs-line-fixed" style={{ minWidth: "110px" }} />
					</div>
					<div className="crs-vital-pair">
						<span className="crs-field-label">HT:</span>
						<span className="crs-line-fixed" style={{ minWidth: "110px" }} />
					</div>
				</div>

				<div className="crs-multiline-block">
					<div className="crs-field-row">
						<span className="crs-field-label">IMPRESSION:</span>
						<span className="crs-line" />
					</div>
					<span className="crs-blank-line" />
					<span className="crs-blank-line" />
					<span className="crs-blank-line" />
					<span className="crs-blank-line" />
				</div>

				<p className="crs-ob-note">NOTE: OB HISTORY:</p>

				<div className="crs-lmp-row">
					<div className="crs-lmp-pair">
						<span className="crs-field-label">LMP:</span>
						<span className="crs-line-fixed" style={{ minWidth: "100px" }} />
					</div>
					<div className="crs-lmp-pair">
						<span className="crs-field-label">AOG:</span>
						<span className="crs-line-fixed" style={{ minWidth: "120px" }} />
					</div>
					<div className="crs-lmp-pair">
						<span className="crs-field-label">EDC:</span>
						<span className="crs-line-fixed" style={{ minWidth: "120px" }} />
					</div>
				</div>

				<div className="crs-multiline-block">
					<div className="crs-field-row">
						<span className="crs-field-label">ACTION TAKEN:</span>
						<span className="crs-line" />
					</div>
					<span className="crs-blank-line" />
					<span className="crs-blank-line" />
					<span className="crs-blank-line" />
                    <span className="crs-blank-line" />
				</div>

				

				<div className="crs-bottom-field">
					<span className="crs-field-label">REASON FOR REFERRAL:</span>
					<span className="crs-line" />
				</div>

				<div className="crs-bottom-field">
					<span className="crs-field-label">REFERRING PHYSICIAN:</span>
					<span className="crs-line" />
				</div>

				<div className="crs-bottom-field">
					<span className="crs-field-label">ESCORT:</span>
					<span className="crs-line-fixed" style={{ minWidth: "280px" }} />
				</div>

				<div className="crs-bottom-field">
					<span className="crs-field-label">STATUS OF PATIENT UPON ARRIVAL:</span>
					<span className="crs-line" />
				</div>

				<div className="crs-bottom-field">
					<span className="crs-field-label">RECEIVING STAFF:</span>
					<span className="crs-line-fixed" style={{ minWidth: "200px" }} />
				</div>

				<div className="crs-half-row">
					<div className="crs-half-pair">
						<span className="crs-field-label">DATE RECEIVED:</span>
						<span className="crs-line-fixed" style={{ minWidth: "130px" }} />
					</div>
					<div className="crs-half-pair">
						<span className="crs-field-label">TIME RECEIVED:</span>
						<span className="crs-line-fixed" style={{ minWidth: "130px" }} />
					</div>
				</div>

				<div className="crs-footer">
					Generated by: {generatedBy} on {generatedOn}
				</div>

			</div>{/* end PAGE 1 */}


			{/* ════════════════════════════════════════════════
			    PAGE 2 — RETURN SLIP
			    ════════════════════════════════════════════════ */}
			<div className="crs-page">

				<div className="crs-border-top" />

				<h2 className="crs-return-title">RETURN SLIP</h2>


				<div className="crs-datetime-row">
					<span>
						<span className="crs-field-label">Date:</span>
						<span className="crs-line-fixed" style={{ minWidth: "130px" }} />
					</span>
					<span>
						<span className="crs-field-label">Time:</span>
						<span className="crs-line-fixed" style={{ minWidth: "130px" }} />
					</span>
				</div>

				<div className="crs-field-row">
					<span className="crs-field-label">REFERRED FACILITY:</span>
					<span className="crs-line" />
				</div>

		

				<div className="crs-multi-row">
					<div className="crs-multi-pair">
						<span className="crs-field-label">NAME OF PATIENT:</span>
						<span className="crs-value">&nbsp;{name}</span>
					</div>
					<div className="crs-multi-pair">
						<span className="crs-field-label">Age:</span>
						<span className="crs-value">&nbsp;{age}</span>
					</div>
					<div className="crs-multi-pair">
						<span className="crs-field-label">SEX:</span>
						<span className="crs-value">&nbsp;{sex}</span>
					</div>
				</div>

				<div className="crs-bottom-field">
					<span className="crs-field-label">STATUS OF PATIENT UPON ARRIVAL:</span>
					<span className="crs-line" />
				</div>

				<div className="crs-bottom-field">
					<span className="crs-field-label">DIAGNOSIS/IMPRESSION:</span>
					<span className="crs-line" />
				</div>

				<div className="crs-bottom-field">
					<span className="crs-field-label">INITIAL ACTION TAKEN/RECOMMENDATION:</span>
					<span className="crs-line" />
				</div>

				<div className="crs-sig-wrap">
					<div className="crs-sig-block">
						<div className="crs-sig-line" />
						<p className="crs-sig-name">NAME AND SIGNATURE OF RECEIVING STAFF</p>
						<p className="crs-sig-sub">[PLEASE PRINT NAME LEGIBLY]</p>
						<div className="crs-sig-desig-row">
							<span className="crs-field-label">DESIGNATION:</span>
							<span className="crs-line-fixed" style={{ minWidth: "100px" }} />
						</div>
					</div>
				</div>

				<div className="crs-footer">
					Generated by: {generatedBy} on {generatedOn}
				</div>

			</div>{/* end PAGE 2 */}

		</div>/* end .crs-wrapper */
	);
}