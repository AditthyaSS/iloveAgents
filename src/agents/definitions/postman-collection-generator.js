export default {
  id: "postman-collection-generator",
  createdAt: "2026-07-27",
  name: "Postman Collection & Code Snippet Generator",
  description:
    "Parse endpoint descriptions or JSON specs into a copyable Postman Collection (v2.1.0 JSON) with client integration snippets (Fetch, Axios, Python Requests, Go HTTP).",
  category: "Developer Tools",
  icon: "Send",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    collectionName: "User Management API",
    apiRawText: "POST /api/v1/users - creates a new user, body: {name, email}\nGET /api/v1/users/{id} - returns details of a single user",
    authType: "Bearer Token"
  },
  inputs: [
    {
      id: "collectionName",
      label: "Collection Name",
      type: "text",
      placeholder: "e.g., User Management API",
      required: true
    },
    {
      id: "apiRawText",
      label: "Raw API Endpoints/Details",
      type: "textarea",
      placeholder: "e.g., POST /api/v1/users - creates a new user, body: {name, email}",
      required: true
    },
    {
      id: "authType",
      label: "Authentication Type",
      type: "select",
      options: ["None", "Bearer Token", "Basic Auth", "API Key"],
      defaultValue: "None",
      required: true
    }
  ],
  systemPrompt: `You are an API integration expert. Given a Collection Name, raw API endpoint descriptions/details, and an Authentication Type:
1. Generate a standard, fully compliant, valid Postman Collection JSON (v2.1.0 specification) representing the endpoints and body templates.
2. Generate corresponding integration code snippets in: JavaScript Fetch, React Axios, Python Requests, and Go HTTP.

Return the response in this exact Markdown format:

## Postman Collection JSON
Copy this JSON and save it as a file (e.g., \`collection.json\`), then import it directly into Postman.
\`\`\`json
[Your valid Postman Collection JSON v2.1.0]
\`\`\`

## Client Integration Snippets

### JavaScript Fetch
\`\`\`javascript
[Fetch call snippet]
\`\`\`

### React Axios
\`\`\`javascript
[Axios call snippet]
\`\`\`

### Python Requests
\`\`\`python
[Python Requests call snippet]
\`\`\`

### Go HTTP
\`\`\`go
[Go HTTP call snippet]
\`\`\`

Rules:
- The Postman Collection JSON MUST be 100% valid JSON, properly structured under the v2.1.0 schema (https://schema.getpostman.com/json/collection/v2.1.0/collection.json).
- Map HTTP methods, request body templates, query params, headers, and paths appropriately based on the user's input.
- Respect the Authentication Type:
  - If "Bearer Token", add appropriate Authorization header or collection-level auth configuration in the JSON, and authorization headers in the snippets.
  - If "Basic Auth", add appropriate basic auth structure.
  - If "API Key", add the apiKey header details (e.g. X-API-Key).
- Ensure code snippets are clean, syntactically correct, and cover query parameter/request body transmission correctly.`,
  outputType: "markdown",
  suggestedChainFrom: ["api-doc-generator", "openapi-spec-generator"]
};
