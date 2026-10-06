export function exportWorkflowAsMarkdown(workflowTitle, steps) {
  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Guard against null/undefined title; produce a safe slug fallback
  const safeTitle = String(workflowTitle ?? '')
  const slug = safeTitle
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    || 'workflow'

  const filename = `${slug}-output.md`

  // Guard against undefined/null steps
  const safeSteps = Array.isArray(steps) ? steps : []

  const stepContent = safeSteps
    .filter((s) => s.status === 'done' && s.output)
    .map((s, i) => `## Step ${i + 1} — ${s.agentName}\n\n${s.output}`)
    .join('\n\n---\n\n')

  const content = `# ${safeTitle || 'Workflow'} — Workflow Output\nGenerated on ${date}\n\n${stepContent}`

  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  // Defer revocation so Firefox can complete the download stream
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}