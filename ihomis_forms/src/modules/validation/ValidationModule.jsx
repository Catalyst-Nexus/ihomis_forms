import PropTypes from "prop-types";
import ValidationPage from "./ValidationPage.jsx";

function ValidationModule({ selectedPatient, enccode = null, selectedForms = null, onProceed, onBackToForms, onChangePatient }) {
  return (
    <ValidationPage
      selectedPatient={selectedPatient}
      enccode={enccode}
      // forward selected forms (optional) so the page/component tree can react if needed
      selectedForms={selectedForms}
      onProceed={onProceed}
      onBackToForms={onBackToForms}
      onChangePatient={onChangePatient}
    />
  );
}

ValidationModule.propTypes = {
  selectedPatient: PropTypes.shape({
    id: PropTypes.string,
    displayName: PropTypes.string,
    rawData: PropTypes.object,
    contextParams: PropTypes.object,
  }),
  enccode: PropTypes.string,
  selectedForms: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  onProceed: PropTypes.func.isRequired,
  onBackToForms: PropTypes.func,
  onChangePatient: PropTypes.func,
};

export default ValidationModule;
