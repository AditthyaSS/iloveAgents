export default {
  id: "graphql-schema-generator",
  createdAt: "2026-10-17",
  name: "GraphQL Schema Generator",
  description:
    "Generate production-ready GraphQL SDL schemas complete with types, relationships, queries, mutations, and subscriptions from your data model.",
  category: "Engineering",
  icon: "GitMerge",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    domainDescription:
      "An e-commerce platform with products, categories, customers, shopping carts, and orders.",
    entities:
      "Product (id, title, price, inventoryCount, category)\nCategory (id, name, slug, parentCategory)\nCustomer (id, email, fullName, shippingAddress)\nCart (id, customer, items, totalAmount)\nOrder (id, orderNumber, customer, items, status, createdAt)",
    includeMutations: "yes",
    includeSubscriptions: "no",
  },
  inputs: [
    {
      id: "domainDescription",
      label: "Domain description",
      type: "textarea",
      placeholder:
        "Describe your application domain and business context (e.g., An e-commerce app with products, categories, users, and orders)...",
      required: true,
    },
    {
      id: "entities",
      label: "Entities to include",
      type: "textarea",
      placeholder:
        "List your core domain entities, their primary fields, and relationships between them...",
      required: true,
    },
    {
      id: "includeMutations",
      label: "Include mutations",
      type: "select",
      options: ["yes", "no", "read-only"],
      defaultValue: "yes",
      required: true,
    },
    {
      id: "includeSubscriptions",
      label: "Include subscriptions",
      type: "select",
      options: ["yes", "no"],
      defaultValue: "no",
      required: true,
    },
  ],
  systemPrompt: `You are an expert GraphQL architect and schema designer.
Your task is to take a domain description, list of entities, mutation preference, and subscription preference, and design a clean, production-ready GraphQL Schema Definition Language (SDL) specification.

Follow GraphQL best practices:
1. Strict type safety and clear nullability (use Non-Null '!' where fields are guaranteed to exist, like IDs and mandatory attributes).
2. Model relationships cleanly with object types and references.
3. Pagination and query conventions (e.g. pagination inputs or filters where applicable).
4. If mutations are requested ("yes"), provide standard CRUD inputs and payload types (e.g. CreateEntityInput, CreateEntityPayload, UpdateEntityInput).
5. If mutations are "read-only" or "no", omit mutation definitions accordingly.
6. If subscriptions are requested ("yes"), provide relevant real-time event subscriptions.
7. Use descriptive scalar types where appropriate (e.g. custom scalars DateTime, JSON if needed).
8. Provide a concise explanation of design decisions and field nullability at the end.

Format your output in clean Markdown with:
- An overview of the schema architecture
- A complete, valid \`\`\`graphql code block containing the full schema SDL (types, inputs, enums, Query, Mutation, Subscription)
- Explanation of key design decisions (why fields are non-null vs nullable, relationship modeling, input types)`,
  outputType: "markdown",
};