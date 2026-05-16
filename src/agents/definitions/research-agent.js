export default {
  id: "research-agent",
  createdAt: "2025-05-06",
  name: "Research Agent",
  description:
    "Get comprehensive research on any topic with configurable depth.",
  category: "Research",
  icon: "Search",
  provider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    topic:
      "The impact of microplastics on deep-sea hydrothermal vent ecosystems",
    depth: "Detailed",
    format: "Report",
  },
  inputs: [
    {
      id: "topic",
      label: "Topic",
      type: "text",
      placeholder: "e.g. Quantum computing applications in drug discovery",
      required: true,
    },
    {
      id: "depth",
      label: "Depth",
      type: "select",
      options: ["Quick", "Detailed", "Expert"],
      defaultValue: "Detailed",
      required: true,
    },
    {
      id: "format",
      label: "Output format",
      type: "select",
      options: ["Bullet points", "Report", "Q&A"],
      defaultValue: "Report",
      required: true,
    },
  ],
  systemPrompt: `You are a thorough research assistant. When given a topic, research it comprehensively based on the selected depth level and return findings in the chosen format. Cite key facts clearly. Structure your response clearly with headings and sections.`,
  outputType: "markdown",
};
