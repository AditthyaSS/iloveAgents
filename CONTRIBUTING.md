# Contributing to I Love Agents

Thanks for your interest in contributing! The easiest and most impactful way to contribute is by **adding a new agent**.

---

## Adding a New Agent

### Step 1: Open the registry

Edit `src/agents/registry.js`.

### Step 2: Add your agent config

Copy this template and fill in your agent details:

```js
{
  id: 'your-agent-id',           // URL-safe, lowercase, kebab-case
  name: 'Your Agent Name',
  description: 'One-line description of what the agent does.',
  category: 'Category',          // e.g. Productivity, Research, Marketing, Engineering, HR
  icon: 'IconName',              // Any Lucide icon name (see lucide.dev/icons)
  provider: 'any',               // 'openai' | 'anthropic' | 'gemini' | 'any'
  defaultProvider: 'openai',     // Only needed if provider is 'any'
  model: 'gpt-4o',               // Default model to use
  inputs: [
    {
      id: 'input_field',
      label: 'Field Label',
      type: 'text',              // 'text' | 'textarea' | 'code' | 'select' | 'multiselect'
      placeholder: 'Hint text...',
      required: true,
      // For select/multiselect:
      // options: ['Option A', 'Option B'],
      // defaultValue: 'Option A',
    },
  ],
  systemPrompt: `Your system prompt here. Be specific about the format
    you want the AI to respond in.`,
  outputType: 'markdown',        // 'markdown' | 'json' | 'text'
}
```

### Step 3: Test it

```bash
npm run dev
```

Navigate to your agent in the sidebar and test it with a real API key.

### Step 4: Open a PR

Push your branch and open a pull request. That's it!

---

## Input Types

| Type | Renders As |
|------|-----------|
| `text` | Single-line text input |
| `textarea` | Multi-line text area |
| `code` | Monospace code editor |
| `select` | Dropdown select |
| `multiselect` | Toggle button group |

## Output Types

| Type | Renders As |
|------|-----------|
| `markdown` | Rendered markdown with syntax highlighting |
| `text` | Plain text with copy button |
| `json` | Visual scorecard (expects specific JSON structure) |

---

## Guidelines

- **Keep system prompts clear and specific.** Tell the AI exactly what format to output.
- **Test with at least one provider** before submitting.
- **Don't add API keys** anywhere in the code.
- **Keep it focused.** One agent = one task done well.
- **Use existing categories** when possible, or propose a new one.

---

## Other Contributions

Beyond agents, we welcome:

- 🐛 Bug fixes
- 🎨 UI/UX improvements
- 📝 Documentation
- ♿ Accessibility improvements
- 🧪 Tests

---

## Code Style

- React functional components with hooks
- Tailwind CSS for styling
- Keep components in `src/components/`
- Keep pages in `src/pages/`

---

Thank you for contributing! 🎉
