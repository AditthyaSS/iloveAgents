import { describe, it, expect, vi } from 'vitest'
import { saveWorkflow, updateWorkflow } from './useWorkflows'

const updateCalls = []
const mockFrom = vi.fn(() => ({
  insert: vi.fn(() => ({
    select: vi.fn(() => ({
      single: vi.fn(async () => ({ data: { id: 'w1' }, error: null })),
    })),
  })),
  select: vi.fn(() => ({
    eq: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(async () => ({ data: { user_id: 'u1' }, error: null })),
      })),
      single: vi.fn(async () => ({ data: { user_id: 'u1' }, error: null })),
    })),
  })),
  update: vi.fn((payload) => {
    updateCalls.push(payload)
    return {
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(async () => ({ data: {}, error: null })),
          })),
        })),
      })),
    }
  }),
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'u1' } }, error: null })) },
    from: (...args) => mockFrom(...args),
  },
}))

describe('useWorkflows write guards', () => {
  it('honors private saves', async () => {
    const { error } = await saveWorkflow({ title: 'T', agents: ['a'], is_public: false })
    expect(error).toBeNull()
  })

  it('strips server-owned fields on update', async () => {
    await updateWorkflow('w1', {
      title: 'New',
      user_id: 'attacker',
      usage_count: 999,
      created_at: 'yesterday',
    })
    const payload = updateCalls[updateCalls.length - 1]
    expect(payload.title).toBe('New')
    expect(payload.user_id).toBeUndefined()
    expect(payload.usage_count).toBeUndefined()
    expect(payload.created_at).toBeUndefined()
  })
})
