const DEFAULT_REVOKE_DELAY_MS = 5000

export function downloadBlob(content, mimeType, filename, options = {}) {
  const { revokeDelayMs = DEFAULT_REVOKE_DELAY_MS } = options
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), revokeDelayMs)
  return url
}

export function downloadTextFile(text, filename, mimeType = 'text/plain;charset=utf-8') {
  return downloadBlob(text, mimeType, filename)
}
