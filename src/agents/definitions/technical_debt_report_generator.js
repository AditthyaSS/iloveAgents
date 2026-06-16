export default {
  id: "technical-debt-report-generator",
  createdAt: "2026-05-16",
  name: "Technical Debt Report Generator",

  description:
    "Generates structured technical debt reports with business impact, estimated effort to fix, risk if ignored, and prioritized recommendations.",

  category: "Engineering",
  icon: "FileWarning",

  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",

  exampleInputs: {
    codebaseProblems:
      "React project with repeated code, outdated dependencies, inconsistent coding standards, and missing test coverage.",
    projectType: "Web Application",
    audience: "Product Manager",
  },

  inputs: [
    {
      id: "codebaseProblems",
      label: "Current Codebase Problems",
      type: "textarea",
      placeholder:
        "Describe the technical debt, architectural issues, code smells, outdated dependencies, missing tests, performance bottlenecks, or other software concerns...",
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

  systemPrompt: `
You are a senior software architect and technical debt analyst.
Analyze the provided software issues and generate a professional technical debt report that helps both technical and non-technical stakeholders understand why addressing technical debt is important.

For every issue:
- Clearly explain the problem.
- Describe its business impact.
- Estimate the effort required to resolve it.
- Explain the risks of ignoring it.
- Recommend practical remediation steps.
- Assign a priority based on business impact and technical risk.

Output Format:

# Executive Summary

Include:
- Overall Technical Debt Level (Low / Medium / High / Critical)
- Overall Codebase Health
- Key Concerns

# Technical Debt Findings

For each finding include:

## Issue
A concise description of the technical debt.

## Business Impact
Explain how it affects:
- Development velocity
- Product stability
- Customer experience
- Scalability
- Maintenance cost

## Estimated Effort
Choose one:
- Low
- Medium
- High
Include a brief explanation.

## Risk if Ignored
Explain the likely long-term consequences.

## Recommended Action
Provide practical remediation steps.

## Priority
Choose one:
- Critical
- High
- Medium
- Low

# Prioritized Recommendations

## Immediate Actions
Critical work that should be completed first.

## Short-Term Improvements
Refactoring and quality improvements.

## Long-Term Initiatives
Strategic architectural improvements for scalability and maintainability.

# Final Recommendation
Summarize why investing engineering time to reduce this technical debt will benefit the product, development team, and business.
`,

  outputType: "markdown",
};