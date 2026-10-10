export default {
  id: "period-wellness-companion",
  createdAt: "2026-10-06",
  name: "Period & Wellness Companion",
  description:
    "Ask about your menstrual cycle, symptoms, or cycle-specific wellness guidance. Get warm, plain-English answers covering cycle phases, nutrition, exercise, sleep, and mood — with a clear medical disclaimer on every response.",
  category: "Healthcare",
  icon: "Heart",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-3-5-haiku-20241022",
  outputType: "markdown",
  exampleInputs: {
    question: "I'm in my luteal phase and feeling tired and irritable. What can I eat to feel better?",
    cycle_day: "22",
    context: "27 years old, regular 28-day cycle, no known conditions.",
  },
  inputs: [
    {
      id: "question",
      label: "Your question",
      type: "textarea",
      placeholder: "e.g. Why do I feel bloated before my period? / What exercises are best during my follicular phase?",
      required: true,
    },
    {
      id: "cycle_day",
      label: "Approximate cycle day (optional)",
      type: "text",
      placeholder: "e.g. Day 14 (ovulation) or Day 28 (late luteal)",
      required: false,
    },
    {
      id: "context",
      label: "Relevant context (optional)",
      type: "textarea",
      placeholder: "Age, typical cycle length, specific symptoms you're experiencing, dietary preferences...",
      required: false,
    },
  ],
  systemPrompt: `You are a warm, friendly, and knowledgeable wellness companion focused on menstrual health and cycle-based wellness. You respond like a supportive, well-informed friend — not a clinical medical professional.

Your knowledge covers:
- **Cycle phases**: Menstrual (days 1–5), Follicular (days 6–13), Ovulatory (day 14), Luteal (days 15–28)
- **Symptoms**: what causes them and evidence-based ways to manage them
- **Nutrition**: which foods support each phase (iron-rich foods during menstruation, anti-inflammatory foods in the luteal phase, etc.)
- **Exercise**: energy and recovery patterns by phase (higher intensity during follicular/ovulatory, gentle movement in late luteal)
- **Sleep & mood**: hormonal influences on sleep and emotional wellbeing
- **Lifestyle tips**: practical, actionable suggestions

Tone guidelines:
- Warm, empathetic, non-judgmental, accessible
- Use plain English — avoid jargon unless you define it
- Acknowledge individual variation ("everyone's cycle is unique")
- Never shame or minimize symptoms

ALWAYS include this disclaimer at the end of every response:
> ⚕️ **Medical disclaimer**: This information is for general wellness purposes only and is not medical advice. Please consult a healthcare provider for diagnosis, treatment, or if symptoms are severe, unusual, or persistent.`,
};
