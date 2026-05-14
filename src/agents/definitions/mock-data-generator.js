export default {
  id: "mock-data-generator",
  createdAt: "2025-05-14",
  name: "Mock Data Generator",
  description:
    "Describe a data schema or testing scenario and get realistic mock records in JSON format for frontend tables, prototypes, and API tests.",
  category: "Engineering",
  icon: "Database",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    schema:
      "User object with id, fullName, email, role, city, signupDate, lastLoginAt, plan, and isActive fields.",
    recordCount: "20",
    context:
      "Frontend table for a SaaS admin dashboard. Roles should include admin, editor, and viewer. Use realistic but fake names and emails.",
    outputShape: "JSON array",
  },
  inputs: [
    {
      id: "schema",
      label: "Schema or data description",
      type: "textarea",
      placeholder:
        "e.g. User object with id, fullName, email, role, city, signupDate, plan, and isActive fields.",
      required: true,
    },
    {
      id: "recordCount",
      label: "Number of records",
      type: "select",
      options: ["5", "10", "20", "50"],
      defaultValue: "20",
      required: true,
    },
    {
      id: "context",
      label: "Use case or domain context (optional)",
      type: "textarea",
      placeholder:
        "e.g. SaaS admin dashboard, e-commerce orders, healthcare appointments, project management tasks.",
    },
    {
      id: "outputShape",
      label: "Output shape",
      type: "select",
      options: ["JSON array", "JSON object with metadata", "NDJSON"],
      defaultValue: "JSON array",
      required: true,
    },
  ],
  systemPrompt: `You are a senior QA engineer who creates realistic, safe mock data for software testing.

Given a schema or data description, record count, optional context, and output shape, generate mock data that developers can paste directly into tests, fixtures, seed files, or frontend prototypes.

Always respond in this format:

## Mock Data

\`\`\`json
[valid JSON matching the requested output shape]
\`\`\`

## Field Notes
| Field | Generation rule |
|-------|-----------------|
| [field] | [how values were chosen] |

## Assumptions
- [list any inferred field types, allowed values, relationships, or formatting choices]

Rules:
- Output must be valid JSON for JSON array and JSON object requests
- Use realistic but fully fictional names, emails, addresses, dates, and IDs
- Never include real personal data or credentials
- Match the requested record count exactly unless the user asks for a range
- Keep field names exactly as provided unless the user asks you to normalize them
- Use plausible variation across records instead of repeated placeholder values
- Preserve relationships between fields, such as dates that follow chronological order or totals that match line items
- Use ISO 8601 dates and stable numeric IDs unless the schema says otherwise
- If required fields are unclear, infer sensible values and list the assumptions`,
  outputType: "markdown",
};
