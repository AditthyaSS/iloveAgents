# Contributing to iloveAgents

Hey! Really glad you are here. 👋

iloveAgents is built by people like you — developers, designers, and curious minds
who want to make AI tools more accessible to everyone.
Every contribution, big or small, makes this project better for thousands of people.

Let's build something great together.

---

## What Can You Contribute?

| Type | Difficulty |
|------|------------|
| 🤖 Add a new agent | Beginner |
| 🐛 Fix a bug | Beginner – Intermediate |
| 🎨 UI / UX improvement | Intermediate |
| ♿ Accessibility improvement | Intermediate |
| 📝 Improve documentation | Beginner |
| 🧪 Add tests | Intermediate |

---

## The Easiest Way to Contribute — Add a New Agent

Adding a new agent is the fastest way to make an impact.
It takes about 5 minutes and you do not need to know much React at all.

### Step 1 — Fork and clone the repo

```bash
# Fork the repo on GitHub first, then clone your fork
git clone https://github.com/YOUR_USERNAME/iloveAgents.git
cd iloveAgents
npm install
npm run dev
```

### Step 2 — Create a feature branch

Always create a new branch before making any changes.
Never work directly on `main`.

```bash
# For a new agent
git checkout -b agent/your-agent-name

# For a bug fix
git checkout -b fix/what-you-are-fixing

# For a UI change
git checkout -b ui/what-you-are-changing
```

Keep the branch name short and clear so I know what the PR is about before I even open it.

### Step 3 — Create your agent file

Each agent now lives in its own file inside `src/agents/definitions/`.
The registry picks it up automatically — no need to touch `registry.js` at all.

Create a new file:
src/agents/definitions/your-agent-name.js

### Step 4 — Add your agent config

Paste this template into your new file and fill in your details:

```js
const yourAgentName = {
  id: 'your-agent-id',           // lowercase, kebab-case, URL safe
  name: 'Your Agent Name',
  description: 'One line description of what this agent does.',
  category: 'Category',          // Productivity | Research | Marketing | Engineering | HR | Business | Education | Design | Product | Legal
  icon: 'IconName',              // Any icon from lucide.dev/icons
  provider: 'any',               // 'openai' | 'anthropic' | 'gemini' | 'any'
  defaultProvider: 'openai',     // Only needed if provider is 'any'
  model: 'gpt-4o',
  inputs: [
    {
      id: 'input_field',
      label: 'Field Label',
      type: 'textarea',          // text | textarea | code | select | multiselect
      placeholder: 'Hint text for the user...',
      required: true,
    },
  ],
  systemPrompt: `Write your system prompt here.
    Be specific about the output format you want.`,
  outputType: 'markdown',        // markdown | text | json
};

export default yourAgentName;
```

That is it. The registry automatically collects every file in `src/agents/definitions/` —
just drop your file in and your agent appears in the sidebar.

### Step 5 — Test it

Run the app and find your agent in the sidebar.
Test it with a real API key from at least one provider.
Make sure the output looks right and the inputs make sense.

### Step 6 — Open a PR

Push your branch and open a pull request.
Use the PR template that appears automatically — it is just a quick checklist.

That is it. I will review it as fast as I can. 🚀

---

## Input Types

| Type | What it renders |
|------|----------------|
| `text` | Single line text input |
| `textarea` | Multi line text area |
| `code` | Monospace code editor |
| `select` | Dropdown with options |
| `multiselect` | Toggle button group |

## Output Types

| Type | What it renders |
|------|----------------|
| `markdown` | Rendered markdown with syntax highlighting |
| `text` | Plain text with a copy button |
| `json` | Visual scorecard (needs a specific JSON structure) |

---

## A Few Simple Rules

- **One agent, one job.** A focused agent is a useful agent. If it does five things, it probably does none of them well.
- **Write a clear system prompt.** Tell the AI exactly what format to return. Vague prompts give vague output.
- **Test before you submit.** Run it with a real API key. If it doesn't work for you, it won't work for others.
- **No API keys in the code.** Ever. For any reason.
- **Use existing categories.** If your agent doesn't fit any, propose a new one in the PR description.
- **Keep it clean.** React functional components, Tailwind CSS for styling, components in `src/components/`, pages in `src/pages/`.

---

## Not Sure What to Work On?

Browse issues labeled [`good first issue`](https://github.com/AditthyaSS/iloveAgents/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) to find something beginner friendly.

If you have an idea that is not in the issues yet, open a new one and describe what you want to build. I read every single one.

---

## A Note From the Maintainer

I built iloveAgents because I wanted a place where anyone could run powerful AI tools
without giving up their privacy or setting up a complicated backend.

When you contribute here, you are helping make that real for everyone who uses this project.

I review every PR personally. I will give you honest feedback, and if something needs
to be changed I will tell you exactly what and why. I am not here to gatekeep —
I am here to help good ideas ship.

Thank you for spending your time on this. It genuinely means a lot. 🙏

— [@AditthyaSS](https://github.com/AditthyaSS)

---

*Read something confusing in this guide? Open an issue and tell me. I will fix it.*
