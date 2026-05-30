import { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

/**
 * usePrintRegistry Hook
 * 
 * A React hook that manages the print lifecycle for combining multiple forms
 * into a single print job. This hook handles:
 * - Container creation and cleanup
 * - Form rendering into off-screen container
 * - Print triggering with proper timing
 * - Resource loading (fonts, images)
 * 
 * @param {Object} options - Hook options
 * @param {Function} options.onBeforePrint - Callback before print dialog opens
 * @param {Function} options.onAfterPrint - Callback after print dialog closes
 * @returns {Object} Hook API
 * 
 * @example
 * const { print, isPrinting, queueForms, clearForms } = usePrintRegistry();
 * 
 * // Print selected forms
 * const handlePrint = () => {
 *   queueForms([
 *     { Component: TPRSheet, props: { patientName, patientData } },
 *     { Component: MonitoringSheet, props: { patientName, patientData } }
 *   ]);
 *   print();
 * };
 */
export default function usePrintRegistry(options = {}) {
  const { onBeforePrint, onAfterPrint } = options;
  
  const [isPrinting, setIsPrinting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [forms, setForms] = useState([]);
  
  const containerRef = useRef(null);
  const rootRef = useRef(null);
  const formsRef = useRef([]);

  // Create print container on mount
  useEffect(() => {
    const createContainer = () => {
      // Remove existing container if any
      const existing = document.getElementById('print-registry-container');
      if (existing) {
        existing.remove();
      }

      // Create new container
      const container = document.createElement('div');
      container.id = 'print-registry-container';
      container.style.cssText = `
        position: fixed;
        left: -99999px;
        top: 0;
        width: 210mm;
        background: #ffffff;
        visibility: hidden;
        z-index: -1;
      `;
      container.setAttribute('aria-hidden', 'true');
      container.setAttribute('role', 'presentation');
      document.body.appendChild(container);
      
      containerRef.current = container;
      
      // Create React root
      rootRef.current = createRoot(container);
      
      // Wait for fonts
      const waitForFonts = document.fonts?.ready || Promise.resolve();
      waitForFonts.then(() => setIsReady(true));
    };

    createContainer();

    // Cleanup on unmount
    return () => {
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }
      
      if (containerRef.current && containerRef.current.parentNode) {
        containerRef.current.parentNode.removeChild(containerRef.current);
        containerRef.current = null;
      }
      
      // Remove injected print styles
      const styles = document.getElementById('print-registry-styles');
      if (styles) {
        styles.remove();
      }
    };
  }, []);

  // Queue forms for printing
  const queueForms = useCallback((formConfigs) => {
    if (!Array.isArray(formConfigs)) {
      console.error('usePrintRegistry: formConfigs must be an array');
      return;
    }
    
    formsRef.current = formConfigs;
    setForms(formConfigs);
  }, []);

  // Clear queued forms
  const clearForms = useCallback(() => {
    formsRef.current = [];
    setForms([]);
    
    // Unmount current content
    if (rootRef.current) {
      rootRef.current.unmount();
      
      // Re-create root for future renders
      if (containerRef.current) {
        rootRef.current = createRoot(containerRef.current);
      }
    }
  }, []);

  // Render forms into container
  const renderForms = useCallback(async () => {
    if (!rootRef.current || !containerRef.current || formsRef.current.length === 0) {
      return;
    }

    // Inject print styles
    let stylesEl = document.getElementById('print-registry-styles');
    if (!stylesEl) {
      stylesEl = document.createElement('style');
      stylesEl.id = 'print-registry-styles';
      stylesEl.textContent = `
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        
        @media print {
          body > * {
            visibility: hidden !important;
          }
          
          #print-registry-container,
          #print-registry-container * {
            visibility: visible !important;
          }
          
          #print-registry-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
          }
        }
      `;
      document.head.appendChild(stylesEl);
    }

    // Prepare form elements with page breaks
    const formElements = formsRef.current.map((formConfig, index) => {
      const { Component, props = {} } = formConfig;
      return (
        <div
          key={`form-${index}-${Date.now()}`}
          style={{
            breakAfter: 'page',
            pageBreakAfter: 'always',
            width: '210mm',
            maxWidth: '210mm',
            minHeight: '297mm',
            background: '#ffffff',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ width: '100%', maxWidth: '210mm' }}>
            <Component {...props} />
          </div>
        </div>
      );
    });

    // Render to container
    flushSync(() => {
      rootRef.current.render(formElements);
    });

    // Wait for layout and images
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // Wait for images
    const images = containerRef.current.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete && img.naturalWidth > 0) {
          return Promise.resolve();
        }
        return new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
          setTimeout(() => resolve(), 5000);
        });
      })
    );
    
    // One more frame after images
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }, []);

  // Main print function
  const print = useCallback(async () => {
    if (formsRef.current.length === 0) {
      console.warn('usePrintRegistry: No forms queued for printing');
      return;
    }

    if (!isReady) {
      console.warn('usePrintRegistry: Print registry not ready');
      return;
    }

    setIsPrinting(true);

    try {
      // Render forms
      await renderForms();

      // Call before print callback
      if (typeof onBeforePrint === 'function') {
        onBeforePrint();
      }

      // Trigger print dialog
      window.print();

      // Cleanup after delay (since there's no reliable afterprint event)
      setTimeout(() => {
        // Clear forms
        clearForms();
        
        // Remove styles
        const stylesEl = document.getElementById('print-registry-styles');
        if (stylesEl) {
          stylesEl.remove();
        }
        
        // Call after print callback
        if (typeof onAfterPrint === 'function') {
          onAfterPrint();
        }
        
        setIsPrinting(false);
      }, 1000);
    } catch (error) {
      console.error('usePrintRegistry: Print error', error);
      setIsPrinting(false);
    }
  }, [isReady, renderForms, clearForms, onBeforePrint, onAfterPrint]);

  // Alternative: Print with explicit form array (doesn't require queueForms first)
  const printForms = useCallback(async (formConfigs) => {
    if (!Array.isArray(formConfigs) || formConfigs.length === 0) {
      console.warn('usePrintRegistry: No forms provided to printForms');
      return;
    }

    queueForms(formConfigs);
    
    // Small delay to ensure state is set
    await new Promise((resolve) => setTimeout(resolve, 0));
    
    await print();
  }, [queueForms, print]);

  return {
    // State
    isPrinting,
    isReady,
    forms,
    
    // Actions
    print,
    printForms,
    queueForms,
    clearForms,
    
    // Direct container access (advanced use)
    getContainer: () => containerRef.current,
  };
}
