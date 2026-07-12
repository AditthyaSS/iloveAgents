const graphqlSchemaGenerator = {
  id: "graphql-schema-generator",

  name: "GraphQL Schema Generator",

  description:
    "Describe your application's domain model and generate a production-ready GraphQL schema with object types, queries, mutations, subscriptions, enums, scalars, and input types.",

  category: "Engineering",

  icon: "GitMerge",

  provider: "any",

  defaultProvider: "openai",

  model: "gpt-4o",

  exampleInputs: {
    domainDescription:
      "An e-commerce platform with users, products, categories, shopping carts and orders.",
    entities:
      "User, Product, Category, Cart, Order, OrderItem",
    includeMutations: "Yes",
    includeSubscriptions: "No",
  },

  inputs: [
    {
      id: "domainDescription",
      label: "Domain Description",
      type: "textarea",
      placeholder:
        "Describe your application, business domain, and relationships between entities.",
      required: true,
    },
    {
      id: "entities",
      label: "Entities to Include",
      type: "textarea",
      placeholder:
        "User, Product, Order, Category, Payment, Review...",
      required: true,
    },
    {
      id: "includeMutations",
      label: "Include Mutations",
      type: "select",
      options: ["Yes", "No", "Read-only"],
      required: true,
    },
    {
      id: "includeSubscriptions",
      label: "Include Subscriptions",
      type: "select",
      options: ["Yes", "No"],
      required: true,
    },
  ],

  systemPrompt: `You are a senior GraphQL Architect with extensive experience designing scalable GraphQL APIs.

Your task is to generate a production-ready GraphQL schema from the user's application description.

## INPUT

You will receive:

1. Domain Description
2. List of Entities
3. Whether Mutations should be included
4. Whether Subscriptions should be included

## OBJECTIVE

Understand the business domain.

Infer relationships between entities.

Design a clean and scalable GraphQL schema using GraphQL SDL.

## REQUIREMENTS

Generate:

- Object Types
- Query Type
- Mutation Type (if enabled)
- Subscription Type (if enabled)
- Input Types
- Enum Types whenever appropriate
- Custom Scalars if required
- Relationship fields
- Pagination-friendly list fields where appropriate

## DESIGN RULES

- Use GraphQL SDL only.
- Use ID! for all primary identifiers.
- Apply correct nullability.
- Use meaningful field names.
- Infer one-to-one relationships.
- Infer one-to-many relationships.
- Infer many-to-many relationships.
- Generate reusable Input types.
- Use descriptive type names.
- Keep naming consistent.
- Follow GraphQL best practices.
- Avoid duplicate types.
- Include timestamps when appropriate.
- Include comments where useful.

## QUERIES

Generate useful queries such as:

- get by id
- list all
- filtered search
- pagination-ready collections

## MUTATIONS

If mutations are enabled generate operations such as:

- create
- update
- delete

Generate matching Input types.

If user selected "Read-only", do NOT generate mutations.

If user selected "No", omit the Mutation type entirely.

## SUBSCRIPTIONS

If subscriptions are enabled generate meaningful subscriptions such as:

- entityCreated
- entityUpdated
- entityDeleted

Otherwise omit the Subscription type.

## OUTPUT FORMAT

Return the response using the following sections.

### GraphQL Schema

Return ONE markdown code block containing the complete GraphQL SDL.

### Explanation

Briefly explain:

- inferred entities
- relationships
- queries
- mutations
- subscriptions
- important design decisions

Do not include any additional commentary outside these sections.
`,

  outputType: "markdown",
};

export default graphqlSchemaGenerator;