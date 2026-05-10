import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchLabPatientCandidates,
  fetchPatientEncounters,
} from "../api/labUploadApi.js";
import { normalizeLabContextParams } from "../utils/labUploadUtils.js";
import { LAB_UPLOAD_PATIENT_SEARCH_URL } from "../labUploadConfig.js";

const PAGE_SIZE = 10;

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
  const normalizedInitialContextParams = useMemo(
    () => normalizeLabContextParams(initialContextParams),
    [initialContextParams],
  );

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(
    Boolean(patientSearchUrl || contextUrl),
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectionConfirmed, setSelectionConfirmed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const skipNextSearchSyncRef = useRef(false);

  // Encounter selection state
  const [showEncounterModal, setShowEncounterModal] = useState(false);
  const [patientForEncounterSelection, setPatientForEncounterSelection] =
    useState(null);
  const [encounters, setEncounters] = useState([]);
  const [selectedEncounter, setSelectedEncounter] = useState(null);
  const [encountersLoading, setEncountersLoading] = useState(false);
  const [encountersError, setEncountersError] = useState("");

  const explicitUserFilter = useMemo(
    () => resolveUserFilter(normalizedInitialContextParams),
    [normalizedInitialContextParams],
  );

  useEffect(() => {
    if (skipNextSearchSyncRef.current) {
      skipNextSearchSyncRef.current = false;
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearchTerm, explicitUserFilter]);

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
          contextParams: normalizedInitialContextParams,
          search: debouncedSearchTerm,
          user: explicitUserFilter,
          limit: PAGE_SIZE,
          offset: pageIndex * PAGE_SIZE,
        });

        if (!isActive) {
          return;
        }

        const candidates = response.candidates || [];
        setPatients(candidates);

        const responsePayload = response.payload;
        const responsePagination = responsePayload?.pagination;
        let nextPageAvailable = false;

        if (Number.isFinite(Number(responsePagination?.total))) {
          const total = Number(responsePagination.total);
          const serverOffset =
            Number(responsePagination.offset) || pageIndex * PAGE_SIZE;
          nextPageAvailable = serverOffset + candidates.length < total;
        } else {
          nextPageAvailable = candidates.length === PAGE_SIZE;
        }

        setHasNextPage(nextPageAvailable);

        if (!candidates.length) {
          if (pageIndex > 0) {
            setPageIndex((currentPage) => Math.max(0, currentPage - 1));
            return;
          }

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
            const candidateDocointkey =
              candidate.contextParams?.docointkey || "";
            return (
              Boolean(normalizedInitialContextParams.docointkey) &&
              candidateDocointkey === normalizedInitialContextParams.docointkey
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
        setHasNextPage(false);
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
    normalizedInitialContextParams,
    explicitUserFilter,
    debouncedSearchTerm,
    pageIndex,
  ]);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) || null,
    [patients, selectedPatientId],
  );

  const activeContextParams = useMemo(() => {
    if (!selectionConfirmed || !selectedPatient) {
      return normalizedInitialContextParams;
    }

    const resolvedHpercode =
      selectedPatient.rawData?.hpercode ||
      selectedPatient.contextParams?.hpercode ||
      (selectedPatient.idSource === "hpercode" ? selectedPatient.id : "") ||
      "";

    return normalizeLabContextParams({
      ...normalizedInitialContextParams,
      ...selectedPatient.contextParams,
      hpercode: resolvedHpercode,
      user: explicitUserFilter || normalizedInitialContextParams.user || "",
    });
  }, [
    normalizedInitialContextParams,
    selectedPatient,
    selectionConfirmed,
    explicitUserFilter,
  ]);

  function confirmSelection() {
    if (!selectedPatientId || !selectedPatient) {
      return;
    }

    setSelectionConfirmed(true);
  }

  function selectPatient(nextSelection) {
    const selectedCandidate =
      typeof nextSelection === "string"
        ? patients.find((patient) => patient.id === nextSelection)
        : nextSelection;

    if (!selectedCandidate) {
      return;
    }

    setSelectionConfirmed(false);
    setSelectedPatientId(selectedCandidate.id);

    const chosenLabel =
      selectedCandidate.displayName ||
      selectedCandidate.contextParams?.docointkey ||
      selectedCandidate.contextParams?.enccode ||
      selectedCandidate.contextParams?.fhud ||
      "";

    if (chosenLabel) {
      skipNextSearchSyncRef.current = true;
      setSearchTerm(chosenLabel);
    }
  }

  function reopenSelection() {
    if (!patients.length) {
      return;
    }

    setSelectionConfirmed(false);
  }

  function goToNextPage() {
    if (!hasNextPage || loading) {
      return;
    }

    setSelectionConfirmed(false);
    setPageIndex((currentPage) => currentPage + 1);
  }

  function goToPreviousPage() {
    if (pageIndex <= 0 || loading) {
      return;
    }

    setSelectionConfirmed(false);
    setPageIndex((currentPage) => Math.max(0, currentPage - 1));
  }

  // Fetch encounters for a patient
  async function loadPatientEncounters(patient) {
    const hpercode =
      patient?.rawData?.hpercode ||
      patient?.contextParams?.hpercode ||
      patient?.id ||
      "";

    if (!hpercode) {
      setEncountersError("No patient ID available to fetch encounters.");
      setEncounters([]);
      return;
    }

    setEncountersLoading(true);
    setEncountersError("");

    try {
      const response = await fetchPatientEncounters({
        hpercode,
        token,
        patientSearchUrl: LAB_UPLOAD_PATIENT_SEARCH_URL,
      });

      setEncounters(response.encounters || []);

      // Auto-select the first encounter if only one exists
      if (response.encounters.length === 1) {
        setSelectedEncounter(response.encounters[0]);
      } else if (response.encounters.length > 1) {
        setSelectedEncounter(null);
      }
    } catch (error) {
      setEncountersError(
        error instanceof Error ? error.message : "Failed to load encounters.",
      );
      setEncounters([]);
    } finally {
      setEncountersLoading(false);
    }
  }

  // Open encounter modal for a patient
  function openEncounterModalForPatient(patient) {
    setPatientForEncounterSelection(patient);
    setEncounters([]);
    setSelectedEncounter(null);
    setEncountersError("");
    setShowEncounterModal(true);
    loadPatientEncounters(patient);
  }

  // Close encounter modal
  function closeEncounterModal() {
    setShowEncounterModal(false);
    setPatientForEncounterSelection(null);
    setEncounters([]);
    setSelectedEncounter(null);
    setEncountersError("");
  }

  // Handle encounter selection
  function handleEncounterSelection(encounter) {
    setSelectedEncounter(encounter);
  }

  // Confirm encounter selection and close modal
  function confirmEncounterSelection() {
    if (!selectedEncounter || !patientForEncounterSelection) {
      return;
    }

    const patient = patientForEncounterSelection;

    // Create a new patient object with updated context to avoid in-place mutation
    const updatedPatient = {
      ...patient,
      contextParams: {
        ...(patient.contextParams || {}),
        enccode: selectedEncounter.enccode,
        enc: selectedEncounter.enccode,
        encdates: selectedEncounter.encdates || "",
        toa: selectedEncounter.toa || "",
        tod: selectedEncounter.tod || "",
        fhud: selectedEncounter.fhud || patient.contextParams?.fhud || "",
      },
      selectedEncounter,
    };

    // Replace the patient in the patients list immutably so React notices the change
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)),
    );

    closeEncounterModal();
    // Ensure selectionConfirmed and selectedPatientId are set so activeContextParams updates
    setSelectionConfirmed(true);
    setSelectedPatientId(updatedPatient.id);
  }

  return {
    patients,
    loading,
    errorMessage,
    selectedPatient,
    selectedPatientId,
    selectionConfirmed,
    searchTerm,
    pageIndex,
    hasNextPage,
    hasPreviousPage: pageIndex >= 1,
    activeContextParams,
    shouldShowPicker: !selectionConfirmed,
    // Encounter selection
    showEncounterModal,
    patientForEncounterSelection,
    encounters,
    selectedEncounter,
    encountersLoading,
    encountersError,
    setSearchTerm,
    selectPatient,
    confirmSelection,
    reopenSelection,
    goToNextPage,
    goToPreviousPage,
    openEncounterModalForPatient,
    closeEncounterModal,
    handleEncounterSelection,
    confirmEncounterSelection,
    loadPatientEncounters,
  };
}

export default useLabPatientPicker;
