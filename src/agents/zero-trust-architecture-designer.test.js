// @vitest-environment node
import { describe, it, expect } from 'vitest'
import agent from './definitions/zero-trust-architecture-designer'
import { CATEGORIES } from './categories'
import { loadAllAgents } from './registry'

describe('Zero Trust Architecture & Security Policy Designer Agent Definition', () => {
  it('has all required agent metadata fields', () => {
    expect(agent.id).toBe('zero-trust-architecture-designer')
    expect(agent.name).toBe('Zero Trust Architecture & Security Policy Designer')
    expect(typeof agent.description).toBe('string')
    expect(agent.description.length).toBeGreaterThan(20)
    expect(agent.category).toBe('Cybersecurity')
    expect(CATEGORIES).toContain(agent.category)
    expect(agent.icon).toBe('ShieldCheck')
    expect(agent.provider).toBe('any')
    expect(agent.defaultProvider).toBe('openai')
    expect(agent.model).toBe('gpt-4o')
    expect(agent.createdAt).toBe('2026-11-15')
    expect(agent.outputType).toBe('markdown')
  })

  it('has a valid kebab-case id', () => {
    const kebabRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/
    expect(agent.id).toMatch(kebabRegex)
  })

  it('has properly configured input fields with correct types', () => {
    expect(Array.isArray(agent.inputs)).toBe(true)
    expect(agent.inputs.length).toBeGreaterThanOrEqual(4)

    const inputIds = agent.inputs.map((inp) => inp.id)
    expect(inputIds).toContain('infrastructure_overview')
    expect(inputIds).toContain('compliance_framework')
    expect(inputIds).toContain('identity_provider')
    expect(inputIds).toContain('enforcement_plane')
    expect(inputIds).toContain('risk_tolerance')

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

    const overviewInput = agent.inputs.find((inp) => inp.id === 'infrastructure_overview')
    expect(overviewInput.required).toBe(true)
  })

  it('contains comprehensive systemPrompt covering NIST SP 800-207, microsegmentation, and verification', () => {
    expect(typeof agent.systemPrompt).toBe('string')
    expect(agent.systemPrompt).toContain('NIST SP 800-207')
    expect(agent.systemPrompt).toContain('Policy Decision Point')
    expect(agent.systemPrompt).toContain('Policy Enforcement Point')
    expect(agent.systemPrompt).toContain('Least-Privilege RBAC / ABAC')
    expect(agent.systemPrompt).toContain('Network Microsegmentation')
    expect(agent.systemPrompt).toContain('Mutual TLS (mTLS)')
  })

  it('includes valid example inputs corresponding to declared input IDs', () => {
    expect(agent.exampleInputs).toBeDefined()
    expect(agent.exampleInputs.infrastructure_overview).toBeDefined()
    expect(agent.exampleInputs.compliance_framework).toBeDefined()
    expect(agent.exampleInputs.identity_provider).toBeDefined()
    expect(agent.exampleInputs.enforcement_plane).toBeDefined()
  })

  it('is successfully discovered and loaded by loadAllAgents registry', async () => {
    const allAgents = await loadAllAgents()
    const found = allAgents.find((a) => a.id === 'zero-trust-architecture-designer')
    expect(found).toBeDefined()
    expect(found.id).toBe('zero-trust-architecture-designer')
    expect(found.name).toBe('Zero Trust Architecture & Security Policy Designer')
    expect(found.category).toBe('Cybersecurity')
  })
})
