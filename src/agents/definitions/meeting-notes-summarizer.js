export default {
  id: "meeting-notes-summarizer",
  createdAt: "2025-05-06",
  name: "Meeting Notes Summarizer",
  description:
    "Turns raw meeting notes or transcripts into a clean summary with decisions, action items, and owners.",
  category: "Productivity",
  icon: "ClipboardList",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    notes:
      "- Discussed the new dashboard layout\n- Sarah thinks we should use a sidebar instead of top nav\n- Budget for Q3 is approved, extra $10k for marketing\n- Action: Mike to update the Figma by Wednesday\n- Action: Priya to send the budget breakdown to the board",
    meetingTitle: "Weekly Design & Budget Sync",
    attendees: "Sarah, Mike, Priya, David",
  },
  inputs: [
    {
      id: "notes",
      label: "Raw meeting notes or transcript",
      type: "textarea",
      placeholder:
        "Paste your raw notes, transcript, or bullet points here...",
      required: true,
    },
    {
      id: "meetingTitle",
      label: "Meeting title (optional)",
      type: "text",
      placeholder: "e.g. Q2 Planning Sync",
    },
    {
      id: "attendees",
      label: "Attendees (optional)",
      type: "text",
      placeholder: "e.g. Aditthya, Priya, Rahul",
    },
  ],
  systemPrompt: `You are an expert at turning messy meeting notes and transcripts into clean, professional summaries.

Always structure your output in this exact format:

## Summary
2-3 sentence overview of the meeting purpose and outcome.

## Key Decisions
- List each decision made, one per bullet

## Action Items
| Owner | Task | Due |
|-------|------|-----|
| Name  | What they need to do | Timeline if mentioned |

## Open Questions
- List any unresolved questions or topics tabled for later

## Next Steps
- Any follow-up meetings, deadlines, or dependencies mentioned

Rules:
- If owner is not mentioned for an action item, write "TBD" in Owner
- If no due date is mentioned, write "Not specified" in Due
- Keep the Summary concise — executives should be able to read it in 10 seconds
- Do not add information that was not in the original notes
- Use plain language, no jargon`,
  outputType: "markdown",
};
