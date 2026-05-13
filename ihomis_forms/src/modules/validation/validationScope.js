// ===================== DYNAMIC VALIDATION SCOPE =====================
// This module provides utilities for working with server-driven validations.
// All validation definitions and requirements come from Supabase, not hardcoded.

import { supabase } from "../../lib/supabaseClient.js";
import { getValidationApiBaseUrl } from "./validationApiConfig.js";

/**
 * Build a dynamic validation result from server validations and runtime results.
 */
export function buildValidationResults(serverValidations = [], runtimeResults = null) {
  if (!Array.isArray(serverValidations)) {
    return { checks: [], summary: { total: 0, passed: 0, failed: 0, hasIssues: false } };
  }

  const resultMap = {};
  if (runtimeResults && Array.isArray(runtimeResults.results)) {
    runtimeResults.results.forEach(r => {
      resultMap[String(r.validationId)] = {
        success: Boolean(r.success),
        info: r.info || {}
      };
    });
  }

  const checks = serverValidations.map(v => ({
    id: v.id,
    validationId: v.id,
    description: v.description || `Validation ${v.id}`,
    query: v.query || null,
    mappingId: v.mappingId || null,
    passed: resultMap[String(v.id)]?.success ?? null,
    info: resultMap[String(v.id)]?.info || {}
  }));

  const passed = checks.filter(c => c.passed === true).length;
  const failed = checks.filter(c => c.passed === false).length;

  return {
    checks,
    summary: {
      total: checks.length,
      passed,
      failed,
      allPassed: failed === 0,
      hasIssues: failed > 0,
      missing: checks.filter(c => c.passed === false).map(c => c.description)
    }
  };
}

/**
 * Format validation results for UI display.
 * Returns organized display data ready for rendering.
 */
export function formatValidationDisplay(validationResults) {
  if (!validationResults || !validationResults.checks) {
    return { items: [], summary: { total: 0, passed: 0, failed: 0, hasIssues: false } };
  }

  const passedItems = validationResults.checks.filter(c => c.passed === true);
  const failedItems = validationResults.checks.filter(c => c.passed === false);

  return {
    items: validationResults.checks,
    passedItems,
    failedItems,
    summary: validationResults.summary
  };
}

/**
 * Get validation status badge for a single check.
 */
export function getValidationStatus(check) {
  if (check.passed === true) return 'passed';
  if (check.passed === false) return 'failed';
  return 'pending';
}

/**
 * Transform server-provided validation rows into UI-friendly check objects.
 * Server validation rows are expected to have at least `id` and `description`.
 */
export function transformServerValidations(serverValidations = []) {
  if (!Array.isArray(serverValidations)) return [];
  return serverValidations.map((v) => ({
    id: String(v.id),
    label: v.description || `Validation ${v.id}`,
    message: v.description || '',
    query: v.query || null,
    mappingId: v.mappingId || null,
    passed: null,
  }));
}

/**
 * Merge server checks into the same shape used by buildValidationResults.
 * - `serverValidations` is the array returned from the backend `/api/validation/form/:formId`
 * - `results` is the runtime validation results object returned by the backend runner (optional)
 */
export function mergeServerValidations(serverValidations = [], results = null) {
  const checks = transformServerValidations(serverValidations);
  if (!results) return checks;

  // Map passed state from runtime results: results is expected to include
  // an array `results` with objects { validationId, success }
  const resultMap = {};
  if (Array.isArray(results.results)) {
    results.results.forEach((r) => {
      resultMap[String(r.validationId)] = Boolean(r.success);
    });
  }

  return checks.map((c) => ({ ...c, passed: resultMap[c.id] ?? c.passed }));
}

/**
 * Fetch form -> validation mappings from Supabase.
 * Queries formvalidator table WHERE formid = ?
 * Then joins with validation table to get validation details.
 * Returns: { ok: true, formId, validations: [...] } or { ok: false, error }
 */
export async function fetchFormValidations(formId) {
  if (!formId || !supabase) {
    return { ok: false, error: "formId or supabase client not available" };
  }

  try {
    // Get form-validation mappings from formvalidator table
    const { data: mappingData, error: mapError } = await supabase
      .from("formvalidator")
      .select("*")
      .eq("formid", Number(formId));

    if (mapError) throw mapError;

    if (!mappingData || mappingData.length === 0) {
      return { ok: true, formId, validations: [] };
    }

    // Get the validation details for each mapping
    const validationIds = mappingData.map((m) => m.validationid).filter(Boolean);
    const { data: validationData, error: valError } = await supabase
      .from("validation")
      .select("*")
      .in("id", validationIds);

    if (valError) throw valError;

    // Merge mapping and validation data
    const validations = mappingData.map((mapping) => {
      const validation = validationData?.find((v) => v.id === mapping.validationid) || {};
      return {
        ...validation,
        mappingId: mapping.id,
      };
    });

    return { ok: true, formId, validations };
  } catch (error) {
    console.error("Error fetching form validations from Supabase:", error);
    return { ok: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Run validations for an encounter.
 * Step 1: Fetch encounter data from backend /api/validation/data
 * Step 2: Execute each validation query against encounter data
 * Step 3: Return aggregated results
 */
export async function runEncounterValidations(enccode, validationIds = [], hpercode = "") {
  if (!enccode || !Array.isArray(validationIds) || validationIds.length === 0) {
    return { ok: false, error: "enccode and validationIds required" };
  }

  try {
    const validationApiBase = getValidationApiBaseUrl();

    // Step 1: Get encounter data from backend
    const dataRes = await fetch(validationApiBase ? `${validationApiBase}/data` : "/api/validation/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enccode, hpercode }),
    });

    if (!dataRes.ok) {
      throw new Error(`Failed to fetch encounter data: ${dataRes.status}`);
    }

    const dataPayload = await dataRes.json();
    if (!dataPayload.ok) {
      throw new Error(dataPayload.error || "Failed to get encounter data");
    }

    const encounterData = dataPayload.data;

    // Step 2: Get validation rules from Supabase
    if (!supabase) {
      throw new Error("Supabase client not configured");
    }

    const { data: validations, error: valError } = await supabase
      .from("validation")
      .select("*")
      .in("id", validationIds);

    if (valError) throw valError;

    if (!validations || validations.length === 0) {
      return {
        ok: true,
        enccode,
        encounter: encounterData,
        results: [],
        summary: { total: 0, passed: 0, failed: 0, allPassed: true, missing: [] }
      };
    }

    // Step 3: Execute validations in parallel
    const executionPromises = validations.map((validation) =>
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

    return {
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
    };
  } catch (error) {
    console.error("Error running encounter validations:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * COMPATIBILITY SHIM: buildFormValidationBreakdown (removed - was hardcoded)
 * This function is no longer available as we've moved to fully dynamic validation.
 * Use buildValidationResults() with server validations instead.
 * 
 * Throws an error if called to indicate the function needs to be refactored.
 */
export function buildFormValidationBreakdown() {
  throw new Error(
    'buildFormValidationBreakdown has been removed. Use buildValidationResults() with server validations from fetchFormValidations() instead.'
  );
}

/**
 * COMPATIBILITY SHIM: buildScopedValidationSummary (removed - was hardcoded)
 * This function is no longer available as we've moved to fully dynamic validation.
 * Use the summary from buildValidationResults() instead.
 * 
 * Throws an error if called to indicate the function needs to be refactored.
 */
export function buildScopedValidationSummary() {
  throw new Error(
    'buildScopedValidationSummary has been removed. Use buildValidationResults().summary instead.'
  );
}
