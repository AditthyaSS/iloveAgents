import { getMcpTool, parseMcpStepId } from '../data/mcpRegistry'

function firstUsefulLine(text) {
  return (
    text
      .split('\n')
      .map((line) => line.replace(/^#+\s*/, '').trim())
      .find(Boolean) || 'Workflow generated issue'
  )
}

function labelsFromConfig(labels) {
  return String(labels || '')
    .split(',')
    .map((label) => label.trim())
    .filter(Boolean)
}

function buildGitHubIssuePayload(previousOutput, config = {}) {
  const repo = String(config.repo || '').trim()
  if (!repo || !repo.includes('/')) {
    throw new Error('GitHub MCP action needs a repository in owner/repo format.')
  }

  const title = String(config.title || '').trim() || firstUsefulLine(previousOutput).slice(0, 120)
  const body = [
    '## Generated from iloveAgents workflow',
    '',
    previousOutput.trim() || '_No previous step output was available._',
  ].join('\n')

  return {
    repo,
    title,
    body,
    labels: labelsFromConfig(config.labels),
  }
}

async function createGitHubIssue(previousOutput, config = {}) {
  const payload = buildGitHubIssuePayload(previousOutput, config)

  if (config.mode !== 'live') {
    return [
      'GitHub issue payload prepared.',
      '',
      `Repository: ${payload.repo}`,
      `Title: ${payload.title}`,
      payload.labels.length ? `Labels: ${payload.labels.join(', ')}` : 'Labels: none',
      '',
      payload.body,
    ].join('\n')
  }

  const token = String(config.token || '').trim()
  if (!token) {
    throw new Error('Live GitHub MCP action needs a token. Leave mode unset to generate a safe payload instead.')
  }

  const response = await fetch(`https://api.github.com/repos/${payload.repo}/issues`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: payload.title,
      body: payload.body,
      labels: payload.labels,
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || `GitHub issue creation failed with HTTP ${response.status}.`)
  }

  return `GitHub issue created: ${data.html_url || payload.title}`
}

export async function executeMcpAction(stepId, previousOutput, config = {}) {
  const parsed = parseMcpStepId(stepId)
  if (!parsed) {
    throw new Error(`Unknown MCP workflow step "${stepId}".`)
  }

  const tool = getMcpTool(parsed.serverId, parsed.toolId)
  if (!tool) {
    throw new Error(`MCP tool "${parsed.toolId}" is not registered.`)
  }

  const actionConfig = { ...parsed.config, ...config }

  if (parsed.serverId === 'github' && parsed.toolId === 'create_issue') {
    return createGitHubIssue(previousOutput, actionConfig)
  }

  throw new Error(`No adapter exists for ${parsed.server.label}: ${tool.label}.`)
}
