import { streamAgent } from "./llmAdapter";
import { recordAnalyticsRun } from "./useAnalytics";
import { suites } from "../suites/suitesData";

const MODEL_DEFAULTS = {
  gemini: "gemini-2.5-flash",
  anthropic: "claude-3-5-haiku-20241022",
  openai: "gpt-4o-mini",
};

const KNOWN_PROVIDERS = Object.keys(MODEL_DEFAULTS);
const MAX_GOAL_CHARS = 1000;

export function resolveSuiteModel(provider) {
  const safe = KNOWN_PROVIDERS.includes(provider) ? provider : "openai";
  return { provider: safe, model: MODEL_DEFAULTS[safe] };
}

export function buildSuiteUserMessage(goal) {
  const trimmed = typeof goal === "string" ? goal.trim() : "";
  if (!trimmed) throw new Error("Describe your goal first.");
  return `My goal is: ${trimmed.slice(0, MAX_GOAL_CHARS)}`;
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

  const userMessage = buildSuiteUserMessage(goal);
  const { provider: safeProvider, model } = resolveSuiteModel(provider);

  const result = await streamAgent({
    provider: safeProvider,
    apiKey,
    model,
    systemPrompt,
    userMessage,
    onChunk: () => {},
  });

  recordAnalyticsRun({
    agentId: 'custom-suite-generator',
    agentName: 'Custom Suite Generator',
    category: 'Suites',
    provider: safeProvider,
    model,
    duration: result.duration,
  });

  // Parse the JSON response
  const clean = result.content.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}
