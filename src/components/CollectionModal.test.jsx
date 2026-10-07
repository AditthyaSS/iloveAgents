import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CollectionModal from './CollectionModal'

describe('CollectionModal dialog', () => {
  it('names the dialog, announces errors, and closes on Escape', () => {
    const onClose = vi.fn()
    render(
      <CollectionModal
        title="New collection"
        value=""
        onChange={vi.fn()}
        error="Name is taken"
        onClose={onClose}
        onSubmit={(e) => e.preventDefault()}
      />
    )
    expect(screen.getByRole('dialog', { name: /new collection/i })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Name is taken')
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
