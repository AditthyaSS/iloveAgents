const prdGenerator = {
  id: 'prd-generator',           // lowercase, kebab-case, URL safe
  createdAt: '2026-05-21',   // YYYY-MM-DD
  name: 'PRD Generator',
  description: 'Generates detailed Product Requirements Documents.',
  category: 'Product',          // Productivity | Research | Marketing | Engineering | HR | Business | Education | Design | Product | Legal
  icon: 'FileText',              // Any icon from lucide.dev/icons
  provider: 'any',               // 'openai' | 'anthropic' | 'gemini' | 'any'
  defaultProvider: 'gemini',     // Only needed if provider is 'any'
  model: 'gemini-2.5-flash',
  inputs: [
    {
      id: 'problem_statement',
      label: 'Problem Statement / Goal',
      type: 'textarea',          // text | textarea | code | select | multiselect
      placeholder: 'What exact problem is the product solving, and for whom? Example: "Students struggle to track assignments across platforms."',
      required: true,
    },
    {
      id: 'core_features',
      label: 'Core Features & User Flow',
      type: 'textarea',
      placeholder: 'What should the product do, and how will users interact with it? Include main features, user inputs, expected outputs, and basic workflow. Example: User uploads bank statement → AI categorizes spending → dashboard shows insights.',
      required: true,
    },
    {
      id: 'target_users',
      label: 'Target Users & Success Criteria',
      type: 'textarea',
      placeholder: 'Who will use it, and how do you measure success? Include user type, platform (web, mobile, API), and success metrics. Example: "Reduce manual expense tracking time by 80%. Support 1,000 concurrent users."',
      required: true,
    },
    {
      id: 'additional_details',
      label: 'Additional Details',
      type: 'textarea',
      placeholder: 'Any other relevant information, constraints, timeline, budget, or technical considerations.',
      required: false,
    },
  ],
  systemPrompt: `Act as a senior Product Manager. Generate a professional, execution-ready PRD using ONLY the 4 user inputs below.

Goals:
- Detailed but concise
- Startup + engineer friendly
- MVP-first and cost-efficient
- Realistic architecture
- Minimal fluff
- Structured for fast implementation

Rules:
- Do not invent unrelated features
- Make reasonable assumptions only when needed
- Clearly label assumptions
- Prefer free-tier/open-source tools
- Prioritize simple scalable systems over enterprise complexity
- Focus on practical execution

USER INPUTS

1. Problem / Goal
{{problem_statement}}

2. Core Features & User Flow
{{core_features}}

3. Target Users & Success Criteria
{{target_users}}

4. Additional Details
{{additional_details}}

OUTPUT FORMAT

# PRD

## 1. Overview
- Product Name
- One-line Pitch
- Vision
- Primary Goal
- Core Value Proposition

## 2. Problem
- Pain Points
- Existing Alternatives
- Market Gap
- Why Current Solutions Fail

## 3. Users
- Primary Users
- Secondary Users
- 2–3 User Personas:
  - Role
  - Goals
  - Frustrations
  - Skill Level

## 4. Features
For each feature include:
- Purpose
- User Story
- Inputs
- Outputs
- Backend Logic
- AI Usage (if applicable)
- Edge Cases
- Priority (Must / Should / Nice)

## 5. User Flow
- Step-by-step journey
- Auth flow
- Failure states
- Empty/loading states

## 6. Functional Requirements
Cover:
- Frontend
- Backend
- Database
- APIs
- Auth
- AI pipeline
- Search
- Analytics
- Admin tools

## 7. Non-Functional Requirements
- Scalability
- Security
- Reliability
- Performance
- Accessibility
- Maintainability
- Cost efficiency

## 8. AI Architecture (if relevant)
- Model choice
- Prompt strategy
- RAG pipeline
- Embeddings
- Vector DB
- Hallucination prevention
- Safety
- Latency + cost optimization

## 9. Recommended Tech Stack
For each layer provide:
- Recommended tech
- Why chosen
- Free-tier advantage
- Scaling path

Include:
Frontend, Backend, DB, Hosting, Auth, AI, Vector DB, Analytics, CI/CD, Monitoring

Prefer:
Next.js, FastAPI, Supabase, PostgreSQL, Qdrant, Vercel, Docker, Cloudflare, OSS AI tools.

## 10. Database Design
- Main tables
- Important fields
- Relationships
- Indexing suggestions

## 11. API Design
Include sample:
- Endpoint
- Method
- Purpose
- Request
- Response

## 12. UI/UX
- Design direction
- Layout
- Navigation
- Mobile responsiveness
- Error handling
- Dashboard ideas
- Modern product inspirations

## 13. Security & Privacy
- Auth security
- Encryption
- API protection
- Rate limiting
- Privacy/GDPR
- AI safety

## 14. MVP Scope
Separate:
- MVP
- Phase 2
- Future Vision

## 15. Roadmap
Phase-wise plan with:
- Tasks
- Complexity
- Dependencies

## 16. Cost Estimation
Include:
- Monthly infra cost
- Free-tier options
- Cheapest deployment path
- AI/API costs
- Scaling expectations

## 17. Risks
- Technical
- Product
- AI
- Scaling
- Legal/privacy

Include mitigations.

## 18. Success Metrics
- Product KPIs
- Technical KPIs
- AI quality metrics
- Retention/engagement metrics

## 19. Competitive Advantage
- Unique value
- UX advantage
- AI moat
- Cost advantage
- Speed advantage

## 20. Final Summary
- Best MVP build order
- Recommended architecture
- Lean engineering team structure
- Final execution recommendation

STYLE:
- Use concise PM language
- Prefer bullets/tables over paragraphs
- Be implementation-focused
- Avoid generic filler
- Keep output dense and information-rich`,
  examples: [
    {
      title: 'AI Expense Tracker',
      problem_statement: 'Freelancers spend 5+ hours/week manually categorizing expenses from receipts, invoices, and bank statements, leading to inaccurate reporting and missed deductions.',
      core_features: 'Users upload receipts or connect bank account → AI extracts expense details → Auto-categorizes by type (meals, travel, software) → Dashboard shows spending trends and tax deductions → Export to CSV or accounting software.',
      target_users: 'Freelancers, small business owners (1-10 employees), accountants. Success metrics: 80% accuracy in categorization, 90% time reduction vs manual entry, $50/month ARPU.',
      additional_details: 'MVP timeline: 6 weeks. Budget: $15k for MVP. OCR + Claude API. Need mobile app for receipt capture within 3 months.'
    },
    {
      title: 'Code Review Automation',
      problem_statement: 'Engineering teams waste 2-3 hours/day on code reviews for style, logic, and security issues that could be auto-detected, slowing PR merge time and draining reviewer time.',
      core_features: 'Developers open PR → AI analyzes code for bugs, security vulns, style issues → Auto-comments on problematic lines with fixes → Junior devs learn from AI feedback → Dashboard shows code quality trends per team member.',
      target_users: 'Mid-sized tech companies (20-200 engineers), startups. Platforms: GitHub, GitLab. Success metrics: 40% reduction in review time, 50% of PRs auto-approved, $500/month for 50 developers.',
      additional_details: 'Integrate with GitHub API. Needs training data from popular OSS repos. Launch in 8 weeks. No upfront cost beyond API usage.'
    },
    {
      title: 'Customer Support AI',
      problem_statement: 'E-commerce companies get 500+ support tickets/day. 60% are repetitive FAQs (shipping, returns, billing), costing $40k/month in support staff and causing 24+ hour response delays.',
      core_features: 'Customer submits ticket or chat → AI resolves common issues instantly (80% success rate) → Escalates complex cases to humans with context → Supports email, chat, and phone. Admin dashboard tracks resolution metrics.',
      target_users: 'E-commerce brands ($1-5M annual revenue), SaaS companies, marketplaces. Success metrics: 60% of tickets resolved by AI, 10x faster response time, 30% reduction in support costs.',
      additional_details: 'Lightweight LLM for cost. Knowledge base from existing FAQs and support history. Billing per ticket processed. MVP: $8k, scales to $200/month at 1000 tickets/day.'
    },
    {
      title: 'Content SEO Optimizer',
      problem_statement: 'Content creators and marketing teams manually research keywords, write blog posts, and optimize for SEO, taking 4-6 hours per post. Many posts rank poorly due to suboptimal structure and keyword placement.',
      core_features: 'Creator inputs target keyword and content outline → AI writes optimized blog post with proper heading hierarchy, internal links, meta tags → Real-time SEO score and suggestions → Exports to WordPress or Markdown → AI generates social media snippets.',
      target_users: 'Marketing agencies, in-house marketing teams, content creators. SaaS, e-commerce, media. Success metrics: 50% faster content creation, 3x improvement in organic search rankings, 100+ articles/month per user.',
      additional_details: 'Integrates with WordPress, SEMrush, Ahrefs APIs. $5k MVP budget. Freemium model: 5 articles/month free, $20/month for unlimited. AI model: GPT-4 + vector DB for competitor analysis.'
    },
  ],
  outputType: 'markdown',        // markdown | text | json
};

export default prdGenerator;