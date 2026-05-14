export default {
  id: "sales-objection-handler",
  createdAt: "2026-05-14",
  name: "Sales Objection Handler",
  description:
    "Turn a sales objection into empathetic, direct, and data-driven responses your reps can use in the moment.",
  category: "Sales",
  icon: "Handshake",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o-mini",
  exampleInputs: {
    product:
      "QuotaFlow - a revenue intelligence platform that highlights at-risk deals, next-best actions, and forecast changes for B2B sales teams.",
    objection:
      "It's too expensive compared with the spreadsheet process we already use.",
    buyer_context:
      "VP of Sales at a 120-person SaaS company that is missing forecast accuracy targets and preparing for a board meeting.",
    deal_stage: "Late-stage evaluation",
  },
  inputs: [
    {
      id: "product",
      label: "Product or service",
      type: "textarea",
      placeholder: "Describe what you sell and the outcome it creates...",
      required: true,
    },
    {
      id: "objection",
      label: "Objection",
      type: "textarea",
      placeholder: "e.g. It's too expensive, we are happy with our current tool, call me next quarter...",
      required: true,
    },
    {
      id: "buyer_context",
      label: "Buyer context",
      type: "textarea",
      placeholder: "Who is raising the objection? Include role, industry, pains, or current situation.",
      required: true,
    },
    {
      id: "deal_stage",
      label: "Deal stage",
      type: "select",
      options: [
        "Discovery",
        "Demo completed",
        "Late-stage evaluation",
        "Procurement",
        "Renewal or expansion",
      ],
      defaultValue: "Discovery",
      required: true,
    },
  ],
  systemPrompt: `You are a senior B2B sales coach who helps account executives handle objections without sounding scripted. Use the product, objection, buyer context, and deal stage to create practical responses a rep can use tomorrow.

Return the answer in this exact structure:

## Objection diagnosis
Briefly explain what the buyer may really be worried about and what the rep should avoid doing.

## Response options
### 1. Empathetic response
- Response: A concise talk track that validates the concern and reopens the conversation.
- When to use it: The buyer's tone or context where this response works best.
- Follow-up question: One question that uncovers the real blocker.

### 2. Direct response
- Response: A clear, confident talk track that reframes the objection.
- When to use it: The buyer's tone or context where this response works best.
- Follow-up question: One question that moves the deal forward.

### 3. Data-driven response
- Response: A talk track that uses measurable business impact without inventing unsupported statistics.
- When to use it: The buyer's tone or context where this response works best.
- Follow-up question: One question that quantifies value.

## Coaching note
One short reminder about delivery, tone, or timing.

Keep every response natural and specific. Do not use pushy, manipulative, or generic sales language.`,
  outputType: "markdown",
};
