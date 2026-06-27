import { streamAgent } from "./llmAdapter";

const MODELS_INFO = `
OpenAI Models:
- GPT-4o: Best overall OpenAI model, strong reasoning and complex tasks
- GPT-4o Mini: Fast and cheap OpenAI model, good for simple straightforward tasks
- o1-mini: Optimised for reasoning and logic heavy tasks, slower but thorough
- o3-mini: Latest OpenAI reasoning model, best for math, code and analytical tasks

Anthropic Models:
- Claude 3.5 Sonnet: Best Anthropic model, excellent structured markdown output and reasoning
- Claude 3.5 Haiku: Fast and affordable Anthropic model, good for quick text generation
- Claude 3 Opus: Most powerful Claude model, best for nuanced complex writing tasks

Gemini Models:
- Gemini 1.5 Flash: Fast and affordable, good for simple generation tasks
- Gemini 1.5 Pro: Large 1M token context window, best for long documents and PDFs
- Gemini 2.0 Flash (Exp): Latest experimental Gemini, fast with improved quality
- Gemini 2.5 Flash: Fastest and most efficient Gemini model, best for quick outputs
`;

export async function analyseModels(agent, apiKey, provider) {
  const agentContext = `
    Agent name: ${agent.name}
    Description: ${agent.description}
    System prompt purpose: ${agent.systemPrompt.slice(0, 300)}
  `;

  const systemPrompt = `You are an AI model selection expert. 
Given an AI agent's purpose, recommend which LLM model is best suited for it.
Always respond in this exact markdown format:

## Model Recommendations

| Model | Provider | Suitability | Reason |
|-------|----------|-------------|--------|
| Model name | OpenAI/Anthropic/Gemini | ⭐⭐⭐⭐⭐ | One line reason |

Show all 11 models in the table ranked by suitability for this specific agent.

## ✅ Top Pick: [Model Name]
[One sentence explaining why this is the best fit]

## 💰 Budget Pick: [Model Name]  
[One sentence on the best affordable option]

## ⚡ Speed Pick: [Model Name]
[One sentence on the fastest option]

Available models:
${MODELS_INFO}

Be specific and practical. Consider context window, speed, cost and output quality for the agent's specific use case.`;

  const userMessage = `Analyse the best model for this agent:\n${agentContext}`;

  const MODEL_DEFAULTS = {
    gemini: "gemini-2.5-flash",
    anthropic: "claude-3.5-Haiku",
    openai: "gpt-4o-mini",

  };

  const result = await streamAgent({
    provider,
    apiKey,
    model: MODEL_DEFAULTS[provider] || "gemini-2.5-flash",
    systemPrompt,
    userMessage,
    onChunk: () => {},
  });

  return result.content;
}
