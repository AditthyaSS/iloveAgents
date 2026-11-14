// @vitest-environment node
import { describe, it, expect } from 'vitest'
import agent from './definitions/dependency-impact-analyzer'
import { CATEGORIES } from './categories'
import { loadAllAgents } from './registry'

describe('Dependency Impact Analyzer Agent Definition', () => {
  it('has all required agent metadata fields', () => {
    expect(agent.id).toBe('dependency-impact-analyzer')
    expect(agent.name).toBe('Dependency Impact Analyzer')
    expect(typeof agent.description).toBe('string')
    expect(agent.description.length).toBeGreaterThan(20)
    expect(agent.category).toBe('Engineering')
    expect(CATEGORIES).toContain(agent.category)
    expect(agent.icon).toBe('PackageSearch')
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
    expect(agent.inputs.length).toBeGreaterThanOrEqual(4)

    const inputIds = agent.inputs.map((inp) => inp.id)
    expect(inputIds).toContain('package_name')
    expect(inputIds).toContain('current_version')
    expect(inputIds).toContain('target_version')
    expect(inputIds).toContain('project_context')

    agent.inputs.forEach((inp) => {
      expect(typeof inp.id).toBe('string')
      expect(typeof inp.label).toBe('string')
      expect(['text', 'textarea', 'code', 'select', 'multiselect']).toContain(inp.type)
      if (inp.required !== undefined) {
        expect(typeof inp.required).toBe('boolean')
      }
    })
  })

  it('contains comprehensive systemPrompt with dependency impact guidelines', () => {
    expect(typeof agent.systemPrompt).toBe('string')
    expect(agent.systemPrompt).toContain('Executive Risk Assessment')
    expect(agent.systemPrompt).toContain('Breaking Changes')
    expect(agent.systemPrompt).toContain('Affected Modules')
    expect(agent.systemPrompt).toContain('Transitive Dependency')
    expect(agent.systemPrompt).toContain('Upgrade Checklist')
    expect(agent.systemPrompt).toContain('Use release notes only when provided in user input')
  })

  it('includes valid example inputs corresponding to declared input IDs', () => {
    expect(agent.exampleInputs).toBeDefined()
    expect(agent.exampleInputs.package_name).toBeDefined()
    expect(agent.exampleInputs.current_version).toBeDefined()
    expect(agent.exampleInputs.target_version).toBeDefined()
    expect(agent.exampleInputs.project_context).toBeDefined()
  })

  it('is successfully discovered and loaded by loadAllAgents registry', async () => {
    const allAgents = await loadAllAgents()
    const found = allAgents.find((a) => a.id === 'dependency-impact-analyzer')
    expect(found).toBeDefined()
    expect(found.name).toBe('Dependency Impact Analyzer')
    expect(found.category).toBe('Engineering')
  }, 15000)
})
