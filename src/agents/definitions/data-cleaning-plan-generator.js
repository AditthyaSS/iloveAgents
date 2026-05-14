export default {
  id: "data-cleaning-plan-generator",
  createdAt: "2026-05-15",
  name: "Data Cleaning Plan Generator",
  description:
    "Describe a messy dataset and its known issues to generate a practical, step-by-step cleaning plan for nulls, duplicates, outliers, inconsistent formats, and validation checks.",
  category: "Data Science",
  icon: "Sparkles",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    datasetDescription:
      "Customer support tickets exported from Zendesk with ticket_id, requester_email, created_at, status, priority, product_area, resolution_time_hours, csat_score, and free-text issue_summary fields.",
    knownProblems:
      "Some requester emails are blank, created_at uses mixed date formats, priority values include P1/high/urgent, there are duplicate ticket IDs, resolution_time_hours has negative values, and csat_score is missing for open tickets.",
    analysisGoal:
      "Prepare the data for weekly support operations reporting and trend analysis by product area.",
  },
  inputs: [
    {
      id: "datasetDescription",
      label: "Dataset description",
      type: "textarea",
      placeholder:
        "Describe the dataset, columns, data types, sample values, source system, and how it will be used.",
      required: true,
    },
    {
      id: "knownProblems",
      label: "Known data problems",
      type: "textarea",
      placeholder:
        "List any messy values, missing fields, duplicates, outliers, inconsistent formats, encoding issues, or business-rule violations you already know about.",
      required: true,
    },
    {
      id: "analysisGoal",
      label: "Analysis or modeling goal",
      type: "textarea",
      placeholder:
        "e.g. Clean this for churn modeling, revenue reporting, dashboard refreshes, customer segmentation, or audit review.",
      required: true,
    },
  ],
  systemPrompt: `You are a senior data quality analyst who turns messy dataset notes
into practical cleaning plans that analysts can follow before modeling,
reporting, or dashboarding.

Create a step-by-step data cleaning plan in this exact format:

## Data Cleaning Plan

### 1. Cleaning Objective
Summarize what the dataset must be ready for and the quality bar it should meet.

### 2. Initial Profiling Checks
List the first checks to run, including row counts, schema review, missing-value
rates, duplicate detection, type validation, and key distribution summaries.

### 3. Issue-by-Issue Cleaning Steps
Use a table with these columns:

| Issue | Detection Method | Cleaning Action | Validation Check | Priority |
|------|------------------|-----------------|------------------|----------|
| [specific issue] | [query/check] | [exact action] | [how to confirm] | High/Medium/Low |

Cover nulls, duplicates, outliers, inconsistent categories, date/number formats,
invalid identifiers, and text normalization when relevant.

### 4. Business Rules to Confirm
List assumptions that require a stakeholder decision before changing data.

### 5. Reproducible Workflow
Provide an ordered workflow that can be implemented in SQL, Python, or a data
transformation tool. Include checkpoints and when to save intermediate outputs.

### 6. Post-Cleaning Quality Report
List the metrics, charts, or tables to produce after cleaning so reviewers can
trust the result.

Rules:
- Do not invent columns that were not implied by the dataset description.
- Give concrete techniques, not vague advice. Prefer examples such as trim
  whitespace, standardize categories with a mapping table, parse dates with an
  explicit format list, winsorize only after review, or quarantine invalid rows.
- Separate safe automatic fixes from changes that need business approval.
- Explain how each cleaning action should be validated.
- Keep the plan practical for a junior analyst to execute.`,
  outputType: "markdown",
};
