
function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function formatTime(timeString) {
  if (!timeString) return "";
  try {
    const [hours, minutes] = timeString.split(":");
    if (!hours || !minutes) return timeString;
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return timeString;
  }
}

function getEncounterTypeLabel(type) {
  const typeMap = {
    adm: "Admission",
    er: "Emergency Room",
    eradm: "Emergency Room",
    opd: "Outpatient",
    1: "Outpatient",
    2: "Inpatient",
    3: "Emergency",
    op: "Outpatient",
    ip: "Inpatient",
    inpatient: "Inpatient",
    outpatient: "Outpatient",
    emergency: "Emergency",
  };
  return typeMap[String(type).toLowerCase()] || type || "Encounter";
}

function getEncounterTypeColor(type) {
  const colorMap = {
    adm: "enc-type--adm",
    er: "enc-type--er",
    eradm: "enc-type--er",
    opd: "enc-type--opd",
    1: "enc-type--opd",
    2: "enc-type--adm",
    3: "enc-type--er",
    op: "enc-type--opd",
    ip: "enc-type--adm",
    inpatient: "enc-type--adm",
    outpatient: "enc-type--opd",
    emergency: "enc-type--er",
  };
  return colorMap[String(type).toLowerCase()] || "enc-type--default";
}

function EncounterCard({ encounter, isSelected, onSelect }) {
  const { enccode, encdates, toa, tod, fhud, type, status, toecode } = encounter;

  const displayDate = formatDate(encdates);
  const displayTimeIn = formatTime(toa);
  const displayTimeOut = formatTime(tod);
  const typeLabel = getEncounterTypeLabel(toecode || type);
  const typeColorClass = getEncounterTypeColor(toecode || type);

  return (
    <button
      type="button"
      className={`enc-card${isSelected ? " enc-card--selected" : ""}`}
      onClick={() => onSelect(encounter)}
      aria-pressed={isSelected}
    >
      <div className="enc-card-main">
        <div className="enc-card-header">
          <span className={`enc-type-badge ${typeColorClass}`}>
            {typeLabel}
          </span>
          {status && (
            <span className="enc-status-badge">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          )}
        </div>

        <div className="enc-card-code">
          {/* <code>{enccode}</code>   */}
        </div>

        <div className="enc-card-datetime">
          {displayDate && (
            <span className="enc-datetime-item">
              <svg
                viewBox="0 0 16 16"
                width="12"
                height="12"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M4.75 0a.75.75 0 0 1 .75.75V2h5V.75a.75.75 0 0 1 1.5 0V2h1A2.25 2.25 0 0 1 14 4.25v8.5A2.25 2.25 0 0 1 11.75 15H4.25A2.25 2.25 0 0 1 2 12.75v-8.5A2.25 2.25 0 0 1 4.25 2H5V.75A.75.75 0 0 1 4.75 0zm0 4.5h5.5a.75.75 0 0 1 0 1.5H4.75a.75.75 0 0 1 0-1.5zm.75 3h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5z" />
              </svg>
              {displayDate}
            </span>
          )}
          {(displayTimeIn || displayTimeOut) && (
            <span className="enc-datetime-item">
              <svg
                viewBox="0 0 16 16"
                width="12"
                height="12"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.5 8.5a.5.5 0 0 1 .5.5v2.5h1a.5.5 0 0 1 0 1h-3.5v-1h1.5v-.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1h.5a.5.5 0 0 1 0 1h-1v.5a.5.5 0 0 1-1 0v-2.5h-1a.5.5 0 0 1 0-1h3.5v1h-1.5v.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1H8.5a.5.5 0 0 1-.5-.5v-.5H7a.5.5 0 0 1 0-1h2.5v.5a.5.5 0 0 1-.5.5h-2z" />
              </svg>
              {displayTimeIn}
              {displayTimeOut && ` - ${displayTimeOut}`}
            </span>
          )}
        </div>

        {fhud && (
          <div className="enc-card-facility">
            <svg
              viewBox="0 0 24 24"
              width="11"
              height="11"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Facility {fhud}</span>
          </div>
        )}
      </div>

      <div className="enc-card-check">
        {isSelected ? (
          <svg
            viewBox="0 0 20 20"
            width="18"
            height="18"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            viewBox="0 0 20 20"
            width="18"
            height="18"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM9.555 7.168A1 1 0 0 0 8 8v4a1 1 0 0 0 1.555.832l3-2a1 1 0 0 0 0-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    </button>
  );
}



function EncounterSelectionModal({
  isOpen,
  patient = null,
  encounters = [],
  selectedEncounter = null,
  loading = false,
  error = "",
  onSelectEncounter,
  onClose,
  onConfirm = null,
  onRetry = null,
}) {
  if (!isOpen) return null;

  const hpercode =
    patient?.contextParams?.hpercode || patient?.rawData?.hpercode || "";

  return (
    <div
      className="enc-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="enc-modal-title"
    >
      <div className="enc-modal-container">
        {/* Header */}
        <div className="enc-modal-header">
          <div className="enc-modal-title-wrap">
            <div className="enc-modal-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div>
              <h2 id="enc-modal-title" className="enc-modal-title">
                Select Encounter
              </h2>
              <p className="enc-modal-subtitle">
                {patient?.displayName || "Patient"}
                {hpercode && (
                  <>
                    {" "}
                    <span className="enc-modal-hper">({hpercode})</span>
                  </>
                )}{" "}
                has multiple encounters
              </p>
            </div>
          </div>
          <button
            type="button"
            className="enc-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg
              viewBox="0 0 20 20"
              width="16"
              height="16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="enc-modal-body">
          {loading && (
            <div className="enc-modal-loading">
              <div className="enc-spinner" aria-hidden="true" />
              <span>Loading encounters...</span>
            </div>
          )}

          {error && !loading && (
            <div className="enc-modal-error">
              <svg
                viewBox="0 0 20 20"
                width="20"
                height="20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-1 1v4a1 1 0 0 0 .293.707l2.828 2.829a1 1 0 1 0 1.414-1.415L11 9.586V5a1 1 0 0 0-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="enc-error-title">Failed to load encounters</p>
                <p className="enc-error-message">{error}</p>
              </div>
              {onRetry && (
                <button
                  type="button"
                  className="enc-retry-btn"
                  onClick={onRetry}
                >
                  Try Again
                </button>
              )}
            </div>
          )}

          {!loading && !error && encounters.length === 0 && (
            <div className="enc-modal-empty">
              <svg
                viewBox="0 0 24 24"
                width="40"
                height="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p>No encounters found for this patient</p>
            </div>
          )}

          {!loading && !error && encounters.length > 0 && (
            <ul className="enc-list" role="listbox" aria-label="Encounter list">
              {encounters.map((encounter) => (
                <li key={encounter.enccode}>
                  <EncounterCard
                    encounter={encounter}
                    isSelected={
                      selectedEncounter?.enccode === encounter.enccode
                    }
                    onSelect={onSelectEncounter}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="enc-modal-footer">
          <p className="enc-modal-hint">
            {encounters.length > 0
              ? `Select an encounter to continue. ${encounters.length} encounter${encounters.length !== 1 ? "s" : ""} found.`
              : "No encounters available."}
          </p>
          <div className="enc-modal-actions">
            <button type="button" className="enc-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="enc-confirm-btn"
              onClick={() => selectedEncounter && onConfirm && onConfirm()}
              disabled={!selectedEncounter}
            >
              Confirm Encounter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



export default EncounterSelectionModal;
