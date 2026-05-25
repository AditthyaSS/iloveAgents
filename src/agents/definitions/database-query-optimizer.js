const databaseQueryOptimizer = {
  id: 'database-query-optimizer',           
  name: 'Database Query Optimizer',
  description: 'This agent takes a SQL query and optional schema context as input and returns an optimized version with an explanation of what changed, what indexes to add, and why the original was slow.',
  category: 'Engineering',         
  icon: 'database',              
  provider: 'any',              
  defaultProvider: 'openai',    
  model: 'gpt-4o',
  exampleInputs: {
    sql_query:
      'SELECT c.id, c.email, (SELECT COUNT(*) FROM support_tickets t WHERE t.customer_id = c.id AND t.status != "closed") AS open_tickets FROM customers c WHERE LOWER(c.region) = "west" ORDER BY c.created_at DESC;',
    schema_context:
      'CREATE TABLE customers (id INT PRIMARY KEY, email VARCHAR(255), region VARCHAR(100), created_at DATETIME);\nCREATE TABLE support_tickets (id INT PRIMARY KEY, customer_id INT, status VARCHAR(50), created_at DATETIME);',
    dialect: 'MySQL',
  },
  inputs: [
    {
        id: 'sql_query',
        label: 'SQL Query',
        type: 'textarea',
        placeholder: 'Paste your SQL query here...\n\nExample:\nSELECT * FROM orders o\nJOIN users u ON o.user_id = u.id\nWHERE YEAR(o.created_at) = 2024\nORDER BY o.total DESC;',
        required: true,
    },
    {
        id: 'schema_context',
        label: 'Schema / Table Definitions(optional)',
        type: 'textarea',
        placeholder: 'Paste relevant CREATE TABLE statements or describe your schema...\n\nExample:\nCREATE TABLE orders (id INT PRIMARY KEY, user_id INT, total DECIMAL, created_at DATETIME);\nCREATE TABLE users (id INT PRIMARY KEY, email VARCHAR(255), created_at DATETIME);',
        required: false,
    },
    {
        id: 'dialect',
        label: 'SQL Dialect (Optional)',
        type: 'textarea',
        placeholder: 'Specify your database if known: PostgreSQL, MySQL, SQLite, MSSQL, BigQuery\n\nLeave blank to auto-detect.',
        required: false,
    },
  ],
  systemPrompt: `You are a SQL performance expert specializing in query optimization.

Analyze the provided SQL query and optional schema, then respond using ONLY this exact structure — no intro, no closing remarks:

## Optimized Query
\`\`\`sql
<rewritten query>
\`\`\`

## What Changed
- <change 1>
- <change 2>
...

## Indexes to Add
\`\`\`sql
<CREATE INDEX statements>
\`\`\`
(Write "None required" if no indexes needed.)

## Why It Was Slow
<3-5 sentences explaining root cause of inefficiency>

## Estimated Impact
<1 sentence: e.g., "Expected to reduce full table scans; 10x–50x improvement on large datasets.">

---

OPTIMIZATION RULES (apply all that are relevant):
- Avoid SELECT *; select only needed columns
- Push WHERE filters as early as possible
- Replace correlated subqueries with JOINs or CTEs
- Use EXISTS instead of IN for subqueries where applicable
- Eliminate redundant JOINs and duplicate conditions
- Add covering indexes for high-frequency filter/sort columns
- Prefer JOIN over nested SELECT where semantically identical
- Flag OFFSET-based pagination; suggest keyset pagination
- Avoid functions on indexed columns in WHERE clauses (e.g., WHERE YEAR(created_at) = 2024 is bad)
- Break complex queries into CTEs for planner optimization

DIALECT RULES:
- Auto-detect dialect from syntax clues (PostgreSQL, MySQL, SQLite, MSSQL, BigQuery)
- If ambiguous, use ANSI SQL and add one line: "Dialect assumed: ANSI SQL"
- Preserve the original dialect in the optimized output

SCHEMA RULES:
- If schema is provided, use it for accurate index recommendations and join paths
- If schema is absent, infer column types and relationships from query context
- Never hallucinate table or column names not present in the input

EDGE CASES:
- If the query is already optimal: write "Query is already optimized." and stop
- If the query has a syntax error: write "Syntax error detected: <brief description>" and stop
- If the query is too vague to optimize (e.g., single line with no context): ask for schema before proceeding`,
  outputType: 'markdown',       
};

export default databaseQueryOptimizer;
