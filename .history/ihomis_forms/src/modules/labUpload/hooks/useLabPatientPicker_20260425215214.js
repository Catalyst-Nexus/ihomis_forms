import { useEffect, useMemo, useState } from "react";
import { fetchLabPatientCandidates } from "../api/labUploadApi.js";

function resolveUserFilter(contextParams) {
  const candidates = [
    contextParams.user,
    contextParams.userid,
    contextParams.username,
    contextParams.account,
  ];

  const resolved = candidates.find(
    (value) => typeof value === "string" && value.trim(),
  );

  return resolved ? resolved.trim() : "";
}

function useLabPatientPicker({
  patientSearchUrl,
  contextUrl,
  token,
  initialContextParams,
}) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(Boolean(patientSearchUrl || contextUrl));
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectionConfirmed, setSelectionConfirmed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const explicitUserFilter = useMemo(
    () => resolveUserFilter(initialContextParams),
    [initialContextParams],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  useEffect(() => {
    let isActive = true;

    async function loadPatientCandidates() {
      if (!patientSearchUrl && !contextUrl) {
        setPatients([]);
        setSelectedPatientId("");
        setSelectionConfirmed(false);
        setErrorMessage(
          "Missing patient search endpoint. Set VITE_LAB_PATIENT_SEARCH_URL or VITE_LAB_UPLOAD_CONTEXT_URL.",
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const response = await fetchLabPatientCandidates({
          patientSearchUrl,
          contextUrl,
          token,
          contextParams: initialContextParams,
          search: debouncedSearchTerm,
          user: explicitUserFilter,
          limit: 25,
        });

        if (!isActive) {
          return;
        }

        const candidates = response.candidates || [];
        setPatients(candidates);

        if (!candidates.length) {
          setSelectedPatientId("");
          setSelectionConfirmed(false);
          setErrorMessage(
            debouncedSearchTerm
              ? "No patient records matched your search."
              : "No patient records available for the current filters.",
          );
          return;
        }

        setErrorMessage("");

        const preferredCandidate =
          candidates.find((candidate) => {
            const candidateDocointkey = candidate.contextParams?.docointkey || "";
            return (
              Boolean(initialContextParams.docointkey) &&
              candidateDocointkey === initialContextParams.docointkey
            );
          }) || candidates[0];

        setSelectedPatientId((currentId) => {
          const hasCurrentSelection = candidates.some(
            (candidate) => candidate.id === currentId,
          );

          return hasCurrentSelection ? currentId : preferredCandidate.id;
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setPatients([]);
        setSelectionConfirmed(false);
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
  }, [
    patientSearchUrl,
    contextUrl,
    token,
    initialContextParams,
    explicitUserFilter,
    debouncedSearchTerm,
  ]);

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
    if (!selectedPatientId || !selectedPatient) {
      return;
    }

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
    searchTerm,
    activeContextParams,
    shouldShowPicker: !selectionConfirmed,
    setSearchTerm,
    setSelectedPatientId,
    confirmSelection,
    reopenSelection,
  };
}

export default useLabPatientPicker;
