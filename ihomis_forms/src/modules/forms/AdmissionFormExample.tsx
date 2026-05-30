import { useState } from "react";
import { useValidationDirect } from "../validation/hooks/useValidationDirect";

/**
 * Example: AdmissionForm using the new useValidationDirect hook
 * 
 * This form demonstrates:
 * 1. Using useValidationDirect to fetch encounter data + validation rules from Supabase
 * 2. Displaying validation results directly to the user
 * 3. Handling loading, error, and success states
 */
export default function AdmissionFormExample({ selectedPatient, formId = 1 }) {
  const [isValidating, setIsValidating] = useState(false);

  // Use the new validation hook
  const {
    encounterData,
    validationRules,
    results,
    summary,
    loading,
    error,
    refresh,
  } = useValidationDirect({
    selectedPatient,
    formId,
  });

  const handleValidateClick = async () => {
    setIsValidating(true);
    await refresh();
    setIsValidating(false);
  };

  return (
    <div className="admission-form">
      <h2>Admission Form - New Validation Flow</h2>

      {/* Patient Info */}
      {encounterData && (
        <div className="encounter-info">
          <h3>Encounter Data</h3>
          <dl>
            <dt>Encounter Code:</dt>
            <dd>{encounterData.enccode}</dd>
            <dt>Patient Code:</dt>
            <dd>{encounterData.hpercode}</dd>
            <dt>Encounter Type:</dt>
            <dd>{encounterData.toecode}</dd>
            <dt>Match Type:</dt>
            <dd>{encounterData.matchedBy}</dd>
          </dl>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-spinner">
          Validating... Please wait.
        </div>
      )}

      {/* Validation Rules */}
      {validationRules.length > 0 && (
        <div className="validation-rules">
          <h3>Validation Rules ({validationRules.length})</h3>
          <ul>
            {validationRules.map((rule) => (
              <li key={rule.id}>
                <strong>{rule.description}</strong>
                <code>{rule.query}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Validation Results */}
      {results.length > 0 && (
        <div className="validation-results">
          <h3>Results</h3>
          
          {/* Summary */}
          <div className={`summary ${summary.allPassed ? 'passed' : 'failed'}`}>
            <p>
              {summary.passed} / {summary.total} validations passed
            </p>
            {!summary.allPassed && (
              <div className="missing-items">
                <strong>Missing items:</strong>
                <ul>
                  {summary.missing.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Detailed Results */}
          <table className="results-table">
            <thead>
              <tr>
                <th>Validation</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.validationId} className={result.success ? 'pass' : 'fail'}>
                  <td>{result.description}</td>
                  <td>
                    <span className={`badge ${result.success ? 'success' : 'error'}`}>
                      {result.success ? '✓ Pass' : '✗ Fail'}
                    </span>
                  </td>
                  <td>
                    {result.info?.rowCount !== undefined && (
                      <span>Found {result.info.rowCount} record(s)</span>
                    )}
                    {result.error && <span className="error-text">{result.error}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Validate Button */}
      <div className="form-actions">
        <button
          onClick={handleValidateClick}
          disabled={loading || isValidating}
          className="btn-primary"
        >
          {isValidating || loading ? 'Validating...' : 'Run Validations'}
        </button>
      </div>

      <style jsx>{`
        .admission-form {
          padding: 20px;
          max-width: 900px;
          font-family: system-ui, sans-serif;
        }

        h2 {
          margin-bottom: 20px;
          color: #333;
        }

        h3 {
          margin-top: 20px;
          margin-bottom: 10px;
          color: #555;
          border-bottom: 2px solid #ddd;
          padding-bottom: 5px;
        }

        .encounter-info {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .encounter-info dl {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 10px;
        }

        .encounter-info dt {
          font-weight: bold;
          color: #333;
        }

        .encounter-info dd {
          margin: 0;
          color: #666;
        }

        .error-message {
          background: #fee;
          border: 1px solid #fcc;
          color: #c00;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 15px;
        }

        .loading-spinner {
          text-align: center;
          padding: 20px;
          color: #666;
          font-style: italic;
        }

        .validation-rules {
          background: #f0f4f8;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .validation-rules ul {
          list-style: none;
          padding: 0;
        }

        .validation-rules li {
          padding: 10px;
          margin: 5px 0;
          background: white;
          border-left: 3px solid #0066cc;
          border-radius: 2px;
        }

        .validation-rules strong {
          display: block;
          margin-bottom: 5px;
          color: #333;
        }

        .validation-rules code {
          display: block;
          background: #f5f5f5;
          padding: 8px;
          border-radius: 3px;
          font-size: 12px;
          overflow-x: auto;
          color: #666;
        }

        .validation-results {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 20px;
        }

        .summary {
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 15px;
          font-weight: bold;
        }

        .summary.passed {
          background: #efe;
          border: 1px solid #0c0;
          color: #060;
        }

        .summary.failed {
          background: #fee;
          border: 1px solid #f00;
          color: #c00;
        }

        .missing-items {
          font-weight: normal;
          margin-top: 10px;
        }

        .missing-items ul {
          list-style: disc;
          margin-left: 20px;
          margin-top: 5px;
        }

        .results-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        .results-table th {
          background: #333;
          color: white;
          padding: 10px;
          text-align: left;
          font-weight: bold;
        }

        .results-table td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }

        .results-table tr.pass td {
          background: #f0f8f0;
        }

        .results-table tr.fail td {
          background: #f8f0f0;
        }

        .badge {
          padding: 4px 8px;
          border-radius: 3px;
          font-weight: bold;
          font-size: 12px;
        }

        .badge.success {
          background: #0c0;
          color: white;
        }

        .badge.error {
          background: #f00;
          color: white;
        }

        .error-text {
          color: #c00;
          font-size: 12px;
        }

        .form-actions {
          margin-top: 20px;
          display: flex;
          gap: 10px;
        }

        .btn-primary {
          background: #0066cc;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: background 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0052a3;
        }

        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}
