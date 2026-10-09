import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createAutomation,
  removeAutomationKey,
  getAutomation,
  loadAutomations,
} from './automationsService'

vi.mock('./llmAdapter', () => ({
  runAgent: vi.fn(),
  streamAgent: vi.fn(),
}))

beforeEach(() => {
  localStorage.clear()
})

describe('automation key removal', () => {
  it('flips hasKey so the engine stops retrying', async () => {
    const created = await createAutomation({
      agentId: 'a1',
      agentName: 'A',
      category: 'General',
      provider: 'openai',
      model: 'gpt-4o-mini',
      schedule: 'daily',
      inputs: {},
      systemPrompt: 'sys',
      apiKey: 'sk-test',
      emailNotification: false,
      notificationEmail: '',
    })
    expect(getAutomation(created.id).hasKey).toBe(true)
    removeAutomationKey(created.id)
    expect(getAutomation(created.id).hasKey).toBe(false)
    expect(loadAutomations().find((a) => a.id === created.id).hasKey).toBe(false)
  })
})
