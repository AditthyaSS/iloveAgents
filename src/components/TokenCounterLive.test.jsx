import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TokenCounter from './TokenCounter'

describe('TokenCounter live region', () => {
  it('announces the count and hides decoration', () => {
    const { container } = render(<TokenCounter value="hello world" modelId="gpt-4o" />)
    expect(screen.getByRole('status')).toHaveTextContent(/tokens/)
    expect(container.querySelector('svg[aria-hidden="true"]')).not.toBeNull()
  })
})
