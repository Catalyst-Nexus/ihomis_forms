import { useEffect, useMemo, useRef, useState } from "react";
import { fetchLabPatientCandidates } from "../api/labUploadApi.js";

const PAGE_SIZE = 10;
const API_LIMIT = PAGE_SIZE + 5; // request more to compensate for dedup removal

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
  const PAGE_SIZE = 10;
  const API_LIMIT = PAGE_SIZE + 5; // request more to compensate for dedup removal
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
    () => resolveUserFilter(initialContextParams),
    [initialContextParams],
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
        // Keep fetching with increasing offsets until we have enough unique patients
        const allCandidatesMap = new Map();
        let currentOffset = pageIndex * PAGE_SIZE;
        const maxOffsets = 20; // safety cap to prevent infinite loops
        let lastResponse = null;

        for (let attempt = 0; attempt < maxOffsets; attempt++) {
          const response = await fetchLabPatientCandidates({
            patientSearchUrl,
            contextUrl,
            token,
            contextParams: initialContextParams,
            search: debouncedSearchTerm,
            user: explicitUserFilter,
            limit: API_LIMIT,
            offset: currentOffset,
          });

          if (!isActive) {
            return;
          }

          lastResponse = response;
          const rows = response.candidates || [];
          let addedCount = 0;
          rows.forEach((candidate) => {
            if (!allCandidatesMap.has(candidate.id)) {
              allCandidatesMap.set(candidate.id, candidate);
              addedCount++;
            }
          });

          // Stop if we reached PAGE_SIZE OR the response had no new items
          if (allCandidatesMap.size >= PAGE_SIZE) {
            break;
          }

          // No more data coming
          if (addedCount === 0 || rows.length < API_LIMIT) {
            break;
          }

          currentOffset += API_LIMIT;
        }

        // Sort alphabetically by displayName
        const candidates = Array.from(allCandidatesMap.values()).sort((a, b) =>
          (a.displayName || "").localeCompare(b.displayName || ""),
        );

        setPatients(candidates);

        const responsePayload = lastResponse?.payload;
        const responsePagination = responsePayload?.pagination;
        const rawResponseCount = Number.isFinite(Number(responsePayload?.count))
          ? Number(responsePayload.count)
          : candidates.length;

        let nextPageAvailable = false;
        if (Number.isFinite(Number(responsePagination?.total))) {
          const total = Number(responsePagination.total);
          const serverOffset =
            Number(responsePagination.offset) || pageIndex * PAGE_SIZE;
          nextPageAvailable = serverOffset + rawResponseCount < total;
        } else {
          nextPageAvailable = candidates.length >= PAGE_SIZE;
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
    initialContextParams,
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
      return initialContextParams;
    }

    return {
      ...initialContextParams,
      ...selectedPatient.contextParams,
      hpercode: selectedPatient.id,
    };
  }, [initialContextParams, selectedPatient, selectionConfirmed]);

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
