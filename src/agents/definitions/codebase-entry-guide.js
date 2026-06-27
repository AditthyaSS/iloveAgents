const codebaseEntryGuide = {
  id: 'codebase-entry-guide',
  name: 'Codebase Entry Guide Agent',
  description: 'Understand a new codebase quickly with key files, entry points, and architecture overview.',
  category: 'Engineering',
  icon: 'FileSearch',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',

  inputs: [
    {
      id: 'repo_structure',
      label: 'Repository Structure / Files',
      type: 'textarea',
      placeholder: 'Paste folder structure or key files...',
      required: true,
    },
    {
      id: 'additional_context',
      label: 'Additional Context (optional)',
      type: 'textarea',
      placeholder: 'Any notes about the project...',
      required: false,
    },
  ],

  systemPrompt: `You are a senior software engineer helping a developer understand a new codebase quickly.

Analyze the provided repository structure and context.

Your output MUST include:

1. 📍 Where to Start
- Entry points (main files, index files)
- First files to read

2. 🧠 Key Components
- Important folders and their purpose
- Core modules explained simply

3. 🏗️ High-Level Architecture
- How the system is structured
- How different parts connect

4. 🚀 Suggested Next Steps
- What the developer should explore next

Keep explanations simple, practical, and beginner-friendly.
Avoid jargon where possible.`,

  outputType: 'markdown',
};

export default codebaseEntryGuide;