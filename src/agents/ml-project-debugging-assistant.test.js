// @vitest-environment node
import { describe, it, expect } from 'vitest'
import agent from './definitions/ml-project-debugging-assistant'
import { CATEGORIES } from './categories'
import { loadAllAgents } from './registry'

describe('ML Project Debugging Assistant', () => {
  it('declares the required issue inputs with the error message as mandatory', () => {
    expect(CATEGORIES).toContain(agent.category)

    const inputs = new Map(agent.inputs.map((input) => [input.id, input]))
    expect(inputs.get('language').defaultValue).toBe('Python')
    expect(inputs.get('framework').type).toBe('select')
    expect(inputs.get('error_message').required).toBe(true)
    expect(inputs.get('code_snippet').required).toBe(false)
    expect(inputs.get('goal').required).toBe(false)
  })

  it('provides each requested diagnostic section and example input', () => {
    expect(agent.systemPrompt).toContain('## Error Analysis')
    expect(agent.systemPrompt).toContain('## Root Cause')
    expect(agent.systemPrompt).toContain('## Step-by-Step Fix')
    expect(agent.systemPrompt).toContain('## Corrected Code')
    expect(agent.systemPrompt).toContain('## Prevention Tips')
    expect(agent.exampleInputs.error_message).toBeTruthy()
    expect(agent.exampleInputs.code_snippet).toBeTruthy()
  })

  it('is discovered by the agent registry', async () => {
    const agents = await loadAllAgents()
    expect(agents.some((registeredAgent) => registeredAgent.id === agent.id)).toBe(true)
  }, 15000)
})
