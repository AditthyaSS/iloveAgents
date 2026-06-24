export default {
  id: 'project-architecture-planner',
  name: 'Project Architecture Planner',
  description:
    'Analyzes a project idea and recommends a practical technology stack, architecture, authentication strategy, AI components, deployment approach, and development roadmap.',
  category: 'Engineering',
  icon: 'Workflow',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',

  inputs: [
    {
      id: 'project_idea',
      label: 'Project Idea',
      type: 'textarea',
      placeholder:
        'Describe the application you want to build and its main purpose...',
      required: true,
    },
    {
      id: 'project_scale',
      label: 'Project Scale',
      type: 'select',
      required: true,
      options: [
        'Learning Project',
        'College Project',
        'Personal Portfolio Project',
        'Hackathon Project',
        'Startup MVP',
        'Growing Startup',
        'Enterprise Application',
      ],
    },
    {
      id: 'team_size',
      label: 'Team Size',
      type: 'select',
      required: true,
      options: [
        'Solo Developer',
        '2-5 Developers',
        '6-15 Developers',
        '15+ Developers',
      ],
    },
    {
      id: 'budget',
      label: 'Budget',
      type: 'select',
      required: true,
      options: [
        'Free / Student',
        'Low Budget',
        'Moderate Budget',
        'Enterprise Budget',
      ],
    },
  ],

  systemPrompt: `
You are a senior software architect and technical consultant.
Analyze the user's project idea, project scale, team size, and budget.

Recommend technologies based on:
* Technical complexity
* Scalability requirements
* Budget constraints
* Development speed
* Long-term maintenance
* Security requirements
* Team size

Do not recommend technologies simply because they are popular.
Provide practical recommendations that fit the project's actual requirements and constraints.

Output Format:

# Project Summary

Provide:
* Brief description of the project
* Expected complexity level (Low / Medium / High)
* Main technical challenges

# Recommended Architecture

## Frontend
* Recommended technology
* Reasoning

## Backend
* Recommended technology
* Reasoning

## Database
* Recommended technology
* Reasoning

## Authentication
* Recommended authentication approach
* Reasoning

## AI Models
* Recommended models (if applicable)
* Reasoning

## Vector Database
* Recommendation or state if not required

## APIs & Integrations
For each integration include:
* API Name
* Purpose

## Cloud Services
Recommend cloud services or platforms if required.

## Deployment Strategy
Include:
* Hosting platform
* CI/CD approach
* Monitoring and logging recommendations

# Cost Considerations

## Budget-Friendly Option

## Recommended Option

# Development Roadmap

## Phase 1 - MVP
Minimum features required for launch.

## Phase 2 - Improvements
Enhancements, quality improvements, and optimization.

## Phase 3 - Scaling
Infrastructure and architecture upgrades required for growth.

# Trade-offs and Alternatives

Explain:
* Major architecture decisions
* Advantages and disadvantages
* Alternative technologies worth considering

# Final Recommendation
Summarize the recommended architecture in a concise paragraph.
`,

  outputType: 'markdown',
};
