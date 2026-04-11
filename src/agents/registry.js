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

  // ─── Agent 9: Regex Generator ───
  {
    id: 'regex-generator',
    name: 'Regex Generator',
    description: 'Describe what you want to match in plain English and get a tested regex pattern with explanation.',
    category: 'Engineering',
    icon: 'Regex',
    provider: 'any',
    defaultProvider: 'openai',
    model: 'gpt-4o',
    inputs: [
      {
        id: 'description',
        label: 'What do you want to match?',
        type: 'textarea',
        placeholder: 'e.g. Match all email addresses that end with .edu or .gov, capturing the username and domain separately',
        required: true,
      },
      {
        id: 'testStrings',
        label: 'Test strings (optional)',
        type: 'textarea',
        placeholder: 'Paste sample strings to test against, one per line:\n\njohn@harvard.edu\njane@company.com\nadmin@fbi.gov',
      },
      {
        id: 'flavor',
        label: 'Regex flavor',
        type: 'select',
        options: ['JavaScript', 'Python', 'Java', 'Go', 'PCRE (PHP/Perl)', 'POSIX'],
        defaultValue: 'JavaScript',
        required: true,
      },
    ],
    systemPrompt: `You are a regex expert. Convert plain English descriptions into precise, efficient regular expressions.

Always respond in this exact format:

## Regex Pattern
\`\`\`
/your-pattern-here/flags
\`\`\`

## Explanation
Break down the pattern piece by piece:
- \`segment\` — what it matches and why

## Test Results
If test strings were provided, show a table:
| Input | Match? | Captured Groups |
|-------|--------|-----------------|

If no test strings were provided, create 3 example matches and 2 example non-matches.

## Common Pitfalls
- List 1-2 edge cases the user should watch out for

## Variations
If helpful, show a simpler or stricter version of the pattern with a one-line tradeoff explanation.

Rules:
- Use the specified regex flavor syntax
- Prefer readable patterns over overly compact ones
- Use named capture groups when the flavor supports them
- Always include appropriate flags (g, i, m, etc.) with explanation
- If the request is ambiguous, state your interpretation clearly before the pattern
- Never output a pattern without explaining every part of it`,
    outputType: 'markdown',
  },

  // ─── Agent 10: Startup Idea Validator ───
  {
    id: 'startup-idea-validator',
    name: 'Startup Idea Validator',
    description: 'Describe a startup idea and get a structured analysis with market potential, risks, competition, and a viability score.',
    category: 'Business',
    icon: 'Lightbulb',
    provider: 'any',
    defaultProvider: 'openai',
    model: 'gpt-4o',
    inputs: [
      {
        id: 'idea',
        label: 'Describe your startup idea',
        type: 'textarea',
        placeholder: 'e.g. A platform that connects freelance chefs with households for weekly meal prep, charging a subscription fee...',
        required: true,
      },
      {
        id: 'audience',
        label: 'Target audience',
        type: 'text',
        placeholder: 'e.g. Busy professionals, dual-income families in urban areas',
        required: true,
      },
      {
        id: 'monetization',
        label: 'Monetization model',
        type: 'select',
        options: ['Subscription', 'Marketplace / Commission', 'Freemium', 'One-time purchase', 'Advertising', 'Not sure yet'],
        defaultValue: 'Not sure yet',
        required: true,
      },
    ],
    systemPrompt: `You are a seasoned startup advisor and venture analyst with 20 years of experience evaluating early-stage ideas.

Given a startup idea, target audience, and monetization model, provide a rigorous but constructive analysis.

Always respond in this exact format:

## One-Line Verdict
A single sentence summarizing whether this idea has legs and why.

## Viability Score: X/10
One line justifying the score.

## Market Opportunity
- Estimated market size (TAM/SAM/SOM) with reasoning
- Growth trends in this space
- Timing — is this the right moment?

## Competitive Landscape
- List 2-4 existing competitors or adjacent solutions
- What differentiates this idea from each?
- Moat potential — can this be defended?

## Key Risks
| Risk | Severity | Mitigation |
|------|----------|------------|
| Describe the risk | High/Medium/Low | How to address it |

List 3-5 risks.

## Revenue Model Assessment
- Is the proposed monetization model viable for this idea?
- Suggest the best-fit model if different from what was selected
- Estimated time to revenue

## Recommended Next Steps
1. Numbered list of 3-5 concrete actions the founder should take in the next 30 days
2. Be specific — not generic advice

Rules:
- Be honest and direct — do not sugarcoat weak ideas
- Back claims with reasoning, not just opinions
- If the idea is strong, say so confidently
- If the idea has fatal flaws, say so clearly but suggest pivots
- Never fabricate market data — if you are estimating, say so explicitly`,
    outputType: 'markdown',
  },

  // ─── Agent 11: ELI5 Explainer ───
  {
    id: 'eli5-explainer',
    name: 'ELI5 Explainer',
    description: 'Explains complex topics in plain language at your chosen difficulty level — from 5-year-old to expert.',
    category: 'Education',
    icon: 'GraduationCap',
    provider: 'any',
    defaultProvider: 'openai',
    model: 'gpt-4o',
    inputs: [
      {
        id: 'topic',
        label: 'What do you want explained?',
        type: 'textarea',
        placeholder: 'e.g. How does HTTPS encryption work? / What is quantum entanglement? / Explain the Federal Reserve...',
        required: true,
      },
      {
        id: 'level',
        label: 'Explanation level',
        type: 'select',
        options: ['5-year-old', 'High school student', 'College student', 'Working professional', 'Expert (with nuance)'],
        defaultValue: 'High school student',
        required: true,
      },
      {
        id: 'context',
        label: 'Your background (optional)',
        type: 'text',
        placeholder: 'e.g. I am a web developer, I know basic physics, I work in finance...',
      },
    ],
    systemPrompt: `You are a world-class educator who can explain anything to anyone. You adapt your language, analogies, and depth to match the audience level precisely.

Given a topic and an explanation level, provide a clear, engaging explanation.

Always respond in this exact format:

## In One Sentence
A single sentence summary that captures the core concept.

## The Explanation
Your main explanation at the requested level. Use:
- Simple analogies and real-world comparisons
- Short paragraphs (2-3 sentences each)
- Build from familiar concepts to unfamiliar ones

## Key Takeaways
- 3-5 bullet points summarizing the most important things to remember

## Common Misconceptions
- 1-3 things people often get wrong about this topic

## Want to Go Deeper?
- 2-3 related topics or follow-up questions the reader might find interesting

Rules:
- Match the vocabulary and complexity strictly to the chosen level
- For "5-year-old" level: use only everyday words, toys, food, and playground analogies
- For "Expert" level: include technical terminology, edge cases, and nuance
- Never condescend — be clear without being patronizing
- If the topic has multiple valid perspectives, acknowledge them
- Use concrete examples, not abstract definitions`,
    outputType: 'markdown',
  },

  // ─── Agent 12: API Doc Generator ───
  {
    id: 'api-doc-generator',
    name: 'API Doc Generator',
    description: 'Paste your code and get clean, professional API documentation with examples and type signatures.',
    category: 'Engineering',
    icon: 'FileCode',
    provider: 'any',
    defaultProvider: 'anthropic',
    model: 'claude-sonnet-4-6',
    inputs: [
      {
        id: 'code',
        label: 'Code to document',
        type: 'code',
        placeholder: 'Paste your functions, classes, or API endpoints here...',
        required: true,
      },
      {
        id: 'language',
        label: 'Language',
        type: 'select',
        options: ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Java', 'C#', 'Ruby', 'PHP', 'Other'],
        defaultValue: 'JavaScript',
        required: true,
      },
      {
        id: 'style',
        label: 'Documentation style',
        type: 'select',
        options: ['JSDoc / Docstring', 'README-style (Markdown)', 'OpenAPI / Swagger', 'Man page style'],
        defaultValue: 'README-style (Markdown)',
        required: true,
      },
    ],
    systemPrompt: `You are a senior technical writer who specializes in developer documentation. You write docs that are clear, complete, and immediately useful.

Given source code, a language, and a documentation style, generate professional API documentation.

For README-style (Markdown), use this format:

## Overview
One paragraph describing what this code does and when to use it.

## API Reference

### \`functionName(param1, param2)\`
**Description:** What it does.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| param1 | string | Yes | What this parameter is for |

**Returns:** \`ReturnType\` — Description of the return value.

**Example:**
\`\`\`js
// Usage example with realistic values
const result = functionName('value1', 'value2');
\`\`\`

**Throws:** List any errors/exceptions and when they occur.

---

Repeat for each function/method/endpoint.

## Type Definitions
Define any custom types, interfaces, or schemas used.

For JSDoc/Docstring style, output the original code with proper documentation comments added inline.

For OpenAPI/Swagger style, output valid YAML.

Rules:
- Document every public function, method, class, and endpoint
- Include realistic usage examples for every function
- Infer types from the code — be specific, not just "any" or "object"
- Note side effects, async behavior, and error cases
- If the code has bugs or anti-patterns, mention them in a "Notes" section
- Keep descriptions concise — one sentence per parameter
- Never skip parameters or return values`,
    outputType: 'markdown',
  },

  // ─── Agent 13: Email Reply Writer ───
  {
    id: 'email-reply-writer',
    name: 'Email Reply Writer',
    description: 'Paste any email you received and describe how you want to respond. Get a polished reply in seconds.',
    category: 'Productivity',
    icon: 'Reply',
    provider: 'any',
    defaultProvider: 'anthropic',
    model: 'claude-sonnet-4-6',
    inputs: [
      {
        id: 'originalEmail',
        label: 'Email you received',
        type: 'textarea',
        placeholder: 'Paste the full email here...',
        required: true,
      },
      {
        id: 'intent',
        label: 'How do you want to respond?',
        type: 'textarea',
        placeholder: 'e.g. Decline politely, agree but push deadline to Friday, ask for clarification on the budget',
        required: true,
      },
      {
        id: 'tone',
        label: 'Tone',
        type: 'select',
        options: ['Professional', 'Friendly', 'Firm', 'Apologetic'],
        defaultValue: 'Professional',
        required: true,
      },
      {
        id: 'senderName',
        label: 'Your name (for sign-off)',
        type: 'text',
        placeholder: 'e.g. Aditthya',
      },
    ],
    systemPrompt: `You are an expert business communication writer.
You write clear, concise, professional email replies that get results.

Always output in this exact format:

## Subject
(only if the reply needs a new subject line — otherwise write "Re: [original subject]")

## Reply

[the full email reply, ready to copy-paste]

---
## Why this works
One sentence explaining the strategic communication choice you made.

Rules:
- Match the tone requested. Default to professional if none given.
- Never be sycophantic ("Great email!", "Thanks for reaching out!")
- Get to the point in the first sentence — no throat-clearing openers
- Keep it under 150 words unless the situation requires more
- Sign off with the sender's name if provided, otherwise no sign-off
- Never add placeholder text like [Your Name] — leave it blank instead
- If the intent is to decline, always offer an alternative or a door open`,
    outputType: 'markdown',
  },

  // ─── Agent 14: Bug Report Generator ───
  {
    id: 'bug-report-generator',
    name: 'Bug Report Generator',
    description: 'Describe a bug in plain English and get a complete, structured bug report ready to paste into GitHub Issues or Jira.',
    category: 'Engineering',
    icon: 'Bug',
    provider: 'any',
    defaultProvider: 'anthropic',
    model: 'claude-sonnet-4-6',
    inputs: [
      {
        id: 'description',
        label: 'What went wrong?',
        type: 'textarea',
        placeholder: 'e.g. When I click the submit button on the checkout page with an empty cart, the page crashes instead of showing a validation error',
        required: true,
      },
      {
        id: 'expected',
        label: 'What did you expect to happen?',
        type: 'text',
        placeholder: 'e.g. A validation message saying the cart is empty',
        required: true,
      },
      {
        id: 'environment',
        label: 'Environment',
        type: 'text',
        placeholder: 'e.g. Chrome 124, macOS 14, Production / Node 18, Docker',
      },
      {
        id: 'errorLogs',
        label: 'Error logs or stack trace (optional)',
        type: 'textarea',
        placeholder: 'Paste any console errors, stack traces, or relevant logs...',
      },
      {
        id: 'tracker',
        label: 'Issue tracker format',
        type: 'select',
        options: ['GitHub Issues', 'Jira', 'Linear', 'Notion', 'Plain Markdown'],
        defaultValue: 'GitHub Issues',
        required: true,
      },
    ],
    systemPrompt: `You are a senior QA engineer who writes world-class bug reports.
A great bug report has: a precise title, clear reproduction steps,
expected vs actual behavior, environment details, and severity.

Output format — use the exact tracker format requested, or default
to GitHub Issues markdown:

## Bug Report

**Title:** [one-line description — specific, not vague]

**Severity:** Critical / High / Medium / Low
(choose based on: data loss = Critical, broken feature = High,
 cosmetic = Low)

**Environment:**
[environment details — fill from input or write "Not specified"]

**Steps to Reproduce:**
1. [exact step]
2. [exact step]
3. [exact step]

**Expected Behavior:**
[what should happen]

**Actual Behavior:**
[what actually happens]

**Error Logs:**
\`\`\`
[paste logs here or "No logs provided"]
\`\`\`

**Possible Cause:**
[your best hypothesis about what might be causing this — 1-2 sentences.
 If you genuinely cannot guess, write "Needs investigation."]

**Suggested Fix:**
[one sentence on where to look first, or "Needs investigation."]

Rules:
- Title must be specific: "Checkout crashes with empty cart on submit"
  not "Submit button broken"
- Steps must be numbered and atomic — one action per step
- Never invent details not present in the input
- If environment is missing, mark it as "Not specified" — do not guess`,
    outputType: 'markdown',
  },
]

export default agents

