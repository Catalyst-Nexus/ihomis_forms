import { useState } from 'react';
import './AnesthesiaRecord.css';

import chartPlaceholderSrc from './img/anesthesia record.png';

const chartSectionStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '2mm',
};

const chartImageStyle = {
  width: '187mm',
  height: '180mm',
  display: 'block',
  objectFit: 'fill',
};

const AnesthesiaRecord = () => {
  const [formData, setFormData] = useState({
    caseNumber: 'ADM-2026-010651',
    patientName: 'FELISELDA , CIAN REIN BAYSA',
    hospitalNo: '000000000021041',
    sex: 'M',
    age: '1 hour(s)',
    ht: '',
    wt: '',
    t: '',
    rr: '',
    pr: '',
    bp: '',
    date: 'April 22, 2026',
    preOpDx: '',
    asa: '',
    operationProposed: '',
    preNeeds: '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="neuro-vital-signs-container">
      <div className="neuro-vital-signs">
        <div className="header-reserved-space" aria-hidden="true" />

        <section className="form-intro anesthesia-header" aria-label="Form title and patient details">
          <div className="anesthesia-title">ANESTHESIA RECORD</div>

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
          <div className="anesthesia-table-row" style={{ gridTemplateColumns: '28mm 1fr 28mm 1fr' }}>
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

        <div className="form-footer"> Generated by: TCP T. TCP on April 22, 2026</div>
      </div>
    </div>
  );
};

export default AnesthesiaRecord;