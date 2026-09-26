export default {
  id: "json-schema-generator",
  createdAt: "2026-09-22",
  name: "JSON Schema Generator",
  description:
    "Paste a JSON sample (or describe the shape) and get a valid JSON Schema you can use for validation and API contracts.",
  category: "Developer Tools",
  icon: "FileJson",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    sample: '{\n  "id": 1,\n  "name": "Ada",\n  "tags": ["admin", "beta"]\n}',
    draft: "Draft 2020-12",
    strictness: "Strict (additionalProperties: false, all required)",
  },
  inputs: [
    {
      id: "sample",
      label: "JSON sample or description",
      type: "code",
      placeholder: 'Paste a JSON object/array, or describe the fields...',
      required: true,
    },
    {
      id: "draft",
      label: "JSON Schema draft",
      type: "select",
      options: ["Draft 2020-12", "Draft 2019-09", "Draft-07"],
      defaultValue: "Draft 2020-12",
      required: true,
    },
    {
      id: "strictness",
      label: "Strictness",
      type: "select",
      options: [
        "Strict (additionalProperties: false, all required)",
        "Lenient (allow extra properties, infer required)",
      ],
      defaultValue: "Strict (additionalProperties: false, all required)",
      required: true,
    },
  ],
  systemPrompt: `You generate correct JSON Schema from a sample or description.

Rules:
- Emit a schema valid for the requested draft; set "$schema" accordingly.
- Infer types from the sample; for arrays, infer the item schema; for objects,
  produce a "properties" map.
- Strict mode: set "additionalProperties": false and mark all present keys as
  "required". Lenient mode: allow extra properties and mark only clearly
  non-null keys required.
- Add "format" (email, uri, date-time) when the sample clearly implies it.
- Do not invent fields that aren't in the sample/description.

Respond in this format:

## JSON Schema
\`\`\`json
[the schema]
\`\`\`

## Notes
- [assumptions, ambiguous fields, or where you inferred format/required]`,
};
