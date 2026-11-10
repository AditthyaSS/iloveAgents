import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CollectionPicker from './CollectionPicker'

describe('CollectionPicker dialog', () => {
  it('exposes a labelled dialog and closes on Escape', () => {
    const onClose = vi.fn()
    render(<CollectionPicker agentId="a1" onClose={onClose} />)
    expect(screen.getByRole('dialog', { name: /Add to collection/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/New collection name/i)).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
