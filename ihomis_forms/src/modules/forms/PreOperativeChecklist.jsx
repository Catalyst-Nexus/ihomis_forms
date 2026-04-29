import { useMemo } from "react";
import "./PreOperativeChecklist.css";

export default function PreOperativeChecklist({ patientName, patientData }) {
	const name       = patientName             || "BAYSA , BABY BOY";
	const sex        = patientData?.sex        || "M";
	const age        = patientData?.age        || "0";
	const caseNum    = patientData?.caseNum    || "ADM-2026-010651";
	const hospitalNo = patientData?.hospitalNo || "000000000021041";
	const dept       = patientData?.dept       || "NEWBORN Department";

	const { dateStr, generatedOn } = useMemo(() => {
		const now  = new Date();
		const pad  = (n) => String(n).padStart(2, "0");
		const h    = now.getHours();
		const m    = now.getMinutes();
		const ampm = h >= 12 ? "pm" : "am";
		const hh   = String(h % 12 || 12).padStart(2, "0");
		const timeStr   = `${hh}:${pad(m)} ${ampm}`;
		const dateStr   = now.toLocaleDateString("en-US", {
			year: "numeric", month: "long", day: "numeric",
		});
		const generatedOn = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${timeStr}`;
		return { dateStr, generatedOn };
	}, []);

	/* ── Yes / No / NA check row ── */
	const CheckRow = ({ num, label, naLabel = "Not Applicable" }) => (
		<div className="poc-check-row">
			<div className="poc-check-question">{num}.&nbsp;{label}</div>
			<div className="poc-check-options">
				<span>[ ] Yes</span>
				<span>[ ] No</span>
				<span>[ ] {naLabel}</span>
			</div>
		</div>
	);

	/* ── Underline field ── */
	const UL = ({ width = "100px" }) => (
		<span className="poc-ul" style={{ width }} />
	);

	return (
		<div className="poc-page">
			<div className="poc-header">
				<br />
				<div className="poc-hrow">
					<div className="poc-hleft">
						<span className="poc-lbl">Case Number:</span>
						<span className="poc-val">&nbsp;{caseNum}</span>
					</div>
					<div className="poc-hright">
						<span className="poc-lbl">Date:</span>
						<span className="poc-val">&nbsp;{dateStr}</span>
					</div>
				</div>

				{/* Row 2: From dept */}
				<div className="poc-hrow">
					<div className="poc-hleft">
						<span className="poc-lbl-normal">From:</span>
						<span className="poc-val">&nbsp;{dept}</span>
					</div>
				</div>

				{/* Row 3: Hospital No. | Surgeon */}
				<div className="poc-hrow">
					<div className="poc-hleft">
						<span className="poc-lbl">Hospital No.:</span>
						<span className="poc-val">&nbsp;{hospitalNo}</span>
					</div>
					<div className="poc-hright">
						<span className="poc-lbl-normal">Surgeon:</span>
						<UL width="160px" />
					</div>
				</div>

				{/* Row 4: Patient Name | Sex | Age */}
				<div className="poc-hrow">
					<div className="poc-hleft">
						<span className="poc-lbl">Patient Name:</span>
						<span className="poc-val">&nbsp;{name}</span>
					</div>
					<div className="poc-hright poc-hright-multi">
						<span>
							<span className="poc-lbl-normal">Sex:</span>
							<span className="poc-val">&nbsp;{sex}</span>
						</span>
						<span>
							<span className="poc-lbl-normal">Age:</span>
							<span className="poc-val">&nbsp;{age}</span>
						</span>
					</div>
				</div>

			</div>

			{/* ══════════════════════════════════════
			    CHECKLIST ITEMS
			    ══════════════════════════════════════ */}
			<div className="poc-checklist">

				<CheckRow num="1"  label="Consent for surgery signed and witnessed?" />
				<CheckRow num="2"  label="Laboratory results in? w/ blood type; Patient's blood type:" />
				<CheckRow num="3"  label="Pre-op medicine compete?" />
				<CheckRow num="4"  label="Booked in Operating Room?" />
				<CheckRow num="5"  label="Anesthesiologist informed?" />
				<CheckRow num="6"  label="Surgeons Informed?" />

				{/* Item 7 */}
				<div className="poc-check-row">
					<div className="poc-check-question">7.&nbsp;Patient's blood for O.R. use availabe?</div>
					<div className="poc-check-options">
						<span>[ ] Yes</span>
						<span>[ ] No</span>
						<span>[ ] Not Applicable</span>
					</div>
				</div>
				<div className="poc-item7-extra">
					<span className="poc-lbl-normal">No. of bags needed:</span>
					<UL width="55px" />
					<span className="poc-lbl-normal" style={{ marginLeft: "20px" }}>
						No. of bags available at laboratory.
					</span>
				</div>

				<CheckRow num="8"  label="Sponged or bathed instructed?"               naLabel="Not applicable" />
				<CheckRow num="9"  label="On NPO instructed and maintained?"            naLabel="Not applicable" />
				<CheckRow num="10" label="Oral hygiene given?"                           naLabel="Not applicable" />
				<CheckRow num="11" label="Jewelries and dentures removed?"               naLabel="Not applicable" />
				<CheckRow num="12" label="Make-up and nail polish removed?"              naLabel="Not applicable" />
				<CheckRow num="13" label="Enema done?"                                   naLabel="Not applicable" />
				<CheckRow num="14" label="Patient's gown provided or changed?"           naLabel="Not applicable" />
				<CheckRow num="15" label="Pre-op antibiotic meds given to prior to O.R?" naLabel="Not applicable" />

				{/* Item 16 */}
				<div className="poc-item16">
					<div className="poc-lbl-normal">16.&nbsp;Name of medication given:</div>
					<div className="poc-med-lines">
						<div className="poc-med-line-row">
							<span>1.</span><UL width="220px" />
						</div>
						<div className="poc-med-line-row">
							<span>2.</span><UL width="220px" />
						</div>
					</div>
				</div>

				<CheckRow num="17" label="Pre-op materials for operation in?"  naLabel="Not applicable" />
				<CheckRow num="18" label="IV lines patent?"                     naLabel="Not applicable" />

				{/* Item 19 — Vital Signs */}
				<div className="poc-item19">
					<div className="poc-lbl-normal">19.&nbsp;Latest Vital Signs:</div>
					<div className="poc-vitals-row">
						<span className="poc-lbl-normal">BP:</span><UL width="70px" />
						<span className="poc-lbl-normal" style={{ marginLeft: "28px" }}>PR:</span><UL width="70px" />
						<span className="poc-lbl-normal" style={{ marginLeft: "28px" }}>RR:</span><UL width="70px" />
					</div>
					<div className="poc-vitals-row poc-vitals-row2">
						<span className="poc-lbl-normal">Sp02:</span><UL width="70px" />
						<span className="poc-lbl-normal" style={{ marginLeft: "28px" }}>TEMP:</span><UL width="70px" />
						<span className="poc-lbl-normal" style={{ marginLeft: "28px" }}>FHT:</span><UL width="70px" />
					</div>
				</div>

			</div>

			{/* ══════════════════════════════════════
			    ENDORSEMENT SECTION
			    ══════════════════════════════════════ */}
			<div className="poc-endorse-section">

				{/* Endorsed By */}
				<div className="poc-endorse-row">
					<span className="poc-lbl-normal" style={{ whiteSpace: "nowrap" }}>
						Endorsed By:
					</span>
					<div className="poc-endorse-sig">
						<UL width="260px" />
						<p className="poc-endorse-label">WARD NOD (Printed name and Signature)</p>
					</div>
				</div>

				{/* AM / PM / NIGHT shift */}
				<div className="poc-shift-row">
					<span className="poc-lbl-normal">AM shift:&nbsp;(&nbsp;</span>
					<UL width="70px" />
					<span className="poc-lbl-normal">&nbsp;)</span>

					<span className="poc-lbl-normal" style={{ marginLeft: "24px" }}>PM shift:&nbsp;(&nbsp;</span>
					<UL width="70px" />
					<span className="poc-lbl-normal">&nbsp;)</span>

					<span className="poc-lbl-normal" style={{ marginLeft: "24px" }}>NIGHT shift:&nbsp;(&nbsp;</span>
					<UL width="70px" />
					<span className="poc-lbl-normal">&nbsp;)</span>
				</div>

				{/* Received By */}
				<div className="poc-received-row">
					<span className="poc-lbl-normal" style={{ whiteSpace: "nowrap" }}>
						Received By:
					</span>
					<div className="poc-received-sig">
						<UL width="230px" />
						<p className="poc-endorse-label">OR NOD (Signature over printed name)</p>
					</div>
					<div className="poc-time-received">
						<span className="poc-lbl-normal">Time Received:</span>
						<UL width="80px" />
					</div>
				</div>

			</div>

			{/* ── Footer ── */}
			<div className="poc-footer">
				Generated by: TCP T. TCP on {generatedOn}
			</div>

		</div>
	);
}