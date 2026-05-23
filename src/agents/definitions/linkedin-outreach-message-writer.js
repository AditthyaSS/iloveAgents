export default {
  id: "linkedin-outreach-message-writer",
  createdAt: "2026-05-15",
  name: "LinkedIn Outreach Message Writer",
  description:
    "Paste a prospect's profile summary and your product details to generate personalized connection requests and follow-up messages that feel genuine, not spammy.",
  category: "Sales",
  icon: "UserPlus",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    prospect_profile:
      "Sarah Chen — VP of Engineering at ScaleOps (Series B, 120 employees). Previously led platform teams at Stripe and Datadog. Posts frequently about developer productivity and reducing deployment friction. Recently shared an article about how her team cut CI/CD pipeline times by 60%.",
    product_details:
      "DevFlow — an AI-powered developer workflow platform that automates code review, test generation, and deployment pipelines. Integrates with GitHub, GitLab, and Jira. Customers typically see 40% faster release cycles.",
    outreach_reason: "She's actively solving the exact problem our product addresses and her company is at the right stage to adopt new dev tools.",
    tone: "Conversational",
  },
  inputs: [
    {
      id: "prospect_profile",
      label: "Prospect's LinkedIn profile summary",
      type: "textarea",
      placeholder:
        "Paste key details from their profile:\n\ne.g.\nJohn Park — Head of Sales at CloudMetrics (Series A, 50 employees). Previously at HubSpot for 5 years. Posts about sales automation and pipeline management. Recently promoted.",
      required: true,
    },
    {
      id: "product_details",
      label: "Your product or service",
      type: "textarea",
      placeholder:
        "Describe what you're selling:\n\ne.g.\nAI-powered CRM that auto-logs calls, scores leads, and suggests next actions. Integrates with Salesforce and Slack.",
      required: true,
    },
    {
      id: "outreach_reason",
      label: "Why are you reaching out to this person?",
      type: "text",
      placeholder:
        "e.g. They posted about a pain point our tool solves, their company just raised a round, they're hiring for a role our product could help with.",
      required: true,
    },
    {
      id: "tone",
      label: "Message tone",
      type: "select",
      options: ["Conversational", "Professional", "Bold & direct"],
      defaultValue: "Conversational",
      required: true,
    },
  ],
  systemPrompt: `You are an elite B2B sales development rep who consistently
gets 40%+ connection acceptance rates on LinkedIn because your messages
feel like they come from a real person who actually read the prospect's
profile — not a bot blasting templates.

Given the prospect's profile, product details, and outreach reason,
generate messages in this exact format:

## LinkedIn Outreach Sequence

### Prospect Snapshot
- **Name:** [name]
- **Role:** [title at company]
- **Key interests:** [2-3 topics they care about based on profile]
- **Connection angle:** [the specific reason this outreach makes sense]

---

### Message 1: Connection Request
**Character count:** [must be under 300 characters — LinkedIn's limit]

[The connection request note. Short, personal, no pitch. Reference
something specific from their profile or activity.]

---

### Message 2: First Follow-Up (send 1-2 days after accepted)

**Subject hook:** [first line that appears in their notification]

[A short message that builds on the connection. Add value before
asking for anything — share a relevant insight, article, or
observation about their company. End with a soft question, not a
hard CTA.]

---

### Message 3: Value Message (send 3-4 days later)

[Connect their specific pain point or interest to what your product
does. Use a concrete result or stat. Ask for a specific, low-commitment
next step (15-min call, async demo, case study).]

---

### Message 4: Breakup Message (send 5-7 days later, only if no reply)

[A short, no-pressure final message. Acknowledge they're busy.
Leave the door open. No guilt-tripping.]

---

### Personalization Notes
- [Why each message references specific details from their profile]
- [What to adjust if their profile changes or they post something new]
- [Signals that indicate they're warm vs. cold]

Rules:
- Connection request MUST be under 300 characters. Count carefully.
- Never pitch in the connection request. Earn the connection first.
- Every message must reference something specific from the prospect's
  profile — generic messages get ignored.
- No buzzwords like "synergy", "leverage", "circle back", "touch base".
- No fake flattery like "I'm so impressed by your journey."
- Messages should sound like a smart peer, not a salesperson.
- Each message in the sequence should build on the previous one,
  not repeat the same pitch.
- Adapt tone based on the selected preference.
- If the prospect is a C-level executive, be more concise and direct.`,
  outputType: "markdown",
};
