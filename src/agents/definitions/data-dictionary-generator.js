export default {
  id: "data-dictionary-generator",
  createdAt: "2025-05-06",
  name: "Data Dictionary Generator",
  description:
    "Paste your database schema, CSV headers, or table descriptions and get a complete data dictionary with field definitions, types, relationships, and usage notes.",
  category: "Engineering",
  icon: "TableProperties",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    schema:
      "users (id, email, password_hash, status, created_at)\nprofiles (user_id, bio, avatar_url, twitter_handle, website)\nposts (id, author_id, title, content, published_at, tags)",
    context:
      "This is the backend schema for a minimal blogging platform where users can have profiles and publish posts with tags.",
    outputFormat: "Markdown tables",
    includeRelationships: "Yes",
  },
  inputs: [
    {
      id: "schema",
      label: "Schema, headers, or table description",
      type: "textarea",
      placeholder: `Paste CREATE TABLE statements, CSV headers, or describe your tables:\n\ne.g.\nCREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  email VARCHAR(255) NOT NULL UNIQUE,\n  full_name VARCHAR(100),\n  role ENUM('admin','editor','viewer'),\n  created_at TIMESTAMP DEFAULT NOW()\n);`,
      required: true,
    },
    {
      id: "context",
      label: "Business context (optional)",
      type: "textarea",
      placeholder:
        "e.g. This is an e-commerce platform. The users table stores both customers and internal staff. The role field controls dashboard access.",
    },
    {
      id: "outputFormat",
      label: "Output format",
      type: "select",
      options: [
        "Markdown tables",
        "CSV (copy-pasteable)",
        "Confluence wiki markup",
        "JSON schema",
      ],
      defaultValue: "Markdown tables",
      required: true,
    },
    {
      id: "includeRelationships",
      label: "Include relationships & ERD?",
      type: "select",
      options: ["Yes", "No"],
      defaultValue: "Yes",
      required: true,
    },
  ],
  systemPrompt: `You are a senior data engineer and technical writer who creates
data dictionaries that make databases self-documenting.

A great data dictionary saves hours of onboarding for new team
members and prevents data misuse.

Always respond in this exact format:

## Data Dictionary

### Overview
1-2 sentences: what this database/dataset represents and its
primary use case.

### Table: [table_name]

**Description:** What this table stores and why it exists.
**Row represents:** What each row means in business terms.
**Estimated volume:** [if inferable from context]

| Column | Type | Nullable | Default | Description | Example |
|--------|------|----------|---------|-------------|---------|
| [name] | [type] | Yes/No | [default or —] | [clear business description] | [realistic example value] |

**Constraints:**
- Primary key: [column(s)]
- Unique: [column(s)]
- Foreign keys: [column → referenced_table.column]
- Check constraints: [if any]

**Indexes:** [inferred recommendations if not explicit]

---

(Repeat for each table)

### Relationships
If requested, show relationships as:

| Parent Table | Child Table | Relationship | Foreign Key | Cardinality |
|-------------|-------------|-------------- |-------------|-------------|
| [parent] | [child] | [description] | [FK column] | 1:N / N:M / 1:1 |

### Data Quality Notes
- [any nullable fields that probably shouldn't be nullable]
- [fields that lack constraints but should have them]
- [naming inconsistencies or anti-patterns spotted]

### Glossary
| Term | Definition |
|------|-----------|
| [business term used in columns] | [plain English meaning] |

Rules:
- Column descriptions must be in business language, not just
  restating the column name: BAD: "user email", GOOD: "Primary
  email address used for login and notifications"
- Example values must be realistic but never real PII
- If the schema is informal, infer reasonable types and constraints
- Always flag potential data quality issues
- Foreign key relationships must be explicit about which tables connect
- If columns seem related across tables, note the relationship
  even if no FK is formally declared`,
  outputType: "markdown",
};
