export default {
  id: "openapi-spec-generator",
  createdAt: "2025-07-02",
  name: "OpenAPI Spec Generator",
  description:
    "Describe your API in plain English and get a complete, valid OpenAPI 3.0 YAML specification with paths, parameters, request bodies, and response schemas.",
  category: "Engineering",
  icon: "FileCode",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    apiName: "User Management API",
    apiDescription: "A simple REST API for managing users in a SaaS application.",
    endpoints: "GET /users — list all users\nPOST /users — create a new user\nGET /users/{id} — get a single user\nPUT /users/{id} — update a user\nDELETE /users/{id} — delete a user",
    authType: "Bearer JWT",
    includeExamples: "yes",
  },
  inputs: [
    {
      id: "apiName",
      label: "API name",
      type: "text",
      placeholder: "e.g. User Management API",
      required: true,
    },
    {
      id: "apiDescription",
      label: "API description",
      type: "textarea",
      placeholder: "Explain what your API does, who it is for, and any relevant context...",
      required: true,
    },
    {
      id: "endpoints",
      label: "Endpoints to include",
      type: "textarea",
      placeholder: "GET /users — list all users\nPOST /users — create a new user\nGET /users/{id} — get a single user\nPUT /users/{id} — update a user\nDELETE /users/{id} — delete a user",
      required: true,
    },
    {
      id: "authType",
      label: "Auth type",
      type: "select",
      options: ["None", "API Key", "Bearer JWT", "OAuth2"],
      defaultValue: "Bearer JWT",
      required: true,
    },
    {
      id: "includeExamples",
      label: "Include example request/response",
      type: "select",
      options: ["yes", "no"],
      defaultValue: "yes",
      required: true,
    },
  ],
  systemPrompt: `You are an API documentation expert. Given an API name, description, endpoints, auth type, and whether to include examples, generate a complete, valid OpenAPI 3.0 YAML specification.

Return ONLY the YAML code block, nothing else. The output must start with \`\`\`yaml and end with \`\`\`.

The spec must include:

1. **Info section** — title, description, version ("1.0.0")
2. **Servers section** — a generic localhost server URL (http://localhost:3000)
3. **Paths** — every endpoint the user listed
4. **Parameters** — path parameters, query parameters (e.g. pagination, filtering), and header parameters inferred from the context
5. **Request bodies** — for POST, PUT, and PATCH endpoints, define JSON request body schemas with proper types
6. **Response schemas** — for every operation, define success (200/201) and error (400/404/500) response schemas
7. **Components** — reusable schemas in the components/schemas section

If the user selected an auth type:
- **API Key** → add a header parameter "X-API-Key" globally or via security scheme
- **Bearer JWT** → add BearerAuth security scheme with type: http, scheme: bearer, bearerFormat: JWT
- **OAuth2** → add OAuth2 security scheme with implicit flow and a placeholder authorizationUrl

If examples are enabled (includeExamples === "yes"), include example values for:
- Request body properties (use realistic but fake data)
- Response body properties

Rules:
- Output valid YAML that passes OpenAPI 3.0 validation
- Infer property types (string, integer, boolean, array, object) from endpoint names and descriptions
- Use proper HTTP methods and status codes
- Include proper schema types and formats (e.g. "date-time" for dates, "email" for emails, "int64" for IDs)
- Add a tags section grouping endpoints by resource
- Never include comments in the YAML — the spec itself must be clean
- Use snake_case for property names`,
  outputType: "markdown",
  suggestedChainFrom: ["api-doc-generator", "code-migration-guide"],
};
