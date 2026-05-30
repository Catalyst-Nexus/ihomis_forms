import { useCallback, useEffect, useMemo, useState } from "react";
import ValidationPage from "./ValidationPage";
import { buildFallbackForms } from "../forms/formCatalog";
import { supabase } from "../../lib/supabaseClient";
import { getValidationApiBaseUrl } from "./validationApiConfig";
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
  const fallbackForms = useMemo(() => buildFallbackForms(), []);

  const loadMappings = useCallback(async (formId) => {
    if (!formId || !supabase) {
      setMappings([]);
      return;
    }

    try {
      // Get form-validation mappings from Supabase
      const { data: mappingData, error: mapError } = await supabase
        .from("formvalidator")
        .select("*")
        .eq("formid", Number(formId));

      if (mapError) throw mapError;

      if (!mappingData || mappingData.length === 0) {
        setMappings([]);
        return;
      }

      // Get the associated validation rules
      const validationIds = mappingData.map((m) => m.validationid).filter(Boolean);
      const { data: validationData, error: valError } = await supabase
        .from("validation")
        .select("*")
        .in("id", validationIds);

      if (valError) throw valError;

      // Merge mapping and validation data
      const merged = mappingData.map((mapping) => {
        const validation = validationData?.find((v) => v.id === mapping.validationid) || {};
        return {
          ...validation,
          mappingId: mapping.id,
        };
      });

      setMappings(merged);
    } catch (error) {
      console.error("Error loading mappings:", error);
      setMappings([]);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        if (!supabase) {
          throw new Error("Supabase client not configured");
        }

        // Fetch hospital forms from Supabase
        const { data: formsData, error: formsError } = await supabase
          .from("hospital_forms")
          .select("*")
          .order("id", { ascending: true });

        if (formsError) throw formsError;

        // Fetch all validations from Supabase
        const { data: validationsData, error: validationsError } = await supabase
          .from("validation")
          .select("*")
          .order("id", { ascending: true });

        if (validationsError) throw validationsError;

        const loadedForms = formsData && formsData.length > 0 ? formsData : fallbackForms;
        const loadedValidations = validationsData && Array.isArray(validationsData) ? validationsData : [];

        if (loadedForms.length > 0) {
          setForms(loadedForms);
          setSelectedFormId((currentValue) => currentValue || String(loadedForms[0]?.id || ""));
        }

        if (loadedValidations.length > 0) {
          setValidations(loadedValidations);
          setSelectedValidationId((currentValue) => currentValue || String(loadedValidations[0]?.id || ""));
        }
      } catch (error) {
        console.error("Error loading data from Supabase:", error);
        setForms(fallbackForms);
        setSelectedFormId((currentValue) => currentValue || String(fallbackForms[0]?.id || ""));
        setErrorMessage(
          error instanceof Error 
            ? error.message 
            : "Failed to load data from Supabase. Check if tables exist and RLS policies allow access."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [fallbackForms]);

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
    if (!selectedFormId || !selectedValidationId || !supabase) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const { data, error } = await supabase
        .from("formvalidator")
        .insert([{
          formid: Number(selectedFormId),
          validationid: Number(selectedValidationId),
        }])
        .select();

      if (error) throw error;

      setStatusMessage("Validation linked to form successfully.");
      await loadMappings(selectedFormId);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create mapping");
      console.error("Error creating mapping:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteMapping(mappingId) {
    if (!supabase) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const { error } = await supabase
        .from("formvalidator")
        .delete()
        .eq("id", mappingId);

      if (error) throw error;

      setStatusMessage("Validation mapping removed.");
      await loadMappings(selectedFormId);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to delete mapping");
      console.error("Error deleting mapping:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addValidation() {
    if (!newQuery || !supabase) return;
    setLoading(true);
    setErrorMessage("");
    try {
      // Insert new validation rule
      const { data: validationData, error: valError } = await supabase
        .from("validation")
        .insert([{
          description: newDesc || null,
          query: newQuery,
        }])
        .select();

      if (valError) throw valError;

      const newValidationId = validationData?.[0]?.id;
      if (!newValidationId) throw new Error("Failed to create validation rule");

      // Create mapping if formId is selected
      if (selectedFormId) {
        const { error: mapError } = await supabase
          .from("formvalidator")
          .insert([{
            formid: Number(selectedFormId),
            validationid: newValidationId,
          }]);

        if (mapError) throw mapError;
      }

      setNewDesc("");
      setNewQuery("");
      setStatusMessage("Validation created and linked successfully.");

      // Reload validations
      const { data: allValidations, error: allValError } = await supabase
        .from("validation")
        .select("*")
        .order("id", { ascending: true });

      if (allValError) throw allValError;

      if (allValidations) {
        setValidations(allValidations);
        setSelectedValidationId((currentValue) => currentValue || String(newValidationId));
      }

      // Reload mappings
      if (selectedFormId) {
        await loadMappings(selectedFormId);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to add validation");
      console.error("Error adding validation:", error);
    } finally {
      setLoading(false);
    }
  }

  async function runValidations() {
    if (!selectedFormId || !enccode) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const validationApiBase = getValidationApiBaseUrl();

      // Get encounter data from backend
      const dataRes = await fetch(validationApiBase ? `${validationApiBase}/data` : "/api/validation/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enccode }),
      });

      if (!dataRes.ok) throw new Error("Failed to fetch encounter data");
      const dataPayload = await dataRes.json();

      if (!dataPayload.ok) throw new Error(dataPayload.error || "Failed to get encounter data");

      const encounterData = dataPayload.data;
      const formMappings = mappings;

      if (formMappings.length === 0) {
        setResults({
          ok: true,
          enccode,
          encounter: encounterData,
          results: [],
          summary: { total: 0, passed: 0, failed: 0, allPassed: true, missing: [] },
        });
        return;
      }

      // Execute validations in parallel
      const executionPromises = formMappings.map((validation) =>
        fetch(validationApiBase ? `${validationApiBase}/execute` : "/api/validation/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: validation.query,
            enccode: encounterData.enccode,
            hpercode: encounterData.hpercode,
            validationId: validation.id,
            description: validation.description,
          }),
        })
          .then((res) => (res.ok ? res.json() : Promise.reject(res)))
          .catch((err) => ({
            ok: false,
            validationId: validation.id,
            description: validation.description,
            success: false,
            error: err.message || "Execution failed",
          }))
      );

      const results = await Promise.all(executionPromises);
      const passed = results.filter((r) => r.success).length;
      const failed = results.length - passed;

      setResults({
        ok: true,
        enccode,
        encounter: encounterData,
        results,
        summary: {
          total: results.length,
          passed,
          failed,
          allPassed: failed === 0,
          missing: results
            .filter((r) => !r.success)
            .map((r) => r.description)
            .filter(Boolean),
        },
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to run validations");
      console.error("Error running validations:", error);
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
        {/* <button
          type="button"
          className={showPatientValidation ? "validation-switcher-btn" : "validation-switcher-btn validation-switcher-btn--active"}
          onClick={() => setViewMode("admin")}
        >
          Mapping Admin
        </button> */}
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



export default ValidationModule;
export { ValidationAdminPanel };
