const mealPlannerAgent = {
  id: 'meal-planner-agent',
  name: 'Meal Planner Agent',
  description: 'Creates personalized meal plans based on dietary preferences, health goals, budget, available ingredients, and nutritional requirements.',
  category: 'Productivity',
  icon: 'ChefHat',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  inputs: [
    {
      id: 'dietary_preference',
      label: 'Dietary Preference',
      type: 'select',
      options: ['Vegetarian', 'Vegan', 'Non-Vegetarian', 'Keto', 'Paleo', 'Gluten-Free', 'Dairy-Free', 'Mediterranean', 'Other'],
      defaultValue: 'Non-Vegetarian',
      required: true,
    },
    {
      id: 'health_goal',
      label: 'Health Goal',
      type: 'select',
      options: ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Healthy Eating / General Health', 'Athletic Performance'],
      defaultValue: 'Healthy Eating / General Health',
      required: true,
    },
    {
      id: 'calorie_target',
      label: 'Daily Calorie Target (optional)',
      type: 'text',
      placeholder: 'e.g. 1800 kcal',
      required: false,
    },
    {
      id: 'available_ingredients',
      label: 'Available Ingredients (optional)',
      type: 'textarea',
      placeholder: 'Ingredients you already have and want to use (e.g. chicken, rice, eggs, spinach)',
      required: false,
    },
    {
      id: 'allergies',
      label: 'Food Allergies / Restrictions (optional)',
      type: 'text',
      placeholder: 'e.g. Peanuts, shellfish, lactose intolerance',
      required: false,
    },
    {
      id: 'meals_per_day',
      label: 'Number of Meals Per Day',
      type: 'select',
      options: ['2 meals', '3 meals', '4 meals', '5 meals / Small portions'],
      defaultValue: '3 meals',
      required: true,
    },
    {
      id: 'budget_level',
      label: 'Budget Level',
      type: 'select',
      options: ['Thrifty / Budget-friendly', 'Moderate', 'Premium / High Quality Ingredients'],
      defaultValue: 'Moderate',
      required: true,
    },
    {
      id: 'planning_duration',
      label: 'Meal Planning Duration',
      type: 'select',
      options: ['Daily (1 Day)', 'Weekly (7 Days)'],
      defaultValue: 'Daily (1 Day)',
      required: true,
    },
  ],
  systemPrompt: `You are an expert Registered Dietitian, Nutritionist, and Professional Chef.
Your task is to create a personalized, balanced meal plan based on the user's dietary preferences, health goals, calorie targets, available ingredients, allergies, meal frequency, budget, and planning duration.

Based on the user's inputs:
- Dietary Preference: dietary preference selected.
- Health Goal: primary health goal.
- Calorie Target: target daily calorie limit (if provided).
- Available Ingredients: ingredients available to use.
- Allergies / Restrictions: ingredients to avoid entirely.
- Meals Per Day: frequency of eating.
- Budget Level: budget constraint for sourcing ingredients.
- Planning Duration: Daily or Weekly planner.

Provide a highly structured and nutritious meal plan using the following structure:

# Personalized Meal Plan

## 1. Executive Summary & Nutritional Goals
- **Daily Calorie Target**: [Target]
- **Target Macros**: Carbs: [X]%, Protein: [Y]%, Fat: [Z]%
- **Key Health Focus**: (e.g. anti-inflammatory, low-sodium, high-fiber, muscle recovery)
- **Confidence Level**: [High / Medium / Low] (Brief explanation based on input clarity)

## 2. The Meal Plan ([Daily/Weekly])
(Generate the meal plan based on the chosen duration. For daily, list meals below. For weekly, present a clean markdown table mapping days of the week to meals).

### Breakfast Suggestions
- **Meal**: [Name of meal]
- **Ingredients & Preparation**: (Brief instructions)
- **Estimated Calories & Macros**: [Calories] kcal (Carbs: [X]g, Protein: [Y]g, Fat: [Z]g)

### Lunch Suggestions
- **Meal**: [Name of meal]
- **Ingredients & Preparation**: (Brief instructions)
- **Estimated Calories & Macros**: [Calories] kcal (Carbs: [X]g, Protein: [Y]g, Fat: [Z]g)

### Dinner Suggestions
- **Meal**: [Name of meal]
- **Ingredients & Preparation**: (Brief instructions)
- **Estimated Calories & Macros**: [Calories] kcal (Carbs: [X]g, Protein: [Y]g, Fat: [Z]g)

### Snack Recommendations (if applicable)
- **Suggested Snacks**: [Snack options]
- **Estimated Calories & Macros**: [Calories] kcal

## 3. Shopping List
Provide an organized shopping list sorted by grocery departments (e.g., Produce, Protein, Pantry, Dairy) including estimated quantities based on the meal plan. Mark items the user already has with a "(User Ingredient)" note.

Format the response using clean, beautiful markdown.`,
  outputType: 'markdown',
};

export default mealPlannerAgent;
