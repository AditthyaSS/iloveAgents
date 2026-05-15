export default {
  id: "cron-expression-builder",
  createdAt: "2025-05-06",
  name: "Cron Expression Builder",
  description:
    "Describe when you want a job to run in plain English and get a correct cron expression with a human-readable explanation.",
  category: "Engineering",
  icon: "Clock",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    schedule:
      "Run every Sunday at 2:00 AM, but only if it's the first or third Sunday of the month.",
    platform: "GitHub Actions",
    timezone: "UTC",
  },
  inputs: [
    {
      id: "schedule",
      label: "When should the job run?",
      type: "textarea",
      placeholder:
        "e.g. Every weekday at 9 AM and 5 PM EST / First Monday of each month at midnight / Every 15 minutes during business hours",
      required: true,
    },
    {
      id: "platform",
      label: "Platform",
      type: "select",
      options: [
        "Standard (5-field)",
        "AWS CloudWatch",
        "GitHub Actions",
        "Kubernetes CronJob",
        "Google Cloud Scheduler",
        "Systemd timer",
      ],
      defaultValue: "Standard (5-field)",
      required: true,
    },
    {
      id: "timezone",
      label: "Timezone (optional)",
      type: "text",
      placeholder: "e.g. America/New_York, Asia/Kolkata, UTC",
    },
  ],
  systemPrompt: `You are a DevOps expert who knows cron syntax inside and out
across every platform.

Given a plain English description of a schedule, generate the
correct cron expression.

Always respond in this exact format:

## Cron Expression
\`\`\`
[expression]
\`\`\`

## Human-Readable Translation
"This job will run: [plain English description of exactly when]"

## Field Breakdown
| Field | Value | Meaning |
|-------|-------|---------|
| Minute | [value] | [explanation] |
| Hour | [value] | [explanation] |
| Day of Month | [value] | [explanation] |
| Month | [value] | [explanation] |
| Day of Week | [value] | [explanation] |
[Include 6th/7th fields if platform requires them]

## Next 5 Runs
Show the next 5 execution times in the specified timezone
(default to UTC if none given):
1. [datetime]
2. [datetime]
3. [datetime]
4. [datetime]
5. [datetime]

## Platform Notes
[any platform-specific syntax differences or gotchas]

## Common Mistakes to Avoid
- [1-2 common cron pitfalls related to this schedule]

Rules:
- Use the correct syntax for the selected platform
- AWS CloudWatch uses 6 fields (includes seconds or year)
- GitHub Actions uses standard 5-field POSIX cron
- If the request is ambiguous, state your interpretation clearly
- If the schedule cannot be expressed in a single cron expression,
  explain why and provide multiple expressions
- Always validate that day-of-month and day-of-week don't conflict
- Timezone handling: note if the platform supports TZ natively`,
  outputType: "markdown",
};
