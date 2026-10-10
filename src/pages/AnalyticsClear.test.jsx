import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AnalyticsPage from './AnalyticsPage'

describe('AnalyticsPage clear confirm', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem(
      'ila_analytics',
      JSON.stringify([
        { id: 'e1', agentId: 'a', agentName: 'A', provider: 'openai', model: 'm', duration: 10, timestamp: Date.now() },
      ])
    )
  })

  it('arms on first click and clears only on confirm', () => {
    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: /clear data/i }))
    expect(JSON.parse(localStorage.getItem('ila_analytics'))).toHaveLength(1)
    expect(screen.getByText(/clear all recorded data\?/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^confirm$/i }))
    expect(['[]', null]).toContain(localStorage.getItem('ila_analytics'))
  })
})
