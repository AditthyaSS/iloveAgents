/**
 * Vercel Cron Handler: /api/cron/tick
 *
 * Runs automatically according to the schedule configured in vercel.json.
 *
 * Responsibilities:
 * - Authenticate the Vercel Cron request
 * - Find enabled automations that are due
 * - Retrieve the automation API key
 * - Execute the configured LLM request
 * - Optionally send an email notification
 * - Record execution history
 * - Schedule the next run
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
        html: `<h2>${escapeHtml(name)} Run Output</h2><pre>${escapeHtml(output)}</pre>`,
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
  const startTime = Date.now();
  const results = [];

  // Only allow POST requests from the cron job.
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed",
    });
  }

  // Verify Cron Secret when configured.
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({
      error: "Unauthorized: Invalid Cron Secret",
    });
  }

  try {
    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;

    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase environment variables are missing.");

      return res.status(500).json({
        error: "Supabase configuration is missing",
      });
    }

    const { createClient } = await import("@supabase/supabase-js");

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const nowIso = new Date().toISOString();

    // Find enabled automations that are due.
    const {
      data: dueAutomations,
      error: fetchError,
    } = await supabase
      .from("automations")
      .select("*")
      .eq("enabled", true)
      .lte("next_run_at", nowIso)
      .order("next_run_at", { ascending: true })
      .limit(10);

    if (fetchError) {
      throw fetchError;
    }

    if (!dueAutomations || dueAutomations.length === 0) {
      return res.status(200).json({
        message: "No automations currently due",
        processedCount: 0,
        duration: Date.now() - startTime,
      });
    }

    for (const automation of dueAutomations) {
      const runId = `run_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 7)}`;

      const automationStart = Date.now();

      let status = "success";
      let output = "";
      let errorMessage = null;

      try {
        const {
          data: secretData,
          error: secretError,
        } = await supabase
          .from("user_secrets")
          .select("encrypted_key")
          .eq("automation_id", automation.id)
          .maybeSingle();

        if (secretError) {
          throw secretError;
        }

        if (!secretData?.encrypted_key) {
          throw new Error(
            "API key not found in encrypted secret vault."
          );
        }

        const apiKey = Buffer.from(
          secretData.encrypted_key,
          "base64"
        ).toString("utf-8");

        if (!apiKey) {
          throw new Error("Unable to retrieve API key.");
        }

        // Build the user message.
        const parts = [];

        if (
          automation.inputs &&
          typeof automation.inputs === "object"
        ) {
          Object.entries(automation.inputs).forEach(([key, value]) => {
            if (
              value !== undefined &&
              value !== null &&
              value !== ""
            ) {
              const formattedValue = Array.isArray(value)
                ? value.join(", ")
                : String(value);

              parts.push(`${key}: ${formattedValue}`);
            }
          });
        }

        const userMessage =
          parts.join("\n\n") || "Scheduled run";

        const provider = automation.provider || "openai";
        const normalizedProvider = provider.toLowerCase();

        if (SUPPORTED_CRON_PROVIDERS.includes(normalizedProvider)) {
          const cronReq = buildCronRequest(
            normalizedProvider,
            apiKey,
            automation.model,
            automation.system_prompt,
            userMessage
          );

          const resp = await fetch(cronReq.url, {
            method: 'POST',
            headers: cronReq.headers,
            body: JSON.stringify(cronReq.body),
          });

          if (!resp.ok) {
            const text = await resp.text().catch(() => '');
            let detail = text;
            try {
              detail = JSON.parse(text)?.error?.message || text;
            } catch {}
            throw new Error(`${normalizedProvider} API error ${resp.status}: ${String(detail).slice(0, 500)}`);
          }

          const json = await resp.json();
          output = parseCronResponse(normalizedProvider, json);
        } else {
          throw new Error(`Unsupported provider: ${provider}`);
        }

        /*
         * Send email notification if enabled.
         */
        if (
          automation.email_notification &&
          automation.notification_email &&
          process.env.RESEND_API_KEY
        ) {
          await sendCronEmailNotification(process.env.RESEND_API_KEY, {
            to: automation.notification_email,
            name: automation.name || 'Automation',
            output,
          });
        }
      } catch (err) {
        status = "failed";
        errorMessage =
          err instanceof Error
            ? err.message
            : "Execution error";

        console.error(
          `Automation ${automation.id} failed:`,
          err
        );
      }

      const automationDuration =
        Date.now() - automationStart;

      /*
       * Record execution history.
       */
      const { error: runInsertError } = await supabase
        .from("automation_runs")
        .insert({
          id: runId,
          automation_id: automation.id,
          automation_name: automation.name,
          agent_name: automation.agent_name,
          status,
          duration: automationDuration,
          output,
          error: errorMessage,
          started_at: new Date(
            automationStart
          ).toISOString(),
          completed_at: new Date().toISOString(),
        });

      if (runInsertError) {
        console.error(
          `Failed to record run ${runId}:`,
          runInsertError
        );
      }

      /*
       * Calculate the next scheduled run.
       */
      const intervalMs = getScheduleInterval(
        automation.schedule
      );

      const nextRunAt = new Date(
        Date.now() + intervalMs
      ).toISOString();

      /*
       * Update automation schedule.
       */
      const { error: updateError } = await supabase
        .from("automations")
        .update({
          last_run_at: new Date().toISOString(),
          next_run_at: nextRunAt,
        })
        .eq("id", automation.id);

      if (updateError) {
        console.error(
          `Failed to update automation ${automation.id}:`,
          updateError
        );
      }

      results.push({
        id: automation.id,
        name: automation.name,
        status,
        duration: automationDuration,
      });
    }

    return res.status(200).json({
      success: true,
      processedCount: results.length,
      results,
      duration: Date.now() - startTime,
    });
  } catch (error) {
    console.error("Cron error:", error);

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Cron execution failed",
      duration: Date.now() - startTime,
    });
  }
}

/**
 * Convert an automation schedule into milliseconds.
 */
function getScheduleInterval(schedule) {
  switch (schedule) {
    case "hourly":
      return 60 * 60 * 1000;

    case "weekly":
      return 7 * 24 * 60 * 60 * 1000;

    case "daily":
    default:
      return 24 * 60 * 60 * 1000;
  }
}

/**
 * Escape user-generated content before inserting it into HTML.
 */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
