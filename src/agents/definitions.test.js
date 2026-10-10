/**
 * Validates that all agent definition files follow the required schema.
 * This acts as a contract test — catching missing fields, wrong types,
 * or malformed data before they reach production.
 */
import { describe, it, expect } from 'vitest'
import { loadAllAgents } from './registry.js'

const VALID_PROVIDERS = ['openai', 'anthropic', 'gemini', 'openrouter', 'any']
const VALID_INPUT_TYPES = ['text', 'textarea', 'select', 'code', 'url', 'file', 'number', 'checkbox', 'multiselect']
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

describe('Agent definitions structure (all agents)', () => {
  let agents

  beforeAll(async () => {
    agents = await loadAllAgents()
    expect(agents.length).toBeGreaterThan(0)
  })

  it('every agent has required top-level string fields', () => {
    agents.forEach((agent) => {
      ;['id', 'name', 'description', 'category'].forEach((field) => {
        expect(typeof agent[field], `${agent.id}: ${field}`).toBe('string')
        expect(agent[field].trim().length, `${agent.id}: ${field} non-empty`).toBeGreaterThan(0)
      })
    })
  })

  it('all agent ids are unique', () => {
    const ids = agents.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all agent ids are kebab-case (lowercase letters, numbers, hyphens only)', () => {
    agents.forEach((agent) => {
      expect(agent.id, `${agent.id} kebab-case`).toMatch(/^[a-z0-9-]+$/)
    })
  })

  it('every agent has a non-empty systemPrompt string', () => {
    agents.forEach((agent) => {
      expect(typeof agent.systemPrompt, `${agent.id} systemPrompt type`).toBe('string')
      expect(agent.systemPrompt.trim().length, `${agent.id} systemPrompt non-empty`).toBeGreaterThan(0)
    })
  })

  it('every agent has an inputs array with at least one input', () => {
    agents.forEach((agent) => {
      expect(Array.isArray(agent.inputs), `${agent.id} inputs array`).toBe(true)
      expect(agent.inputs.length, `${agent.id} has ≥1 input`).toBeGreaterThan(0)
    })
  })

  it('each input has a non-empty id and label', () => {
    agents.forEach((agent) => {
      agent.inputs.forEach((input, i) => {
        expect(typeof input.id, `${agent.id}[${i}] input.id type`).toBe('string')
        expect(input.id.trim().length, `${agent.id}[${i}] input.id non-empty`).toBeGreaterThan(0)
        expect(typeof input.label, `${agent.id}[${i}] input.label type`).toBe('string')
        expect(input.label.trim().length, `${agent.id}[${i}] input.label non-empty`).toBeGreaterThan(0)
      })
    })
  })

  it('input ids within an agent are unique', () => {
    agents.forEach((agent) => {
      const ids = agent.inputs.map((inp) => inp.id)
      expect(new Set(ids).size, `${agent.id} has duplicate input ids`).toBe(ids.length)
    })
  })

  it('provider field is one of the allowed values', () => {
    agents.forEach((agent) => {
      if (agent.provider) {
        expect(VALID_PROVIDERS, `${agent.id} provider`).toContain(agent.provider)
      }
    })
  })

  it('createdAt follows ISO date format (YYYY-MM-DD) when present', () => {
    agents.forEach((agent) => {
      if (agent.createdAt) {
        expect(agent.createdAt, `${agent.id} createdAt format`).toMatch(ISO_DATE_RE)
      }
    })
  })

  it('input type is a known value when present', () => {
    agents.forEach((agent) => {
      agent.inputs.forEach((input) => {
        if (input.type) {
          expect(VALID_INPUT_TYPES, `${agent.id} input "${input.id}" type`).toContain(input.type)
        }
      })
    })
  })
})
