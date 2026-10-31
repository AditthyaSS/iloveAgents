// @vitest-environment node
import { describe, it, expect } from 'vitest'
import agent from './definitions/opentelemetry-observability-architect'
import { CATEGORIES } from './categories'
import { loadAllAgents } from './registry'

describe('OpenTelemetry Observability & Tracing Architect Agent Definition', () => {
  it('has all required agent metadata fields', () => {
    expect(agent.id).toBe('opentelemetry-observability-architect')
    expect(agent.name).toBe('OpenTelemetry Observability & Tracing Architect')
    expect(typeof agent.description).toBe('string')
    expect(agent.description.length).toBeGreaterThan(20)
    expect(agent.category).toBe('DevOps')
    expect(CATEGORIES).toContain(agent.category)
    expect(agent.icon).toBe('Activity')
    expect(agent.provider).toBe('any')
    expect(agent.defaultProvider).toBe('openai')
    expect(agent.model).toBe('gpt-4o')
    expect(agent.createdAt).toBe('2026-10-19')
  })

  it('has a valid kebab-case id', () => {
    const kebabRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/
    expect(agent.id).toMatch(kebabRegex)
  })

  it('has properly configured input fields with correct types', () => {
    expect(Array.isArray(agent.inputs)).toBe(true)
    expect(agent.inputs.length).toBeGreaterThanOrEqual(4)

    const inputIds = agent.inputs.map((inp) => inp.id)
    expect(inputIds).toContain('service_architecture')
    expect(inputIds).toContain('telemetry_signals')
    expect(inputIds).toContain('collector_topology')
    expect(inputIds).toContain('observability_backend')
    expect(inputIds).toContain('sampling_and_cardinality')

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

    const archInput = agent.inputs.find((inp) => inp.id === 'service_architecture')
    expect(archInput.required).toBe(true)
  })

  it('contains comprehensive systemPrompt covering key OTel pillars and collector configs', () => {
    expect(typeof agent.systemPrompt).toBe('string')
    expect(agent.systemPrompt).toContain('OpenTelemetry')
    expect(agent.systemPrompt).toContain('W3C Trace Context')
    expect(agent.systemPrompt).toContain('traceparent')
    expect(agent.systemPrompt).toContain('otel-collector-config.yaml')
    expect(agent.systemPrompt).toContain('tail_sampling')
    expect(agent.systemPrompt).toContain('memory_limiter')
    expect(agent.systemPrompt).toContain('Golden Signals')
  })

  it('includes valid example inputs corresponding to declared input IDs', () => {
    expect(agent.exampleInputs).toBeDefined()
    expect(agent.exampleInputs.service_architecture).toBeDefined()
    expect(typeof agent.exampleInputs.service_architecture).toBe('string')
    expect(agent.exampleInputs.telemetry_signals).toBeDefined()
    expect(agent.exampleInputs.collector_topology).toBeDefined()
    expect(agent.exampleInputs.observability_backend).toBeDefined()
  })

  it('loads successfully through the agent registry', async () => {
    const allAgents = await loadAllAgents()
    const found = allAgents.find((a) => a.id === 'opentelemetry-observability-architect')
    expect(found).toBeDefined()
    expect(found.name).toBe('OpenTelemetry Observability & Tracing Architect')
    expect(found.category).toBe('DevOps')
  }, 20000)
})
