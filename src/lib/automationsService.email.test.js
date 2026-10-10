import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('sendResendNotification (server-side dispatch)', () => {
  let automations

  beforeEach(async () => {
    vi.resetModules()
    localStorage.clear()
    automations = await import('./automationsService')
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: true }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('posts only the email payload to the server endpoint', async () => {
    await automations.sendResendNotification({
      to: 'user@example.com',
      automationName: 'Daily Digest',
      agentName: 'Blog Post SEO Optimizer',
      output: 'hello world',
      status: 'success',
      duration: 1200,
      error: '',
    })

    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    const [url, init] = globalThis.fetch.mock.calls[0]
    expect(url).toBe('/api/send-automation-email')
    expect(init.method).toBe('POST')
    const payload = JSON.parse(init.body)
    expect(payload.to).toBe('user@example.com')
    expect(payload).not.toHaveProperty('apiKey')
    expect(JSON.stringify(payload)).not.toContain('re_')
    // never calls Resend directly from the browser
    expect(url).not.toContain('api.resend.com')
    expect(JSON.stringify(init.headers)).not.toContain('Bearer')
  })

  it('still records the local email log when delivery works', async () => {
    await automations.sendResendNotification({
      to: 'user@example.com',
      automationName: 'Daily Digest',
      agentName: 'Some Agent',
      output: 'some output text here',
      status: 'success',
      duration: 500,
      error: '',
    })

    const logs = automations.getEmailLogs()
    expect(logs).toHaveLength(1)
    expect(logs[0].to).toBe('user@example.com')
    expect(logs[0].status).toBe('Delivered')
  })

  it('keeps the local log even when the server endpoint fails', async () => {
    globalThis.fetch = vi.fn(() => Promise.reject(new Error('network down')))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const entry = await automations.sendResendNotification({
      to: 'user@example.com',
      automationName: 'Daily Digest',
      agentName: 'Some Agent',
      output: 'some output text here',
      status: 'failed',
      duration: 500,
      error: 'boom',
    })

    expect(entry.status).toBe('Failed')
    expect(automations.getEmailLogs()).toHaveLength(1)
    warn.mockRestore()
  })

  it('does not call the server when there is no recipient', async () => {
    await automations.sendResendNotification({
      to: '',
      automationName: 'Daily Digest',
      agentName: 'Some Agent',
      output: 'x',
      status: 'success',
      duration: 100,
      error: '',
    })

    expect(globalThis.fetch).not.toHaveBeenCalled()
    // log entry is still recorded
    expect(automations.getEmailLogs()).toHaveLength(1)
  })
})
