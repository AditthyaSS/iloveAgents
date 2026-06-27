/**
 * Export batch results as CSV or Markdown.
 * Mirrors the pattern in exportMarkdown.js.
 */

function slugifyFilename(name) {
  return (
    name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') || 'batch'
  )
}

function downloadBlob(content, mimeType, filename) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function csvEscape(value) {
  const str = String(value ?? '')
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * @param {string} agentName
 * @param {Array<{input: string, status: string, output?: string, error?: string}>} results
 */
export function exportBatchAsCSV(agentName, results) {
  const filename = `${slugifyFilename(agentName)}-batch-results.csv`

  const header = ['#', 'Input', 'Status', 'Output', 'Error']
  const rows = results.map((r, i) => [
    i + 1,
    r.input,
    r.status,
    r.output || '',
    r.error || '',
  ])

  const csv = [header, ...rows]
    .map((row) => row.map(csvEscape).join(','))
    .join('\n')

  downloadBlob(csv, 'text/csv', filename)
}

/**
 * @param {string} agentName
 * @param {Array<{input: string, status: string, output?: string, error?: string}>} results
 */
export function exportBatchAsMarkdown(agentName, results) {
  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const filename = `${slugifyFilename(agentName)}-batch-results.md`

  const sections = results
    .map((r, i) => {
      const heading = `## Item ${i + 1} — ${r.status === 'done' ? '✅ Success' : r.status === 'failed' ? '❌ Failed' : '⏳ ' + r.status}`
      const inputBlock = `**Input:**\n\n${r.input}`
      const bodyBlock =
        r.status === 'failed'
          ? `**Error:**\n\n${r.error || 'Unknown error'}`
          : `**Output:**\n\n${r.output || '(empty)'}`
      return `${heading}\n\n${inputBlock}\n\n${bodyBlock}`
    })
    .join('\n\n---\n\n')

  const content = `# ${agentName} — Batch Results\nGenerated on ${date}\n${results.length} items processed\n\n${sections}`

  downloadBlob(content, 'text/markdown', filename)
}
