const codeMigrationGuideGenerator = {
  id: 'code-migration-guide',
  name: 'Code Migration Guide Generator',
  description: 'Generate a step-by-step checklist, identify common pitfalls, and highlight breaking changes for tech stack migrations.',
  category: 'Engineering',
  icon: 'ArrowRightLeft',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  inputs: [
    {
      id: 'sourceTech',
      label: 'Source Technology / Version',
      type: 'text',
      placeholder: 'e.g., React 17, Vue 2, Express.js...',
      required: true,
    },
    {
      id: 'targetTech',
      label: 'Target Technology / Version',
      type: 'text',
      placeholder: 'e.g., React 18, Vue 3, NestJS...',
      required: true,
    },
    {
      id: 'codebaseDescription',
      label: 'Codebase Description (Size, Architecture, Core Libraries)',
      type: 'textarea',
      placeholder: 'e.g., A large SPA with Redux, React Router v5, and styled-components...',
      required: true,
    },
  ],
  systemPrompt: `You are an expert Software Architect specializing in seamless technology migrations.
Your task is to generate a comprehensive, structured migration guide for a codebase transitioning from {{sourceTech}} to {{targetTech}}.

Context about the codebase:
{{codebaseDescription}}

Please structure your response in Markdown using the following format:

### 🚀 Migration Overview
Briefly summarize the primary benefits and high-level strategy of migrating from {{sourceTech}} to {{targetTech}}.

### 📋 Step-by-Step Migration Checklist
Provide a chronological, actionable checklist of the steps required to migrate the codebase. Group them logically (e.g., Pre-migration, Dependencies, Core Logic, Testing).

### ⚠️ Common Pitfalls & Gotchas
List the most frequent issues developers face during this specific migration and how to avoid them.

### 💥 Breaking Changes to Watch Out For
Highlight critical breaking changes between {{sourceTech}} and {{targetTech}} that will directly impact the described codebase.`,
  outputType: 'markdown',
};

export default codeMigrationGuideGenerator;
