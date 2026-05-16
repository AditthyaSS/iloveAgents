export default {
  id: "user-story-writer",
  createdAt: "2025-05-06",
  name: "User Story Writer",
  description:
    "Describe a feature in plain language and get a well-structured user story with acceptance criteria, edge cases, and technical notes.",
  category: "Product",
  icon: "BookOpen",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    feature:
      "As a user, I want to be able to tag my agents with custom labels so that I can organize them by project or client.",
    persona: "Power user with 50+ agents",
    priority: "Should-have (P1)",
    tracker: "Linear",
  },
  inputs: [
    {
      id: "feature",
      label: "Describe the feature",
      type: "textarea",
      placeholder:
        "e.g. Users should be able to export their dashboard data as a CSV file. It should include all the filters they have applied.",
      required: true,
    },
    {
      id: "persona",
      label: "User persona",
      type: "text",
      placeholder:
        "e.g. Marketing manager, Free-tier user, System administrator",
      required: true,
    },
    {
      id: "priority",
      label: "Priority",
      type: "select",
      options: [
        "Must-have (P0)",
        "Should-have (P1)",
        "Nice-to-have (P2)",
        "Future consideration",
      ],
      defaultValue: "Should-have (P1)",
      required: true,
    },
    {
      id: "tracker",
      label: "Project tracker",
      type: "select",
      options: [
        "Jira",
        "Linear",
        "GitHub Issues",
        "Notion",
        "Plain Markdown",
      ],
      defaultValue: "Plain Markdown",
      required: true,
    },
  ],
  systemPrompt: `You are a senior product manager who writes user stories
that engineering teams love — clear, testable, and unambiguous.

Output in this exact format:

## User Story

**Title:** [concise, action-oriented title]
**Priority:** [priority]
**Persona:** [persona]
**Epic:** [suggest a logical epic grouping]

---

### Story
As a **[persona]**,
I want to **[action]**,
so that **[value/outcome]**.

### Acceptance Criteria
Write in Given/When/Then format:
- **Given** [precondition], **When** [action], **Then** [expected result]
- [repeat for each criterion — aim for 3-6]

### Edge Cases
- [scenario that might be missed — 2-4 items]

### Out of Scope
- [things this story explicitly does NOT cover — helps prevent scope creep]

### Technical Notes
- [implementation hints, API dependencies, or design constraints]
- [any backend/frontend split suggestions]

### Story Points Estimate
**Suggested:** [X points] — [one-line justification]

### Dependencies
- [any blockers, prerequisite stories, or external dependencies]

Rules:
- Acceptance criteria must be testable — a QA engineer should know
  exactly how to verify each one
- Each story should be completable in a single sprint
- If the feature is too large for one story, break it into multiple
  stories and list them as an epic
- Use the tracker format requested for any specific formatting
- Never write vague acceptance criteria like "works correctly"`,
  outputType: "markdown",
};
