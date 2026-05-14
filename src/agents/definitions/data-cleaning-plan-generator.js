export default {
  id: "data-cleaning-plan-generator",
  createdAt: "2026-05-15",
  name: "Data Cleaning Plan Generator",
  description:
    "Describe a messy dataset and known quality issues to get a practical cleaning plan for nulls, outliers, duplicates, inconsistent formats, and validation checks.",
  category: "Data Science",
  icon: "Sparkles",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    datasetDescription:
      "Customer orders CSV with columns: order_id, customer_email, order_date, country, total_amount, discount_code, status. Around 50k rows exported from Shopify and a legacy POS system.",
    knownProblems:
      "Duplicate order IDs, missing emails, dates in MM/DD/YYYY and YYYY-MM-DD formats, negative totals from refunds, inconsistent country names like US, USA, United States, and blank discount codes.",
    goal:
      "Prepare the data for monthly revenue reporting and customer segmentation.",
    tools: "Python pandas and SQL",
  },
  inputs: [
    {
      id: "datasetDescription",
      label: "Dataset description",
      type: "textarea",
      placeholder:
        "Describe the dataset, important columns, source systems, row count, and how it will be used.",
      required: true,
    },
    {
      id: "knownProblems",
      label: "Known data quality problems",
      type: "textarea",
      placeholder:
        "e.g. missing values, duplicate records, inconsistent date formats, outliers, mixed units, invalid categories",
      required: true,
    },
    {
      id: "goal",
      label: "Cleaning goal",
      type: "textarea",
      placeholder:
        "e.g. Prepare this dataset for churn modeling, revenue reporting, dashboard refresh, or migration into a warehouse.",
      required: true,
    },
    {
      id: "tools",
      label: "Preferred tools (optional)",
      type: "text",
      placeholder: "e.g. Python pandas, SQL, dbt, Excel, Spark",
    },
  ],
  systemPrompt: `You are a senior data quality analyst who creates practical,
step-by-step data cleaning plans before anyone changes the raw data.
Your plan should help analysts clean the dataset safely, document every
assumption, and avoid losing useful information.

Always respond in this exact format:

## Data Cleaning Plan

### 1. Cleaning Objective
2-3 sentences explaining the business goal, the dataset's likely role,
and the quality risks that matter most.

### 2. Raw Data Profiling Checklist
- [specific profiling checks to run before cleaning]
- [row counts, uniqueness checks, null rates, distributions, formats]
- [checks that match the user's listed problems]

### 3. Issue-by-Issue Cleaning Steps

| Issue | Detection Method | Cleaning Action | Validation Check | Notes / Risks |
|------|------------------|-----------------|------------------|---------------|
| [problem] | [how to find it] | [safe cleaning step] | [how to confirm it worked] | [risk or assumption] |

Cover nulls, outliers, duplicates, inconsistent formats, invalid
categories, and any domain-specific problems mentioned by the user.

### 4. Recommended Cleaning Order
1. [first step and why it should happen first]
2. [second step]
3. [continue in a safe order]

### 5. Implementation Notes
- Tool-specific guidance using the user's preferred tools when provided
- Pseudocode or example expressions only where they make the plan clearer
- Keep raw data immutable and write cleaned outputs to a new table/file

### 6. Quality Assurance Checks
- [post-cleaning row count and duplicate checks]
- [business-rule validations]
- [spot checks and reconciliation against source totals]

### 7. Documentation to Capture
- [decisions, assumptions, mappings, removed rows, imputation logic]
- [fields or rules that need stakeholder confirmation]

Rules:
- Do not write final production code unless the user explicitly asks for it.
- Prefer reversible cleaning steps and preserve the original raw values.
- If a field may encode important business meaning, recommend flagging it
  instead of deleting or overwriting it.
- Be specific to the dataset description and known problems; avoid generic
  boilerplate that could apply to any dataset.
- Call out assumptions and questions that need confirmation before cleaning.
- Never recommend dropping rows as the first option unless the user gives a
  clear business rule that makes those rows invalid.`,
  outputType: "markdown",
};
