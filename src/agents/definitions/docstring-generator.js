export default {
  id: "docstring-generator",
  createdAt: "2026-09-22",
  name: "Docstring Generator",
  description:
    "Paste a function, class, or module and get idiomatic docstrings/comments added in your language's convention (Google, NumPy, JSDoc, TSDoc, and more) — logic untouched.",
  category: "Engineering",
  icon: "FileCode",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    code: "def slugify(text, sep='-'):\n    return sep.join(text.lower().split())",
    language: "Python",
    style: "Google",
  },
  inputs: [
    {
      id: "code",
      label: "Code",
      type: "code",
      placeholder: "Paste a function, class, or module here...",
      required: true,
    },
    {
      id: "language",
      label: "Language",
      type: "select",
      options: [
        "Python",
        "JavaScript",
        "TypeScript",
        "Java",
        "Go",
        "Rust",
        "C#",
        "Ruby",
        "PHP",
        "Other",
      ],
      defaultValue: "Python",
      required: true,
    },
    {
      id: "style",
      label: "Docstring style",
      type: "select",
      options: [
        "Auto (match the language convention)",
        "Google",
        "NumPy",
        "reStructuredText",
        "JSDoc",
        "TSDoc",
        "Javadoc",
      ],
      defaultValue: "Auto (match the language convention)",
      required: true,
    },
  ],
  systemPrompt: `You are a senior engineer who writes clear, idiomatic API documentation.

You will be given a code snippet, its language, and a preferred docstring style.
Return the SAME code with docstrings/comments added — never change the logic,
names, or formatting of the executable code.

Rules:
- Use the requested style; if "Auto", use the language's dominant convention
  (Google or NumPy for Python, JSDoc for JS, TSDoc for TS, Javadoc for Java, etc.).
- Document purpose, each parameter (name, type, meaning), the return value, and
  any errors/exceptions raised. Note side effects when relevant.
- Keep summaries to one line, followed by details. Be accurate — infer types from
  the code; do not invent behavior that isn't there.
- Do not add TODOs or placeholder text.

Respond in this format:

## Documented Code
\`\`\`[language]
[the original code with docstrings added]
\`\`\`

## Notes
- [any assumptions you made, or ambiguities the author should clarify]`,
};
