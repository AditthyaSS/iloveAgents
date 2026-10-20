export function buildWorkflowFilename(workflowTitle) {
  const rawTitle = String(workflowTitle ?? '').trim()
  const slug = rawTitle
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '')

  return `${slug || 'workflow'}-output.md`
}

export function buildWorkflowMarkdown(workflowTitle, steps = []) {
  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const rawTitle = String(workflowTitle || 'workflow')
  const safeSteps = Array.isArray(steps) ? steps : []
  const stepContent = safeSteps
    .filter((s) => s && s.status === 'done' && s.output)
    .map((s, i) => `## Step ${i + 1} — ${s.agentName || s.agentId || 'Step'}\n\n${s.output}`)
    .join('\n\n---\n\n')

  return `# ${rawTitle} — Workflow Output\nGenerated on ${date}\n\n${stepContent}`
}

export function exportWorkflowAsMarkdown(workflowTitle, steps = []) {
  const filename = buildWorkflowFilename(workflowTitle)
  const content = buildWorkflowMarkdown(workflowTitle, steps)

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}