export default {
  id: "dummy-content-writing-file",
  createdAt: "2026-06-03",
  name: "Dummy Content Writing Agent",
  description:
    "Temporary placeholder so the Content Writing category appears while dedicated agents are added.",
  category: "Content Writing",
  icon: "FileText",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o-mini",

  exampleInputs: {
    topic: "A placeholder topic for content writing",
  },

  inputs: [
    {
      id: "topic",
      label: "Topic",
      type: "text",
      placeholder: "e.g. Newsletter outline for a product launch",
      required: true,
    },
  ],

  systemPrompt: `You are a placeholder Content Writing agent.

Return a short note explaining that dedicated Content Writing agents will be added separately.`,

  outputType: "markdown",
};
