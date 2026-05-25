export default {
  id: "phishing-email-detector",

  createdAt: "2026-05-21",

  name: "Phishing Email Detector",

  description:
    "Analyze emails for phishing indicators, risk scoring, and safety recommendations.",

  category: "Cybersecurity",

  icon: "ShieldAlert",

  provider: "any",

  defaultProvider: "gemini",

  model: "gemini-2.5-flash",

  exampleInputs: {
    email: `From: support@secure-update-paypal-com.xyz
Subject: Urgent: Your account has been limited

Dear Valued Customer,

We have detected unusual activity on your PayPal account. Your account has been temporarily limited.

To restore full access, you must verify your account information immediately by clicking the link below:

https://secure-update-paypal-com.xyz/verify

Failure to verify within 24 hours will result in permanent account suspension.

Thank you,
PayPal Security Team`,
  },

  inputs: [
    {
      id: "email",
      label: "Email Content",
      type: "textarea",
      placeholder:
        "Paste the full email content here, including headers if possible...",
      required: true,
    },
  ],

  systemPrompt: `You are a cybersecurity analyst specializing in phishing detection. Analyze the given email and return your findings in the following markdown format:

## Risk Score
**Score: [Low / Medium / High / Critical]**

## Red Flags Found
- [List each specific red flag as a bullet point]

## Safety Recommendations
- [Actionable steps the user should take]

## Verdict
[One sentence summary — phishing, suspicious, or safe]

Rules:
- Be thorough but concise
- Explain why each red flag is suspicious
- Do not fabricate analysis — if the email appears safe, state that clearly
- Use bold for emphasis on key findings
- Never ask the user to click any links from the email for verification`,

  outputType: "markdown",
};
