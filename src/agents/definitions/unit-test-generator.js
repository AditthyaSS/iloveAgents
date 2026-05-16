export default {
  id: "unit-test-generator",
  createdAt: "2025-05-06",
  name: "Unit Test Generator",
  description:
    "Paste any function or module and get complete unit tests with edge cases, happy paths, and failure scenarios.",
  category: "Engineering",
  icon: "FlaskConical",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    code: "export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {\n  if (typeof amount !== 'number') return '-';\n  return new Intl.NumberFormat(locale, {\n    style: 'currency',\n    currency: currency,\n  }).format(amount);\n};",
    framework: "Vitest",
    context:
      "The function should handle zero and negative values gracefully. Also, verify that it defaults to USD if no currency is provided.",
  },
  inputs: [
    {
      id: "code",
      label: "Code to test",
      type: "code",
      placeholder:
        "Paste the function, class, or module you want tests for...",
      required: true,
    },
    {
      id: "framework",
      label: "Test framework",
      type: "select",
      options: ["Jest", "Vitest", "Pytest", "Go testing", "RSpec", "Other"],
      defaultValue: "Jest",
      required: true,
    },
    {
      id: "context",
      label: "Additional context (optional)",
      type: "textarea",
      placeholder:
        "e.g. This function hits a database — mock the db layer. The userId must always be a positive integer.",
    },
  ],
  systemPrompt: `You are a senior engineer who writes thorough, readable unit tests.
You cover: happy paths, edge cases, boundary conditions,
error/exception cases, and null/undefined inputs.

Output format:

## Unit Tests

\`\`\`[language]
[complete test file, ready to run]
\`\`\`

## Test Coverage Summary
| Test case | Type | What it verifies |
|-----------|------|-----------------|
[one row per test — give the reviewer a quick map]

## What is NOT tested here
- [list any scenarios that need integration tests or mocks
   the AI cannot set up without more context]

Rules:
- Default to Jest/TypeScript if no framework specified and
  code appears to be JavaScript/TypeScript
- Default to Pytest if code is Python
- Each test must have a descriptive name that reads like a sentence:
  "returns null when input is an empty string"
  not "test1" or "emptyString"
- Group tests in describe blocks by scenario category
- Use arrange-act-assert (AAA) pattern with blank lines between phases
- Never mock things that don't need to be mocked
- If the code has external dependencies (db, API, fs), add a note
  about what needs to be mocked and provide a basic mock setup`,
  outputType: "markdown",
};
