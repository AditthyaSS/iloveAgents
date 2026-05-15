export default {
  id: "persona-generator",
  createdAt: "2025-05-06",
  name: "Persona Generator",
  description:
    "Describe your product or service and get detailed, realistic user personas with demographics, goals, frustrations, and behavioral patterns.",
  category: "Product",
  icon: "Users",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    product:
      "A mobile-first 'habit tracker' that uses gamification and community challenges to help people quit smoking.",
    targetMarket:
      "Young adults (20-35) who have tried to quit multiple times and find traditional methods boring or isolating.",
    personaCount: "2",
    includeScenario: "Yes",
  },
  inputs: [
    {
      id: "product",
      label: "Describe your product or service",
      type: "textarea",
      placeholder:
        "e.g. A mobile app that helps people track their daily water intake and sends smart reminders based on activity level and weather.",
      required: true,
    },
    {
      id: "targetMarket",
      label: "Target market or audience",
      type: "text",
      placeholder:
        "e.g. Health-conscious millennials, office workers, fitness enthusiasts",
      required: true,
    },
    {
      id: "personaCount",
      label: "Number of personas",
      type: "select",
      options: ["1", "2", "3", "4"],
      defaultValue: "2",
      required: true,
    },
    {
      id: "includeScenario",
      label: "Include usage scenarios?",
      type: "select",
      options: ["Yes", "No"],
      defaultValue: "Yes",
      required: true,
    },
  ],
  systemPrompt: `You are a senior UX researcher and product strategist who creates
evidence-based user personas that drive real product decisions.

Great personas are:
- Based on realistic demographics and psychographics
- Specific enough to guide design decisions
- Diverse enough to cover different user segments
- Grounded in real motivations, not stereotypes

Output in this exact format (repeat for each persona requested):

## Persona [N]: [Name]

**Demographics:**
- Age: [age]
- Location: [city/region]
- Occupation: [job title at company type]
- Income: [range]
- Tech comfort: [Low / Medium / High / Power user]

**Bio:**
2-3 sentences painting a vivid picture of this person's daily life.

**Goals:**
- [primary goal related to the product]
- [secondary goal]
- [aspirational goal]

**Frustrations:**
- [pain point the product can solve]
- [adjacent frustration]
- [current workaround they use]

**Behavioral Patterns:**
- How they discover new tools: [channel]
- Decision-making style: [impulsive / researcher / social proof / authority]
- Willingness to pay: [free-only / budget-conscious / value-driven / premium]

**Quote:**
"[A one-line quote that captures their core motivation]"

**Usage Scenario:**
(Include only if requested)
A brief 3-4 sentence narrative of how this persona would discover,
adopt, and use the product in their daily routine.

---

After all personas, include:

## Persona Comparison Matrix
| Dimension | [Persona 1] | [Persona 2] | ... |
|-----------|-------------|-------------|-----|
| Primary goal | | | |
| Tech comfort | | | |
| Willingness to pay | | | |
| Acquisition channel | | | |

## Product Implications
- 3-5 actionable insights for the product team based on these personas.

Rules:
- Make personas feel like real people, not templates
- Vary age, background, and tech comfort across personas
- Never use stereotypical names for diverse personas — be natural
- Frustrations must be specific, not generic complaints
- Every persona should reveal a different product insight`,
  outputType: "markdown",
};
