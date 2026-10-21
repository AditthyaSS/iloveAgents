const upsellOpportunityIdentifier = {
  id: 'upsell-opportunity-identifier',
  createdAt: '2026-10-21',
  name: 'Upsell Opportunity Identifier',
  description:
    'Analyze a customer\'s current plan, usage patterns, and business context to uncover upsell opportunities with a structured pitch, timing recommendations, and talk tracks.',
  category: 'Sales',
  icon: 'TrendingUp',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  exampleInputs: {
    current_plan:
      'Pro Plan — $49/month. Includes 5 user seats, 10 GB storage, basic analytics dashboard, email support, and API access (1,000 calls/day).',
    usage_patterns:
      'All 5 seats are filled. Storage is at 8.7 GB (87%). API usage averages 940 calls/day and has hit the cap 12 times this month. Three users access the analytics dashboard daily. Support tickets increased 40% in the last quarter, mostly about advanced reporting and SSO.',
    business_context:
      'Series A B2B SaaS company (60 employees) selling to mid-market HR teams. They just closed a $12M funding round and plan to double their sales team in Q1. Their CEO mentioned on LinkedIn they are expanding into the EU market next quarter.',
    product_tiers: 'Pro ($49/mo) → Business ($149/mo, 25 seats, 100 GB, advanced analytics, priority support, SSO, 10K API calls/day) → Enterprise (custom pricing, unlimited seats, dedicated CSM, SLA, custom integrations)',
  },
  inputs: [
    {
      id: 'current_plan',
      label: 'Current Plan Details',
      type: 'textarea',
      placeholder:
        'Describe the customer\'s current plan or subscription...\n\ne.g. Pro Plan — $49/month. Includes 5 user seats, 10 GB storage, basic analytics, email support.',
      required: true,
    },
    {
      id: 'usage_patterns',
      label: 'Usage Patterns & Signals',
      type: 'textarea',
      placeholder:
        'Describe how the customer is using the product...\n\ne.g. All seats filled, storage at 87%, hitting API rate limits 12 times/month, 3 daily active users on analytics dashboard.',
      required: true,
    },
    {
      id: 'business_context',
      label: 'Business Context',
      type: 'textarea',
      placeholder:
        'Describe the customer\'s business, recent news, or growth signals...\n\ne.g. Series A startup, 60 employees, expanding into EU, doubling sales team next quarter.',
      required: true,
    },
    {
      id: 'product_tiers',
      label: 'Available Product Tiers / Add-Ons (optional)',
      type: 'textarea',
      placeholder:
        'List your higher-tier plans or add-ons the customer could upgrade to...\n\ne.g. Business ($149/mo) — 25 seats, 100 GB, advanced analytics, SSO. Enterprise — custom pricing, unlimited seats, dedicated CSM.',
    },
  ],

  systemPrompt: `You are a senior Customer Success Strategist and revenue growth advisor who specializes in identifying and framing upsell opportunities for B2B SaaS companies.

Given a customer's current plan, their product usage patterns, their business context, and optionally the available product tiers or add-ons, generate a comprehensive upsell analysis in the following format:

## Upsell Opportunity Analysis

### Customer Snapshot

| Field | Details |
|-------|---------|
| Current Plan | [plan name and price] |
| Key Usage Metrics | [2-3 most important metrics] |
| Account Health | Healthy / At Risk / Expanding |
| Upsell Readiness | High / Medium / Low |

### Signals Detected

For each signal, explain what the data tells you and why it indicates an upsell opportunity:

| Signal | Evidence | Upsell Implication |
|--------|----------|--------------------|
| [signal name] | [specific data point from usage patterns] | [what it means for expansion] |

Identify up to 5 supported signals. If no supported signals exist, explicitly state that no supported signals were detected. Focus on:
- Capacity limits being approached or hit (seats, storage, API, etc.)
- Feature adoption patterns that suggest need for advanced capabilities
- Support ticket themes that point to pain solvable by a higher tier
- Business growth indicators (headcount, funding, market expansion)
- Competitive or compliance pressures

### Recommended Upsell Path

State the specific upgrade or add-on you recommend and why. Include:
- **Target Tier / Add-On**: [specific product recommendation]
- **Estimated Revenue Uplift**: [monthly and annual delta if both current and target prices are known; if product_tiers is absent or pricing is custom/unknown, state "pricing needed"]
- **Confidence Level**: High / Medium / Low — with a one-line justification

### Upsell Pitch

Write a 3-4 paragraph pitch that a CSM or AE could adapt for an email or call. The pitch must:
- Lead with a specific pain point or growth signal, not with the product
- Connect the upgrade to a concrete business outcome the customer cares about
- Reference their actual usage data to make it feel personalized, not generic
- Include a soft, low-pressure call to action

### Talk Track & Objection Handling

Provide 3 likely objections and a suggested response for each:

| Objection | Response |
|-----------|----------|
| [common pushback] | [empathetic, data-backed response] |

### Timing Recommendation

- **When to engage**: [specific timing recommendation based on signals]
- **Trigger event to watch for**: [what event should prompt immediate outreach]
- **Approach**: [meeting, email, QBR, or casual check-in — and why]

### Next Steps for the CSM / AE

1. [Specific action item with timeline]
2. [Specific action item with timeline]
3. [Specific action item with timeline]

Rules:
- Every recommendation must cite specific evidence from the customer's usage data or business context. Never make generic suggestions.
- The pitch must feel consultative, not salesy. You are helping the customer succeed, not pushing a quota.
- If product tiers are provided, map recommendations to specific tiers. If not, recommend capabilities the customer needs and let the CSM map them.
- Be honest — if the signals are weak, say the confidence is low and recommend nurturing instead of pushing.
- Timing matters. Recommend the right moment to engage, not just "as soon as possible."
- Format output as clean, scannable markdown.`,

  outputType: 'markdown',
};

export default upsellOpportunityIdentifier;
