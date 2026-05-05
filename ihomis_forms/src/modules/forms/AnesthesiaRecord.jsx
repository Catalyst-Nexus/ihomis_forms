import { useEffect, useState } from 'react';
import './AnesthesiaRecord.css';

import chartPlaceholderSrc from './img/anesthesia record.png';

const chartSectionStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '2mm',
};

const chartImageStyle = {
  width: '100%',
  maxWidth: '187mm',
  height: 'auto',
  maxHeight: '180mm',
  display: 'block',
  objectFit: 'fill',
};

const formatDateOnly = (date = new Date()) =>
  date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const formatGeneratedOn = (date = new Date()) => {
  const pad = (value) => String(value).padStart(2, '0');
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  const hour12 = String(hours % 12 || 12).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${hour12}:${pad(minutes)} ${ampm}`;
};

const buildInitialFormData = (patientName, patientData = {}) => ({
  caseNumber: patientData.caseNum || patientData.caseNo || '',
  patientName: patientName || patientData.patientName || patientData.fullName || '',
  hospitalNo: patientData.hospitalNo || patientData.hospNo || patientData.hospitalNumber || '',
  sex: patientData.sex || '',
  age: patientData.age || '',
  ht: patientData.ht || patientData.height || '',
  wt: patientData.wt || patientData.weight || '',
  t: patientData.t || patientData.temp || patientData.temperature || '',
  rr: patientData.rr || '',
  pr: patientData.pr || '',
  bp: patientData.bp || '',
  date:
    patientData.date ||
    patientData.admissionDate ||
    patientData.visitDate ||
    formatDateOnly(),
  preOpDx: patientData.preOpDx || '',
  asa: patientData.asa || '',
  operationProposed: patientData.operationProposed || '',
  preNeeds: patientData.preNeeds || '',
});

const AnesthesiaRecord = ({ patientName, patientData = {} }) => {
  const [formData, setFormData] = useState(() =>
    buildInitialFormData(patientName, patientData),
  );

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...buildInitialFormData(patientName, patientData),
    }));
  }, [patientName, patientData]);

  const generatedOn = patientData.generatedOn || formatGeneratedOn();

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="anesthesia-record-container">
      <div className="anesthesia-record">
        <div className="header-reserved-space" aria-hidden="true" />

        <section className="form-intro anesthesia-header" aria-label="Form title and patient details">
          
          <div className="anesthesia-case-number">
            <span className="anesthesia-label">Case Number:</span>
            <input
              type="text"
              value={formData.caseNumber}
              onChange={(e) => handleChange('caseNumber', e.target.value)}
              className="anesthesia-input-inline"
            />
          </div>

    <div className="anesthesia-table">
      <div className="anesthesia-table-row anesthesia-row-1">
              <div className="anesthesia-table-cell">
                <span className="anesthesia-label">Name of Patient:</span>
              </div>
              <div className="anesthesia-table-cell">
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => handleChange('patientName', e.target.value)}
                  className="anesthesia-input-full"
                />
              </div>
              <div className="anesthesia-table-cell">
                <span className="anesthesia-label">Hospital No.:</span>
              </div>
              <div className="anesthesia-table-cell">
                <input
                  type="text"
                  value={formData.hospitalNo}
                  onChange={(e) => handleChange('hospitalNo', e.target.value)}
                  className="anesthesia-input-full"
                />
              </div>
            </div>

            <div className="anesthesia-table-row anesthesia-row-2">
              <div className="anesthesia-table-cell">
                <span className="anesthesia-label">Sex:&nbsp;</span>
                <input
                  type="text"
                  value={formData.sex}
                  onChange={(e) => handleChange('sex', e.target.value)}
                  className="anesthesia-input-sm"
                />
              </div>
              <div className="anesthesia-table-cell">
                <span className="anesthesia-label">Age:&nbsp;</span>
                <input
                  type="text"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  className="anesthesia-input-sm"
                  style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                />
              </div>
              <div className="anesthesia-table-cell">
                <span className="anesthesia-label">HT:&nbsp;</span>
                <input
                  type="text"
                  value={formData.ht}
                  onChange={(e) => handleChange('ht', e.target.value)}
                  className="anesthesia-input-sm"
                  placeholder="____"
                />
              </div>
              <div className="anesthesia-table-cell">
                <span className="anesthesia-label">WT.:&nbsp;</span>
                <input
                  type="text"
                  value={formData.wt}
                  onChange={(e) => handleChange('wt', e.target.value)}
                  className="anesthesia-input-sm"
                  placeholder="____"
                />
              </div>
              <div className="anesthesia-table-cell">
                <span className="anesthesia-label">T:&nbsp;</span>
                <input
                  type="text"
                  value={formData.t}
                  onChange={(e) => handleChange('t', e.target.value)}
                  className="anesthesia-input-sm"
                  placeholder="____"
                />
              </div>
              <div className="anesthesia-table-cell">
                <span className="anesthesia-label">RR:&nbsp;</span>
                <input
                  type="text"
                  value={formData.rr}
                  onChange={(e) => handleChange('rr', e.target.value)}
                  className="anesthesia-input-sm"
                  placeholder="____"
                />
              </div>
              <div className="anesthesia-table-cell">
                <span className="anesthesia-label">PR:&nbsp;</span>
                <input
                  type="text"
                  value={formData.pr}
                  onChange={(e) => handleChange('pr', e.target.value)}
                  className="anesthesia-input-sm"
                  placeholder="____"
                />
              </div>
              <div className="anesthesia-table-cell">
                <span className="anesthesia-label">BP:&nbsp;</span>
                <input
                  type="text"
                  value={formData.bp}
                  onChange={(e) => handleChange('bp', e.target.value)}
                  className="anesthesia-input-sm"
                  placeholder="____"
                />
              </div>
              <div className="anesthesia-table-cell">
                <span className="anesthesia-label">Date:&nbsp;</span>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="anesthesia-input-md"
                />
              </div>
            </div>

            <div className="anesthesia-table-row anesthesia-row-3">
              <div className="anesthesia-table-cell anesthesia-cell-full">
                <span className="anesthesia-label">Pre-Op Dx:</span>
                <input
                  type="text"
                  value={formData.preOpDx}
                  onChange={(e) => handleChange('preOpDx', e.target.value)}
                  className="anesthesia-input-full"
                />
              </div>
              <div className="anesthesia-table-cell">
                <span className="anesthesia-label">ASA:</span>
                <input
                  type="text"
                  value={formData.asa}
                  onChange={(e) => handleChange('asa', e.target.value)}
                  className="anesthesia-input-full"
                  placeholder="____"
                />
              </div>
            </div>

            <div className="anesthesia-table-row anesthesia-row-4">
              <div className="anesthesia-table-cell anesthesia-cell-full">
                <span className="anesthesia-label">Operation Proposed:</span>
                <input
                  type="text"
                  value={formData.operationProposed}
                  onChange={(e) => handleChange('operationProposed', e.target.value)}
                  className="anesthesia-input-full"
                />
              </div>
              <div className="anesthesia-table-cell">
                <span className="anesthesia-label">Pre-Needs:</span>
                <input
                  type="text"
                  value={formData.preNeeds}
                  onChange={(e) => handleChange('preNeeds', e.target.value)}
                  className="anesthesia-input-full"
                  placeholder="____"
                />
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Anesthesia record chart image" style={chartSectionStyle}>
          <img
            src={chartPlaceholderSrc}
            alt="Anesthesia record chart placeholder"
            style={chartImageStyle}
          />
        </section>

        <div className="form-footer"> Generated by: TCP T. TCP on {generatedOn}</div>
      </div>
    </div>
  );
};

export default AnesthesiaRecord;