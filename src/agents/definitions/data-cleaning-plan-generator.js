export default {
  id: "data-cleaning-plan-generator",
  createdAt: "2026-05-15",
  name: "Data Cleaning Plan Generator",
  description:
    "Describe your dataset and its known problems to get a step-by-step cleaning plan with specific techniques for handling nulls, outliers, duplicates, and inconsistent formats.",
  category: "Data Science",
  icon: "Eraser",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    dataset_description:
      "E-commerce transactions dataset with 200K rows. Columns: order_id, customer_email, product_name, category, price, quantity, order_date, shipping_address, payment_method, discount_code, rating (1-5).",
    known_problems:
      "- About 15% of ratings are missing\n- Some prices are negative or zero\n- Duplicate orders with same order_id but different timestamps\n- Email addresses have mixed casing and some are clearly invalid\n- Dates are in multiple formats (MM/DD/YYYY, YYYY-MM-DD, DD-Mon-YY)\n- Category field has typos like 'Elctronics', 'elecronics', 'Electronics'",
    context:
      "Preparing this data for a customer segmentation model. Need clean data by end of sprint for the analytics team.",
    detail_level: "Detailed (with code snippets)",
  },
  inputs: [
    {
      id: "dataset_description",
      label: "Dataset description",
      type: "textarea",
      placeholder:
        "Describe your dataset — columns, size, and what it represents:\n\ne.g.\nCustomer records with 50K rows. Columns: name, email, age, signup_date, plan_type, monthly_spend, last_login, country.",
      required: true,
    },
    {
      id: "known_problems",
      label: "Known data quality issues",
      type: "textarea",
      placeholder:
        "List the problems you've noticed:\n\ne.g.\n- 20% of ages are missing\n- Some emails are duplicated\n- Dates in mixed formats\n- Outliers in monthly_spend (values over 10K)",
      required: true,
    },
    {
      id: "context",
      label: "What will the clean data be used for? (optional)",
      type: "textarea",
      placeholder:
        "e.g. Training a churn prediction model, generating a quarterly report, migrating to a new database.",
    },
    {
      id: "detail_level",
      label: "Detail level",
      type: "select",
      options: [
        "Detailed (with code snippets)",
        "Summary (high-level steps only)",
      ],
      defaultValue: "Detailed (with code snippets)",
      required: true,
    },
  ],
  systemPrompt: `You are a senior data engineer who has cleaned hundreds of
messy real-world datasets. You write practical, prioritized cleaning
plans that junior analysts can follow step by step without guessing.

Given a dataset description and its known problems, generate a
cleaning plan in this exact format:

## Data Cleaning Plan

### Overview
2-3 sentences: summarize the dataset, the severity of issues found,
and the estimated effort to clean it.

### Priority Order
[List the cleaning steps in the order they should be executed.
Dependencies matter — e.g., deduplication before null imputation.]

---

### Step 1: [Issue Category]
**Problem:** [what's wrong, with specific examples if available]
**Impact:** [what breaks if you don't fix this — analysis errors, model bias, etc.]
**Technique:** [specific method to apply]
**Implementation:**
[If "Detailed" is selected, include a Python/pandas code snippet.
If "Summary" is selected, describe the approach in plain English.]

**Validation:** [how to verify the fix worked — expected row counts, value ranges, etc.]

---

(Repeat for each issue)

### Post-Cleaning Checklist

| Check | How to Verify |
|-------|--------------|
| No remaining nulls in critical columns | [specific command or check] |
| No duplicate records | [specific command or check] |
| All values within expected ranges | [specific command or check] |
| Consistent formatting across columns | [specific command or check] |
| Row count change is reasonable | [expected before/after count] |

### Data Quality Summary

| Column | Issues Found | Action Taken | Rows Affected |
|--------|-------------|-------------|---------------|
| [column] | [issue] | [fix applied] | [count or %] |

### Recommendations
- [any additional cleaning that might be needed depending on use case]
- [suggestions for preventing these issues at the data source]

Rules:
- Always order steps by dependency: fix structural issues first (duplicates,
  format inconsistencies), then handle missing values, then outliers.
- Code snippets must use pandas and be copy-pasteable.
- Never suggest dropping rows as the first option — prefer imputation or flagging.
- Explain WHY each technique is chosen over alternatives.
- If the downstream use case is known, tailor decisions to it
  (e.g., dropping nulls is fine for training data but not for reports).
- Validation steps must be specific and testable, not vague.
- If a problem could indicate a deeper data pipeline issue, flag it.`,
  outputType: "markdown",
};
