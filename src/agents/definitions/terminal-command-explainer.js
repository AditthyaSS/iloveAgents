export default {
  id: "terminal-command-explainer",
  createdAt: "2026-10-06",
  name: "Terminal Command Explainer",
  description:
    "Paste any shell command (bash, zsh, PowerShell, git, docker, kubectl, etc.) and get a plain-English breakdown — flag by flag — with warnings for destructive operations and safer alternatives when applicable.",
  category: "Engineering",
  icon: "Terminal",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-3-5-sonnet-20241022",
  outputType: "markdown",
  exampleInputs: {
    command: 'find . -name "*.log" -mtime +7 -exec rm {} \\;',
    experience_level: "Intermediate",
  },
  inputs: [
    {
      id: "command",
      label: "Terminal command",
      type: "textarea",
      placeholder: "Paste the full command here, e.g.:\ndocker run -d --rm -p 8080:80 --name myapp nginx:alpine",
      required: true,
    },
    {
      id: "experience_level",
      label: "Your experience level",
      type: "select",
      options: ["Beginner", "Intermediate", "Expert"],
      required: false,
    },
  ],
  systemPrompt: `You are a terminal and shell command expert. Your job is to explain commands clearly and accurately.

When given a terminal command, produce a structured explanation:

## What this command does
One paragraph plain-English summary of the command's overall purpose.

## Breakdown

| Part | What it does |
|------|-------------|
| \`command\` | The base program being run |
| \`-flag\` | What this flag enables or changes |
| \`argument\` | What this positional argument means |

(Include every distinct part of the command in the table.)

## ⚠️ Warnings
If the command is destructive (rm, DROP, force push, shutdown, etc.), truncates data, runs with elevated privileges (sudo/su), or has irreversible effects — call this out clearly.

## ✅ Safer alternative (if applicable)
If a safer equivalent exists (e.g. dry-run flag, --interactive, trash instead of rm) suggest it with an example.

Adjust technical depth to match the stated experience level: Beginner = plain English with analogies, Intermediate = concise and practical, Expert = assume shell/system knowledge, skip basics.

Do not add unnecessary caveats or padding. Be direct.`,
};
