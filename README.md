<div align="center">

# I Love Agents

**AI Agents, ready to use. Open source. Community-built. Bring your own key.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-iloveagents.vercel.app-6C63FF?style=for-the-badge)](https://iloveagents.vercel.app)

[![GSSoC 2026](https://img.shields.io/badge/GSSoC-2026-blue?style=flat-square)](https://gssoc.girlscript.tech/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)](https://iloveagents.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

</div>

---

## What is I Love Agents?

**I Love Agents** is a clean, modern web platform where you can run AI agents directly in your browser — no backend, no data collection, no sign-up. Just paste your API key and go.

Each agent is a focused tool that does one thing well: summarize meeting notes, generate SQL queries, write cold emails, review code, and more. The entire platform is **config-driven** — adding a new agent is as simple as adding a JavaScript object to a single file.

### Key Highlights

- **Privacy-first** — API keys never leave your browser. No server, no storage, no tracking.
- **Zero setup** — No `.env` files, no backend, no database. Clone and run.
- **Multi-provider** — Works with OpenAI, Anthropic, and Google Gemini out of the box.
- **Config-driven** — Add agents by editing one file. No React knowledge needed.
- **Community-built** — Open source and designed for contributions.

---

## Available Agents

| # | Agent | What It Does | Category | Default Provider |
|---|-------|-------------|----------|-----------------|
| 1 | **PDF Summarizer** | Extracts structured summaries from PDF text with key points and action items | Productivity | Anthropic |
| 2 | **Research Agent** | Comprehensive research on any topic with configurable depth and format | Research | OpenAI |
| 3 | **Cold Email Writer** | Generates personalized B2B cold emails with tone and length control | Marketing | OpenAI |
| 4 | **Code Reviewer** | Senior-level code review with issue detection, scoring, and fix suggestions | Engineering | Anthropic |
| 5 | **Resume Screener** | Evaluates candidates against job descriptions with visual scorecard output | HR | OpenAI |
| 6 | **LinkedIn Post Writer** | Creates ready-to-post LinkedIn content with strong hooks and hashtags | Marketing | OpenAI |
| 7 | **Meeting Notes Summarizer** | Turns raw meeting notes into clean summaries with decisions, action items, and owners | Productivity | Anthropic |
| 8 | **SQL Query Generator** | Converts plain English questions into optimized SQL with explanations | Engineering | Anthropic |
| 9 | **Regex Generator** | Translates plain English descriptions into tested regex patterns with breakdowns | Engineering | OpenAI |
| 10 | **Startup Idea Validator** | Analyzes startup ideas with market potential, competition, risks, and viability scoring | Business | OpenAI |
| 11 | **ELI5 Explainer** | Explains complex topics in plain language at your chosen difficulty level | Education | OpenAI |
| 12 | **API Doc Generator** | Paste code and get clean, professional API documentation with examples | Engineering | Anthropic |
| 13 | **Email Reply Writer** | Paste any email you received and describe how you want to respond. Get a polished reply in seconds.| Productivity| Any |
| 14 | **Bug Report Generator** |Describe a bug in plain English and get a complete, structured bug report ready to paste into GitHub Issues or Jira.|Engineering| Any |
| 15 | **Performance Review Writer** | Turn bullet notes about an employee into a structured, fair, and specific performance review.| HR| Any |
| 16 | **Cover Letter Writer** | Paste a job description and your background. Get a tailored cover letter that doesn't sound like every other cover letter.| HR| Any |
| 17 | **Incident Post-Mortem Writer** | Turn rough incident notes into a blameless post-mortem with timeline, root cause analysis, and action items.| Engineering| Any |
| 18 | **Changelog Generator** | Paste your git commits or PR titles and get a clean, user-facing changelog in Keep a Changelog format.| Engineering| Any |
| 19 | **Unit Test Generator** | Paste any function or module and get complete unit tests with edge cases, happy paths, and failure scenarios.| Engineering| Any |
| 20 | **Flashcard Generator** | Paste any study material, notes, or topic and get ready-to-use flashcards in Q&A format. Export for Anki or Quizlet.| Engineering| Any |
| 21 | **Invoice Description Generator** | Turn rough notes about work you did into polished invoice line items and a professional project summary.| Engineering| Any|
| 22 | **Grant Proposal Writer** |Describe your project or research and get a structured grant proposal with problem statement, objectives, methodology, and impact.| Education| Any|
| 23 | **Social Media Thread Writer** |Turn any topic or idea into a compelling X/Twitter thread with hooks, engagement tactics, and a strong call to action.| Marketing| Any|
| 24 | **Privacy Policy Generator** |Describe your app or website and get a comprehensive privacy policy draft covering data collection, usage, storage, and user rights.|Legal| Any|



> **Want to add your own?** See the [Contributing](#contributing) section below — it takes ~5 minutes.

---

## Supported Providers

| Provider | Models | How to Get a Key |
|----------|--------|-----------------|
| **OpenAI** | GPT-4o, GPT-4o-mini | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **Anthropic** | Claude Opus, Claude Sonnet | [console.anthropic.com](https://console.anthropic.com/) |
| **Google Gemini** | Gemini 2.5 Flash | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |

All agents support **provider switching** at runtime — pick any supported provider from the dropdown.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm or yarn

### Run Locally

```bash
# Clone the repository
git clone https://github.com/AditthyaSS/iloveAgents.git
cd iloveAgents

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

> **No `.env` file needed** — API keys are entered by users at runtime and never stored on any server.

### Deploy Your Own

1. Fork this repository
2. Import to [Vercel](https://vercel.com/new) (or any static host)
3. Deploy — zero configuration needed

The included `vercel.json` handles SPA routing automatically.

---

## Architecture

```
src/
├── agents/
│   └── registry.js          # All agent configs live here (single source of truth)
├── components/
│   ├── AgentRunner.jsx       # Generic agent execution UI
│   ├── AgentCard.jsx         # Agent card for the homepage grid
│   ├── ApiKeyBar.jsx         # Provider & API key input bar
│   ├── OutputRenderer.jsx    # Renders markdown/text/JSON output
│   ├── ScorecardOutput.jsx   # Visual scorecard for JSON output
│   ├── Navbar.jsx            # Top navigation bar
│   ├── Sidebar.jsx           # Agent sidebar navigation
│   └── ...
├── lib/
│   ├── llmAdapter.js         # Unified API adapter (OpenAI, Anthropic, Gemini)
│   └── useApiKey.js          # API key state management hook
├── pages/
│   ├── HomePage.jsx          # Landing page with agent grid
│   └── AgentPage.jsx         # Individual agent runner page
└── main.jsx                  # App entry point
```

### How It Works

1. **Registry** — Each agent is a config object in `registry.js` with inputs, a system prompt, and output type
2. **LLM Adapter** — A single `runAgent()` function in `llmAdapter.js` handles all three providers through a unified interface
3. **Agent Runner** — `AgentRunner.jsx` dynamically builds the input form from the config, constructs the prompt, and renders the response
4. **No backend** — All API calls go directly from the browser to the provider's API

---

## Contributing

We welcome contributions! The easiest and most impactful way to contribute is to **add a new agent**.

### Add an Agent in 3 Steps

**1. Edit `src/agents/registry.js`** — Append your agent config:

```js
{
  id: 'your-agent-id',
  name: 'Your Agent Name',
  description: 'One-line description.',
  category: 'Category',           // Productivity, Research, Marketing, Engineering, HR
  icon: 'IconName',               // Any icon from lucide.dev/icons
  provider: 'any',                // 'openai' | 'anthropic' | 'gemini' | 'any'
  defaultProvider: 'openai',      // Only if provider is 'any'
  model: 'gpt-4o',
  inputs: [
    {
      id: 'field_id',
      label: 'Field Label',
      type: 'textarea',           // text | textarea | code | select | multiselect
      placeholder: 'Hint text...',
      required: true,
    },
  ],
  systemPrompt: `Your system prompt here. Be specific about the output format.`,
  outputType: 'markdown',         // markdown | text | json
}
```

**2. Test it** — Run `npm run dev`, navigate to your agent, and test with a real API key.

**3. Open a PR** — Push and submit. That's it!

> See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines, input types, and output types.

### Other Ways to Contribute

- **Bug fixes** — Found something broken? Fix it!
- **UI/UX improvements** — Make the platform even more beautiful
- **Documentation** — Improve docs, add examples
- **Accessibility** — Help make agents usable for everyone
- **Tests** — Add test coverage

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| [React 18](https://react.dev) | Component framework |
| [Vite 6](https://vitejs.dev) | Build tool & dev server |
| [Tailwind CSS 3](https://tailwindcss.com) | Utility-first styling |
| [React Router 6](https://reactrouter.com) | Client-side routing |
| [Lucide React](https://lucide.dev) | Icon library |
| [react-markdown](https://github.com/remarkjs/react-markdown) | Markdown rendering |
| [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) | Code block highlighting |

---

## License

This project is licensed under the [MIT License](LICENSE) — use it, fork it, build on it.

---

<div align="center">

**Built by the open source community**

**Star this repo** if you find it useful!

[Live Demo](https://iloveagents.vercel.app) · [Report Bug](https://github.com/AditthyaSS/iloveAgents/issues) · [Request Agent](https://github.com/AditthyaSS/iloveAgents/issues/new) · [Contribute](CONTRIBUTING.md)

</div>
