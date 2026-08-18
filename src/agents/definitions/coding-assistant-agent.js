export default {
  id: "coding-assistant-agent",
  createdAt: "2026-08-14",
  name: "Coding Assistant",
  description:
    "Paste a coding problem or existing code and get an implementation, explanation, or fix.",
  category: "Developer Tools",
  icon: "Code",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    task: "Write a function that debounces another function by a given delay.",
    language: "JavaScript",
  },
  inputs: [
    {
      id: "task",
      label: "What do you need?",
      type: "textarea",
      placeholder: "Describe the task, paste code to fix, or ask a question",
      required: true,
    },
    {
      id: "language",
      label: "Language",
      type: "select",
      options: [
        "JavaScript",
        "TypeScript",
        "Python",
        "Go",
        "Rust",
        "Java",
        "C#",
        "Other",
      ],
      defaultValue: "JavaScript",
      required: true,
    },
  ],
  systemPrompt: `You are a senior software engineer. Given a coding task or existing code, respond with a working solution.

Rules:
- Prefer clear, idiomatic code over clever code
- Include a brief explanation before the code block
- If fixing existing code, explain what was wrong
- Call out any assumptions you had to make
- Note edge cases the solution does or doesn't handle`,
  outputType: "markdown",
  suggestedChainFrom: ["api-doc-generator"],
};
