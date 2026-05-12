/**
 * useLabUploadWorkflow
 *
 * Manages the Lab Upload workflow state machine:
 *
 *   Step 1: PATIENT_SELECTED  (handled by useLabPatientPicker)
 *   Step 2: ENCOUNTER_SELECTED (handled by useLabPatientPicker)
 *   Step 3: ORDER_SELECTED     ← managed here
 *   Step 4: UPLOAD             ← managed here (Supabase-only)
 *   Step 5: FINALIZED          ← docointkey returned, upload complete
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
import { fetchEncounterOrders } from "../api/labUploadApi.js";
import { uploadLabResult as uploadLabResultToSupabase } from "../api/labUploadSupabase.js";
import { normalizeLabContextParams } from "../utils/labUploadUtils.js";
import { LAB_UPLOAD_API_TOKEN } from "../labUploadConfig.js";

export function useLabUploadWorkflow() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  const [uploadResults, setUploadResults] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [workflowError, setWorkflowError] = useState(null);

  const fetchOrdersForEncounter = useCallback(
    async (enccode, { type = "all", contextParams } = {}) => {
      setOrdersLoading(true);
      setOrdersError(null);
      setOrders([]);
      setSelectedOrder(null);
      setWorkflowError(null);

      try {
        const token = LAB_UPLOAD_API_TOKEN || contextParams?.token || "";
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

  const submitLabResult = useCallback(
    async ({ file, contextParams, patient, remarks }) => {
      setUploading(true);
      setWorkflowError(null);

      try {
        const enrichedContextParams = {
          ...normalizeLabContextParams(contextParams),
          enccode: selectedOrder?.enccode || contextParams?.enccode || "",
          hpercode: selectedOrder?.hpercode || contextParams?.hpercode || "",
          orcode: selectedOrder?.orcode || contextParams?.orcode || null,
          docointkey:
            selectedOrder?.docointkey || contextParams?.docointkey || null,
          procedureInstanceId:
            contextParams?.procedureInstanceId ||
            selectedOrder?.docointkey ||
            null,
        };

        const supabaseResult = await uploadLabResultToSupabase({
          file,
          contextParams: enrichedContextParams,
          patient,
          remarks,
        });

        const result = {
          ok: true,
          docointkey: enrichedContextParams.docointkey || null,
          uploadedPdfUrl: supabaseResult.uploadedPdfUrl,
          fileName: file.name,
          fileSize: file.size,
          patientId:
            enrichedContextParams.hpercode ||
            patient?.rawData?.hpercode ||
            patient?.contextParams?.hpercode ||
            null,
          encounterCode: enrichedContextParams.enccode || null,
          orderCode: enrichedContextParams.orcode || null,
          procedureInstanceId:
            enrichedContextParams.docointkey ||
            enrichedContextParams.procedureInstanceId ||
            null,
          message: "Lab result uploaded successfully.",
        };

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
        const message = err instanceof Error ? err.message : "Upload failed.";
        setWorkflowError(message);
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [selectedOrder],
  );

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
    selectedOrder,
    setSelectedOrder,
    orders,
    ordersLoading,
    ordersError,
    fetchOrdersForEncounter,
    uploadResults,
    uploading,
    workflowError,
    submitLabResult,
    resetWorkflow,
  };
}
