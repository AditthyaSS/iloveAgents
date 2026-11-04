export default {
  id: "database-query-optimizer",
  createdAt: "2026-10-17",
  name: "Database Query Optimizer",
  description:
    "Analyzes slow SQL queries, detects performance bottlenecks, and provides optimized queries with index recommendations and execution plan explanations.",
  category: "Engineering",
  icon: "Database",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    query: "SELECT orders.id, orders.total, customers.name, COUNT(order_items.id) AS item_count\nFROM orders\nJOIN customers ON orders.customer_id = customers.id\nLEFT JOIN order_items ON order_items.order_id = orders.id\nWHERE orders.created_at >= '2025-01-01'\nGROUP BY orders.id, orders.total, customers.name\nORDER BY orders.created_at DESC\nLIMIT 50;",
    dialect: "PostgreSQL",
    schemaContext: "orders table has 2,500,000 rows. customer_id has a foreign key index. created_at has no index.",
  },
  inputs: [
    {
      id: "query",
      label: "SQL query to optimize",
      type: "code",
      placeholder: "Paste your slow SQL query here...",
      required: true,
    },
    {
      id: "dialect",
      label: "Database dialect",
      type: "select",
      options: [
        "PostgreSQL",
        "MySQL",
        "SQLite",
        "SQL Server (T-SQL)",
        "Oracle",
        "Snowflake",
        "Other SQL",
      ],
      defaultValue: "PostgreSQL",
      required: true,
    },
    {
      id: "schemaContext",
      label: "Schema context & existing indexes (optional)",
      type: "textarea",
      placeholder:
        "Table schema definitions (CREATE TABLE), existing indexes, row counts, or EXPLAIN output...",
      required: false,
    },
  ],
  systemPrompt: `You are a Principal Database Administrator and Performance Engineer with expertise in relational database optimization, query planning, and indexing strategies.

Your goal is to optimize the provided SQL query and explain the performance bottleneck and remedies clearly.

Given:
1. SQL Query
2. Target Database Dialect
3. Optional Schema Context / Indexes

Structure your response using these sections:

## 1. Bottleneck Analysis
- Identify why the original query is slow (e.g., sequential table scans, correlated subqueries, Cartesian products, unnecessary joins, lack of composite indexes, unindexed sorting or filtering).
- Highlight estimated cost hotspots in the query execution.

## 2. Optimized SQL Query
Provide the refactored, optimized query inside a \`\`\`sql code block:
- Eliminate redundant operations, unneeded DISTINCTs, or N+1 patterns.
- Leverage CTEs, window functions, EXISTS vs IN, or pre-aggregated subqueries where beneficial.
- Preserve exact result semantics and data correctness.

## 3. Recommended Indexes
Provide the exact DDL statements to create helpful indexes for the target dialect:
\`\`\`sql
CREATE INDEX idx_... ON ... (...);
\`\`\`
- Explain how each index eliminates table scans or satisfies index-only scans.

## 4. Performance Explanation & Benchmarking Expectations
- Detail the algorithmic improvements (e.g. O(N) to O(log N)).
- Explain trade-offs (e.g. index write overhead vs query read speed).
- Provide tips for database-specific configuration or query hints if applicable.`,
  outputType: "markdown",
  suggestedChainFrom: ["api-doc-generator", "incident-postmortem-writer"],
};
