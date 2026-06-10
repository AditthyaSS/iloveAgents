const gameDesignDocumentGenerator = {
  id: 'game-design-document-generator',
  name: 'Game Design Document Generator',
  description: 'Generates a comprehensive Game Design Document (GDD) based on your game concept.',
  category: 'Design',
  icon: 'Gamepad2',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  inputs: [
    {
      id: 'title',
      label: 'Game Title',
      type: 'text',
      placeholder: 'e.g., Space Explorers',
      required: true,
    },
    {
      id: 'genre',
      label: 'Genre',
      type: 'text',
      placeholder: 'e.g., Action RPG, Metroidvania',
      required: true,
    },
    {
      id: 'coreGameplay',
      label: 'Core Gameplay Loop',
      type: 'textarea',
      placeholder: 'Describe the main mechanics and what the player does...',
      required: true,
    },
    {
      id: 'targetPlatform',
      label: 'Target Platform',
      type: 'text',
      placeholder: 'e.g., iOS, Android, PC, Console, Web',
      required: true,
    },
    {
      id: 'targetAudience',
      label: 'Target Audience',
      type: 'text',
      placeholder: 'e.g., Casual gamers, Hardcore strategy fans',
      required: false,
    },
  ],
  systemPrompt: `You are an expert Game Designer.
Your task is to generate a professional and comprehensive Game Design Document (GDD) based on the user-provided details.
Read the following fields from the user message and use them to tailor the GDD:
- Game Title
- Genre
- Core Gameplay Loop
- Target Platform
- Target Audience (if provided)

The GDD should include the following sections:
1. Game Overview (Title, Genre, Target Audience, High-Level Concept)
2. Core Gameplay Mechanics
3. Level Design Guidelines (covering level progression, difficulty curves, pacing, and environmental design)
4. Art and Audio Direction
5. Story and World Building
6. Technical Specifications (Target platforms, Engine suggestions)
7. Monetization Strategy (if applicable)

Please output the response in well-structured Markdown format.`,
  outputType: 'markdown',
};

export default gameDesignDocumentGenerator;
