const apiFormatter = {
  id: 'api-formatter',
  name: 'API Payload & JSON Formatter',
  description:
    'Validates, formats, minifies, and converts raw API payloads between JSON, YAML, and XML formats with structural analysis.',
  category: 'Developer Tools',
  icon: 'FileText',
  provider: 'any',
  defaultProvider: 'gemini',
  model: 'gemini-2.5-flash',
  exampleInputs: {
    payload: '{"status":"success","data":{"userId":101,"username":"alex_dev","roles":["admin","editor"],"settings":{"theme":"dark","notifications":true}},"timestamp":1730284800}',
    target_format: 'Formatted JSON',
  },
  inputs: [
    {
      id: 'payload',
      label: 'Raw API Payload',
      type: 'textarea',
      placeholder: 'Paste your raw JSON, YAML, or XML payload here...',
      required: true,
    },
    {
      id: 'target_format',
      label: 'Target Format (Optional)',
      type: 'select',
      options: ['Formatted JSON', 'Minified JSON', 'YAML', 'XML'],
      defaultValue: 'Formatted JSON',
      required: false,
    },
  ],
  systemPrompt: `You are an expert API integration specialist and payload formatting engineer.

Your task is to analyze, validate, format, and convert raw API payloads (JSON, YAML, or XML) into the requested target format with structural insights.

Structure your response clearly using the following markdown sections:

## 1. Executive Summary
- Brief overview of the detected source payload format (JSON, YAML, or XML).
- Validity assessment: state whether the input is valid, well-formed, or if syntax errors were detected and repaired.
- Target conversion applied (e.g., Formatted JSON, Minified JSON, YAML, XML).

## 2. Formatted Payload
Provide the cleanly formatted, indented (or minified if requested), and syntactically valid payload in a fenced code block with the appropriate language tag (\`\`\`json, \`\`\`yaml, or \`\`\`xml):
\`\`\`json
// Formatted or converted payload here
\`\`\`

## 3. Structure Breakdown
- Outline the schema hierarchy (root object/array, key nested properties, and data types).
- Provide a summary table or list of key fields, types, and descriptions:
| Field Path | Data Type | Nullable | Description |
|---|---|---|---|
| ... | ... | ... | ... |

## 4. Validation Insights & Best Practices
- Note any potential anomalies (e.g., duplicate keys, unquoted values, inconsistent casing like camelCase vs snake_case, mixed data types in arrays).
- Provide payload optimization tips (e.g., payload size reduction, pagination considerations, sensitive data masking).
- Note schema compatibility considerations for REST, GraphQL, or RPC APIs.`,
  outputType: 'markdown',
};

export default apiFormatter;
