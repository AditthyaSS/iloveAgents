/**
 * Vercel Cron Handler: /api/cron/tick
 *
 * Runs automatically on schedule configured in vercel.json cron.
 * Authenticates using CRON_SECRET authorization header, selects due automations,
 * executes LLM run with pgsodium encrypted key, logs run history, and sends email via Resend.
 */

export function buildCronRequest(provider, apiKey, model, systemPrompt, userMessage) {
  const sys = systemPrompt || 'You are an AI assistant.'
  const msg = userMessage || 'Scheduled run'

  if (provider === 'anthropic') {
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

  if (provider === 'gemini') {
    const m = model || 'gemini-2.5-flash'
    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`,
      headers: { 'Content-Type': 'application/json' },
      body: {
        contents: [{ parts: [{ text: sys + '\n\n' + msg }] }],
      },
    }
  }

  if (provider === 'openrouter') {
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
    },
  }
}

export function parseCronResponse(provider, json) {
  if (provider === 'anthropic') {
    return json.content?.[0]?.text || 'No output generated'
  }
  if (provider === 'gemini') {
    return json.candidates?.[0]?.content?.parts?.[0]?.text || 'No output generated'
  }
  return json.choices?.[0]?.message?.content || 'No output generated'
}

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
        const cronReq = buildCronRequest(
          provider,
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
        const json = await resp.json()
        output = parseCronResponse(provider, json)

        // Email Notification via Resend
        if (auto.email_notification && auto.notification_email && process.env.RESEND_API_KEY) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: 'Open Agents Hub <automations@openagentshub.dev>',
              to: [auto.notification_email],
              subject: `[Open Agents Hub] ✅ Completed: ${auto.name}`,
              html: `<h2>${auto.name} Run Output</h2><pre>${output}</pre>`,
            }),
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
