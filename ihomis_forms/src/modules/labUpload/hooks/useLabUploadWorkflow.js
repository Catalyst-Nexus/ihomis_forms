/**
 * useLabUploadWorkflow
 *
 * Manages the Lab Upload workflow state machine:
 *
 *   Step 1: PATIENT_SELECTED  (handled by useLabPatientPicker)
 *   Step 2: ENCOUNTER_SELECTED (handled by useLabPatientPicker)
 *   Step 3: ORDER_SELECTED     ← managed here
 *   Step 4: PROCEDURE_SELECTED ← managed here
 *   Step 5: UPLOAD             ← managed here (calls uploadMappedLabResult)
 *   Step 6: FINALIZED          ← docointkey returned, upload complete
 *
 * Usage:
 *   const {
 *     selectedOrder, selectedProcedure,
 *     orders, procedures,
 *     ordersLoading, proceduresLoading,
 *     ordersError, proceduresError,
 *     uploadResults,
 *     uploading,
 *     workflowError,
 *     setSelectedOrder, setSelectedProcedure,
 *     fetchOrdersForEncounter, fetchProceduresForOrder,
 *     submitLabResult, resetWorkflow,
 *   } = useLabUploadWorkflow();
 */

import { useCallback, useState } from "react";
import {
  fetchEncounterOrders,
  fetchOrderProcedures,
  uploadMappedLabResult,
} from "../api/labUploadApi.js";
import { normalizeLabContextParams } from "../utils/labUploadUtils.js";
import { LAB_UPLOAD_API_TOKEN } from "../labUploadConfig.js";

export const WORKFLOW_STEPS = {
  PATIENT_SELECTED: "PATIENT_SELECTED",
  ENCOUNTER_SELECTED: "ENCOUNTER_SELECTED",
  ORDER_SELECTED: "ORDER_SELECTED",
  PROCEDURE_SELECTED: "PROCEDURE_SELECTED",
  UPLOADING: "UPLOADING",
  FINALIZED: "FINALIZED",
};

export function useLabUploadWorkflow() {
  // ── Selection state ──────────────────────────────────────────
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProcedure, setSelectedProcedure] = useState(null);

  // ── Orders state ─────────────────────────────────────────────
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  // ── Procedures state ────────────────────────────────────────
  const [procedures, setProcedures] = useState([]);
  const [proceduresLoading, setProceduresLoading] = useState(false);
  const [proceduresError, setProceduresError] = useState(null);

  // ── Upload / finalize state ─────────────────────────────────
  const [uploadResults, setUploadResults] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [workflowError, setWorkflowError] = useState(null);

  /**
   * Fetch orders for a given encounter.
   * Resets procedure selection when encounter changes.
   *
   * @param {string} enccode - Encounter ID
   * @param {Object} [options]
   * @param {string} [options.type] - 'lab' | 'rad' | 'all'
   * @param {Object} [options.contextParams] - Optional context for token resolution
   */
  const fetchOrdersForEncounter = useCallback(
    async (enccode, { type = "all", contextParams } = {}) => {
      setOrdersLoading(true);
      setOrdersError(null);
      setOrders([]);
      setSelectedOrder(null);
      setProcedures([]);
      setSelectedProcedure(null);
      setWorkflowError(null);

      try {
        const token =
          LAB_UPLOAD_API_TOKEN ||
          contextParams?.token ||
          "";

        const result = await fetchEncounterOrders({
          enccode,
          type,
          status: "S",
          token,
        });

        setOrders(result.data || []);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch orders.";
        setOrdersError(message);
        setOrders([]);
        throw err;
      } finally {
        setOrdersLoading(false);
      }
    },
    [],
  );

  /**
   * Fetch procedures for a given order.
   * Resets procedure selection when order changes.
   *
   * @param {string} enccode - Encounter ID
   * @param {string} orcode - Order ID
   * @param {Object} [options]
   * @param {string} [options.procedureInstanceId] - Filter by specific procedure
   * @param {Object} [options.contextParams] - Optional context for token resolution
   */
  const fetchProceduresForOrder = useCallback(
    async (enccode, docointkey, { procedureInstanceId, contextParams } = {}) => {
      setProceduresLoading(true);
      setProceduresError(null);
      setProcedures([]);
      setSelectedProcedure(null);
      setWorkflowError(null);

      try {
        const token =
          LAB_UPLOAD_API_TOKEN ||
          contextParams?.token ||
          "";

        const result = await fetchOrderProcedures({
          enccode,
          docointkey,
          procedureInstanceId,
          token,
        });

        setProcedures(result.data || []);
        return result;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to fetch procedures.";
        setProceduresError(message);
        setProcedures([]);
        throw err;
      } finally {
        setProceduresLoading(false);
      }
    },
    [],
  );

  /**
   * Submit a single lab result (called per file).
   * Uses uploadMappedLabResult which sends to backend → Supabase.
   *
   * Returns the docointkey on success.
   */
  const submitLabResult = useCallback(
    async ({ file, contextParams, patient, remarks }) => {
      setUploading(true);
      setWorkflowError(null);

      try {
        const token =
          LAB_UPLOAD_API_TOKEN ||
          contextParams?.token ||
          "";

        // Merge selected order/procedure into contextParams
        const enrichedContextParams = {
          ...normalizeLabContextParams(contextParams),
          orcode: selectedOrder?.orcode || contextParams?.orcode || null,
          procedureInstanceId:
            selectedProcedure?.procedureInstanceId ||
            contextParams?.procedureInstanceId ||
            null,
        };

        const result = await uploadMappedLabResult({
          file,
          contextParams: enrichedContextParams,
          patient,
          remarks,
          token,
        });

        // Store successful result for display / retry tracking
        setUploadResults((prev) => [
          ...prev,
          {
            docointkey: result.docointkey,
            uploadedPdfUrl: result.uploadedPdfUrl,
            fileName: result.fileName,
            fileSize: result.fileSize,
            patientId: result.patientId,
            encounterCode: result.encounterCode,
            orderCode: result.orderCode,
            procedureInstanceId: result.procedureInstanceId,
            message: result.message,
            submittedAt: new Date().toISOString(),
          },
        ]);

        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Upload failed.";
        setWorkflowError(message);
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [selectedOrder, selectedProcedure],
  );

  /**
   * Clear all workflow state (reset to initial).
   * Called when user starts a new upload session.
   */
  const resetWorkflow = useCallback(() => {
    setSelectedOrder(null);
    setSelectedProcedure(null);
    setOrders([]);
    setProcedures([]);
    setOrdersLoading(false);
    setProceduresLoading(false);
    setOrdersError(null);
    setProceduresError(null);
    setUploadResults([]);
    setUploading(false);
    setWorkflowError(null);
  }, []);

  /**
   * Advance to a specific step (for UI navigation).
   */
  const goToStep = useCallback(
    () => {
      // Guard: only allow forward navigation for now
      // Full step management is derived from selection state
    },
    [],
  );

  return {
    // Selection state
    selectedOrder,
    setSelectedOrder,
    selectedProcedure,
    setSelectedProcedure,

    // Orders
    orders,
    ordersLoading,
    ordersError,
    fetchOrdersForEncounter,

    // Procedures
    procedures,
    proceduresLoading,
    proceduresError,
    fetchProceduresForOrder,

    // Upload results (list of submitted results)
    uploadResults,
    uploading,
    workflowError,
    submitLabResult,

    // Reset
    resetWorkflow,
    goToStep,
  };
}
