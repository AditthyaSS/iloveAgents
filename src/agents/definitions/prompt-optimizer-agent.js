const promptOptimizerAgent = {
  id: 'prompt-optimizer-agent',
  createdAt: "2026-05-27",
  name: 'Prompt Optimizer',
  description: 'Improves and restructures prompts for better LLM responses.',
  category: 'Productivity',
  icon: 'Wand',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  inputs: [
    {
      id: 'original_prompt',
      label: 'Original Prompt',
      type: 'textarea',
      placeholder: 'Paste the prompt you want to improve...',
      required: true,
    },
    {
      id: 'task_type',
      label: 'Task Type',
      type: 'select',
      options: ['Coding', 'Research', 'Creative Writing', 'Marketing', 'RAG', 'AI Agent Workflow', 'Resume / LinkedIn', 'UI / UX', 'General'],
      required: true,
    },
    {
      id: 'optimization_style',
      label: 'Optimization Style',
      type: 'select',
      options: ['Concise', 'Detailed', 'Beginner-Friendly', 'Expert-Level', 'Structured', 'Chain-of-Thought Optimized', 'Creative'],
      required: true,
    },
    {
      id: 'target_model',
      label: 'Target AI Model (optional)',
      type: 'select',
      options:['Generic LLM', 'ChatGPT', 'Claude', 'Gemini', 'DeepSeek'],
      required: false,
    },
    {
      id: 'extra_context',
      label: 'Extra Context (optional)',
      type: 'textarea',
      placeholder: 'Any additional details or constraints...',
      required: false,
    },
  ],
  systemPrompt: `You are a prompt engineering expert. Improve the user's raw prompt based on the task type, optimization style, target model, and extra context provided.

Return your response in this exact markdown format:

## Optimized Prompt
\`\`\`
<the improved prompt here>
\`\`\`

## Improvements Made
- <specific improvement 1>
- <specific improvement 2>

## Prompt Quality Score
<original score>/100 → <improved score>/100

## Missing Context Suggestions
- <thing user could add 1>
- <thing user could add 2>

## Alternative Versions

### Concise Version
\`\`\`
<1-2 sentence version>
\`\`\`

### Expert Version
\`\`\`
<production-grade, technical version>
\`\`\`

Be specific. No filler. Scores must reflect real improvement.`,
  outputType: 'markdown',
};

export default promptOptimizerAgent;
