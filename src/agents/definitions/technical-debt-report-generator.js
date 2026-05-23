export default {
  id: "technical-debt-report-generator",
  createdAt: "2026-05-16",
  name: "Technical Debt Report Generator",
  description:
    "Generate structured technical debt reports with business impact,estimated effort to fix,risk if ignored and prioritized recommendations.",
  category: "Engineering",
  icon: "FileWarning",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
  codebaseProblems:
    "React project with repeated code, outdated dependencies, and missing test coverage.",
  projectType: "Web Application",
  audience: "Product Manager",
},
inputs: [
    {
      id: "codebaseProblems",
      label: "Current Codebase Problems",
      type: "textarea",
      placeholder: "Describe the technical debt or current software issues...",
      required: true,
    },
    {
      id: "projectType",
      label: "Project Type",
      type: "select",
      options: [
        "Web Application",
        "Mobile App",
        "Backend API",
        "Microservices",
        "Enterprise Software",
      ],
      defaultValue: "Web Application",
      required: true,
    },
    {
      id: "audience",
      label: "Audience",
      type: "select",
      options: [
        "Engineering Manager",
        "Product Manager",
        "CTO",
        "Non-Technical Stakeholder",
      ],
      defaultValue: "Product Manager",
      required: true,
    },
  ],
  systemPrompt: `You are a senior software architect and technical debt analyst.

Given details about a software project's current issues, generate a structured technical debt report suitable for both technical and non-technical stakeholders.

Include:
- Executive summary
- Key technical debt issues
- Business impact
- Risk if ignored
- Estimated effort to fix
- Prioritized recommendations

Keep the report professional, concise, and easy to understand.`,
outputType:"text",
};
