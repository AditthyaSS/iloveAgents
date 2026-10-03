import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '../../api/send-automation-email'

function mockRes(status = 200, body = {}) {
  const res = { statusCode: null, payload: null, headers: {} }
  res.status = vi.fn((code) => {
    res.statusCode = code
    return res
  })
  res.json = vi.fn((data) => {
    res.payload = data
    return res
  })
  res.setHeader = vi.fn((k, v) => {
    res.headers[k] = v
  })
  return res
}

describe('POST /api/send-automation-email', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.RESEND_API_KEY = 're_test_secret'
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'email_123' }) })
    )
  })

  it('sends through Resend using the server key and returns ok', async () => {
    const req = {
      method: 'POST',
      body: {
        to: 'user@example.com',
        subject: 'report',
        automationName: 'Daily Digest',
        agentName: 'Some Agent',
        output: 'hello',
        status: 'success',
      },
    }
    const res = mockRes()

    await handler(req, res)

    expect(res.statusCode).toBe(200)
    expect(res.payload.ok).toBe(true)
    const [url, init] = globalThis.fetch.mock.calls[0]
    expect(url).toBe('https://api.resend.com/emails')
    expect(init.headers.Authorization).toBe('Bearer re_test_secret')
  })

  it('rejects non-POST methods', async () => {
    const res = mockRes()
    await handler({ method: 'GET', body: {} }, res)
    expect(res.statusCode).toBe(405)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('returns 503 without leaking anything when the key is missing', async () => {
    delete process.env.RESEND_API_KEY
    const res = mockRes()
    await handler({ method: 'POST', body: { to: 'user@example.com', subject: 'x' } }, res)
    expect(res.statusCode).toBe(503)
    expect(globalThis.fetch).not.toHaveBeenCalled()
    expect(JSON.stringify(res.payload)).not.toContain('re_test_secret')
  })

  it('returns 400 for missing or invalid recipient', async () => {
    const bad = mockRes()
    await handler({ method: 'POST', body: { to: '', subject: 'x' } }, bad)
    expect(bad.statusCode).toBe(400)

    const invalid = mockRes()
    await handler({ method: 'POST', body: { to: 'not-an-email', subject: 'x' } }, invalid)
    expect(invalid.statusCode).toBe(400)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('never echoes the api key back in responses', async () => {
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: false }))
    const res = mockRes()
    await handler(
      { method: 'POST', body: { to: 'user@example.com', subject: 'x', output: 'y' } },
      res
    )
    expect(res.statusCode).toBe(502)
    expect(JSON.stringify(res.payload)).not.toContain('re_test_secret')
  })
})
