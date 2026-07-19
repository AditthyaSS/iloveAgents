export default {
  id: 'error-message-writer',
  name: 'Error Message Writer',
  description:
    'Paste a raw stack trace or error log and get a plain English explanation plus actionable fix suggestions.',
  category: 'Engineering',
  icon: 'AlertTriangle',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o-mini',

  inputs: [
    {
      id: 'error',
      label: 'Error / Stack Trace',
      type: 'code',
      placeholder:
        'Paste your raw error output, stack trace, or exception log here...',
      required: true,
    },

    {
      id: 'language',
      label: 'Language / Runtime',
      type: 'select',
      required: true,
      options: [
        'JavaScript',
        'Python',
        'Java',
        'Go',
        'Rust',
        'Other',
      ],
    },

    {
      id: 'context',
      label: 'Context (optional)',
      type: 'textarea',
      placeholder:
        'What was the code trying to do when this error occurred?',
      required: false,
    },
  ],

  systemPrompt: `You are an expert software engineer and technical debugger. Your task is to analyze a raw error or stack trace and produce a clear, structured debugging guide.

Analyze the error carefully considering the language/runtime and any context provided.

Return your response in markdown with the following sections exactly:

## What Went Wrong
A 1-2 sentence plain English summary of the error — no jargon unless necessary.

## Root Cause Analysis
Explain the underlying cause. Mention the specific file, line, and function if identifiable.

## Fix Suggestions
Numbered list of step-by-step fixes, ordered by likelihood of success. Be specific with code examples where helpful.

## User-Facing Message
If this error might be shown to an end user, suggest a friendly, non-technical message. If the error is internal only, write "Internal only — no user-facing message needed."

## Common Mistakes
List 2-4 common mistakes that lead to this kind of error, with brief explanations.

Keep explanations practical and actionable. Use markdown formatting, code blocks, and bullet points as appropriate.`,
  outputType: 'markdown',
}
