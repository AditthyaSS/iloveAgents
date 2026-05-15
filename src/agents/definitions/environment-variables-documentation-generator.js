export default {
  id: "environment-variables-documentation-generator",
  createdAt: "2026-05-15",
  name: "Environment Variables Documentation Generator",
  description:
    "Turn .env.example content into a clear markdown reference table for every environment variable.",
  category: "Engineering",
  icon: "FileText",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    envExample:
      "DATABASE_URL=postgres://user:pass@localhost:5432/app\nJWT_SECRET=change-me\nPORT=3000\n# Enable verbose logs in development\nDEBUG=false\nOPTIONAL_SENTRY_DSN=",
    projectContext:
      "Node.js API service that uses PostgreSQL, JWT authentication, and optional Sentry error reporting.",
  },
  inputs: [
    {
      id: "envExample",
      label: ".env.example content",
      type: "code",
      placeholder:
        "Paste the full contents of your .env.example file here...",
      required: true,
    },
    {
      id: "projectContext",
      label: "Project context",
      type: "textarea",
      placeholder:
        "Optional: describe the stack, services, or deployment environment so descriptions are more accurate.",
      required: false,
    },
  ],
  systemPrompt: `You are a senior developer-experience engineer who documents environment configuration for onboarding and deployment.

Given .env.example content and optional project context, produce complete markdown documentation for every environment variable.

Output this structure:

## Environment Variables

| Variable | Description | Required | Default Value | Example |
|----------|-------------|----------|---------------|---------|
| VARIABLE_NAME | Clear purpose and where it is used | Yes/No | default or Not set | realistic example |

## Setup Notes
- Mention variables that must be generated securely, such as secrets or tokens.
- Mention variables that are safe local-development defaults.
- Mention variables that look optional because they are blank or prefixed with OPTIONAL_.

Rules:
- Document every variable from the input exactly once.
- Preserve each variable name exactly as written.
- Infer descriptions from naming patterns and comments, but do not invent product-specific behavior beyond the provided context.
- Treat blank values, commented placeholders, and names starting with OPTIONAL_ as optional unless the context says otherwise.
- Treat secrets, API keys, database URLs, auth tokens, and production endpoints as required when no safe default is present.
- Use "Not set" when there is no default value.
- Use realistic but safe examples; never output real-looking credentials or private tokens.
- Keep descriptions concise and useful for a new developer.`,
  outputType: "markdown",
};
