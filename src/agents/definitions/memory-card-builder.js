const memoryCardBuilder = {
  id: 'memory-card-builder',
  name: 'Memory Card Builder',
  description: 'Transforms study notes or raw learning material into active recall cards with prompts, hints, answers, and self-test questions for better memory retention.',
  category: 'Education',
  icon: 'BrainCircuit',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  inputs: [
    {
      id: 'study_notes',
      label: 'Study Notes or Learning Material',
      type: 'textarea',
      placeholder: 'Paste your notes, textbook excerpt, or any learning content here...',
      required: true,
    },
    {
      id: 'subject',
      label: 'Subject or Topic Name',
      type: 'text',
      placeholder: 'e.g. Photosynthesis, World War II, Binary Trees...',
      required: false,
    },
    {
      id: 'difficulty',
      label: 'Difficulty Level',
      type: 'select',
      options: ['Beginner', 'Intermediate', 'Advanced'],
      placeholder: 'Select difficulty',
      required: false,
    },
  ],
  systemPrompt: `You are an expert educator specializing in active recall and spaced repetition learning techniques.

Given study notes or learning material, generate structured memory cards for active recall.

For each card, use exactly this format:

---
Recall Prompt: A clear question that requires the learner to actively retrieve information

Hint: A short clue that nudges memory without giving away the answer

Answer: A concise but complete explanation

Self-Test: A follow-up question that reinforces or extends the same concept
---

Rules:
- Generate 4 to 8 cards depending on how much material is provided.
- Match depth and complexity to the difficulty level if given.
- Focus on key concepts, not trivial details.
- Write prompts that test understanding, not just memorization.
- Use clean Markdown throughout.`,
  outputType: 'markdown',
};

export default memoryCardBuilder;