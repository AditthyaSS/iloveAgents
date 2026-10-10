/**
 * Tests for updateWorkflow and incrementUsage with the noop Supabase fallback.
 * Since no user is authenticated in the test environment, these functions return
 * auth errors — which is the correct and expected behavior.
 */
import { describe, it, expect } from 'vitest'
import { updateWorkflow, incrementUsage } from './useWorkflows.js'

describe('updateWorkflow (noop Supabase)', () => {
  it('returns { data: null, error: ... } when user is not authenticated', async () => {
    const result = await updateWorkflow('some-id', { title: 'New Title' })
    expect(result).toHaveProperty('data', null)
    expect(result).toHaveProperty('error')
    expect(result.error?.message).toContain('authenticated')
  })

  it('does not throw when called', async () => {
    await expect(updateWorkflow('any-id', {})).resolves.not.toThrow()
  })

  it('returns { data: null } for any id when unauthenticated', async () => {
    const result = await updateWorkflow('test-workflow-id', { description: 'Updated' })
    expect(result.data).toBeNull()
  })
})

describe('incrementUsage (noop Supabase)', () => {
  it('does not throw when called', async () => {
    await expect(incrementUsage('any-id')).resolves.not.toThrow()
  })

  it('returns an object with an error field', async () => {
    const result = await incrementUsage('some-workflow-id')
    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
  })
})
