import React from 'react';
import styles from './PrintRegistry.module.css';
import FormSheetHeader from '../modules/components/FormSheetHeader.jsx';
import {
  getComponentProps,
  getFormComponent,
  getFormTitle,
  isMultiPageComponent,
} from './formRegistry.js';

/**
 * Single Form Page Container
 * 
 * For SINGLE-PAGE forms: Uses strict A4 container (297mm height)
 * For MULTI-PAGE forms: Uses fluid container (height: auto) to allow natural page flow
 */
function PrintPageContainer({ formConfig, patientName, patientData, isLast }) {
  const { component_name, description } = formConfig;
  const Component = getFormComponent(component_name);
  const formTitle = getFormTitle(description);
  const isMultiPage = isMultiPageComponent(component_name);
  
  // Determine container class based on form type
  let containerClass = isMultiPage ? styles.fluidPageBreak : styles.pageBreak;
  if (isLast) {
    containerClass = isMultiPage ? styles.fluidPageBreakLast : styles.pageBreakLast;
  }
  
  if (!Component) {
    return (
      <div className={containerClass}>
        <p>Component not found: {component_name}</p>
      </div>
    );
  }
  
  const props = getComponentProps(component_name, patientName, patientData);
  
  return (
    <div className={containerClass}>
      {/* FormSheetHeader - only at top, not repeated for multi-page */}
      <FormSheetHeader 
        title={formTitle}
        formNo=""
        revised=""
      />
      
      {/* Form Body */}
      <Component {...props} />
    </div>
  );
}

/**
 * PrintRegistry Component
 * 
 * Renders all selected forms for combined print output.
 * Multi-page forms get fluid containers, single-page forms get strict A4.
 */
export default function PrintRegistry({ formConfigs = [], patientName = "", patientData = {} }) {
  if (!formConfigs || formConfigs.length === 0) {
    return null;
  }
  
  return (
    <div className={styles.printRegistryWrapper}>
      {formConfigs.map((formConfig, index) => (
        <PrintPageContainer
          key={formConfig.id || `form-${index}`}
          formConfig={formConfig}
          patientName={patientName}
          patientData={patientData}
          isLast={index === formConfigs.length - 1}
        />
      ))}
    </div>
  );
}

export { COMPONENT_MAP, MULTI_PAGE_COMPONENTS } from './formRegistry.js';
