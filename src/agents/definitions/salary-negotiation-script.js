export default {
  id: "salary-negotiation-script",
  createdAt: "2025-05-22",
  name: "Salary Negotiation Script Generator",
  description:
    "Generate personalized salary negotiation scripts with opening statements, pushback responses, and professional closing strategies.",
  category: "Finance",
  icon: "DollarSign",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o-mini",
  exampleInputs: {
    current_salary: "$85,000",
    desired_salary: "$100,000",
    role: "Senior Product Manager",
    company: "Tech Startup",
    years_experience: "5",
    currency: "USD",
    tone: "Confident",
    market_data:
      "Senior PMs in our region average $95k-$105k based on recent market surveys",
  },
  inputs: [
    {
      id: "current_salary",
      label: "Current Salary",
      type: "text",
      placeholder: "e.g., $85,000",
      required: true,
    },
    {
      id: "desired_salary",
      label: "Desired Salary",
      type: "text",
      placeholder: "e.g., $100,000",
      required: true,
    },
    {
      id: "role",
      label: "Job Title/Role",
      type: "text",
      placeholder: "e.g., Senior Product Manager",
      required: true,
    },
    {
      id: "company",
      label: "Company Name",
      type: "text",
      placeholder: "e.g., Tech Startup",
      required: true,
    },
    {
      id: "years_experience",
      label: "Years of Relevant Experience",
      type: "text",
      placeholder: "e.g., 5",
      required: true,
    },
    {
      id: "currency",
      label: "Currency",
      type: "select",
      options: [
        "USD",
        "EUR",
        "GBP",
        "JPY",
        "AUD",
        "CAD",
        "CHF",
        "CNY",
        "INR",
        "SGD",
      ],
      defaultValue: "USD",
      required: true,
    },
    {
      id: "tone",
      label: "Tone",
      type: "select",
      options: [
        "Confident",
        "Respectful",
        "Assertive",
        "Professional",
        "Collaborative",
      ],
      defaultValue: "Professional",
      required: true,
    },
    {
      id: "market_data",
      label: "Market Research/Supporting Data",
      type: "textarea",
      placeholder:
        "Share any market data, benchmarks, or achievements that support your request...",
      required: false,
    },
  ],
  systemPrompt: `You are an expert career coach and salary negotiation specialist. Generate a comprehensive salary negotiation script that includes:

1. **Opening Statement**: A confident, professional way to bring up salary negotiation
2. **Value Proposition**: Key points highlighting achievements and market value
3. **Pushback Response**: How to handle common objections (budget constraints, performance, etc.)
4. **Closing Statement**: Professional, graceful closing that leaves room for further discussion

The script should be:
- Respectful and professional
- Data-backed with market references when provided
- Tailored to the specific role, company, and experience level
- Suitable for in-person, virtual, or written communication
- Tone should match the requested tone preference

Format the output as clear sections with bullet points where appropriate. Make it easy to reference during the actual negotiation.`,
  outputType: "markdown",
  suggestedChainFrom: ["competitive-analysis-generator", "research-agent"],
};
