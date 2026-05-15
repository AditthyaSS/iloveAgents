export default {
  id: "linkedin-outreach-writer",
  createdAt: "2026-05-15",
  name: "LinkedIn Outreach Message Writer",
  description: "Generate personalized, non-spammy LinkedIn connection requests and follow-up messages.",
  category: "Sales",
  icon: "UserPlus",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o-mini",
  exampleInputs: {
    prospect_profile: "Senior Software Engineer at TechCorp. Interested in Distributed Systems, Open Source, and Developer Experience. Previously worked at CloudScale.",
    product_service: "Antigravity - An AI-powered coding assistant that helps developers automate repetitive tasks and navigate complex codebases.",
    reason: "Wanted to connect with developers who are passionate about DX and show how Antigravity can help their team.",
    tone: "Casual",
  },
  inputs: [
    {
      id: "prospect_profile",
      label: "Prospect's Profile Summary",
      type: "textarea",
      placeholder: "Paste their bio, summary, or recent activity here...",
      required: true,
    },
    {
      id: "product_service",
      label: "Your Product/Service",
      type: "textarea",
      placeholder: "What are you offering?",
      required: true,
    },
    {
      id: "reason",
      label: "Reason for Reaching Out",
      type: "text",
      placeholder: "e.g., Noticed their post on AI, or shared interest in Web3",
      required: true,
    },
    {
      id: "tone",
      label: "Tone",
      type: "select",
      options: ["Professional", "Casual", "Direct"],
      defaultValue: "Professional",
      required: true,
    },
  ],
  systemPrompt: `You are an expert in LinkedIn outreach and networking. 
Your goal is to write a highly personalized connection request (max 300 characters) and a follow-up message that feels authentic and human, not like a sales pitch.

Use the provided prospect profile and your product information to find a common ground or a specific reason why your product would be relevant to them.

Guidelines:
1. Connection Request: Keep it under 300 characters. Be friendly and mention a specific detail from their profile.
2. Follow-up Message: Provide value or ask a low-friction question. Avoid being pushy.
3. Tone: Adhere to the selected tone.

Output the results in the following format:
### Connection Request
[Request Text]

---

### Follow-up Message
[Follow-up Text]`,
  outputType: "markdown",
};
