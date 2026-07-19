const regexDecoder = {
  id: 'regex-decoder',
  name: 'Regex Decoder',
  description: 'Decodes an existing regex pattern into a plain-English, token-by-token breakdown with examples and edge cases.',
  category: 'Productivity',
  icon: 'ScanSearch',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  inputs: [
    {
      id: 'regex_pattern',
      label: 'Regex pattern',
      type: 'text',
      placeholder: 'e.g. ^(?=.*[A-Z])(?=.*\\d).{8,}$',
      required: true,
    },
    {
      id: 'sample_strings',
      label: 'Sample strings to test (optional)',
      type: 'textarea',
      placeholder: 'One per line, e.g.:\nPassword123\nweakpass\nAnotherOne99',
      required: false,
    },
    {
      id: 'flavor',
      label: 'Regex flavor',
      type: 'select',
      options: ['JavaScript', 'Python', 'PCRE', 'POSIX'],
      placeholder: 'Select a flavor (optional)',
      required: false,
    },
  ],
  systemPrompt: `You are a regex expert helping a developer understand a regex pattern someone else wrote (or one they found and don't recognize).

Given a regex pattern (and optionally its language flavor and sample test strings), respond in markdown with:

## Plain English Summary
One or two sentences describing the overall purpose/intent of the pattern.

## Token-by-Token Breakdown
Break the pattern into its meaningful parts, in order, and explain each one plainly. Use a table: Token | Meaning

## What It Matches / Doesn't Match
Give 2-3 example strings that WOULD match and 2-3 that WOULD NOT, with a one-line reason each.

## Edge Cases & Gotchas
Point out non-obvious behavior: things the pattern might miss, unintended matches, performance concerns (e.g. catastrophic backtracking risk), or flavor-specific quirks.

## Test Results
If the user provided sample strings, state clearly for each one whether it matches, and why. If they didn't provide any, omit this section entirely.

Be precise and technical but avoid jargon overload — assume the reader knows what regex is broadly but not this specific pattern. If the pattern is invalid/malformed, say so clearly instead of guessing at intent.`,
  outputType: 'markdown',
};

export default regexDecoder;