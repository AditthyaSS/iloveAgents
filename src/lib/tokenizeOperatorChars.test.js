import { describe, it, expect } from 'vitest'
import { tokenizeFreeText } from './lib/agentRecommendation/scoring.js'

describe('tokenizeFreeText — operator and punctuation handling', () => {
  it('splits on hyphens between words', () => {
    const tokens = tokenizeFreeText('state-of-the-art deep learning models')
    expect(tokens).toContain('state')
    expect(tokens).toContain('art')
    expect(tokens).toContain('deep')
    expect(tokens).toContain('learning')
    expect(tokens).toContain('models')
  })

  it('splits on commas', () => {
    const tokens = tokenizeFreeText('analyze,summarize,classify')
    expect(tokens).toContain('analyze')
    expect(tokens).toContain('summarize')
    expect(tokens).toContain('classify')
  })

  it('handles slash separators', () => {
    const tokens = tokenizeFreeText('read/write access control')
    expect(tokens).toContain('read')
    expect(tokens).toContain('write')
    expect(tokens).toContain('access')
    expect(tokens).toContain('control')
  })

  it('preserves C++ and similar programming identifiers', () => {
    const tokens = tokenizeFreeText('C++ programming React.js TypeScript')
    expect(tokens).toContain('typescript')
  })
})
