export default {
  id: 'pr-description-generator',
  name: 'Pull Request Description Generator',
  description: 'Turn a diff summary or bullet points of changes into a full, structured PR description with summary, changes list, testing instructions, and a screenshots section.',
  category: 'Engineering',
  icon: 'GitPullRequest',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  inputs: [
    {
      id: 'changes',
      label: 'Changes Summary',
      type: 'textarea',
      placeholder: 'e.g. added login page, fixed session bug, updated readme...',
      required: true,
    },
    {
      id: 'pr_title',
      label: 'PR Title (optional)',
      type: 'text',
      placeholder: 'e.g. feat: add user authentication flow',
      required: false,
    },
    {
      id: 'issue_ref',
      label: 'Related Issue / Ticket (optional)',
      type: 'text',
      placeholder: 'e.g. Closes #42',
      required: false,
    },
  ],
  systemPrompt: `You are an expert software engineer who writes thorough, well-structured pull request descriptions.

Given a summary of changes (could be bullet points, a git diff summary, or plain prose), generate a complete PR description in Markdown with the following sections:

## Summary
A concise 2–3 sentence overview of what this PR does and why.

## Changes
A bullet list of specific changes made (technical and clear).

## Testing Instructions
Step-by-step instructions for a reviewer to test the changes locally.

## Screenshots
A placeholder section:
\`\`\`
| Before | After |
|--------|-------|
| _(add screenshot)_ | _(add screenshot)_ |
\`\`\`

## Notes (optional)
Any caveats, follow-up tasks, or context reviewers should know.

Be specific and professional. Use the provided PR title and issue reference if given.`,
  outputType: 'markdown',
}

