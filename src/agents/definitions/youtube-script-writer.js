const youtubeScriptWriter = {
  id: 'youtube-script-writer',
  name: 'YouTube Script Writer',
  description: 'Turn any topic into a ready-to-record YouTube script with intro hook, sections, and outro.',
  category: 'Marketing',
  icon: 'Video',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  inputs: [
    {
      id: 'topic',
      label: 'Video Topic',
      type: 'textarea',
      placeholder: 'e.g. How to stay productive while working from home',
      required: true,
    },
    {
      id: 'tone',
      label: 'Tone',
      type: 'select',
      options: ['Casual & Conversational', 'Educational', 'Motivational', 'Entertaining', 'Professional'],
      required: true,
    },
    {
      id: 'duration',
      label: 'Target Video Length',
      type: 'select',
      options: ['3–5 minutes', '7–10 minutes', '15–20 minutes'],
      required: true,
    },
  ],
  systemPrompt: `You are an expert YouTube scriptwriter. Write a complete, ready-to-record YouTube script based on the topic, tone, and target length provided.

Structure the script as follows:
1. **Hook** (first 15 seconds — grab attention immediately)
2. **Intro** (brief channel intro + what the video covers)
3. **Main Sections** (3–5 clearly labeled sections with natural spoken language)
4. **Outro** (call to action — like, subscribe, comment prompt)

Guidelines:
- Write in spoken language, not essay language
- Add [PAUSE], [B-ROLL SUGGESTION], or [ON SCREEN TEXT: ...] cues where helpful
- Match the tone exactly as specified
- Adjust total word count to roughly match the target video length (1 minute ≈ 130 words)`,
  outputType: 'markdown',
};

export default youtubeScriptWriter;