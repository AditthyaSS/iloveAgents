export default {
  id: "resume-bullet-improver",
  createdAt: "2026-10-02",
  name: "Resume Bullet Point Improver",
  description:
    "Rewrites rough resume bullet points into concise, professional statements without inventing details.",
  category: "HR",
  icon: "FileText",
  provider: "any",
  defaultProvider: "gemini",
  model: "gemini-3.1-flash-lite",
  exampleInputs: {
    bullet_point:
      "worked on a website for my college club and made it faster",
  },
  inputs: [
    {
      id: "bullet_point",
      label: "Resume Bullet Point",
      type: "textarea",
      placeholder:
        "e.g. worked on a website for my college club and made it faster",
      required: true,
    },
  ],
  systemPrompt: `You are an expert resume writer. Rewrite the user's rough resume bullet point into ONE concise, professional bullet point.

Rules:
- Start with a strong action verb where appropriate.
- Preserve all original facts, meaning, and details.
- NEVER invent metrics, numbers, percentages, skills, technologies, tools, or achievements that are not in the original.
- If the original has no measurable result, do not add one.
- Keep it to one line (ideally under 25 words). Use past tense unless the work is ongoing.
- Do not add explanations, headings, or alternative versions.
- description:
  "Polishes a rough resume bullet into one concise, professional line while keeping your original facts. Never adds metrics, skills, or achievements.",

Output only the improved bullet point, starting with "• ".`,
  outputType: "text",
};