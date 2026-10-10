import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CustomSelect from './CustomSelect'

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
]

describe('CustomSelect labelling', () => {
  it('renders the label and names the trigger once', () => {
    render(<CustomSelect value="a" onChange={vi.fn()} options={options} label="Model" />)
    expect(screen.getByText('Model')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Model' })).toBeInTheDocument()
  })

  it('falls back to the selection without duplication', () => {
    render(<CustomSelect value="b" onChange={vi.fn()} options={options} />)
    expect(screen.getByRole('button', { name: 'Beta' })).toBeInTheDocument()
  })

  it('selects with the keyboard', () => {
    const onChange = vi.fn()
    render(<CustomSelect value="a" onChange={onChange} options={options} label="Model" />)
    const trigger = screen.getByRole('button', { name: 'Model' })
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.keyDown(screen.getByRole('option', { name: 'Alpha' }), { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('a')
  })
})
