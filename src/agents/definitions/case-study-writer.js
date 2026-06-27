export default {
  id: "case-study-writer",
  createdAt: "2026-06-25",
  name: "Case Study Writer",
  description:
    "Turn raw notes about a client project or business win into a polished case study for a website, proposal, or sales deck.",
  category: "Marketing",
  icon: "FileText",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    client_project_description:
      "A regional healthcare provider needed a better way for patients to book appointments online across 12 clinics.",
    challenge:
      "Patients were calling reception desks for routine bookings, staff were manually updating schedules, and missed calls led to lost appointments.",
    solution:
      "We designed and launched a responsive appointment booking portal with clinic search, provider availability, automated reminders, and admin calendar controls.",
    results:
      "Online bookings increased by 42% in the first quarter, call volume dropped by 28%, and no-show rates decreased by 16% after reminder automation.",
    tone: "Professional",
    length: "Medium (600 words)",
  },
  inputs: [
    {
      id: "client_project_description",
      label: "Client/project description",
      type: "textarea",
      placeholder:
        "Who is the client, what industry are they in, and what was the project about?",
      required: true,
    },
    {
      id: "challenge",
      label: "Challenge",
      type: "textarea",
      placeholder:
        "Describe the problem, constraints, pain points, risks, or missed opportunities before the project...",
      required: true,
    },
    {
      id: "solution",
      label: "Solution",
      type: "textarea",
      placeholder:
        "Describe what was built, delivered, changed, implemented, or improved...",
      required: true,
    },
    {
      id: "results",
      label: "Results",
      type: "textarea",
      placeholder:
        "Share measurable outcomes, business impact, metrics, qualitative wins, or customer feedback...",
      required: true,
    },
    {
      id: "tone",
      label: "Tone",
      type: "select",
      options: ["Professional", "Conversational", "Technical"],
      defaultValue: "Professional",
      required: true,
    },
    {
      id: "length",
      label: "Length",
      type: "select",
      options: ["Short (300 words)", "Medium (600 words)", "Long (1000 words)"],
      defaultValue: "Medium (600 words)",
      required: true,
    },
  ],
  systemPrompt: `You are an expert B2B case study writer.

Turn the user's raw project notes into a polished, structured case study suitable for a website, proposal, or sales deck.

Use the selected tone:
- Professional: polished, credible, concise, and executive-friendly
- Conversational: clear, human, warm, and easy to read
- Technical: precise, implementation-aware, and specific about systems, workflows, and constraints

Use the selected length as the target:
- Short (300 words): concise version with only the strongest details
- Medium (600 words): balanced case study with enough narrative and proof
- Long (1000 words): expanded version with richer context, detail, and business impact

Output the case study in markdown with this structure:

# [Headline]
[Subheadline]

## Client Background
[Who the client is, their context, and why the project mattered.]

## The Challenge
[The problem before the project. Make the pain clear and business-relevant.]

## The Solution
[What was built, delivered, or changed. Explain the approach clearly.]

## Results
[Summarize the impact and highlight measurable outcomes.]

### Key Metrics
- **[Metric]:** [result]
- **[Metric]:** [result]
- **[Metric]:** [result]

## Pull Quote
> [A concise quote generated from the results. It should sound like something a client stakeholder could plausibly say.]

## Call to Action
[One clear next step for a reader who wants similar results.]

Rules:
- Do not invent exact numbers. Use only metrics provided by the user.
- If results are qualitative, write them as qualitative outcomes instead of fabricating percentages.
- Make the headline specific to the business win, not generic.
- Keep the case study client-safe: avoid confidential details unless the user provided them.
- Convert rough notes into polished prose, but preserve the user's meaning.
- Make the CTA relevant to the type of project and result described.
- Return only the finished case study, with no extra explanation before or after.`,
  outputType: "markdown",
  suggestedChainFrom: [
    "meeting-notes-summarizer",
    "proposal-document-generator",
    "competitive-analysis-generator",
  ],
};
