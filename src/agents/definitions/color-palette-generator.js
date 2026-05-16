export default {
  id: "color-palette-generator",
  createdAt: "2025-05-06",
  name: "Color Palette Generator",
  description:
    "Describe a mood, brand, or use case and get a complete color palette with hex codes, CSS variables, and accessibility contrast ratios.",
  category: "Design",
  icon: "Palette",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    description:
      "A professional and sleek dark mode theme for a crypto trading platform. Needs to feel high-tech, trustworthy, and energetic. Think deep navy backgrounds with neon cyan and lime green accents.",
    paletteType: "Dark mode",
    outputFormat: "Tailwind config",
    baseColor: "#0F172A",
  },
  inputs: [
    {
      id: "description",
      label: "Describe the vibe or brand",
      type: "textarea",
      placeholder:
        "e.g. A modern fintech app that feels trustworthy but not boring — think Stripe meets dark mode / A warm, cozy recipe blog for home cooks",
      required: true,
    },
    {
      id: "paletteType",
      label: "Palette type",
      type: "select",
      options: [
        "Full UI palette (primary, secondary, neutrals, accents)",
        "Minimal (3-4 colors)",
        "Dark mode",
        "Light mode",
        "Both light and dark",
      ],
      defaultValue: "Full UI palette (primary, secondary, neutrals, accents)",
      required: true,
    },
    {
      id: "outputFormat",
      label: "Code format",
      type: "select",
      options: [
        "CSS custom properties",
        "Tailwind config",
        "SCSS variables",
        "JSON tokens",
        "All formats",
      ],
      defaultValue: "CSS custom properties",
      required: true,
    },
    {
      id: "baseColor",
      label: "Base color to build around (optional)",
      type: "text",
      placeholder: "e.g. #6366F1, brand blue, forest green",
    },
  ],
  systemPrompt: `You are a senior UI/UX designer and color theory expert.
You create production-ready color palettes that are beautiful,
accessible, and practical.

Output in this exact format:

## Color Palette

### Preview
For each color, show:
- **[Role]:** \`#hexcode\` — [one-line description of when to use it]

Organize by role:
- Primary (1-2 shades)
- Secondary / Accent
- Success, Warning, Error
- Neutrals (background, surface, text — 4-5 shades from light to dark)

### Accessibility Check
| Foreground | Background | Contrast Ratio | WCAG AA | WCAG AAA |
|------------|------------|----------------|---------|----------|
[check the most common text/background combinations]

### Code Output
Provide code in the requested format:

\`\`\`css
:root {
  --color-primary: #hexcode;
  /* ... */
}
\`\`\`

### Usage Guidelines
- When to use primary vs secondary
- Text colors for each background
- Do's and don'ts (2-3 each)

### Color Relationships
Briefly explain the color theory behind the palette:
complementary, analogous, split-complementary, etc.

Rules:
- Every palette must pass WCAG AA for text readability
- Neutral scale must have at least 5 shades (50 to 900)
- If a base color is provided, build the palette around it
- Include semantic colors (success, warning, error) in full palettes
- Hex codes must be valid — double check every value
- Never suggest pure black (#000) for text — use dark grays
- If both light and dark modes requested, share the same hue family`,
  outputType: "markdown",
};
