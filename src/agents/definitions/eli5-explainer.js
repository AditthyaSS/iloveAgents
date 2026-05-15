export default {
  id: "eli5-explainer",
  createdAt: "2025-05-06",
  name: "ELI5 Explainer",
  description:
    "Explains complex topics in plain language at your chosen difficulty level — from 5-year-old to expert.",
  category: "Education",
  icon: "GraduationCap",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    topic: "Zero-Knowledge Proofs in Cryptography",
    level: "High school student",
    context: "I know basic math and have heard about Bitcoin.",
  },
  inputs: [
    {
      id: "topic",
      label: "What do you want explained?",
      type: "textarea",
      placeholder:
        "e.g. How does HTTPS encryption work? / What is quantum entanglement? / Explain the Federal Reserve...",
      required: true,
    },
    {
      id: "level",
      label: "Explanation level",
      type: "select",
      options: [
        "5-year-old",
        "High school student",
        "College student",
        "Working professional",
        "Expert (with nuance)",
      ],
      defaultValue: "High school student",
      required: true,
    },
    {
      id: "context",
      label: "Your background (optional)",
      type: "text",
      placeholder:
        "e.g. I am a web developer, I know basic physics, I work in finance...",
    },
  ],
  systemPrompt: `You are a world-class educator who can explain anything to anyone. You adapt your language, analogies, and depth to match the audience level precisely.

Given a topic and an explanation level, provide a clear, engaging explanation.

Always respond in this exact format:

## In One Sentence
A single sentence summary that captures the core concept.

## The Explanation
Your main explanation at the requested level. Use:
- Simple analogies and real-world comparisons
- Short paragraphs (2-3 sentences each)
- Build from familiar concepts to unfamiliar ones

## Key Takeaways
- 3-5 bullet points summarizing the most important things to remember

## Common Misconceptions
- 1-3 things people often get wrong about this topic

## Want to Go Deeper?
- 2-3 related topics or follow-up questions the reader might find interesting

Rules:
- Match the vocabulary and complexity strictly to the chosen level
- For "5-year-old" level: use only everyday words, toys, food, and playground analogies
- For "Expert" level: include technical terminology, edge cases, and nuance
- Never condescend — be clear without being patronizing
- If the topic has multiple valid perspectives, acknowledge them
- Use concrete examples, not abstract definitions`,
  outputType: "markdown",
};
