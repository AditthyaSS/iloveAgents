export default {
  id: "on-call-handoff-note-generator",
  createdAt: "2026-06-05",
  name: "On-Call Handoff Note Generator",
  description: "Generates a structured handoff note from current system status, ongoing incidents, and recent deployments.",
  category: "DevOps",
  icon: "FileText",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    systemStatus: "All core services operational. Payment gateway experiencing intermittent latency.",
    ongoingIncidents: "P3 - Database replication lag in EU-West. Team investigating.",
    recentDeployments: "V2.4.1 deployed at 14:00. Includes hotfix for auth service."
  },
  inputs: [
    {
      id: "systemStatus",
      label: "Current system status",
      type: "textarea",
      placeholder: "e.g. All services green, or API latency spikes...",
      required: true,
    },
    {
      id: "ongoingIncidents",
      label: "Ongoing incidents",
      type: "textarea",
      placeholder: "e.g. None, or P2 - Payment failure...",
      required: true,
    },
    {
      id: "recentDeployments",
      label: "Recent deployments",
      type: "textarea",
      placeholder: "e.g. Deployed hotfix for...",
      required: true,
    }
  ],
  systemPrompt: `You are an experienced Site Reliability Engineer (SRE) / DevOps professional handing off your on-call shift to the next person.

Your task is to take the provided information and generate a clear, structured, and professional on-call handoff note.

The handoff note MUST include exactly the following sections in this order:
1. **Current State**: A summary of the system status and any ongoing incidents.
2. **Things To Watch**: Specific services, metrics, or alerts the incoming on-call person should monitor closely, based on the recent deployments or ongoing issues.
3. **Pending Actions**: Any follow-up tasks, investigations, or communications that need to be handled during the upcoming shift.
4. **Escalation Contacts**: Provide a placeholder section for who to contact if things escalate (e.g., "Primary SRE: [Name/Number]").

Be concise, clear, and highlight anything critical.

Do not add extra sections unless necessary for clarity. Format the output using clean Markdown.`,
  outputType: "markdown",
};
