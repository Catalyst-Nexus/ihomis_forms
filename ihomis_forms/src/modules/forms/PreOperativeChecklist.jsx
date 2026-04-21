import './PreOperativeChecklist.css';

function ChecklistAnswerRow() {
  return (
    <div className="preop-answer-row">
      <span>[ ] Yes</span>
      <span>[ ] No</span>
      <span>[ ] Not Applicable</span>
    </div>
  );
}

export default function PreOperativeChecklist({ patientData = {} }) {
  const caseNumber = patientData?.caseNum || 'ADM-2026-010623';
  const hospitalNo = patientData?.hospitalNo || '000000000020997';
  const patientName = patientData?.patientName || patientData?.babyName || 'PELISCO, BABY GIRL';
  const surgeon = patientData?.surgeon || '';
  const sex = patientData?.sex || 'F';
  const age = patientData?.age || '0';
  const date = patientData?.date || 'April 21, 2026';
  const timeReceived = patientData?.timeReceived || '';

  return (
    <div className="preop-wrap">
      <section className="preop-page">
        <div className="preop-header-row">
          <div><span className="preop-label">Case Number:</span> <span className="preop-value">{caseNumber}</span></div>
        </div>

        <div className="preop-top-meta">
          <div><span className="preop-label">From:</span> NEWBORN Department</div>
          <div><span className="preop-label">Date:</span> {date}</div>
        </div>

        <div className="preop-second-meta">
          <div><span className="preop-label">Hospital No.:</span> {hospitalNo}</div>
          <div><span className="preop-label">Surgeon:</span> <span className="preop-line preop-line-short">{surgeon}</span></div>
        </div>

        <div className="preop-third-meta">
          <div><span className="preop-label">Patient Name:</span> {patientName}</div>
          <div><span className="preop-label">Sex:</span> {sex}</div>
          <div><span className="preop-label">Age:</span> {age}</div>
        </div>

        <div className="preop-list">
          <div className="preop-item">
            <div className="preop-question">1. Consent for surgery signed and witnessed?</div>
            <ChecklistAnswerRow />
          </div>

          <div className="preop-item">
            <div className="preop-question">2. Laboratory results in? w/ blood type; Patient's blood type.</div>
            <ChecklistAnswerRow />
          </div>

          <div className="preop-item">
            <div className="preop-question">3. Pre-op medicine compete?</div>
            <ChecklistAnswerRow />
          </div>

          <div className="preop-item">
            <div className="preop-question">4. Booked in Operating Room?</div>
            <ChecklistAnswerRow />
          </div>

          <div className="preop-item">
            <div className="preop-question">5. Anesthesiologist informed?</div>
            <ChecklistAnswerRow />
          </div>

          <div className="preop-item">
            <div className="preop-question">6. Surgeons Informed?</div>
            <ChecklistAnswerRow />
          </div>

          <div className="preop-item">
            <div className="preop-question">7. Patient's blood for O.R. use available?</div>
            <div className="preop-answer-stack">
              <ChecklistAnswerRow />
              <div className="preop-inline-note">
                <span>No. of bags needed:</span>
                <span className="preop-small-line" />
                <span>available at laboratory:</span>
                <span className="preop-small-line preop-small-line-wide" />
              </div>
            </div>
          </div>

          <div className="preop-item">
            <div className="preop-question">8. Sponged or bathed instructed?</div>
            <ChecklistAnswerRow />
          </div>

          <div className="preop-item">
            <div className="preop-question">9. On NPO instructed and maintained?</div>
            <ChecklistAnswerRow />
          </div>

          <div className="preop-item">
            <div className="preop-question">10. Oral hygiene given?</div>
            <ChecklistAnswerRow />
          </div>

          <div className="preop-item">
            <div className="preop-question">11. Jewelries and dentures removed?</div>
            <ChecklistAnswerRow />
          </div>

          <div className="preop-item">
            <div className="preop-question">12. Make-up and nail polish removed?</div>
            <ChecklistAnswerRow />
          </div>

          <div className="preop-item">
            <div className="preop-question">13. Enema done?</div>
            <ChecklistAnswerRow />
          </div>

          <div className="preop-item">
            <div className="preop-question">14. Patient's gown provided or changed?</div>
            <ChecklistAnswerRow />
          </div>

          <div className="preop-item">
            <div className="preop-question">15. Pre-op antibiotic meds given to prior to O.R?</div>
            <ChecklistAnswerRow />
          </div>

          <div className="preop-item">
            <div className="preop-question">16. Name of medication given:</div>
            <div className="preop-med-lines">
              <div><span>1.</span><span className="preop-fill-line" /></div>
              <div><span>2.</span><span className="preop-fill-line" /></div>
            </div>
          </div>

          <div className="preop-item">
            <div className="preop-question">17. Pre-op materials for operation in?</div>
            <ChecklistAnswerRow />
          </div>

          <div className="preop-item">
            <div className="preop-question">18. IV lines patent?</div>
            <ChecklistAnswerRow />
          </div>

          <div className="preop-item">
            <div className="preop-question">19.Latest Vital Signs?:</div>
            <div className="preop-vitals-grid">
              <div>BP: <span className="preop-fill-line preop-fill-line-sm" /></div>
              <div>PR: <span className="preop-fill-line preop-fill-line-sm" /></div>
              <div>RR: <span className="preop-fill-line preop-fill-line-sm" /></div>
              <div>SpO2: <span className="preop-fill-line preop-fill-line-sm" /></div>
              <div>TEMP: <span className="preop-fill-line preop-fill-line-sm" /></div>
              <div>FHT: <span className="preop-fill-line preop-fill-line-sm" /></div>
            </div>
          </div>
        </div>

        <div className="preop-signoff-block">
          <div className="preop-endorsed-by">Endorsed By:</div>
          <div className="preop-ward-line-wrap">
            <div className="preop-sign-line" />
            <div className="preop-sign-caption">WARD NOD(Printed name and Signature)</div>
          </div>
        </div>

        <div className="preop-shift-row">
          <div>AM shift: <span className="preop-shift-blank">(   )</span></div>
          <div>PM shift: <span className="preop-shift-blank">(   )</span></div>
          <div>NIGHT shift <span className="preop-shift-blank">(   )</span></div>
        </div>

        <div className="preop-received-row">
          <div>
            <span className="preop-endorsed-by">Received By:</span>
            <span className="preop-received-line" />
            <div className="preop-sign-caption">OR NOD(Signature over printed name)</div>
          </div>
          <div className="preop-time-received">Time Received: <span className="preop-time-line">{timeReceived}</span></div>
        </div>

        <div className="preop-footer">Generated by: TCP T. TCP on 2026-04-21 03:53 pm</div>
      </section>
    </div>
  );
}