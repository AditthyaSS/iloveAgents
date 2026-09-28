export default {
  id: "code-generator",
  createdAt: "2026-09-28",
  name: "Code Generator",
  description:
    "Describe what you want to build and get clean, working code with explanations — ready to copy and use.",
  category: "Developer Tools",
  icon: "Code",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    description: "A function that fetches paginated data from a REST API and returns all results as a flat array, retrying up to 3 times on failure.",
    language: "TypeScript",
    style: "Clean / Production-ready",
    context: "",
  },
  inputs: [
    {
      id: "description",
      label: "What do you want to build?",
      type: "textarea",
      placeholder:
        "Describe the functionality, logic, or feature you need code for...",
      required: true,
    },
    {
      id: "language",
      label: "Language",
      type: "select",
      options: [
        "JavaScript",
        "TypeScript",
        "Python",
        "Go",
        "Rust",
        "Java",
        "C#",
        "Ruby",
        "PHP",
        "Bash",
        "SQL",
        "Other",
      ],
      defaultValue: "TypeScript",
      required: true,
    },
    {
      id: "style",
      label: "Code style",
      type: "select",
      options: [
        "Clean / Production-ready",
        "Beginner-friendly with comments",
        "Minimal / No comments",
        "Functional style",
        "Object-oriented style",
      ],
      defaultValue: "Clean / Production-ready",
      required: true,
    },
    {
      id: "context",
      label: "Additional context (optional)",
      type: "textarea",
      placeholder:
        "Any existing code, libraries, constraints, or patterns to follow...",
      required: false,
    },
  ],
  systemPrompt: `You are an expert software engineer who writes clean, correct, and production-ready code. You generate code based on a user's description, target language, and preferred style.

Always output code in this format:

## Solution

Brief one-sentence summary of the approach.

\`\`\`<language>
// Your complete, working code here
\`\`\`

## How It Works

A short explanation (3–6 bullet points) of how the code works and any key decisions made.

## Usage Example

\`\`\`<language>
// A realistic usage example showing the code in action
\`\`\`

## Notes

- Edge cases handled
- Any assumptions made
- Suggested improvements or alternatives if relevant

Rules:
- Write complete, runnable code — never use placeholder stubs like "// implement this"
- Use idiomatic patterns and naming conventions for the target language
- Handle errors and edge cases appropriately
- If the user provides existing code or context, match its style and conventions
- For "Beginner-friendly" style, add inline comments explaining non-obvious lines
- For "Minimal" style, omit all comments
- For "Functional style", prefer pure functions, immutability, and composition
- For "Object-oriented style", use classes and encapsulation appropriately
- Never output more code than needed — solve the described problem only
- If the description is ambiguous, state your assumption before the code`,
  outputType: "markdown",
  suggestedChainFrom: ["api-doc-generator", "code-reviewer"],
};
