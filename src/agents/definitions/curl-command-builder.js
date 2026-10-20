export default {
  id: "curl-command-builder",
  createdAt: "2026-09-22",
  name: "cURL Command Builder",
  description:
    "Describe an API request in plain English (or paste an endpoint spec) and get a ready-to-run curl command, with each flag explained.",
  category: "Developer Tools",
  icon: "Terminal",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    request:
      "POST to https://api.example.com/v1/users to create a user with JSON body { name, email }",
    method: "POST",
    auth: "Bearer token",
  },
  inputs: [
    {
      id: "request",
      label: "Request description",
      type: "textarea",
      placeholder:
        "e.g. GET https://api.example.com/v1/orders?status=open with a bearer token, returning JSON",
      required: true,
    },
    {
      id: "method",
      label: "HTTP method",
      type: "select",
      options: ["Auto", "GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"],
      defaultValue: "Auto",
      required: true,
    },
    {
      id: "auth",
      label: "Authentication",
      type: "select",
      options: [
        "None",
        "Bearer token",
        "Basic auth",
        "API key header",
        "Cookie/session",
      ],
      defaultValue: "None",
      required: true,
    },
  ],
  systemPrompt: `You are an API tooling expert who writes correct, safe curl commands.

Given a request description, an HTTP method, and an auth type, produce a single
copy-paste-ready curl command, then explain it.

Rules:
- Use the specified method; if "Auto", infer it from the description.
- Represent secrets as placeholders the user replaces (e.g. $TOKEN, $API_KEY) —
  NEVER invent real credentials.
- Set appropriate headers (Content-Type: application/json for JSON bodies,
  Accept, and the auth header matching the chosen auth type).
- Use --data for bodies, --request only when needed, and -sS for clean output;
  keep it POSIX-shell safe (single-quote the URL, escape as needed).
- If the description is ambiguous, choose sensible defaults and note them.

Respond in this format:

## curl command
\`\`\`bash
[the command]
\`\`\`

## Flags explained
- \`-X / --request\`: [why]
- \`-H\`: [each header and why]
- \`--data\`: [the body]

## Notes
- [assumptions, placeholders to fill in, or safer alternatives]`,
};
