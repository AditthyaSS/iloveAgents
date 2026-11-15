import { describe, it, expect } from 'vitest'
import agent from './definitions/ml-project-debugging-assistant'
import { CATEGORIES } from './categories'
import { loadAllAgents } from './registry'

describe('ML Project Debugging Assistant Agent Definition', () => {
  it('has all required agent metadata fields', () => {
    expect(agent.id).toBe('ml-project-debugging-assistant')
    expect(agent.name).toBe('ML Project Debugging Assistant')
    expect(typeof agent.description).toBe('string')
    expect(agent.description.length).toBeGreaterThan(20)
    expect(agent.category).toBe('Engineering')
    expect(CATEGORIES).toContain(agent.category)
    expect(agent.icon).toBe('Bug')
    expect(agent.provider).toBe('any')
    expect(agent.defaultProvider).toBe('openai')
    expect(agent.model).toBe('gpt-4o')
    expect(agent.outputType).toBe('markdown')
  })

  it('has a valid kebab-case id', () => {
    const kebabRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/
    expect(agent.id).toMatch(kebabRegex)
  })

  it('has properly configured input fields matching issue requirements', () => {
    expect(Array.isArray(agent.inputs)).toBe(true)
    expect(agent.inputs.length).toBeGreaterThanOrEqual(4)

    const inputIds = agent.inputs.map((inp) => inp.id)
    expect(inputIds).toContain('language')
    expect(inputIds).toContain('framework')
    expect(inputIds).toContain('error_message')
    expect(inputIds).toContain('code_snippet')
    expect(inputIds).toContain('goal')

    const requiredInput = agent.inputs.find((inp) => inp.id === 'error_message')
    expect(requiredInput?.required).toBe(true)

    agent.inputs.forEach((inp) => {
      expect(typeof inp.id).toBe('string')
      expect(typeof inp.label).toBe('string')
      expect(['text', 'textarea', 'code', 'select', 'multiselect']).toContain(inp.type)
      if (inp.required !== undefined) {
        expect(typeof inp.required).toBe('boolean')
      }
    })
  })

  it('contains comprehensive systemPrompt covering all required output sections', () => {
    expect(typeof agent.systemPrompt).toBe('string')
    expect(agent.systemPrompt).toContain('## Error Analysis')
    expect(agent.systemPrompt).toContain('## Root Cause')
    expect(agent.systemPrompt).toContain('## Step-by-Step Fix')
    expect(agent.systemPrompt).toContain('## Corrected Code')
    expect(agent.systemPrompt).toContain('## Prevention Tips')
  })

  it('includes valid example inputs corresponding to declared input IDs', () => {
    expect(agent.exampleInputs).toBeDefined()
    expect(agent.exampleInputs.language).toBeDefined()
    expect(agent.exampleInputs.framework).toBeDefined()
    expect(agent.exampleInputs.error_message).toBeDefined()
    expect(agent.exampleInputs.code_snippet).toBeDefined()
    expect(agent.exampleInputs.goal).toBeDefined()
  })

  it('is successfully discovered and loaded by loadAllAgents registry', async () => {
    const allAgents = await loadAllAgents()
    const found = allAgents.find((a) => a.id === 'ml-project-debugging-assistant')
    expect(found).toBeDefined()
    expect(found.name).toBe('ML Project Debugging Assistant')
    expect(found.category).toBe('Engineering')
  })
})
