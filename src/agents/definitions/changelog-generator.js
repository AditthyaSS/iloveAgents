export default {
  id: "changelog-generator",
  createdAt: "2025-05-06",
  name: "Changelog Generator",
  description:
    "Paste your git commits or PR titles and get a clean, user-facing changelog in Keep a Changelog format.",
  category: "Engineering",
  icon: "ClipboardCheck",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    commits:
      "feat: add multi-language support for the dashboard\nfix: resolve race condition in auth middleware\nfeat: implement CSV export for audit logs\nchore: update dependencies for security fixes\nrefactor: optimize database queries for the reports page",
    version: "v1.4.2",
    audience: "End users",
    productName: "Nexura Admin",
  },
  inputs: [
    {
      id: "commits",
      label: "Git commits or PR titles",
      type: "textarea",
      placeholder: `Paste your git log or PR titles, e.g.:\nfeat: add dark mode toggle\nfix: resolve crash on empty cart submit\nchore: upgrade React to 18.3\nfeat: add CSV export to reports page\nfix: correct timezone offset in date picker\nrefactor: extract auth logic to custom hook`,
      required: true,
    },
    {
      id: "version",
      label: "Version number",
      type: "text",
      placeholder: "e.g. v1.4.0",
    },
    {
      id: "audience",
      label: "Audience",
      type: "select",
      options: ["End users", "Developers", "Internal team"],
      defaultValue: "End users",
      required: true,
    },
    {
      id: "productName",
      label: "Product name (optional)",
      type: "text",
      placeholder: "e.g. iloveAgents",
    },
  ],
  systemPrompt: `You are an expert technical writer who follows the
Keep a Changelog format (keepachangelog.com).

Transform raw git commits into a clean, user-facing changelog.

Rules for transformation:
- "feat" commits → Added section
- "fix" commits → Fixed section
- "refactor", "chore", "perf" commits → Changed section
- "remove", "deprecate" commits → Removed section
- "security" commits → Security section (always put first if present)
- Rewrite commit messages into user-facing language:
  BAD:  "fix: resolve crash on empty cart submit"
  GOOD: "Fixed a crash that occurred when submitting checkout with an empty cart"
- Skip pure chore/internal commits that users don't care about
  (e.g. "chore: update lockfile", "ci: fix workflow")
- Group related changes under one bullet if sensible

Output format:

## [Version] — [Date]

### Added
- [new features]

### Fixed
- [bug fixes]

### Changed
- [improvements, refactors visible to users]

### Removed
- [removed features]

### Security
- [security fixes]

(Omit any section that has no entries.)

---
## Commit classification
Show a small table of how each commit was classified, so the
developer can verify nothing was missed or miscategorized.

Rules:
- Use the version provided or "Unreleased" if none given
- Use today's date
- Adjust language for the specified audience
- If audience is "End users", avoid technical jargon
- If audience is "Developers", include technical details`,
  outputType: "markdown",
};
