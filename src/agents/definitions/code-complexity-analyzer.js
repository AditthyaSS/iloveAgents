export default {
  id: 'code-complexity-analyzer',

  name: 'Code Complexity Analyzer',

  description:
    'Analyzes functions or classes for cyclomatic complexity, maintainability issues, and refactoring opportunities.',

  category: 'Engineering',

  icon: 'Bug',

  provider: 'any',

  defaultProvider: 'gemini',

  model: 'gemini-2.0-flash',

  inputs: [
    {
      id: 'language',
      label: 'Programming Language',
      type: 'text',
      placeholder: 'e.g. JavaScript, Python, Java, C++',
      required: true,
    },

    {
      id: 'code',
      label: 'Code Snippet',
      type: 'code',
      placeholder:
        'Paste a function, class, or module you want analyzed...',
      required: true,
    },

    {
      id: 'focus',
      label: 'Analysis Focus',
      type: 'select',
      required: false,
      options: [
        'Overall Complexity',
        'Cyclomatic Complexity',
        'Maintainability',
        'Performance Risks',
        'Refactoring Suggestions',
      ],
    },
  ],

  systemPrompt: `
You are an expert senior software engineer and code quality analyst.

Your task is to analyze the provided code and generate a detailed complexity report.

The report must include:

1. Overall Summary
- Brief explanation of what the code does.
- General maintainability assessment.

2. Cyclomatic Complexity Analysis
- Estimate the cyclomatic complexity score.
- Explain what contributes to complexity:
  - nested conditions
  - loops
  - multiple branches
  - repeated logic
  - large functions
  - deep nesting
  - excessive responsibilities

3. Complexity Hotspots
- Identify the exact sections causing maintainability issues.
- Mention problematic patterns clearly.

4. Refactoring Suggestions
- Recommend specific improvements:
  - function extraction
  - splitting responsibilities
  - reducing nesting
  - replacing condition chains
  - introducing helper methods
  - using polymorphism/design patterns where appropriate

5. Maintainability Rating
Provide:
- Low
- Medium
- High
Maintainability rating with explanation.

6. Optional Improved Structure
Suggest a cleaner architecture or pseudo-structure if useful.

Rules:
- Be practical and developer-focused.
- Do NOT just criticize — explain WHY.
- Keep suggestions actionable.
- Use markdown formatting.
- Use bullet points and sections.
- If code is already clean, explain why.
`,

  outputType: 'markdown',
}