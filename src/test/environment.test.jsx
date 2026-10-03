import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

/**
 * These assertions document what vitest.config.js promises: every test runs in a
 * jsdom environment with src/test/setup.js loaded.
 *
 * They exist because a regression in that setup does not fail where the mistake
 * is. Removing the `environment: 'jsdom'` line, dropping the setup file, or
 * losing the jsdom dependency surfaces as a confusing "document is not defined"
 * or "Cannot find dependency 'jsdom'" error inside some unrelated component
 * test, which takes a while to trace back.
 */
describe('test environment', () => {
  it('provides the browser globals the components rely on', () => {
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
    expect(typeof localStorage).toBe('object')
    expect(typeof sessionStorage).toBe('object')
  })

  it('renders a React component and lets the result be queried from the DOM', () => {
    render(<p>rendered by react</p>)

    expect(screen.getByText('rendered by react')).toBeInTheDocument()
  })

  it('has the jest-dom matchers registered by the setup file', () => {
    // toBeDisabled is provided by @testing-library/jest-dom, which setup.js
    // imports. A bare truthy assertion would not notice if it stopped loading.
    render(<button disabled>Save</button>)

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('reflects DOM changes immediately, with no async wrapper needed', () => {
    const host = document.createElement('div')
    host.textContent = 'attached'
    document.body.appendChild(host)

    expect(screen.getByText('attached')).toBeInTheDocument()

    host.remove()
    expect(screen.queryByText('attached')).not.toBeInTheDocument()
  })
})
