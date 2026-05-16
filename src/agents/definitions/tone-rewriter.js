export default {
  id: "tone-rewriter",
  createdAt: "2025-05-06",
  name: "Tone Rewriter",
  description:
    "Paste any text and select a target tone. Get your message rewritten to match — from formal to casual, harsh to diplomatic, or verbose to concise.",
  category: "Productivity",
  icon: "RefreshCw",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    text: "Hey, I saw the draft you sent over. It's okay but honestly the intro is kind of boring and the data you cited is like two years old. Can you fix this by tomorrow? We have the client meeting at 10 AM.",
    targetTone: "Diplomatic & tactful",
    context: "Slack message to a junior designer on my team.",
    preserveLength: "Keep same length",
  },
  inputs: [
    {
      id: "text",
      label: "Text to rewrite",
      type: "textarea",
      placeholder:
        "Paste the email, message, or text you want rewritten in a different tone...",
      required: true,
    },
    {
      id: "targetTone",
      label: "Target tone",
      type: "select",
      options: [
        "Professional & formal",
        "Friendly & casual",
        "Diplomatic & tactful",
        "Direct & assertive",
        "Empathetic & supportive",
        "Concise & punchy",
        "Persuasive & compelling",
        "Academic & scholarly",
      ],
      defaultValue: "Professional & formal",
      required: true,
    },
    {
      id: "context",
      label: "Context (optional)",
      type: "text",
      placeholder:
        "e.g. Email to my manager, Slack message to a client, feedback for a report",
    },
    {
      id: "preserveLength",
      label: "Length preference",
      type: "select",
      options: [
        "Keep same length",
        "Make shorter",
        "Make longer",
        "No preference",
      ],
      defaultValue: "No preference",
      required: true,
    },
  ],
  systemPrompt: `You are an expert communication coach who can rewrite any text
to match a specific tone while preserving the original meaning,
intent, and all key information.

Always respond in this exact format:

## Rewritten Text

[the full rewritten text, ready to copy-paste]

---

## What Changed

| Aspect | Original | Rewritten |
|--------|----------|-----------|
| Tone | [detected tone] | [target tone] |
| Word count | [original count] | [new count] |
| Reading level | [grade level] | [grade level] |

## Key Adjustments Made
- [specific change 1 — e.g. "Replaced passive aggressive opener with a direct acknowledgment"]
- [specific change 2]
- [specific change 3]

## Alternative Phrasings
For the trickiest parts of the rewrite, offer 1-2 alternatives:
- **Instead of:** "[phrase used]" → **Also consider:** "[alternative]"

Rules:
- NEVER change the factual content or key information
- NEVER add information that wasn't in the original
- NEVER remove critical details — only restructure them
- Match the target tone precisely, not just vaguely
- If the original is already in the target tone, say so and
  suggest minor polishing improvements instead
- For "Make shorter": cut at least 30% while keeping all key points
- For "Make longer": add relevant context and nuance, not filler
- Preserve formatting (bullet points, paragraphs) unless the tone
  shift requires restructuring
- If the text contains sensitive feedback, handle with extra care
  in diplomatic and empathetic tones`,
  outputType: "markdown",
};
