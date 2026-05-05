import PropTypes from "prop-types";

function getPatientInitials(displayName) {
  const parts = (displayName || "?").trim().split(/\s+/);
  if (!parts.length) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function SelectedPatientIndicator({
  selectedPatient = null,
  onChangeSelection = undefined,
  changeLabel = "Change",
}) {
  if (!selectedPatient) {
    return (
      <div className="lab-hero-badge lab-hero-badge--pending">
        <svg
          viewBox="0 0 16 16"
          width="14"
          height="14"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
          <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm1 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-4a1 1 0 0 1-2 0V5a1 1 0 1 1 2 0v4z" />
        </svg>
        No patient selected
      </div>
    );
  }

  return (
    <div className="lab-hero-patient">
      <div className="lab-hero-patient-avatar" aria-hidden="true">
        {getPatientInitials(selectedPatient.displayName)}
      </div>
      <div className="lab-hero-patient-info">
        <span className="lab-hero-patient-label">Selected Patient</span>
        <span className="lab-hero-patient-name">
          {selectedPatient.displayName}
        </span>
      </div>

      {typeof onChangeSelection === "function" ? (
        <button
          type="button"
          className="lab-hero-patient-change"
          onClick={onChangeSelection}
          aria-label="Change patient selection"
        >
          <svg
            viewBox="0 0 16 16"
            width="13"
            height="13"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.622.94a.253.253 0 0 0 .102.275l3.994 2.276a.75.75 0 1 1-.88 1.14l-3.994-2.276a.253.253 0 0 0-.177-.109l-.622-.94a.253.253 0 0 0-.064-.108l-6.286-6.286.041-.042a1.014 1.014 0 0 1 1.429.042l1.128 1.128a1.014 1.014 0 0 1-.042 1.43z" />
          </svg>
          {changeLabel}
        </button>
      ) : null}
    </div>
  );
}

SelectedPatientIndicator.propTypes = {
  selectedPatient: PropTypes.shape({
    id: PropTypes.string,
    displayName: PropTypes.string,
  }),
  onChangeSelection: PropTypes.func,
  changeLabel: PropTypes.string,
};

export default SelectedPatientIndicator;
