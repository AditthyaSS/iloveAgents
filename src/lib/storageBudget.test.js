import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { truncateStoredText, MAX_STORED_OUTPUT_CHARS, MAX_STORED_RUNS } from './storageBudget'
import { useHistory } from './useHistory'
import { saveRuns, loadRuns } from './automationsService'
import { saveCollections } from './useCollections'

beforeEach(() => {
  localStorage.clear()
})

describe('storage budget', () => {
  it('truncates oversized text with a marker', () => {
    const big = 'x'.repeat(MAX_STORED_OUTPUT_CHARS + 10)
    const out = truncateStoredText(big)
    expect(out.length).toBeLessThan(MAX_STORED_OUTPUT_CHARS + 100)
    expect(out.startsWith('x'.repeat(100))).toBe(true)
    expect(out).toContain('truncated')
    expect(truncateStoredText('small')).toBe('small')
    expect(truncateStoredText(undefined)).toBeUndefined()
  })

  it('history stores truncated outputs', () => {
    const { result } = renderHook(() => useHistory())
    act(() => {
      result.current.saveRun({
        agentId: 'a',
        agentName: 'A',
        inputs: {},
        output: 'y'.repeat(MAX_STORED_OUTPUT_CHARS + 100),
        provider: 'openai',
      })
    })
    const stored = JSON.parse(localStorage.getItem('iloveAgents_history'))
    expect(stored).toHaveLength(1)
    expect(stored[0].output.length).toBeLessThan(MAX_STORED_OUTPUT_CHARS + 100)
    expect(stored[0].output).toContain('truncated')
  })

  it('automation runs are capped', () => {
    const runs = Array.from({ length: MAX_STORED_RUNS + 20 }, (_, i) => ({ id: `r${i}` }))
    saveRuns(runs)
    expect(loadRuns()).toHaveLength(MAX_STORED_RUNS)
  })

  it('collection saves report quota failure instead of throwing', () => {
    const orig = Storage.prototype.setItem
    Storage.prototype.setItem = () => {
      const err = new Error('full')
      err.name = 'QuotaExceededError'
      throw err
    }
    try {
      expect(saveCollections([])).toBe(false)
    } finally {
      Storage.prototype.setItem = orig
    }
  })
})
