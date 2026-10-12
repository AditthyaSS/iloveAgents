import { webcrypto } from "node:crypto";

const { subtle } = webcrypto;

const ENCRYPTION_SALT = "ila-pgsodium-salt-2026";
const PBKDF2_SALT = "salt-val-pgsodium";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function deriveKey() {
  const encoder = new TextEncoder();

  const keyMaterial = await subtle.importKey(
    "raw",
    encoder.encode(ENCRYPTION_SALT),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode(PBKDF2_SALT),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["decrypt"]
  );
}

async function decryptSecret(encryptedBase64) {
  if (!encryptedBase64) {
    return "";
  }

  try {
    const binary = Buffer.from(encryptedBase64, "base64");

    // The encrypted format is:
    // [12-byte IV][AES-GCM ciphertext + authentication tag]
    if (binary.length <= 12) {
      return Buffer.from(encryptedBase64, "base64").toString("utf8");
    }

    const iv = new Uint8Array(binary.subarray(0, 12));
    const ciphertext = new Uint8Array(binary.subarray(12));

    const key = await deriveKey();

    const decrypted = await subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    // Preserve compatibility with the old base64 fallback.
    try {
      return Buffer.from(encryptedBase64, "base64").toString("utf8");
    } catch {
      return "";
    }
  }
}

function getNextRun(schedule, currentDate) {
  const next = new Date(currentDate);

  switch (schedule) {
    case "hourly":
      next.setHours(next.getHours() + 1, 0, 0, 0);
      return next;

    case "weekly":
      next.setDate(next.getDate() + 7);
      next.setHours(9, 0, 0, 0);
      return next;

    case "daily":
    default:
      next.setDate(next.getDate() + 1);
      next.setHours(9, 0, 0, 0);
      return next;
  }
}

function buildUserMessage(inputs) {
  if (!inputs || typeof inputs !== "object") {
    return "Execute scheduled agent run.";
  }

  const parts = [];

  Object.entries(inputs).forEach(([key, value]) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return;
    }

    const formattedValue = Array.isArray(value)
      ? value.join(", ")
      : String(value);

    parts.push(`${key}: ${formattedValue}`);
  });

  return parts.length
    ? parts.join("\n\n")
    : "Execute scheduled agent run.";
}

async function runOpenAI({
  apiKey,
  model,
  systemPrompt,
  userMessage,
}) {
  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              systemPrompt ||
              "You are an intelligent AI agent executing a scheduled task.",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        `OpenAI request failed with status ${response.status}`
    );
  }

  const content =
    data?.choices?.[0]?.message?.content ||
    "No output generated.";

  const tokens =
    data?.usage?.total_tokens ||
    Math.round((content.length + userMessage.length) / 4);

  return {
    content,
    tokens,
  };
}

async function sendEmailNotification({
  to,
  automationName,
  agentName,
  output,
  status,
  duration,
  error,
}) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey || !to) {
    return false;
  }

  const safeAutomationName = escapeHtml(automationName);
  const safeAgentName = escapeHtml(agentName);
  const safeOutput = escapeHtml(output || error || "No output generated.");

  const subject = `[Open Agents Hub] ${
    status === "failed" ? "❌ Failed" : "✅ Completed"
  }: ${automationName}`;

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "Open Agents Hub <automations@openagentshub.dev>",
      to: [to],
      subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
          <div style="border-bottom: 2px solid #6366f1; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #4338ca;">
              Open Agents Hub Autopilot Report
            </h2>

            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">
              Automation:
              <strong>${safeAutomationName}</strong>
              (${safeAgentName})
            </p>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <p style="margin: 0 0 8px 0; font-size: 13px;">
              <strong>Status:</strong> ${escapeHtml(status.toUpperCase())}
            </p>

            <p style="margin: 0 0 8px 0; font-size: 13px;">
              <strong>Execution Time:</strong>
              ${new Date().toLocaleString()}
            </p>

            <p style="margin: 0; font-size: 13px;">
              <strong>Duration:</strong>
              ${(duration / 1000).toFixed(2)}s
            </p>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; font-size: 16px;">
              Agent Output
            </h3>

            <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
              ${safeOutput}
            </div>
          </div>

          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 30px;">
            Sent automatically by Open Agents Hub Scheduled Automations.
          </p>
        </div>
      `,
    }),
  });

  if (!emailResponse.ok) {
    const data = await emailResponse.json().catch(() => null);

    throw new Error(
      data?.message ||
        data?.error ||
        `Resend request failed with status ${emailResponse.status}`
    );
  }

  return true;
}

export default async function handler(req, res) {
  const startTime = Date.now();
  const results = [];

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  // Protect the cron endpoint when CRON_SECRET is configured.
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const authHeader =
      typeof req.headers.authorization === "string"
        ? req.headers.authorization
        : "";

    if (authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }
  }

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;

  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(200).json({
      success: true,
      simulated: true,
      message:
        "Supabase is not configured. No scheduled automations were executed.",
      duration: Date.now() - startTime,
      results: [],
    });
  }

  try {
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

    const now = new Date();

    const {
      data: automations,
      error: automationError,
    } = await supabase
      .from("automations")
      .select("*")
      .eq("enabled", true)
      .lte("next_run_at", now.toISOString())
      .order("next_run_at", {
        ascending: true,
      })
      .limit(10);

    if (automationError) {
      throw automationError;
    }

    if (!automations || automations.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No automations are due.",
        duration: Date.now() - startTime,
        results: [],
      });
    }

    for (const automation of automations) {
      const runId = `run_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 7)}`;

      const runStartedAt = Date.now();

      let status = "success";
      let output = "";
      let errorMessage = null;
      let tokens = 0;
      let emailSent = false;

      try {
        const {
          data: secretData,
          error: secretError,
        } = await supabase
          .from("user_secrets")
          .select("encrypted_key")
          .eq("automation_id", automation.id)
          .single();

        if (secretError && secretError.code !== "PGRST116") {
          throw secretError;
        }

        const encryptedKey = secretData?.encrypted_key;

        if (!encryptedKey) {
          throw new Error(
            "Encrypted API key is missing for this automation."
          );
        }

        // IMPORTANT:
        // user_secrets stores base64(12-byte IV + AES-GCM ciphertext).
        // Decode and decrypt it using the same PBKDF2/AES-GCM
        // parameters used by encryptSecret() in automationsService.js.
        const apiKey = await decryptSecret(encryptedKey);

        if (!apiKey) {
          throw new Error(
            "Unable to decrypt the stored API key."
          );
        }

        const userMessage = buildUserMessage(
          automation.inputs
        );

        const systemPrompt =
          automation.system_prompt ||
          automation.systemPrompt ||
          "You are an intelligent AI agent executing a scheduled task.";

        const provider =
          automation.provider || "openai";

        if (provider !== "openai") {
          throw new Error(
            `Provider "${provider}" is not currently supported by this cron handler.`
          );
        }

        const result = await runOpenAI({
          apiKey,
          model:
            automation.model || "gpt-4o-mini",
          systemPrompt,
          userMessage,
        });

        output = result.content;
        tokens = result.tokens || 0;
      } catch (error) {
        status = "failed";
        errorMessage =
          error?.message ||
          (typeof error === "string"
            ? error
            : "Automation execution failed.");
      }

      const completedAt = Date.now();
      const duration = completedAt - runStartedAt;

      const emailNotification =
        automation.email_notification ??
        automation.emailNotification ??
        false;

      const notificationEmail =
        automation.notification_email ||
        automation.notificationEmail ||
        "";

      if (
        emailNotification &&
        notificationEmail
      ) {
        try {
          emailSent = await sendEmailNotification({
            to: notificationEmail,
            automationName:
              automation.name || "Scheduled Automation",
            agentName:
              automation.agent_name ||
              automation.agentName ||
              "AI Agent",
            output,
            status,
            duration,
            error: errorMessage,
          });
        } catch (emailError) {
          console.error(
            `Email notification failed for ${automation.id}:`,
            emailError
          );
        }
      }

      const {
        error: runInsertError,
      } = await supabase
        .from("automation_runs")
        .insert({
          id: runId,
          automation_id: automation.id,
          automation_name:
            automation.name || "Scheduled Automation",
          agent_name:
            automation.agent_name ||
            automation.agentName ||
            "AI Agent",
          status,
          started_at: new Date(
            runStartedAt
          ).toISOString(),
          completed_at: new Date(
            completedAt
          ).toISOString(),
          duration,
          tokens,
          output,
          error: errorMessage,
          email_sent: emailSent,
        });

      if (runInsertError) {
        console.error(
          `Failed to record run ${runId}:`,
          runInsertError
        );
      }

      const nextRunAt = getNextRun(
        automation.schedule,
        now
      );

      const {
        error: updateError,
      } = await supabase
        .from("automations")
        .update({
          last_run_at: new Date(
            completedAt
          ).toISOString(),
          next_run_at: nextRunAt.toISOString(),
        })
        .eq("id", automation.id);

      if (updateError) {
        console.error(
          `Failed to update automation ${automation.id}:`,
          updateError
        );
      }

      results.push({
        automationId: automation.id,
        automationName: automation.name,
        runId,
        status,
        duration,
        tokens,
        emailSent,
        error: errorMessage,
      });
    }

    return res.status(200).json({
      success: true,
      processed: results.length,
      duration: Date.now() - startTime,
      results,
    });
  } catch (error) {
    console.error("Cron execution error:", error);

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Cron execution failed.",
      duration: Date.now() - startTime,
      results,
    });
  }
}
