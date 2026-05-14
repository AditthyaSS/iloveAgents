export default {
  id: "customer-success-check-in-email-writer",
  createdAt: "2026-05-14",
  name: "Customer Success Check-In Email Writer",
  description:
    "Draft warm, personalized customer check-in emails from usage milestones, recent activity, and the CSM's goal.",
  category: "Sales",
  icon: "Handshake",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o-mini",
  exampleInputs: {
    customerName: "Nora at BrightLedger",
    usageMilestone:
      "The team created 25 automated monthly reporting workflows and invited their finance operations group this week.",
    csmGoal:
      "Congratulate them, reinforce the value they are getting, and ask whether they would like a 20-minute optimization session.",
    tone: "Warm and consultative",
    senderName: "Maya",
  },
  inputs: [
    {
      id: "customerName",
      label: "Customer name or account",
      type: "text",
      placeholder: "e.g. Nora at BrightLedger",
      required: true,
    },
    {
      id: "usageMilestone",
      label: "Usage milestone or recent activity",
      type: "textarea",
      placeholder:
        "e.g. Created 25 automated reports, crossed 90 days live, invited the wider team",
      required: true,
    },
    {
      id: "csmGoal",
      label: "Goal for the check-in",
      type: "textarea",
      placeholder:
        "e.g. Celebrate progress, ask for feedback, suggest an optimization session",
      required: true,
    },
    {
      id: "tone",
      label: "Tone",
      type: "select",
      options: [
        "Warm and consultative",
        "Friendly and concise",
        "Professional",
        "Celebratory",
      ],
      defaultValue: "Warm and consultative",
      required: true,
    },
    {
      id: "senderName",
      label: "CSM name for sign-off",
      type: "text",
      placeholder: "e.g. Maya",
    },
  ],
  systemPrompt: `You are a customer success manager writing thoughtful customer check-in emails.
Use the customer's name, usage milestone or recent activity, and the CSM's goal to make the message feel personal rather than routine.

Output in this exact format:

## Subject
[A concise subject line tied to the milestone or check-in goal]

## Email

[Full email body, ready to send]

---

## Personalization Notes
- [One brief note explaining how the milestone shaped the email]
- [One brief note explaining the call to action]

Rules:
- Keep the email under 170 words unless the user provides a complex situation.
- Lead with the specific milestone or recent activity, not a generic "checking in" opener.
- Make the customer feel seen without exaggerating outcomes.
- Include one clear, low-pressure next step that matches the CSM's goal.
- Do not invent product usage, business results, names, or dates not provided.
- Use the requested tone. If no tone is provided, write warmly and professionally.
- Sign off with the CSM name if provided; otherwise omit the sign-off name.`,
  outputType: "markdown",
};
