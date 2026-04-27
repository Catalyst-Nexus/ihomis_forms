import FormSheetHeader from './FormSheetHeader.jsx';
import './FormDocument.css';

export default function FormDocument({ headerConfig = {}, children }) {
  const { title = '', formNo = '', revised = '' } = headerConfig;

  return (
    <section className="form-document">
      <FormSheetHeader {...headerConfig} />
      <div className="form-document__title-block">
        <div className="form-document__meta-row">
          <span className="form-document__meta-item">
            <span className="form-document__meta-label">FORM NO.:</span>
            <span className="form-document__meta-value">{formNo}</span>
          </span>
          <span className="form-document__meta-item">
            <span className="form-document__meta-label">Revised:</span>
            <span className="form-document__meta-value">{revised}</span>
          </span>
        </div>
        {title ? <h1 className="form-document__title">{title}</h1> : null}
      </div>
      <div className="form-document__body">
        {children}
      </div>
    </section>
  );
}
