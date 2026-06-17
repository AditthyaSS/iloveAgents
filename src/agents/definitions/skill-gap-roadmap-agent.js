export default {
  id: "skill-gap-roadmap-agent",
  createdAt: "2026-05-21",
  name: "Skill Gap Roadmap Agent",
  description:
    "Paste the job description for your future role and your current background. Get a week-by-week learning roadmap, project ideas, and milestone checks.",
  category: "Education",
  icon: "MapPinned",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    targetRole:
      "Senior Frontend Engineer responsible for building accessible, performant product interfaces with React, TypeScript, and design systems.",
    currentBackground:
      "2 years as a frontend developer. Comfortable with React and CSS, basic TypeScript, limited testing experience, and have never owned architecture decisions end-to-end.",
    currentSkills:
      "React, JavaScript, CSS, Tailwind, Git, basic Node.js, some REST APIs",
    timeframe: "12 weeks",
    hoursPerWeek: "8",
    focusArea: "Frontend engineering",
  },
  inputs: [
    {
      id: "targetRole",
      label: "Target job description / future role",
      type: "textarea",
      placeholder:
        "Paste the job description you want to reach in 1-2 years...",
      required: true,
    },
    {
      id: "currentBackground",
      label: "Your current background",
      type: "textarea",
      placeholder:
        "Describe your current experience, education, projects, and constraints...",
      required: true,
    },
    {
      id: "currentSkills",
      label: "Current skills",
      type: "textarea",
      placeholder:
        "List the skills you already have, separated by commas or bullet points...",
      required: false,
    },
    {
      id: "timeframe",
      label: "Roadmap timeframe",
      type: "select",
      options: ["8 weeks", "12 weeks", "16 weeks", "24 weeks"],
      defaultValue: "12 weeks",
      required: true,
    },
    {
      id: "hoursPerWeek",
      label: "Study hours per week",
      type: "text",
      placeholder: "e.g. 5, 8, 12",
      required: false,
    },
    {
      id: "focusArea",
      label: "Primary focus area",
      type: "select",
      options: [
        "Frontend engineering",
        "Backend engineering",
        "Full-stack engineering",
        "Data / Analytics",
        "Product / UX",
        "Cloud / DevOps",
      ],
      defaultValue: "Frontend engineering",
      required: false,
    },
  ],
  systemPrompt: `You are a career roadmap coach.

Given a future job description and the user's current background, produce a realistic week-by-week plan that closes the gap from where they are now to the target role.

Output format:

## 1) Gap Summary
- 3-6 bullets covering the biggest missing skills, experience gaps, and assumptions.

## 2) Week-by-Week Roadmap
For each week, include:
- Week number
- Main focus
- What to learn
- What to build or practice
- A measurable checkpoint

## 3) Projects to Build
- 2-4 portfolio projects that directly prove the missing skills
- For each project: purpose, suggested stack, and why it matters

## 4) Milestone Checkpoints
- A list of checkpoints at the end of each month or phase
- Include how the user can know they are on track

## 5) Risks / Adjustments
- Things that could slow progress and how to adapt the plan

Rules:
- Keep the roadmap practical, not generic.
- Prioritize the highest-impact skills first.
- If the target role is very far from the current background, say so plainly and adjust the timeline expectations.
- Base the plan on the user's current background and any explicit skills provided.
- Make the roadmap specific enough to follow week by week.
- Do not give vague advice without concrete actions.
- Keep the tone encouraging but honest.
`,
  outputType: "markdown",
};
