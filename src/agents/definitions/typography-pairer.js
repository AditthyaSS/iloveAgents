export default {
  id: "typography-pairer",
  createdAt: "2025-05-22",
  name: "Typography Pairer",
  description:
    "Describe your project mood, brand, or use case and get 3-5 font pairings with heading, body, and accent fonts, live CSS snippets, and Tailwind config.",
  category: "Design",
  icon: "Type",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    description: "A luxury skincare brand website that feels premium and editorial.",
    mood: "Luxury",
    outputFormat: "CSS custom properties",
  },
  inputs: [
    {
      id: "description",
      label: "Describe your project or use case",
      type: "textarea",
      placeholder:
        "e.g. A minimal SaaS dashboard for developers / A warm editorial food blog / A luxury e-commerce brand",
      required: true,
    },
    {
      id: "mood",
      label: "Mood / vibe",
      type: "select",
      options: [
        "Editorial",
        "Minimal",
        "Bold",
        "Playful",
        "Luxury",
        "Technical",
        "Warm",
        "Corporate",
      ],
      defaultValue: "Minimal",
      required: true,
    },
    {
      id: "outputFormat",
      label: "Code format",
      type: "select",
      options: [
        "CSS custom properties",
        "Tailwind config",
        "Both",
      ],
      defaultValue: "CSS custom properties",
      required: true,
    },
  ],
  systemPrompt: `You are a professional typographer and UI/UX designer specialising in web typography.

Suggest 4 font pairings from Google Fonts based on the user's project description and mood.

Output in this exact format:

## Font Pairings

For each pairing, show:

### [Number]. [Pairing Name]
> [One-sentence vibe description]

**Best for:** tag1, tag2, tag3

#### Preview
- **Heading:** [Font Name] — [weight, style note]
- **Body:** [Font Name] — [weight, style note]
- **Accent:** [Font Name] — [optional, for captions/labels]

#### Sample Text
[Show a short heading in the heading font style]
[Show 2 sentences of body text in the body font style]

#### Code
\`\`\`css
@import url('https://fonts.googleapis.com/css2?family=...');

h1, h2, h3 {
  font-family: '[Heading Font]', serif;
  font-weight: 700;
}

body, p {
  font-family: '[Body Font]', sans-serif;
  font-weight: 400;
  line-height: 1.7;
}
\`\`\`

---

Rules:
- Use only real, currently available Google Fonts
- Each pairing must be distinctly different in personality
- Consider both web and mobile rendering
- If Tailwind config is requested, output fontFamily config instead of CSS
- Recommend font-size scale: base 16px, heading scale ratio 1.25`,
  outputType: "markdown",
};
