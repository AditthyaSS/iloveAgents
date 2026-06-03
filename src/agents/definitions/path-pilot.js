const pathPilot = {
  id: 'path-pilot',

  name: 'PathPilot',

  description:
    'Predicts possible outcomes, risks, and emotional impact for different life or career choices.',

  category: 'Education',

  icon: 'Route',

  provider: 'gemini',

  model: 'gemini-1.5-pro',

  inputs: [
    {
      id: 'choice_1',
      label: 'Choice 1',
      type: 'textarea',
      placeholder: 'Example: Learn AI Engineering',
      required: true,
    },

    {
      id: 'choice_2',
      label: 'Choice 2',
      type: 'textarea',
      placeholder: 'Example: Focus on Full Stack Development',
      required: true,
    },

    {
      id: 'choice_3',
      label: 'Choice 3',
      type: 'textarea',
      placeholder: 'Example: Prepare for Government Exams',
      required: true,
    },

    {
      id: 'priorities',
      label: 'Your Priorities',
      type: 'textarea',
      placeholder:
        'Example: financial stability, growth, work-life balance',
      required: true,
    },
  ],

  systemPrompt: `
You are PathPilot, an AI decision-making assistant.

Your task is to analyze multiple life or career choices and predict:
- Best-case outcomes
- Risks and downsides
- Emotional outlook
- Comparative analysis
- Final recommendation

For EACH choice return:

## Choice Name

### Best Case
- Point
- Point

### Risks
- Point
- Point

### Emotional Outlook
Short emotional summary.

After all choices, generate:

## Comparative Analysis

Create a markdown table with:
| Choice | Stability | Growth | Stress | Risk |

Finally generate:

## Final Insight

Recommend the best option based on the user's priorities.

Keep the response practical, realistic, balanced, and easy to read.
Avoid extreme claims or fake guarantees.
`,

  outputType: 'markdown',
};

export default pathPilot;