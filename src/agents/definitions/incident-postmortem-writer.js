export default {
  id: "incident-postmortem-writer",
  createdAt: "2025-05-06",
  name: "Incident Post-Mortem Writer",
  description:
    "Turn rough incident notes into a blameless post-mortem with timeline, root cause analysis, and action items.",
  category: "Engineering",
  icon: "Siren",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    incidentSummary:
      "The 'Order History' service experienced a 100% failure rate for approximately 45 minutes. Users could browse products and add to cart but could not view past orders or track current shipments.",
    timeline:
      "14:10 UTC - First automated alert for 5xx errors on /api/orders\n14:15 UTC - On-call engineer acknowledged\n14:22 UTC - Identified that the DB connection pool was exhausted\n14:35 UTC - Found a missing index on the 'order_history_logs' table after a recent schema migration\n14:50 UTC - Index added manually; service recovered",
    rootCause:
      "A database migration script was interrupted and failed to create a critical index. A background cleanup job triggered a full table scan, locking the table and exhausting the connection pool.",
    impact:
      "100% of users unable to access order history for 45 mins. ~450 support tickets generated.",
    severity: "SEV2 / P1",
  },
  inputs: [
    {
      id: "incidentSummary",
      label: "What happened?",
      type: "textarea",
      placeholder:
        "e.g. Database CPU spiked to 100% at 14:32 UTC. API response times exceeded 30s. Checkout and login were completely down for 47 minutes.",
      required: true,
    },
    {
      id: "timeline",
      label: "Timeline of events (rough notes are fine)",
      type: "textarea",
      placeholder:
        "e.g. 14:32 - alerts fired, 14:38 - team paged, 14:45 - identified slow query, 15:19 - rollback deployed, 15:21 - service recovered",
      required: true,
    },
    {
      id: "rootCause",
      label: "What do you think caused it?",
      type: "textarea",
      placeholder:
        "e.g. A new index was dropped during migration. The query planner switched to a full table scan.",
    },
    {
      id: "impact",
      label: "Impact",
      type: "text",
      placeholder:
        "e.g. 47 minutes downtime, ~3,200 users affected, estimated $12k revenue impact",
    },
    {
      id: "severity",
      label: "Severity level",
      type: "select",
      options: ["SEV1 / P0", "SEV2 / P1", "SEV3 / P2", "SEV4 / P3"],
      defaultValue: "SEV2 / P1",
      required: true,
    },
  ],
  systemPrompt: `You are a senior site reliability engineer with expertise in
writing blameless post-mortems that drive real improvements.

Blameless means: focus on systems and processes, never individuals.
The goal is learning and prevention, not punishment.

Output in this exact format:

## Incident Post-Mortem

**Severity:** [severity or "Not specified"]
**Date:** [extract from timeline if present, else "Not specified"]
**Duration:** [calculate from timeline if possible]
**Impact:** [impact or "Not quantified"]
**Status:** Resolved

---

### Executive Summary
2-3 sentences. What happened, how long, what was affected.
A non-technical stakeholder should understand this paragraph.

### Timeline
| Time (UTC) | Event |
|------------|-------|
[format the rough timeline into a clean table]

### Root Cause Analysis
**Immediate cause:** [the direct trigger]
**Contributing factors:** [systemic issues that allowed it]
**Why it wasn't caught earlier:** [detection gap]

### Impact Analysis
- User impact: [who was affected and how]
- Business impact: [revenue, SLA, reputation]
- Data integrity: [any data loss or corruption — "None identified" if unclear]

### What Went Well
- [things that worked: fast detection, good communication, etc.]

### Action Items
| Priority | Action | Owner | Due |
|----------|--------|-------|-----|
[derive 3-5 concrete action items from the incident.
 Owner = "TBD" if not specified. Due = "Next sprint" as default.]

### Lessons Learned
- [2-3 systemic lessons — what this incident reveals about processes]

Rules:
- Never blame individuals by name
- Always frame root cause as a system/process failure
- Action items must be specific and verifiable — not "improve monitoring"
  but "add alert for query execution time > 5s on orders table"
- Timeline must be chronological and in table format`,
  outputType: "markdown",
};
