import { HeartPulse } from 'lucide-react';
const pcosLifestylePlanner = {
  id: 'pcos-lifestyle-planner',
  name: 'PCOS Lifestyle Planner',
  description:
    'Creates a personalized 4-week lifestyle plan for managing PCOS with nutrition, exercise, sleep, and healthy habits.',
  category: 'Healthcare',
  icon: 'HeartPulse',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',

  inputs: [
    {
      id: 'pcos_age',
      label: 'Age',
      type: 'text',
      placeholder: 'e.g. 24',
      required: true,
    },
    {
      id: 'pcos_height',
      label: 'Height',
      type: 'text',
      placeholder: 'e.g. 165 cm',
      required: true,
    },
    {
     id: 'pcos_weight',
      label: 'Weight',
      type: 'text',
      placeholder: 'e.g. 70 kg',
      required: true,
    },
    {
      id: 'pcos_goal',
      label: 'Primary Goal',
      type: 'select',
      options: [
        'Weight Management',
        'Improve Insulin Sensitivity',
        'Manage Symptoms',
        'Improve Fitness',
        'General Wellness',
      ],
      required: true,
    },
    {
      id: 'pcos_activity_level',
      label: 'Activity Level',
      type: 'select',
      options: [
        'Sedentary',
        'Lightly Active',
        'Moderately Active',
        'Very Active',
      ],
      required: true,
    },
    {
      id: 'pcos_dietary_preferences',
      label: 'Dietary Preferences',
      type: 'multiselect',
      options: [
        'Vegetarian',
        'Vegan',
        'Gluten-Free',
        'Dairy-Free',
        'No Preference',
      ],
      required: false,
    },
    {
      id: 'pcos_symptoms',
      label: 'Current Symptoms',
      type: 'textarea',
      placeholder:
        'e.g. irregular periods, acne, weight gain, fatigue',
      required: false,
    },
  ],

  systemPrompt: `You are an evidence-informed women's wellness assistant.

Create a personalized 4-week PCOS lifestyle plan.

Return the answer in Markdown using the following structure:

# PCOS Lifestyle Plan

## Health Summary
- Brief overview
- Key lifestyle priorities

## Week 1
- Nutrition goals
- Exercise plan
- Sleep target
- Hydration goal

## Week 2
- Nutrition goals
- Exercise plan
- Sleep target
- Hydration goal
- Progressive improvements

## Week 3
- Nutrition goals
- Exercise plan
- Sleep target
- Hydration goal
- Healthy habit reinforcement

## Week 4
- Nutrition goals
- Exercise plan
- Sleep target
- Hydration goal
- Long-term maintenance strategy

## Foods to Include

## Foods to Limit

## Stress Management

## Progress Checklist

## Important Disclaimer

Clearly explain that this plan is educational only and does not replace advice from a qualified healthcare professional. Recommend consulting a doctor or registered dietitian before making significant diet or exercise changes.`,

  outputType: 'markdown',
};

export default pcosLifestylePlanner;