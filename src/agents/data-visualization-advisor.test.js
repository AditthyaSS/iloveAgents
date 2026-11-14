import { describe, it, expect } from 'vitest'
import agent from './definitions/data-visualization-advisor'
import { CATEGORIES } from './categories'
import { loadAllAgents } from './registry'

describe('Data Visualization Advisor Agent Definition', () => {
  it('has all required agent metadata fields', () => {
    expect(agent.id).toBe('data-visualization-advisor')
    expect(agent.name).toBe('Data Visualization Advisor')
    expect(typeof agent.description).toBe('string')
    expect(agent.description.length).toBeGreaterThan(20)
    expect(agent.category).toBe('Data Science')
    expect(CATEGORIES).toContain(agent.category)
    expect(agent.icon).toBe('BarChart3')
    expect(agent.provider).toBe('any')
    expect(agent.defaultProvider).toBe('openai')
    expect(agent.model).toBe('gpt-4o')
    expect(agent.outputType).toBe('markdown')
  })

  it('has a valid kebab-case id', () => {
    const kebabRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/
    expect(agent.id).toMatch(kebabRegex)
  })

  it('has properly configured input fields', () => {
    expect(Array.isArray(agent.inputs)).toBe(true)
    expect(agent.inputs.length).toBeGreaterThanOrEqual(3)

    const inputIds = agent.inputs.map((inp) => inp.id)
    expect(inputIds).toContain('dataset_info')
    expect(inputIds).toContain('analytical_goal')

    agent.inputs.forEach((inp) => {
      expect(typeof inp.id).toBe('string')
      expect(typeof inp.label).toBe('string')
      expect(['text', 'textarea', 'code', 'select', 'multiselect']).toContain(inp.type)
      if (inp.required !== undefined) {
        expect(typeof inp.required).toBe('boolean')
      }
    })
  })

  it('contains comprehensive systemPrompt with visualization guidelines', () => {
    expect(typeof agent.systemPrompt).toBe('string')
    expect(agent.systemPrompt).toContain('Primary Chart Recommendation')
    expect(agent.systemPrompt).toContain('Visual Encoding')
    expect(agent.systemPrompt).toContain('Alternative')
    expect(agent.systemPrompt).toContain('Pitfalls')
  })

  it('includes valid example inputs corresponding to declared input IDs', () => {
    expect(agent.exampleInputs).toBeDefined()
    expect(agent.exampleInputs.dataset_info).toBeDefined()
    expect(agent.exampleInputs.analytical_goal).toBeDefined()
  })

  it('is successfully discovered and loaded by loadAllAgents registry', async () => {
    const allAgents = await loadAllAgents()
    const found = allAgents.find((a) => a.id === 'data-visualization-advisor')
    expect(found).toBeDefined()
    expect(found.name).toBe('Data Visualization Advisor')
    expect(found.category).toBe('Data Science')
  })
})
