import { useEffect, useMemo, useState } from "react";
import { fetchLabPatientCandidates } from "../api/labUploadApi.js";

function useLabPatientPicker({ contextUrl, token, initialContextParams }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(Boolean(contextUrl));
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectionConfirmed, setSelectionConfirmed] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadPatientCandidates() {
      if (!contextUrl) {
        setLoading(false);
        setSelectionConfirmed(true);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const response = await fetchLabPatientCandidates({
          contextUrl,
          token,
          contextParams: initialContextParams,
          limit: 100,
        });

        if (!isActive) {
          return;
        }

        const candidates = response.candidates || [];
        setPatients(candidates);

        if (!candidates.length) {
          setSelectionConfirmed(true);
          setSelectedPatientId("");
          return;
        }

        const preferredCandidate =
          candidates.find((candidate) => {
            const candidateDocointkey = candidate.contextParams?.docointkey || "";
            return (
              Boolean(initialContextParams.docointkey) &&
              candidateDocointkey === initialContextParams.docointkey
            );
          }) || candidates[0];

        setSelectedPatientId(preferredCandidate.id);
        setSelectionConfirmed(false);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setPatients([]);
        setSelectionConfirmed(true);
        setSelectedPatientId("");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to fetch patient list from the context API.",
        );
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadPatientCandidates();

    return () => {
      isActive = false;
    };
  }, [contextUrl, initialContextParams, token]);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) || null,
    [patients, selectedPatientId],
  );

  const activeContextParams = useMemo(() => {
    if (!selectionConfirmed || !selectedPatient) {
      return initialContextParams;
    }

    return {
      ...initialContextParams,
      ...selectedPatient.contextParams,
    };
  }, [initialContextParams, selectedPatient, selectionConfirmed]);

  function confirmSelection() {
    if (!selectedPatientId) {
      return;
    }

    setSelectionConfirmed(true);
  }

  function continueWithoutSelection() {
    setSelectionConfirmed(true);
  }

  function reopenSelection() {
    if (!patients.length) {
      return;
    }

    setSelectionConfirmed(false);
  }

  return {
    patients,
    loading,
    errorMessage,
    selectedPatient,
    selectedPatientId,
    selectionConfirmed,
    activeContextParams,
    shouldShowPicker: !selectionConfirmed && (loading || patients.length > 0),
    setSelectedPatientId,
    confirmSelection,
    continueWithoutSelection,
    reopenSelection,
  };
}

export default useLabPatientPicker;
