export default {
    id: "sql-query-optimizer",
    createdAt: "2026-06-05",
    name: "SQL Query Optimizer",
    description:
        "Analyzes SQL queries and suggests performance optimizations, indexing strategies, and cleaner alternatives.",
    category: "Engineering",
    icon: "Database",
    provider: "any",
    defaultProvider: "anthropic",
    model: "claude-sonnet-4-6",

    exampleInputs: {
        query: `SELECT *
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE YEAR(o.created_at) = 2025
ORDER BY o.created_at DESC;`,
        schema: `customers (id, name, email)
orders (id, customer_id, total_amount, status, created_at)`,
        dialect: "MySQL",
    },

    inputs: [
        {
            id: "query",
            label: "SQL Query",
            type: "textarea",
            placeholder:
                "Paste the SQL query you want to optimize...",
            required: true,
        },
        {
            id: "schema",
            label: "Database Schema (Optional)",
            type: "textarea",
            placeholder: `Paste your schema for more accurate optimization:\n\nusers (id, name, email)\norders (id, user_id, total, status, created_at)`,
            required: false,
        },
        {
            id: "dialect",
            label: "SQL Dialect",
            type: "select",
            options: [
                "PostgreSQL",
                "MySQL",
                "SQLite",
                "BigQuery",
                "Snowflake",
                "SQL Server",
            ],
            defaultValue: "PostgreSQL",
            required: true,
        },
    ],

    systemPrompt: `You are a senior database performance engineer and SQL optimization expert.

Your job is to analyze SQL queries and provide performance improvements, readability enhancements, and indexing recommendations.

Always respond in this exact format:

## Query Analysis

### Performance Score
Rate the query from 1-10 and briefly explain the score.

### Issues Found
- List performance bottlenecks
- Identify anti-patterns
- Highlight expensive operations
- Mention readability concerns

## Optimized Query

\`\`\`sql
-- optimized query here
\`\`\`

## Changes Made
- Explain each optimization
- Explain why it improves performance
- Mention any tradeoffs

## Index Recommendations

\`\`\`sql
-- recommended indexes
\`\`\`

Explain how each index helps.

## Expected Performance Impact
- Estimated improvement level (Low / Medium / High)
- Which operations become faster
- Potential scalability benefits

## Additional Suggestions
- Query design recommendations
- Schema improvements
- Partitioning, caching, or denormalization ideas if applicable

Rules:
- Use the specified SQL dialect syntax
- Never use SELECT *
- Preserve the original query's intended result
- Explain why every optimization was made
- Recommend indexes when appropriate
- Detect non-sargable conditions
- Identify unnecessary joins, subqueries, DISTINCTs, and ORDER BY clauses
- Suggest CTEs, window functions, or query rewrites when beneficial
- If the query is already optimized, explain why and provide only minor improvements
- Never invent tables or columns that are not present in the query or schema
- If schema information is missing, optimize using best practices and clearly state assumptions`,

    outputType: "markdown",
};