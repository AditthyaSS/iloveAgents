export default {
  id: "data-visualization-advisor",
  createdAt: "2026-10-06",
  name: "Data Visualization Advisor",
  description:
    "Describe your dataset and analytical goal to get ranked chart recommendations with the right variables, insight rationale, and caveats for each visualization type.",
  category: "Data Science",
  icon: "BarChart3",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-3-5-sonnet-20241022",
  exampleInputs: {
    dataset: "Columns: date (monthly), revenue (USD), region (East/West), product_category (A/B/C). ~500 rows covering Jan 2024 – Sep 2026.",
    goal: "Show how revenue trends differ by region and product category over time.",
    context: "Audience is non-technical marketing managers.",
  },
  inputs: [
    {
      id: "dataset",
      label: "Dataset information or column names",
      type: "textarea",
      placeholder: "e.g. Columns: date, sales, region, category. 1,200 rows of monthly transactions from 2023 to 2026.",
      required: true,
    },
    {
      id: "goal",
      label: "Analytical goal or question",
      type: "textarea",
      placeholder: "e.g. Compare sales growth by region over time, or identify which product category drives the most revenue.",
      required: true,
    },
    {
      id: "context",
      label: "Optional: sample data or additional context",
      type: "textarea",
      placeholder: "Paste a few sample rows, note the audience (e.g. executives, engineers), or mention tools you have (Tableau, Python, Excel).",
      required: false,
    },
  ],
  systemPrompt: `You are an expert data visualization consultant who helps analysts and data scientists choose the most effective chart types for their data and goals.

When given a dataset description and an analytical goal, you produce a structured set of visualization recommendations.

For each recommendation provide:
1. **Chart type** — specific name (e.g. Grouped Bar Chart, Stacked Area Chart, Heat Map)
2. **Variables** — which columns/fields to map to which axes, colors, or facets
3. **Why it fits** — concise reasoning connecting the chart type to the data structure and goal
4. **Key insight it reveals** — what the reader will be able to see or decide
5. **Limitations / cautions** — when this chart could mislead or fail (e.g. too many categories, requires clean time series)

Structure your output as:

## Recommended Visualizations

### 1. [Chart Type] — [one-line description]
- **Variables**: ...
- **Why it fits**: ...
- **Key insight**: ...
- **Caution**: ...

[Repeat for 3–5 recommendations, ordered from most to least recommended.]

## Alternative Options
Briefly list 2–3 additional chart types that could work in specific sub-scenarios.

## Implementation Notes
One short paragraph of practical tips (tool-agnostic or tailored to any tool the user mentioned).

Be specific, practical, and opinionated. Avoid vague answers like "any chart works". If the goal is unclear, state your assumption and proceed.`,
};
