
/**
 * Vercel Cron Handler: /api/cron/tick
 *
 * Responsibilities:
 * 1. Authenticate scheduled cron requests.
 * 2. Connect securely to Supabase.
 * 3. Fetch enabled automations that are due.
 * 4. Retrieve decrypted API keys securely.
 * 5. Execute AI requests using supported providers.
 * 6. Save automation execution history.
 * 7. Send email notifications through Resend.
 */

import { createClient } from '@supabase/supabase-js';

export const SUPPORTED_CRON_PROVIDERS = [
  'openai',
  'anthropic',
  'gemini',
  'openrouter',
];

// Escape HTML before inserting generated content into an email.
function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

// Build an AI provider request.
export function buildCronRequest(
  provider,
  apiKey,
  model,
  systemPrompt,
  userMessage
) {
  const sys = systemPrompt || 'You are an AI assistant.';
  const msg = userMessage || 'Scheduled run';
  const prov = (provider || 'openai').toLowerCase();

  if (!SUPPORTED_CRON_PROVIDERS.includes(prov)) {
    throw new Error(`Unsupported AI provider: ${prov}`);
  }

  if (!apiKey) {
    throw new Error('Missing provider API key.');
  }

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
    };
  }

  if (prov === 'gemini') {
    const targetModel = model || 'gemini-2.5-flash';

    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:generateContent`,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: {
        contents: [{
          parts: [{ text: `${sys}\n\n${msg}` }],
        }],
      },
    };
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
    };
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
  };
}

// Extract AI response text.
export function parseCronResponse(provider, json) {
  if (!json || typeof json !== 'object') {
    return 'No output generated';
  }

  const prov = (provider || 'openai').toLowerCase();

  if (prov === 'anthropic') {
    return json.content?.[0]?.text || 'No output generated';
  }

  if (prov === 'gemini') {
    return json.candidates?.[0]?.content?.parts?.[0]?.text
      || 'No output generated';
  }

  return json.choices?.[0]?.message?.content
    || 'No output generated';
}

// Execute an AI request with a timeout.
async function executeAIRequest(request) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(request.body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `AI provider error ${response.status}: ${errorText.slice(0, 500)}`
      );
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

// Send completion notification using Resend.
export async function sendCronEmailNotification(
  apiKey,
  { to, name, output }
) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: 'ILoveAgents <automations@iloveagents.ai>',
      to: [to],
      subject: `[ILoveAgents] Completed: ${name}`,
      html: `
        <h2>${escapeHtml(name)} - Run Output</h2>
        <pre>${escapeHtml(output)}</pre>
      `,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Resend error ${response.status}: ${(await response.text()).slice(0, 500)}`
    );
  }

  return response.json();
}

/**
 * IMPORTANT:
 * This RPC must be implemented in your Supabase database.
 * It must securely decrypt the stored pgsodium secret and
 * return the decrypted API key only to the authorized server.
 *
 * Expected RPC contract:
 * Function: decrypt_automation_api_key
 * Argument: p_automation_id
 * Return: api_key
 *
 * Adjust this function to match your actual SQL implementation.
 */
async function getDecryptedApiKey(supabase, automationId) {
  const { data, error } = await supabase.rpc(
    'decrypt_automation_api_key',
    { p_automation_id: automationId }
  );

  if (error) {
    throw new Error(`Secret decryption failed: ${error.message}`);
  }

  const apiKey = data?.api_key;

  if (!apiKey) {
    throw new Error('Decrypted API key not found.');
  }

  return apiKey;
}

// Main Vercel Cron handler.
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Require cron authentication.
  const cronSecret = process.env.CRON_SECRET;

  if (
    !cronSecret ||
    req.headers.authorization !== `Bearer ${cronSecret}`
  ) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const startTime = Date.now();
  const results = [];

  try {
    // Server-side Supabase credentials only.
    const supabaseUrl = process.env.SUPABASE_URL
      || process.env.VITE_SUPABASE_URL;

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Supabase server configuration is missing.');
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // Fetch due automations.
    const { data: automations, error: fetchError } = await supabase
      .from('automations')
      .select('*')
      .eq('enabled', true)
      .lte('next_run_at', new Date().toISOString())
      .order('next_run_at', { ascending: true })
      .limit(10);

    if (fetchError) throw fetchError;

    if (!automations?.length) {
      return res.status(200).json({
        success: true,
        message: 'No automations currently due.',
        processedCount: 0,
        duration: Date.now() - startTime,
      });
    }

    for (const auto of automations) {
      const autoStart = Date.now();
      let status = 'success';
      let output = '';
      let errorMessage = null;

      try {
        // Get securely decrypted provider API key.
        const apiKey = await getDecryptedApiKey(
          supabase,
          auto.id
        );

        const provider = (auto.provider || 'openai').toLowerCase();

        const parts = Object.entries(auto.inputs || {})
          .filter(([, value]) => value !== null && value !== undefined)
          .map(([key, value]) =>
            `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
          );

        const userMessage = parts.join('\n\n') || 'Scheduled run';

        const request = buildCronRequest(
          provider,
          apiKey,
          auto.model,
          auto.system_prompt,
          userMessage
        );

        const responseJson = await executeAIRequest(request);

        output = parseCronResponse(provider, responseJson);

        // Send optional email notification.
        if (
          auto.email_notification &&
          auto.notification_email &&
          process.env.RESEND_API_KEY
        ) {
          await sendCronEmailNotification(
            process.env.RESEND_API_KEY,
            {
              to: auto.notification_email,
              name: auto.name || 'Automation',
              output,
            }
          );
        }

      } catch (err) {
        status = 'failed';
        errorMessage = err.message || 'Automation execution failed';
      }

      const duration = Date.now() - autoStart;
      const completedAt = new Date();

      // Save execution history.
      const { error: insertError } = await supabase
        .from('automation_runs')
        .insert({
          automation_id: auto.id,
          automation_name: auto.name,
          agent_name: auto.agent_name,
          status,
          duration,
          output,
          error: errorMessage,
          started_at: new Date(autoStart).toISOString(),
          completed_at: completedAt.toISOString(),
        });

      if (insertError) {
        throw insertError;
      }

      // Calculate next execution time.
      const intervals = {
        hourly: 60 * 60 * 1000,
        daily: 24 * 60 * 60 * 1000,
        weekly: 7 * 24 * 60 * 60 * 1000,
      };

      const interval = intervals[auto.schedule] || intervals.daily;

      const { error: updateError } = await supabase
        .from('automations')
        .update({
          last_run_at: completedAt.toISOString(),
          next_run_at: new Date(
            completedAt.getTime() + interval
          ).toISOString(),
        })
        .eq('id', auto.id);

      if (updateError) {
        throw updateError;
      }

      results.push({
        id: auto.id,
        name: auto.name,
        status,
        duration,
        error: errorMessage,
      });
    }

    return res.status(200).json({
      success: true,
      processedCount: results.length,
      results,
      duration: Date.now() - startTime,
    });

  } catch (err) {
    console.error('Cron execution error:', err.message);

    return res.status(500).json({
      success: false,
      error: 'Cron execution failed.',
      duration: Date.now() - startTime,
    });
  }
}

