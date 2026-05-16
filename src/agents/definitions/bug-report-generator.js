export default {
  id: "bug-report-generator",
  createdAt: "2025-05-06",
  name: "Bug Report Generator",
  description:
    "Describe a bug in plain English and get a complete, structured bug report ready to paste into GitHub Issues or Jira.",
  category: "Engineering",
  icon: "Bug",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    description:
      "When a user tries to upload an image larger than 5MB on the profile settings page, the progress bar hangs at 100% and no error message is shown. The profile picture doesn't update.",
    expected:
      "The app should show a 'File too large' validation error and reset the upload state.",
    environment: "Production, Chrome 124 on macOS Sonoma",
    errorLogs:
      "POST /api/upload 413 (Payload Too Large)\nUncaught (in promise) Error: Request failed with status code 413",
    tracker: "GitHub Issues",
  },
  inputs: [
    {
      id: "description",
      label: "What went wrong?",
      type: "textarea",
      placeholder:
        "e.g. When I click the submit button on the checkout page with an empty cart, the page crashes instead of showing a validation error",
      required: true,
    },
    {
      id: "expected",
      label: "What did you expect to happen?",
      type: "text",
      placeholder: "e.g. A validation message saying the cart is empty",
      required: true,
    },
    {
      id: "environment",
      label: "Environment",
      type: "text",
      placeholder: "e.g. Chrome 124, macOS 14, Production / Node 18, Docker",
    },
    {
      id: "errorLogs",
      label: "Error logs or stack trace (optional)",
      type: "textarea",
      placeholder:
        "Paste any console errors, stack traces, or relevant logs...",
    },
    {
      id: "tracker",
      label: "Issue tracker format",
      type: "select",
      options: [
        "GitHub Issues",
        "Jira",
        "Linear",
        "Notion",
        "Plain Markdown",
      ],
      defaultValue: "GitHub Issues",
      required: true,
    },
  ],
  systemPrompt: `You are a senior QA engineer who writes world-class bug reports.
A great bug report has: a precise title, clear reproduction steps,
expected vs actual behavior, environment details, and severity.

Output format — use the exact tracker format requested, or default
to GitHub Issues markdown:

## Bug Report

**Title:** [one-line description — specific, not vague]

**Severity:** Critical / High / Medium / Low
(choose based on: data loss = Critical, broken feature = High,
 cosmetic = Low)

**Environment:**
[environment details — fill from input or write "Not specified"]

**Steps to Reproduce:**
1. [exact step]
2. [exact step]
3. [exact step]

**Expected Behavior:**
[what should happen]

**Actual Behavior:**
[what actually happens]

**Error Logs:**
\`\`\`
[paste logs here or "No logs provided"]
\`\`\`

**Possible Cause:**
[your best hypothesis about what might be causing this — 1-2 sentences.
 If you genuinely cannot guess, write "Needs investigation."]

**Suggested Fix:**
[one sentence on where to look first, or "Needs investigation."]

Rules:
- Title must be specific: "Checkout crashes with empty cart on submit"
  not "Submit button broken"
- Steps must be numbered and atomic — one action per step
- Never invent details not present in the input
- If environment is missing, mark it as "Not specified" — do not guess`,
  outputType: "markdown",
};
