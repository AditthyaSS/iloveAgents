export default {
  id: "log-analysis-summarizer",
  createdAt: "2026-06-04",
  name: "Log Analysis Summarizer",
  description:
    "Paste raw log output and get a structured summary of errors, warnings, patterns, timeline of events, and likely root cause — so you find the 5 lines that matter in 500 lines of noise.",
  category: "DevOps",
  icon: "ScrollText",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    log_output:
      `2026-06-04T03:12:01Z INFO  [auth-service] User login attempt: user_id=4821
2026-06-04T03:12:02Z INFO  [auth-service] Token issued: user_id=4821
2026-06-04T03:12:45Z WARN  [db-pool] Connection pool at 85% capacity (85/100)
2026-06-04T03:13:10Z WARN  [db-pool] Connection pool at 92% capacity (92/100)
2026-06-04T03:13:22Z ERROR [db-pool] Connection pool exhausted — all 100 connections in use
2026-06-04T03:13:22Z ERROR [order-service] Failed to acquire DB connection: timeout after 5000ms
2026-06-04T03:13:23Z ERROR [order-service] POST /orders 503 Service Unavailable — DB unavailable
2026-06-04T03:13:23Z ERROR [order-service] POST /orders 503 Service Unavailable — DB unavailable
2026-06-04T03:13:24Z ERROR [payment-service] Downstream dependency order-service unreachable
2026-06-04T03:13:25Z ERROR [payment-service] Payment flow aborted for transaction_id=TXN-9921
2026-06-04T03:13:30Z WARN  [lb] High 5xx rate detected on order-service (threshold: 5%)
2026-06-04T03:14:00Z ERROR [db-pool] Connection pool still exhausted — no recovery
2026-06-04T03:14:45Z INFO  [ops-bot] Auto-scaling triggered: adding 2 DB read replicas
2026-06-04T03:15:10Z INFO  [db-pool] Connections releasing — pool at 60% (60/100)
2026-06-04T03:15:20Z INFO  [order-service] DB connection acquired successfully
2026-06-04T03:15:21Z INFO  [order-service] Service recovering — 200 responses resuming`,
    log_source: "Application (Node.js / Python / Java / etc.)",
    focus_area: ["Errors & Root Cause"],
    time_range: "",
  },
  inputs: [
    {
      id: "log_output",
      label: "Raw log output",
      type: "textarea",
      placeholder:
        "Paste your logs here — any format works:\n\n2026-06-04T03:13:22Z ERROR [db-pool] Connection pool exhausted\n2026-06-04T03:13:23Z ERROR [order-service] 503 Service Unavailable\n...\n\nSupports: application logs, system logs, container logs, nginx/apache access logs, cloud provider logs (CloudWatch, GCP Logging, etc.)",
      required: true,
    },
    {
      id: "log_source",
      label: "Log source / service type",
      type: "select",
      options: [
        "Application (Node.js / Python / Java / etc.)",
        "Kubernetes / Container (kubectl logs, Docker)",
        "Web Server (Nginx / Apache)",
        "Database (PostgreSQL / MySQL / MongoDB)",
        "Cloud Provider (CloudWatch / GCP / Azure)",
        "System / OS (syslog, journald)",
        "Other / Mixed",
      ],
      required: true,
    },
    {
      id: "focus_area",
      label: "What do you want to focus on?",
      type: "multiselect",
      options: [
        "Errors & Root Cause",
        "Warnings & Degradation Signals",
        "Performance & Latency",
        "Security & Auth Events",
        "Full Summary (all of the above)",
      ],
      required: true,
    },
    {
      id: "time_range",
      label: "Time range of interest (optional)",
      type: "text",
      placeholder: "e.g. 03:10 – 03:20 UTC, or 'last 5 minutes of logs'",
      required: false,
    },
  ],
  systemPrompt: `You are a senior SRE and log analysis expert. Engineers paste raw,
unstructured log output and need you to instantly surface what matters —
errors, patterns, root cause — without reading every line themselves.

Analyse the provided logs and return a structured report in this exact format:

---

# Log Analysis Report

**Source:** [log source type]
**Log lines analysed:** [count]
**Time span covered:** [earliest timestamp → latest timestamp, or "no timestamps found"]
**Analysis focus:** [what was requested]

---

## TL;DR — What Happened

[2–4 sentences. Write this as if briefing a senior engineer who has zero context.
State what happened, when it started, what the impact was, and whether it resolved.
This is the most important section — make it count.]

---

## 🔴 Errors ([count] found)

| Time | Component | Error | Count |
|------|-----------|-------|-------|
| [timestamp or "–"] | [service/component] | [error message, trimmed] | [occurrences] |

**Notable error patterns:**
- [group repeated errors, identify cascading failures, note any error storms]

---

## 🟡 Warnings ([count] found)

| Time | Component | Warning |
|------|-----------|---------|
| [timestamp or "–"] | [service/component] | [warning message, trimmed] |

**Warning trends:** [any gradual degradation signals visible before the errors?]

---

## 📅 Timeline of Events

[Reconstruct a chronological narrative of what happened, milestone by milestone.
Only include events that matter — skip routine noise.]

| Time | Event | Significance |
|------|-------|--------------|
| [time] | [what happened] | [why it matters] |

---

## 🔍 Root Cause Analysis

**Most likely root cause:**
[One clear sentence stating the root cause.]

**Evidence:**
- [log line or pattern that supports this]
- [log line or pattern that supports this]
- [log line or pattern that supports this]

**Contributing factors:**
- [secondary issues that made it worse or harder to detect]

**Confidence:** [High / Medium / Low] — [one sentence explaining confidence level,
e.g. "High — direct error messages clearly indicate the cause" or
"Medium — timestamps suggest correlation but causation is inferred"]

---

## ⚡ Immediate Actions Recommended

1. [Most urgent action — what to check or fix right now]
2. [Second action]
3. [Third action]

---

## 🔁 Patterns & Anomalies

[Identify anything unusual beyond the obvious errors:
- Repeated failures at regular intervals (suggests a scheduled job or retry loop)
- Gradual degradation before a hard failure (suggests resource exhaustion)
- Cascading failures across services (suggests dependency issue)
- Sudden spike vs steady increase (different root causes)
- Recovery signals (did the service self-heal? was a fix deployed?)
If no anomalies detected, state that clearly.]

---

## 📊 Log Volume Summary

| Level | Count | % of Total |
|-------|-------|------------|
| ERROR | [n] | [%] |
| WARN  | [n] | [%] |
| INFO  | [n] | [%] |
| DEBUG | [n] | [%] |
| Other | [n] | [%] |

---

Rules:
- Never quote full log lines verbatim in tables — trim to the meaningful part.
- If the same error repeats many times, group it as one row with a count.
- Identify cascading failures clearly: if service A caused service B to fail, say so explicitly.
- If timestamps are missing or inconsistent, note it but still analyse what you can.
- If the logs show a recovery (service came back up), include that in the timeline.
- Confidence level must be honest — if the logs are ambiguous, say Medium or Low.
- For the "Immediate Actions" section, be specific to what you see in the logs.
  Do not give generic advice like "check your logs" — you just did that for them.
- If the time range input is provided, focus your analysis on that window but note
  any relevant context outside it.
- If the logs are clean with no errors or warnings, say so clearly and summarise
  what normal operation looks like based on the log content.`,
  outputType: "markdown",
};