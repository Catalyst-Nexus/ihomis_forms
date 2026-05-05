import { useEffect, useMemo, useRef, useState } from "react";
import { fetchLabPatientCandidates } from "../api/labUploadApi.js";
import { normalizeLabContextParams } from "../utils/labUploadUtils.js";

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

    return normalizeLabContextParams({
      ...normalizedInitialContextParams,
      ...selectedPatient.contextParams,
      hpercode: selectedPatient.id,
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
    setSearchTerm,
    selectPatient,
    confirmSelection,
    reopenSelection,
    goToNextPage,
    goToPreviousPage,
  };
}

export default useLabPatientPicker;
