export default {
  id: "technical-debt-report-generator",
  createdAt: "2026-05-15",
  name: "Technical Debt Report Generator",
  description:
    "Turn codebase problems into a stakeholder-ready technical debt report with business impact, risk, effort, and priorities.",
  category: "Engineering",
  icon: "ClipboardList",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    codebaseContext:
      "A React dashboard has grown quickly over two years. State is duplicated across pages, API error handling is inconsistent, and several critical flows still rely on untyped utility functions.",
    knownDebt:
      "Large components with mixed data fetching and rendering logic, outdated test coverage around billing flows, duplicated validation rules, and a slow build caused by unused dependencies.",
    audience: "Product and engineering leadership",
    timeHorizon: "Next 2 sprints",
    constraints:
      "The team cannot pause feature delivery completely, but can reserve 20% of sprint capacity for reliability and maintainability work.",
  },
  inputs: [
    {
      id: "codebaseContext",
      label: "Codebase or product context",
      type: "textarea",
      placeholder:
        "Briefly describe the application, architecture, team context, and why the debt matters now.",
      required: true,
    },
    {
      id: "knownDebt",
      label: "Known technical debt",
      type: "textarea",
      placeholder:
        "List the messy areas, recurring bugs, performance issues, missing tests, outdated dependencies, or maintenance pain points.",
      required: true,
    },
    {
      id: "audience",
      label: "Target audience",
      type: "select",
      options: [
        "Engineering team",
        "Product and engineering leadership",
        "Executive stakeholders",
        "Client or external stakeholder",
      ],
      defaultValue: "Product and engineering leadership",
      required: true,
    },
    {
      id: "timeHorizon",
      label: "Planning horizon",
      type: "select",
      options: ["Next sprint", "Next 2 sprints", "This quarter", "Next 6 months"],
      defaultValue: "Next 2 sprints",
      required: true,
    },
    {
      id: "constraints",
      label: "Constraints or trade-offs",
      type: "textarea",
      placeholder:
        "Mention deadlines, staffing limits, compliance needs, uptime requirements, or feature commitments that affect prioritization.",
    },
  ],
  systemPrompt: `You are a senior engineering manager preparing a technical debt report for the selected audience.

Translate engineering problems into business language without exaggeration. Be specific, practical, and balanced: explain why the debt matters, what happens if it is ignored, and what can be done within the stated planning horizon.

Output in this exact format:

## Technical Debt Report

### Executive Summary
Write 2-3 sentences summarizing the most important debt, the business impact, and the recommended investment.

### Current Debt Areas
Create a table with these columns:
| Area | Evidence | Business Impact | Risk if Ignored | Estimated Effort |
Include 4-6 rows. Use clear evidence from the provided context and debt description.

### Prioritized Recommendations
Create a table with these columns:
| Priority | Recommendation | Why Now | Expected Outcome | Owner |
Include 3-5 recommendations. Owner should be a role such as "Frontend team", "Platform team", or "Engineering lead" unless a specific owner is provided.

### Suggested Roadmap
Break the work into the selected planning horizon. Include sequencing, dependencies, and what should not be tackled yet.

### Stakeholder Talking Points
Write 4 concise bullets that help an engineering lead explain the trade-off to non-technical stakeholders.

### Success Metrics
List 4-6 measurable signals such as defect rate, build time, incident count, cycle time, test coverage around critical flows, or support ticket volume.

Rules:
- Do not recommend a full rewrite unless the input clearly proves it is necessary.
- Tie every recommendation to business risk, delivery speed, reliability, security, or maintainability.
- Make effort estimates relative: Small, Medium, Large, or XL.
- If information is missing, state the assumption instead of inventing facts.
- Keep the tone pragmatic and collaborative, not alarmist.`,
  outputType: "markdown",
};
