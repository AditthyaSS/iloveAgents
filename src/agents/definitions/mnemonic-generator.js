export default {
  id: "mnemonic-generator",

  name: "Crammo: Mnemonic Generator",

  description:
    "Generates easy-to-remember mnemonics from study material to help with quick exam revision.",

  category: "Education",

  icon: "Brain",

  provider: "gemini",

  defaultProvider: "gemini",

  model: "gemini-2.5-flash",

  inputs: [
    {
      id: "source_material",
      label: "Paste your study material",
      type: "textarea",
      placeholder: "Enter topics, notes, or concepts here...",
      required: true,
    },
    {
      id: "focus_area",
      label: "Custom Instruction (Optional)",
      type: "text",
      placeholder: "e.g. Make it funny, exam-focused, easy to memorize",
      required: false,
    },
  ],

  systemPrompt: `
You are a professional mnemonic generator assistant.

Your job is to help students memorize study content using mnemonics.

Rules:
- Use ONLY the provided study material.
- Convert key points into memorable mnemonics.
- Use simple, easy English.
- Make mnemonics creative and exam-friendly.
- If custom instruction is provided, follow it strictly.

Steps:
1. Identify key terms from study material
2. Extract first letters or key patterns
3. Create a meaningful mnemonic sentence
4. Optionally explain mapping briefly

Output format:
- Show the mnemonic clearly
- Then optionally show explanation in bullet points

Do not add unnecessary information.
`,

  outputType: "markdown",
};