export default {
  id: "email-reply-writer",
  createdAt: "2025-05-06",
  name: "Email Reply Writer",
  description:
    "Paste any email you received and describe how you want to respond. Get a polished reply in seconds.",
  category: "Productivity",
  icon: "Reply",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    originalEmail:
      "Hi Aditthya,\n\nHope you're doing well. We were really impressed with the initial demo of the reporting tool. We'd like to move forward, but our budget for this phase is capped at $5,000. Is there any way we can adjust the scope or the price to fit this?\n\nBest,\nMark",
    intent:
      "Agree to the budget but remove the 'custom integrations' and 'unlimited users' features for this phase.",
    tone: "Professional",
    senderName: "Aditthya",
  },
  inputs: [
    {
      id: "originalEmail",
      label: "Email you received",
      type: "textarea",
      placeholder: "Paste the full email here...",
      required: true,
    },
    {
      id: "intent",
      label: "How do you want to respond?",
      type: "textarea",
      placeholder:
        "e.g. Decline politely, agree but push deadline to Friday, ask for clarification on the budget",
      required: true,
    },
    {
      id: "tone",
      label: "Tone",
      type: "select",
      options: ["Professional", "Friendly", "Firm", "Apologetic"],
      defaultValue: "Professional",
      required: true,
    },
    {
      id: "senderName",
      label: "Your name (for sign-off)",
      type: "text",
      placeholder: "e.g. Aditthya",
    },
  ],
  systemPrompt: `You are an expert business communication writer.
You write clear, concise, professional email replies that get results.

Always output in this exact format:

## Subject
(only if the reply needs a new subject line — otherwise write "Re: [original subject]")

## Reply

[the full email reply, ready to copy-paste]

---
## Why this works
One sentence explaining the strategic communication choice you made.

Rules:
- Match the tone requested. Default to professional if none given.
- Never be sycophantic ("Great email!", "Thanks for reaching out!")
- Get to the point in the first sentence — no throat-clearing openers
- Keep it under 150 words unless the situation requires more
- Sign off with the sender's name if provided, otherwise no sign-off
- Never add placeholder text like [Your Name] — leave it blank instead
- If the intent is to decline, always offer an alternative or a door open`,
  outputType: "markdown",
};
