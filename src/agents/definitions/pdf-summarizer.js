export default {
  id: "pdf-summarizer",
  createdAt: "2025-05-06",
  name: "PDF Summarizer",
  description: "Upload a PDF and get a structured summary with key points.",
  category: "Productivity",
  icon: "FileText",
  provider: "anthropic",
  model: "claude-opus-4-20250514",
  exampleInputs: {
    pdf_text:
      "ABSTRACT\n\nRecent advancements in Large Language Models (LLMs) have revolutionized the field of Natural Language Processing. This paper explores the performance of transformer-based architectures in zero-shot learning scenarios across diverse linguistic tasks. Our findings indicate that model scale significantly correlates with emergent capabilities, particularly in reasoning and symbolic manipulation. However, the presence of hallucinatory outputs remains a critical challenge for production-ready deployments.\n\nMETHODOLOGY\n\nWe evaluated three variants of the 'GigaChat' model on the benchmarks GLUE, SuperGLUE, and MMLU. Data was collected over a six-month period...",
    focus: "methodology and main findings",
  },
  inputs: [
    {
      id: "pdf_text",
      label: "Paste PDF text",
      type: "textarea",
      placeholder: "Paste extracted PDF content here...",
      required: true,
    },
    {
      id: "focus",
      label: "Focus area (optional)",
      type: "text",
      placeholder: "e.g. financial metrics, risks, methodology",
    },
  ],
  systemPrompt: `You are an expert document analyst. The user will provide text from a PDF. Return a structured summary with:
1. One-line TL;DR
2. Key points (bullet list)
3. Main entities mentioned
4. Action items if any.
Be concise and factual.`,
  outputType: "markdown",
};
