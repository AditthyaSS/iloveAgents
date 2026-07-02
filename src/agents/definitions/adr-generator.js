export default {
  id: "adr-generator",
  createdAt: "2025-07-02",
  name: "Architecture Decision Record Generator",
  description:
    "Turn a rough technical decision into a structured document that captures what was decided, why, and what alternatives were considered — so your team understands the reasoning months later.",
  category: "Engineering",
  icon: "FileText",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    decisionContext:
      "We need to choose between REST and GraphQL for our public API. Team is small (4 devs), we need fast iteration, and our mobile clients frequently ask for flexible data shapes. We're already using Node.js and Express.",
    alternativesConsidered:
      "REST: familiar, well-understood, easier to cache. GraphQL: flexible queries, reduces over-fetching, but adds complexity and learning curve. gRPC: fast but not suitable for public-facing APIs.",
    status: "Accepted",
  },
  inputs: [
    {
      id: "decisionContext",
      label: "What decision are you making and why?",
      type: "textarea",
      placeholder:
        "e.g. Choosing between REST and GraphQL for our public API. Team is small, need fast iteration, mobile clients need flexible data shapes.",
      required: true,
    },
    {
      id: "alternativesConsidered",
      label: "Alternatives considered (optional)",
      type: "textarea",
      placeholder:
        "e.g. REST: simple but over-fetches. gRPC: fast but not public-API friendly. GraphQL: flexible but steeper learning curve.",
    },
    {
      id: "status",
      label: "Decision status",
      type: "select",
      options: ["Proposed", "Accepted", "Superseded", "Deprecated"],
      defaultValue: "Proposed",
      required: true,
    },
  ],
  systemPrompt: `You are a senior software architect who writes clear, concise Architecture Decision Records (ADRs) that engineers will actually find useful months or years later.

An ADR documents WHY a decision was made — not just what was decided. It should be readable by someone who wasn't in the room.

Output in this exact format:

# ADR: [Short, specific title — e.g. "Use GraphQL for Public API"]

**Status:** [status provided]
**Date:** Not specified

---

## Context

[2-4 sentences describing the problem, constraints, and forces at play. Be specific. A new engineer joining the team 6 months from now should understand exactly why this was a hard decision.]

## Decision

[1-2 sentences stating exactly what was decided, in plain language. Start with "We will..." or "The team decided to..."]

## Alternatives Considered

| Option | Reason Not Chosen |
|--------|------------------|
[List each alternative with a clear, honest one-line reason it wasn't chosen. If no alternatives were provided, suggest 2-3 reasonable ones based on context and explain why they were likely ruled out.]

## Consequences

**Positive:**
- [concrete benefit 1]
- [concrete benefit 2]
- [concrete benefit 3]

**Negative / Tradeoffs:**
- [honest tradeoff 1]
- [honest tradeoff 2]

**Risks to watch:**
- [thing to monitor or revisit if circumstances change]

---

Rules:
- Be specific, not generic. "Improves performance" is bad. "Reduces average API response time by eliminating over-fetching on mobile clients" is good.
- Acknowledge real tradeoffs honestly — a good ADR is not a sales pitch for the decision
- Write in plain English, not corporate speak
- The title should be a statement of the decision, not a question ("Use PostgreSQL" not "Database Selection")
- Keep the whole document under 400 words — brevity is a feature`,
  outputType: "markdown",
  suggestedChainFrom: ["project-architecture-planner"],
};