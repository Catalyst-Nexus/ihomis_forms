import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import Forms from "./Forms.jsx";
import ValidationModule from "../validation/ValidationModule.jsx";

function FormsModule({ selectedPatient = null, onRequestPatientChange }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  // Start by showing forms first. Validation will be shown after the user selects forms.
  const [showValidation, setShowValidation] = useState(false);
  const [pendingSelectedForms, setPendingSelectedForms] = useState(null);
  const [postValidatedSelectedForms, setPostValidatedSelectedForms] = useState(null);
  const [autoOpenForms, setAutoOpenForms] = useState(false);

  useEffect(() => {
    // Reset state when patient changes
    setShowValidation(false);
    setPendingSelectedForms(null);
    setPostValidatedSelectedForms(null);
    setAutoOpenForms(false);
  }, [selectedPatient?.id, selectedPatient?.contextParams?.hpercode]);

  if (showValidation) {
    return (
      <ValidationModule
        selectedPatient={selectedPatient}
        selectedForms={pendingSelectedForms}
        onProceed={(result = {}) => {
          // After validation proceed back to forms; only open preview when allowed
          const allowPreview = Boolean(result.canProceed);
          setShowValidation(false);
          setPostValidatedSelectedForms(pendingSelectedForms);
          setPendingSelectedForms(null);
          setAutoOpenForms(allowPreview);
        }}
        onBackToForms={() => {
          setShowValidation(false);
          setPostValidatedSelectedForms(pendingSelectedForms);
          setPendingSelectedForms(null);
          setAutoOpenForms(false);
        }}
        onChangePatient={onRequestPatientChange}
      />
    );
  }

  return (
    <Forms
      isDarkMode={isDarkMode}
      setIsDarkMode={setIsDarkMode}
      selectedPatient={selectedPatient}
      // When user clicks generate, show validation first
      onBeforeGenerate={(selectedArray) => {
        setPendingSelectedForms(selectedArray);
        setShowValidation(true);
      }}
      // If coming back from validation, pre-select and auto-open
      initialSelectedForms={postValidatedSelectedForms}
      autoOpen={autoOpenForms}
    />
  );
}

export default FormsModule;

FormsModule.propTypes = {
  selectedPatient: PropTypes.shape({
    id: PropTypes.string,
    displayName: PropTypes.string,
    rawData: PropTypes.object,
    contextParams: PropTypes.object,
  }),
  onRequestPatientChange: PropTypes.func,
};
