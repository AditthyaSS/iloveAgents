
# Contributing to iloveAgents

## PR Title Convention

Use a conventional prefix so CI labels your PR correctly:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `chore:` Tooling or configuration
- `test:` Tests only

Example:
`fix: point accessibility audit at a live model`

## ⚠️ Before You Submit a PR

**You MUST run this locally before opening a PR:**

```bash
npm run build
```

If it fails, fix the errors before submitting. PRs with failing builds will be automatically closed.

**Common mistake to avoid:**

Never do this:

```js
import agents from '../agents/registry' // ❌ WRONG
```

Always do this instead:

```js
import { useAgents } from '../lib/useAgents' // ✅ CORRECT

const { agents } = useAgents()
```

---

Hey! Really glad you are here. 👋

iloveAgents is built by people like you — developers, designers, and curious minds who want to make AI tools more accessible to everyone.

Every contribution, big or small, makes this project better for thousands of people.

Let's build something great together!

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

It takes about 5 minutes, and you do not need to know much React at all.

### Step 1 — Fork and Clone the Repository

Fork the repository on GitHub first, then clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/iloveAgents.git
cd iloveAgents
npm install
npm run dev
```

### Step 2 — Create a Feature Branch

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

Keep the branch name short and clear so the maintainer knows what your PR is about.

### Step 3 — Create Your Agent File

Each agent now lives in its own file inside:

```text
src/agents/definitions/
```

Create a new file:

```text
src/agents/definitions/your-agent-name.js
```

The registry automatically picks up new agent definitions. There is no need to modify `registry.js`.

### Step 4 — Add Your Agent Configuration

Paste this template into your new file and fill in your details:

```js
const yourAgentName = {
  id: 'your-agent-id', // lowercase, kebab-case, URL safe
  name: 'Your Agent Name',
  description: 'One-line description of what this agent does.',
  category: 'Category',
  // Productivity | Research | Marketing | Engineering | HR |
  // Business | Education | Design | Product | Legal | Healthcare |
  // DevOps | Data Science | Cybersecurity | Gaming | Web3 |
  // Finance | Real Estate | Sales | Developer Tools

  icon: 'IconName', // Any icon from lucide.dev/icons

  provider: 'any', // openai | anthropic | gemini | any
  defaultProvider: 'openai', // Only needed when provider is 'any'

  model: 'gpt-4o',

  inputs: [
    {
      id: 'input_field',
      label: 'Field Label',
      type: 'textarea', // text | textarea | code | select | multiselect
      placeholder: 'Hint text for the user...',
      required: true,
    },
  ],

  systemPrompt: `Write your system prompt here.
    Be specific about the output format you want.`,

  outputType: 'markdown', // markdown | text | json
};

export default yourAgentName;
```

That's it! The registry automatically collects every file inside `src/agents/definitions/`.

Just add your file, and your agent will appear in the sidebar.

### Step 5 — Add Your Agent to AGENTS.md

Open `AGENTS.md` in the project root and add a new row to the table.

Follow the existing format:

```markdown
| # | Your Agent Name | One-line description of what it does. | Category |
```

Requirements:

- Use the next available number.
- Keep the description short (one sentence).
- Use an existing category from the table.

This keeps the agent directory in sync with the codebase and helps users discover your contribution.

### Step 6 — Test Your Agent

- Run the application.
- Find your agent in the sidebar.
- Test it with a real API key from at least one provider.
- Make sure the output looks correct.
- Check that the inputs make sense.

### Step 7 — Open a Pull Request

Push your branch and open a pull request.

Use the PR template that appears automatically. It contains a quick checklist to help you submit your contribution.

That's it! I will review it as fast as I can. 🚀

---

## Input Types

| Type | What It Renders |
|------|-----------------|
| `text` | Single-line text input |
| `textarea` | Multi-line text area |
| `code` | Monospace code editor |
| `select` | Dropdown with options |
| `multiselect` | Toggle button group |

## Output Types

| Type | What It Renders |
|------|-----------------|
| `markdown` | Rendered Markdown with syntax highlighting |
| `text` | Plain text with a copy button |
| `json` | Visual scorecard (requires a specific JSON structure) |

---

## A Few Simple Rules

- **One agent, one job.** A focused agent is a useful agent. If it does five things, it probably does none of them well.
- **Write a clear system prompt.** Tell the AI exactly what format to return. Vague prompts give vague output.
- **Test before you submit.** Run it with a real API key. If it doesn't work for you, it won't work for others.
- **No API keys in the code.** Ever. For any reason.
- **Use existing categories.** If your agent doesn't fit any existing category, propose a new one in the PR description.
- **Keep it clean.** Use React functional components, Tailwind CSS for styling, components in `src/components/`, and pages in `src/pages/`.

---

## Not Sure What to Work On?

Browse issues labeled [`good first issue`](https://github.com/AditthyaSS/iloveAgents/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) to find something beginner-friendly.

If you have an idea that is not listed in the issues, open a new issue and describe what you want to build.

I read every single one!

---

## A Note From the Maintainer

I built iloveAgents because I wanted a place where anyone could run powerful AI tools without giving up their privacy or setting up a complicated backend.

When you contribute here, you are helping make that real for everyone who uses this project.

I review every PR personally. I will give you honest feedback, and if something needs to be changed, I will tell you exactly what and why.

I am not here to gatekeep — I am here to help good ideas ship.

Thank you for spending your time on this. It genuinely means a lot. 🙏

— [@AditthyaSS](https://github.com/AditthyaSS)

---

*Read something confusing in this guide? Open an issue and tell me. I will fix it.*
