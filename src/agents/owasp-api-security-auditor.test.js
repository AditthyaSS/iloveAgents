// @vitest-environment node
import { describe, it, expect } from 'vitest'
import agent from './definitions/owasp-api-security-auditor'
import { CATEGORIES } from './categories'
import { loadAllAgents } from './registry'

describe('OWASP API Security Auditor Agent Definition', () => {
  it('has all required agent metadata fields', () => {
    expect(agent.id).toBe('owasp-api-security-auditor')
    expect(agent.name).toBe('OWASP API Security Auditor')
    expect(typeof agent.description).toBe('string')
    expect(agent.description.length).toBeGreaterThan(20)
    expect(agent.category).toBe('Cybersecurity')
    expect(CATEGORIES).toContain(agent.category)
    expect(agent.icon).toBe('ShieldAlert')
    expect(agent.provider).toBe('any')
    expect(agent.defaultProvider).toBe('openai')
    expect(agent.model).toBe('gpt-4o')
    expect(agent.createdAt).toBe('2026-10-16')
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
    expect(inputIds).toContain('api_spec')
    expect(inputIds).toContain('api_style')
    expect(inputIds).toContain('auth_mechanism')
    expect(inputIds).toContain('compliance_target')

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

    const specInput = agent.inputs.find((inp) => inp.id === 'api_spec')
    expect(specInput.required).toBe(true)
    expect(specInput.type).toBe('code')
  })

  it('contains comprehensive systemPrompt covering OWASP API Security Top 10 vulnerabilities', () => {
    expect(typeof agent.systemPrompt).toBe('string')
    expect(agent.systemPrompt).toContain('Broken Object Level Authorization')
    expect(agent.systemPrompt).toContain('Broken Authentication')
    expect(agent.systemPrompt).toContain('Server-Side Request Forgery')
    expect(agent.systemPrompt).toContain('Broken Object Property Level Authorization')
    expect(agent.systemPrompt).toContain('Executive API Risk Scorecard')
    expect(agent.systemPrompt).toContain('OWASP API Top 10 Threat Analysis Matrix')
    expect(agent.systemPrompt).toContain('Actionable Drop-In Code Remediations')
    expect(agent.systemPrompt).toContain('Production API Hardening & Verification Checklist')
  })

  it('includes valid example inputs corresponding to declared input IDs', () => {
    expect(agent.exampleInputs).toBeDefined()
    expect(agent.exampleInputs.api_spec).toBeDefined()
    expect(typeof agent.exampleInputs.api_spec).toBe('string')
    expect(agent.exampleInputs.api_style).toBeDefined()
    expect(agent.exampleInputs.auth_mechanism).toBeDefined()
    expect(agent.exampleInputs.compliance_target).toBeDefined()
  })

  it('is successfully discovered and loaded by loadAllAgents registry', async () => {
    const allAgents = await loadAllAgents()
    const found = allAgents.find((a) => a.id === 'owasp-api-security-auditor')
    expect(found).toBeDefined()
    expect(found.name).toBe('OWASP API Security Auditor')
    expect(found.category).toBe('Cybersecurity')
    expect(found.icon).toBe('ShieldAlert')
  }, 15000)
})
