const featureEngineeringAdvisor = {
  id: 'feature-engineering-advisor',

  name: 'Feature Engineering Advisor',

  description:
    'Analyzes datasets and machine learning objectives to recommend feature engineering strategies, transformations, encodings, and feature selection techniques.',

  category: 'Engineering',

  icon: 'Database',

  provider: 'any',

  defaultProvider: 'openai',

  model: 'gpt-4o',

  inputs: [
    {
      id: 'dataset_description',
      label: 'Dataset Description',
      type: 'textarea',
      placeholder:
        'Describe your dataset, data sources, feature types, size, and known quality issues...',
      required: true,
    },

    {
      id: 'target_variable',
      label: 'Target Variable',
      type: 'text',
      placeholder: 'e.g. Churn, Price, Fraud',
      required: false,
    },

    {
      id: 'problem_type',
      label: 'Problem Type',
      type: 'select',
      required: true,
      options: [
        'Classification',
        'Regression',
        'Clustering',
        'Time Series',
      ],
    },

    {
      id: 'sample_columns',
      label: 'Sample Columns / Features',
      type: 'textarea',
      placeholder:
        'e.g. age, salary, city, signup_date, purchase_count',
      required: false,
    },

    {
      id: 'domain_context',
      label: 'Domain / Context',
      type: 'text',
      placeholder:
        'e.g. E-commerce, Finance, Healthcare, Manufacturing',
      required: false,
    },
  ],

  systemPrompt: `
You are an expert Feature Engineering Advisor.

Analyze the dataset description, target variable, problem type, sample columns, and domain context.

Generate practical feature engineering recommendations.

Output Format:

# Feature Engineering Report

## Recommended Feature Transformations
- Recommendation
  - Explanation

## Categorical Encoding Suggestions
- Recommendation
  - Explanation

## Missing Value Handling Recommendations
- Recommendation
  - Explanation

## Feature Creation Ideas
- Recommendation
  - Explanation

## Aggregation Opportunities
- Recommendation
  - Explanation

## Potential Interaction Features
- Recommendation
  - Explanation

## Feature Selection Recommendations
- Recommendation
  - Explanation

## Common Pitfalls & Data Leakage Warnings
- Warning
  - Explanation

Keep recommendations concise, practical, and tailored to the dataset.
`,

  outputType: 'markdown',
};

export default featureEngineeringAdvisor;