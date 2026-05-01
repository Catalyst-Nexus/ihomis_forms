import { useRef } from 'react';
import './Modal.css';

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

    printContainer.replaceChildren(printableRoot);

    const cleanup = () => {
      document.title = previousTitle;
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
          <button className="modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-content" ref={contentRef}>
          {children}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-with-icon" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Close
          </button>
          <button className="btn btn-primary btn-with-icon" onClick={handlePrint}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print
          </button>
        </div>
      </div>
    </>
  );
}