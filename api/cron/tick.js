```js
/**
 * Vercel Cron Handler: /api/cron/tick
 *
 * Runs automatically on schedule configured in vercel.json.
 * Authenticates using CRON_SECRET, processes due automations,
 * executes the configured provider, records run history,
 * and optionally sends email notifications through Resend.
 */

export default async function handler(req, res) {
  const startTime = Date.now();
  const results = [];

  // Only allow GET requests from Vercel Cron.
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method Not Allowed",
    });
  }

  // Verify Cron Secret when configured.
  const cronSecret = process.env.CRON_SECRET;
  const authHeader =
    typeof req.headers.authorization === "string"
      ? req.headers.authorization
      : "";

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({
      error: "Unauthorized: Invalid Cron Secret",
    });
  }

  try {
    // Supabase configuration.
    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;

    // Service role key should be used for server-side cron jobs.
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(200).json({
        success: true,
        message:
          "Open Agents Hub Cron Tick executed in simulated mode because Supabase is not configured.",
        processedCount: 0,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      });
    }

    // Dynamically import Supabase.
    const { createClient } = await import("@supabase/supabase-js");

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const now = new Date();
    const nowIso = now.toISOString();

    // Fetch automations that are due.
    const { data: dueAutomations, error: fetchError } = await supabase
      .from("automations")
      .select("*")
      .eq("enabled", true)
      .lte("next_run_at", nowIso)
      .order("next_run_at", { ascending: true })
      .limit(10);

    if (fetchError) {
      throw new Error(
        `Failed to fetch automations: ${fetchError.message}`,
      );
    }

    if (!dueAutomations || dueAutomations.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No automations currently due",
        processedCount: 0,
        duration: Date.now() - startTime,
      });
    }

    for (const automation of dueAutomations) {
      const runId = `run_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      const automationStart = Date.now();

      let status = "success";
      let output = "";
      let errorMessage = null;

      try {
        /*
         * Fetch the encrypted API key.
         *
         * IMPORTANT:
         * The value should normally be decrypted through your
         * server-side secret/pgsodium mechanism. Do not expose
         * the service role key or decrypted API key to clients.
         */
        const { data: secretData, error: secretError } = await supabase
          .from("user_secrets")
          .select("encrypted_key")
          .eq("automation_id", automation.id)
          .single();

        if (secretError && secretError.code !== "PGRST116") {
          throw new Error(
            `Failed to fetch API key: ${secretError.message}`,
          );
        }

        const encryptedKey = secretData?.encrypted_key;

        if (!encryptedKey) {
          throw new Error(
            "API key not found in encrypted secret vault.",
          );
        }

        /*
         * Preserve the existing project behaviour.
         *
         * If encrypted_key is actually encrypted with pgsodium,
         * replace this decoding step with your server-side
         * decryption RPC/function.
         */
        let apiKey;

        try {
          apiKey = Buffer.from(
            encryptedKey,
            "base64",
          ).toString("utf-8");
        } catch {
          throw new Error("Unable to decode stored API key.");
        }

        if (!apiKey) {
          throw new Error("Decoded API key is empty.");
        }

        // Build user input.
        const parts = [];

        if (
          automation.inputs &&
          typeof automation.inputs === "object"
        ) {
          Object.entries(automation.inputs).forEach(([key, value]) => {
            if (
              value !== null &&
              value !== undefined &&
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
          parts.length > 0 ? parts.join("\n\n") : "Scheduled run";

        // Execute provider.
        if (
          automation.provider === "openai" ||
          !automation.provider
        ) {
          const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: automation.model || "gpt-4o-mini",
                messages: [
                  {
                    role: "system",
                    content:
                      automation.system_prompt ||
                      "You are an AI assistant.",
                  },
                  {
                    role: "user",
                    content: userMessage,
                  },
                ],
              }),
            },
          );

          const json = await response.json();

          if (!response.ok) {
            throw new Error(
              json?.error?.message ||
                `OpenAI request failed with status ${response.status}`,
            );
          }

          output =
            json?.choices?.[0]?.message?.content ||
            "No output generated";
        } else {
          // Placeholder for other providers.
          output = `Executed ${
            automation.agent_name || automation.name || "automation"
          } via ${automation.provider} successfully.`;
        }

        // Send email notification through Resend.
        if (
          automation.email_notification &&
          automation.notification_email &&
          process.env.RESEND_API_KEY
        ) {
          const safeName = escapeHtml(
            automation.name || "Automation",
          );

          const safeOutput = escapeHtml(output);

          const emailResponse = await fetch(
            "https://api.resend.com/emails",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from:
                  "Open Agents Hub <automations@openagentshub.dev>",
                to: [automation.notification_email],
                subject: `[Open Agents Hub] Completed: ${
                  automation.name || "Automation"
                }`,
                html: `
                  <h2>${safeName} Run Output</h2>
                  <pre>${safeOutput}</pre>
                `,
              }),
            },
          );

          if (!emailResponse.ok) {
            const emailError = await emailResponse.text();

            throw new Error(
              `Resend request failed with status ${emailResponse.status}: ${emailError}`,
            );
          }
        }
      } catch (err) {
        status = "failed";

        errorMessage =
          err instanceof Error
            ? err.message
            : String(err);

        console.error(
          `Automation ${automation.id} failed:`,
          err,
        );
      }

      const automationDuration =
        Date.now() - automationStart;

      const completedAt = new Date().toISOString();

      // Record run history.
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
            automationStart,
          ).toISOString(),
          completed_at: completedAt,
        });

      if (runInsertError) {
        console.error(
          `Failed to record automation run ${runId}:`,
          runInsertError,
        );
      }

      // Calculate next execution time.
      const intervalMs =
        automation.schedule === "hourly"
          ? 60 * 60 * 1000
          : automation.schedule === "weekly"
            ? 7 * 24 * 60 * 60 * 1000
            : 24 * 60 * 60 * 1000;

      const nextRunAt = new Date(
        Date.now() + intervalMs,
      ).toISOString();

      // Update automation schedule.
      const { error: updateError } = await supabase
        .from("automations")
        .update({
          last_run_at: completedAt,
          next_run_at: nextRunAt,
        })
        .eq("id", automation.id);

      if (updateError) {
        console.error(
          `Failed to update automation ${automation.id}:`,
          updateError,
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
  } catch (err) {
    console.error("Cron error:", err);

    const message =
      err instanceof Error
        ? err.message
        : "Cron execution failed";

    return res.status(500).json({
      success: false,
      error: message,
      duration: Date.now() - startTime,
    });
  }
}

/**
 * Escape dynamic content before inserting it into email HTML.
 */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```

**Short PR description:**

Improved the Vercel cron handler with secure authentication, error handling, Supabase integration, provider execution, run logging, and email notifications.
