import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import Forms from "./Forms.jsx";
import ValidationModule from "../validation/ValidationModule.jsx";

function FormsModule({ selectedPatient = null, onRequestPatientChange }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showValidation, setShowValidation] = useState(true);

  useEffect(() => {
    setShowValidation(true);
  }, [selectedPatient?.id, selectedPatient?.contextParams?.hpercode]);

  if (showValidation) {
    return (
      <ValidationModule
        selectedPatient={selectedPatient}
        onProceed={() => setShowValidation(false)}
        onChangePatient={onRequestPatientChange}
      />
    );
  }

  return (
    <Forms
      isDarkMode={isDarkMode}
      setIsDarkMode={setIsDarkMode}
      selectedPatient={selectedPatient}
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
