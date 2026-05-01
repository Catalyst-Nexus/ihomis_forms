import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

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

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  const hasSource = Boolean(file || url);
  const isPreviewLoading = loadingDocument || renderingPage;
  const showPreloader = isPreviewLoading && !errorMessage;
  const loadingLabel = fullscreen
    ? "Preparing full screen PDF preview..."
    : "Preparing PDF review...";

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
        setZoom((z) => Math.min(z + 0.25, 3));
      } else if (event.key === "-") {
        event.preventDefault();
        setZoom((z) => Math.max(z - 0.25, 0.25));
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fullscreen, pageCount]);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return undefined;

    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(Math.max(0, Math.floor(entry.contentRect.width)));
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isActive = true;
    let loadingTask = null;
    const controller = new AbortController();

    async function loadPdfDocument() {
      if (!hasSource) {
        setPdfDocument(null);
        setPageCount(0);
        setPageNumber(1);
        setErrorMessage("");
        return;
      }

      setLoadingDocument(true);
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
          if (previousDocument) {
            previousDocument.destroy();
          }
          return nextPdfDocument;
        });
        setPageCount(nextPdfDocument.numPages);
        setPageNumber(1);
        setDocReady(true);
      } catch (error) {
        if (!isActive || error?.name === "AbortError") {
          return;
        }

        setPdfDocument((previousDocument) => {
          if (previousDocument) {
            previousDocument.destroy();
          }
          return null;
        });
        setPageCount(0);
        setPageNumber(1);
        setDocReady(false);
        setErrorMessage(getErrorMessage(error));
      } finally {
        if (isActive) {
          setLoadingDocument(false);
        }
      }
    }

    loadPdfDocument();

    return () => {
      isActive = false;
      controller.abort();

      if (loadingTask) {
        loadingTask.destroy();
      }
    };
  }, [file, hasSource, token, url]);

  useEffect(
    () => () => {
      if (pdfDocument) {
        pdfDocument.destroy();
      }
    },
    [pdfDocument],
  );

  useEffect(() => {
    if (!pdfDocument || !canvasRef.current || !containerWidth || !docReady) {
      return undefined;
    }

    let cancelled = false;

    function cancelCurrentRenderTask() {
      const currentRenderTask = renderTaskRef.current;
      if (!currentRenderTask) {
        return;
      }

      renderTaskRef.current = null;

      try {
        currentRenderTask.cancel();
      } catch {
        // Ignore cancel errors and continue with a new render task.
      }
    }

    async function renderPage() {
      const canvas = canvasRef.current;
      if (!canvas || !containerWidth) return;

      setRenderingPage(true);
      setErrorMessage("");

      try {
        cancelCurrentRenderTask();

        const page = await pdfDocument.getPage(pageNumber);

        if (cancelled) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const rawScale = containerWidth / baseViewport.width;
        const scale = Math.max(rawScale * zoom, 0.1);
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
      } catch (error) {
        if (error?.name === "RenderingCancelledException") return;
        if (!cancelled) setErrorMessage(getErrorMessage(error));
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
      className={`lab-pdf-renderer ${
        fullscreen ? "lab-pdf-renderer-fullscreen" : ""
      }`}
    >
      {fullscreen && (
        <div className="lab-fs-bar" role="toolbar" aria-label="PDF controls">
          {/* Left — document icon + title */}
          <div className="lab-fs-bar-left">
            <svg className="lab-fs-icon" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
            <span className="lab-fs-bar-title">
              {pageCount ? `Page ${pageNumber} of ${pageCount}` : "Loading PDF..."}
            </span>
          </div>

          {/* Center — navigation + zoom */}
          <div className="lab-fs-bar-center">
            <button type="button" className="lab-fs-btn"
              onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
              disabled={isPreviewLoading || pageNumber <= 1}
              title="Previous page (←)" aria-label="Previous page">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </button>

            <form onSubmit={handleJumpSubmit} className="lab-fs-jump" aria-label="Jump to page">
              <input
                type="number" min="1" max={pageCount || 1}
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                placeholder={String(pageNumber)}
                className="lab-fs-jump-input"
                aria-label="Page number"
              />
              <span className="lab-fs-jump-total">of {pageCount || "—"}</span>
            </form>

            <button type="button" className="lab-fs-btn"
              onClick={() => setPageNumber((p) => Math.min(p + 1, pageCount || 1))}
              disabled={isPreviewLoading || pageNumber >= pageCount}
              title="Next page (→)" aria-label="Next page">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9,18 15,12 9,6" />
              </svg>
            </button>

            <div className="lab-fs-sep" aria-hidden="true" />

            <button type="button" className="lab-fs-btn"
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.25))}
              title="Zoom out (-)" aria-label="Zoom out">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>
            <span className="lab-fs-zoom-label">{Math.round(zoom * 100)}%</span>
            <button type="button" className="lab-fs-btn"
              onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
              title="Zoom in (+)" aria-label="Zoom in">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>
          </div>

          {/* Right — close */}
          <div className="lab-fs-bar-right">
            <button type="button" className="lab-fs-close"
              onClick={onCloseFullscreen} aria-label="Close fullscreen preview">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Close
            </button>
          </div>
        </div>
      )}

      {fullscreen ? (
        <div className="lab-fs-body">
          {showPreloader ? (
            <div className="lab-fs-spinner" role="status" aria-live="polite">
              <div className="lab-fs-spinner-ring" />
              <p>{loadingLabel}</p>
            </div>
          ) : (
            <div className="lab-fs-canvas-wrap" ref={containerRef}>
              <div className="lab-pdf-canvas-stage">
                {errorMessage ? (
                  <p className="lab-pdf-error">{errorMessage}</p>
                ) : (
                  <canvas className="lab-pdf-canvas lab-pdf-canvas-ready" ref={canvasRef} />
                )}
                <div className={`lab-pdf-preloader lab-pdf-preloader-fullscreen ${showPreloader ? "lab-pdf-preloader-visible" : ""}`}
                  role="status" aria-live="polite" aria-hidden={!showPreloader}>
                  <span className="lab-pdf-preloader-spinner" aria-hidden="true" />
                  <p>{loadingLabel}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="lab-pdf-toolbar">
            <button type="button"
              onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
              disabled={isPreviewLoading || pageNumber <= 1}>Previous</button>
            <span>{pageCount ? `Page ${pageNumber} of ${pageCount}` : "Loading pages..."}</span>
            <button type="button"
              onClick={() => setPageNumber((p) => Math.min(p + 1, pageCount || 1))}
              disabled={isPreviewLoading || pageNumber >= pageCount}>Next</button>
          </div>
          <div className="lab-pdf-canvas-shell" ref={containerRef}>
            <div className="lab-pdf-canvas-stage">
              {errorMessage ? (
                <p className="lab-pdf-error">{errorMessage}</p>
              ) : (
                <canvas className={`lab-pdf-canvas ${showPreloader ? "lab-pdf-canvas-loading" : "lab-pdf-canvas-ready"}`} ref={canvasRef} />
              )}
              <div className={`lab-pdf-preloader ${fullscreen ? "lab-pdf-preloader-fullscreen" : ""} ${showPreloader ? "lab-pdf-preloader-visible" : ""}`}
                role="status" aria-live="polite" aria-hidden={!showPreloader}>
                <span className="lab-pdf-preloader-spinner" aria-hidden="true" />
                <p>{loadingLabel}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

PdfCanvasPreview.propTypes = {
  file: PropTypes.any,
  url: PropTypes.string,
  token: PropTypes.string,
  fullscreen: PropTypes.bool,
  onCloseFullscreen: PropTypes.func,
};

export default PdfCanvasPreview;
