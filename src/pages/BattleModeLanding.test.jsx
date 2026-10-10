import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BattleModeLanding from './BattleModeLanding'

describe('BattleModeLanding providers', () => {
  it('presents all four providers', () => {
    render(
      <MemoryRouter>
        <BattleModeLanding />
      </MemoryRouter>
    )
    for (const name of ['GPT-4o', 'Claude', 'Gemini', 'OpenRouter']) {
      expect(screen.getByText(name, { exact: true })).toBeInTheDocument()
    }
    expect(screen.getByText(/four AI providers against each other/i)).toBeInTheDocument()
  })
})
