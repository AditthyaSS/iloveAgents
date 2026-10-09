import { describe, it, expect } from 'vitest'
import { tokenEstimate } from './useTokenCounter'

describe('tokenEstimate whitespace', () => {
  it('does not charge per whitespace character', () => {
    const single = tokenEstimate('hello world')
    const padded = tokenEstimate('hello   world')
    const newlines = tokenEstimate('hello\n\n\nworld')
    expect(padded).toBe(single)
    expect(newlines).toBe(single)
    expect(tokenEstimate('')).toBe(0)
    expect(tokenEstimate('   ')).toBe(0)
  })
})
