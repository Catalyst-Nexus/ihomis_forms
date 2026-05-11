import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import ValidationPage from "./ValidationPage.jsx";
import "./ValidationModule.css";

function ValidationAdminPanel() {
  const [forms, setForms] = useState([]);
  const [validations, setValidations] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [selectedValidationId, setSelectedValidationId] = useState("");
  const [enccode, setEnccode] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newQuery, setNewQuery] = useState("");
  const [results, setResults] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadMappings = useCallback(async (formId) => {
    if (!formId) {
      setMappings([]);
      return;
    }

    const res = await fetch(`/api/validation/form/${encodeURIComponent(formId)}`);
    const data = await res.json();
    if (data.ok) {
      setMappings(data.validations || []);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const [formsResponse, validationsResponse] = await Promise.all([
          fetch("/api/validation/forms"),
          fetch("/api/validation/validations"),
        ]);

        if (!formsResponse.ok) {
          throw new Error(`Failed to load hospital forms (${formsResponse.status})`);
        }

        if (!validationsResponse.ok) {
          throw new Error(`Failed to load validations (${validationsResponse.status})`);
        }

        const formsData = await formsResponse.json();
        const validationsData = await validationsResponse.json();

        if (formsData.ok) {
          setForms(formsData.forms || []);
          setSelectedFormId((currentValue) => currentValue || String(formsData.forms?.[0]?.id || ""));
        }

        if (validationsData.ok) {
          setValidations(validationsData.validations || []);
          setSelectedValidationId((currentValue) => currentValue || String(validationsData.validations?.[0]?.id || ""));
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to load dropdown data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedFormId) {
      void loadMappings(selectedFormId);
    }
  }, [selectedFormId, loadMappings]);

  const selectedForm = useMemo(
    () => forms.find((item) => String(item.id) === String(selectedFormId)) || null,
    [forms, selectedFormId],
  );

  async function createMapping() {
    if (!selectedFormId || !selectedValidationId) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/validation/map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: Number(selectedFormId),
          validationId: Number(selectedValidationId),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatusMessage("Validation linked to form successfully.");
        await loadMappings(selectedFormId);
      }
    } finally {
      setLoading(false);
    }
  }

  async function deleteMapping(mappingId) {
    setLoading(true);
    try {
      const res = await fetch(`/api/validation/form/${encodeURIComponent(mappingId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.ok) {
        setStatusMessage("Validation mapping removed.");
        await loadMappings(selectedFormId);
      }
    } finally {
      setLoading(false);
    }
  }

  async function addValidation() {
    if (!newQuery) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/validation/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: selectedFormId,
          description: newDesc,
          query: newQuery,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setNewDesc("");
        setNewQuery("");
        setStatusMessage("Validation created and linked.");

        const validationsResponse = await fetch("/api/validation/validations");
        const validationsData = await validationsResponse.json();
        if (validationsData.ok) {
          setValidations(validationsData.validations || []);
          setSelectedValidationId((currentValue) => currentValue || String(validationsData.validations?.[0]?.id || ""));
        }

        await loadMappings(selectedFormId);
      }
    } finally {
      setLoading(false);
    }
  }

  async function runValidations() {
    if (!selectedFormId || !enccode) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/validation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: Number(selectedFormId), enccode }),
      });
      const data = await res.json();
      setResults(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="validation-module">
      <h2>Validation Manager</h2>
      {statusMessage ? <p className="validation-status">{statusMessage}</p> : null}
      {errorMessage ? <p className="validation-error">{errorMessage}</p> : null}

      <section className="validation-add">
        <h3>Map existing validation to form</h3>
        <label>Hospital Form</label>
        <select value={selectedFormId} onChange={(e) => setSelectedFormId(e.target.value)}>
          {forms.map((form) => (
            <option key={form.id} value={form.id}>
              {form.id} - {form.description} {form.component_name ? `(${form.component_name})` : ""}
            </option>
          ))}
        </select>

        <label>Validation</label>
        <select
          value={selectedValidationId}
          onChange={(e) => setSelectedValidationId(e.target.value)}
        >
          {validations.map((validation) => (
            <option key={validation.id} value={validation.id}>
              {validation.id} - {validation.description}
            </option>
          ))}
        </select>

        <button onClick={createMapping} disabled={loading || !selectedFormId || !selectedValidationId}>
          Link validation to form
        </button>
      </section>

      <section className="validation-list">
        <h3>Current mappings for selected form</h3>
        <p>
          {selectedForm
            ? `${selectedForm.id} - ${selectedForm.description}`
            : "Select a form to view mappings"}
        </p>
        {mappings.length === 0 ? <p>No validations mapped to this form.</p> : null}
        <table>
          <thead>
            <tr>
              <th>Mapping ID</th>
              <th>Validation ID</th>
              <th>Description</th>
              <th>Query</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((mapping) => (
              <tr key={mapping.mappingId || mapping.id}>
                <td>{mapping.mappingId || "-"}</td>
                <td>{mapping.id}</td>
                <td>{mapping.description}</td>
                <td>
                  <pre className="query">{mapping.query}</pre>
                </td>
                <td>
                  {mapping.mappingId ? (
                    <button onClick={() => deleteMapping(mapping.mappingId)} disabled={loading}>
                      Remove
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="validation-add">
        <h3>Add a new validation row</h3>
        <label>Description</label>
        <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
        <label>Query (use $ENCCODE$ or {"{{enccode}}"})</label>
        <textarea value={newQuery} onChange={(e) => setNewQuery(e.target.value)} />
        <button onClick={addValidation} disabled={loading || !newQuery}>
          Add
        </button>
      </section>

      <section className="validation-run">
        <h3>Run validations</h3>
        <label>Encounter code</label>
        <input value={enccode} onChange={(e) => setEnccode(e.target.value)} />
        <button onClick={runValidations} disabled={loading || !enccode || !selectedFormId}>
          Run
        </button>
      </section>

      {results && (
        <section className="validation-results">
          <h3>Results</h3>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </section>
      )}
    </div>
  );
}

function ValidationModule({
  selectedPatient,
  enccode = null,
  selectedForms = null,
  onProceed,
  onBackToForms,
  onChangePatient,
}) {
  const hasPatientValidationContext = Boolean(
    onProceed || onBackToForms || onChangePatient || selectedForms || enccode,
  );
  const [viewMode, setViewMode] = useState(
    hasPatientValidationContext ? "patient" : "admin",
  );

  useEffect(() => {
    setViewMode(hasPatientValidationContext ? "patient" : "admin");
  }, [hasPatientValidationContext]);

  const showPatientValidation = viewMode === "patient";

  return (
    <div className="validation-module-shell">
      <div className="validation-module-switcher">
        <button
          type="button"
          className={showPatientValidation ? "validation-switcher-btn" : "validation-switcher-btn validation-switcher-btn--active"}
          onClick={() => setViewMode("admin")}
        >
          Mapping Admin
        </button>
        <button
          type="button"
          className={showPatientValidation ? "validation-switcher-btn validation-switcher-btn--active" : "validation-switcher-btn"}
          onClick={() => setViewMode("patient")}
        >
          Patient Validation
        </button>
      </div>

      {showPatientValidation ? (
        <ValidationPage
          selectedPatient={selectedPatient}
          enccode={enccode}
          selectedForms={selectedForms}
          onProceed={onProceed}
          onBackToForms={onBackToForms}
          onChangePatient={onChangePatient}
        />
      ) : (
        <ValidationAdminPanel />
      )}
    </div>
  );
}

ValidationModule.propTypes = {
  selectedPatient: PropTypes.shape({
    id: PropTypes.string,
    displayName: PropTypes.string,
    rawData: PropTypes.object,
    contextParams: PropTypes.object,
  }),
  enccode: PropTypes.string,
  selectedForms: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  onProceed: PropTypes.func,
  onBackToForms: PropTypes.func,
  onChangePatient: PropTypes.func,
};

export default ValidationModule;
