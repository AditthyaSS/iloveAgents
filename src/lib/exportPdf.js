export function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildPdfHtml(agentName, content) {
  const title = agentName || 'Agent output'
  const body = escapeHtml(content || '')
  return (
    '<!doctype html><html><head><meta charset="utf-8"><title>' +
    escapeHtml(title) +
    '</title><style>' +
    'body{font-family:Arial,Helvetica,sans-serif;margin:40px;color:#111;}' +
    'h1{font-size:20px;margin-bottom:16px;}' +
    'pre{white-space:pre-wrap;font-size:13px;line-height:1.6;}' +
    '</style></head><body>' +
    '<h1>' +
    escapeHtml(title) +
    '</h1><pre>' +
    body +
    '</pre></body></html>'
  )
}
