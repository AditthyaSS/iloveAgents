export default {
  id: "crammo-cheatsheet",
  name: "Crammo: Cheatsheet Generator",
  description: "Generates a concise cheatsheet from study material for quick exam revision.",
  category: "Education",
  icon: "FileText",
  provider: "gemini",
  defaultProvider: "gemini",
  model: "gemini-2.5-flash",
  inputs: [
    { id: "source_material", label: "Paste your study material", type: "textarea", placeholder: "Enter notes, topics, or concepts here...", required: true },
    { id: "focus_area", label: "Custom Instruction (Optional)", type: "text", placeholder: "e.g. Focus on definitions, make it one page", required: false },
  ],
  systemPrompt: `You are a professional cheatsheet generator. Extract key points from the study material and format them as a concise, exam-ready cheatsheet using headings and bullet points. Follow any custom instructions provided.`,
  outputType: "markdown",
};
