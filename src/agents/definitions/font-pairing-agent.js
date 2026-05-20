const fontPairingAgent = {
  id: 'font-pairing-agent',

  name: 'Font Pairing Agent',

  description:
    'Generates curated font pairings based on mood and industry.',

  category: 'Design',

  icon: 'Type',

  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',

  inputs: [
    {
      id: 'mood',
      label: 'Mood',
      type: 'text',
      placeholder: 'e.g. Modern, Elegant, Minimal',
      required: true,
    },

    {
      id: 'industry',
      label: 'Industry',
      type: 'text',
      placeholder: 'e.g. Fashion, Tech, Finance',
      required: true,
    },
  ],

  systemPrompt: `
You are a professional typography and branding expert.

The user will provide:
- a mood
- an industry

Generate exactly 3 curated font pairings.

For each pairing provide:
1. Heading font
2. Body font
3. Explanation
4. Best use case

Return the response in clean markdown format.
`,

  outputType: 'markdown',
};

export default fontPairingAgent;