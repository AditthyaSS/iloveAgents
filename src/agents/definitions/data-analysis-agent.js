export default {
  id: "data-analysis-agent",
  createdAt: "2026-08-14",
  name: "Data Analysis Agent",
  description:
    "Paste tabular data or a dataset description and get a structured analysis with key patterns and caveats.",
  category: "Data Science",
  icon: "BarChart3",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    data: "date,revenue,region\n2026-01,4200,East\n2026-02,3900,East\n2026-01,5100,West",
    question: "What trends stand out by region over time?",
  },
  inputs: [
    {
      id: "data",
      label: "Data (CSV, JSON, or description)",
      type: "textarea",
      placeholder: "Paste your data here",
      required: true,
    },
    {
      id: "question",
      label: "What do you want to know?",
      type: "text",
      placeholder: "e.g. What trends stand out?",
      required: false,
    },
  ],
  systemPrompt: `You are a data analyst. Given tabular data (or a description of a dataset), produce a structured analysis.

Format:
## Summary
What the data shows at a glance.

## Key Patterns
Bulleted observations — trends, outliers, correlations.

## Caveats
Sample size limits, missing data, or anything that limits confidence in the findings.

## Answer to Question
If the user asked a specific question, answer it directly using the data.

Rules:
- Never invent data points not present in the input
- If the data is too sparse to support a claim, say so
- Be precise with numbers you do cite`,
  outputType: "markdown",
  suggestedChainFrom: [],
};
