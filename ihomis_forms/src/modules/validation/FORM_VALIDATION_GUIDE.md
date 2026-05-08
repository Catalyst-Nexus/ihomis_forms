# Form Validation Integration Guide

## Quick Start for Frontend Developers

### Using the New Validation System

The validation system is now fully integrated in the `ValidationPage` component. No additional setup required - it automatically uses the backend API endpoints.

### Hook: `useFormValidation`

**Location:** `src/modules/validation/hooks/useFormValidation.js`

**Usage:**
```jsx
import { useFormValidation } from './hooks/useFormValidation.js';

function MyComponent({ selectedPatient }) {
  const { enccode, summary, loading, error, refresh } = useFormValidation({
    selectedPatient,
  });

  return (
    <div>
      <p>Status: {summary.admissionComplete ? '✓' : '✗'} Admission</p>
      <p>Status: {summary.dischargeComplete ? '✓' : '✗'} Discharge</p>
      <p>Missing: {summary.allMissing.length} fields</p>
    </div>
  );
}
```

**Return Values:**
```javascript
{
  enccode,                      // string - encounter code
  validationData: {
    admission,                  // object with isComplete, missingFields, details
    discharge,                  // object with isComplete, missingFields, details
    details                     // comprehensive validation data
  },
  loading,                      // boolean
  error,                        // string or null
  summary: {
    enccode,
    admissionComplete,          // boolean
    dischargeComplete,          // boolean
    admissionMissing,           // array of field names
    dischargeMissing,           // array of field names
    allMissing,                 // combined array
    hasIssues                   // boolean
  },
  refresh                       // function to re-fetch validation
}
```

### Component: `ValidationModal`

**Location:** `src/modules/validation/components/ValidationModal.jsx`

**Usage:**
```jsx
import { ValidationModal } from './components/ValidationModal.jsx';

function MyForm() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Check Validation</button>
      
      <ValidationModal
        isOpen={isOpen}
        enccode="ENC001"
        admissionMissing={['vitalSigns', 'physicalExam']}
        dischargeMissing={['finalDiagnosis']}
        admissionComplete={false}
        dischargeComplete={false}
        onClose={() => setIsOpen(false)}
        onProceed={() => {
          console.log('User confirmed proceeding');
          setIsOpen(false);
        }}
      />
    </>
  );
}
```

## Environment Configuration

The validation API URL is configured in `.env`:

```
VITE_VALIDATION_API_URL=http://j808ko0s880s08gscws0sg08.180.232.187.222.sslip.io/api/validation
```

The hook automatically uses this URL. For local development, update to:

```
VITE_VALIDATION_API_URL=http://localhost:3000/api/validation
```

## Field Name Mapping

Common field names and their display labels:

| Field Name | Display Label |
|---|---|
| `vitalSigns` | Vital Signs |
| `bmi` | BMI |
| `historyGDPPR` | General Data |
| `historyCOMPL` | Chief Complaint |
| `historyPRHIS` | Present Illness History |
| `historyPAHIS` | Past Medical History |
| `historyOCENV` | Occupation/Environment |
| `historyFAHIS` | Family History |
| `historyDRTHE` | Drug Therapy |
| `historyALCOH` | Alcohol History |
| `historyTOBAC` | Tobacco History |
| `historyDRUGA` | Drug Allergies |
| `historyOTHAL` | Other Allergies |
| `historyOB` | OB History |
| `prenatal` | Prenatal Data |
| `pertinentSignSymptoms` | Signs & Symptoms |
| `physicalExam` | Physical Examination |
| `systemReview` | System Review |
| `courseWard` | Course in Ward |
| `dischargeOrder` | Discharge Order |
| `finalDiagnosis` | Final Diagnosis |
| `icdCode` | ICD Code |

## Backend API Reference

See [VALIDATION_API.md](../../../backend_ihomis_forms/VALIDATION_API.md) in backend project for full API documentation.

### Key Endpoints

```
GET /api/validation/admission/:enccode
GET /api/validation/discharge/:enccode
GET /api/validation/details/:enccode
GET /api/validation/history/:enccode/:histype
GET /api/validation/phic/:enccode
```

## Troubleshooting

**Issue:** Modal not showing
- Check if `isOpen` prop is `true`
- Verify `onClose` and `onProceed` callbacks are provided

**Issue:** Validation not updating
- Call `refresh()` function from hook
- Check network tab for API errors
- Verify `VITE_VALIDATION_API_URL` in .env

**Issue:** Missing fields not displaying
- Ensure backend API is returning correct field names
- Check console for API response

## Integration Points

The validation system integrates with:
1. **Patient Selection** - Uses selectedPatient to get enccode
2. **Form Submission** - Modal blocks submission if incomplete
3. **Form Navigation** - Display validation status on all forms

## Testing

Test the validation with:
```javascript
// Manual API test
fetch('http://localhost:3000/api/validation/admission/ENC001')
  .then(r => r.json())
  .then(console.log)
```

Expected response:
```json
{
  "ok": true,
  "enccode": "ENC001",
  "isComplete": false,
  "details": { ... },
  "missingFields": ["vitalSigns", "physicalExam"]
}
```
