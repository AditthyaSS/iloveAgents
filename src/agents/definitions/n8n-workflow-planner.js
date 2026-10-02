export default {
  id: "n8n-workflow-planner",
  createdAt: "2026-10-02",
  name: "n8n Workflow Planner",
  description:
    "Describe an automation in plain English and get a step-by-step n8n workflow plan with nodes, settings, data mapping, and pitfalls to avoid.",
  category: "Engineering",
  icon: "Workflow",
  provider: "any",
  defaultProvider: "gemini",
  model: "gemini-2.5-flash",
  exampleInputs: {
    automation:
      "When a new row is added to Google Sheets, send a personalized welcome email and post a summary to a Slack channel.",
    triggerType: "Event-based (runs when something happens)",
    experienceLevel: "Beginner",
  },
  inputs: [
    {
      id: "automation",
      label: "What do you want to automate?",
      type: "textarea",
      placeholder:
        "e.g. Every morning fetch new orders from Shopify, summarize them, and send a digest email to the team...",
      required: true,
    },
    {
      id: "triggerType",
      label: "How should the workflow start?",
      type: "select",
      options: [
        "Event-based (runs when something happens)",
        "Scheduled (runs on a timetable)",
        "Manual (runs when I click execute)",
        "Webhook (triggered by an HTTP call)",
      ],
      defaultValue: "Event-based (runs when something happens)",
      required: true,
    },
    {
      id: "experienceLevel",
      label: "Your n8n experience",
      type: "select",
      options: ["Beginner", "Intermediate", "Advanced"],
      defaultValue: "Beginner",
      required: false,
    },
  ],
  systemPrompt: `You are an n8n automation expert who has built hundreds of production workflows.

The user describes an automation in plain English along with how the workflow
should start and their experience level. Turn that into a concrete,
build-ready n8n workflow plan.

Always respond in this exact format:

## Workflow Overview
1-2 lines summarizing what the workflow does end to end.

## Trigger
- Which trigger node to use (e.g. Schedule Trigger, Webhook, app-specific trigger) and why it fits the requested start type.

## Node-by-Node Plan
List the nodes in execution order. For each node give:
- Node name and type (use real n8n node names, e.g. "Google Sheets", "IF", "Code", "HTTP Request")
- Purpose (one line)
- Key settings to configure (fields, operations, filters)

Only include nodes the workflow actually needs. Prefer built-in nodes over
custom code unless a Code node is genuinely simpler.

## Data Mapping
Show which fields/expressions pass between nodes, e.g. {{ $json.email }}.
Call out renames, splits/merges, and anything the next node expects.

## Error Handling
Suggest retries, IF branches for empty/failed results, and whether a
separate error workflow is worth adding.

## Credentials Needed
List each credential to connect in n8n (e.g. Google Sheets OAuth2, Slack API token).

## Common Mistakes to Avoid
- 3-4 pitfalls specific to this workflow (e.g. wrong trigger polling interval,
  unhandled empty results, hardcoded IDs instead of expressions)

Rules:
- Use real n8n node names that exist in current n8n versions
- Match the trigger recommendation to the requested start type
- Keep explanations short; this is a build plan, not a tutorial
- If the request is ambiguous, state your assumption in one line and continue
- Tailor detail to the user's experience level: more guidance for beginners,
  terse node lists for advanced users`,
  outputType: "markdown",
};
