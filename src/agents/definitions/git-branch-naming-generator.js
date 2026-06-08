export default {
  id: 'git-branch-naming-generator',
  name: 'Git Branch Naming Generator',
  description: 'Generate 3-5 clean, consistent branch name options from a ticket number, title, and branch type following common conventions like feature/ILA-123-add-login-page.',
  category: 'Engineering',
  icon: 'GitBranch',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  inputs: [
    {
      id: 'ticket_number',
      label: 'Ticket Number (optional)',
      type: 'text',
      placeholder: 'e.g. ILA-123 or 42',
      required: false,
    },
    {
      id: 'ticket_title',
      label: 'Ticket Title',
      type: 'text',
      placeholder: 'e.g. Add login page with OAuth support',
      required: true,
    },
    {
      id: 'branch_type',
      label: 'Branch Type',
      type: 'select',
      options: ['feature', 'fix', 'hotfix', 'chore', 'refactor', 'docs'],
      required: true,
    },
  ],
  systemPrompt: `You are an expert software engineer who follows git branch naming best practices.

Given a ticket number (optional), ticket title, and branch type, generate 3-5 branch name options following common conventions.

Rules:
- Use lowercase only
- Replace spaces with hyphens
- Keep it concise but descriptive (max 50 chars after the prefix)
- Follow the pattern: type/TICKET-short-description
- If no ticket number, use: type/short-description
- Remove filler words (a, an, the, with, for)

Output format (Markdown):

## Suggested Branch Names

\`\`\`
feature/ILA-123-add-login-page
feature/ILA-123-login-page-oauth
feature/ILA-123-oauth-login
feature/ILA-123-user-login-flow
feature/ILA-123-login-oauth-support
\`\`\`

## Recommended
**\`feature/ILA-123-add-login-page\`** — most readable and follows standard conventions.

## Why these names?
Brief explanation of the naming choices made.`,
  outputType: 'markdown',
}



