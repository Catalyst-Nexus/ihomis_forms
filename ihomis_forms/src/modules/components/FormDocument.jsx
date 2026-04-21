import FormSheetHeader from './FormSheetHeader.jsx';
import './FormDocument.css';

export default function FormDocument({ headerConfig = {}, children }) {
  return (
    <section className="form-document">
      <FormSheetHeader {...headerConfig} />
      <div className="form-document__body">
        {children}
      </div>
    </section>
  );
}
