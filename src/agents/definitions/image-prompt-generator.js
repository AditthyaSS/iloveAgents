const imagePromptGenerator = {
  id: 'image-prompt-generator',
  name: 'Master Image Prompt Generator',
  description: 'Turn a basic idea into a highly detailed, professional prompt for Midjourney, DALL-E 3 or other AI image generation tools.',
  category: 'Design',
  icon: 'Wand2',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  inputs: [
    {
      id: 'subject',
      label: 'What is the main subject?',
      type: 'textarea',
      placeholder: 'e.g., A cyberpunk cat drinking coffee in a neon-lit alleyway',
      required: true,
    },
    {
      id: 'style',
      label: 'Art Style',
      type: 'select',
      options: [
        'Cinematic & Photorealistic', 
        'Nature / National Geographic',
        'Fashion / High-End Runway',
        'Anime / Studio Ghibli', 
        'Concept Art / Video Game',
        'Oil Painting', 
        '3D Render / Pixar', 
        'Cyberpunk', 
        'Minimalist Vector',
        'Watercolor',
        'Pencil Sketch',
        'Macro Photography'
      ],
      required: true,
    },
    {
      id: 'aspectRatio',
      label: 'Aspect Ratio',
      type: 'select',
      options: [
        '16:9 (Widescreen)', 
        '9:16 (Mobile/Reels)', 
        '1:1 (Square)',
        '4:3 (Classic Photography)',
        '3:4 (Vertical Photography)',
        '3:2 (DSLR Print)',
        '2:3 (Vertical Print)',
        '21:9 (Cinematic Ultra-Wide)'
      ],
      required: true,
    }
  ],
  systemPrompt: `You are an expert AI image prompt engineer. 
Take the user's subject, style, and aspect ratio, and craft a master-level prompt optimized for Midjourney v6 and DALL-E 3. 

First, establish the central idea clearly. Then, elevate the prompt by inventing highly specific, immersive minor details that bring the scene to life based on the chosen style.

Structure the prompt to naturally include:
1. The Core Subject (The central action, pose, and emotion)
2. Intricate Details (Textures, micro-expressions, specific props, or clothing)
3. Background & Environment (Foreground/background elements, weather, atmosphere)
4. Lighting (e.g., dappled sunlight, harsh neon, volumetric fog, rim lighting)
5. Camera & Composition (e.g., 35mm lens, shallow depth of field, low angle, macro)
6. Color Palette & Mood (e.g., muted pastels, high-contrast, melancholic)

Output ONLY the prompt text inside a markdown code block, ready to be copied and pasted. Do not include any conversational filler. For the aspect ratio, append the standard Midjourney parameter at the very end (e.g., --ar 16:9).`,
  outputType: 'markdown',
};

export default imagePromptGenerator;