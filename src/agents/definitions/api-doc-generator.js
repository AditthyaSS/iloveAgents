export default {
  id: "api-doc-generator",
  createdAt: "2025-05-06",
  name: "API Doc Generator",
  description:
    "Paste your code and get clean, professional API documentation with examples and type signatures.",
  category: "Engineering",
  icon: "FileCode",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    code: "/**\n * Calculates the compounding interest for a principal amount.\n */\nfunction calculateInterest(principal, rate, years, frequency = 12) {\n  if (principal < 0 || rate < 0 || years < 0) {\n    throw new Error('Inputs must be positive');\n  }\n  return principal * Math.pow((1 + (rate / frequency)), (frequency * years));\n}",
    language: "JavaScript",
    style: "JSDoc / Docstring",
  },
  inputs: [
    {
      id: "code",
      label: "Code to document",
      type: "code",
      placeholder: "Paste your functions, classes, or API endpoints here...",
      required: true,
    },
    {
      id: "language",
      label: "Language",
      type: "select",
      options: [
        "JavaScript",
        "TypeScript",
        "Python",
        "Go",
        "Rust",
        "Java",
        "C#",
        "Ruby",
        "PHP",
        "Other",
      ],
      defaultValue: "JavaScript",
      required: true,
    },
    {
      id: "style",
      label: "Documentation style",
      type: "select",
      options: [
        "JSDoc / Docstring",
        "README-style (Markdown)",
        "OpenAPI / Swagger",
        "Man page style",
      ],
      defaultValue: "README-style (Markdown)",
      required: true,
    },
  ],
  systemPrompt: `You are a senior technical writer who specializes in developer documentation. You write docs that are clear, complete, and immediately useful.

Given source code, a language, and a documentation style, generate professional API documentation.

For README-style (Markdown), use this format:

## Overview
One paragraph describing what this code does and when to use it.

## API Reference

### \`functionName(param1, param2)\`
**Description:** What it does.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| param1 | string | Yes | What this parameter is for |

**Returns:** \`ReturnType\` — Description of the return value.

**Example:**
\`\`\`js
// Usage example with realistic values
const result = functionName('value1', 'value2');
\`\`\`

**Throws:** List any errors/exceptions and when they occur.

---

Repeat for each function/method/endpoint.

## Type Definitions
Define any custom types, interfaces, or schemas used.

For JSDoc/Docstring style, output the original code with proper documentation comments added inline.

For OpenAPI/Swagger style, output valid YAML.

Rules:
- Document every public function, method, class, and endpoint
- Include realistic usage examples for every function
- Infer types from the code — be specific, not just "any" or "object"
- Note side effects, async behavior, and error cases
- If the code has bugs or anti-patterns, mention them in a "Notes" section
- Keep descriptions concise — one sentence per parameter
- Never skip parameters or return values`,
  outputType: "markdown",
};
