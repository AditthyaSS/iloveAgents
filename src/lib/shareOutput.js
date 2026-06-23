import { SHARE_EXPIRY_DAYS, getShareableInputs } from './shareOutputFormat.js'

export { SHARE_EXPIRY_DAYS, buildShareCard, getShareableInputs } from './shareOutputFormat.js'

export async function createSharedOutput({ agent, inputs, output }) {
  const payload = {
    agentId: agent.id,
    agentName: agent.name,
    inputs: getShareableInputs(inputs, agent.inputs),
    output,
    outputType: agent.outputType || 'markdown',
  }

  const response = await fetch('/api/share', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || 'Failed to create shareable link')
  }

  const data = await response.json()
  return {
    id: data.shareId,
    url: `${window.location.origin}${data.url}`,
  }
}

export async function getSharedOutput(id) {
  const response = await fetch(`/api/share/${id}`)
  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || 'Failed to fetch shared output')
  }
  return await response.json()
}

