export default {
  id: "privacy-policy-generator",
  createdAt: "2025-05-06",
  name: "Privacy Policy Generator",
  description:
    "Describe your app or website and get a comprehensive privacy policy draft covering data collection, usage, storage, and user rights.",
  category: "Legal",
  icon: "Shield",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    appDescription:
      "Nexura is a social media management platform. We collect user names, emails, and social media handles. We process payments via Stripe and track site usage through Plausible Analytics. Users can schedule posts and upload images.",
    companyName: "Nexura Labs Inc.",
    dataCollected: [
      "Names & emails",
      "Payment info",
      "Usage analytics",
      "File uploads",
    ],
    regulations: ["GDPR (EU)", "CCPA (California)"],
    contactEmail: "privacy@nexura.io",
  },
  inputs: [
    {
      id: "appDescription",
      label: "Describe your app or website",
      type: "textarea",
      placeholder:
        "e.g. A SaaS project management tool that collects user emails, names, and project data. Users can upload files. We use Stripe for payments and Google Analytics for tracking.",
      required: true,
    },
    {
      id: "companyName",
      label: "Company or app name",
      type: "text",
      placeholder: "e.g. TaskFlow Inc.",
      required: true,
    },
    {
      id: "dataCollected",
      label: "Types of data collected",
      type: "multiselect",
      options: [
        "Names & emails",
        "Payment info",
        "Usage analytics",
        "Cookies",
        "Location data",
        "File uploads",
        "Third-party logins",
        "Health data",
        "Children data",
      ],
      defaultValue: ["Names & emails", "Usage analytics", "Cookies"],
      required: true,
    },
    {
      id: "regulations",
      label: "Compliance frameworks",
      type: "multiselect",
      options: [
        "GDPR (EU)",
        "CCPA (California)",
        "PIPEDA (Canada)",
        "DPDPA (India)",
        "General best practices",
      ],
      defaultValue: ["General best practices"],
      required: true,
    },
    {
      id: "contactEmail",
      label: "Privacy contact email",
      type: "text",
      placeholder: "e.g. privacy@yourapp.com",
    },
  ],
  systemPrompt: `You are a legal tech writer specializing in privacy policies
for software products. You produce clear, comprehensive, and
legally-informed privacy policy drafts.

IMPORTANT DISCLAIMER: Always include at the top:
"⚠️ This is an AI-generated draft for informational purposes only.
It is NOT legal advice. Have a qualified attorney review this
document before publishing."

Output in this exact format:

## Privacy Policy — [Company/App Name]

**Last Updated:** [today's date]

---

### 1. Information We Collect
Break down into:
- **Information you provide directly** (account data, etc.)
- **Information collected automatically** (analytics, cookies, etc.)
- **Information from third parties** (OAuth logins, etc.)

### 2. How We Use Your Information
Bullet list of specific purposes — be concrete, not vague.

### 3. How We Share Your Information
- Third-party services used (analytics, payment processors, etc.)
- When we may disclose data (legal requirements, business transfers)

### 4. Data Storage & Security
- Where data is stored (region if applicable)
- Security measures in place
- Data retention period

### 5. Your Rights
Based on the selected compliance frameworks:
- GDPR: right to access, rectification, erasure, portability, etc.
- CCPA: right to know, delete, opt-out of sale
- General: how to request data deletion

### 6. Cookies & Tracking
- Types of cookies used
- How to manage cookie preferences

### 7. Children's Privacy
Only include if "Children data" is selected — otherwise write
"Our service is not directed to children under 13."

### 8. Changes to This Policy
How users will be notified of updates.

### 9. Contact Us
Use the provided email or placeholder.

Rules:
- Use plain language — avoid unnecessary legal jargon
- Be specific to the app described — not a generic template
- If a regulation is selected, include its specific required clauses
- Never claim compliance — say "designed to align with" instead
- Each section should be 3-8 sentences, not walls of text`,
  outputType: "markdown",
};
