export default {
  id: "resume-screener",
  createdAt: "2025-05-06",
  name: "Resume Screener",
  description: "Evaluate candidates against job descriptions with scoring.",
  category: "HR",
  icon: "UserCheck",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    job_description:
      "We are looking for a Senior React Developer with 5+ years of experience. Required skills: React, TypeScript, Redux, and experience with micro-frontends. Nice to have: Node.js and AWS.",
    resume:
      "Summary: Passionate Frontend Engineer with 6 years of experience building scalable web apps.\nExperience: TechLead at FinCorp (2020-Present). Led the migration of a legacy dashboard to React/TypeScript. Used Redux Toolkit for state management.\nSkills: React, TypeScript, Next.js, GraphQL, AWS S3/Lambda.",
    criteria: ["Technical skills", "Experience years"],
  },
  inputs: [
    {
      id: "job_description",
      label: "Job Description",
      type: "textarea",
      placeholder: "Paste the job description...",
      required: true,
    },
    {
      id: "resume",
      label: "Resume",
      type: "textarea",
      placeholder: "Paste the candidate resume text...",
      required: true,
    },
    {
      id: "criteria",
      label: "Scoring criteria",
      type: "multiselect",
      options: [
        "Technical skills",
        "Experience years",
        "Culture fit",
        "Education",
      ],
      defaultValue: ["Technical skills", "Experience years"],
      required: true,
    },
  ],
  systemPrompt: `You are an experienced HR recruiter and talent evaluator. Given the job description and resume, evaluate the candidate strictly. Return your evaluation ONLY as a valid JSON object (no markdown, no code blocks, no explanation outside the JSON) with this exact structure:
{
  "matchScore": <number 0-100>,
  "criteria": {
    "<criterion name>": { "score": <number 0-100>, "comment": "<brief comment>" }
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
  "recommendation": "<Strong Yes | Yes | Maybe | No>",
  "reasoning": "<one paragraph reasoning>"
}`,
  outputType: "json",
};
