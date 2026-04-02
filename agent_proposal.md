# Agent Proposal

> **Want to add a new agent to ilove❤️agents?**
> Use this template to propose your idea. Open a [GitHub Issue](https://github.com/AditthyaSS/iloveAgents/issues/new) with the title `[Agent Proposal] Your Agent Name` and fill in the sections below.

---

## How It Works

1. **You propose** — Copy this template into a new GitHub Issue and fill it out.
2. **We review** — Maintainers will evaluate your proposal for feasibility, uniqueness, and usefulness.
3. **We assign** — Once approved, the issue will be assigned to you (or another contributor) for implementation.
4. **You build** — Implement the agent by adding a config object to `src/agents/registry.js` (see [CONTRIBUTING.md](CONTRIBUTING.md)).
5. **You PR** — Open a pull request, and we'll review and merge!

---

## Proposal Template

Copy everything below this line into your GitHub Issue:

---

### Agent Name

*(Give your agent a clear, concise name — e.g. "Blog Post Generator", "SQL Query Builder")*

### Description

*(One or two sentences explaining what this agent does)*

### Category

*(Pick one: `Productivity` · `Research` · `Marketing` · `Engineering` · `HR` — or suggest a new one)*

### Problem It Solves

*(What pain point does this agent address? Who would use it and why?)*

### Example Usage

**Sample input:**
> *(What would a user type or paste into this agent?)*

**Expected output:**
> *(What kind of response should the agent produce? Give a brief example.)*

### Suggested Provider & Model

| Field | Value |
|-------|-------|
| Provider | *(openai / anthropic / gemini / any)* |
| Model | *(e.g. gpt-4o, claude-opus-4-20250514, gemini-2.0-flash)* |

### Input Fields

*(List the inputs your agent would need. You don't need to write code — just describe them.)*

| Label | Type | Required? | Notes |
|-------|------|-----------|-------|
| *(e.g. "Topic")* | *(text / textarea / code / select / multiselect)* | *(Yes / No)* | *(Any options, placeholder text, or defaults)* |
| | | | |
| | | | |

### Output Format

- [ ] Markdown (formatted text with headings, bullets, code blocks)
- [ ] Plain text (simple text output)
- [ ] JSON scorecard (structured scoring — describe the expected fields below)

### Anything Else?

*(Optional: edge cases, limitations, similar tools for inspiration, links, references, etc.)*

---

## Before You Submit

- [ ] I've checked the [existing agents](src/agents/registry.js) and this doesn't duplicate any of them.
- [ ] My proposal clearly explains what the agent does and why it's useful.
- [ ] I have not included any API keys or secrets.

---

> 💡 **Tip:** The more detailed your proposal, the faster we can review and approve it!
>
> 📖 Once assigned, follow the [CONTRIBUTING.md](CONTRIBUTING.md) guide to implement your agent.
