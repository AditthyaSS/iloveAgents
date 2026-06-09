export default {
  id: "follow-up-email-sequence-writer",
  createdAt: "2026-06-06",
  name: "Follow-Up Email Sequence Writer",
  description:
    "Generate a strategic 5-email follow-up sequence spaced over 2 weeks with varied psychological angles based on your product and prospect context.",
  category: "Sales",
  icon: "Mail",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    product: "Nexura - An AI-powered platform that automates lead generation by analyzing social signals and intent data in real-time.",
    prospectSituation: "VP of Sales at a B2B SaaS company struggling with manual prospecting and low conversion rates from cold outreach.",
    lastInteraction: "Completed a 30-minute product demo where they liked the automation features but expressed concern over team onboarding timelines."
  },
  inputs: [
    {
      id: "product",
      label: "Product",
      type: "textarea",
      placeholder: "Describe the product or service being offered...",
      required: true,
    },
    {
      id: "prospectSituation",
      label: "Prospect Situation",
      type: "textarea",
      placeholder: "Describe the prospect's current situation, pain points, or needs...",
      required: true,
    },
    {
      id: "lastInteraction",
      label: "Last Interaction",
      type: "textarea",
      placeholder: "Describe the most recent interaction with the prospect...",
      required: true,
    }
  ],
  systemPrompt: `You are an expert sales communication strategist and elite B2B sales copywriter.

Your task is to generate a comprehensive, professional 5-email follow-up sequence based on the provided Product, Prospect Situation, and Last Interaction.

The sequence must be strictly structured across a 14-day period (2 weeks) using a different psychological angle for each step to maximize response rates without sounding desperate or overbearing:

- Email 1 (Day 1 - Recap and Appreciation): Summarize the core alignment discussed in the last interaction, express appreciation for their time, and link back to their primary goal.
- Email 2 (Day 3 - Additional Value or Insight): Share a relevant industry insight, statistic, or helpful tip tailored to their prospecting workflow.
- Email 3 (Day 6 - Social Proof or Success Story): Share a quick, realistic customer success framework highlighting how a similar company solved their conversion challenges.
- Email 4 (Day 10 - Objection Handling): Proactively address the onboarding or timeline friction mentioned during your interaction, outlining how smoothly implementation actually goes.
- Email 5 (Day 14 - Final Check-In): A short, polite breakup email stating you assume timing isn't right, closing the loop while leveraging loss aversion.

Every individual email in the sequence must include:
1. A distinct, compelling Subject Line.
2. The specific timing details (e.g., "Timing: Day 3").
3. A brief statement of its strategic purpose.
4. A concise, readable body text block.
5. A clear, single, low-friction Call to Action (CTA).

Rules:
- Keep emails short, human, and highly scannable (clear line breaks).
- Avoid generic corporate clichés, fluff, and fake scarcity tactics.
- Use clean markdown formatting.`,
  outputType: "markdown",
  suggestedChainFrom: [
    "cold-email-writer",
    "linkedin-outreach-message-writer",
  ],
};