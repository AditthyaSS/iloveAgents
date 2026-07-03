# Changelog

All notable changes to **iloveAgents** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

> Changes that are merged but not yet formally versioned.

---

## [Current Project Overview]

Initial public release of iloveAgents — a community-built, open source platform
for running AI agents directly in the browser. No sign-up. No backend. Bring your own API key.

###  Core Platform

- Config-driven agent registry (`src/agents/registry.js`) — agents are auto-collected from `src/agents/definitions/`
- Unified LLM adapter (`src/lib/llmAdapter.js`) supporting one-shot and streaming modes
- Support for **OpenAI**, **Anthropic**, and **Google Gemini** providers — switchable at runtime
- `ApiKeyBar` component with password-masked key input, eye toggle, and session-save option
- API key stored in `sessionStorage` only — never sent to any server
- `resolveAgentModel` logic for safe model resolution with fallback chain
- Streaming output support for all three providers via `streamAgent()`
- React Router v6 SPA routing with Vercel `vercel.json` rewrite rules
- Dark/light theme support via Tailwind CSS
- Markdown output rendering via `react-markdown` + `remark-gfm`
- Code syntax highlighting via `react-syntax-highlighter`
- Copy output, Share, and Download buttons on agent results
- `ScorecardOutput` component for structured JSON output visualisation

###  Agents Added 

####  Engineering 
- **Accessibility Audit Generator** — WCAG audit from HTML with issues, severity ratings, and fixes
- **API Doc Generator** — paste code, get professional API docs with examples
- **API Error Message Writer** — generate clear, user-friendly API error messages
- **Bug Report Generator** — describe a bug in plain English, get a structured GitHub/Jira-ready report
- **Changelog Generator** — turn git commits or PR titles into a clean user-facing changelog
- **Code Complexity Analyzer** — analyse code complexity with improvement suggestions
- **Code Migration Guide** — generate step-by-step migration guides between frameworks or versions
- **Code Reviewer** — senior-level code review with issue detection, scoring, and fix suggestions
- **Cron Expression Builder** — describe a schedule, get the correct cron expression with explanation
- **Data Dictionary Generator** — paste a schema, get field definitions and relationship docs
- **Environment Variables Doc Generator** — document `.env` variables with types and descriptions
- **Incident Post-Mortem Writer** — blameless post-mortems with timeline, root cause, and action items
- **Incident Runbook Generator** — generate operational runbooks for incident response
- **Kubernetes Manifest Generator** — generate K8s manifests from plain English descriptions
- **Regex Generator** — plain English → tested regex patterns with breakdowns
- **Unit Test Generator** — paste a function, get full unit tests with edge cases

####  Business & Product 
- **Competitive Analysis Generator** — structured competitive analysis from product and competitor names
- **Proposal Document Generator** — generate professional project or business proposals
- **Sales Discovery Call Script Generator** — tailored discovery call scripts for B2B sales
- **Sales Objection Handler** — generate responses to common sales objections
- **Startup Idea Validator** — market potential, competition, risks, and viability scoring
- **User Story Writer** — feature descriptions → user stories with acceptance criteria and edge cases
- **Win-Loss Analysis Report Generator** — structured win/loss analysis from deal notes

####  Data & ML 
- **Data Cleaning Plan Generator** — generate a data cleaning strategy from dataset descriptions
- **Dataset Description Generator** — generate metadata and descriptions for datasets
- **Mock Data Generator** — generate realistic mock data for testing
- **ML Experiment Report Generator** — document ML experiments with metrics and conclusions

####  Marketing & Content 
- **Blog Post SEO Optimizer** — optimise blog posts for search with keyword and structure suggestions
- **Cold Email Writer** — personalised B2B cold emails with tone and length control
- **LinkedIn Outreach Message Writer** — personalised LinkedIn connection messages

- **LinkedIn Post Writer** — ready-to-post LinkedIn content with hooks and hashtags
- **Social Media Thread Writer** — X/Twitter threads with hooks and call to action
- **SEO Keyword Planner** — keyword research and content strategy from a topic

####  HR 
- **Cover Letter Writer** — tailored cover letters from job description and background
- **Performance Review Writer** — structured, fair performance reviews from bullet notes
- **Resume Screener** — evaluate candidates against job descriptions with visual scorecard
- **GitHub Issue Claim Comment Generator** — generate well-structured issue claim comments for open source

####  Education 
- **ELI5 Explainer** — explain complex topics at your chosen difficulty level
- **Flashcard Generator** — paste study material, get Q&A flashcards for Anki or Quizlet
- **Grant Proposal Writer** — structured grant proposals with problem statement and methodology

####  Health 
- **Health & Wellness Plan Generator** — personalised wellness plans from health goals
- **Medication Interaction Explainer** — explain potential medication interactions in plain language
- **Patient Discharge Summary Writer** — structured discharge summaries from clinical notes

####  Finance & Legal 
- **Personal Budget Analyzer** — analyse spending and generate a budget plan
- **Privacy Policy Generator** — comprehensive privacy policy draft from app description
- **Technical Debt Report Generator** — document and prioritise technical debt

####  Productivity 
- **Email Reply Writer** — paste any email, describe intent, get a polished reply
- **Invoice Description Generator** — turn work notes into polished invoice line items
- **Meeting Notes Summarizer** — raw meeting notes → clean summaries with decisions and action items
- **PDF Summarizer** — structured summaries with key points and action items from PDF text

####  Research 
- **Persona Generator** — detailed realistic user personas with goals and frustrations
- **Research Agent** — comprehensive research on any topic with configurable depth

###  Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | Component framework |
| Vite | 6.0.1 | Build tool and dev server |
| Tailwind CSS | 3.4.15 | Styling |
| React Router | 6.28.0 | Client-side routing |
| Lucide React | 0.468.0 | Icons |
| react-markdown | 9.0.1 | Markdown rendering |
| react-syntax-highlighter | 15.6.1 | Code highlighting |
| Supabase JS | 2.105.4 | (Auth/DB — optional integration) |

###  Documentation & Community Files

- `README.md` — full setup, architecture, contributing guide, and agent table
- `CONTRIBUTING.md` — how to add an agent in 3 steps
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `SUPPORT.md`
- `MAINTAINERS.md`
- `ACKNOWLEDGMENTS.md`
- `agent_proposal.md` — template for proposing new agents
- `.env.example`
- `.github/` — issue and PR templates

---

## How to Contribute

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide.
Adding a new agent takes about 5 minutes — just add one config object to `src/agents/definitions/`.

---

*Built with ❤️ by [@AditthyaSS](https://github.com/AditthyaSS) and the open source community.*