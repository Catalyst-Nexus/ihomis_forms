import { useMemo, useState } from 'react'
import './App.css'

const LAB_UPLOAD_API_URL = (
  import.meta.env.VITE_LAB_UPLOAD_API_URL || import.meta.env.VITE_API_URL || ''
).trim()
const LAB_UPLOAD_API_TOKEN = (import.meta.env.VITE_LAB_UPLOAD_API_TOKEN || '').trim()

const initialFormState = {
  fhud: '',
  enc: '',
  user: '',
  docintkey: '',
  laboratoryType: '',
  remarks: '',
}

function formatFileSize(bytes) {
  if (!bytes) {
    return '0 KB'
  }

  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function App() {
  const [formState, setFormState] = useState(initialFormState)
  const [resultFile, setResultFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  const hasRequiredMeta =
    formState.fhud && formState.enc && formState.user && formState.docintkey

  const payloadPreview = useMemo(
    () => [
      { label: 'FHUD', value: formState.fhud || 'Pending' },
      { label: 'ENC', value: formState.enc || 'Pending' },
      { label: 'User', value: formState.user || 'Pending' },
      { label: 'DocIntKey', value: formState.docintkey || 'Pending' },
      {
        label: 'Laboratory Type',
        value: formState.laboratoryType || 'General laboratory result',
      },
      {
        label: 'Attachment',
        value: resultFile
          ? `${resultFile.name} (${formatFileSize(resultFile.size)})`
          : 'No file selected',
      },
    ],
    [formState, resultFile],
  )

  const canSubmit = Boolean(LAB_UPLOAD_API_URL && resultFile && hasRequiredMeta)

  function handleInputChange(event) {
    const { name, value } = event.target
    setFormState((currentState) => ({
      ...currentState,
      [name]: value,
    }))
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0] || null
    setResultFile(selectedFile)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const formElement = event.currentTarget

    if (!LAB_UPLOAD_API_URL) {
      setStatus({
        type: 'error',
        message:
          'Missing API URL. Set VITE_LAB_UPLOAD_API_URL in your .env file.',
      })
      return
    }

    if (!resultFile) {
      setStatus({
        type: 'error',
        message: 'Please attach a laboratory result file before uploading.',
      })
      return
    }

    setSubmitting(true)
    setStatus({ type: '', message: '' })

    const payload = new FormData()
    payload.append('fhud', formState.fhud)
    payload.append('enc', formState.enc)
    payload.append('user', formState.user)
    payload.append('docintkey', formState.docintkey)
    payload.append('laboratoryType', formState.laboratoryType)
    payload.append('remarks', formState.remarks)
    payload.append('resultFile', resultFile)

    const headers = {}
    if (LAB_UPLOAD_API_TOKEN) {
      headers.Authorization = `Bearer ${LAB_UPLOAD_API_TOKEN}`
    }

    try {
      const response = await fetch(LAB_UPLOAD_API_URL, {
        method: 'POST',
        headers,
        body: payload,
      })

      const responseText = await response.text()
      let responseBody = null

      if (responseText) {
        try {
          responseBody = JSON.parse(responseText)
        } catch {
          responseBody = responseText
        }
      }

      if (!response.ok) {
        const responseMessage =
          typeof responseBody === 'string'
            ? responseBody
            : responseBody?.message || responseBody?.error

        throw new Error(
          responseMessage || `Upload failed with status ${response.status}.`,
        )
      }

      setStatus({
        type: 'success',
        message: 'Laboratory result uploaded successfully.',
      })
      setFormState(initialFormState)
      setResultFile(null)
      formElement.reset()
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred during upload.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="hospital-page">
      <div className="ambient ambient-a" aria-hidden="true" />
      <div className="ambient ambient-b" aria-hidden="true" />

      <main className="upload-layout">
        <section className="panel hero reveal">
          <p className="kicker">Hospital Information System</p>
          <h1>Laboratory Result Upload Center</h1>
          <p>
            Securely upload a patient laboratory result and capture core
            metadata fields from your workflow.
          </p>
          <span
            className={`api-state ${
              LAB_UPLOAD_API_URL ? 'api-ready' : 'api-missing'
            }`}
          >
            {LAB_UPLOAD_API_URL
              ? 'API endpoint loaded from .env'
              : 'API endpoint missing in .env'}
          </span>
        </section>

        <section className="content-grid reveal">
          <form className="panel upload-form" onSubmit={handleSubmit}>
            <h2>Upload Laboratory Result</h2>

            <div className="field-grid">
              <label htmlFor="fhud">
                FHUD
                <input
                  id="fhud"
                  name="fhud"
                  value={formState.fhud}
                  onChange={handleInputChange}
                  placeholder="Facility HUD code"
                  required
                />
              </label>

              <label htmlFor="enc">
                ENC
                <input
                  id="enc"
                  name="enc"
                  value={formState.enc}
                  onChange={handleInputChange}
                  placeholder="Encounter reference"
                  required
                />
              </label>

              <label htmlFor="user">
                User
                <input
                  id="user"
                  name="user"
                  value={formState.user}
                  onChange={handleInputChange}
                  placeholder="Uploader username"
                  required
                />
              </label>

              <label htmlFor="docintkey">
                DocIntKey
                <input
                  id="docintkey"
                  name="docintkey"
                  value={formState.docintkey}
                  onChange={handleInputChange}
                  placeholder="Document integration key"
                  required
                />
              </label>

              <label htmlFor="laboratoryType">
                Laboratory Type
                <input
                  id="laboratoryType"
                  name="laboratoryType"
                  value={formState.laboratoryType}
                  onChange={handleInputChange}
                  placeholder="e.g. Hematology"
                />
              </label>

              <label htmlFor="resultFile">
                Result Attachment
                <input
                  id="resultFile"
                  name="resultFile"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                />
              </label>
            </div>

            <label htmlFor="remarks" className="textarea-wrap">
              Clinical Notes
              <textarea
                id="remarks"
                name="remarks"
                rows="4"
                value={formState.remarks}
                onChange={handleInputChange}
                placeholder="Optional lab comments and critical details"
              />
            </label>

            <button type="submit" disabled={!canSubmit || submitting}>
              {submitting ? 'Uploading...' : 'Upload Laboratory Result'}
            </button>

            {status.message ? (
              <p
                className={`status-banner ${
                  status.type === 'success' ? 'status-success' : 'status-error'
                }`}
                role="status"
              >
                {status.message}
              </p>
            ) : null}
          </form>

          <aside className="panel meta-panel">
            <h2>Captured Metadata</h2>
            <ul>
              {payloadPreview.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </li>
              ))}
            </ul>
            <p>
              This request sends FHUD, ENC, User, DocIntKey, optional notes,
              and the laboratory file using multipart/form-data.
            </p>
          </aside>
        </section>
      </main>
    </div>
  )
}

export default App
