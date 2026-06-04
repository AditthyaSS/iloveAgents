export default {
  id: "future-self-letter-agent",
  createdAt: "2026-05-22",
  name: "Future Self Letter Agent",
  description:
    "Based on your current habits and goals, writes a brutally honest letter from your future self.",
  category: "Productivity",
  icon: "MailWarning",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    currentAge: "21",
    futureHorizon: "10 years",
    currentSituation:
      "Final-year student who wants to become a software engineer but keeps procrastinating.",
    dailyHabits:
      "Sleeps late, studies inconsistently, spends too much time on social media, rarely exercises.",
    goals:
      "Get a good developer job, build discipline, stay healthy, and launch a side project.",
    actualBehavior:
      "Makes plans but delays action, starts learning and then drops it, avoids difficult tasks.",
    fearsAndExcuses:
      "Afraid of failing, says there is never enough time, waits for motivation to show up.",
    currentRoutine:
      "Wake up late, scroll phone, attend classes, study at night, sleep around 2 AM.",
  },
  inputs: [
    {
      id: "currentAge",
      label: "Your current age",
      type: "text",
      placeholder: "e.g. 21",
      required: true,
    },
    {
      id: "futureHorizon",
      label: "How far in the future should the letter come from?",
      type: "select",
      options: ["5 years", "7 years", "10 years", "15 years"],
      defaultValue: "10 years",
      required: true,
    },
    {
      id: "currentSituation",
      label: "Where you are right now",
      type: "textarea",
      placeholder:
        "Describe your current life, studies, work situation, and what feels stuck...",
      required: true,
    },
    {
      id: "dailyHabits",
      label: "Your current habits",
      type: "textarea",
      placeholder:
        "Sleep, study, exercise, screen time, eating habits, focus patterns...",
      required: true,
    },
    {
      id: "goals",
      label: "Your goals",
      type: "textarea",
      placeholder:
        "What do you say you want to achieve in the future?",
      required: true,
    },
    {
      id: "actualBehavior",
      label: "What you actually do",
      type: "textarea",
      placeholder:
        "Be honest: what does your real behavior look like day to day?",
      required: true,
    },
    {
      id: "fearsAndExcuses",
      label: "Your fears and excuses",
      type: "textarea",
      placeholder:
        "What are you afraid of? What excuses do you keep telling yourself?",
      required: true,
    },
    {
      id: "currentRoutine",
      label: "Your daily routine",
      type: "textarea",
      placeholder:
        "A rough breakdown of a normal day from wake-up to sleep...",
      required: false,
    },
  ],
  systemPrompt: `You are the user's future self writing back from 10 years in the future.

Write a brutally honest, specific, emotionally sharp letter to the user.

Style rules:
- Sound like the same person, but older, wiser, and no longer making excuses.
- Be direct and unsparing, but do not become cruel, abusive, or demeaning.
- Use vivid specifics from the user's inputs.
- Use "I remember when I used to..." framing where appropriate.
- Make the letter feel personal, realistic, and unforgettable.
- Focus on consequences, regret, missed opportunities, and the exact moment change could have happened.

What the letter must cover:
1. What likely happened if they kept living this way.
2. The exact turning point that could have changed everything.
3. What they will regret most, based on the user's actual inputs.
4. What the future self wishes they had done at this age.
5. A single sentence they need to hear right now.

Output format:

## Future Self Letter

[the full letter]

---

## What makes this letter hit hard
2-4 bullet points explaining the most important truths you reflected back.

## The one sentence to remember
[one short line]

Rules:
- Be highly specific to the user's habits, fears, and goals.
- Do not give generic productivity advice.
- Do not end with a motivational cliché.
- Make it feel like a real letter from someone who lived the consequences of today's choices.
`,
  outputType: "markdown",
};
