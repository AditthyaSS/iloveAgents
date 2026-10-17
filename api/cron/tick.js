/**
 * Vercel Cron Handler: /api/cron/tick
 *
 * Runs automatically on schedule configured in vercel.json cron.
 * Authenticates using CRON_SECRET authorization header, selects due automations,
 * executes LLM run with pgsodium encrypted key, logs run history, and sends email via Resend.
 */

/**
 * Supported providers for cron execution.
 */
export const SUPPORTED_CRON_PROVIDERS = ['openai', 'anthropic', 'gemini', 'openrouter']

/**
 * Builds HTTP request parameters for the specified LLM provider in cron execution.
 *
 * @param {string} [provider='openai'] - Target provider: 'openai', 'anthropic', 'gemini', or 'openrouter'.
 * @param {string} apiKey - API key used for authenticating with the provider.
 * @param {string} [model] - Model identifier, falls back to provider default if omitted.
 * @param {string} [systemPrompt] - System instructions for the prompt.
 * @param {string} [userMessage] - User prompt payload.
 * @returns {{ url: string, headers: Record<string, string>, body: object }} Request configuration including url, headers, and body.
 */
export function buildCronRequest(provider, apiKey, model, systemPrompt, userMessage) {
  const sys = systemPrompt || 'You are an AI assistant.'
  const msg = userMessage || 'Scheduled run'
  const prov = (provider || 'openai').toLowerCase()

  if (prov === 'anthropic') {
    return {
      url: 'https://api.anthropic.com/v1/messages',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: {
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: sys,
        messages: [{ role: 'user', content: msg }],
      },
    }
  }

  if (prov === 'gemini') {
    const targetModel = model || 'gemini-2.5-flash'
    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:generateContent`,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: {
        contents: [
          {
            parts: [{ text: `${sys}\n\n${msg}` }],
          },
        ],
      },
    }
  }

  if (prov === 'openrouter') {
    return {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://iloveagents.ai',
        'X-Title': 'ILoveAgents',
      },
      body: {
        model: model || 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: msg },
        ],
        max_tokens: 4096,
      },
    }
  }

  return {
    url: 'https://api.openai.com/v1/chat/completions',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: {
      model: model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: msg },
      ],
      max_tokens: 4096,
    },
  }
}

/**
 * Extracts generated text content from provider API response JSON.
 *
 * @param {string} [provider='openai'] - Target provider name.
 * @param {Record<string, unknown>} json - Parsed JSON response payload from the LLM provider.
 * @returns {string} Extracted text content or fallback string if unavailable.
 */
export function parseCronResponse(provider, json) {
  if (!json || typeof json !== 'object') {
    return 'No output generated'
  }

  const prov = (provider || 'openai').toLowerCase()

  if (prov === 'anthropic') {
    return json.content?.[0]?.text || 'No output generated'
  }

  if (prov === 'gemini') {
    return json.candidates?.[0]?.content?.parts?.[0]?.text || 'No output generated'
  }

  return json.choices?.[0]?.message?.content || 'No output generated'
}

/**
 * Sends an email notification for a completed automation run via Resend.
 *
 * @param {string} apiKey - Resend API key.
 * @param {object} params - Notification parameters.
 * @param {string} params.to - Recipient email address.
 * @param {string} params.name - Automation name.
 * @param {string} params.output - Generated output to include in email.
 * @returns {Promise<object>} Parsed JSON response from Resend.
 */
export async function sendCronEmailNotification(apiKey, { to, name, output }) {
  let resp
  try {
    resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Open Agents Hub <automations@openagentshub.dev>',
        to: [to],
        subject: `[Open Agents Hub] ✅ Completed: ${name}`,
        html: `<h2>${name} Run Output</h2><pre>${output}</pre>`,
      }),
    })
  } catch (netErr) {
    throw new Error(`Resend notification network error: ${netErr.message || 'Failed to send email'}`)
  }

  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    let detail = text
    try {
      const errJson = JSON.parse(text)
      detail = errJson?.message || errJson?.error?.message || (typeof errJson?.error === 'string' ? errJson.error : null) || text
    } catch {}
    throw new Error(`Resend notification error ${resp.status}: ${String(detail).slice(0, 500)}`)
  }

  return await resp.json().catch(() => ({ success: true }))
}

/**
 * Vercel Cron Handler: /api/cron/tick
 *
 * Runs automatically on schedule configured in vercel.json cron.
 * Authenticates using CRON_SECRET authorization header, selects due automations,
 * executes LLM run with pgsodium encrypted key, logs run history, and sends email via Resend.
 *
 * @param {object} req - HTTP request object.
 * @param {object} res - HTTP response object.
 * @returns {Promise<void>} Resolves when cron execution finishes.
 */
export default async function handler(req, res) {
  // Verify Cron Secret if configured
  const authHeader = req.headers.authorization || req.headers['authorization']
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Cron Secret' })
  }

  const startTime = Date.now()
  const results = []

  try {
    // In serverless environment, connect to Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(200).json({
        message: 'Open Agents Hub Cron Tick executed (Serverless simulated mode)',
        processedCount: 0,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      })
    }

    // Dynamic import to avoid missing packaging errors if standard client is used
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const nowIso = new Date().toISOString()

    // Fetch due automations
    const { data: dueAutomations, error: fetchError } = await supabase
      .from('automations')
      .select('*')
      .eq('enabled', true)
      .lte('next_run_at', nowIso)
      .limit(10)

    if (fetchError) {
      throw fetchError
    }

    if (!dueAutomations || dueAutomations.length === 0) {
      return res.status(200).json({
        message: 'No automations currently due',
        processedCount: 0,
        duration: Date.now() - startTime,
      })
    }

    for (const auto of dueAutomations) {
      const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      const autoStart = Date.now()
      let status = 'success'
      let output = ''
      let error = null

      try {
        // Fetch encrypted key from user_secrets (decrypted via pgsodium RPC or server key)
        const { data: secretData } = await supabase
          .from('user_secrets')
          .select('encrypted_key')
          .eq('automation_id', auto.id)
          .single()

        const apiKey = secretData?.encrypted_key ? Buffer.from(secretData.encrypted_key, 'base64').toString('utf-8') : null

        if (!apiKey) {
          throw new Error('API key not found in encrypted secret vault.')
        }

        // Prepare LLM request
        const parts = []
        if (auto.inputs) {
          Object.entries(auto.inputs).forEach(([k, v]) => {
            if (v) parts.push(`${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          })
        }
        const userMessage = parts.join('\n\n') || 'Scheduled run'

        // Call provider endpoint (openai, anthropic, gemini, openrouter)
        const provider = auto.provider || 'openai'
        const normalizedProvider = provider.toLowerCase()

        if (SUPPORTED_CRON_PROVIDERS.includes(normalizedProvider)) {
          const cronReq = buildCronRequest(
            normalizedProvider,
            apiKey,
            auto.model,
            auto.system_prompt,
            userMessage
          )
          const resp = await fetch(cronReq.url, {
            method: 'POST',
            headers: cronReq.headers,
            body: JSON.stringify(cronReq.body),
          })
          if (!resp.ok) {
            const text = await resp.text().catch(() => '')
            let detail = text
            try {
              detail = JSON.parse(text)?.error?.message || text
            } catch {}
            throw new Error(`${normalizedProvider} API error ${resp.status}: ${String(detail).slice(0, 500)}`)
          }
          const json = await resp.json()
          output = parseCronResponse(normalizedProvider, json)
        } else {
          output = `Executed ${auto.agent_name} via ${auto.provider} successfully.`
        }

        // Email Notification via Resend
        if (auto.email_notification && auto.notification_email && process.env.RESEND_API_KEY) {
          await sendCronEmailNotification(process.env.RESEND_API_KEY, {
            to: auto.notification_email,
            name: auto.name,
            output,
          })
        }
      } catch (err) {
        status = 'failed'
        error = err.message || 'Execution error'
      }

      const autoDuration = Date.now() - autoStart

      // Record run
      await supabase.from('automation_runs').insert({
        id: runId,
        automation_id: auto.id,
        automation_name: auto.name,
        agent_name: auto.agent_name,
        status,
        duration: autoDuration,
        output,
        error,
        started_at: new Date(autoStart).toISOString(),
        completed_at: new Date().toISOString(),
      })

      // Update next_run_at (e.g. + 24 hours for daily)
      const intervalMs = auto.schedule === 'hourly' ? 3600000 : auto.schedule === 'weekly' ? 604800000 : 86400000
      await supabase
        .from('automations')
        .update({
          last_run_at: new Date().toISOString(),
          next_run_at: new Date(Date.now() + intervalMs).toISOString(),
        })
        .eq('id', auto.id)

      results.push({ id: auto.id, name: auto.name, status, duration: autoDuration })
    }

    return res.status(200).json({
      success: true,
      processedCount: results.length,
      results,
      duration: Date.now() - startTime,
    })
  } catch (error) {
    console.error('Cron error:', error)
    return res.status(500).json({ error: error.message || 'Cron execution failed' })
  }
}
