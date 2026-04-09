// ============================================================
// I LOVE AGENTS — Agent Registry
// ============================================================
//
// To contribute an agent: copy one of the config objects below,
// fill in your agent details, add it to the `agents` array,
// and open a PR. That's it — the UI auto-generates from this
// config. See CONTRIBUTING.md for full guidelines.
//
// ============================================================

const agents = [
  // ─── Agent 1: PDF Summarizer ───
  {
    id: 'pdf-summarizer',
    name: 'PDF Summarizer',
    description: 'Upload a PDF and get a structured summary with key points.',
    category: 'Productivity',
    icon: 'FileText',
    provider: 'anthropic',
    model: 'claude-opus-4-20250514',
    inputs: [
      {
        id: 'pdf_text',
        label: 'Paste PDF text',
        type: 'textarea',
        placeholder: 'Paste extracted PDF content here...',
        required: true,
      },
      {
        id: 'focus',
        label: 'Focus area (optional)',
        type: 'text',
        placeholder: 'e.g. financial metrics, risks, methodology',
      },
    ],
    systemPrompt: `You are an expert document analyst. The user will provide text from a PDF. Return a structured summary with:
1. One-line TL;DR
2. Key points (bullet list)
3. Main entities mentioned
4. Action items if any.
Be concise and factual.`,
    outputType: 'markdown',
  },

  // ─── Agent 2: Research Agent ───
  {
    id: 'research-agent',
    name: 'Research Agent',
    description: 'Get comprehensive research on any topic with configurable depth.',
    category: 'Research',
    icon: 'Search',
    provider: 'openai',
    model: 'gpt-4o',
    inputs: [
      {
        id: 'topic',
        label: 'Topic',
        type: 'text',
        placeholder: 'e.g. Quantum computing applications in drug discovery',
        required: true,
      },
      {
        id: 'depth',
        label: 'Depth',
        type: 'select',
        options: ['Quick', 'Detailed', 'Expert'],
        defaultValue: 'Detailed',
        required: true,
      },
      {
        id: 'format',
        label: 'Output format',
        type: 'select',
        options: ['Bullet points', 'Report', 'Q&A'],
        defaultValue: 'Report',
        required: true,
      },
    ],
    systemPrompt: `You are a thorough research assistant. When given a topic, research it comprehensively based on the selected depth level and return findings in the chosen format. Cite key facts clearly. Structure your response clearly with headings and sections.`,
    outputType: 'markdown',
  },

  // ─── Agent 3: Cold Email Writer ───
  {
    id: 'cold-email-writer',
    name: 'Cold Email Writer',
    description: 'Generate highly personalized B2B cold emails that convert.',
    category: 'Marketing',
    icon: 'Mail',
    provider: 'any',
    defaultProvider: 'openai',
    model: 'gpt-4o-mini',
    inputs: [
      {
        id: 'product',
        label: 'Your product/service',
        type: 'textarea',
        placeholder: 'Describe your product or service...',
        required: true,
      },
      {
        id: 'persona',
        label: 'Target persona',
        type: 'text',
        placeholder: 'e.g. SaaS CTOs, Marketing VPs at Series B startups',
        required: true,
      },
      {
        id: 'pain_point',
        label: 'Pain point to address',
        type: 'text',
        placeholder: 'e.g. High customer churn, slow onboarding',
        required: true,
      },
      {
        id: 'tone',
        label: 'Tone',
        type: 'select',
        options: ['Professional', 'Friendly', 'Direct'],
        defaultValue: 'Professional',
        required: true,
      },
      {
        id: 'length',
        label: 'Email length',
        type: 'select',
        options: ['Short (3 lines)', 'Medium (5-7 lines)', 'Long (full pitch)'],
        defaultValue: 'Medium (5-7 lines)',
        required: true,
      },
    ],
    systemPrompt: `You are an expert B2B copywriter. Write a cold email that is highly personalised, addresses the pain point directly, and has a clear CTA. Do not use clichés. Output only the email — no explanation or commentary.`,
    outputType: 'text',
  },

  // ─── Agent 4: Code Reviewer ───
  {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    description: 'Get a senior-level code review with actionable feedback.',
    category: 'Engineering',
    icon: 'Code',
    provider: 'any',
    defaultProvider: 'anthropic',
    model: 'claude-opus-4-20250514',
    inputs: [
      {
        id: 'code',
        label: 'Code',
        type: 'code',
        placeholder: 'Paste your code here...',
        required: true,
      },
      {
        id: 'language',
        label: 'Language',
        type: 'select',
        options: ['Python', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'Other'],
        defaultValue: 'JavaScript',
        required: true,
      },
      {
        id: 'focus',
        label: 'Review focus',
        type: 'multiselect',
        options: ['Security', 'Performance', 'Readability', 'Best Practices', 'Bugs'],
        defaultValue: ['Readability', 'Best Practices', 'Bugs'],
        required: true,
      },
    ],
    systemPrompt: `You are a senior software engineer doing a code review. Review the submitted code focusing on the selected aspects. For each issue found: state the line/section, explain the issue, and provide a corrected snippet. End with an overall score /10 and a one-line verdict. Format your response as clean markdown with code blocks.`,
    outputType: 'markdown',
  },

  // ─── Agent 5: Resume Screener ───
  {
    id: 'resume-screener',
    name: 'Resume Screener',
    description: 'Evaluate candidates against job descriptions with scoring.',
    category: 'HR',
    icon: 'UserCheck',
    provider: 'any',
    defaultProvider: 'openai',
    model: 'gpt-4o',
    inputs: [
      {
        id: 'job_description',
        label: 'Job Description',
        type: 'textarea',
        placeholder: 'Paste the job description...',
        required: true,
      },
      {
        id: 'resume',
        label: 'Resume',
        type: 'textarea',
        placeholder: 'Paste the candidate resume text...',
        required: true,
      },
      {
        id: 'criteria',
        label: 'Scoring criteria',
        type: 'multiselect',
        options: ['Technical skills', 'Experience years', 'Culture fit', 'Education'],
        defaultValue: ['Technical skills', 'Experience years'],
        required: true,
      },
    ],
    systemPrompt: `You are an experienced HR recruiter and talent evaluator. Given the job description and resume, evaluate the candidate strictly. Return your evaluation ONLY as a valid JSON object (no markdown, no code blocks, no explanation outside the JSON) with this exact structure:
{
  "matchScore": <number 0-100>,
  "criteria": {
    "<criterion name>": { "score": <number 0-100>, "comment": "<brief comment>" }
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
  "recommendation": "<Strong Yes | Yes | Maybe | No>",
  "reasoning": "<one paragraph reasoning>"
}`,
    outputType: 'json',
  },
  // ─── Agent 6: LinkedIn Post Writer ───
{
  id: 'linkedin-post-writer',
  name: 'LinkedIn Post Writer',
  description: 'Generate ready-to-post LinkedIn content with a strong hook and hashtags.',
  category: 'Marketing',
  icon: 'PenLine',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o-mini',

  inputs: [
    {
      id: 'topic',
      label: 'Topic',
      type: 'text',
      placeholder: 'e.g. Lessons from building my first startup',
      required: true,
    },
    {
      id: 'tone',
      label: 'Tone',
      type: 'select',
      options: ['Thought-leader', 'Story', 'Data-driven'],
      defaultValue: 'Story',
      required: true,
    },
  ],

  systemPrompt: `You are an expert LinkedIn content creator.

Write a LinkedIn post about the given topic using the selected tone.

Requirements:
- Start with a strong hook
- Write in clear short paragraphs
- Deliver value or insight
- End with a takeaway or call to action
- Include 3–5 relevant hashtags

Return ONLY the LinkedIn post ready to copy and publish.`,

  outputType: 'markdown',
},

  // ─── Agent 7: Meeting Notes Summarizer ───
  {
    id: 'meeting-notes-summarizer',
    name: 'Meeting Notes Summarizer',
    description: 'Turns raw meeting notes or transcripts into a clean summary with decisions, action items, and owners.',
    category: 'Productivity',
    icon: 'ClipboardList',
    provider: 'any',
    defaultProvider: 'anthropic',
    model: 'claude-sonnet-4-6',
    inputs: [
      {
        id: 'notes',
        label: 'Raw meeting notes or transcript',
        type: 'textarea',
        placeholder: 'Paste your raw notes, transcript, or bullet points here...',
        required: true,
      },
      {
        id: 'meetingTitle',
        label: 'Meeting title (optional)',
        type: 'text',
        placeholder: 'e.g. Q2 Planning Sync',
      },
      {
        id: 'attendees',
        label: 'Attendees (optional)',
        type: 'text',
        placeholder: 'e.g. Aditthya, Priya, Rahul',
      },
    ],
    systemPrompt: `You are an expert at turning messy meeting notes and transcripts into clean, professional summaries.

Always structure your output in this exact format:

## Summary
2-3 sentence overview of the meeting purpose and outcome.

## Key Decisions
- List each decision made, one per bullet

## Action Items
| Owner | Task | Due |
|-------|------|-----|
| Name  | What they need to do | Timeline if mentioned |

## Open Questions
- List any unresolved questions or topics tabled for later

## Next Steps
- Any follow-up meetings, deadlines, or dependencies mentioned

Rules:
- If owner is not mentioned for an action item, write "TBD" in Owner
- If no due date is mentioned, write "Not specified" in Due
- Keep the Summary concise — executives should be able to read it in 10 seconds
- Do not add information that was not in the original notes
- Use plain language, no jargon`,
    outputType: 'markdown',
  },

  // ─── Agent 8: SQL Query Generator ───
  {
    id: 'sql-query-generator',
    name: 'SQL Query Generator',
    description: 'Converts plain English questions into clean SQL queries. Paste your schema and describe what you want.',
    category: 'Engineering',
    icon: 'Database',
    provider: 'any',
    defaultProvider: 'anthropic',
    model: 'claude-sonnet-4-6',
    inputs: [
      {
        id: 'question',
        label: 'What do you want to know?',
        type: 'textarea',
        placeholder: 'e.g. Show me the top 10 customers by total order value in the last 30 days, grouped by region',
        required: true,
      },
      {
        id: 'schema',
        label: 'Database schema',
        type: 'textarea',
        placeholder: `Paste your CREATE TABLE statements or describe your tables:\n\ne.g.\nusers (id, name, email, region, created_at)\norders (id, user_id, total, status, created_at)\norder_items (id, order_id, product_id, quantity, price)`,
        required: true,
      },
      {
        id: 'dialect',
        label: 'SQL dialect',
        type: 'select',
        options: ['PostgreSQL', 'MySQL', 'SQLite', 'BigQuery', 'Snowflake', 'SQL Server'],
        defaultValue: 'PostgreSQL',
        required: true,
      },
    ],
    systemPrompt: `You are a senior data engineer and SQL expert.
Your job is to write correct, efficient, readable SQL queries.

Always respond in this exact format:

## SQL Query
\`\`\`sql
-- your query here
\`\`\`

## Explanation
Plain English explanation of what the query does, step by step.
Keep it concise — one sentence per major clause.

## Assumptions
- List any assumptions you made about the schema or data
- List any edge cases the user should be aware of

## Alternative Approaches
If there is a meaningfully different way to write this query
(e.g. using a CTE vs subquery, or a window function vs GROUP BY),
show a brief alternative with one line explaining the tradeoff.

Rules:
- Use the specified SQL dialect syntax
- Always use table aliases for readability in joins
- Always use explicit column names — never SELECT *
- Add brief inline comments for non-obvious logic
- If the schema is insufficient to answer the question, say so
  clearly and explain what additional tables or columns are needed
- Never make up table or column names not present in the schema`,
    outputType: 'markdown',
  },
]

export default agents

