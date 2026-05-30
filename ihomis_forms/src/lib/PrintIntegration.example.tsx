/**
 * Print Integration Guide for Forms.jsx
 * 
 * This file demonstrates how to integrate the Native Browser Print System
 * with your existing Forms.jsx component.
 * 
 * The print system replaces the html2canvas/jsPDF workflow with the browser's
 * native print engine, ensuring CSS Module styles are properly applied.
 * 
 * =============================================================================
 * OPTION 1: Using the Hook (Recommended for React components)
 * =============================================================================
 */

import { useCallback } from 'react';
import { usePrintRegistry } from './usePrintRegistry';

// In your Forms component:
function FormsWithPrint() {
  // Initialize the print registry hook
  const {
    isPrinting,
    isReady,
    printForms,
    print,
    queueForms,
    clearForms
  } = usePrintRegistry({
    onBeforePrint: () => {
      console.log('Print dialog about to open');
    },
    onAfterPrint: () => {
      console.log('Print dialog closed, cleanup complete');
    }
  });

  // Example: Print selected forms
  const handlePrintSelectedForms = useCallback((selectedForms, patientData) => {
    // Build form configurations from selected forms
    const formConfigs = selectedForms.map((formObject) => ({
      Component: COMPONENT_MAP[formObject.component_name],
      props: {
        patientName: patientData.fullName,
        patientData: patientData,
      }
    })).filter(config => config.Component !== undefined);

    if (formConfigs.length === 0) {
      console.warn('No valid forms to print');
      return;
    }

    // Print all forms at once
    printForms(formConfigs);
  }, [printForms]);

  // ... rest of your component
}

/**
 * =============================================================================
 * OPTION 2: Using the Print Controller (For direct function calls)
 * =============================================================================
 */

import { printForms as directPrintForms } from './printController';

function ExampleDirectPrint() {
  const handleDirectPrint = async () => {
    try {
      // Prepare forms to print
      const formConfigs = [
        {
          Component: TPRSheet,
          props: { patientName: 'John Doe', patientData: { /* ... */ } }
        },
        {
          Component: MonitoringSheet,
          props: { patientName: 'John Doe', patientData: { /* ... */ } }
        },
        {
          Component: Neurologic,
          props: { patientName: 'John Doe', patientData: { /* ... */ } }
        }
      ];

      // Trigger print
      await directPrintForms(formConfigs, {
        onBeforePrint: () => {
          console.log('Preparing to print...');
        },
        onAfterPrint: () => {
          console.log('Print complete!');
        }
      });
    } catch (error) {
      console.error('Print failed:', error);
    }
  };

  return <button onClick={handleDirectPrint}>Print Forms</button>;
}

/**
 * =============================================================================
 * OPTION 3: Using PrintRegistry Component (Portal-based)
 * =============================================================================
 */

import { useRef } from 'react';
import PrintRegistry from './PrintRegistry';

function FormsWithRegistryComponent() {
  const printRegistryRef = useRef(null);

  const handlePrintWithRegistry = () => {
    if (!printRegistryRef.current?.print) return;

    const formConfigs = [
      { Component: TPRSheet, props: { patientName, patientData } },
      { Component: MonitoringSheet, props: { patientName, patientData } }
    ];

    // Queue forms and trigger print
    printRegistryRef.current.queueForms(formConfigs);
    printRegistryRef.current.print();
  };

  return (
    <>
      {/* Add this once at the top level of your app */}
      <PrintRegistry ref={printRegistryRef} />
      
      {/* Your existing UI */}
      <button onClick={handlePrintWithRegistry}>
        Print Selected Forms
      </button>
    </>
  );
}

/**
 * =============================================================================
 * INTEGRATION INSTRUCTIONS FOR Forms.jsx
 * =============================================================================
 * 
 * 1. Add the usePrintRegistry import to Forms.jsx
 * 
 * 2. Initialize the hook in the Forms component
 * 
 * 3. Create a new handler that replaces handleGenerateSelectedFormsPdf
 * 
 * 4. Update the button in the UI to call the new handler
 * 
 * =============================================================================
 */

// Here's what your modified handlePrintSelectedForms would look like:

/*
const handlePrintSelectedForms = useCallback(async () => {
  const selectedFormObjects = dbForms.filter((form) => selectedForms.has(form.id));

  if (selectedFormObjects.length === 0) {
    return;
  }

  // Build form configurations
  const formConfigs = selectedFormObjects
    .map((formObject) => {
      const FormComponent = COMPONENT_MAP[formObject.component_name];
      
      if (!FormComponent) {
        console.warn(`Component not found: ${formObject.component_name}`);
        return null;
      }

      // Build props based on component requirements
      let props = { patientName, patientData };
      
      // Edge cases for components with different prop requirements
      if (formObject.component_name === 'ApgarScoring') {
        props = { apiResponse: patientData };
      } else if (formObject.component_name === 'ClinicalReferralSlip') {
        props = { patientName };
      }

      return {
        Component: FormComponent,
        props
      };
    })
    .filter(Boolean);

  if (formConfigs.length === 0) {
    window.alert('No valid forms could be printed.');
    return;
  }

  // Use the print controller
  await directPrintForms(formConfigs, {
    onBeforePrint: () => {
      console.log('Opening print dialog for', formConfigs.length, 'forms');
    },
    onAfterPrint: () => {
      console.log('Print job completed');
    }
  });
}, [selectedForms, dbForms, patientName, patientData]);
*/

/**
 * =============================================================================
 * PAGE BREAK DEMONSTRATION
 * =============================================================================
 * 
 * Each form in the print container automatically gets a page break after it.
 * This is controlled by the CSS in PrintRegistry.module.css:
 * 
 * .formPage {
 *   break-after: page;
 *   page-break-after: always;
 * }
 * 
 * This ensures:
 * - TPRSheet prints on page 1
 * - MonitoringSheet prints on page 2
 * - Neurologic prints on page 3
 * - etc.
 * 
 * =============================================================================
 * 210mm WIDTH CONSTRAINT
 * =============================================================================
 * 
 * The width is locked to 210mm (A4 width) through:
 * 
 * 1. Container width: width: 210mm
 * 2. Page wrapper: max-width: 210mm
 * 3. @page rule: size: A4 portrait
 * 4. Print media query overrides
 * 
 * =============================================================================
 * VISIBILITY LOGIC
 * =============================================================================
 * 
 * Screen View:
 * - Container is position: fixed; left: -99999px; visibility: hidden
 * - Forms are NOT visible to the user
 * 
 * Print View:
 * - @media print overrides make container visible
 * - Only the print container content is shown
 * - Perfect for clean printouts
 * 
 * =============================================================================
 */
