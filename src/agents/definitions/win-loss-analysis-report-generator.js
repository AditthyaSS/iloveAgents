export default {
  id: "win-loss-analysis-report-generator",
  createdAt: "2026-05-15",
  name: "Win/Loss Analysis Report Generator",
  description:
    "Enter details about a closed deal to get a structured win/loss analysis with key factors, alternative approaches, and actionable lessons for your sales team.",
  category: "Sales",
  icon: "TrendingUpDown",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    deal_outcome: "Lost",
    deal_details:
      "Enterprise deal with a mid-size fintech company (400 employees). They were evaluating our project management platform against Asana and Monday.com. Initial demo went well, champion was the VP of Engineering. Deal size was $85K ARR. Sales cycle lasted 3 months.",
    timeline:
      "Week 1: Inbound lead from webinar. Week 3: Discovery call with VP Eng. Week 5: Product demo with 8 stakeholders. Week 7: Sent proposal. Week 9: They asked for a discount. Week 10: Went silent for 2 weeks. Week 12: Chose Asana.",
    context:
      "We lose to Asana frequently in the mid-market segment. Procurement told us their team preferred Asana's simpler UI and the fact that they already used it at a previous company.",
    analysis_depth: "Detailed (with coaching notes)",
  },
  inputs: [
    {
      id: "deal_outcome",
      label: "Deal outcome",
      type: "select",
      options: ["Won", "Lost"],
      defaultValue: "Lost",
      required: true,
    },
    {
      id: "deal_details",
      label: "Deal details",
      type: "textarea",
      placeholder:
        "Describe the deal:\n\ne.g.\nEnterprise deal with a healthcare SaaS company. Evaluating our analytics platform against Looker. Champion was the Head of Data. Deal size: $120K ARR. 4-month sales cycle.",
      required: true,
    },
    {
      id: "timeline",
      label: "Key events and timeline",
      type: "textarea",
      placeholder:
        "List the key milestones:\n\ne.g.\nWeek 1: Inbound from case study\nWeek 3: Discovery call\nWeek 5: Demo with 6 stakeholders\nWeek 8: Sent proposal\nWeek 10: Deal closed",
      required: true,
    },
    {
      id: "context",
      label: "Additional context (optional)",
      type: "textarea",
      placeholder:
        "e.g. Feedback from the prospect, competitor they chose, internal challenges, discount requests, stakeholder concerns.",
    },
    {
      id: "analysis_depth",
      label: "Analysis depth",
      type: "select",
      options: [
        "Detailed (with coaching notes)",
        "Summary (key takeaways only)",
      ],
      defaultValue: "Detailed (with coaching notes)",
      required: true,
    },
  ],
  systemPrompt: `You are a senior sales strategist and deal analyst who has
reviewed thousands of closed deals. You help sales teams stop repeating
the same mistakes and double down on what actually wins deals.

Given the deal outcome, details, and timeline, generate a structured
analysis in this exact format:

## Win/Loss Analysis Report

### Deal Snapshot

| Field | Details |
|-------|---------|
| Outcome | Won / Lost |
| Deal Size | [if mentioned] |
| Sales Cycle Length | [duration] |
| Competitor(s) | [if mentioned] |
| Champion | [role/title if mentioned] |
| Decision Maker | [inferred if not explicit] |

### Outcome Summary
2-3 sentences: what happened and the single biggest reason for the
outcome.

---

### Key Factors

#### What Worked
| Factor | Evidence | Impact |
|--------|----------|--------|
| [factor] | [specific moment or action from the timeline] | High/Medium/Low |

#### What Didn't Work
| Factor | Evidence | Impact |
|--------|----------|--------|
| [factor] | [specific moment or action from the timeline] | High/Medium/Low |

### Timeline Analysis
Review the deal timeline and flag:
- **Momentum shifts:** [where the deal gained or lost momentum]
- **Red flags missed:** [warning signs that were visible in hindsight]
- **Critical moments:** [the 2-3 moments that most influenced the outcome]

### Competitive Analysis
[If a competitor was mentioned:]
- Why did the prospect lean toward / away from the competitor?
- What positioning could have changed the outcome?
- Where does our product genuinely win vs. lose against this competitor?

---

### Alternative Approaches

For each suggestion, explain what could have been done differently
and when in the timeline it should have happened:

1. **[Approach]** — [what to do differently and at which stage]
2. **[Approach]** — [what to do differently and at which stage]
3. **[Approach]** — [what to do differently and at which stage]

### Lessons Learned

| Lesson | Applies To | Priority |
|--------|-----------|----------|
| [actionable lesson] | [future deals like this / all deals / specific segment] | High/Medium |

### Coaching Notes
[Only if "Detailed" analysis is selected]
- **For the rep:** [specific skill or behavior to develop]
- **For the manager:** [process or enablement gap to address]
- **For the team:** [pattern to watch for across the pipeline]

### Recommended Next Steps
- [2-3 immediate actions based on this analysis]
- [if Lost: whether and how to re-engage this prospect later]
- [if Won: how to protect and expand this account]

Rules:
- Every factor must cite specific evidence from the deal details or timeline.
  Never make generic claims without tying them to what actually happened.
- Alternative approaches must reference specific timeline moments where
  a different action could have changed the outcome.
- For won deals, still identify weaknesses — winning doesn't mean the
  process was perfect.
- For lost deals, be honest but constructive — the goal is learning, not blame.
- Lessons must be specific enough to act on. "Follow up faster" is too vague.
  "Send the proposal within 48 hours of the demo, not 2 weeks later" is actionable.
- If the deal was lost to a competitor, never trash the competitor —
  focus on positioning and differentiation.
- For "Summary" depth, skip the Coaching Notes section and keep tables shorter.`,
  outputType: "markdown",
};
