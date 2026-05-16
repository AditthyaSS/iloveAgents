export default {
  id: "sales-discovery-call-script-generator",
  createdAt: "2026-05-15",

  name: "Sales Discovery Call Script Generator",

  description:
    "Create professional sales discovery call scripts with qualification questions, pain-point exploration, objection handling, and actionable next steps.",

  category: "Sales",

  icon: "PhoneCall",

  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",

  exampleInputs: {
    product:
      "AI-powered CRM platform for small businesses",

    targetIndustry:
      "Healthcare clinics and hospitals",

    idealCustomer:
      "Clinic managers struggling with patient follow-up workflows and appointment tracking.",

    callGoal:
      "Understand workflow issues and qualify the lead for a product demo",

    tone: "Professional",
  },

  inputs: [
    {
      id: "product",
      label: "Product or service",
      type: "textarea",
      placeholder: "Describe your product or service...",
      required: true,
    },

    {
      id: "targetIndustry",
      label: "Target industry",
      type: "text",
      placeholder: "e.g. SaaS, healthcare, fintech",
      required: true,
    },

    {
      id: "idealCustomer",
      label: "Ideal customer profile",
      type: "textarea",
      placeholder:
        "Describe your ideal customer and their pain points...",
      required: true,
    },

    {
      id: "callGoal",
      label: "Goal of the discovery call",
      type: "text",
      placeholder:
        "e.g. qualify lead, book demo, understand pain points",
      required: true,
    },

    {
      id: "tone",
      label: "Tone",
      type: "select",
      options: [
        "Professional",
        "Friendly",
        "Consultative",
        "Direct",
      ],
      defaultValue: "Professional",
      required: true,
    },
  ],

  systemPrompt: `You are an expert B2B sales strategist and sales enablement coach.

Generate a detailed and realistic sales discovery call script.

The output must include:

# Discovery Call Script

## Opening
- Professional introduction
- Rapport building
- Meeting agenda
- Permission-based transition into discovery

## Qualification Questions
Generate thoughtful questions about:
- Company size
- Current workflow
- Existing tools or systems
- Budget considerations
- Decision-making process
- Timeline and urgency

## Pain Point Exploration
Create follow-up questions that uncover:
- Operational inefficiencies
- Current frustrations
- Business goals
- Team challenges
- Productivity bottlenecks

## Positioning Suggestions
Explain how the product/service should be positioned
based on the customer's likely pain points.

## Objection Handling
Provide 3 likely objections with professional,
confident responses.

## Call Closing
Include:
- Summary of discussion
- Recommended next steps
- Clear CTA
- Follow-up suggestions

Rules:
- Keep the script conversational and realistic
- Avoid robotic or overly aggressive sales language
- Make questions natural and easy to ask
- Use markdown formatting
- Focus on helping the salesperson build trust
- Keep responses actionable and practical`,

  outputType: "markdown",
};