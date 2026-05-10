import { useEffect, useState } from 'react';
import styles from './AnesthesiaRecord.module.css';
import chartPlaceholderSrc from './img/anesthesia record.png';

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
    <div className={styles.container}>
      <div className={styles.page}>
        <div className={styles.headerReservedSpace} aria-hidden="true" />

        <section className={styles.header} aria-label="Form title and patient details">
          
          <div className={styles.caseNumber}>
            <span className={styles.label}>Case Number:</span>
            <input
              type="text"
              value={formData.caseNumber}
              onChange={(e) => handleChange('caseNumber', e.target.value)}
              className={styles.inputInline}
            />
          </div>

          <div className={styles.table}>
            <div className={`${styles.tableRow} ${styles.row1}`}>
              <div className={styles.tableCell}>
                <span className={styles.label}>Name of Patient:</span>
              </div>
              <div className={styles.tableCell}>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => handleChange('patientName', e.target.value)}
                  className={styles.inputFull}
                />
              </div>
              <div className={styles.tableCell}>
                <span className={styles.label}>Hospital No.:</span>
              </div>
              <div className={styles.tableCell}>
                <input
                  type="text"
                  value={formData.hospitalNo}
                  onChange={(e) => handleChange('hospitalNo', e.target.value)}
                  className={styles.inputFull}
                />
              </div>
            </div>

            <div className={`${styles.tableRow} ${styles.row2}`}>
              <div className={styles.tableCell}>
                <span className={styles.label}>Sex:&nbsp;</span>
                <input
                  type="text"
                  value={formData.sex}
                  onChange={(e) => handleChange('sex', e.target.value)}
                  className={styles.inputSm}
                />
              </div>
              <div className={styles.tableCell}>
                <span className={styles.label}>Age:&nbsp;</span>
                <input
                  type="text"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  className={styles.inputSm}
                  style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                />
              </div>
              <div className={styles.tableCell}>
                <span className={styles.label}>HT:&nbsp;</span>
                <input
                  type="text"
                  value={formData.ht}
                  onChange={(e) => handleChange('ht', e.target.value)}
                  className={styles.inputSm}
                  placeholder="____"
                />
              </div>
              <div className={styles.tableCell}>
                <span className={styles.label}>WT.:&nbsp;</span>
                <input
                  type="text"
                  value={formData.wt}
                  onChange={(e) => handleChange('wt', e.target.value)}
                  className={styles.inputSm}
                  placeholder="____"
                />
              </div>
              <div className={styles.tableCell}>
                <span className={styles.label}>T:&nbsp;</span>
                <input
                  type="text"
                  value={formData.t}
                  onChange={(e) => handleChange('t', e.target.value)}
                  className={styles.inputSm}
                  placeholder="____"
                />
              </div>
              <div className={styles.tableCell}>
                <span className={styles.label}>RR:&nbsp;</span>
                <input
                  type="text"
                  value={formData.rr}
                  onChange={(e) => handleChange('rr', e.target.value)}
                  className={styles.inputSm}
                  placeholder="____"
                />
              </div>
              <div className={styles.tableCell}>
                <span className={styles.label}>PR:&nbsp;</span>
                <input
                  type="text"
                  value={formData.pr}
                  onChange={(e) => handleChange('pr', e.target.value)}
                  className={styles.inputSm}
                  placeholder="____"
                />
              </div>
              <div className={styles.tableCell}>
                <span className={styles.label}>BP:&nbsp;</span>
                <input
                  type="text"
                  value={formData.bp}
                  onChange={(e) => handleChange('bp', e.target.value)}
                  className={styles.inputSm}
                  placeholder="____"
                />
              </div>
              <div className={styles.tableCell}>
                <span className={styles.label}>Date:&nbsp;</span>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className={styles.inputMd}
                />
              </div>
            </div>

            <div className={`${styles.tableRow} ${styles.row3}`}>
              <div className={`${styles.tableCell} ${styles.cellFull}`}>
                <span className={styles.label}>Pre-Op Dx:</span>
                <input
                  type="text"
                  value={formData.preOpDx}
                  onChange={(e) => handleChange('preOpDx', e.target.value)}
                  className={styles.inputFull}
                />
              </div>
              <div className={styles.tableCell}>
                <span className={styles.label}>ASA:</span>
                <input
                  type="text"
                  value={formData.asa}
                  onChange={(e) => handleChange('asa', e.target.value)}
                  className={styles.inputFull}
                  placeholder="____"
                />
              </div>
            </div>

            <div className={`${styles.tableRow} ${styles.row4}`}>
              <div className={`${styles.tableCell} ${styles.cellFull}`}>
                <span className={styles.label}>Operation Proposed:</span>
                <input
                  type="text"
                  value={formData.operationProposed}
                  onChange={(e) => handleChange('operationProposed', e.target.value)}
                  className={styles.inputFull}
                />
              </div>
              <div className={styles.tableCell}>
                <span className={styles.label}>Pre-Needs:</span>
                <input
                  type="text"
                  value={formData.preNeeds}
                  onChange={(e) => handleChange('preNeeds', e.target.value)}
                  className={styles.inputFull}
                  placeholder="____"
                />
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Anesthesia record chart image" className={styles.chartSection}>
          <img
            src={chartPlaceholderSrc}
            alt="Anesthesia record chart placeholder"
            className={styles.chartImage}
          />
        </section>

        <div className={styles.footer}> Generated by: TCP T. TCP on {generatedOn}</div>
      </div>
    </div>
  );
};

export default AnesthesiaRecord;
