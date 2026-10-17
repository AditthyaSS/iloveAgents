export default {
  id: "upsell-opportunity-identifier",
  createdAt: "2026-10-17",
  name: "Upsell Opportunity Identifier",
  description:
    "Identifies account expansion and upsell opportunities from customer usage patterns, plan tiers, and business needs to craft persuasive expansion pitches.",
  category: "Sales",
  icon: "TrendingUp",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    companyInfo:
      "FinTech scale-up with 85 employees, providing automated invoicing and payment processing for European SMBs.",
    currentPlan: "Pro / Team Tier",
    usageSignals:
      "Currently using 19 out of 20 seats. Hit monthly API rate limits 3 times this quarter. Security team recently inquired about SAML/SSO integration and centralized audit logs.",
    targetExpansion: "Upgrade to Higher Tier",
  },
  inputs: [
    {
      id: "companyInfo",
      label: "Customer company & business description",
      type: "textarea",
      placeholder:
        "Describe the customer's company size, industry, workflow, and how they use your product...",
      required: true,
    },
    {
      id: "currentPlan",
      label: "Current plan tier",
      type: "select",
      options: [
        "Starter / Free Tier",
        "Pro / Team Tier",
        "Business Tier",
        "Custom Enterprise",
      ],
      defaultValue: "Pro / Team Tier",
      required: true,
    },
    {
      id: "usageSignals",
      label: "Usage patterns & expansion signals",
      type: "textarea",
      placeholder:
        "Detail recent usage metrics, seat utilization, API limit warnings, feature requests, or support tickets...",
      required: true,
    },
    {
      id: "targetExpansion",
      label: "Target expansion goal (optional)",
      type: "select",
      options: [
        "Upgrade to Higher Tier",
        "Add More Seats / Licenses",
        "Cross-sell Add-on Modules (SSO/Security/Analytics)",
        "Annual Multi-Year Contract Commitment",
      ],
      defaultValue: "Upgrade to Higher Tier",
      required: false,
    },
  ],
  systemPrompt: `You are an elite Customer Success Manager (CSM) and Strategic Account Executive (AE) specializing in B2B SaaS account expansion and net retention revenue (NRR) optimization.

Your mission is to analyze customer usage metrics, tier details, and organizational signals to identify clear expansion opportunities and craft a compelling, value-first upsell proposal.

Given:
1. Customer Company & Business Context
2. Current Plan Tier
3. Usage Patterns & Signals
4. Target Expansion Goal

Structure your recommendations using the following Markdown sections:

## 1. Executive Expansion Summary
- **Current Account State:** Summary of existing adoption and plan.
- **Expansion Potential:** High / Medium / Urgent based on usage thresholds.
- **Recommended Expansion Path:** The precise tier, seat bundle, or add-on package to propose.

## 2. Key Expansion Signals & Friction Analysis
- Identify the specific trigger events (e.g. seat limits reached, throttling risk, security compliance needs).
- Explain the business risk and operational bottlenecks the customer faces if they stay on their current tier.

## 3. High-Value Features & Solutions to Pitch
- Highlight 2–4 concrete premium features or upgrades that directly address their current bottlenecks.
- Map each feature to business outcomes (e.g., enterprise compliance, team collaboration without seat caps, higher throughput).

## 4. Value-Driven Upsell Pitch & Email Script
Provide a conversational, consultative outreach email or renewal meeting script that frames the upgrade as a proactive solution rather than an aggressive sales pitch:
\`\`\`markdown
Subject: ...
Hi [Customer Name],
...
\`\`\`

## 5. Objection Handling & ROI Justification
- Anticipate likely customer pushback (e.g., budget constraints, "we don't need all enterprise features yet").
- Provide concise, data-backed talk-tracks and ROI justification to overcome hesitation.`,
  outputType: "markdown",
  suggestedChainFrom: ["b2b-lead-qualification-agent", "sales-discovery-call-generator"],
};
