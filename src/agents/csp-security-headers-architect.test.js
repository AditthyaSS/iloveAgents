// @vitest-environment node
import { describe, it, expect } from 'vitest'
import agent from './definitions/csp-security-headers-architect'
import { CATEGORIES } from './categories'
import { loadAllAgents } from './registry'

describe('CSP & Security Headers Architect Agent Definition', () => {
  it('has all required agent metadata fields', () => {
    expect(agent.id).toBe('csp-security-headers-architect')
    expect(agent.name).toBe('CSP & Security Headers Architect')
    expect(typeof agent.description).toBe('string')
    expect(agent.description.length).toBeGreaterThan(20)
    expect(agent.category).toBe('Cybersecurity')
    expect(CATEGORIES).toContain(agent.category)
    expect(agent.icon).toBe('ShieldCheck')
    expect(agent.provider).toBe('any')
    expect(agent.defaultProvider).toBe('openai')
    expect(agent.model).toBe('gpt-4o')
    expect(agent.createdAt).toBe('2026-10-19')
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
    expect(inputIds).toContain('architecture_context')
    expect(inputIds).toContain('third_party_services')
    expect(inputIds).toContain('enforcement_mode')
    expect(inputIds).toContain('current_headers_or_code')

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

    const archInput = agent.inputs.find((inp) => inp.id === 'architecture_context')
    expect(archInput.required).toBe(true)
    expect(archInput.type).toBe('select')
  })

  it('contains comprehensive systemPrompt covering modern browser security standards', () => {
    expect(typeof agent.systemPrompt).toBe('string')
    expect(agent.systemPrompt).toContain('Content-Security-Policy')
    expect(agent.systemPrompt).toContain('Cross-Origin-Opener-Policy')
    expect(agent.systemPrompt).toContain('Cross-Origin-Embedder-Policy')
    expect(agent.systemPrompt).toContain('Strict-Transport-Security')
    expect(agent.systemPrompt).toContain('Permissions-Policy')
    expect(agent.systemPrompt).toContain('Executive Security Posture & Architecture Analysis')
    expect(agent.systemPrompt).toContain('Complete Production Security Headers Specification')
    expect(agent.systemPrompt).toContain('Framework & Server Implementation Snippets')
    expect(agent.systemPrompt).toContain('Violation Reporting & Zero-Breakage Staged Migration Plan')
  })

  it('includes valid example inputs corresponding to declared input IDs', () => {
    expect(agent.exampleInputs).toBeDefined()
    expect(agent.exampleInputs.architecture_context).toBeDefined()
    expect(agent.exampleInputs.third_party_services).toBeDefined()
    expect(agent.exampleInputs.enforcement_mode).toBeDefined()
    expect(agent.exampleInputs.current_headers_or_code).toBeDefined()
  })

  it('is successfully discovered and loaded by loadAllAgents registry', async () => {
    const allAgents = await loadAllAgents()
    const found = allAgents.find((a) => a.id === 'csp-security-headers-architect')
    expect(found).toBeDefined()
    expect(found.name).toBe('CSP & Security Headers Architect')
    expect(found.category).toBe('Cybersecurity')
    expect(found.icon).toBe('ShieldCheck')
  }, 15000)
})
