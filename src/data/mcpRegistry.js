export const MCP_STEP_PREFIX = 'mcp:'

export const mcpRegistry = [
  {
    id: 'github',
    label: 'GitHub',
    description: 'Create issues from workflow output.',
    tools: [
      {
        id: 'create_issue',
        label: 'Create issue',
        description: 'Turns the previous agent output into a GitHub issue payload.',
        fields: [
          {
            id: 'repo',
            label: 'Repository',
            placeholder: 'owner/repo',
            required: true,
          },
          {
            id: 'title',
            label: 'Issue title override',
            placeholder: 'Leave blank to infer from previous output',
            required: false,
          },
          {
            id: 'labels',
            label: 'Labels',
            placeholder: 'bug, triage',
            required: false,
          },
        ],
      },
    ],
  },
]

export function getMcpServer(serverId) {
  return mcpRegistry.find((server) => server.id === serverId) ?? null
}

export function getMcpTool(serverId, toolId) {
  return getMcpServer(serverId)?.tools.find((tool) => tool.id === toolId) ?? null
}

function encodeConfig(config) {
  const entries = Object.entries(config).filter(([, value]) => String(value ?? '').trim())
  if (entries.length === 0) return ''
  return encodeURIComponent(JSON.stringify(Object.fromEntries(entries)))
}

function decodeConfig(encodedConfig) {
  if (!encodedConfig) return {}
  try {
    return JSON.parse(decodeURIComponent(encodedConfig))
  } catch {
    return {}
  }
}

export function createMcpStepId(serverId, toolId, config = {}) {
  const encodedConfig = encodeConfig(config)
  return encodedConfig
    ? `${MCP_STEP_PREFIX}${serverId}:${toolId}:${encodedConfig}`
    : `${MCP_STEP_PREFIX}${serverId}:${toolId}`
}

export function parseMcpStepId(stepId) {
  if (typeof stepId !== 'string' || !stepId.startsWith(MCP_STEP_PREFIX)) return null
  const [, serverId, toolId, ...configParts] = stepId.split(':')
  if (!serverId || !toolId) return null
  const server = getMcpServer(serverId)
  const tool = getMcpTool(serverId, toolId)
  if (!server || !tool) return null
  return { serverId, toolId, server, tool, config: decodeConfig(configParts.join(':')) }
}

export function isMcpStepId(stepId) {
  return Boolean(parseMcpStepId(stepId))
}

export function createMcpWorkflowStep(serverId, toolId, config = {}) {
  const id = createMcpStepId(serverId, toolId, config)
  const parsed = parseMcpStepId(id)
  if (!parsed) return null

  return {
    id,
    kind: 'mcp',
    name: `${parsed.server.label}: ${parsed.tool.label}`,
    category: 'MCP Action',
    description: parsed.tool.description,
    config: parsed.config,
  }
}
