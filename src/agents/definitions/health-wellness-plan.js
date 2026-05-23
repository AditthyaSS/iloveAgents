const healthWellnessPlan = {
  id: 'health-wellness-plan',
  name: 'Health & Wellness Plan Generator',
  description: 'Generates a personalized 4-week wellness plan with diet, exercise, and sleep guidance based on your goals.',
  category: 'Healthcare',
  icon: 'HeartPulse',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  inputs: [
    {
      id: 'age',
      label: 'Age',
      type: 'text',
      placeholder: 'e.g. 28',
      required: true,
    },
    {
      id: 'weight',
      label: 'Current Weight',
      type: 'text',
      placeholder: 'e.g. 75 kg or 165 lbs',
      required: true,
    },
    {
      id: 'goal',
      label: 'Health Goal',
      type: 'select',
      options: ['Lose weight', 'Build muscle', 'Improve fitness', 'Reduce stress & improve sleep', 'General wellness'],
      required: true,
    },
    {
      id: 'activity_level',
      label: 'Current Activity Level',
      type: 'select',
      options: ['Sedentary (desk job, little exercise)', 'Lightly active (1–2 days/week)', 'Moderately active (3–4 days/week)', 'Very active (5+ days/week)'],
      required: true,
    },
    {
      id: 'dietary_restrictions',
      label: 'Dietary Restrictions',
      type: 'multiselect',
      options: ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut allergy', 'None'],
      required: false,
    },
    {
      id: 'additional_notes',
      label: 'Anything else? (injuries, preferences, lifestyle)',
      type: 'textarea',
      placeholder: 'e.g. bad knees, work night shifts, prefer home workouts...',
      required: false,
    },
  ],
  systemPrompt: `You are a certified wellness coach and nutritionist. 
The user will provide their age, weight, health goal, activity level, dietary restrictions, and any extra notes.

Generate a structured 4-week Health & Wellness Plan with the following sections:

## Overview
A short (3–4 sentence) summary of the plan and what the user can realistically expect after 4 weeks.

## Diet Guidelines
- Daily calorie target (approximate)
- Macros guidance (protein / carbs / fats split)
- Foods to prioritize
- Foods to limit or avoid
- 3 sample meal ideas (breakfast, lunch, dinner) that respect dietary restrictions

## Exercise Recommendations
Provide a weekly workout structure. For each week (Week 1–4), specify:
- Workout days vs rest days
- Type of exercise (cardio, strength, flexibility, etc.)
- Duration and intensity
- Specific exercises or activities

## Sleep Targets
- Recommended hours per night
- 2–3 practical sleep hygiene tips relevant to the user's goal

## Weekly Check-in Milestones
A simple table with one realistic milestone to track per week.

Keep the tone encouraging and practical. Use markdown formatting. Include a brief disclaimer at the end that this does not replace professional medical advice.`,
  outputType: 'markdown',
};

export default healthWellnessPlan;