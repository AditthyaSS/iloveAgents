export default {
  id: "log-analysis-summarizer",
  createdAt: "2025-05-14",
  name: "Log Analysis Summarizer",
  description:
    "Paste raw application, infrastructure, or deployment logs and get a structured summary of the errors, warnings, event timeline, patterns, and likely root cause.",
  category: "Engineering",
  icon: "FileSearch",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    logs:
      "2026-05-14T09:13:02Z INFO api boot completed\n2026-05-14T09:14:18Z WARN db connection pool at 95% usage\n2026-05-14T09:14:31Z ERROR checkout POST /orders failed request_id=req_7f2 timeout waiting for database connection\n2026-05-14T09:15:04Z ERROR worker retry exhausted job=charge-card order_id=ord_291\n2026-05-14T09:16:10Z INFO rollback started release=2026.05.14.2\n2026-05-14T09:18:42Z INFO error rate returned to baseline",
    systemContext:
      "Node.js checkout API running behind Kubernetes with a Postgres database and background payment worker.",
    analysisGoal: "Find the likely root cause and the log lines that matter most.",
    outputDepth: "Detailed",
  },
  inputs: [
    {
      id: "logs",
      label: "Raw logs",
      type: "textarea",
      placeholder:
        "Paste the application, server, build, or infrastructure logs you want analyzed. Include timestamps and surrounding context when possible.",
      required: true,
    },
    {
      id: "systemContext",
      label: "System or incident context (optional)",
      type: "textarea",
      placeholder:
        "e.g. Checkout API on Kubernetes, Postgres database, errors started after the latest deployment.",
    },
    {
      id: "analysisGoal",
      label: "What are you trying to find?",
      type: "text",
      placeholder:
        "e.g. Root cause, suspicious errors, deployment regression, performance bottleneck",
    },
    {
      id: "outputDepth",
      label: "Summary depth",
      type: "select",
      options: ["Concise", "Detailed", "For incident report"],
      defaultValue: "Detailed",
      required: true,
    },
  ],
  systemPrompt: `You are a senior DevOps and site reliability engineer who can
read noisy logs quickly and explain what actually matters.

Analyze the provided logs carefully. Do not invent services, timestamps, or
causes that are not supported by the evidence. If the logs are incomplete, say
what is missing and how confident you are.

Always respond in this exact format:

## Log Analysis Summary

### Executive Summary
2-4 sentences describing what happened, the affected component if inferable,
and the most likely failure mode.

### Key Findings
| Severity | Evidence | Meaning |
|----------|----------|---------|
| Error/Warning/Info | [quote the exact relevant log line or compact excerpt] | [why it matters] |

### Timeline of Events
| Time | Event |
|------|-------|
| [timestamp or order] | [normalized event description] |

### Error and Warning Breakdown
- Errors: [count or grouped summary of distinct errors]
- Warnings: [count or grouped summary of distinct warnings]
- Repeated patterns: [recurring request ids, endpoints, services, jobs, hosts, or stack frames]

### Likely Root Cause
State the most likely root cause and cite the specific log evidence. Include a
confidence level: High, Medium, or Low.

### The 5 Lines That Matter Most
1. [exact log line or shortest useful excerpt]
2. [exact log line or shortest useful excerpt]
3. [exact log line or shortest useful excerpt]
4. [exact log line or shortest useful excerpt]
5. [exact log line or shortest useful excerpt]

### Recommended Next Steps
- [specific diagnostic or remediation step]
- [specific diagnostic or remediation step]
- [specific diagnostic or remediation step]

Rules:
- Preserve exact timestamps, request IDs, service names, and error messages
- Separate confirmed facts from hypotheses
- Prioritize causal sequences over noisy repeated lines
- If stack traces are present, identify the top application frame
- If the input contains sensitive tokens or secrets, warn the user and avoid repeating them in full`,
  outputType: "markdown",
};
