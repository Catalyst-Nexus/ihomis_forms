import { useRef } from 'react';
import './Modal.css';

export default function Modal({ isOpen, onClose, title, children }) {
  const contentRef = useRef(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    // get or create a dedicated print container
    let printContainer = document.getElementById('print-container');
    if (!printContainer) {
      printContainer = document.createElement('div');
      printContainer.id = 'print-container';
      printContainer.style.display = 'none';
      document.body.appendChild(printContainer);
    }

    // clone only the modal content (DNRForm) into it
    printContainer.innerHTML = contentRef.current.innerHTML;

    window.print();

    // clean up after printing
    printContainer.innerHTML = '';
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* attach ref here to capture only the form */}
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
