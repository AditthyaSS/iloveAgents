import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CostEstimator from './CostEstimator'

describe('CostEstimator progress', () => {
  it('exposes usage as a progressbar with text status', () => {
    render(<CostEstimator inputText={'x '.repeat(5000)} systemPrompt="" modelId="gpt-4o" />)
    const bar = screen.getByRole('progressbar', { name: /context window usage/i })
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
    expect(bar).toHaveAttribute('aria-valuetext', expect.stringMatching(/limit/))
  })
})
