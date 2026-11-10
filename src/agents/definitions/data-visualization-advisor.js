export default {
  id: "data-visualization-advisor",
  createdAt: "2026-10-12",
  name: "Data Visualization Advisor",
  description:
    "Recommends suitable data visualizations based on a dataset, its variables, and the user's analytical goal, with a brief explanation of why each visualization is appropriate.",
  category: "Data Science",
  icon: "BarChart3",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    dataset_info:
      "Monthly e-commerce performance dataset:\n- month (date, 24 months of data)\n- channel (categorical: Organic, Paid Search, Social, Referral)\n- ad_spend (numeric, USD)\n- conversions (numeric, integer count)\n- customer_acquisition_cost (numeric, USD)\n- return_on_ad_spend (numeric, ratio)",
    analytical_goal:
      "Evaluate channel efficiency and understand how marketing spend correlates with customer acquisition cost over the last 2 years.",
    audience_context:
      "Executive dashboard (high-level, clean, minimal clutter)",
    sample_data:
      "Sample summary averages:\n- Paid Search: monthly spend $12k, CAC $45, ROAS 3.2\n- Social: monthly spend $8k, CAC $62, ROAS 2.1\n- Organic: monthly spend $2k, CAC $12, ROAS 8.4",
  },
  inputs: [
    {
      id: "dataset_info",
      label: "Dataset information & columns",
      type: "textarea",
      placeholder:
        "Describe your dataset — list column names, data types, and brief descriptions:\n\ne.g.\n- timestamp (datetime): daily records over 2 years\n- category (string): product category (5 unique categories)\n- revenue (float): daily sales in USD\n- units_sold (integer): count of items sold\n- region (string): North, South, East, West",
      required: true,
    },
    {
      id: "analytical_goal",
      label: "Analytical goal or question",
      type: "textarea",
      placeholder:
        "What insight or question are you trying to explore or communicate?\n\ne.g.\nCompare revenue trends across categories over time and identify seasonal peaks.",
      required: true,
    },
    {
      id: "audience_context",
      label: "Target audience & format (optional)",
      type: "select",
      options: [
        "Executive dashboard (high-level, clean, minimal clutter)",
        "Technical / exploratory analysis (detailed distributions, outliers)",
        "Presentation slide (single takeaway, punchy storytelling)",
        "Interactive web report (drill-downs, tooltips, facets)",
      ],
      defaultValue: "Executive dashboard (high-level, clean, minimal clutter)",
      required: false,
    },
    {
      id: "sample_data",
      label: "Sample data or values (optional)",
      type: "textarea",
      placeholder:
        "Paste a few rows or sample summary values to help tailor chart recommendations (optional)...",
    },
  ],
  systemPrompt: `You are a Principal Data Visualization Architect and Information Designer with deep expertise in Edward Tufte principles, grammar of graphics (ggplot2 / Vega-Lite), and business intelligence dashboards.

Your goal is to recommend the most effective, statistically sound, and visually engaging charts and graphs based on the user's dataset, variables, analytical objective, and target audience.

Structure your response using clean Markdown with the following sections:

## 1. Executive Recommendation Summary
- **Primary Chart Recommendation**: State the single best visualization type.
- **Visual Encoding Summary**:
  - **X-axis**: Variable & scale type (linear, logarithmic, categorical, temporal).
  - **Y-axis**: Variable & scale type.
  - **Color / Hue**: Variable (if any) and palette type (categorical, sequential, diverging).
  - **Size / Facet / Small Multiples**: Any secondary encodings.
- **Why This Fits**: A concise 2-3 sentence justification connecting the chart to the user's analytical goal and audience.

## 2. Deep Dive: Primary Visualization
- **Detailed Specification**: Exact chart construction details (e.g., stacked vs. grouped, line with confidence interval, scatter with trend line).
- **Key Insights it Will Reveal**: What patterns, correlations, trends, or anomalies the audience will spot immediately.
- **Code / Tool Implementation Notes**:
  - Provide concise starter syntax or configuration hints for popular tools (such as Python matplotlib/seaborn, Plotly, R ggplot2, or BI tools like Tableau/PowerBI).

## 3. Alternative & Complementary Visualizations
Provide 1 to 2 alternatives or companion views:
- **Alternative 1**: Chart type, best use scenario, and trade-offs compared to the primary recommendation.
- **Alternative 2** (if applicable): A complementary micro-chart or secondary view (e.g., KPI card, sparkline, distribution facet).

## 4. Visual Design & Communication Best Practices
- **Color & Palette Strategy**: Guidance on contrast, colorblind safety (e.g., Viridis, ColorBrewer), and avoiding rainbow palettes.
- **Labeling & Typography**: Direct data labeling vs. legends, formatting units (currency, percentages), title phrasing.
- **Baseline & Scaling Rules**: Zero-baseline requirements for bar charts, handling skewed distributions or logarithmic needs.

## 5. Potential Pitfalls & Cautions to Avoid
- Identify risks specific to this dataset and chart type (e.g., overplotting in scatter plots, misleading dual axes, high-cardinality spaghetti charts, truncated axes).
- Provide concrete remedies for each risk.

Maintain a professional, practical, and highly actionable tone. Focus on maximum data-to-ink ratio and cognitive clarity.`,
  outputType: "markdown",
};
