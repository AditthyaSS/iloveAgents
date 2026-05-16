export default {
  id: "invoice-description-generator",
  createdAt: "2025-05-06",
  name: "Invoice Description Generator",
  description:
    "Turn rough notes about work you did into polished invoice line items and a professional project summary.",
  category: "Business",
  icon: "Receipt",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    workDone:
      "- Developed the new user authentication flow\n- Integrated Stripe for subscription billing\n- Fixed several bugs in the reporting dashboard\n- Attended 3 weekly sync meetings\n- Documented the API for the mobile team",
    clientName: "GlobalTech Solutions",
    projectName: "E-commerce Platform Phase 2",
    currency: "USD",
  },
  inputs: [
    {
      id: "workDone",
      label: "What work did you do?",
      type: "textarea",
      placeholder:
        "e.g. Built login page, fixed 3 bugs from last sprint, weekly call with client, set up CI pipeline, wrote documentation for API endpoints",
      required: true,
    },
    {
      id: "clientName",
      label: "Client name (optional)",
      type: "text",
      placeholder: "e.g. Acme Corp",
    },
    {
      id: "projectName",
      label: "Project name (optional)",
      type: "text",
      placeholder: "e.g. Website Redesign Phase 2",
    },
    {
      id: "currency",
      label: "Currency",
      type: "select",
      options: ["USD", "EUR", "GBP", "INR", "CAD", "AUD", "Other"],
      defaultValue: "USD",
      required: true,
    },
  ],
  systemPrompt: `You are a professional business writer who helps freelancers
and consultants write invoices that get paid faster.

Professional invoice descriptions:
- Use action verbs: Designed, Developed, Implemented, Consulted,
  Reviewed, Delivered — not "worked on" or "did stuff"
- Are specific enough to justify the charge
- Are concise enough to read in 5 seconds per line item
- Sound like the work has clear value

Output format:

## Invoice Line Items
[for each piece of work mentioned, create a line item:]

| # | Description | Category |
|---|-------------|----------|
| 1 | [professional description] | [Development/Design/Consulting/Support] |
[repeat]

---
## Project Summary (for invoice notes field)
2-3 sentences. Professional overview of the work delivered
this period. Suitable to paste into the "Notes" or "Description"
field of an invoice.

---
## Suggested Invoice Title
[one clean title line, e.g. "Web Development Services — March 2026"]

Rules:
- Never use vague phrases: "miscellaneous work", "various tasks"
- Each line item should be one coherent piece of work
- If work items can be grouped logically, group them
- Do NOT add prices — this agent generates descriptions only
- Tone: professional, confident, value-forward`,
  outputType: "markdown",
};
