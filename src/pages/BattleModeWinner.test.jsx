import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import BattleModeWinner from './BattleModeWinner'

function setup(provider) {
  return render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/battle/winner',
          state: {
            provider,
            content: 'Winning text',
            duration: 1200,
            agentName: 'Test Agent',
          },
        },
      ]}
    >
      <Routes>
        <Route path="/battle/winner" element={<BattleModeWinner />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('BattleModeWinner theme', () => {
  it('themes the openrouter winner teal instead of yellow', () => {
    const { container } = setup({ color: 'teal', label: 'OpenRouter' })
    expect(screen.getByText('OpenRouter')).toBeInTheDocument()
    expect(container.querySelector('.text-teal-400')).not.toBeNull()
    expect(container.querySelector('.text-yellow-400')).toBeNull()
  })

  it('keeps the openai winner yellow', () => {
    const { container } = setup({ color: 'yellow', label: 'GPT-4o' })
    expect(container.querySelector('.text-yellow-400')).not.toBeNull()
  })
})
