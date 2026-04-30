import "./tracking.css";

function Tracking({
  selectedPatient,
  trackingRows,
  onBackToModuleNavigator,
  onChangePatient,
}) {
  return (
    <div className="tracking-page">
      <main className="tracking-shell">
        <header className="tracking-title-box">
          <h1>Agusan del Norte Provincial Health Office</h1>
          <p>CHART Tracking System</p>
          {selectedPatient ? (
            <small>Selected Patient: {selectedPatient.displayName}</small>
          ) : null}
        </header>

        <div className="tracking-filters">
          <div className="tracking-filter-row">
            <label htmlFor="tracking-log">Select Patient Log</label>
            <select id="tracking-log" defaultValue="emergency-room">
              <option value="emergency-room">Emergency Room</option>
              <option value="in-patient">Admitted</option>
              <option value="out-patient">Out-Patient</option>
            </select>
          </div>

          <div className="tracking-filter-row">
            <input
              type="text"
              placeholder="Enter full name (Last, First Middle)"
              readOnly
            />
            <button type="button">Search</button>
          </div>

          <div className="tracking-filter-row">
            <input type="text" placeholder="Select Admission Date" readOnly />
            <button type="button">Search</button>
          </div>

          <button type="button" className="tracking-update-admin">
            Update Admin
          </button>
        </div>

        <section className="tracking-actions">
          <button type="button" onClick={onBackToModuleNavigator}>
            Back to Module Navigator
          </button>
          <button type="button" onClick={onChangePatient}>
            Change Patient
          </button>
        </section>

        <div className="tracking-table-wrap">
          <table className="tracking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Hospital No.</th>
                <th>Admitted Date</th>
                <th>Discharged Date</th>
                <th>Patient Name</th>
                <th>PHIC</th>
                <th>Records Received</th>
                <th>Verify</th>
                <th>Scan</th>
                <th>Send</th>
                <th>Records Filed</th>
                <th>Claim Map</th>
                <th>ACPM</th>
              </tr>
            </thead>
            <tbody>
              {trackingRows.length > 0 ? (
                trackingRows.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>{row.hospitalNo}</td>
                    <td>{row.admittedDate}</td>
                    <td>{row.dischargedDate}</td>
                    <td>{row.patientName}</td>
                    <td>{row.phic}</td>
                    <td>{row.recordsReceived}</td>
                    <td>{row.verify}</td>
                    <td>{row.scan}</td>
                    <td>{row.send}</td>
                    <td>{row.recordsFiled}</td>
                    <td>{row.claimMap}</td>
                    <td>{row.acpm}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13">No tracking records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Tracking;
