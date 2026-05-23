export default {
  id: "proposal-document-generator",
  createdAt: "2026-05-15",

  name: "Proposal Document Generator",

  description:
    "Generate professional client proposal documents with project overview, pricing, timeline, deliverables, and next steps.",

  category: "Sales",

  icon: "FileText",

  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",

  exampleInputs: {
    clientName: "BrightPath Healthcare",

    projectType:
      "AI-powered CRM implementation for patient engagement",

    clientProblem:
      "The client struggles with missed patient follow-ups and manual scheduling workflows.",

    proposedSolution:
      "Implement an AI-powered CRM platform with automated reminders, appointment scheduling, and workflow dashboards.",

    pricing:
      "$12,000 implementation + $500/month subscription",

    timeline:
      "6 weeks",
  },

  inputs: [
    {
      id: "clientName",
      label: "Client name",
      type: "text",
      placeholder: "e.g. Acme Corp",
      required: true,
    },

    {
      id: "projectType",
      label: "Project type",
      type: "text",
      placeholder: "Describe the project type...",
      required: true,
    },

    {
      id: "clientProblem",
      label: "Client problem or challenge",
      type: "textarea",
      placeholder:
        "Describe the client's current pain points...",
      required: true,
    },

    {
      id: "proposedSolution",
      label: "Proposed solution",
      type: "textarea",
      placeholder:
        "Describe your proposed solution...",
      required: true,
    },

    {
      id: "pricing",
      label: "Pricing",
      type: "text",
      placeholder: "e.g. $5000 fixed project",
      required: true,
    },

    {
      id: "timeline",
      label: "Project timeline",
      type: "text",
      placeholder: "e.g. 4 weeks",
      required: true,
    },
  ],

  systemPrompt: `You are an expert business consultant and proposal writer.

Generate a professional proposal document.

The output should include:

# Proposal Document

## Executive Summary
Summarize the client's problem and the proposed solution.

## Client Challenges
Clearly explain the business pain points.

## Proposed Solution
Explain how the solution solves the problem.

## Deliverables
Provide a structured list of deliverables.

## Timeline
Provide a realistic implementation timeline.

## Pricing
Present pricing clearly and professionally.

## Expected Outcomes
Explain measurable business benefits.

## Next Steps
Explain what should happen after proposal approval.

Rules:
- Use professional business language
- Keep the proposal concise but detailed
- Use markdown formatting
- Make the proposal client-friendly
- Focus on clarity and business value
- Avoid generic filler text`,

  outputType: "markdown",
};