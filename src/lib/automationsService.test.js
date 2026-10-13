// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const storage = new Map()
const mockLocalStorage = {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, val) => storage.set(key, String(val)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear(),
}

globalThis.localStorage = mockLocalStorage

import { sendResendNotification, getEmailLogs } from './automationsService'

describe('sendResendNotification', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    storage.clear()
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    global.fetch = originalFetch
    storage.clear()
    vi.unstubAllEnvs()
  })

  it('throws an error if recipient email is missing', async () => {
    await expect(
      sendResendNotification({
        to: '',
        automationName: 'Test Automation',
        agentName: 'Test Agent',
        output: 'Hello',
        status: 'success',
        duration: 1000,
      })
    ).rejects.toThrow('Recipient email address is required')
  })

  it('records Delivered log in simulation mode when VITE_RESEND_API_KEY is not set', async () => {
    delete import.meta.env.VITE_RESEND_API_KEY

    const log = await sendResendNotification({
      to: 'user@example.com',
      automationName: 'Simulation Automation',
      agentName: 'Test Agent',
      output: 'Simulated output',
      status: 'success',
      duration: 1500,
    })

    expect(log.status).toBe('Delivered')
    expect(log.to).toBe('user@example.com')
    expect(log.subject).toContain('Completed: Simulation Automation')

    const savedLogs = getEmailLogs()
    expect(savedLogs).toHaveLength(1)
    expect(savedLogs[0].status).toBe('Delivered')
    expect(savedLogs[0].to).toBe('user@example.com')
  })

  it('dispatches email to Resend and saves Delivered log on 200 OK', async () => {
    vi.stubEnv('VITE_RESEND_API_KEY', 're_valid_api_key')

    let capturedUrl = null
    let capturedOptions = null

    global.fetch = vi.fn().mockImplementation(async (url, options) => {
      capturedUrl = url
      capturedOptions = options
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: 'email_ok_123' }),
      }
    })

    const log = await sendResendNotification({
      to: 'client@example.com',
      automationName: 'Live Report',
      agentName: 'Report Agent',
      output: 'Report content here',
      status: 'success',
      duration: 2000,
    })

    expect(capturedUrl).toBe('https://api.resend.com/emails')
    expect(capturedOptions.method).toBe('POST')
    expect(capturedOptions.headers.Authorization).toBe('Bearer re_valid_api_key')
    const body = JSON.parse(capturedOptions.body)
    expect(body.to).toEqual(['client@example.com'])
    expect(log.status).toBe('Delivered')

    const savedLogs = getEmailLogs()
    expect(savedLogs).toHaveLength(1)
    expect(savedLogs[0].status).toBe('Delivered')
  })

  it('throws and records Failed log when Resend responds with HTTP 401', async () => {
    vi.stubEnv('VITE_RESEND_API_KEY', 're_invalid_key')

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ message: 'API key is invalid' }),
    })

    await expect(
      sendResendNotification({
        to: 'client@example.com',
        automationName: 'Live Report',
        agentName: 'Report Agent',
        output: 'Report content',
        status: 'success',
        duration: 1000,
      })
    ).rejects.toThrow('Resend notification error 401: API key is invalid')

    const savedLogs = getEmailLogs()
    expect(savedLogs).toHaveLength(1)
    expect(savedLogs[0].status).toBe('Failed')
    expect(savedLogs[0].error).toContain('API key is invalid')
  })

  it('throws and records Failed log when Resend responds with HTTP 429 rate limit', async () => {
    vi.stubEnv('VITE_RESEND_API_KEY', 're_rate_limited_key')

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => JSON.stringify({ message: 'Rate limit exceeded' }),
    })

    await expect(
      sendResendNotification({
        to: 'client@example.com',
        automationName: 'Live Report',
        agentName: 'Report Agent',
        output: 'Report content',
        status: 'success',
        duration: 1000,
      })
    ).rejects.toThrow('Resend notification error 429: Rate limit exceeded')

    const savedLogs = getEmailLogs()
    expect(savedLogs).toHaveLength(1)
    expect(savedLogs[0].status).toBe('Failed')
    expect(savedLogs[0].error).toContain('Rate limit exceeded')
  })

  it('throws and records Failed log when Resend dispatch encounters network error', async () => {
    vi.stubEnv('VITE_RESEND_API_KEY', 're_key')

    global.fetch = vi.fn().mockRejectedValue(new Error('Connection dropped'))

    await expect(
      sendResendNotification({
        to: 'client@example.com',
        automationName: 'Live Report',
        agentName: 'Report Agent',
        output: 'Report content',
        status: 'success',
        duration: 1000,
      })
    ).rejects.toThrow('Resend notification network error: Connection dropped')

    const savedLogs = getEmailLogs()
    expect(savedLogs).toHaveLength(1)
    expect(savedLogs[0].status).toBe('Failed')
    expect(savedLogs[0].error).toBe('Connection dropped')
  })

  it('handles non-JSON error responses from Resend gracefully', async () => {
    vi.stubEnv('VITE_RESEND_API_KEY', 're_key')

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      text: async () => 'Service Unavailable',
    })

    await expect(
      sendResendNotification({
        to: 'client@example.com',
        automationName: 'Live Report',
        agentName: 'Report Agent',
        output: 'Report content',
        status: 'success',
        duration: 1000,
      })
    ).rejects.toThrow('Resend notification error 503: Service Unavailable')

    const savedLogs = getEmailLogs()
    expect(savedLogs).toHaveLength(1)
    expect(savedLogs[0].status).toBe('Failed')
    expect(savedLogs[0].error).toContain('Service Unavailable')
  })
})
