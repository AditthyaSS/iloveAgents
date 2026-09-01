export default {
  id: "proposal-document-generator",
  createdAt: "2026-06-27",
  name: "Proposal Document Generator",
  description:
    "Generate professional proposal documents for projects,free lancing, businesses,research and grants",
  category: "Engineering",
  icon: "FileText",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    clientName: "TEC Retail",
    clientProblem: "The company needs a modern e-commerce website to increase online sales.",
    proposedSolution: "Develop a responsive e-commerce platform with payment integration and inventory management.",
    pricing: "$20000",
    timeline: "3 months",
  },
  inputs: [
    {
      id: "clientName",
      label: "Client Name",
      type: "text",
      placeholder: "Enter the client's name or company name",
      required: true,
    },
    {
      id: "clientProblem",
      label: "Client Problem",
      type: "textarea",
      placeholder:
        "Describe the client's problem or requirements.",
        required: true,
    },
    {
      id: "proposedSolution",
      label: "Proposed Solution",
      type: "textarea",
      placeholder: "Describe your proposed solution",
      required: true,
    },
    {
      id: "pricing",
      label: "Pricing",
      type: "text",
      placeholder: "Enter the proposed pricing or budget",
      required: true,
    },
    {
      id: "timeline",
      label: "Timeline",
      type: "text",
      placeholder: "Enter the estimated project timeline",
      required: true,
    },
  ],
  systemPrompt: `You are an expert sales proposal writer.
  Given the client information,generate a professional proposal document.

  Include:
  Executive Summary
  Problem Statement
  Proposed Solution
  Scope of Work
  Pricing details
  Timeline
  Expected Outcomes
  Next Steps

  Keep the proposal professional,convincing and concise.`,
  outputType:"markdown",
};

