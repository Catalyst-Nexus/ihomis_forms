import './FormSheetHeader.css';

function SealPlaceholder({ label }) {
  return (
    <div className="form-sheet-header__seal" aria-hidden="true">
      {label}
    </div>
  );
}

export default function FormSheetHeader({
  leftLogoSrc,
  rightLogoSrc,
  leftLogoAlt = 'Left agency seal',
  rightLogoAlt = 'Right agency seal',
  country = 'Republic of the Philippines',
  office = 'Provincial Health Office',
  hospital = 'AGUSAN DEL NORTE PROVINCIAL HOSPITAL',
  address = 'VILLAGE II, BRGY. LIBERTAD, BUTUAN CITY (Capital) AGUSAN DEL NORTE CARAGA',
  contactNo = '085 817-3390',
  formNo = '',
  revised = '',
  title = 'MONITORING SHEET',
}) {
  return (
    <header className="form-sheet-header" role="banner">
      <div className="form-sheet-header__top-row">
        <div className="form-sheet-header__logo-wrap">
          {leftLogoSrc ? (
            <img src={leftLogoSrc} alt={leftLogoAlt} className="form-sheet-header__logo" />
          ) : (
            <SealPlaceholder label="OFFICIAL SEAL" />
          )}
        </div>

        <div className="form-sheet-header__center">
          <p className="form-sheet-header__line form-sheet-header__line--regular">{country}</p>
          <p className="form-sheet-header__line form-sheet-header__line--bold">{office}</p>
          <p className="form-sheet-header__line form-sheet-header__line--hospital">{hospital}</p>
          <p className="form-sheet-header__line form-sheet-header__line--italic">{address}</p>
          <p className="form-sheet-header__line form-sheet-header__line--small">Contact No: {contactNo}</p>
        </div>

        <div className="form-sheet-header__logo-wrap">
          {rightLogoSrc ? (
            <img src={rightLogoSrc} alt={rightLogoAlt} className="form-sheet-header__logo" />
          ) : (
            <SealPlaceholder label="HOSPITAL SEAL" />
          )}
        </div>
      </div>

      <div className="form-sheet-header__meta-row">
        <p>
          <span className="form-sheet-header__meta-label">FORM NO.:</span>{' '}
          <span className="form-sheet-header__meta-value">{formNo}</span>
        </p>
        <p>
          <span className="form-sheet-header__meta-label">Revised.:</span>{' '}
          <span className="form-sheet-header__meta-value">{revised}</span>
        </p>
      </div>

      <h1 className="form-sheet-header__title">{title}</h1>
    </header>
  );
}
