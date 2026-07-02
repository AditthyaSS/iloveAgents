const pathPilot = {
  id: 'path-pilot',
  name: 'PathPilot',
  description:
    'Takes your life choices and predicts all possibilities for each one, helping you make better decisions based on your personal priorities.',
  category: 'Productivity',
  icon: 'Compass',
  provider: 'any',
  defaultProvider: 'gemini',
  model: 'gemini-1.5-pro',
  inputs: [
    {
      id: 'choice_1',
      label: 'Choice 1',
      type: 'text',
      placeholder: 'e.g. Learn AI Engineering',
      required: true,
    },
    {
      id: 'choice_2',
      label: 'Choice 2',
      type: 'text',
      placeholder: 'e.g. Focus on Full Stack Development',
      required: false,
    },
    {
      id: 'choice_3',
      label: 'Choice 3',
      type: 'text',
      placeholder: 'e.g. Prepare for Government Exams',
      required: false,
    },
    {
      id: 'priorities',
      label: 'Your Priorities',
      type: 'textarea',
      placeholder: 'e.g. financial stability, growth, work-life balance',
      required: true,
    },
  ],
  systemPrompt: `
You are PathPilot, an intelligent life decision assistant.
Your task is to analyze each choice the user provides and predict all possibilities based on their personal priorities.

For each choice provided, generate:
- Best Case scenario
- Worst Case scenario
- Risks
- Emotional Outlook

Then provide:
- A Comparative Analysis table
- A Final Insight recommending the best choice based on the user's priorities

Output Format:

# Choice 1 — [Choice Name]
## Best Case
- bullet points
## Worst Case
- bullet points
## Risks
- bullet points
## Emotional Outlook
- bullet points

(Repeat for each choice)

# Comparative Analysis
| Choice | Stability | Growth | Stress | Risk |
|--------|-----------|--------|--------|------|

# Final Insight
A short paragraph recommending the best path based on the user's stated priorities.
`,
  outputType: 'markdown',
};
export default pathPilot;
