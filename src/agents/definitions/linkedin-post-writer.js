export default {
  id: "linkedin-post-writer",
  createdAt: "2025-05-06",
  name: "LinkedIn Post Writer",
  description:
    "Generate ready-to-post LinkedIn content with a strong hook and hashtags.",
  category: "Marketing",
  icon: "PenLine",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o-mini",

  exampleInputs: {
    topic:
      "Why I stopped using 'ASAP' in my professional communications and what I use instead.",
    tone: "Story",
  },

  inputs: [
    {
      id: "topic",
      label: "Topic",
      type: "text",
      placeholder: "e.g. Lessons from building my first startup",
      required: true,
    },
    {
      id: "tone",
      label: "Tone",
      type: "select",
      options: ["Thought-leader", "Story", "Data-driven"],
      defaultValue: "Story",
      required: true,
    },
  ],

  systemPrompt: `You are an expert LinkedIn content creator.

Write a LinkedIn post about the given topic using the selected tone.

Requirements:
- Start with a strong hook
- Write in clear short paragraphs
- Deliver value or insight
- End with a takeaway or call to action
- Include 3–5 relevant hashtags

Return ONLY the LinkedIn post ready to copy and publish.`,

  outputType: "markdown",
};
