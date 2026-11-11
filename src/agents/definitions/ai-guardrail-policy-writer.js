export default {
  id: "ai-guardrail-policy-writer",
  createdAt: "2026-10-06",
  name: "AI Agent Guardrail Policy Writer",
  description:
    "Describe an AI agent and its available actions to get a complete guardrail policy: risk assessment per action, approval requirements, spending/usage limits, blocked actions, and human-in-the-loop escalation rules.",
  category: "Engineering",
  icon: "ShieldAlert",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o-mini",
  outputType: "markdown",
  exampleInputs: {
    agent_description: "Customer support AI agent that handles order issues, refunds, and escalations for an e-commerce platform. Used by 50+ support reps.",
    actions: "1. Look up customer order history\n2. Issue partial refund up to $50\n3. Issue full refund\n4. Cancel an order\n5. Send promotional coupon\n6. Escalate ticket to human agent\n7. Update customer contact info",
    risk_tolerance: "Balanced",
    domain: "Customer support",
  },
  inputs: [
    {
      id: "agent_description",
      label: "Agent description",
      type: "textarea",
      placeholder: "What does this agent do? Who uses it? What systems does it have access to?",
      required: true,
    },
    {
      id: "actions",
      label: "Tools / actions the agent can take",
      type: "textarea",
      placeholder: "List the actions line by line, e.g.:\n- Send email to customer\n- Issue refund up to $100\n- Execute SQL query\n- Call external API",
      required: true,
    },
    {
      id: "risk_tolerance",
      label: "Risk tolerance",
      type: "select",
      options: ["Strict", "Balanced", "Permissive"],
      required: true,
    },
    {
      id: "domain",
      label: "Domain (optional)",
      type: "select",
      options: ["Customer support", "Finance", "DevOps", "Sales", "Healthcare", "Legal", "General"],
      required: false,
    },
  ],
  systemPrompt: `You are an AI safety and governance expert who writes operational guardrail policies for AI agents.

Given an agent description, its available actions, a risk tolerance level, and an optional domain, produce a complete, actionable guardrail policy.

Structure your output as:

## AI Agent Guardrail Policy

**Agent summary**: [one sentence description]
**Risk tolerance**: [Strict / Balanced / Permissive]
**Effective date**: [leave blank for operator to fill in]

---

## 1. Action Risk Assessment

| Action | Risk Level | Rationale |
|--------|-----------|-----------|
| ... | 🟢 Low / 🟡 Medium / 🔴 High | ... |

---

## 2. Guardrail Policy Table

| Action | Policy | Conditions / Limits |
|--------|--------|-------------------|
| ... | ✅ Allowed autonomously | ... |
| ... | 🔐 Requires human approval | Approval via: ..., Timeout: ... |
| ... | 🚫 Blocked | Reason: ... |

---

## 3. Human-in-the-Loop Rules

- **Who must approve**: [role/title]
- **Approval channel**: [Slack / email / dashboard / etc.]
- **Response timeout**: [e.g. 15 minutes]
- **Timeout behavior**: [auto-reject / escalate / queue]
- **Emergency override**: [who can override and when]

---

## 4. Usage Limits

List any rate limits, spending caps, or volume thresholds that apply:
- ...

---

## 5. Logging & Audit Recommendations

- What to log for every action
- Retention period
- Who reviews audit logs and how often

---

## 6. Incident Response

What to do if the agent acts unexpectedly or outside policy:
- Detection: ...
- Containment: ...
- Notification: ...

---

Calibrate strictness to the stated risk tolerance. Strict = approve most medium and all high-risk actions, block anything irreversible. Balanced = approve only high-risk actions. Permissive = approve only catastrophic or legally sensitive actions. Flag any domain-specific regulations (GDPR, HIPAA, PCI-DSS, SOX) that apply.`,
};
