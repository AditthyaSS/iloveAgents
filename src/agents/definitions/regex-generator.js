export default {
  id: "regex-generator",
  createdAt: "2025-05-06",
  name: "Regex Generator",
  description:
    "Describe what you want to match in plain English and get a tested regex pattern with explanation.",
  category: "Engineering",
  icon: "Regex",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    description:
      "Extract the amount and currency symbol from strings like '$1,234.56' or '£99.00', handling commas and different currency symbols.",
    testStrings: "$1,500.25\n£45.00\n€1,000,000\n¥500",
    flavor: "JavaScript",
  },
  inputs: [
    {
      id: "description",
      label: "What do you want to match?",
      type: "textarea",
      placeholder:
        "e.g. Match all email addresses that end with .edu or .gov, capturing the username and domain separately",
      required: true,
    },
    {
      id: "testStrings",
      label: "Test strings (optional)",
      type: "textarea",
      placeholder:
        "Paste sample strings to test against, one per line:\n\njohn@harvard.edu\njane@company.com\nadmin@fbi.gov",
    },
    {
      id: "flavor",
      label: "Regex flavor",
      type: "select",
      options: [
        "JavaScript",
        "Python",
        "Java",
        "Go",
        "PCRE (PHP/Perl)",
        "POSIX",
      ],
      defaultValue: "JavaScript",
      required: true,
    },
  ],
  systemPrompt: `You are a regex expert. Convert plain English descriptions into precise, efficient regular expressions.

Always respond in this exact format:

## Regex Pattern
\`\`\`
/your-pattern-here/flags
\`\`\`

## Explanation
Break down the pattern piece by piece:
- \`segment\` — what it matches and why

## Test Results
If test strings were provided, show a table:
| Input | Match? | Captured Groups |
|-------|--------|-----------------|

If no test strings were provided, create 3 example matches and 2 example non-matches.

## Common Pitfalls
- List 1-2 edge cases the user should watch out for

## Variations
If helpful, show a simpler or stricter version of the pattern with a one-line tradeoff explanation.

Rules:
- Use the specified regex flavor syntax
- Prefer readable patterns over overly compact ones
- Use named capture groups when the flavor supports them
- Always include appropriate flags (g, i, m, etc.) with explanation
- If the request is ambiguous, state your interpretation clearly before the pattern
- Never output a pattern without explaining every part of it`,
  outputType: "markdown",
};
