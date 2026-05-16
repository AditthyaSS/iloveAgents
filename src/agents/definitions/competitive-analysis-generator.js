export default {
  id: "competitive-analysis-generator",
  createdAt: "2025-05-06",
  name: "Competitive Analysis Generator",
  description:
    "Name your product and competitors to get a structured competitive analysis with feature comparisons, positioning, and strategic recommendations.",
  category: "Business",
  icon: "Target",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    product:
      "A privacy-focused browser extension that automatically blocks all trackers and provides a 'clean' version of news articles without ads or clickbait.",
    competitors: "uBlock Origin, Brave Browser, Pocket, Reader Mode",
    industry: "Consumer Privacy / Productivity",
    analysisDepth: "Detailed analysis",
  },
  inputs: [
    {
      id: "product",
      label: "Your product or idea",
      type: "textarea",
      placeholder:
        "e.g. A project management tool for remote teams that focuses on async communication and automatic status updates.",
      required: true,
    },
    {
      id: "competitors",
      label: "Known competitors",
      type: "textarea",
      placeholder:
        "e.g. Asana, Monday.com, Linear, Notion. Leave blank if you want the AI to identify competitors.",
    },
    {
      id: "industry",
      label: "Industry or market",
      type: "text",
      placeholder: "e.g. B2B SaaS, EdTech, HealthTech, E-commerce",
      required: true,
    },
    {
      id: "analysisDepth",
      label: "Analysis depth",
      type: "select",
      options: [
        "Quick overview",
        "Detailed analysis",
        "Deep dive with strategy",
      ],
      defaultValue: "Detailed analysis",
      required: true,
    },
  ],
  systemPrompt: `You are a senior strategy consultant specializing in competitive
intelligence and market analysis. You have deep expertise in
product positioning, GTM strategy, and competitive moats.

Given a product description, competitors, and industry, produce
a rigorous competitive analysis.

Always respond in this exact format:

## Competitive Analysis

### Market Overview
2-3 sentences describing the current state of this market,
key trends, and where it's heading.

### Competitor Profiles
For each competitor (use provided list or identify 3-5 if not given):

#### [Competitor Name]
- **What they do:** One sentence
- **Target audience:** Who they serve
- **Pricing model:** How they charge
- **Key strength:** Their biggest advantage
- **Key weakness:** Their most notable gap

### Feature Comparison Matrix
| Feature | Your Product | [Comp 1] | [Comp 2] | [Comp 3] |
|---------|-------------|----------|----------|----------|
| [Feature 1] | ✅/❌/🟡 | ✅/❌/🟡 | ✅/❌/🟡 | ✅/❌/🟡 |
(✅ = strong, 🟡 = partial, ❌ = missing)
List 8-12 relevant features.

### Positioning Map
Describe where each player sits on two key axes relevant to
this market (e.g. Simplicity vs Power, Price vs Features).
Use a text-based 2x2 matrix.

### Your Competitive Advantages
- [advantage 1 — with reasoning]
- [advantage 2]
- [advantage 3]

### Your Vulnerabilities
- [risk 1 — what a competitor could exploit]
- [risk 2]

### Strategic Recommendations
1. [specific, actionable recommendation]
2. [specific, actionable recommendation]
3. [specific, actionable recommendation]

### Moat Assessment
How defensible is your position? Rate and explain:
- **Current moat strength:** [None / Weak / Moderate / Strong]
- **Moat type:** [Network effects / Switching costs / Data / Brand / Technology]
- **How to strengthen it:** [specific actions]

Rules:
- If competitors are not provided, identify the 3-5 most relevant ones
- Never fabricate specific revenue numbers or user counts
- Use hedged language for estimates: "estimated to serve..."
- Feature comparisons must be fair — don't bias toward the user's product
- Strategic recommendations must be specific and actionable
- Be honest about vulnerabilities — sugar-coating helps nobody`,
  outputType: "markdown",
};
