import { webcrypto } from "node:crypto";

const { subtle } = webcrypto;
const ENCRYPTION_SALT = "ila-pgsodium-salt-2026";
const PBKDF2_SALT = "salt-val-pgsodium";
const REQUEST_TIMEOUT_MS = 30_000;

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
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
}

function isPrintableText(value) {
  return typeof value === "string" && value.length > 0 && /^[\x20-\x7E]+$/.test(value);
}

async function decryptSecret(encryptedBase64) {
  if (!encryptedBase64 || typeof encryptedBase64 !== "string") return "";

  try {
    const binary = Buffer.from(encryptedBase64, "base64");
    if (binary.length <= 12) throw new Error("Encrypted value is too short.");

    const iv = new Uint8Array(binary.subarray(0, 12));
    const ciphertext = new Uint8Array(binary.subarray(12));
    const key = await deriveKey();
    const decrypted = await subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    const plaintext = new TextDecoder().decode(decrypted);

    if (!isPrintableText(plaintext)) {
      throw new Error("Decrypted secret is not printable text.");
    }
    return plaintext;
  } catch (error) {
    // Backward compatibility for values stored as base64-encoded plain text.
    const fallback = Buffer.from(encryptedBase64, "base64").toString("utf8").trim();
    if (isPrintableText(fallback)) return fallback;
    throw new Error("Unable to decrypt the stored API key.");
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
  if (!inputs || typeof inputs !== "object" || Array.isArray(inputs)) {
    return "Execute scheduled agent run.";
  }

  const parts = [];
  for (const [key, value] of Object.entries(inputs)) {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) continue;

    const formattedValue = Array.isArray(value) ? value.join(", ") : String(value);
    parts.push(`${key}: ${formattedValue}`);
  }
  return parts.length ? parts.join("\n\n") : "Execute scheduled agent run.";
}

export const SUPPORTED_CRON_PROVIDERS = [
  "openai",
  "anthropic",
  "gemini",
  "openrouter",
];

export function buildCronRequest(provider, apiKey, model, systemPrompt, userMessage) {
  const prov = String(provider || "openai").toLowerCase();
  const sys = systemPrompt || "You are an AI assistant.";
  const msg = userMessage || "Scheduled run";

  if (prov === "anthropic") {
    return {
      url: "https://api.anthropic.com/v1/messages",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: {
        model: model || "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        system: sys,
        messages: [{ role: "user", content: msg }],
      },
    };
  }

  if (prov === "gemini") {
    const targetModel = model || "gemini-2.5-flash";
    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:generateContent`,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: {
        contents: [{ parts: [{ text: `${sys}\n\n${msg}` }] }],
      },
    };
  }

  if (prov === "openrouter") {
    return {
      url: "https://openrouter.ai/api/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://iloveagents.ai",
        "X-Title": "ILoveAgents",
      },
      body: {
        model: model || "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: msg },
        ],
        max_tokens: 4096,
      },
    };
  }

  if (prov === "openai") {
    return {
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: {
        model: model || "gpt-4o-mini",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: msg },
        ],
        max_tokens: 4096,
      },
    };
  }

  throw new Error(`Unsupported provider: ${prov}`);
}

export function parseCronResponse(provider, json) {
  if (!json || typeof json !== "object") return "No output generated";
  const prov = String(provider || "openai").toLowerCase();

  if (prov === "anthropic") {
    return json.content?.map((item) => item?.text || "").filter(Boolean).join("\n") || "No output generated";
  }
  if (prov === "gemini") {
    return json.candidates?.[0]?.content?.parts?.map((part) => part?.text || "").filter(Boolean).join("\n") || "No output generated";
  }
  return json.choices?.[0]?.message?.content || "No output generated";
}

async function readJsonResponse(response, provider) {
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    if (response.ok) throw new Error(`${provider} returned an invalid JSON response.`);
  }

  if (!response.ok) {
    const detail =
      data?.error?.message ||
      (typeof data?.error === "string" ? data.error : null) ||
      data?.message ||
      text ||
      `HTTP ${response.status}`;
    throw new Error(`${provider} API error ${response.status}: ${String(detail).slice(0, 500)}`);
  }
  return data;
}

async function sendCronEmailNotification(apiKey, { to, name, output, status = "success", error = null }) {
  if (!apiKey || !to) return false;

  const safeName = escapeHtml(name || "Scheduled Automation");
  const safeOutput = escapeHtml(output || error || "No output generated.");
  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "Open Agents Hub <automations@openagentshub.dev>",
      to: [to],
      subject: `[Open Agents Hub] ${status === "failed" ? "❌ Failed" : "✅ Completed"}: ${name || "Scheduled Automation"}`,
      html: `<h2>${safeName} Run Output</h2><pre style="white-space:pre-wrap">${safeOutput}</pre>`,
    }),
  });

  if (!emailResponse.ok) {
    const text = await emailResponse.text().catch(() => "");
    let detail = text;
    try {
      const data = text ? JSON.parse(text) : {};
      detail = data?.message || data?.error?.message || data?.error || text;
    } catch {
      // Keep the response text as the error detail.
    }
    throw new Error(`Resend notification error ${emailResponse.status}: ${String(detail).slice(0, 500)}`);
  }
  return true;
}

/**
 * Vercel Cron Handler: /api/cron/tick
 * Executes due automations, records run history, and optionally sends email notifications.
 */
export default async function handler(req, res) {
  const startTime = Date.now();
  const results = [];

  if (req.method && req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Fail closed: never execute scheduled automations without a configured secret.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("CRON_SECRET is not configured.");
    return res.status(500).json({ error: "Cron endpoint is not configured." });
  }

  const authHeader =
    typeof req.headers?.authorization === "string"
      ? req.headers.authorization
      : "";
  if (authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized: Invalid Cron Secret" });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(200).json({
      success: true,
      simulated: true,
      message: "Serverless simulated mode",
      processed: 0,
      processedCount: 0,
      duration: Date.now() - startTime,
      results: [],
    });
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const now = new Date();
    const { data: automations, error: automationError } = await supabase
      .from("automations")
      .select("*")
      .eq("enabled", true)
      .lte("next_run_at", now.toISOString())
      .order("next_run_at", { ascending: true })
      .limit(10);

    if (automationError) throw automationError;

    if (!automations || automations.length === 0) {
      return res.status(200).json({
        success: true,
        processed: 0,
        processedCount: 0,
        message: "No automations are due.",
        duration: Date.now() - startTime,
        results: [],
      });
    }

    for (const automation of automations) {
      const runStartedAt = Date.now();
      const runId = `run_${runStartedAt}_${Math.random().toString(36).slice(2, 7)}`;
      let status = "success";
      let output = "";
      let errorMessage = null;
      let tokens = 0;
      let emailSent = false;

      // Atomically claim this due automation to prevent overlapping cron runs.
      const claimedNextRunAt = getNextRun(automation.schedule, now).toISOString();
      const { data: claimedRows, error: claimError } = await supabase
        .from("automations")
        .update({ next_run_at: claimedNextRunAt })
        .eq("id", automation.id)
        .eq("next_run_at", automation.next_run_at)
        .select("id");

      if (claimError) {
        console.error(`Failed to claim automation ${automation.id}:`, claimError);
        continue;
      }
      if (!claimedRows || claimedRows.length === 0) {
        // Another invocation already claimed this automation.
        continue;
      }

      try {
        const { data: secretData, error: secretError } = await supabase
          .from("user_secrets")
          .select("encrypted_key")
          .eq("automation_id", automation.id)
          .single();

        if (secretError && secretError.code !== "PGRST116") throw secretError;
        if (!secretData?.encrypted_key) {
          throw new Error("Encrypted API key is missing for this automation.");
        }

        const apiKey = await decryptSecret(secretData.encrypted_key);
        if (!apiKey) throw new Error("Unable to decrypt the stored API key.");

        const provider = String(automation.provider || "openai").toLowerCase();
        if (!SUPPORTED_CRON_PROVIDERS.includes(provider)) {
          throw new Error(`Unsupported provider: ${provider}`);
        }

        const userMessage = buildUserMessage(automation.inputs);
        const systemPrompt =
          automation.system_prompt ||
          automation.systemPrompt ||
          "You are an intelligent AI agent executing a scheduled task.";
        const cronRequest = buildCronRequest(
          provider,
          apiKey,
          automation.model,
          systemPrompt,
          userMessage
        );

        const response = await fetch(cronRequest.url, {
          method: "POST",
          headers: cronRequest.headers,
          body: JSON.stringify(cronRequest.body),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        const responseData = await readJsonResponse(response, provider);
        output = parseCronResponse(provider, responseData);

        const usage = responseData?.usage || responseData?.usageMetadata || {};
        tokens =
          usage.total_tokens ??
          ((usage.input_tokens ?? usage.prompt_tokens ?? usage.promptTokenCount ?? 0) +
            (usage.output_tokens ?? usage.completion_tokens ?? usage.candidatesTokenCount ?? 0));
      } catch (error) {
        status = "failed";
        errorMessage =
          error?.message ||
          (typeof error === "string" ? error : "Automation execution failed.");
      }

      const completedAt = Date.now();
      const duration = completedAt - runStartedAt;
      const emailNotification =
        automation.email_notification ?? automation.emailNotification ?? false;
      const notificationEmail =
        automation.notification_email || automation.notificationEmail || "";

      if (emailNotification && notificationEmail && process.env.RESEND_API_KEY) {
        try {
          emailSent = await sendCronEmailNotification(process.env.RESEND_API_KEY, {
            to: notificationEmail,
            name: automation.name || "Scheduled Automation",
            output,
            status,
            error: errorMessage,
          });
        } catch (emailError) {
          console.error(`Email notification failed for ${automation.id}:`, emailError);
        }
      }

      const { error: runInsertError } = await supabase
        .from("automation_runs")
        .insert({
          id: runId,
          automation_id: automation.id,
          automation_name: automation.name || "Scheduled Automation",
          agent_name: automation.agent_name || automation.agentName || "AI Agent",
          status,
          started_at: new Date(runStartedAt).toISOString(),
          completed_at: new Date(completedAt).toISOString(),
          duration,
          tokens,
          output,
          error: errorMessage,
          email_sent: emailSent,
        });

      if (runInsertError) {
        console.error(`Failed to record run ${runId}:`, runInsertError);
      }

      const { error: updateError } = await supabase
        .from("automations")
        .update({ last_run_at: new Date(completedAt).toISOString() })
        .eq("id", automation.id);

      if (updateError) {
        console.error(`Failed to update automation ${automation.id}:`, updateError);
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
      processedCount: results.length,
      duration: Date.now() - startTime,
      results,
    });
  } catch (error) {
    console.error("Cron execution error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Cron execution failed.",
      duration: Date.now() - startTime,
      results,
    });
  }
}
