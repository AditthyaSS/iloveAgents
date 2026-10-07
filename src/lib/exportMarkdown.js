export function exportWorkflowAsMarkdown(workflowTitle, steps) {
  const safeTitle = typeof workflowTitle === 'string' && workflowTitle.trim() ? workflowTitle : 'untitled workflow'
  const safeSteps = Array.isArray(steps) ? steps : []
  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const slug = safeTitle
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '')
  const filename = `${slug || 'workflow'}-output.md`

  const stepContent = safeSteps
    .filter((s) => s && s.status === 'done' && s.output)
    .map((s, i) => `## Step ${i + 1} — ${s.agentName || 'agent'}\n\n${s.output}`)
    .join('\n\n---\n\n')

  const content = `# ${safeTitle} — Workflow Output\nGenerated on ${date}\n\n${stepContent}`

  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}