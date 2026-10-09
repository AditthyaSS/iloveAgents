import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CharCounter from './CharCounter'

describe('CharCounter live region', () => {
  it('announces counts and warns near the limit', () => {
    const { rerender } = render(<CharCounter value="abc" maxLength={100} />)
    expect(screen.getByRole('status')).toHaveTextContent('3 / 100 characters')
    rerender(<CharCounter value={'x'.repeat(95)} maxLength={100} />)
    expect(screen.getByRole('status')).toHaveTextContent(/near limit/)
  })
})
