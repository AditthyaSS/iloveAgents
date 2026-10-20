// @vitest-environment node
import { describe, it, expect } from 'vitest'
import agent from './definitions/github-actions-workflow-optimizer'
import { CATEGORIES } from './categories'
import { loadAllAgents } from './registry'

describe('GitHub Actions Workflow Optimizer Agent Definition', () => {
  it('has all required agent metadata fields', () => {
    expect(agent.id).toBe('github-actions-workflow-optimizer')
    expect(agent.name).toBe('GitHub Actions Workflow Optimizer')
    expect(typeof agent.description).toBe('string')
    expect(agent.description.length).toBeGreaterThan(20)
    expect(agent.category).toBe('DevOps')
    expect(CATEGORIES).toContain(agent.category)
    expect(agent.icon).toBe('Workflow')
    expect(agent.provider).toBe('any')
    expect(agent.defaultProvider).toBe('openai')
    expect(agent.model).toBe('gpt-4o')
    expect(agent.createdAt).toBe('2026-10-13')
  })

  it('has a valid kebab-case id', () => {
    const kebabRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/
    expect(agent.id).toMatch(kebabRegex)
  })

  it('has properly configured input fields with correct types', () => {
    expect(Array.isArray(agent.inputs)).toBe(true)
    expect(agent.inputs.length).toBeGreaterThanOrEqual(4)

    const inputIds = agent.inputs.map((inp) => inp.id)
    expect(inputIds).toContain('workflow_yaml')
    expect(inputIds).toContain('optimization_focus')
    expect(inputIds).toContain('package_manager')
    expect(inputIds).toContain('runner_target')

    agent.inputs.forEach((inp) => {
      expect(typeof inp.id).toBe('string')
      expect(typeof inp.label).toBe('string')
      expect(['text', 'textarea', 'code', 'select', 'multiselect']).toContain(inp.type)
      if (inp.required !== undefined) {
        expect(typeof inp.required).toBe('boolean')
      }
      if (inp.type === 'select') {
        expect(Array.isArray(inp.options)).toBe(true)
        expect(inp.options.length).toBeGreaterThan(0)
      }
    })

    const yamlInput = agent.inputs.find((inp) => inp.id === 'workflow_yaml')
    expect(yamlInput.required).toBe(true)
  })

  it('contains comprehensive systemPrompt covering key CI/CD optimization pillars and safety guardrails', () => {
    expect(typeof agent.systemPrompt).toBe('string')
    expect(agent.systemPrompt).toContain('Speed & Caching')
    expect(agent.systemPrompt).toContain('Security & Permissions')
    expect(agent.systemPrompt).toContain('Concurrency & Waste Prevention')
    expect(agent.systemPrompt).toContain('Optimized Workflow YAML')
    expect(agent.systemPrompt).toContain('Executive Optimization Scorecard')
    expect(agent.systemPrompt).toContain('cancel-in-progress: true')
    expect(agent.systemPrompt).toContain('deployment, release, or required audit pipelines that must run to completion')
    expect(agent.systemPrompt).toContain('preserve existing trigger coverage unless skipping is verified safe')
    expect(agent.systemPrompt).toContain('paths-ignore')
  })

  it('includes valid example inputs corresponding to declared input IDs', () => {
    expect(agent.exampleInputs).toBeDefined()
    expect(agent.exampleInputs.workflow_yaml).toBeDefined()
    expect(typeof agent.exampleInputs.workflow_yaml).toBe('string')
    expect(agent.exampleInputs.optimization_focus).toBeDefined()
    expect(agent.exampleInputs.package_manager).toBeDefined()
    expect(agent.exampleInputs.runner_target).toBeDefined()
  })

  it('is successfully discovered and loaded by loadAllAgents registry', async () => {
    const allAgents = await loadAllAgents()
    const found = allAgents.find((a) => a.id === 'github-actions-workflow-optimizer')
    expect(found).toBeDefined()
    expect(found.name).toBe('GitHub Actions Workflow Optimizer')
    expect(found.category).toBe('DevOps')
    expect(found.icon).toBe('Workflow')
  }, 15000)
})
