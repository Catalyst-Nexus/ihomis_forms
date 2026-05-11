// ===================== DYNAMIC VALIDATION SCOPE =====================
// This module provides utilities for working with server-driven validations.
// All validation definitions and requirements come from Supabase, not hardcoded.

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
 * Fetch form -> validation mappings from the backend.
 * Backend route: GET `/api/validation/form/:formId` (returns validations array)
 * Returns: { ok: true, formId, validations: [...] } or throws.
 */
export async function fetchFormValidations(formId) {
  if (!formId) return null;
  const resp = await fetch(`/api/validation/form/${encodeURIComponent(formId)}`);
  if (!resp.ok) throw new Error(`Failed to load validations for form ${formId}: ${resp.statusText}`);
  return resp.json();
}

/**
 * Run validations for an encounter.
 * Calls POST /api/validation/validate with enccode and validation IDs.
 */
export async function runEncounterValidations(enccode, validationIds = []) {
  if (!enccode || !Array.isArray(validationIds) || validationIds.length === 0) {
    return { ok: false, error: 'enccode and validationIds required' };
  }

  const resp = await fetch('/api/validation/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enccode, validationIds })
  });

  if (!resp.ok) {
    throw new Error(`Validation failed: ${resp.statusText}`);
  }

  return resp.json();
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
