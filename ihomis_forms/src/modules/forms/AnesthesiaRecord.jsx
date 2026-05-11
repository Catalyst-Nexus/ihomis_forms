import { useEffect, useState } from 'react';
import styles from './AnesthesiaRecord.module.css';

import chartPlaceholderSrc from './img/anesthesia record.png';

const formatDateOnly = (date = new Date()) =>
  date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className={styles.page}>
      
      {/* ── Header (Standardized to Blood Request style) ── */}
      <div className={styles.metaSection}>
        
        {/* ROW 1 */}
        <div className={styles.metaRow}>
          <span className={styles.metaCell} style={{ flex: 1 }}>
            <span className={styles.label}>Case Number:</span>
            <input
              type="text"
              value={formData.caseNumber}
              onChange={(e) => handleChange('caseNumber', e.target.value)}
              className={styles.inputFill}
            />
          </span>
          <span className={styles.metaCell} style={{ flex: 1 }}>
            <span className={styles.label}>Date:</span>
            <input
              type="text"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className={styles.inputFill}
            />
          </span>
        </div>

        {/* ROW 2 */}
        <div className={styles.metaRow}>
          <span className={styles.metaCell} style={{ flex: 2 }}>
            <span className={styles.label}>Name of Patient:</span>
            <input
              type="text"
              value={formData.patientName}
              onChange={(e) => handleChange('patientName', e.target.value)}
              className={styles.inputFill}
            />
          </span>
          <span className={styles.metaCell} style={{ flex: 1 }}>
            <span className={styles.label}>Hospital No.:</span>
            <input
              type="text"
              value={formData.hospitalNo}
              onChange={(e) => handleChange('hospitalNo', e.target.value)}
              className={styles.inputFill}
            />
          </span>
        </div>

        {/* ROW 3: Vitals */}
        <div className={styles.metaRow}>
          <span className={styles.metaCell}>
            <span className={styles.label}>Sex:</span>
            <input type="text" value={formData.sex} onChange={(e) => handleChange('sex', e.target.value)} className={styles.inputXs} />
          </span>
          <span className={styles.metaCell}>
            <span className={styles.label}>Age:</span>
            <input type="text" value={formData.age} onChange={(e) => handleChange('age', e.target.value)} className={styles.inputXs} />
          </span>
          <span className={styles.metaCell}>
            <span className={styles.label}>HT:</span>
            <input type="text" value={formData.ht} onChange={(e) => handleChange('ht', e.target.value)} className={styles.inputXs} />
          </span>
          <span className={styles.metaCell}>
            <span className={styles.label}>WT:</span>
            <input type="text" value={formData.wt} onChange={(e) => handleChange('wt', e.target.value)} className={styles.inputXs} />
          </span>
          <span className={styles.metaCell}>
            <span className={styles.label}>T:</span>
            <input type="text" value={formData.t} onChange={(e) => handleChange('t', e.target.value)} className={styles.inputXs} />
          </span>
          <span className={styles.metaCell}>
            <span className={styles.label}>RR:</span>
            <input type="text" value={formData.rr} onChange={(e) => handleChange('rr', e.target.value)} className={styles.inputXs} />
          </span>
          <span className={styles.metaCell}>
            <span className={styles.label}>PR:</span>
            <input type="text" value={formData.pr} onChange={(e) => handleChange('pr', e.target.value)} className={styles.inputXs} />
          </span>
          <span className={styles.metaCell} style={{ flex: 1 }}>
            <span className={styles.label}>BP:</span>
            <input type="text" value={formData.bp} onChange={(e) => handleChange('bp', e.target.value)} className={styles.inputFill} />
          </span>
        </div>

        {/* ROW 4 */}
        <div className={styles.metaRow}>
          <span className={styles.metaCell} style={{ flex: 3 }}>
            <span className={styles.label}>Pre-Op Dx:</span>
            <input
              type="text"
              value={formData.preOpDx}
              onChange={(e) => handleChange('preOpDx', e.target.value)}
              className={styles.inputFill}
            />
          </span>
          <span className={styles.metaCell} style={{ flex: 1 }}>
            <span className={styles.label}>ASA:</span>
            <input
              type="text"
              value={formData.asa}
              onChange={(e) => handleChange('asa', e.target.value)}
              className={styles.inputFill}
            />
          </span>
        </div>

        {/* ROW 5 */}
        <div className={styles.metaRow}>
          <span className={styles.metaCell} style={{ flex: 3 }}>
            <span className={styles.label}>Operation Proposed:</span>
            <input
              type="text"
              value={formData.operationProposed}
              onChange={(e) => handleChange('operationProposed', e.target.value)}
              className={styles.inputFill}
            />
          </span>
          <span className={styles.metaCell} style={{ flex: 1 }}>
            <span className={styles.label}>Pre-Needs:</span>
            <input
              type="text"
              value={formData.preNeeds}
              onChange={(e) => handleChange('preNeeds', e.target.value)}
              className={styles.inputFill}
            />
          </span>
        </div>

      </div>

      {/* ── Chart ── */}
      <section aria-label="Anesthesia record chart image" className={styles.chartSection}>
        <img
          src={chartPlaceholderSrc}
          alt="Anesthesia record chart placeholder"
          className={styles.chartImage}
        />
      </section>

    </div>
  );
};

export default AnesthesiaRecord;