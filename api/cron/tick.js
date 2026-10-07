
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

    /*
     * The service-role key should be used on the server.
     * Do NOT fall back to the anonymous key for privileged database
     * operations.
     */
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
        /*
         * Retrieve the stored API key.
         *
         * IMPORTANT:
         * This assumes encrypted_key is already returned in a usable
         * form by the database layer. Base64 decoding alone is NOT
         * encryption/decryption.
         */
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

        /*
         * Execute the LLM request.
         */
        if (provider === "openai") {
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
            }
          );

          const responseText = await response.text();

          let json;

          try {
            json = JSON.parse(responseText);
          } catch {
            throw new Error(
              `OpenAI returned an invalid JSON response (${response.status}).`
            );
          }

          if (!response.ok) {
            throw new Error(
              json?.error?.message ||
                `OpenAI request failed with status ${response.status}.`
            );
          }

          output =
            json?.choices?.[0]?.message?.content ||
            "No output generated.";
        } else {
          throw new Error(
            `Unsupported provider: ${provider}`
          );
        }

        /*
         * Send email notification if enabled.
         */
        if (
          automation.email_notification &&
          automation.notification_email &&
          process.env.RESEND_API_KEY
        ) {
          const escapedOutput = escapeHtml(output);
          const escapedName = escapeHtml(
            automation.name || "Automation"
          );

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
                  <h2>${escapedName} Run Output</h2>
                  <pre>${escapedOutput}</pre>
                `,
              }),
            }
          );

          if (!emailResponse.ok) {
            const emailError = await emailResponse.text();

            throw new Error(
              `Email notification failed: ${emailError}`
            );
          }
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
       *
       * The schedule is advanced even after a failed run so that
       * one failing automation does not execute continuously.
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
