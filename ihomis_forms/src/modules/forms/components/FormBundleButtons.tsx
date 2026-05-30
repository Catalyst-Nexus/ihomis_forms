/**
 * FormBundleButtons Component
 * 
 * Dynamically renders bundle buttons by mapping through the form_bundles table.
 * Buttons are generated from database entries - no hardcoding required.
 * 
 * Usage:
 *   <FormBundleButtons
 *     bundles={bundles}
 *     onToggleBundle={toggleBundle}
 *     isBundleSelected={isBundleSelected}
 *     getBundleSelectionCount={getBundleSelectionCount}
 *     loading={loading}
 *   />
 * 
 * This component only handles rendering. Logic is handled by useFormBundles hook.
 */


/**
 * Dynamic Bundle Button Component
 * Renders buttons based on bundles data from database
 */
export function FormBundleButtons({
  bundles = [],
  onToggleBundle,
  isBundleSelected,
  getBundleSelectionCount,
  loading = false,
  disabled = false,
}) {
  if (loading) {
    return (
      <div className="bundle-buttons-container bundle-buttons-container--inline">
        <span className="bundle-loading">Loading bundles...</span>
      </div>
    );
  }

  if (!bundles || bundles.length === 0) {
    return null; // No bundles to display
  }

  return (
    <div className="bundle-buttons-container bundle-buttons-container--inline">
      <span className="bundle-label">Quick Select:</span>
      <div className="bundle-buttons">
        {bundles.map((bundle) => {
          const selected = isBundleSelected ? isBundleSelected(bundle.id) : false;
          const count = getBundleSelectionCount 
            ? getBundleSelectionCount(bundle.id) 
            : 0;
          const totalForms = bundle.total_forms || 0;

          return (
            <button
              key={bundle.id}
              type="button"
              className={`bundle-btn ${selected ? "bundle-btn--active" : ""}`}
              onClick={() => onToggleBundle(bundle.id)}
              disabled={disabled}
              title={bundle.description || `Select all ${bundle.name} forms`}
              aria-pressed={selected}
            >
              <span className="bundle-btn-icon">
                {selected ? "✓" : "+"}
              </span>
              <span className="bundle-btn-text">{bundle.name}</span>
              {count > 0 && totalForms > 0 && (
                <span className="bundle-btn-count">
                  {count}/{totalForms}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}



export default FormBundleButtons;
