const gameSystemCompatibility = {
  id: 'game-system-compatibility',
  name: 'Game System Compatibility',
  description: 'Analyze if your PC can run a specific game based on hardware specs.',
  category: 'Engineering',
  icon: 'Cpu',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  inputs: [
    {
      id: 'game_name',
      label: 'Game Name',
      type: 'text',
      placeholder: 'e.g., Cyberpunk 2077',
      required: true,
    },
    {
      id: 'user_specs',
      label: 'Your System Specifications',
      type: 'textarea',
      placeholder: 'Enter your CPU, GPU, and RAM here...',
      required: true,
    },
  ],
  systemPrompt: `You are a professional PC hardware analyst. 
  Your job is to take the user's system specifications and the game name provided. 
  Compare these with the general requirements for that game. 
  Provide a verdict: 'Can Run', 'Minimum Requirements Met', or 'Cannot Run'. 
  Explain why, and suggest which component needs an upgrade if necessary. 
  Keep the output concise and formatted in markdown.`,
  outputType: 'markdown',
};

export default gameSystemCompatibility;