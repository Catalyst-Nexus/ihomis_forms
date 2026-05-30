import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import "./PdfCanvasPreview.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const { getDocument } = pdfjsLib;

function getErrorMessage(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unable to render this PDF preview.";
}

function PdfCanvasPreview({
  file = null,
  url = "",
  token = "",
  fullscreen = false,
  onCloseFullscreen = null,
}) {
  const [pdfDocument, setPdfDocument] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [renderingPage, setRenderingPage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [zoom, setZoom] = useState(1);
  const [jumpInput, setJumpInput] = useState("");
  const [docReady, setDocReady] = useState(false);
  const [hasRenderedPage, setHasRenderedPage] = useState(false);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const lastMeasuredWidthRef = useRef(0);

  // Per-document persistence (page/zoom)
  // Key derived from filename + size for stability across order changes.
  const docKey = file
    ? `${file.name}::${file.size}`
    : url
      ? `url::${url}`
      : "unknown";

  const savedViewRef = useRef({});

  const hasSource = Boolean(file || url);
  const isPreviewLoading = loadingDocument || renderingPage;
  const showPreloader =
    !errorMessage && (loadingDocument || (!hasRenderedPage && renderingPage));
  const loadingLabel = fullscreen
    ? "Preparing full screen preview..."
    : "Loading document...";

  // Keyboard shortcuts for fullscreen
  useEffect(() => {
    if (!fullscreen) return undefined;

    function handleKey(event) {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        setPageNumber((p) => Math.max(p - 1, 1));
      } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        setPageNumber((p) => Math.min(p + 1, pageCount || 1));
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setZoom((z) => Math.min(z + 0.25, 2));
      } else if (event.key === "-") {
        event.preventDefault();
        setZoom((z) => Math.max(z - 0.25, 0.5));
      } else if (event.key === "Escape") {
        event.preventDefault();
        onCloseFullscreen?.();
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fullscreen, onCloseFullscreen, pageCount]);

  // Hide page scrollbar when fullscreen is active
  useEffect(() => {
    if (fullscreen) {
      // Save original overflow and hide scrollbar
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      
      return () => {
        // Restore original overflow
        document.body.style.overflow = originalOverflow;
      };
    }
    return undefined;
  }, [fullscreen]);

  // Track container width
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const applyWidth = (nextWidth) => {
      if (nextWidth <= 0) return;
      if (Math.abs(nextWidth - lastMeasuredWidthRef.current) < 2) return;
      lastMeasuredWidthRef.current = nextWidth;
      setContainerWidth(nextWidth);
    };

    const measure = () => {
      // In fullscreen, measure the parent scrollable area
      // In embedded mode, measure the container
      const target = fullscreen 
        ? container.closest(".lab-fs-body") || container.parentElement
        : container;
      
      if (target) {
        const width = Math.floor(target.getBoundingClientRect().width);
        applyWidth(width);
      }
    };

    measure();
    const rafId = requestAnimationFrame(measure);

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const target = fullscreen 
          ? container.closest(".lab-fs-body") || container.parentElement
          : container;
        
        if (entry.target === target || entry.target.contains(target)) {
          const width = Math.floor(entry.contentRect.width);
          applyWidth(width);
        }
      });
    });

    // Observe the appropriate parent element in fullscreen
    const observeTarget = fullscreen 
      ? container.closest(".lab-fs-body") || container.parentElement
      : container;
    
    if (observeTarget) {
      observer.observe(observeTarget);
    }

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [fullscreen]);

  // Load PDF document
  useEffect(() => {
    let isActive = true;
    let loadingTask = null;
    const controller = new AbortController();

    async function loadPdfDocument() {
      if (!hasSource) {
        setPdfDocument(null);
        setPageCount(0);
        setPageNumber(1);
        setDocReady(false);
        setHasRenderedPage(false);
        setErrorMessage("");
        return;
      }

      setLoadingDocument(true);
      setDocReady(false);
      setHasRenderedPage(false);
      setErrorMessage("");

      try {
        let pdfBytes = null;

        if (file) {
          pdfBytes = await file.arrayBuffer();
        } else {
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const response = await fetch(url, {
            headers,
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`Unable to load PDF preview (${response.status}).`);
          }

          pdfBytes = await response.arrayBuffer();
        }

        loadingTask = getDocument({ data: pdfBytes });
        const nextPdfDocument = await loadingTask.promise;

        if (!isActive) {
          nextPdfDocument.destroy();
          return;
        }

        setPdfDocument((previousDocument) => {
          if (previousDocument) previousDocument.destroy();
          return nextPdfDocument;
        });
        setPageCount(nextPdfDocument.numPages);

        // Restore per-document page/zoom (if saved)
        const saved = savedViewRef.current?.[docKey];
        const restoredPage = saved?.pageNumber || 1;
        const restoredZoom = saved?.zoom || 1;

        setPageNumber(
          Math.min(
            Math.max(restoredPage, 1),
            nextPdfDocument.numPages || restoredPage || 1,
          ),
        );
        setZoom(Math.max(restoredZoom, 0.5));

        setDocReady(true);
      } catch (error) {
        if (!isActive || error?.name === "AbortError") return;

        setPdfDocument((previousDocument) => {
          if (previousDocument) previousDocument.destroy();
          return null;
        });
        setPageCount(0);
        setPageNumber(1);
        setZoom(1);
        setDocReady(false);
        setHasRenderedPage(false);
        setErrorMessage(getErrorMessage(error));
      } finally {
        if (isActive) setLoadingDocument(false);
      }
    }

    loadPdfDocument();

    return () => {
      isActive = false;
      controller.abort();
      if (loadingTask) loadingTask.destroy();
    };
  }, [file, hasSource, token, url, docKey]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (pdfDocument) pdfDocument.destroy();
    },
    [pdfDocument],
  );

  // Persist view state per document (page/zoom)
  useEffect(() => {
    if (!docKey) return;
    savedViewRef.current[docKey] = {
      pageNumber,
      zoom,
      updatedAt: Date.now(),
    };
  }, [docKey, pageNumber, zoom]);

  // Render page
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current || !containerWidth || !docReady) {
      return undefined;
    }

    let cancelled = false;

    function cancelCurrentRenderTask() {
      const currentRenderTask = renderTaskRef.current;
      if (!currentRenderTask) return;
      renderTaskRef.current = null;
      try {
        currentRenderTask.cancel();
      } catch {
        // Ignore cancel errors
      }
    }

    async function renderPage() {
      const canvas = canvasRef.current;
      if (!canvas || !containerWidth || containerWidth <= 0) return;

      setRenderingPage(true);
      setErrorMessage("");

      try {
        cancelCurrentRenderTask();

        const page = await pdfDocument.getPage(pageNumber);
        if (cancelled) return;

        const baseViewport = page.getViewport({ scale: 1 });
        // Use containerWidth with padding to prevent edge-to-edge display
        const usableWidth = containerWidth - 48; // 24px padding on each side
        const rawScale = usableWidth / baseViewport.width;
        // Clamp scale: 50% to 200% of fit-to-container
        const scale = Math.max(Math.min(rawScale * zoom, rawScale * 2), rawScale * 0.5);
        const viewport = page.getViewport({ scale });

        const context = canvas.getContext("2d");
        const dpr = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);

        const renderTask = page.render({ canvasContext: context, viewport });
        renderTaskRef.current = renderTask;
        await renderTask.promise;

        if (renderTaskRef.current === renderTask) {
          renderTaskRef.current = null;
        }

        if (!cancelled) setHasRenderedPage(true);
      } catch (error) {
        if (error?.name === "RenderingCancelledException") return;
        if (!cancelled) {
          setHasRenderedPage(false);
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) setRenderingPage(false);
      }
    }

    renderPage();

    return () => {
      cancelled = true;
      cancelCurrentRenderTask();
    };
  }, [containerWidth, pageNumber, pdfDocument, zoom, docReady]);

  // Scroll management
  useEffect(() => {
    if (!pdfDocument || !containerRef.current) return undefined;

    const scrollContainer = fullscreen
      ? containerRef.current.closest(".lab-fs-body")
      : containerRef.current;

    if (scrollContainer) scrollContainer.scrollTop = 0;

    return undefined;
  }, [fullscreen, pageNumber, pdfDocument]);

  function handleJumpSubmit(e) {
    e.preventDefault();
    const num = parseInt(jumpInput, 10);
    if (!isNaN(num) && num >= 1 && num <= pageCount) {
      setPageNumber(num);
      setJumpInput("");
    }
  }

  if (!hasSource) {
    return null;
  }

  return (
    <div
      className={`lab-pdf-renderer ${fullscreen ? "lab-pdf-renderer-fullscreen" : ""}`}
    >
      {/* Fullscreen Header Bar */}
      {fullscreen && (
        <div className="lab-fs-bar" role="toolbar" aria-label="PDF controls">
          <div className="lab-fs-bar-left">
            <svg
              className="lab-fs-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span className="lab-fs-bar-title">Document Preview</span>
            {pageCount > 0 && (
              <span className="lab-fs-page-label">
                Page {pageNumber} of {pageCount}
              </span>
            )}
          </div>

          <div className="lab-fs-bar-center">
            {/* Previous Button */}
            <button
              type="button"
              className="lab-fs-btn"
              onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
              disabled={isPreviewLoading || pageNumber <= 1}
              title="Previous page"
              aria-label="Previous page"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </button>

            {/* Page Jump */}
            <form
              onSubmit={handleJumpSubmit}
              className="lab-fs-jump"
              aria-label="Jump to page"
            >
              <input
                type="number"
                min="1"
                max={pageCount || 1}
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                placeholder={String(pageNumber)}
                className="lab-fs-jump-input"
                aria-label="Page number"
              />
              <span className="lab-fs-jump-sep" aria-hidden="true">
                /
              </span>
              <span className="lab-fs-jump-total">{pageCount || "—"}</span>
            </form>

            {/* Next Button */}
            <button
              type="button"
              className="lab-fs-btn"
              onClick={() =>
                setPageNumber((p) => Math.min(p + 1, pageCount || 1))
              }
              disabled={isPreviewLoading || pageNumber >= pageCount}
              title="Next page"
              aria-label="Next page"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9,18 15,12 9,6" />
              </svg>
            </button>

            <div className="lab-fs-sep" aria-hidden="true" />

            {/* Zoom Controls */}
            <div className="lab-fs-zoom-group" role="group" aria-label="Zoom">
              <button
                type="button"
                className="lab-fs-btn"
                onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                title="Zoom out"
                aria-label="Zoom out"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </button>
              <span
                className="lab-fs-zoom-label"
                aria-label={`Zoom ${Math.round(zoom * 100)}%`}
              >
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                className="lab-fs-btn"
                onClick={() => setZoom((z) => Math.min(z + 0.25, 2))}
                title="Zoom in"
                aria-label="Zoom in"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </button>
            </div>
          </div>

          <div className="lab-fs-bar-right">
            <button
              type="button"
              className="lab-fs-close"
              onClick={onCloseFullscreen}
              aria-label="Close fullscreen preview"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span>Close</span>
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Body */}
      {fullscreen ? (
        <div className="lab-fs-body">
          <div className="lab-fs-canvas-wrap">
            <div
              className="lab-pdf-canvas-stage lab-pdf-canvas-stage-fs"
              ref={containerRef}
            >
              {errorMessage ? (
                <div className="lab-pdf-error" role="alert">
                  <div className="lab-pdf-error-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div className="lab-pdf-error-title">Render Error</div>
                  <div className="lab-pdf-error-message">{errorMessage}</div>
                </div>
              ) : (
                <canvas
                  className={`lab-pdf-canvas ${showPreloader ? "lab-pdf-canvas-loading" : "lab-pdf-canvas-ready"}`}
                  ref={canvasRef}
                />
              )}
              <div
                className={`lab-pdf-preloader lab-pdf-preloader-fullscreen ${showPreloader ? "lab-pdf-preloader-visible" : ""}`}
                role="status"
                aria-live="polite"
                aria-hidden={!showPreloader}
              >
                <div className="lab-pdf-preloader-spinner">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <p>{loadingLabel}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Embedded Header Bar */}
          <div className="lab-pdf-header">
            <div className="lab-pdf-header-left">
              <div className="lab-pdf-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div className="lab-pdf-header-info">
                <span className="lab-pdf-header-title">Lab Result</span>
                <span className="lab-pdf-header-subtitle">
                  {pageCount > 0
                    ? `${pageCount} page${pageCount > 1 ? "s" : ""}`
                    : "Document preview"}
                </span>
              </div>
            </div>

            <div className="lab-pdf-header-center">
              {/* Navigation Controls */}
              <nav className="lab-pdf-nav" aria-label="Page navigation">
                <button
                  type="button"
                  className="lab-pdf-nav-btn"
                  onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
                  disabled={isPreviewLoading || pageNumber <= 1}
                  aria-label="Previous page"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15,18 9,12 15,6" />
                  </svg>
                </button>

                <div className="lab-pdf-nav-divider" aria-hidden="true" />

                <div className="lab-pdf-page-indicator">
                  <span className="lab-pdf-page-current">{pageNumber}</span>
                  <span className="lab-pdf-page-total">
                    / {pageCount || "—"}
                  </span>
                </div>

                <div className="lab-pdf-nav-divider" aria-hidden="true" />

                <button
                  type="button"
                  className="lab-pdf-nav-btn"
                  onClick={() =>
                    setPageNumber((p) => Math.min(p + 1, pageCount || 1))
                  }
                  disabled={isPreviewLoading || pageNumber >= pageCount}
                  aria-label="Next page"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9,18 15,12 9,6" />
                  </svg>
                </button>
              </nav>

              {/* Zoom Controls */}
              <div
                className="lab-pdf-zoom"
                role="group"
                aria-label="Zoom controls"
              >
                <button
                  type="button"
                  className="lab-pdf-zoom-btn"
                  onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                  aria-label="Zoom out"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </button>
                <span className="lab-pdf-zoom-value">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  className="lab-pdf-zoom-btn"
                  onClick={() => setZoom((z) => Math.min(z + 0.25, 2))}
                  aria-label="Zoom in"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="lab-pdf-header-right">
              {pageCount > 0 && (
                <span className="lab-pdf-status success">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                  Ready
                </span>
              )}
            </div>
          </div>

          {/* Canvas Container */}
          <div className="lab-pdf-canvas-shell" ref={containerRef}>
            <div className="lab-pdf-canvas-stage">
              {errorMessage ? (
                <div className="lab-pdf-error" role="alert">
                  <div className="lab-pdf-error-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div className="lab-pdf-error-title">Render Error</div>
                  <div className="lab-pdf-error-message">{errorMessage}</div>
                </div>
              ) : (
                <canvas
                  className={`lab-pdf-canvas ${showPreloader ? "lab-pdf-canvas-loading" : "lab-pdf-canvas-ready"}`}
                  ref={canvasRef}
                />
              )}
              <div
                className={`lab-pdf-preloader ${showPreloader ? "lab-pdf-preloader-visible" : ""}`}
                role="status"
                aria-live="polite"
                aria-hidden={!showPreloader}
              >
                <div className="lab-pdf-preloader-spinner">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <p>{loadingLabel}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PdfCanvasPreview;
