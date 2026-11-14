
/**
 * Vercel Cron Handler: /api/cron/tick
 *
 * Executes scheduled automations, authenticates cron requests,
 * calls supported LLM providers, records execution history,
 * and sends email notifications through Resend.
 */

export const SUPPORTED_CRON_PROVIDERS = [
  'openai',
  'anthropic',
  'gemini',
  'openrouter',
]

/**
 * Build an HTTP request for the selected LLM provider.
 */
export function buildCronRequest(
  provider = 'openai',
  apiKey,
  model,
  systemPrompt,
  userMessage
) {
  if (!apiKey) {
    throw new Error('API key is required')
  }

  const prov = provider.toLowerCase()
  const sys = systemPrompt || 'You are an AI assistant.'
  const msg = userMessage || 'Scheduled run'

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

  if (prov === 'openai') {
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

  throw new Error(`Unsupported provider: ${prov}`)
}

/**
 * Extract generated text from provider responses.
 */
export function parseCronResponse(provider, json) {
  if (!json || typeof json !== 'object') {
    return 'No output generated'
  }

  const prov = (provider || 'openai').toLowerCase()

  if (prov === 'anthropic') {
    return (
      json.content?.find(item => item.type === 'text')?.text ||
      'No output generated'
    )
  }

  if (prov === 'gemini') {
    return (
      json.candidates?.[0]?.content?.parts
        ?.map(part => part.text || '')
        .join('') || 'No output generated'
    )
  }

  return (
    json.choices?.[0]?.message?.content ||
    'No output generated'
  )
}

/**
 * Send completion email using Resend.
 */
export async function sendCronEmailNotification(
  apiKey,
  { to, name, output }
) {
  if (!apiKey || !to) {
    throw new Error('Resend API key and recipient are required')
  }

  const escapeHtml = value =>
    String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[char])

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: 'Open Agents Hub <automations@openagentshub.dev>',
      to: [to],
      subject: `[Open Agents Hub] Completed: ${name}`,
      html: `<h2>${escapeHtml(name)} Run Output</h2><pre>${escapeHtml(output)}</pre>`,
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(
      `Resend error ${response.status}: ${detail.slice(0, 500)}`
    )
  }

  return response.json()
}

/**
 * Vercel Cron Handler.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Require cron authentication.
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.authorization

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const startTime = Date.now()
  const results = []

  try {
    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL

    // Never use an anonymous key for privileged server-side operations.
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase server configuration')
    }

    const { createClient } = await import('@supabase/supabase-js')

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey
    )

    const nowIso = new Date().toISOString()

    // Fetch enabled automations that are due.
    const { data: dueAutomations, error: fetchError } =
      await supabase
        .from('automations')
        .select('*')
        .eq('enabled', true)
        .lte('next_run_at', nowIso)
        .order('next_run_at', { ascending: true })
        .limit(10)

    if (fetchError) throw fetchError

    if (!dueAutomations?.length) {
      return res.status(200).json({
        success: true,
        message: 'No automations currently due',
        processedCount: 0,
        duration: Date.now() - startTime,
      })
    }

    for (const auto of dueAutomations) {
      const runId = `run_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 7)}`

      const autoStart = Date.now()
      let status = 'success'
      let output = ''
      let error = null

      try {
        // Retrieve the automation's stored API key.
        const { data: secretData, error: secretError } =
          await supabase
            .from('user_secrets')
            .select('encrypted_key')
            .eq('automation_id', auto.id)
            .single()

        if (secretError) throw secretError

        if (!secretData?.encrypted_key) {
          throw new Error('API key not found')
        }

        /*
         * IMPORTANT:
         * Base64 decoding is NOT pgsodium decryption.
         * Replace this with your actual server-side pgsodium
         * decryption RPC/function before using encrypted keys.
         *
         * This implementation assumes the stored value is
         * base64-encoded plaintext, not encrypted data.
         */
        const apiKey = Buffer.from(
          secretData.encrypted_key,
          'base64'
        ).toString('utf8')

        if (!apiKey) {
          throw new Error('Invalid API key')
        }

        // Prepare automation input.
        const parts = []

        if (auto.inputs && typeof auto.inputs === 'object') {
          Object.entries(auto.inputs).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
              parts.push(
                `${key}: ${
                  Array.isArray(value) ? value.join(', ') : value
                }`
              )
            }
          })
        }

        const userMessage = parts.join('\n\n') || 'Scheduled run'

        const provider = (auto.provider || 'openai').toLowerCase()

        if (!SUPPORTED_CRON_PROVIDERS.includes(provider)) {
          throw new Error(`Unsupported provider: ${provider}`)
        }

        // Build provider request.
        const cronReq = buildCronRequest(
          provider,
          apiKey,
          auto.model,
          auto.system_prompt,
          userMessage
        )

        const controller = new AbortController()
        const timeout = setTimeout(
          () => controller.abort(),
          60000
        )

        let response

        try {
          response = await fetch(cronReq.url, {
            method: 'POST',
            headers: cronReq.headers,
            body: JSON.stringify(cronReq.body),
            signal: controller.signal,
          })
        } finally {
          clearTimeout(timeout)
        }

        if (!response.ok) {
          const detail = await response.text().catch(() => '')
          throw new Error(
            `${provider} API error ${response.status}: ${detail.slice(0, 500)}`
          )
        }

        const json = await response.json()
        output = parseCronResponse(provider, json)

        // Send completion notification.
        if (
          auto.email_notification &&
          auto.notification_email &&
          process.env.RESEND_API_KEY
        ) {
          await sendCronEmailNotification(
            process.env.RESEND_API_KEY,
            {
              to: auto.notification_email,
              name: auto.name,
              output,
            }
          )
        }
      } catch (err) {
        status = 'failed'
        error = err.message || 'Execution error'
      }

      const autoDuration = Date.now() - autoStart

      // Save execution history.
      const { error: insertError } = await supabase
        .from('automation_runs')
        .insert({
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

      if (insertError) {
        console.error('Run history error:', insertError)
      }

      // Calculate the next execution time.
      const intervals = {
        hourly: 60 * 60 * 1000,
        daily: 24 * 60 * 60 * 1000,
        weekly: 7 * 24 * 60 * 60 * 1000,
      }

      const intervalMs = intervals[auto.schedule] || intervals.daily

      const { error: updateError } = await supabase
        .from('automations')
        .update({
          last_run_at: new Date().toISOString(),
          next_run_at: new Date(Date.now() + intervalMs).toISOString(),
        })
        .eq('id', auto.id)

      if (updateError) {
        console.error('Schedule update error:', updateError)
      }

      results.push({
        id: auto.id,
        name: auto.name,
        status,
        duration: autoDuration,
        error,
      })
    }

    return res.status(200).json({
      success: true,
      processedCount: results.length,
      results,
      duration: Date.now() - startTime,
    })
  } catch (err) {
    console.error('Cron execution error:', err)

    return res.status(500).json({
      success: false,
      error: err.message || 'Cron execution failed',
      duration: Date.now() - startTime,
    })
  }
}

