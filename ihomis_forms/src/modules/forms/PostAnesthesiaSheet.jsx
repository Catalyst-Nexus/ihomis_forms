import chartPlaceholderSrc from './img/post anesthesia sheet.png';
import styles from './PostAnesthesiaSheet.module.css';

const PostAnesthesiaSheet = ({ patientName, patientData }) => {
  const name = patientName || "";
  const caseNo = patientData?.caseNo || "";
  const hospitalNo = patientData?.hospitalNo || "";

  return (
    <div className={styles.wrap}>
      <div className={styles.page}>
        <div className={styles.main}>
          
          {/* Preserved spacer for hospital letterhead */}
          <div className={styles.headerSpacer} aria-hidden="true" />

          {/* META SECTION - Standardized flex layout */}
          <div className={styles.metaSection}>
            <div className={styles.metaRowSpaceBetween}>
              <span className={styles.metaCell}>
                <span className={styles.label}>Hospital No.:</span>
                <span>{hospitalNo}</span>
              </span>
              <span className={styles.metaCell}>
                <span className={styles.label}>Case Number:</span>
                <span>{caseNo}</span>
              </span>
              <span className={styles.metaCell}>
                {/* Right alignment placeholder */}
              </span>
            </div>

            <div className={styles.metaRowSpaceBetween}>
              <span className={styles.metaCell} style={{ flex: 1 }}>
                <span className={styles.label}>NAME:</span>
                <span>{name}</span>
              </span>
              <span className={styles.metaCell} style={{ width: '40mm' }}>
                <span className={styles.label}>DATE:</span>
                <span className={styles.lineFill} />
              </span>
              <span className={styles.metaCell} style={{ width: '30mm' }}>
                <span>[ ] CHARITY</span>
              </span>
            </div>

            <div className={styles.metaRowSpaceBetween}>
              <span className={styles.metaCell} style={{ flex: 1 }}>
                <span className={styles.label}>PROCEDURE:</span>
                <span className={styles.lineFill} />
              </span>
              <span className={styles.metaCell} style={{ width: '40mm' }}>
                <span className={styles.label}>TIME:</span>
                <span className={styles.lineFill} />
              </span>
              <span className={styles.metaCell} style={{ width: '30mm' }}>
                <span>[ ] PHIC</span>
              </span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaCell} style={{ flex: 1 }}>
                <span className={styles.label}>SURGEON/S:</span>
                <span className={styles.lineFill} />
              </span>
              <span className={styles.metaCell} style={{ flex: 1 }}>
                <span className={styles.label}>Blood Transfusion Site:</span>
                <span className={styles.lineFill} />
              </span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaCell} style={{ width: '40%' }}>
                <span className={styles.label}>ANESTHESIOLOGIST/S:</span>
                <span className={styles.lineFill} />
              </span>
              <span className={styles.metaCell} style={{ flex: 1 }}>
                <span className={styles.label}>Component:</span>
                <span className={styles.lineFill} />
              </span>
              <span className={styles.metaCell} style={{ width: '30mm' }}>
                <span className={styles.label}>Blood Type:</span>
                <span className={styles.lineFill} />
              </span>
              <span className={styles.metaCell} style={{ width: '35mm' }}>
                <span className={styles.label}>Serial #:</span>
                <span className={styles.lineFill} />
              </span>
            </div>
          </div>

          {/* CHART SECTION - Fills available vertical space */}
          <section className={styles.chartSection} aria-label="Anesthesia chart">
            <img
              src={chartPlaceholderSrc}
              alt="Post-Anesthesia Sheet Chart"
              className={styles.chartImage}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default PostAnesthesiaSheet;