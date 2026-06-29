export const SHARE_EXPIRY_DAYS = 7

function formatInputValue(value) {
  if (Array.isArray(value)) return value.join(', ')
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

export function getShareableInputs(inputs = {}, inputDefinitions = []) {
  return inputDefinitions.reduce((result, definition) => {
    const value = formatInputValue(inputs[definition.id])
    if (value) result[definition.label || definition.id] = value
    return result
  }, {})
}

export function buildShareCard({ agentName, inputs = {}, output, createdAt = new Date() }) {
  const timestamp = new Date(createdAt).toISOString()
  const inputLines = Object.entries(inputs).map(([label, value]) => `- **${label}:** ${formatInputValue(value)}`)

  return [
    `# ${agentName}`,
    '',
    `*Generated with iloveAgents on ${timestamp}*`,
    ...(inputLines.length ? ['', '## Inputs', '', ...inputLines] : []),
    '',
    '## Output',
    '',
    output,
  ].join('\n')
}
