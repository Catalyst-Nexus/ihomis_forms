import PropTypes from "prop-types";
import ValidationPage from "./ValidationPage.jsx";

function ValidationModule({ selectedPatient, onProceed, onChangePatient }) {
  return (
    <ValidationPage
      selectedPatient={selectedPatient}
      onProceed={onProceed}
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
  onProceed: PropTypes.func.isRequired,
  onChangePatient: PropTypes.func,
};

export default ValidationModule;
