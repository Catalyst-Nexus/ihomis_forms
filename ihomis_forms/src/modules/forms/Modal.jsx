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
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content" ref={contentRef}>
          {children}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={handlePrint}>Print</button>
        </div>
      </div>
    </>
  );
}
