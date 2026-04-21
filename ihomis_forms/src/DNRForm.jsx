export default function DNRForm({ patientName = 'GARILLOS , JUDITH ALCAZAREN' }) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: '1.5', padding: '30px', maxWidth: '8.5in', margin: '0 auto', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
      <div style={{ marginBottom: '15px' }}>
        <span style={{ color: '#0066cc' }}>I understand that effective today, emergency care for patient {patientName} will be</span>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <span style={{ color: '#0066cc' }}>limited</span>
      </div>
      <div style={{ marginBottom: '15px' }}>
        as described below:
      </div>

      <div style={{ marginBottom: '10px', marginLeft: '20px' }}>
        <strong>A. In the event of</strong> <span style={{ color: '#0066cc' }}>(put a check mark on you choice)</span>
      </div>
      <div style={{ marginBottom: '8px', marginLeft: '40px' }}>
        [ ] Full cardiopulmonary Arrest (When both breathing and heartbeat stops)
      </div>
      <div style={{ marginBottom: '15px', marginLeft: '40px' }}>
        [ ] Pre Arrest Emergency (When breathing is labored or stopped and heart is still breathing)
      </div>

      <div style={{ marginBottom: '10px', marginLeft: '20px' }}>
        <strong>B. No procedures to restart breathing or heart functioning will be instituted such as:</strong>
      </div>
      <div style={{ marginBottom: '8px', marginLeft: '40px', color: '#0066cc' }}>
        (put a check mark on your choice)
      </div>
      <div style={{ marginBottom: '6px', marginLeft: '40px' }}>
        [ ] Chest compressions
      </div>
      <div style={{ marginBottom: '6px', marginLeft: '40px' }}>
        [ ] Assisted ventilations
      </div>
      <div style={{ marginBottom: '6px', marginLeft: '40px' }}>
        [ ] Intubations
      </div>
      <div style={{ marginBottom: '6px', marginLeft: '40px' }}>
        [ ] Defibrillations
      </div>
      <div style={{ marginBottom: '15px', marginLeft: '40px' }}>
        [ ] Administration of cardiotomic medications
      </div>

      <div style={{ marginBottom: '15px', marginLeft: '20px' }}>
        Other related medical procedures, please specify: _____________________________________________
      </div>

      <div style={{ marginBottom: '10px', color: '#0066cc' }}>
        I understand that DO NOT RESUSCITATE maybe revoked any time.
      </div>

      <div style={{ marginBottom: '20px', color: '#0066cc' }}>
        I understand the purpose and effect of this document and sign it knowingly and voluntarily
      </div>

      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', gap: '40px' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ borderBottom: '1px solid black', height: '35px', marginBottom: '5px' }}></div>
          <div style={{ fontSize: '11px', lineHeight: '1.3' }}>SIGNATURE OVER PRINTED NAME OF NEXT OF<br/>KIN</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '11px' }}>RELATIONSHIP TO THE PATIENT</div>
        </div>
        <div style={{ flex: 0.8, textAlign: 'center' }}>
          <div style={{ fontSize: '11px', marginBottom: '30px' }}>April 20, 2026</div>
          <div style={{ fontSize: '11px' }}>DATE</div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid black', borderBottom: '1px solid black', padding: '15px 0', marginBottom: '20px' }}>
        <div style={{ marginBottom: '15px', fontWeight: 'bold' }}>WITNESS:</div>
        <div style={{ borderBottom: '1px solid black', height: '20px', marginBottom: '20px' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '40px', marginTop: '20px' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid black', height: '20px', marginBottom: '5px' }}></div>
            <div style={{ fontSize: '11px' }}>WITNESS SIGNATURE OVER PRINTED NAME</div>
          </div>
          <div style={{ flex: 0.8, textAlign: 'center' }}>
            <div style={{ fontSize: '11px', marginBottom: '20px' }}>April 20, 2026</div>
            <div style={{ fontSize: '11px' }}>DATE</div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '15px', fontWeight: 'bold', fontSize: '13px' }}>
        REVOCATION
      </div>

      <div style={{ color: '#0066cc', marginBottom: '20px' }}>
        I hereby revoke the above DO NOT RESUSCITATE (DNR) / DO NOT INTUBATE request
      </div>

      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', gap: '40px' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ borderBottom: '1px solid black', height: '35px', marginBottom: '5px' }}></div>
          <div style={{ fontSize: '11px', lineHeight: '1.3' }}>SIGNATURE OVER PRINTED NAME OF NEXT OF<br/>KIN</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '11px' }}>RELATIONSHIP TO THE PATIENT</div>
        </div>
        <div style={{ flex: 0.8, textAlign: 'center' }}>
          <div style={{ fontSize: '11px', marginBottom: '30px' }}>April 20, 2026</div>
          <div style={{ fontSize: '11px' }}>DATE</div>
        </div>
      </div>

      <div style={{ borderLeft: '1px solid black', paddingLeft: '15px', marginBottom: '15px', fontSize: '11px' }}>
        <div style={{ marginBottom: '8px', color: '#0066cc' }}>
          <strong>Note:</strong>
        </div>
        <div style={{ marginBottom: '8px' }}>
          In case the patient is incapable of giving consent for healthcare decision and third party consent is required, the following persons, in the order of priority stated hereunder, may give consent as healthcare proxy:
        </div>
        <div style={{ marginLeft: '15px', marginBottom: '8px' }}>
          <div>1. Spouse</div>
          <div>2. Son or daughter of legal age</div>
          <div>3. Parents</div>
          <div>4. Brother or sister of legal age</div>
          <div>5. Guardian</div>
        </div>
        <div>
          (As cited in Republic Act No. 4226 otherwise known as Hospital Licensure Act)
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '20px', fontSize: '10px', color: '#666' }}>
        Generated by: TCP T. TCP on 2026-04-20 03:18 pm
      </div>
    </div>
  );
}
