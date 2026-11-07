
/**
 * Vercel Cron Handler: /api/cron/tick
 */

export const SUPPORTED_CRON_PROVIDERS = [
  'openai',
  'anthropic',
  'gemini',
  'openrouter',
]

/**
 * Build LLM request.
 */
export function buildCronRequest(
  provider = 'openai',
  apiKey,
  model,
  systemPrompt,
  userMessage
) {
  if (!apiKey) {
    throw new Error('API key is missing.')
  }

  const sys = systemPrompt || 'You are an AI assistant.'
  const msg = userMessage || 'Scheduled run'
  const prov = provider.toLowerCase()

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
        systemInstruction: {
          parts: [{ text: sys }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: msg }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 4096,
        },
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
 * Parse LLM response.
 */
export function parseCronResponse(provider, json) {
  if (!json || typeof json !== 'object') {
    return 'No output generated'
  }

  const prov = (provider || 'openai').toLowerCase()

  if (prov === 'anthropic') {
    return json.content
      ?.filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n') || 'No output generated'
  }

  if (prov === 'gemini') {
    return json.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('') || 'No output generated'
  }

  return json.choices?.[0]?.message?.content || 'No output generated'
}

/**
 * Escape HTML before inserting dynamic content into email.
 */
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char])
}

/**
 * Send email notification using Resend.
 */
export async function sendCronEmailNotification(
  apiKey,
  { to, name, output }
) {
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: 'Open Agents Hub <automations@openagentshub.dev>',
      to: [to],
      subject: `[Open Agents Hub] Completed: ${name}`,
      html: `
        <h2>${escapeHtml(name)} Run Output</h2>
        <pre>${escapeHtml(output)}</pre>
      `,
    }),
  })

  if (!resp.ok) {
    const detail = await resp.text().catch(() => '')
    throw new Error(
      `Resend error ${resp.status}: ${detail.slice(0, 500)}`
    )
  }

  return await resp.json()
}

/**
 * Vercel Cron Handler.
 */
export default async function handler(req, res) {

  // Only allow GET requests from Vercel Cron.
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
    })
  }

  // Cron authentication.
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.authorization

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({
      error: 'Unauthorized',
    })
  }

  const startTime = Date.now()
  const results = []

  try {

    // Supabase configuration.
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables are missing.')
    }

    const { createClient } = await import('@supabase/supabase-js')

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey
    )

    const nowIso = new Date().toISOString()

    // Fetch due automations.
    const { data: dueAutomations, error: fetchError } =
      await supabase
        .from('automations')
        .select('*')
        .eq('enabled', true)
        .lte('next_run_at', nowIso)
        .order('next_run_at', { ascending: true })
        .limit(10)

    if (fetchError) {
      throw fetchError
    }

    if (!dueAutomations || dueAutomations.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No automations currently due',
        processedCount: 0,
        duration: Date.now() - startTime,
      })
    }

    // Process automations.
    for (const auto of dueAutomations) {

      const runId = `run_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 7)}`

      const autoStart = Date.now()

      let status = 'success'
      let output = ''
      let error = null

      try {

        // Retrieve API key.
        const { data: secretData, error: secretError } =
          await supabase
            .from('user_secrets')
            .select('encrypted_key')
            .eq('automation_id', auto.id)
            .single()

        if (secretError || !secretData?.encrypted_key) {
          throw new Error('API key not found.')
        }

        /*
         * IMPORTANT:
         * This retains your original Base64 decoding.
         * Base64 is NOT pgsodium encryption.
         * Replace this with your actual pgsodium decryption RPC
         * before using genuinely encrypted API keys.
         */
        const apiKey = Buffer.from(
          secretData.encrypted_key,
          'base64'
        ).toString('utf-8')

        if (!apiKey) {
          throw new Error('Invalid API key.')
        }

        // Prepare user input.
        const parts = []

        if (auto.inputs && typeof auto.inputs === 'object') {
          Object.entries(auto.inputs).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
              parts.push(
                `${key}: ${
                  Array.isArray(value)
                    ? value.join(', ')
                    : String(value)
                }`
              )
            }
          })
        }

        const userMessage = parts.join('\n\n') || 'Scheduled run'

        // Validate provider.
        const provider = (auto.provider || 'openai').toLowerCase()

        if (!SUPPORTED_CRON_PROVIDERS.includes(provider)) {
          throw new Error(`Unsupported provider: ${provider}`)
        }

        // Build request.
        const cronReq = buildCronRequest(
          provider,
          apiKey,
          auto.model,
          auto.system_prompt,
          userMessage
        )

        // Execute LLM request.
        const resp = await fetch(cronReq.url, {
          method: 'POST',
          headers: cronReq.headers,
          body: JSON.stringify(cronReq.body),
        })

        if (!resp.ok) {
          const detail = await resp.text().catch(() => '')

          throw new Error(
            `${provider} API error ${resp.status}: ${detail.slice(0, 500)}`
          )
        }

        const json = await resp.json()

        output = parseCronResponse(provider, json)

        // Email notification.
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
      const completedAt = new Date()

      // Record automation run.
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
          completed_at: completedAt.toISOString(),
        })

      if (insertError) {
        throw insertError
      }

      // Calculate next execution time.
      const scheduleIntervals = {
        hourly: 60 * 60 * 1000,
        daily: 24 * 60 * 60 * 1000,
        weekly: 7 * 24 * 60 * 60 * 1000,
      }

      const intervalMs =
        scheduleIntervals[auto.schedule] ||
        scheduleIntervals.daily

      // Update automation schedule.
      const { error: updateError } = await supabase
        .from('automations')
        .update({
          last_run_at: completedAt.toISOString(),
          next_run_at: new Date(
            completedAt.getTime() + intervalMs
          ).toISOString(),
        })
        .eq('id', auto.id)

      if (updateError) {
        throw updateError
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

    console.error('Cron error:', err)

    return res.status(500).json({
      success: false,
      error: err.message || 'Cron execution failed',
      duration: Date.now() - startTime,
    })
  }
}
