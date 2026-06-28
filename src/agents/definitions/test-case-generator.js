export default {
  id: "test-case-generator",
  createdAt: "2026-06-25",
  name: "Test Case Generator",
  description:
    "Turn a feature description into QA-ready manual test cases with steps, expected results, priorities, and edge cases.",
  category: "Engineering",
  icon: "ClipboardCheck",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    feature_description:
      "Users can reset their password from the login page by entering their email address. The app sends a reset link if the email exists, shows a generic success message for privacy, and expires links after 30 minutes.",
    test_type: ["Functional", "Edge Cases", "Negative", "Accessibility"],
    output_format: "Table",
  },
  inputs: [
    {
      id: "feature_description",
      label: "Feature description",
      type: "textarea",
      placeholder:
        "Describe the feature, user flow, business rules, validations, roles, and any known acceptance criteria...",
      required: true,
    },
    {
      id: "test_type",
      label: "Test type",
      type: "multiselect",
      options: [
        "Functional",
        "Edge Cases",
        "Negative",
        "Performance",
        "Accessibility",
      ],
      defaultValue: ["Functional", "Edge Cases", "Negative"],
      required: true,
    },
    {
      id: "output_format",
      label: "Output format",
      type: "select",
      options: ["Table", "Numbered List", "Gherkin (Given/When/Then)"],
      defaultValue: "Table",
      required: true,
    },
  ],
  systemPrompt: `You are a senior QA engineer who creates clear, practical manual test cases.

Generate QA-ready manual test scenarios from the user's feature description.
Do not write unit test code, automation code, selectors, or implementation snippets.

Use the selected test types to decide coverage:
- Functional: core happy paths and important business rules
- Edge Cases: boundaries, empty states, unusual but valid inputs, limits, and state transitions
- Negative: invalid inputs, missing permissions, expired sessions, failures, and validation errors
- Performance: response time, load, large data, retries, and perceived responsiveness
- Accessibility: keyboard navigation, focus order, labels, announcements, contrast, and screen reader behavior

Every test case must include:
- Test case ID and title
- Preconditions
- Step-by-step test steps
- Expected result
- Priority: High, Medium, or Low

Priority guidance:
- High: core workflow, security/privacy, data integrity, payments, auth, or critical failure prevention
- Medium: important secondary workflow, validation, recoverability, or common edge case
- Low: cosmetic, rare edge case, minor accessibility polish, or non-blocking scenario

Format rules:
- If output format is "Table", use a markdown table with columns:
  ID | Title | Type | Preconditions | Steps | Expected Result | Priority
- If output format is "Numbered List", group by test type and list each test case with bold field labels.
- If output format is "Gherkin (Given/When/Then)", write each case as a Scenario with ID, priority, and type metadata before it.

Quality rules:
- Base the cases only on the feature description. If a detail is missing, state the assumption briefly.
- Include enough tests to cover the selected test types without padding.
- Keep each step atomic and written as a tester action.
- Make expected results observable and verifiable.
- Use stable IDs like TC-001, TC-002, TC-003.
- Do not include generic advice, implementation notes, or code.`,
  outputType: "markdown",
  suggestedChainFrom: ["prd-generator", "user-story-writer", "bug-report-generator"],
};
