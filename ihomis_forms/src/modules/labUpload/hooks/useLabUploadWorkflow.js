/**
 * useLabUploadWorkflow
 *
 * Manages the Lab Upload workflow state machine:
 *
 *   Step 1: PATIENT_SELECTED  (handled by useLabPatientPicker)
 *   Step 2: ENCOUNTER_SELECTED (handled by useLabPatientPicker)
 *   Step 3: ORDER_SELECTED     ← managed here (hdocord IS the order)
 *   Step 4: UPLOAD             ← managed here (calls uploadMappedLabResult)
 *   Step 5: FINALIZED          ← docointkey returned, upload complete
 *
 * Note: hdocord IS the order table - no separate pcchrgcod fetch needed.
 * Each hdocord row already contains docointkey, proccode, orcode.
 *
 * Usage:
 *   const {
 *     selectedOrder,
 *     orders,
 *     ordersLoading,
 *     ordersError,
 *     uploadResults,
 *     uploading,
 *     workflowError,
 *     setSelectedOrder,
 *     fetchOrdersForEncounter,
 *     submitLabResult, resetWorkflow,
 *   } = useLabUploadWorkflow();
 */

import { useCallback, useState } from "react";
import {
  fetchEncounterOrders,
  uploadMappedLabResult,
} from "../api/labUploadApi.js";
import { normalizeLabContextParams } from "../utils/labUploadUtils.js";
import { LAB_UPLOAD_API_TOKEN } from "../labUploadConfig.js";

export const WORKFLOW_STEPS = {
  PATIENT_SELECTED: "PATIENT_SELECTED",
  ENCOUNTER_SELECTED: "ENCOUNTER_SELECTED",
  ORDER_SELECTED: "ORDER_SELECTED",
  UPLOADING: "UPLOADING",
  FINALIZED: "FINALIZED",
};

export function useLabUploadWorkflow() {
  // ── Selection state ──────────────────────────────────────────
  const [selectedOrder, setSelectedOrder] = useState(null);

  // ── Orders state ─────────────────────────────────────────────
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  // ── Upload / finalize state ─────────────────────────────────
  const [uploadResults, setUploadResults] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [workflowError, setWorkflowError] = useState(null);

  /**
   * Fetch orders for a given encounter from hdocord.
   * Resets order selection when encounter changes.
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
   * Submit a single lab result (called per file).
   * Uses uploadMappedLabResult which sends to backend → Supabase.
   * Links uploaded file to the selected order's docointkey.
   *
   * @param {Object} params
   * @param {File} params.file - PDF file to upload
   * @param {Object} params.contextParams - Contains hpercode, enccode, etc.
   * @param {Object} params.patient - Patient info
   * @param {string} params.remarks - Optional remarks
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

        // Merge selected order into contextParams
        const enrichedContextParams = {
          ...normalizeLabContextParams(contextParams),
          // Include docointkey from selected order for linking
          docointkey: selectedOrder?.docointkey || contextParams?.docointkey || null,
          // Include orcode (LABOR/RADIO)
          orcode: selectedOrder?.orcode || contextParams?.orcode || null,
          // Include proccode (double 'c')
          proccode: selectedOrder?.proccode || contextParams?.proccode || null,
        };

        const result = await uploadMappedLabResult({
          file,
          contextParams: enrichedContextParams,
          patient,
          remarks,
          token,
        });

        // Store successful result for display / tracking
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
    [selectedOrder],
  );

  /**
   * Clear all workflow state (reset to initial).
   * Called when user starts a new upload session.
   */
  const resetWorkflow = useCallback(() => {
    setSelectedOrder(null);
    setOrders([]);
    setOrdersLoading(false);
    setOrdersError(null);
    setUploadResults([]);
    setUploading(false);
    setWorkflowError(null);
  }, []);

  return {
    // Selection state
    selectedOrder,
    setSelectedOrder,

    // Orders
    orders,
    ordersLoading,
    ordersError,
    fetchOrdersForEncounter,

    // Upload results (list of submitted results)
    uploadResults,
    uploading,
    workflowError,
    submitLabResult,

    // Reset
    resetWorkflow,
  };
}
