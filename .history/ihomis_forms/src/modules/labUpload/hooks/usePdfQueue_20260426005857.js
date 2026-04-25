import { useEffect, useRef, useState } from "react";
import {
  getFileKey,
  getFirstUploadedPreviewIndex,
  isPdfFile,
  mergeUniqueFiles,
} from "../utils/labUploadUtils.js";

function usePdfQueue({
  uploadedFiles,
  onStatusChange,
  onLocalFileRemoved,
  onClearAll,
}) {
  const [resultFiles, setResultFiles] = useState([]);

  const [activeLocalFileIndex, setActiveLocalFileIndex] = useState(0);
  const [activeUploadedFileIndex, setActiveUploadedFileIndex] = useState(0);
  const [reviewSource, setReviewSource] = useState("local");
  const [isReviewFullscreen, setIsReviewFullscreen] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const fileInputRef = useRef(null);
  const previousUploadedCountRef = useRef(uploadedFiles.length);

  useEffect(() => {
    if (!isReviewFullscreen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isReviewFullscreen]);

  useEffect(() => {
    if (!isReviewFullscreen) {
      return undefined;
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsReviewFullscreen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isReviewFullscreen]);

  useEffect(() => {
    if (!resultFiles.length) {
      setActiveLocalFileIndex(0);
      return;
    }

    if (activeLocalFileIndex >= resultFiles.length) {
      setActiveLocalFileIndex(resultFiles.length - 1);
    }
  }, [activeLocalFileIndex, resultFiles.length]);

  useEffect(() => {
    if (!uploadedFiles.length) {
      setActiveUploadedFileIndex(0);
      return;
    }

    if (activeUploadedFileIndex >= uploadedFiles.length) {
      setActiveUploadedFileIndex(uploadedFiles.length - 1);
      return;
    }

    if (uploadedFiles[activeUploadedFileIndex]?.previewUrl) {
      return;
    }

    const firstPreviewIndex = getFirstUploadedPreviewIndex(uploadedFiles);
    if (firstPreviewIndex >= 0) {
      setActiveUploadedFileIndex(firstPreviewIndex);
    }
  }, [activeUploadedFileIndex, uploadedFiles]);

  useEffect(() => {
    const previousCount = previousUploadedCountRef.current;

    if (uploadedFiles.length > previousCount) {
      const firstPreviewIndex = getFirstUploadedPreviewIndex(uploadedFiles);
      if (firstPreviewIndex >= 0) {
        setReviewSource("uploaded");
        setActiveUploadedFileIndex(firstPreviewIndex);
      }
    }

    previousUploadedCountRef.current = uploadedFiles.length;
  }, [uploadedFiles]);

  const hasLocalPreview = resultFiles.length > 0;
  const hasUploadedPreview = uploadedFiles.some((item) =>
    Boolean(item.previewUrl),
  );

  const localPreviewFile = hasLocalPreview
    ? resultFiles[Math.min(activeLocalFileIndex, resultFiles.length - 1)]
    : null;

  const uploadedPreviewFile = uploadedFiles.length
    ? uploadedFiles[Math.min(activeUploadedFileIndex, uploadedFiles.length - 1)]
    : null;

  const activePreviewFile = reviewSource === "local" ? localPreviewFile : null;
  const activePreviewUrl =
    reviewSource === "uploaded" && uploadedPreviewFile?.previewUrl
      ? uploadedPreviewFile.previewUrl
      : "";

  const hasActivePreview = Boolean(activePreviewFile || activePreviewUrl);
  const hasAnyPdf = Boolean(resultFiles.length || uploadedFiles.length);

  function publishStatus(nextStatus) {
    if (typeof onStatusChange === "function") {
      onStatusChange(nextStatus);
    }
  }

  function addFilesToQueue(incomingFiles) {
    const validPdfFiles = incomingFiles.filter((file) => isPdfFile(file));
    const invalidFileCount = incomingFiles.length - validPdfFiles.length;

    if (!validPdfFiles.length) {
      publishStatus({
        type: "error",
        message: "Only PDF files are allowed for laboratory result upload.",
      });
      return;
    }

    const mergedFiles = mergeUniqueFiles(resultFiles, validPdfFiles);
    const addedCount = mergedFiles.length - resultFiles.length;
    const duplicatePdfCount = validPdfFiles.length - addedCount;

    setResultFiles(mergedFiles);
    setReviewSource("local");

    if (!resultFiles.length && addedCount > 0) {
      setActiveLocalFileIndex(0);
    }

    if (addedCount === 0) {
      publishStatus({
        type: "warning",
        message: "All selected PDF files are already in the queue.",
      });
      return;
    }

    if (invalidFileCount > 0 || duplicatePdfCount > 0) {
      const details = [];

      if (invalidFileCount > 0) {
        details.push(`${invalidFileCount} non-PDF file(s) ignored`);
      }

      if (duplicatePdfCount > 0) {
        details.push(`${duplicatePdfCount} duplicate PDF file(s) skipped`);
      }

      publishStatus({
        type: "warning",
        message: `${addedCount} PDF file(s) added. ${details.join(". ")}.`,
      });
      return;
    }

   
  }

  function handleFileChange(event) {
    const selectedFiles = Array.from(event.target.files || []);
    addFilesToQueue(selectedFiles);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    } else {
      event.target.value = "";
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragActive(false);
    const droppedFiles = Array.from(event.dataTransfer.files || []);
    addFilesToQueue(droppedFiles);
  }

  function handleDragOver(event) {
    event.preventDefault();
    setIsDragActive(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();

    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    setIsDragActive(false);
  }

  function previewLocalFile(index) {
    setReviewSource("local");
    setActiveLocalFileIndex(index);
  }

  function previewUploadedFile(index) {
    if (!uploadedFiles[index]?.previewUrl) {
      return;
    }

    setReviewSource("uploaded");
    setActiveUploadedFileIndex(index);
  }

  function removeLocalFile(index) {
    const removedFile = resultFiles[index];

    if (removedFile) {
      const removedFileKey = getFileKey(removedFile);

      if (typeof onLocalFileRemoved === "function") {
        onLocalFileRemoved(removedFileKey);
      }
    }

    setResultFiles((currentFiles) =>
      currentFiles.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  function clearPdfSelection() {
    setResultFiles([]);
    setActiveLocalFileIndex(0);
    setActiveUploadedFileIndex(0);
    setReviewSource("local");
    setIsReviewFullscreen(false);
    setIsDragActive(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (typeof onClearAll === "function") {
      onClearAll();
    }
  }

  function showLocalPreview() {
    setReviewSource("local");
  }

  function showUploadedPreview() {
    const firstPreviewIndex = getFirstUploadedPreviewIndex(uploadedFiles);

    if (firstPreviewIndex >= 0) {
      setReviewSource("uploaded");
      setActiveUploadedFileIndex(firstPreviewIndex);
    }
  }

  function openFullscreen() {
    setIsReviewFullscreen(true);
  }

  function closeFullscreen() {
    setIsReviewFullscreen(false);
  }

  return {
    fileInputRef,
    resultFiles,
    activeLocalFileIndex,
    activeUploadedFileIndex,
    reviewSource,
    isReviewFullscreen,
    isDragActive,
    hasLocalPreview,
    hasUploadedPreview,
    hasActivePreview,
    hasAnyPdf,
    activePreviewFile,
    activePreviewUrl,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    previewLocalFile,
    previewUploadedFile,
    removeLocalFile,
    clearPdfSelection,
    showLocalPreview,
    showUploadedPreview,
    openFullscreen,
    closeFullscreen,
  };
}

export default usePdfQueue;
