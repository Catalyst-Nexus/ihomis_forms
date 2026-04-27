function parseResponsePayload(responseText) {
  if (!responseText) {
    return null
  }

  try {
    return JSON.parse(responseText)
  } catch {
    return responseText
  }
}

function getByPath(source, path) {
  const keys = path.split('.')
  let value = source

  for (const key of keys) {
    if (!value || typeof value !== 'object') {
      return ''
    }

    value = value[key]
  }

  return typeof value === 'string' ? value.trim() : ''
}

function resolveUploadedPdfUrl(payload) {
  if (!payload || typeof payload !== 'object') {
    return ''
  }

  const candidatePaths = [
    'pdfUrl',
    'fileUrl',
    'url',
    'documentUrl',
    'resultUrl',
    'data.pdfUrl',
    'data.fileUrl',
    'data.url',
    'data.documentUrl',
    'data.resultUrl',
  ]

  for (const path of candidatePaths) {
    const value = getByPath(payload, path)
    if (value) {
      return value
    }
  }

  return ''
}

function buildErrorMessage(response, payload) {
  if (typeof payload === 'string' && payload.trim()) {
    return payload.trim()
  }

  if (payload && typeof payload === 'object') {
    const message = payload.message || payload.error || payload.detail
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  return `Upload failed with status ${response.status}.`
}

export async function uploadLabResult({
  uploadUrl,
  token,
  resultFile,
  laboratoryType,
  remarks,
}) {
  const payload = new FormData()
  payload.append('resultFile', resultFile)

  if (laboratoryType?.trim()) {
    payload.append('laboratoryType', laboratoryType.trim())
  }

  if (remarks?.trim()) {
    payload.append('remarks', remarks.trim())
  }

  const headers = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers,
    body: payload,
  })

  const responseText = await response.text()
  const responsePayload = parseResponsePayload(responseText)

  if (!response.ok) {
    throw new Error(buildErrorMessage(response, responsePayload))
  }

  return {
    payload: responsePayload,
    uploadedPdfUrl: resolveUploadedPdfUrl(responsePayload),
  }
}
