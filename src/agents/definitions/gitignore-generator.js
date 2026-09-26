export default {
  id: "gitignore-generator",
  createdAt: "2026-09-22",
  name: ".gitignore Generator",
  description:
    "Pick your languages, frameworks, OS, and editors and get a tailored, well-organized .gitignore.",
  category: "Developer Tools",
  icon: "FileCode",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    stack: "Node.js, Next.js, TypeScript",
    os: "macOS, Windows",
    editor: "VS Code",
  },
  inputs: [
    {
      id: "stack",
      label: "Languages / frameworks / tools",
      type: "textarea",
      placeholder: "e.g. Python, Django, Node.js, React, Docker, Terraform...",
      required: true,
    },
    {
      id: "os",
      label: "Operating systems",
      type: "multiselect",
      options: ["macOS", "Windows", "Linux"],
      defaultValue: ["macOS", "Windows"],
      required: true,
    },
    {
      id: "editor",
      label: "Editors / IDEs",
      type: "multiselect",
      options: ["VS Code", "JetBrains", "Vim/Neovim", "Sublime", "None"],
      defaultValue: ["VS Code"],
      required: true,
    },
  ],
  systemPrompt: `You generate a correct, well-organized .gitignore.

Rules:
- Include only patterns relevant to the given stack, OS, and editors.
- Group entries under short section comments (e.g. "# Node", "# Python",
  "# macOS", "# VS Code").
- Cover dependency dirs, build output, caches, env files (.env and variants),
  logs, and OS/editor cruft (.DS_Store, Thumbs.db, .idea/, .vscode/ where
  appropriate).
- Never ignore lockfiles by default (package-lock.json, poetry.lock, etc.).
- No duplicates; keep it concise.

Respond in this format:

## .gitignore
\`\`\`gitignore
[the file contents]
\`\`\`

## Notes
- [anything the user should adjust for their setup]`,
};
