import './DNRForm.css';

export default function DNRForm({ patientName = 'DOE, JHON' }) {
  return (
    <div className="dnr-form">
      <div className="form-section">
        <p className="form-text">
          I understand that effective today, emergency care for patient <span className="patient-name">{patientName}</span> will be
          limited as described below:
        </p>

        <div className="form-subsection">
          <p className="subsection-title">A. In the event of (put a check mark on you choice)</p>
          <div className="checkbox-group">
            <div className="checkbox-item">
              <input type="checkbox" id="fullCardio" />
              <label htmlFor="fullCardio">
                [ ] Full cardiopulmonary Arrest (When heart stops and heartbeat stops)
              </label>
            </div>
            <div className="checkbox-item">
              <input type="checkbox" id="preArrest" />
              <label htmlFor="preArrest">
                [ ] Pre Arrest Emergency (When breathing is labored or stopped and heart is still breathing)
              </label>
            </div>
          </div>
        </div>

        <div className="form-subsection">
          <p className="subsection-title">B. No procedures to restart pumping of heart functioning will be instituted such as:</p>
          <div className="checkbox-group">
            <div className="checkbox-item">
              <input type="checkbox" id="closed" />
              <label htmlFor="closed">[ ] Closed compressions</label>
            </div>
            <div className="checkbox-item">
              <input type="checkbox" id="assisted" />
              <label htmlFor="assisted">[ ] Assisted ventilations</label>
            </div>
            <div className="checkbox-item">
              <input type="checkbox" id="intubations" />
              <label htmlFor="intubations">[ ] Intubations</label>
            </div>
            <div className="checkbox-item">
              <input type="checkbox" id="defibrillations" />
              <label htmlFor="defibrillations">[ ] Defibrillations</label>
            </div>
            <div className="checkbox-item">
              <input type="checkbox" id="cardiotomic" />
              <label htmlFor="cardiotomic">[ ] Administration of cardiotomic medications</label>
            </div>
          </div>
          <p className="form-text-small">(put a check mark on you choice)</p>
        </div>

        <p className="form-text">
          Other related medical procedures, please specify: _____________________________________
        </p>
        <p className="form-text">
          I understand that DO NOT RESUSCITATE maybe revoked any time.
        </p>
        <p className="form-text">
          I understand the purpose and effect of this document and sign it knowingly and voluntarily
        </p>
      </div>

      <div className="signature-section">
        <div className="signature-row">
          <div className="signature-box">
            <div className="line"></div>
            <p className="signature-label">SIGNATURE OVER PRINTED NAME OF NEXT OF KIN</p>
          </div>
          <div className="signature-box">
            <p className="signature-label">RELATIONSHIP TO THE PATIENT</p>
          </div>
          <div className="signature-box">
            <p className="date-display">April 20, 2026</p>
            <p className="signature-label">DATE</p>
          </div>
        </div>
      </div>

      <div className="witness-section">
        <p className="witness-title">WITNESS:</p>
        <div className="witness-row">
          <div className="line"></div>
        </div>
        <p className="blank-line"></p>
        <div className="witness-signature">
          <div className="line"></div>
          <p className="signature-label">WITNESS SIGNATURE OVER PRINTED NAME</p>
          <p className="date-display">April 20, 2026</p>
          <p className="signature-label">DATE</p>
        </div>
      </div>

      <div className="revocation-section">
        <h3 className="revocation-title">REVOCATION</h3>
        <p className="form-text">
          I hereby revoke the above DO NOT RESUSCITATE (DNR) / DO NOT INTUBATE request
        </p>
        <div className="signature-row">
          <div className="signature-box">
            <div className="line"></div>
            <p className="signature-label">SIGNATURE OVER PRINTED NAME OF NEXT OF KIN</p>
          </div>
          <div className="signature-box">
            <p className="signature-label">RELATIONSHIP TO THE PATIENT</p>
          </div>
          <div className="signature-box">
            <p className="date-display">April 20, 2026</p>
            <p className="signature-label">DATE</p>
          </div>
        </div>
      </div>

      <div className="note-section">
        <p className="note-text">
          <strong>Note:</strong> In case the patient is incapable of giving consent for healthcare decision and third party consent is required, the following persons, in the order of priority stated hereunder, may give consent as healthcare proxy:
        </p>
        <ol className="priority-list">
          <li>Spouse</li>
          <li>Son or daughter of legal age</li>
          <li>Parents</li>
          <li>Brother or sister of legal age</li>
          <li>Guardian</li>
        </ol>
        <p className="form-text-small">(As per Republic Act No. 4226 otherwise known as Hospital Licensure Act)</p>
      </div>

      <div className="footer-text">
        <p className="generated-by">Generated by: TCP T. TCP on 2026-04-20 03:18 pm</p>
      </div>
    </div>
  );
}
