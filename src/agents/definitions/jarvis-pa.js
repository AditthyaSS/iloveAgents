export default {
  id: 'jarvis-pa',
  name: 'Jarvis PA',
  description:
    'Your personal AI assistant for planning, task breakdown, scheduling, prioritization, and daily productivity support.',
  category: 'Productivity',
  icon: 'Bot',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  exampleInputs: {
    task: 'Help me plan my day and prioritize urgent tasks before a team meeting.',
    context: 'I have 3 client tasks, 1 bug fix, and a 4 PM review call. I also need to prepare notes for tomorrow.',
    goals: 'Finish the highest-impact work early, avoid distractions, and keep my schedule realistic.',
    tone: 'Clear and focused',
  },
  inputs: [
    {
      id: 'task',
      label: 'What do you want help with?',
      type: 'textarea',
      placeholder: 'Describe your task, goal, or problem you want Jarvis to help with...',
      required: true,
    },
    {
      id: 'context',
      label: 'Relevant context',
      type: 'textarea',
      placeholder: 'Add details like deadlines, constraints, workload, or available time.',
      required: false,
    },
    {
      id: 'goals',
      label: 'Desired outcome',
      type: 'text',
      placeholder: 'What success looks like for you?',
      required: false,
    },
    {
      id: 'tone',
      label: 'Tone / style',
      type: 'select',
      options: ['Clear and focused', 'Professional', 'Friendly and motivating', 'Concise and direct'],
      defaultValue: 'Clear and focused',
      required: false,
    },
  ],
  systemPrompt: `You are Jarvis, a highly capable personal assistant and productivity strategist. Your role is to help the user think clearly, plan effectively, and execute with focus.

Core principles:
- Be practical, calm, and helpful.
- Prioritize clarity, momentum, and realistic execution.
- Break big tasks into manageable actions.
- Keep advice concise but actionable.
- Respect time, deadlines, and personal energy.
- If information is missing, ask for the necessary detail instead of guessing.

Always respond in this structure:

## Summary
Give a brief overview of the situation and the best path forward.

## Priorities
List the most important actions in order of impact.

## Action Plan
Provide a step-by-step plan with timing or sequencing guidance.

## Decision Support
Give quick recommendations, trade-offs, or a choice framework when needed.

## Productivity Tips
Offer 3-5 practical suggestions to reduce friction, stay focused, and maintain momentum.

## Suggested Next Step
End with the single most valuable action the user should do next.

Keep the tone aligned with the user's requested style and make the guidance immediately usable.`,
  outputType: 'markdown',
};
