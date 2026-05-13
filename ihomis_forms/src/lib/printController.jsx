/**
 * Print Controller Utility
 * 
 * Lifecycle controller for Native Browser Print System.
 * 
 * Flow:
 * 1. Mount PrintRegistry (in DOM, visible in print)
 * 2. Wait for all assets (logos, charts, fonts, CSS) to load
 * 3. Trigger window.print()
 * 4. Unmount registry after print dialog is closed
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import PrintRegistry from './PrintRegistry.jsx';

/**
 * Global print styles
 * These ONLY manage visibility and page setup - NOT form styling
 */
const GLOBAL_PRINT_STYLES = `
  /* A4 Page Setup */
  @page {
    size: A4 portrait;
    margin: 8mm 8mm 10mm 8mm;
  }

  /* Screen: Hide print container from view but keep it in DOM */
  #print-registry-container {
    position: fixed;
    left: 0;
    top: 0;
    width: 210mm;
    background: #ffffff;
    visibility: hidden; /* Hidden on screen but exists for print */
    z-index: -1;
    padding: 0;
    margin: 0;
  }

  /* Print: Show only the print container */
  @media print {
    html, body {
      width: 210mm !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      overflow: visible !important;
    }
    
    /* Hide all page content */
    body > *:not(#print-registry-container) {
      visibility: hidden !important;
      display: none !important;
    }
    
    /* Show only the print container */
    #print-registry-container {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 210mm !important;
      background: #ffffff !important;
      visibility: visible !important;
      display: block !important;
      z-index: auto !important;
      padding: 0 !important;
      margin: 0 !important;
    }
  }
`;

/**
 * Injects global print styles into document head
 */
function injectPrintStyles() {
  const existingStyle = document.getElementById('print-registry-global-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  const styleEl = document.createElement('style');
  styleEl.id = 'print-registry-global-styles';
  styleEl.textContent = GLOBAL_PRINT_STYLES;
  document.head.appendChild(styleEl);
  
  return styleEl;
}

/**
 * Removes global print styles
 */
function removePrintStyles() {
  const existingStyle = document.getElementById('print-registry-global-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
}

/**
 * Wait for all web fonts to load
 */
async function waitForFonts() {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  return Promise.resolve();
}

/**
 * Wait for all images in a container to fully load
 */
async function waitForImages(container) {
  if (!container) return Promise.resolve();

  const images = container.querySelectorAll('img');
  if (images.length === 0) return Promise.resolve();

  const imagePromises = Array.from(images).map((img) => {
    // Already loaded
    if (img.complete && img.naturalWidth > 0) {
      return Promise.resolve();
    }
    // Wait for load/error with timeout
    return new Promise((resolve) => {
      img.addEventListener('load', () => resolve(), { once: true });
      img.addEventListener('error', () => resolve(), { once: true });
      setTimeout(() => resolve(), 5000); // 5 second timeout
    });
  });

  return Promise.all(imagePromises);
}

/**
 * Wait for CSS layouts to settle
 */
async function waitForLayout() {
  // Multiple frames to ensure rendering is complete
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise((resolve) => setTimeout(resolve, 200));
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise((resolve) => setTimeout(resolve, 200));
}

/**
 * Create the print container DOM element
 */
function createPrintContainer() {
  const existing = document.getElementById('print-registry-container');
  if (existing) {
    existing.remove();
  }

  const container = document.createElement('div');
  container.id = 'print-registry-container';
  document.body.appendChild(container);
  
  return container;
}

/**
 * Remove the print container
 */
function removePrintContainer(container) {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
}

/**
 * Trigger native browser print dialog
 */
function triggerPrint() {
  window.print();
}

/**
 * Full cleanup - unmount React, remove container, remove styles
 */
function cleanup(container, root) {
  if (root) {
    root.unmount();
  }
  removePrintContainer(container);
  removePrintStyles();
}

/**
 * Main print function
 * 
 * @param {Array} formConfigs - Array of form objects from database
 * @param {Object} options - Print options
 * @param {string} options.patientName - Patient full name
 * @param {Object} options.patientData - Patient data object
 * @param {Function} options.onBeforePrint - Callback before print dialog
 * @param {Function} options.onAfterPrint - Callback after print dialog
 */
export async function printForms(formConfigs, options = {}) {
  const {
    patientName = "",
    patientData = {},
    onBeforePrint,
    onAfterPrint,
  } = options;

  if (!formConfigs || formConfigs.length === 0) {
    console.warn('printForms: No forms provided');
    return;
  }

  // Step 1: Inject global print styles
  injectPrintStyles();

  // Step 2: Create container
  const container = createPrintContainer();
  
  // Step 3: Create React root
  const root = createRoot(container);
  
  // Step 4: Render PrintRegistry with all forms
  flushSync(() => {
    root.render(
      <PrintRegistry
        formConfigs={formConfigs}
        patientName={patientName}
        patientData={patientData}
      />
    );
  });

  // Step 5: Wait for fonts
  await waitForFonts();

  // Step 6: Wait for layout
  await waitForLayout();

  // Step 7: Wait for all images (logos, charts) to load
  await waitForImages(container);

  // Step 8: CRITICAL - Wait additional 1000ms to ensure:
  // - Logos from Supabase are fully loaded
  // - CSS Modules are fully painted
  // - All computed styles are applied
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Step 9: Callback before print
  if (typeof onBeforePrint === 'function') {
    onBeforePrint();
  }

  // Step 10: Trigger print dialog
  triggerPrint();

  // Step 11: Cleanup after print dialog closes
  // Use afterprint + media query fallback to avoid cleanup during heavy renders
  let mediaQuery = null;
  let handleMediaChange = null;
  let didCleanup = false;
  let fallbackTimerId = null;

  const cleanupOnce = () => {
    if (didCleanup) return;
    didCleanup = true;
    if (mediaQuery?.removeEventListener && handleMediaChange) {
      mediaQuery.removeEventListener("change", handleMediaChange);
    }
    if (fallbackTimerId) {
      clearTimeout(fallbackTimerId);
    }
    cleanup(container, root);
    if (typeof onAfterPrint === "function") {
      onAfterPrint();
    }
  };

  const handleAfterPrint = () => cleanupOnce();
  window.addEventListener("afterprint", handleAfterPrint, { once: true });

  mediaQuery = window.matchMedia?.("print");
  handleMediaChange = (event) => {
    if (!event.matches) {
      cleanupOnce();
    }
  };

  if (mediaQuery?.addEventListener) {
    mediaQuery.addEventListener("change", handleMediaChange);
  }

  // Fallback in case afterprint is not fired (older browsers)
  fallbackTimerId = setTimeout(() => {
    cleanupOnce();
  }, 15000);
}

/**
 * Print multiple forms (alias)
 */
export async function printFormConfigs(formConfigs, options = {}) {
  return printForms(formConfigs, options);
}

/**
 * Print a single form
 */
export async function printSingleForm(Component, props = {}, options = {}) {
  return printForms([{ id: 'single-form', component_name: Component.name, ...props }], options);
}

/**
 * Check browser support
 */
export function supportsNativePrint() {
  return typeof window !== 'undefined' && typeof window.print === 'function';
}
