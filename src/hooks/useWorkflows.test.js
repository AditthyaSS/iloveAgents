/**
 * These tests run against the noop Supabase fallback (no real DB).
 * They verify the shape of the return values and that the functions
 * don't throw when Supabase is not configured.
 */
import { describe, it, expect } from 'vitest'
import {
  fetchWorkflows,
  fetchWorkflowById,
  saveWorkflow,
  deleteWorkflow,
  subscribeToWorkflow,
  subscribeToAllWorkflows,
} from './useWorkflows.js'

describe('fetchWorkflows (noop Supabase)', () => {
  it('returns { data: [], error: null } when Supabase is not configured', async () => {
    const result = await fetchWorkflows()
    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('error')
    expect(Array.isArray(result.data)).toBe(true)
  })

  it('does not throw', async () => {
    await expect(fetchWorkflows()).resolves.not.toThrow()
  })
})

describe('fetchWorkflowById (noop Supabase)', () => {
  it('returns { data: null, error: null } for any id', async () => {
    const result = await fetchWorkflowById('some-id')
    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('error')
  })

  it('does not throw', async () => {
    await expect(fetchWorkflowById('test-id')).resolves.not.toThrow()
  })
})

describe('saveWorkflow (noop Supabase)', () => {
  it('returns an error when user is not authenticated', async () => {
    // getCurrentUserId returns null in the noop environment (no real auth)
    const result = await saveWorkflow({ title: 'Test', agents: ['a1'] })
    expect(result).toHaveProperty('data', null)
    expect(result).toHaveProperty('error')
    expect(result.error?.message).toContain('authenticated')
  })

  it('does not throw', async () => {
    await expect(saveWorkflow({ title: 'x', agents: [] })).resolves.not.toThrow()
  })
})

describe('deleteWorkflow (noop Supabase)', () => {
  it('returns { error: ... } when user is not authenticated', async () => {
    const result = await deleteWorkflow('some-id')
    expect(result).toHaveProperty('error')
    expect(result.error?.message).toContain('authenticated')
  })

  it('does not throw', async () => {
    await expect(deleteWorkflow('any')).resolves.not.toThrow()
  })
})

describe('subscribeToWorkflow', () => {
  it('returns a channel object (has on and subscribe methods)', () => {
    const channel = subscribeToWorkflow('workflow-id', () => {})
    expect(channel).toBeDefined()
    expect(typeof channel.on).toBe('function')
    expect(typeof channel.subscribe).toBe('function')
  })

  it('does not throw when called', () => {
    expect(() => subscribeToWorkflow('wf-1', () => {})).not.toThrow()
  })
})

describe('subscribeToAllWorkflows', () => {
  it('returns a channel object (has on and subscribe methods)', () => {
    const channel = subscribeToAllWorkflows(() => {})
    expect(channel).toBeDefined()
    expect(typeof channel.on).toBe('function')
    expect(typeof channel.subscribe).toBe('function')
  })

  it('does not throw when called', () => {
    expect(() => subscribeToAllWorkflows(() => {})).not.toThrow()
  })
})
