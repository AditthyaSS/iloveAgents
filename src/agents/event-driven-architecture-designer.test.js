// @vitest-environment node
import { describe, it, expect } from 'vitest'
import agent from './definitions/event-driven-architecture-designer'
import { CATEGORIES } from './categories'
import { loadAllAgents } from './registry'

describe('Event-Driven Architecture & Message Broker Designer Agent Definition', () => {
  it('has all required agent metadata fields', () => {
    expect(agent.id).toBe('event-driven-architecture-designer')
    expect(agent.name).toBe('Event-Driven Architecture & Message Broker Designer')
    expect(typeof agent.description).toBe('string')
    expect(agent.description.length).toBeGreaterThan(20)
    expect(agent.category).toBe('Engineering')
    expect(CATEGORIES).toContain(agent.category)
    expect(agent.icon).toBe('Network')
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
    expect(inputIds).toContain('broker_platform')
    expect(inputIds).toContain('domain_workflow')
    expect(inputIds).toContain('delivery_guarantee')
    expect(inputIds).toContain('schema_standard')
    expect(inputIds).toContain('current_architecture_or_needs')

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

    const workflowInput = agent.inputs.find((inp) => inp.id === 'domain_workflow')
    expect(workflowInput.required).toBe(true)
  })

  it('contains comprehensive systemPrompt covering event topology, schemas, broker configs, idempotency, and retries', () => {
    expect(typeof agent.systemPrompt).toBe('string')
    expect(agent.systemPrompt).toContain('Architecture Topology & Event Flow Diagram')
    expect(agent.systemPrompt).toContain('Standardized Event Schema Definition')
    expect(agent.systemPrompt).toContain('Broker Configuration & Infrastructure Declarations')
    expect(agent.systemPrompt).toContain('Consumer Idempotency & Deduplication Pattern')
    expect(agent.systemPrompt).toContain('Resilient Retry Strategy & Poison Pill Quarantine')
    expect(agent.systemPrompt).toContain('CloudEvents')
    expect(agent.systemPrompt).toContain('Dead Letter Queue')
  })

  it('provides realistic exampleInputs matching input schemas', () => {
    expect(typeof agent.exampleInputs).toBe('object')
    expect(agent.exampleInputs.broker_platform).toBe('Apache Kafka / Confluent Cloud')
    expect(agent.exampleInputs.delivery_guarantee).toBe('At-least-once (with Consumer Idempotency Keys)')
    expect(agent.exampleInputs.schema_standard).toBe('CloudEvents v1.0 (JSON)')
    expect(agent.exampleInputs.domain_workflow.length).toBeGreaterThan(30)
  })

  it('loads successfully through the registry', async () => {
    const agents = await loadAllAgents()
    const found = agents.find((a) => a.id === 'event-driven-architecture-designer')
    expect(found).toBeDefined()
    expect(found.name).toBe('Event-Driven Architecture & Message Broker Designer')
    expect(found.category).toBe('Engineering')
  })
})
