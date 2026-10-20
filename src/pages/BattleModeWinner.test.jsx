import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
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

describe('BattleModeWinner', () => {
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

  it('renders victory celebration and action buttons', () => {
    setup({ color: 'yellow', label: 'GPT-4o' })
    expect(screen.getByText('Victory!')).toBeInTheDocument()
    expect(screen.getByText(/You chose/i)).toBeInTheDocument()
    expect(screen.getByText('Share Result')).toBeInTheDocument()
    expect(screen.getByText('Copy Output')).toBeInTheDocument()
    expect(screen.getByText('Run Again')).toBeInTheDocument()
    expect(screen.getByText('Back to Agents')).toBeInTheDocument()
  })

  it('copies share text when Share Result is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue()
    Object.assign(navigator, {
      clipboard: { writeText },
    })

    setup({ color: 'blue', label: 'Claude' })
    const shareBtn = screen.getByText('Share Result')
    await act(async () => {
      fireEvent.click(shareBtn)
    })

    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('Battle Mode Winner: Claude')
    )
  })
})
