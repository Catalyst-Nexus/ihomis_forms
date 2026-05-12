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
 *     setProcedures,
 *     fetchOrdersForEncounter,
 *     submitLabResult, resetWorkflow,
 *   } = useLabUploadWorkflow();
 */

import { useCallback, useState } from "react";
import {
  fetchEncounterOrders,
  uploadMappedLabResult,
} from "../api/labUploadApi.js";
import {
  canUseSupabaseUploads,
  uploadLabResult as uploadLabResultToSupabase,
} from "../api/labUploadSupabase.js";
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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProcedure, setSelectedProcedure] = useState(null);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  const [procedures, setProcedures] = useState([]);
  const [proceduresLoading, setProceduresLoading] = useState(false);
  const [proceduresError, setProceduresError] = useState(null);

  const [uploadResults, setUploadResults] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [workflowError, setWorkflowError] = useState(null);

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
        const token = LAB_UPLOAD_API_TOKEN || contextParams?.token || "";

        const enrichedContextParams = {
          ...normalizeLabContextParams(contextParams),
          enccode: selectedOrder?.enccode || contextParams?.enccode || "",
          hpercode: selectedOrder?.hpercode || contextParams?.hpercode || "",
          orcode: selectedOrder?.orcode || contextParams?.orcode || null,
          docointkey:
            selectedOrder?.docointkey || contextParams?.docointkey || null,
          procedureInstanceId:
            selectedProcedure?.procedureInstanceId ||
            contextParams?.procedureInstanceId ||
            null,
        };

        let result;

        if (canUseSupabaseUploads()) {
          try {
            const supabaseResult = await uploadLabResultToSupabase({
              file,
              contextParams: enrichedContextParams,
              patient,
              remarks,
            });

            result = {
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
          } catch (supabaseError) {
            const fallbackMessage =
              supabaseError instanceof Error ? supabaseError.message : "";
            const shouldFallbackToApi =
              /fetch failed/i.test(fallbackMessage) ||
              /network error/i.test(fallbackMessage) ||
              /failed to fetch/i.test(fallbackMessage);

            if (!shouldFallbackToApi) {
              throw supabaseError;
            }

            result = await uploadMappedLabResult({
              file,
              contextParams: enrichedContextParams,
              patient,
              remarks,
              token,
            });
          }
        } else {
          result = await uploadMappedLabResult({
            file,
            contextParams: enrichedContextParams,
            patient,
            remarks,
            token,
          });
        }

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
    [selectedOrder, selectedProcedure],
  );

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

  return {
    selectedOrder,
    setSelectedOrder,
    selectedProcedure,
    setSelectedProcedure,
    procedures,
    setProcedures,
    proceduresLoading,
    proceduresError,
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
