export default {
  id: "health-wellness-plan-generator",
  createdAt: "2026-05-15",
  name: "Health & Wellness Plan Generator",
  description:
    "Create a practical 4-week wellness plan with diet guidelines, exercise recommendations, and sleep targets from a person's goals and lifestyle.",
  category: "Healthcare",
  icon: "HeartPulse",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    age: "32",
    weight: "78 kg",
    healthGoals: "Lose 5 kg gradually while improving energy and stamina",
    dietaryRestrictions: "Vegetarian, lactose sensitive, no peanuts",
    activityLevel: "Lightly active, walks 20 minutes three times per week",
  },
  inputs: [
    {
      id: "age",
      label: "Age",
      type: "text",
      placeholder: "e.g. 32",
      required: true,
    },
    {
      id: "weight",
      label: "Current weight",
      type: "text",
      placeholder: "e.g. 78 kg or 172 lb",
      required: true,
    },
    {
      id: "healthGoals",
      label: "Health goals",
      type: "textarea",
      placeholder:
        "e.g. Lose 5 kg, build stamina, improve sleep, reduce sugar cravings",
      required: true,
    },
    {
      id: "dietaryRestrictions",
      label: "Dietary restrictions or allergies",
      type: "textarea",
      placeholder: "e.g. Vegetarian, gluten-free, peanut allergy, no seafood",
    },
    {
      id: "activityLevel",
      label: "Current activity level",
      type: "textarea",
      placeholder:
        "e.g. Sedentary desk job, walks twice a week, beginner at exercise",
      required: true,
    },
  ],
  systemPrompt: `You create practical, beginner-friendly wellness plans from the user's age, weight, goals, dietary restrictions, and activity level.

Output in this exact format:

## 4-Week Wellness Plan

**Profile summary:** [summarize the supplied age, weight, goals, restrictions, and activity level]
**Important note:** This is general wellness guidance, not medical advice. The user should consult a qualified professional before starting a new diet or exercise plan, especially if they have medical conditions, injuries, pregnancy, or eating disorder history.

---

### Week 1 — Build the baseline
- **Diet guidelines:** [3-5 practical bullets that respect restrictions and avoid extreme calorie advice]
- **Exercise plan:** [safe beginner schedule based on current activity]
- **Sleep target:** [specific nightly target and one habit]
- **Focus metric:** [one simple behavior to track]

### Week 2 — Add consistency
- **Diet guidelines:** [3-5 bullets]
- **Exercise plan:** [progress slightly from week 1]
- **Sleep target:** [specific nightly target and one habit]
- **Focus metric:** [one simple behavior to track]

### Week 3 — Increase challenge carefully
- **Diet guidelines:** [3-5 bullets]
- **Exercise plan:** [progress safely without overtraining]
- **Sleep target:** [specific nightly target and one habit]
- **Focus metric:** [one simple behavior to track]

### Week 4 — Review and maintain
- **Diet guidelines:** [3-5 bullets]
- **Exercise plan:** [sustainable routine for the next month]
- **Sleep target:** [specific nightly target and one habit]
- **Focus metric:** [one simple behavior to track]

---

## Safety checks
- List warning signs that mean the user should stop exercising and seek professional guidance.
- Mention that rapid weight loss, very low-calorie diets, and supplement claims should be avoided unless supervised.

Rules:
- Do not diagnose, prescribe medication, or claim guaranteed weight loss.
- Do not suggest extreme restriction, detoxes, or unsafe exercise intensity.
- If dietary restrictions are missing, ask the user to confirm allergies before following the plan.
- Keep the plan realistic for the user's current activity level and goals.`,
  outputType: "markdown",
};
