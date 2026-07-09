<div align="center">

# I Love ❤️ Agents

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
## Table of Contents

- [What is iloveAgents?](#what-is-iloveagents)
- [Why iloveAgents?](#why-iloveagents)
- [Available Agents](#available-agents)
- [Supported Providers](#supported-providers)
- [Battle Mode](#battle-mode)
- [AI Workflow Builder (New)](#-ai-workflow-builder-new)
  <!-- Fix: Corrected broken anchor link - replaced space with hyphen in 'what-you-can-do' -->
- [What you can do](#what-you-can-do)
  - [How sequential execution works](#how-sequential-execution-works)
  - [Navigation](#navigation)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Run Locally](#run-locally)
  - [Deploy Your Own](#deploy-your-own)
- [How It Works](#how-it-works)
- [Contributing](#contributing)
  - [Add a New Agent in 3 Steps](#add-a-new-agent-in-3-steps)
  - [Other Ways to Help](#other-ways-to-help)
- [Tech Stack](#tech-stack)
- [Community](#community)
- [License](#license)

---

## What is iloveAgents?

iloveAgents is a clean, open source web platform where you can run AI agents directly in your browser.

No sign-up. No backend. No data collection. Just paste your API key and go.

Each agent is a focused tool that does one thing really well — summarize meeting notes, review code, generate SQL, write cold emails, and a lot more. The whole platform is config-driven, which means adding a new agent is as simple as adding one JavaScript object to a single file. No deep React knowledge needed.

---

## Why iloveAgents?

- **Your API key never leaves your browser.** It goes directly to OpenAI, Anthropic, or Google. No middleman, no storage, no tracking.
- **Zero setup.** No `.env` files, no backend, no database. Clone and run in under a minute.
- **Works with all major providers.** OpenAI, Anthropic, Google Gemini, and Groq — switch between them at runtime.
- **Built for contributors.** Adding a new agent takes about 5 minutes and you don't need to know much React at all.

---

## Available Agents

The complete list of agents has been moved to [AGENTS.md](./AGENTS.md) for better organization and scalability.

---

## Supported Providers

| Provider | Logo | Models | Get Your Key |
|----------|------|--------|--------------|
| OpenAI | <img src="https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg" width="80"/> | GPT-4o, GPT-4o-mini | [platform.openai.com](https://platform.openai.com/api-keys) |
| Anthropic | <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Anthropic_logo.svg" width="80"/> | Claude Opus, Claude Sonnet | [console.anthropic.com](https://console.anthropic.com/) |
| Google Gemini | <img src="https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg" width="80"/> | Gemini 2.5 Flash | [aistudio.google.com](https://aistudio.google.com/apikey) |
| Groq | <img src="https://console.groq.com/groq-logo.svg" alt="Groq logo" width="80"/> | Llama 3.3 70B, Llama 3.1 8B, GPT-OSS 120B/20B | [console.groq.com](https://console.groq.com/keys) |

You can switch providers on any agent at runtime from the dropdown. No restart needed.

---

## Battle Mode

Pit three AI providers against each other head-to-head.

1. **Pick any agent** from the full registry
2. **Enter your input once** — same prompt goes to all three
3. **GPT-4o vs Claude Sonnet vs Gemini Flash vs Llama 3.3 70B** generate outputs simultaneously
4. **You pick the winner**

Battle Mode has its own dark, dramatic UI with color-coded provider columns (gold for OpenAI, purple for Anthropic, blue for Gemini, and red for Groq). Each provider loads independently — if one fails, the other two still work. Access it from the "Enter Battle Mode" button on the homepage or navigate directly to `/battle`.

---

## 🔗 AI Workflow Builder  *(New)*

> **Chain multiple agents together and automate your entire process in one run.**

Workflows let you connect agents in sequence — the output of each agent automatically becomes the input for the next. Build once, run with any input.

### What you can do

- **Build a workflow** — pick up to 5 agents, arrange them in order, give the workflow a title
- **Run it in one click** — paste your input once, every step runs automatically in sequence
- **Watch it execute** — each step shows its own live status: waiting → running → done / failed
- **Chain any agents** — research → summarize → write LinkedIn post → done
- **Community library** — browse and run workflows shared by other users
- **Real-time counters** — usage counts update live as others run the same workflows
- **Share workflows** — one-click URL copy on any workflow detail page

### How sequential execution works

```
Your Input
    │
    ▼
┌─────────────┐
│  Agent  1   │  e.g. Research Agent
└──────┬──────┘
       │ output
    ▼
┌─────────────┐
│  Agent  2   │  e.g. PDF Summarizer
└──────┬──────┘
       │ output
    ▼
┌─────────────┐
│  Agent  3   │  e.g. LinkedIn Post Writer
└─────────────┘
       │
    Final Output
```

If any step fails, the workflow stops at that step and shows you exactly what went wrong — with a Retry button. On success, you can copy all outputs at once.

### Navigation

| Route | What it does |
|---|---|
| `/workflows` | Browse community workflow library |
| `/workflows/build` | Create and save a new workflow |
| `/workflows/:id` | View full details of a workflow |
| `/workflows/:id/run` | Run a workflow step-by-step |

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn

### Run Locally

```bash
# Clone the repository
git clone https://github.com/AditthyaSS/iloveAgents.git
cd iloveAgents

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
No API provider keys are required in a `.env` file because 
they are entered at runtime and never stored anywhere.

However, local development requires a `.env.local` file 
for Supabase features like Workflows.

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Note: AI provider API keys are still entered at runtime 
and are never stored anywhere.


### Deploy Your Own

1. Fork this repository
2. Import to [Vercel](https://vercel.com/new) or any static host
3. Deploy — zero configuration needed

The included `vercel.json` handles SPA routing automatically.

---

## How It Works

```
src/
├── agents/
│   ├── definitions/          # Each agent in its own file (auto-collected)
│   │   ├── pdf-summarizer.js
│   │   ├── code-reviewer.js
│   │   └── ... more agent definitions
│   ├── categories.js         # CATEGORIES constant
│   └── registry.js           # Auto-collects all definitions via import.meta.glob
├── components/
│   ├── AgentRunner.jsx       # Generic agent execution UI
│   ├── AgentCard.jsx         # Agent card for the homepage grid
│   ├── ApiKeyBar.jsx         # Provider and API key input
│   ├── OutputRenderer.jsx    # Renders markdown/text/JSON output
│   ├── ScorecardOutput.jsx   # Visual scorecard for JSON output
│   ├── BattleNavbar.jsx      # Battle Mode navigation bar
│   ├── Navbar.jsx            # Top navigation
│   ├── Sidebar.jsx           # Agent sidebar
│   └── ...
├── hooks/
│   └── useWorkflows.js       # Workflow data operations (fetch, save, realtime)
├── lib/
│   ├── llmAdapter.js         # Unified API adapter for all providers
│   ├── supabase.js           # Realtime data client
│   └── useApiKey.js          # API key state management
├── pages/
│   ├── HomePage.jsx          # Landing page with agent grid
│   ├── AgentPage.jsx         # Individual agent page
│   ├── WorkflowLibrary.jsx   # 🆕 Public workflow library with live counters
│   ├── WorkflowBuilder.jsx   # 🆕 Drag-and-drop agent chain builder
│   ├── WorkflowDetail.jsx    # 🆕 Single workflow view with realtime stats
│   ├── WorkflowRunner.jsx    # 🆕 Sequential agent execution engine
│   ├── BattleModeLanding.jsx # Battle Mode entry page
│   ├── BattleModeSetup.jsx   # Battle configuration
│   ├── BattleModeArena.jsx   # Three-column battle arena
│   └── BattleModeWinner.jsx  # Winner announcement
└── main.jsx
```

1. **Registry** — Each agent is its own file in `src/agents/definitions/`. The registry auto-collects them via `import.meta.glob` — just drop a file in and it appears.
2. **LLM Adapter** — A single `runAgent()` function in `llmAdapter.js` handles all three providers through one unified interface.
3. **Agent Runner** — `AgentRunner.jsx` builds the input form from the config, constructs the prompt, and renders the response.
4. **Battle Mode** — `BattleModeArena.jsx` fires the same prompt to GPT-4o, Claude Sonnet, Gemini Flash and Llama 3.3 70B simultaneously and lets you pick the winner.
5. **Workflow Builder** — `WorkflowRunner.jsx` chains agents sequentially using the same `runAgent()` adapter — output of step N becomes input of step N+1, with per-step status cards and real-time usage counters.
6. **No backend** — Every API call goes directly from your browser to the provider. Nothing passes through our servers because there are no servers.

---

## Contributing

iloveAgents is built by the community. Every contribution matters — whether it is a new agent, a bug fix, a UI improvement, or just fixing a typo.

### Add a New Agent in 3 Steps

**1.** Create a new file in `src/agents/definitions/` named `your-agent-id.js`:

```js
export default {
  id: 'your-agent-id',
  name: 'Your Agent Name',
  description: 'One-line description.',
  category: 'Category',
  icon: 'IconName',               // from lucide.dev/icons
  provider: 'any',                // 'openai' | 'anthropic' | 'gemini' | 'groq' | 'any'
  defaultProvider: 'openai',
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
  systemPrompt: `Your system prompt here.`,
  outputType: 'markdown',         // markdown | text | json
}
```

The registry auto-collects it — no need to edit `registry.js`.

**2.** Run `npm run dev` and test your agent with a real API key.

**3.** Open a PR. That is it!

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

### Other Ways to Help

- 🐛 Fix a bug
- 🎨 Improve the UI or UX
- ♿ Improve accessibility
- 📝 Improve the docs
- 🧪 Add tests

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| [React 18](https://react.dev) | Component framework |
| [Vite 6](https://vitejs.dev) | Build tool and dev server |
| [Tailwind CSS 3](https://tailwindcss.com) | Styling |
| [React Router 6](https://reactrouter.com) | Client-side routing |
| [Lucide React](https://lucide.dev) | Icons |
| [react-markdown](https://github.com/remarkjs/react-markdown) | Markdown rendering |
| [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) | Code highlighting |

---

## Community

- [Support](./SUPPORT.md) — stuck on something? Drop a comment on your issue and I will reply within 24 hours
- [Hall of Fame](./HALL_OF_FAME.md) — every person who has contributed to iloveAgents
- [Maintainers](./MAINTAINERS.md) — who runs this project

---

## 👥 Contributors

Thanks to all contributors ❤️

[![Contributors](https://contrib.rocks/image?repo=aditthyass/iloveagents)](https://github.com/aditthyass/iloveagents/graphs/contributors)

---

## License

Licensed under the [MIT License](LICENSE) — use it, fork it, build on it.

---

<div align="center">

Built with ❤️ by [@AditthyaSS](https://github.com/AditthyaSS) and the open source community

⭐ Star this repo if you find it useful — it helps others discover it!

[Live Demo](https://iloveagents.vercel.app) · [Report a Bug](https://github.com/AditthyaSS/iloveAgents/issues) · [Request an Agent](https://github.com/AditthyaSS/iloveAgents/issues/new) · [Contribute](CONTRIBUTING.md)

</div>
