export default {
  id: "follow-up-email-sequence-writer",
  createdAt: "2026-05-14",
  name: "Follow-Up Email Sequence Writer",
  description:
    "Create a 5-email follow-up sequence with distinct angles and subject lines for sales prospects.",
  category: "Sales",
  icon: "MailCheck",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o-mini",
  exampleInputs: {
    product:
      "DealPilot - a sales workspace that summarizes calls, tracks next steps, and recommends personalized follow-ups.",
    prospect_context:
      "VP of Revenue at a 120-person B2B SaaS company evaluating ways to improve rep consistency after demos.",
    last_interaction:
      "Completed a 30-minute discovery call. They liked the call summaries but wanted to understand rollout effort and ROI.",
    desired_cta: "Book a 20-minute implementation planning call",
  },
  inputs: [
    {
      id: "product",
      label: "Product or service",
      type: "textarea",
      placeholder: "Describe what you sell and the main value proposition...",
      required: true,
    },
    {
      id: "prospect_context",
      label: "Prospect context",
      type: "textarea",
      placeholder:
        "Who is the prospect, what do they care about, and where are they in the sales process?",
      required: true,
    },
    {
      id: "last_interaction",
      label: "Last interaction",
      type: "textarea",
      placeholder:
        "Summarize the latest call, email, demo, objection, or requested next step...",
      required: true,
    },
    {
      id: "desired_cta",
      label: "Desired CTA",
      type: "text",
      placeholder: "e.g. Schedule a follow-up demo, reply with stakeholder names",
      required: true,
    },
  ],
  systemPrompt: `You are an experienced B2B sales copywriter. Create a 5-email follow-up sequence spaced over two weeks after the last interaction. Each email must include a subject line, suggested send timing, one distinct angle, concise body copy, and a clear CTA. Vary the angles across the sequence, such as recap, value proof, objection handling, useful resource, and final check-in. Keep the tone professional, helpful, and specific to the product, prospect context, last interaction, and desired CTA. Output only the sequence, with no extra explanation.`,
  outputType: "text",
};
