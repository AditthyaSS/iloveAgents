import { streamAgent } from "./llmAdapter";
import { recordAnalyticsRun } from "./useAnalytics";
import { suites } from "../suites/suitesData";

const MODEL_DEFAULTS = {
  gemini: "gemini-2.5-flash",
  anthropic: "claude-3-5-haiku-20241022",
  openai: "gpt-4o-mini",
  openrouter: "openai/gpt-4o-mini",
};

function* braceObjects(text) {
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "{") continue;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let j = i; j < text.length; j++) {
      const ch = text[j];
      if (inString) {
        if (escaped) escaped = false;
        else if (ch === "\\") escaped = true;
        else if (ch === '"') inString = false;
      } else if (ch === '"') {
        inString = true;
      } else if (ch === "{") {
        depth++;
      } else if (ch === "}") {
        depth--;
        if (depth === 0) {
          yield text.slice(i, j + 1);
          break;
        }
      }
    }
  }
}

export function extractSuiteJson(content) {
  const text = String(content ?? "").trim();
  if (!text) throw new Error("The model returned an empty response.");
  const seen = new Set();
  const candidates = [];
  const consider = (value) => {
    try {
      const parsed = JSON.parse(value);
      const key = JSON.stringify(parsed);
      if (!seen.has(key)) {
        seen.add(key);
        candidates.push(parsed);
      }
    } catch {
      // not parseable on its own; keep scanning
    }
  };
  consider(text);
  for (const fence of text.matchAll(/```(?:json)?\s*([\s\S]*?)\s*```/gi)) {
    consider(fence[1].trim());
  }
  for (const obj of braceObjects(text)) {
    consider(obj);
  }
  const valid = candidates.find(isValidSuite);
  if (valid) return valid;
  if (candidates.length > 0) {
    throw new Error("The model response was valid JSON but not a suite. Expected a title with a non-empty agents list.");
  }
  throw new Error("The model response did not contain valid suite JSON.");
}

function isValidSuite(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return false;
  if (!Array.isArray(payload.agents) || payload.agents.length === 0) return false;
  return payload.agents.every(
    (agent) => agent && typeof agent === "object" && typeof agent.id === "string" && agent.id.trim() !== ""
  );
}

export async function generateCustomSuite(goal, apiKey, provider) {
  // Building a flat list of all agents across all suites
  const agentList = suites.map((suite) => ({
    suiteId: suite.id,
    suiteName: suite.name,
    agents: suite.agents,
  }));

  const agentContext = agentList
    .map((s) => `${s.suiteName}: ${s.agents.join(", ")}`)
    .join("\n");

  const systemPrompt = `You are an AI assistant that helps users find the best combination of agents for their goal.

You have access to these agents organized by suite:
${agentContext}

When given a user's goal, pick 4-6 most relevant agent IDs from the list above.

Always respond in this EXACT JSON format and nothing else:
{
  "title": "Short title for this custom suite",
  "description": "One sentence describing what this suite helps the user achieve",
  "agents": [
    { "id": "agent-id-here", "reason": "One line reason why this agent helps" },
    { "id": "agent-id-here", "reason": "One line reason why this agent helps" }
  ]
}

Rules:
- Only use agent IDs that exist in the list above
- Pick 4-6 agents maximum
- Order them logically — what should the user do first, second, etc.
- Keep reasons short and specific to the user's goal
- Return ONLY valid JSON, no markdown, no extra text`;

  const userMessage = `My goal is: ${goal}`;

  const result = await streamAgent({
    provider,
    apiKey,
    model: MODEL_DEFAULTS[provider] || "gemini-2.5-flash",
    systemPrompt,
    userMessage,
    onChunk: () => {},
  });

  recordAnalyticsRun({
    agentId: 'custom-suite-generator',
    agentName: 'Custom Suite Generator',
    category: 'Suites',
    provider,
    model: MODEL_DEFAULTS[provider] || "gemini-2.5-flash",
    duration: result.duration,
  });

  // Parse the JSON response
  return extractSuiteJson(result.content);
}
