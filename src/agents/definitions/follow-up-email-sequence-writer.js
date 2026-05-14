export default {
  id: "follow-up-email-sequence-writer",
  createdAt: "2026-05-14",
  name: "Follow-Up Email Sequence Writer",
  description:
    "Create a two-week, five-email follow-up sequence with varied angles and ready-to-send subject lines.",
  category: "Sales",
  icon: "MailPlus",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o-mini",
  exampleInputs: {
    product:
      "PipelineIQ - a revenue intelligence platform that flags stalled deals and recommends next-best actions for account executives.",
    prospectSituation:
      "VP of Sales at a 120-person SaaS company. They liked the first demo but need to align with RevOps before moving forward.",
    lastInteraction:
      "Discovery call ended with interest in a pilot, but the prospect asked for time to compare reporting needs with their current CRM dashboards.",
    desiredOutcome: "Book a 30-minute pilot planning call",
    tone: "Consultative",
  },
  inputs: [
    {
      id: "product",
      label: "Product or offer",
      type: "textarea",
      placeholder: "Describe what you sell and the main value proposition...",
      required: true,
    },
    {
      id: "prospectSituation",
      label: "Prospect situation",
      type: "textarea",
      placeholder:
        "Who is the prospect, what do they care about, and where are they in the buying process?",
      required: true,
    },
    {
      id: "lastInteraction",
      label: "Last interaction",
      type: "textarea",
      placeholder:
        "Summarize the last call, reply, objection, demo, or meeting notes...",
      required: true,
    },
    {
      id: "desiredOutcome",
      label: "Desired outcome",
      type: "text",
      placeholder: "e.g. Schedule a demo, get budget approval, revive the conversation",
      required: true,
    },
    {
      id: "tone",
      label: "Tone",
      type: "select",
      options: ["Consultative", "Friendly", "Direct", "Executive"],
      defaultValue: "Consultative",
      required: true,
    },
  ],
  systemPrompt: `You are an expert sales follow-up strategist.
Create a practical five-email follow-up sequence for the product, prospect situation, last interaction, desired outcome, and tone provided.

Output in this exact format:

## Follow-Up Sequence

### Email 1 — Day 1: [angle]
**Subject:** [subject line]
**Body:**
[ready-to-send email]

### Email 2 — Day 3: [angle]
**Subject:** [subject line]
**Body:**
[ready-to-send email]

### Email 3 — Day 6: [angle]
**Subject:** [subject line]
**Body:**
[ready-to-send email]

### Email 4 — Day 10: [angle]
**Subject:** [subject line]
**Body:**
[ready-to-send email]

### Email 5 — Day 14: [angle]
**Subject:** [subject line]
**Body:**
[ready-to-send email]

Rules:
- Use a different angle for every email, such as recap, business case, social proof, helpful resource, and polite breakup.
- Keep each email under 120 words.
- Personalize around the prospect situation and last interaction.
- Include one clear call to action tied to the desired outcome.
- Do not use pushy, guilt-based, or manipulative language.
- Do not add explanations outside the requested sequence.`,
  outputType: "markdown",
};
