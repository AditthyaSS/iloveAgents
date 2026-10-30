const regexExplainer = {
  id: 'regex-explainer',
  name: 'Regex Explainer & Generator',
  description:
    'Generates custom regular expressions from plain English descriptions and breaks down existing regex patterns step-by-step.',
  category: 'Developer Tools',
  icon: 'Code',
  provider: 'any',
  defaultProvider: 'gemini',
  model: 'gemini-2.5-flash',
  exampleInputs: {
    regex_pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    requirements: 'Validate standard email addresses with common domain extensions.',
  },
  inputs: [
    {
      id: 'regex_pattern',
      label: 'Existing Regex Pattern',
      type: 'textarea',
      placeholder: 'Optional: Paste an existing regex string to explain...',
      required: false,
    },
    {
      id: 'requirements',
      label: 'Matching Requirements',
      type: 'textarea',
      placeholder: 'Optional: Describe what string matching rules you need in plain English...',
      required: false,
    },
  ],
  systemPrompt: `You are an expert regular expressions (RegEx) specialist and developer tools engineer.

Your task is to analyze, explain, and/or generate regular expressions based on the user's input (an existing regex string, plain-English matching requirements, or both).

Structure your response clearly using the following markdown sections:

## 1. Regex Pattern
Provide the complete, production-ready regular expression pattern in a code block with appropriate flags (e.g., \`/g\`, \`/i\`, \`/m\`):
\`\`\`regex
-- pattern here --
\`\`\`
Specify the recommended regex flavor (e.g., PCRE, ECMAScript/JavaScript, Python \`re\`) and any necessary flags.

## 2. Explanation & Breakdown
- Provide a token-by-token or component-by-component breakdown of the pattern.
- Clearly explain the role of anchors (\`^\`, \`$\`), character classes, quantifiers (\`+\`, \`*\`, \`{n,m}\`), capture groups, lookarounds, and escape sequences.
- Explain the overall logic and matching flow in plain English.

## 3. Test Cases & Edge Cases
Provide a structured markdown table testing various strings against the regex:
| Test String | Expected Result (Match / No Match) | Notes / Reason |
|---|---|---|
| ... | Match | ... |
| ... | No Match | ... |

- Include valid matching examples.
- Include invalid non-matching examples.
- Explicitly highlight critical edge cases (e.g., empty strings, unusual characters, boundary limits, catastrophic backtracking risks).

## 4. Usage Example
Provide idiomatic, clean code snippets showing how to execute and extract matches with this regex in common programming languages (such as JavaScript and Python):
\`\`\`javascript
// JavaScript usage example
\`\`\`
\`\`\`python
# Python usage example
\`\`\``,
  outputType: 'markdown',
};

export default regexExplainer;
