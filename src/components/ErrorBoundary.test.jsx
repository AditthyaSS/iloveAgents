import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './ErrorBoundary'

function Boom() {
  throw new Error('kaboom detail')
}

function MaybeBoom({ shouldThrow }) {
  if (shouldThrow) throw new Error('conditional boom')
  return <div>recovered content</div>
}

function setup(ui, resetKeys) {
  return render(
    <MemoryRouter initialEntries={['/a']}>
      <Routes>
        <Route
          path="/a"
          element={
            <ErrorBoundary resetKeys={resetKeys} title="Page broke" description="Try again soon." showDetails={false}>
              {ui}
            </ErrorBoundary>
          }
        />
        <Route path="/b" element={<div>safe page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ErrorBoundary route behavior', () => {
  it('shows custom copy without leaking error details', () => {
    setup(<Boom />)
    expect(screen.getByText('Page broke')).toBeInTheDocument()
    expect(screen.queryByText(/kaboom/)).toBeNull()
  })

  it('recovers via Try Again', () => {
    const { rerender } = setup(<MaybeBoom shouldThrow />)
    expect(screen.getByText('Page broke')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(screen.getByText('Page broke')).toBeInTheDocument()
    rerender(
      <MemoryRouter initialEntries={['/a']}>
        <Routes>
          <Route
            path="/a"
            element={
              <ErrorBoundary title="Page broke" description="Try again soon." showDetails={false}>
                <MaybeBoom shouldThrow={false} />
              </ErrorBoundary>
            }
          />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Page broke')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(screen.getByText('recovered content')).toBeInTheDocument()
  })

  it('resets when reset keys change', () => {
    const { rerender } = render(
      <ErrorBoundary resetKeys={['/a']} title="Page broke" description="Try again soon." showDetails={false}>
        <MaybeBoom shouldThrow />
      </ErrorBoundary>
    )
    expect(screen.getByText('Page broke')).toBeInTheDocument()
    rerender(
      <ErrorBoundary resetKeys={['/b']} title="Page broke" description="Try again soon." showDetails={false}>
        <div>safe page</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('safe page')).toBeInTheDocument()
  })
})
