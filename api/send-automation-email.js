/**
 * Vercel Serverless Function: POST /api/send-automation-email
 *
 * Sends a scheduled-automation report email through Resend without ever
 * exposing the Resend API key to the browser. The key is read from the
 * server-only RESEND_API_KEY environment variable.
 */

const MAX_OUTPUT_LENGTH = 8000
const MAX_FIELD_LENGTH = 500

function asText(value, max = MAX_FIELD_LENGTH) {
  if (typeof value !== 'string') return ''
  return value.slice(0, max)
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed. Use POST.' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return res.status(503).json({
      error:
        'Email service is not configured. Set the RESEND_API_KEY environment variable on the server.',
    })
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {}
  const to = asText(body.to)
  const subject = asText(body.subject)
  const automationName = asText(body.automationName)
  const agentName = asText(body.agentName)
  const status = body.status === 'failed' ? 'failed' : 'success'
  const output = asText(body.output, MAX_OUTPUT_LENGTH)
  const error = asText(body.error, MAX_OUTPUT_LENGTH)

  if (!to || !subject) {
    return res.status(400).json({ error: 'Missing required fields: to and subject are required.' })
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    return res.status(400).json({ error: 'Invalid recipient email address.' })
  }

  const from = process.env.RESEND_FROM_EMAIL || 'Open Agents Hub <automations@openagentshub.dev>'
  const safeOutput = escapeHtml(output || error || 'No output generated.')

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html: [
          '<div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">',
          '<div style="border-bottom: 2px solid #6366f1; padding-bottom: 12px; margin-bottom: 20px;">',
          '<h2 style="margin: 0; color: #4338ca;">Open Agents Hub Autopilot Report</h2>',
          `<p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Automation: <strong>${escapeHtml(automationName || 'Scheduled automation')}</strong>${agentName ? ` (${escapeHtml(agentName)})` : ''}</p>`,
          '</div>',
          `<p style="font-size: 13px;"><strong>Status:</strong> ${status.toUpperCase()}</p>`,
          `<p style="font-size: 13px;"><strong>Execution Time:</strong> ${escapeHtml(new Date().toLocaleString())}</p>`,
          `<div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${safeOutput}</div>`,
          '</div>',
        ].join(''),
      }),
    })

    if (!response.ok) {
      return res.status(502).json({ error: 'Email provider rejected the request.' })
    }

    const data = await response.json().catch(() => ({}))
    return res.status(200).json({ ok: true, id: data.id || null })
  } catch {
    return res.status(502).json({ error: 'Could not reach the email provider. Please try again.' })
  }
}
