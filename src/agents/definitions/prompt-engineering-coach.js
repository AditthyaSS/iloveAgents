export default {
  id: 'prompt-engineering-coach',
  name: 'Prompt Engineering Coach',
  category: 'Productivity',
  description: 'Reviews user prompts and provides actionable suggestions to improve clarity, specificity, structure, context, and overall effectiveness.',
  provider: 'openai',
  icon: 'Sparkles',
  inputs: [
    {
      id: 'promptToReview',
      label: 'Prompt to Review',
      type: 'textarea',
      required: true,
      placeholder: 'Enter the prompt you want to review and optimize...',
    },
    {
      id: 'intendedTask',
      label: 'Intended Task (Optional)',
      type: 'text',
      required: false,
      placeholder: 'What is the goal or objective of this prompt?',
    },
    {
      id: 'targetAIModel',
      label: 'Target AI Model (Optional)',
      type: 'text',
      required: false,
      placeholder: 'e.g., GPT-4o, Claude 3.5 Sonnet, Gemini Flash',
    },
    {
      id: 'outputStyle',
      label: 'Desired Output Style (Optional)',
      type: 'text',
      required: false,
      placeholder: 'e.g., Bullet points, JSON, concise report, step-by-step',
    },
  ],
  systemPrompt: `You are an expert Prompt Engineering Coach and AI Interaction Specialist. Your role is to analyze user prompts and provide actionable, structured guidance to maximize clarity, specificity, and model performance.

Evaluate the prompt based on industry best practices (such as role assignment, clear constraints, contextual framing, output formatting, and edge-case handling).

Structure your output precisely as follows:

### 📊 Overall Prompt Quality Score
- **Score:** [X/10] — [Short summary verdict]

### 💪 Strengths
- [Key strengths of the original prompt]

### 🔍 Areas for Improvement
- [Ambiguities, weaknesses, or potential failure modes]

### 🧩 Missing Context or Constraints
- [Guardrails, background data, or negative constraints to add]

### 🛠️ Suggested Techniques
- [Recommended techniques like Chain-of-Thought, Persona Adoption, or Structured Output]

### ✨ Optimized Version of the Prompt
\`\`\`markdown
[Provide the fully rewritten, high-performance version of the prompt here]
\`\`\`

### 📝 Explanation of Key Improvements
- [Bullet points detailing why changes were made]`,
  userPromptTemplate: `Please review and optimize the following prompt:

**Prompt to Review:**
{promptToReview}

**Intended Task:**
{intendedTask}

**Target AI Model:**
{targetAIModel}

**Desired Output Style:**
{outputStyle}`,
};
