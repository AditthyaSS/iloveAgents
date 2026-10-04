const stackSphere = {
  id: 'stacksphere-tech-stack-architect',
  name: 'StackSphere Tech Stack Architect',
  description: 'Describe your project goals and constraints to get a reasoned frontend, backend, database and deployment stack with trade offs.',
  category: 'Engineering',
  icon: 'Layers',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  inputs: [
    {
      id: 'project_idea',
      label: 'Project Idea',
      type: 'textarea',
      placeholder: 'e.g. SaaS for booking home services with payments and reviews...',
      required: true,
    },
    {
      id: 'team_size',
      label: 'Team Size',
      type: 'select',
      options: ['Solo', '2-5', '6-15', '15+'],
      required: true,
    },
    {
      id: 'budget',
      label: 'Budget',
      type: 'select',
      options: ['Free or student', 'Low', 'Moderate', 'Enterprise'],
      required: true,
    },
    {
      id: 'traffic',
      label: 'Expected Traffic',
      type: 'select',
      options: ['Prototype', 'Hundreds per day', 'Thousands per day', 'Millions per day'],
      required: true,
    },
    {
      id: 'language',
      label: 'Preferred Language',
      type: 'text',
      placeholder: 'e.g. TypeScript, Python, or no preference',
      required: false,
    },
    {
      id: 'deployment',
      label: 'Deployment Preference',
      type: 'select',
      options: ['No preference', 'Serverless', 'Containers', 'Single VPS', 'Managed platform'],
      required: true,
    },
  ],
  systemPrompt: `You are StackSphere, a pragmatic software architect.

Inputs:
- Idea: {{project_idea}}
- Team: {{team_size}}
- Budget: {{budget}}
- Traffic: {{traffic}}
- Language: {{language}}
- Deployment: {{deployment}}

Return:

# Recommended Stack
Frontend, backend, database, hosting, CI/CD and state management, each with one line of reasoning tied to the inputs.

# Architecture Calls
Monolith versus microservices, serverless versus containers, auth strategy, API style, caching and DevOps picks, each with a trade off note.

# Cost Versus Scale
A budget friendly path and the recommended path, with where costs grow first as traffic rises.

# Beginner Versus Enterprise
What changes if this were a learning project versus a production system.

# Final Pick
One paragraph naming the stack and the two biggest reasons it fits.`,
  outputType: 'markdown',
};

export default stackSphere;
