import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorker;

function getErrorMessage(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to render this PDF preview.";
}

function PdfCanvasPreview({ file = null, url = "", token = "", fullscreen = false }) {
  const [pdfDocument, setPdfDocument] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [renderingPage, setRenderingPage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  const hasSource = Boolean(file || url);
  const isPreviewLoading = loadingDocument || renderingPage;
  const showPreloader = isPreviewLoading && !errorMessage;
  const loadingLabel = fullscreen
    ? "Preparing full screen PDF preview..."
    : "Preparing PDF review...";

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(Math.max(0, Math.floor(entry.contentRect.width)));
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
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
    if (!pdfDocument || !canvasRef.current || !containerWidth) {
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
      setRenderingPage(true);
      setErrorMessage("");

      try {
        cancelCurrentRenderTask();

        const page = await pdfDocument.getPage(pageNumber);

        if (cancelled) {
          return;
        }

        const baseViewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / baseViewport.width;
        const viewport = page.getViewport({ scale: Math.max(scale, 0.1) });

        const canvas = canvasRef.current;
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
        if (error?.name === "RenderingCancelledException") {
          return;
        }

        if (!cancelled) {
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setRenderingPage(false);
        }
      }
    }

    renderPage();

    return () => {
      cancelled = true;
      cancelCurrentRenderTask();
    };
  }, [containerWidth, pageNumber, pdfDocument]);

  if (!hasSource) {
    return null;
  }

  return (
    <div
      className={`lab-pdf-renderer ${
        fullscreen ? "lab-pdf-renderer-fullscreen" : ""
      }`}
    >
      <div className="lab-pdf-toolbar">
        <button
          type="button"
          onClick={() => setPageNumber((currentPage) => Math.max(currentPage - 1, 1))}
          disabled={isPreviewLoading || pageNumber <= 1}
        >
          Previous
        </button>
        <span>
          {pageCount ? `Page ${pageNumber} of ${pageCount}` : "Loading pages..."}
        </span>
        <button
          type="button"
          onClick={() =>
            setPageNumber((currentPage) => Math.min(currentPage + 1, pageCount || 1))
          }
          disabled={isPreviewLoading || pageNumber >= pageCount}
        >
          Next
        </button>
      </div>

      <div className="lab-pdf-canvas-shell" ref={containerRef}>
        <div className="lab-pdf-canvas-stage">
          {errorMessage ? (
            <p className="lab-pdf-error">{errorMessage}</p>
          ) : (
            <canvas
              className={`lab-pdf-canvas ${
                showPreloader ? "lab-pdf-canvas-loading" : "lab-pdf-canvas-ready"
              }`}
              ref={canvasRef}
            />
          )}

          <div
            className={`lab-pdf-preloader ${
              fullscreen ? "lab-pdf-preloader-fullscreen" : ""
            } ${showPreloader ? "lab-pdf-preloader-visible" : ""}`}
            role="status"
            aria-live="polite"
          >
            <span className="lab-pdf-preloader-spinner" aria-hidden="true" />
            <p>{loadingLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

PdfCanvasPreview.propTypes = {
  file: PropTypes.any,
  url: PropTypes.string,
  token: PropTypes.string,
  fullscreen: PropTypes.bool,
};

export default PdfCanvasPreview;
