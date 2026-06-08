import { useEffect, useState } from "react";
import Forms from "./Forms";
import ValidationModule from "../validation/ValidationModule";

function FormsModule({ selectedPatient = null, selectedContextParams = null, onRequestPatientChange }) {
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
        enccode={selectedContextParams?.enccode || selectedContextParams?.enc || null}
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
      selectedPatient={selectedPatient}
      // When user clicks generate, show validation first
      onBeforeGenerate={(selectedArray) => {
        setPendingSelectedForms(selectedArray);
        setShowValidation(true);
      }}
      // If coming back from validation, pre-select and auto-open
      initialSelectedForms={postValidatedSelectedForms}
      autoOpen={autoOpenForms}
      onChangePatient={onRequestPatientChange}
    />
  );
}

export default FormsModule;
