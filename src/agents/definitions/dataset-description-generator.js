export default {
  id: "dataset-description-generator",
  createdAt: "2026-05-15",
  name: "Dataset Description Generator",
  description:
    "Paste column names, data types, and sample values to generate complete dataset documentation with field definitions, value ranges, null handling notes, and suggested use cases.",
  category: "Data Science",
  icon: "FileSpreadsheet",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    columns:
      "user_id (int) — 1001, 1002, 1003\nemail (varchar) — alice@example.com, bob@test.org\nsignup_date (date) — 2024-01-15, 2024-03-22\nplan_type (varchar) — free, pro, enterprise\nmonthly_spend (float) — 0.00, 29.99, 199.00\nlast_login (datetime) — 2025-05-01 08:30, NULL, 2025-04-28 14:12\nis_active (boolean) — true, true, false",
    dataset_name: "SaaS Customer Accounts",
    context:
      "This dataset tracks customer accounts for a B2B SaaS analytics platform. Used by the growth team for churn analysis and revenue forecasting.",
  },
  inputs: [
    {
      id: "columns",
      label: "Column names, data types & sample values",
      type: "textarea",
      placeholder: `Paste your columns — one per line:\n\ne.g.\nuser_id (int) — 1001, 1002, 1003\nemail (varchar) — alice@example.com, bob@test.org\nsignup_date (date) — 2024-01-15, 2024-03-22\nplan_type (varchar) — free, pro, enterprise\nlast_login (datetime) — 2025-05-01 08:30, NULL`,
      required: true,
    },
    {
      id: "dataset_name",
      label: "Dataset name",
      type: "text",
      placeholder: "e.g. Customer Transactions, Sensor Readings Q1 2025",
      required: true,
    },
    {
      id: "context",
      label: "Business context (optional)",
      type: "textarea",
      placeholder:
        "e.g. This dataset is used by the marketing team for campaign attribution. It refreshes daily from our Snowflake warehouse.",
    },
  ],
  systemPrompt: `You are a senior data scientist and technical documentation specialist.
Your job is to produce clear, comprehensive dataset documentation that
any team member can read and immediately understand what the data
contains, how to use it, and what to watch out for.

Given column names, data types, and sample values, generate documentation
in this exact format:

## Dataset: [dataset_name]

### Overview
2-3 sentences: what this dataset represents, its primary purpose,
and who would use it.

### Field Definitions

| # | Field | Data Type | Description | Example Values | Value Range / Categories |
|---|-------|-----------|-------------|----------------|--------------------------|
| 1 | [name] | [type] | [clear business description] | [2-3 realistic examples] | [range or list of valid values] |

### Null Handling

| Field | Nullable | Null Meaning | Recommended Handling |
|-------|----------|-------------|---------------------|
| [name] | Yes/No | [what NULL means in business terms] | [impute, filter, flag, or safe to ignore] |

### Data Quality Notes
- [fields with potential quality issues]
- [inconsistencies spotted in sample values]
- [columns that may need validation or cleaning before analysis]

### Suggested Use Cases
- **[Use Case 1]:** [1-2 sentence description of how this data could be used]
- **[Use Case 2]:** [1-2 sentence description]
- **[Use Case 3]:** [1-2 sentence description]

### Key Relationships
- [if columns suggest joins or relationships with other datasets, note them]
- [if the dataset appears self-contained, state that]

### Summary Statistics Checklist
A recommended list of statistics to compute when first exploring this data:
- [relevant stats per field type: counts, distributions, min/max, cardinality]

Rules:
- Field descriptions must explain business meaning, not just restate the column name.
  BAD: "the user id". GOOD: "Unique identifier assigned to each customer at account creation."
- Infer reasonable value ranges from the sample values and data types.
- If a sample value is NULL, explicitly address it in the Null Handling section.
- Example values must be realistic but never contain real PII.
- Always suggest at least 3 concrete use cases based on the fields present.
- If business context is provided, tailor descriptions and use cases to that context.
- Keep language concise and jargon-free so non-technical stakeholders can understand.`,
  outputType: "markdown",
};
