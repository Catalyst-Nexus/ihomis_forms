import { useState, useMemo } from 'react';
import './Forms.css';
import Modal from './Modal';
import DNRForm from './DNRForm';
import Forms2 from './Forms2';
import ApgarScoring from './ApgarScoring';
import BTLConsent from './BTLConsent';
import CardioPulmonaryClearance from './CardioPulmonaryClearance';
import BloodCancellation from './BloodCancellation';
import BloodRequestAdult from './BloodRequestAdult';
import BloodRequestPediatric from './BloodRequestPediatric';
import BloodTransfusionReactionRegistry from './BloodTransfusionReactionRegistry';
import Abtcform from './Abtcform';
import BloodTransfusionSheet from './BloodTransfusionSheet';

const ThemeToggle = ({ isDarkMode, onToggle }) => (
  <button
    className="theme-toggle"
    onClick={onToggle}
    aria-label="Toggle dark mode"
    title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
  >
    {isDarkMode ? '☀️' : '🌙'}
  </button>
);

const FORMS_LIST = [
  'Advance Directive Do Not Resuscitate (DNR) / Don not Intubate Form',
  'Aldrete Score (Post Anesthesia Recovery Score) Form',
  'Anesthesia Record',
  'APGAR Score Form',
  'Ballard Score',
  'Blood Cancellation Form',
  'Blood Request Form (Adult)',
  'Blood Request Form (Pedia)',
  'Blood Transfusion Reaction Registry',
  'Blood Transfusion Sheet',
  'BTL Consent Form',
  'Cardio-Pulmonary Clearance Form',
  'Certificate of No Vacancy',
  'Certificate of Patient Ward Preference',
  'Certificate of Ward Preference',
  'Certification of Isolation Recommendation',
  'Chest Tube Thoracostomy Sheet',
  'Child Immunization Record',
  'Claim of Cadaver',
  'Clinical Referral Slip',
  'Commitment to Breastfeeding',
  'Consent to Care',
  'Consent to Surgery and Anesthesia Form',
  'Daily Weight and Abdominal Girth',
  'Discharge Against Medical Advice (DAMA) / Out on Pass Form',
  'Discharge Plan/Referral Slip',
  'Doctor\'s Order (for pedia)',
  'Doctor\'s Order Form',
  'ECG TRACING',
  'Family Planning',
  'Histopathology/Cytology Request Form',
  'Intake and Output Sheet',
  'IVF Sheet',
  'Kardex Sheet',
  'Laboratory Request Form (outside)',
  'Laboratory Results',
  'Lubchenco',
  'Medical Abstract / Discharge Summary Form',
  'Medication Sheet',
  'MIS Safety Checklist',
  'Monitoring Sheet',
  'Neuro Vital Signs Stats Glasgow Coma Scale Less Than 2 years old',
  'Neuro Vital Signs Stats Glasgow Coma Scale More Than 2 years old',
  'Neurologic Examination Form',
  'Newborn Personal Information Sheet',
  'Newborn Physical Examination Sheet',
  'Newborn Tag',
  'Nurse\'s Notes Form',
  'Other Laboratory Request',
  'Otoacoustic Emission Results',
  'Oxygen Consumption Sheet',
  'Pagtugot (Waiver)',
  'Partograph',
  'Phototherapy Form',
  'Post Anesthesia Care Unit Nurse\'s Notes Form',
  'Pre-Operative Checklist',
  'Radiology Request Form (Outside)',
  'Random Blood Sugar',
  'Refusal to Treatment and Procedure Form',
  'Request for Blood Compatibility Testing Form',
  'Special Endorsements (Transient)',
  'Sponge Count Sheet',
  'Surgical Memorandum',
  'Surgical Memorandum Umbi Cat',
  'Surgical Safety Checklist',
  'TPR Sheet',
];

export default function Forms({ isDarkMode, setIsDarkMode }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForms, setSelectedForms] = useState(new Set());
  const [openForm, setOpenForm] = useState(null);
  const patientName = 'DOE, JHON';

  const filteredForms = useMemo(() => {
    if (!searchTerm) return FORMS_LIST;
    return FORMS_LIST.filter(form =>
      form.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleSelectForm = (formName) => {
    const newSelected = new Set(selectedForms);
    if (newSelected.has(formName)) {
      newSelected.delete(formName);
    } else {
      newSelected.add(formName);
    }
    setSelectedForms(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedForms.size === filteredForms.length) {
      setSelectedForms(new Set());
    } else {
      setSelectedForms(new Set(filteredForms));
    }
  };

  const renderForm = (formName) => {
    if (formName === 'Advance Directive Do Not Resuscitate (DNR) / Don not Intubate Form') {
      return <DNRForm patientName={patientName} />;
    }
    if (formName === 'Aldrete Score (Post Anesthesia Recovery Score) Form') {
      return <Forms2 />;
    }
    if (formName === 'APGAR Score Form') {
      return <ApgarScoring />;
    }
    if (formName === 'BTL Consent Form') {
      return <BTLConsent />;
    }
    if (formName === 'Cardio-Pulmonary Clearance Form') {
      return <CardioPulmonaryClearance />;
    }
    if (formName === 'Blood Cancellation Form') {
      return <BloodCancellation />;
    }
    if (formName === 'Blood Request Form (Adult)') {
      return <BloodRequestAdult />;
    }
    if (formName === 'Blood Request Form (Pedia)') {
      return <BloodRequestPediatric />;
    }
    if (formName === 'Blood Transfusion Reaction Registry') {
      return <BloodTransfusionReactionRegistry />;
    }
    if (formName === 'ABTC Form') {
      return <Abtcform />;
    }
    if (formName === 'Blood Transfusion Sheet') {
      return <BloodTransfusionSheet />;
    }
    // Add more forms here
    return <div>Form template to be defined</div>;
  };

  return (
    <div className="forms-container">
      <div className="forms-header">
        <div className="header-top">
          <div className="patient-info">
            <h1>Generate Forms</h1>
            <p className="patient-name">Patient: DOE, JHON</p>
          </div>
          <ThemeToggle isDarkMode={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
        </div>
      </div>

      <div className="forms-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="form-stats">
          <span>Showing {filteredForms.length} of {FORMS_LIST.length} items</span>
          <span className="selected-count">
            {selectedForms.size} selected
          </span>
        </div>
      </div>

      <div className="forms-actions">
        <button
          className="btn btn-secondary"
          onClick={handleSelectAll}
        >
          {selectedForms.size === filteredForms.length && filteredForms.length > 0
            ? 'Deselect All'
            : 'Select All'}
        </button>
        {selectedForms.size > 0 && (
          <button
            className="btn btn-primary"
            onClick={() => setOpenForm(Array.from(selectedForms)[0])}
          >
            Generate Selected Forms ({selectedForms.size})
          </button>
        )}
      </div>

      <div className="forms-table-wrapper">
        <table className="forms-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input
                  type="checkbox"
                  checked={selectedForms.size === filteredForms.length && filteredForms.length > 0}
                  onChange={handleSelectAll}
                  aria-label="Select all forms"
                />
              </th>
              <th className="form-col">Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredForms.map((form, index) => (
              <tr key={index} className="form-row" onClick={() => setOpenForm(form)}>
                <td className="checkbox-col" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedForms.has(form)}
                    onChange={() => handleSelectForm(form)}
                    aria-label={`Select ${form}`}
                  />
                </td>
                <td className="form-col">{form}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredForms.length === 0 && (
          <div className="no-results">
            <p>No forms found matching "{searchTerm}"</p>
          </div>
        )}
      </div>

      <Modal isOpen={!!openForm} onClose={() => setOpenForm(null)} title={openForm}>
        {openForm && renderForm(openForm)}
      </Modal>
    </div>
  );
}
