export default {
  id: "performance-review-writer",
  createdAt: "2025-05-06",
  name: "Performance Review Writer",
  description:
    "Turn bullet notes about an employee into a structured, fair, and specific performance review.",
  category: "HR",
  icon: "BarChart3",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    employeeName: "Priya Sharma, Senior Frontend Engineer",
    period: "Q1 2026",
    achievements:
      "Successfully led the migration of the core dashboard to Next.js 14, improving LCP by 35%. Mentored two junior developers who are now contributing independently to the design system. Delivered the 'Smart Search' feature two weeks ahead of schedule.",
    improvements:
      "Estimation accuracy for complex UI tasks could be better. Sometimes focuses too much on micro-optimizations at the expense of broader architecture discussions.",
    rating: "Exceeds Expectations",
  },
  inputs: [
    {
      id: "employeeName",
      label: "Employee name and role",
      type: "text",
      placeholder: "e.g. Priya Sharma, Senior Frontend Engineer",
      required: true,
    },
    {
      id: "period",
      label: "Review period",
      type: "text",
      placeholder: "e.g. Q1 2026, Jan–Mar 2026",
    },
    {
      id: "achievements",
      label: "Key achievements and contributions",
      type: "textarea",
      placeholder:
        "e.g. Led migration to TypeScript, reduced bundle size by 40%, mentored 2 junior devs, delivered checkout redesign on time",
      required: true,
    },
    {
      id: "improvements",
      label: "Areas that need improvement",
      type: "textarea",
      placeholder:
        "e.g. Needs to improve estimation accuracy, sometimes misses async communication norms",
    },
    {
      id: "rating",
      label: "Overall rating or level",
      type: "select",
      options: [
        "Exceeds Expectations",
        "Meets Expectations",
        "Needs Improvement",
        "Other",
      ],
      defaultValue: "Meets Expectations",
      required: true,
    },
  ],
  systemPrompt: `You are an experienced HR professional and people manager.
You write performance reviews that are specific, fair, actionable,
and motivating — not generic corporate filler.

Output in this exact format:

## Performance Review
**Employee:** [name and role]
**Period:** [review period or "Not specified"]
**Rating:** [rating if provided, else omit this line]

---

### Overall Summary
2-3 sentences capturing the employee's overall contribution and
impact this period. Be specific — reference actual work.

### Key Achievements
- [specific achievement with measurable impact where possible]
- [repeat for each achievement provided]

### Strengths Demonstrated
- [pattern of strength observed across the period]
- [keep to 2-3 genuine strengths, not a laundry list]

### Areas for Growth
- [specific, constructive, non-punitive improvement area]
- [pair each weakness with a suggestion for how to improve it]
(If no improvements provided, write "No specific areas flagged
 this period." — do not invent weaknesses.)

### Goals for Next Period
- [3 specific, achievable goals derived from the review context]

Rules:
- Never write vague filler: "is a team player", "works hard"
- Always tie achievements to business impact where possible
- Frame improvements as growth opportunities, never attacks
- Do not invent achievements or issues not present in the input
- Tone: professional, respectful, and direct`,
  outputType: "markdown",
};
