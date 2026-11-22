
# Contributing to iloveAgents 🤝

Hey! Really glad you are here. 👋

iloveAgents is built by developers, designers, and curious minds
who want to make AI tools more accessible to everyone.

Every contribution, big or small, makes this project better.
Let's build something great together! 🚀

---

## PR Title Convention

Use a conventional prefix so CI can label your pull request correctly.

| Prefix | Purpose |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes only |
| `chore:` | Tooling or configuration changes |
| `test:` | Test-related changes only |

**Example:**

`fix: point accessibility audit at a live model`

---

## ⚠️ Before You Submit a PR

**You MUST run the following command locally before opening a PR:**

```bash
npm run build
```

If the build fails, fix the errors before submitting.
Pull requests with failing builds will be automatically closed.

### Common Mistake to Avoid

Never import the agents registry directly:

```js
// ❌ Incorrect
import agents from '../agents/registry';
```

Always use the `useAgents` hook:

```js
// ✅ Correct
import { useAgents } from '../lib/useAgents';

const { agents } = useAgents();
```

---

## What Can You Contribute?

| Contribution Type | Difficulty |
|---|---|
| 🤖 Add a new agent | Beginner |
| 🐛 Fix a bug | Beginner – Intermediate |
| 🎨 UI / UX improvement | Intermediate |
| ♿ Accessibility improvement | Intermediate |
| 📝 Improve documentation | Beginner |
| 🧪 Add tests | Intermediate |

---

## The Easiest Way to Contribute — Add a New Agent

Adding a new agent is one of the easiest ways to contribute.
It takes approximately 5 minutes, and you do not need extensive React knowledge.

### Step 1 — Fork and Clone the Repository

Fork the repository on GitHub, then clone your fork.

```bash
git clone https://github.com/YOUR_USERNAME/iloveAgents.git

cd iloveAgents

npm install

npm run dev
```

### Step 2 — Create a Feature Branch

Always create a new branch before making changes.
Never work directly on `main`.

**For a new agent:**

```bash
git checkout -b agent/your-agent-name
```

**For a bug fix:**

```bash
git checkout -b fix/what-you-are-fixing
```

**For a UI change:**

```bash
git checkout -b ui/what-you-are-changing
```

Keep branch names short, descriptive, and easy to understand.

### Step 3 — Create Your Agent File

Each agent lives in its own file inside:

`src/agents/definitions/`

Create a new file:

`src/agents/definitions/your-agent-name.js`

The registry automatically collects agent definition files.
You do not need to edit `registry.js`.

### Step 4 — Add Your Agent Configuration

Use the following template and replace the example values
with your agent's details.

```js
const yourAgentName = {
  id: 'your-agent-id',
  name: 'Your Agent Name',
  description: 'A one-line description of what this agent does.',

  category: 'Category',
  // Use an existing category from AGENTS.md.

  icon: 'IconName',
  // Use an icon from https://lucide.dev/icons

  provider: 'any',
  // Supported: openai | anthropic | gemini | any

  defaultProvider: 'openai',
  // Only needed when provider is 'any'.

  model: 'gpt-4o',

  inputs: [
    {
      id: 'input_field',
      label: 'Field Label',
      type: 'textarea',
      // Supported: text | textarea | code | select | multiselect
      placeholder: 'Hint text for the user...',
      required: true,
    },
  ],

  systemPrompt: `Write your system prompt here.
Be specific about the output format you want.`,

  outputType: 'markdown',
  // Supported: markdown | text | json
};

export default yourAgentName;
```

That's it! The registry automatically collects agent
definition files from `src/agents/definitions/`.

### Step 5 — Update AGENTS.md

Open `AGENTS.md` in the project root and add a new row
to the agent directory table.

Follow the existing format:

```text
| # | Your Agent Name | One-line description of what it does. | Category |
```

Remember:

- Use the next available number.
- Keep the description short and clear.
- Use an existing category from the table.

This keeps the agent directory synchronized with the codebase.

### Step 6 — Test Your Agent

Run the application and find your agent in the sidebar.

- Test it using a real API key from at least one supported provider.
- Check whether the inputs work correctly.
- Verify that the generated output is appropriate.
- Fix any errors before submitting your contribution.

### Step 7 — Open a Pull Request

Push your feature branch to GitHub and open a pull request.

Use the pull request template provided by the repository.
Complete the checklist and describe your changes clearly.

That's it! Your contribution is ready for review. 🚀

---

## Input Types

| Type | Description |
|---|---|
| `text` | Single-line text input |
| `textarea` | Multi-line text area |
| `code` | Monospace code editor |
| `select` | Dropdown with options |
| `multiselect` | Toggle button group |

## Output Types

| Type | Description |
|---|---|
| `markdown` | Rendered Markdown with syntax highlighting |
| `text` | Plain text with a copy button |
| `json` | Visual scorecard (requires a specific JSON structure) |

---

## A Few Simple Rules

1. **One agent, one job.** A focused agent is more useful than an agent that tries to do everything.
2. **Write a clear system prompt.** Specify exactly what output you expect from the AI.
3. **Test before submitting.** Run your agent with a real API key.
4. **Never include API keys in your code.** Keep credentials private.
5. **Use existing categories.** If your agent does not fit any existing category, propose a new one in your PR description.
6. **Keep the code clean.** Follow the project's existing React, Tailwind CSS, and component organization conventions.

---

## Not Sure What to Work On?

Browse issues labeled
[good first issue](https://github.com/AditthyaSS/iloveAgents/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
to find beginner-friendly tasks.

Have a new idea?

Open a GitHub issue and describe what you would like to build.

---

## A Note From the Maintainer

I built iloveAgents because I wanted a place where anyone
could run powerful AI tools without giving up their privacy
or setting up a complicated backend.

When you contribute here, you help make that vision
a reality for everyone who uses this project.

Thank you for being part of the community! ❤️


