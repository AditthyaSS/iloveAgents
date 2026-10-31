const MAX_REQUEST_BYTES = 64 * 1024
const MAX_OUTPUT_LENGTH = 48 * 1024
const MAX_DURATION_MS = 24 * 60 * 60 * 1000

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}

function getRequestHost(req) {
  const forwardedHost = req.headers['x-forwarded-host']
  return String(forwardedHost || req.headers.host || '')
    .split(',')[0]
    .trim()
    .toLowerCase()
}

function hasSameOrigin(req) {
  const origin = req.headers.origin
  const requestHost = getRequestHost(req)

  if (!origin || !requestHost) return false

  try {
    return new URL(origin).host.toLowerCase() === requestHost
  } catch {
    return false
  }
}

function validatePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null

  const { to, automationName, agentName, output = '', error = '', status, duration } = body
  if (
    typeof to !== 'string' ||
    to.length > 320 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim()) ||
    typeof automationName !== 'string' ||
    !automationName.trim() ||
    automationName.length > 200 ||
    typeof agentName !== 'string' ||
    !agentName.trim() ||
    agentName.length > 200 ||
    !['success', 'failed'].includes(status) ||
    !Number.isFinite(duration) ||
    duration < 0 ||
    duration > MAX_DURATION_MS ||
    typeof output !== 'string' ||
    typeof error !== 'string' ||
    output.length + error.length > MAX_OUTPUT_LENGTH
  ) {
    return null
  }

  return {
    to: to.trim(),
    automationName: automationName.trim(),
    agentName: agentName.trim(),
    output,
    error,
    status,
    duration,
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  if (!hasSameOrigin(req)) {
    return res.status(403).json({ error: 'Request origin is not allowed.' })
  }

  const contentLength = Number(req.headers['content-length'] || 0)
  if (contentLength > MAX_REQUEST_BYTES) {
    return res.status(413).json({ error: 'Email content is too large.' })
  }

  const payload = validatePayload(req.body)
  if (!payload) {
    return res.status(400).json({ error: 'Invalid email notification details.' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return res.status(503).json({
      error: 'Email delivery is not configured. Set RESEND_API_KEY on the server.',
    })
  }

  const subjectName = payload.automationName.replace(/[\u0000-\u001f\u007f]+/g, ' ').slice(0, 180)
  const safeAutomationName = escapeHtml(payload.automationName)
  const safeAgentName = escapeHtml(payload.agentName)
  const safeStatus = escapeHtml(payload.status.toUpperCase())
  const safeOutput = escapeHtml(payload.output || payload.error || 'No output generated.')
  const statusColor = payload.status === 'failed' ? '#ef4444' : '#10b981'
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
      <div style="border-bottom: 2px solid #6366f1; padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #4338ca;">Open Agents Hub Autopilot Report</h2>
        <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Automation: <strong>${safeAutomationName}</strong> (${safeAgentName})</p>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: 600;">${safeStatus}</span></p>
        <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Execution Time:</strong> ${escapeHtml(new Date().toLocaleString())}</p>
        <p style="margin: 0; font-size: 13px;"><strong>Duration:</strong> ${(payload.duration / 1000).toFixed(2)}s</p>
      </div>
      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #0f172a;">Agent Output</h3>
        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${safeOutput}</div>
      </div>
      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 30px;">
        Sent automatically by Open Agents Hub Scheduled Automations.
      </p>
    </div>
  `

  let resendResponse
  try {
    resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Open Agents Hub <automations@openagentshub.dev>',
        to: [payload.to],
        subject: `[Open Agents Hub] ${payload.status === 'failed' ? 'Failed' : 'Completed'}: ${subjectName}`,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    return res.status(502).json({ error: 'Email delivery failed. Please try again later.' })
  }

  if (!resendResponse.ok) {
    if (resendResponse.status === 401 || resendResponse.status === 403) {
      return res.status(503).json({
        error: 'Email delivery is not configured correctly. Check RESEND_API_KEY on the server.',
      })
    }
    return res.status(502).json({ error: 'Email delivery failed. Please try again later.' })
  }

  return res.status(200).json({ ok: true })
}
