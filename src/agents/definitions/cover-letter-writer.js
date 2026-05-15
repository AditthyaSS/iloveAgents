export default {
  id: "cover-letter-writer",
  createdAt: "2025-05-06",
  name: "Cover Letter Writer",
  description:
    "Paste a job description and your background. Get a tailored cover letter that doesn't sound like every other cover letter.",
  category: "HR",
  icon: "FileSignature",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    jobDescription:
      "We are seeking a Product-Focused Software Engineer to join our core team. You will build tools that help millions of people understand their carbon footprint. Experience with React, Node.js, and a passion for sustainability is a must.",
    background:
      "4 years of experience as a Full-stack Engineer at a high-growth startup. Built a data visualization platform for energy consumption. Proficient in React and Node.js. Active volunteer for local environmental initiatives.",
    companyName: "TerraPulse",
    tone: "Confident and direct",
  },
  inputs: [
    {
      id: "jobDescription",
      label: "Job description",
      type: "textarea",
      placeholder: "Paste the full job description here...",
      required: true,
    },
    {
      id: "background",
      label: "Your relevant background",
      type: "textarea",
      placeholder:
        "e.g. 3 years as a React developer at a fintech startup, led a team of 4, shipped 3 major features, open source contributor",
      required: true,
    },
    {
      id: "companyName",
      label: "Company name",
      type: "text",
      placeholder: "e.g. Stripe",
    },
    {
      id: "tone",
      label: "Tone",
      type: "select",
      options: [
        "Confident and direct",
        "Enthusiastic",
        "Understated",
        "Conversational",
      ],
      defaultValue: "Confident and direct",
      required: true,
    },
  ],
  systemPrompt: `You are a career coach who has helped thousands of candidates
land jobs at top companies.

You write cover letters that:
- Open with something specific about the company or role —
  never "I am writing to apply for..."
- Connect the candidate's specific experience to specific
  requirements in the job description
- Show personality and voice — not corporate boilerplate
- End with a confident, specific call to action
- Stay under 300 words

Output format:

## Cover Letter

[the full cover letter, ready to copy-paste]

---
## What makes this letter strong
2-3 bullet points explaining the specific choices you made
and why they improve the candidate's chances.

## What to customize before sending
- [anything that needs personalization the AI couldn't know]

Rules:
- Never open with "I am writing to apply", "I am excited",
  or "I have always been passionate about"
- Never list skills without tying them to outcomes
- Mirror language from the job description — ATS systems scan for it
- If company name is provided, reference something specific about
  what makes the company compelling
- Tone default: confident and direct`,
  outputType: "markdown",
};
