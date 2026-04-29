import { useRef } from 'react';
import './Modal.css';

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M18 6 6 18M6 6l12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M7 8V4h10v4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 17H5a2 2 0 0 1-2-2v-4.5A2.5 2.5 0 0 1 5.5 8h13A2.5 2.5 0 0 1 21 10.5V15a2 2 0 0 1-2 2h-1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 17h9v5h-9z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 11h.01M10.5 11h.01"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Modal({ isOpen, onClose, title, children }) {
  const contentRef = useRef(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (!contentRef.current) return;

    let printContainer = document.getElementById('print-container');
    if (!printContainer) {
      printContainer = document.createElement('div');
      printContainer.id = 'print-container';
      document.body.appendChild(printContainer);
    }

    const printableRoot = contentRef.current.firstElementChild
      ? contentRef.current.firstElementChild.cloneNode(true)
      : contentRef.current.cloneNode(true);

    const previousTitle = document.title;
    document.title = '';

    try {
      window.print();
    } finally {
      document.title = previousTitle;
    }
    printContainer.replaceChildren(printableRoot);

    const cleanup = () => {
      printContainer.replaceChildren();
    };

    window.addEventListener('afterprint', cleanup, { once: true });
    requestAnimationFrame(() => {
      window.print();
    });
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close dialog">
            <CloseIcon />
          </button>
        </div>

        <div className="modal-content" ref={contentRef}>
          {children}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-with-icon" onClick={onClose}>
            <CloseIcon />
            <span>Close</span>
          </button>
          <button className="btn btn-primary btn-with-icon" onClick={handlePrint}>
            <PrintIcon />
            <span>Print</span>
          </button>
        </div>
      </div>
    </>
  );
}
