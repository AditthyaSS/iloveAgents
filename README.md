# I Love❤️ Agents

**AI Agents, ready to use.** Open source. Community-built. Bring your own key.

[![GSSoC 2026](https://img.shields.io/badge/GSSoC-2026-blue?style=flat-square)](https://gssoc.girlscript.tech/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)

---

## What is this?

I Love Agents is a clean, modern web platform where you can run AI agents directly in your browser using your own API keys. No backend, no data collection — your keys stay in your browser.

### Available Agents

| Agent | Description | Default Provider |
|-------|-------------|-----------------|
| 📄 PDF Summarizer | Structured summaries from PDF text | Anthropic |
| 🔍 Research Agent | Comprehensive research on any topic | OpenAI |
| ✉️ Cold Email Writer | Personalized B2B cold emails | OpenAI |
| 🔧 Code Reviewer | Senior-level code review with scoring | Anthropic |
| 👤 Resume Screener | Candidate evaluation with visual scorecard | OpenAI |

### Supported Providers

- **OpenAI** (GPT-4o, GPT-4o-mini)
- **Anthropic** (Claude Opus)
- **Google Gemini** (Gemini 2.0 Flash)

---

## Run Locally

```bash
# Clone the repo
git clone https://github.com/AditthyaSS/iloveAgents.git
cd iloveAgents

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> No `.env` file is needed — API keys are entered by users at runtime.

---

## Deploy

### Vercel (recommended)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com/new)
3. Deploy — it's a static site, zero config needed

The included `vercel.json` handles SPA routing.

---

## Contributing

We welcome contributions! The easiest way to contribute is to **add a new agent**.

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

**Quick version:** Add a config object to `src/agents/registry.js` and open a PR. The UI auto-generates from the config.

---

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- Lucide React (icons)
- react-markdown + react-syntax-highlighter
- Client-side only — no backend

---

## License

MIT

---

Built for **GSSoC 2026** 🚀
