// @vitest-environment node
import { describe, it, expect } from 'vitest'
import agent from './definitions/ci-failure-triage-agent'
import { CATEGORIES } from './categories'
import { loadAllAgents } from './registry'

describe('CI Failure Triage Agent Definition', () => {
  it('has valid metadata and a supported category', () => {
    expect(agent.id).toBe('ci-failure-triage-agent')
    expect(agent.name).toBe('CI Failure Triage Agent')
    expect(agent.description.length).toBeGreaterThan(20)
    expect(agent.category).toBe('DevOps')
    expect(CATEGORIES).toContain(agent.category)
    expect(agent.icon).toBe('Workflow')
    expect(agent.provider).toBe('any')
    expect(agent.defaultProvider).toBe('openai')
    expect(agent.outputType).toBe('markdown')
  })

  it('defines supported inputs with matching examples', () => {
    const inputIds = agent.inputs.map((input) => input.id)

    expect(inputIds).toEqual(['ci_logs', 'pipeline_context', 'recent_changes'])
    expect(agent.inputs[0].type).toBe('code')
    agent.inputs.forEach((input) => {
      expect(['text', 'textarea', 'code', 'select', 'multiselect']).toContain(input.type)
    })
    inputIds.forEach((id) => {
      expect(agent.exampleInputs[id]).toBeDefined()
    })
  })

  it('requires evidence-grounded triage in a consistent output format', () => {
    expect(agent.systemPrompt).toContain('## CI Failure Triage')
    expect(agent.systemPrompt).toContain('### Evidence')
    expect(agent.systemPrompt).toContain('### Likely Root Cause')
    expect(agent.systemPrompt).toContain('### Verification Steps')
    expect(agent.systemPrompt).toContain('Never invent error messages')
  })

  it('is discovered by the existing agent registry', async () => {
    const allAgents = await loadAllAgents()
    const found = allAgents.find((candidate) => candidate.id === agent.id)

    expect(found).toBeDefined()
    expect(found.name).toBe(agent.name)
    expect(found.category).toBe(agent.category)
  })
})
