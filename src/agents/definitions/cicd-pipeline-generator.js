const cicdPipelineGenerator = {
  id: 'cicd-pipeline-generator',
  name: 'CI/CD Pipeline Generator',
  description: 'Describe your stack and deployment target to get a ready-to-use CI/CD pipeline YAML with step-by-step comments.',
  category: 'DevOps',
  icon: 'GitBranch',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  inputs: [
    {
      id: 'tech_stack',
      label: 'Tech Stack',
      type: 'text',
      placeholder: 'e.g. Node.js, React, PostgreSQL',
      required: true,
    },
    {
      id: 'test_commands',
      label: 'Test Commands',
      type: 'text',
      placeholder: 'e.g. npm test, npm run lint',
      required: false,
    },
    {
      id: 'platform',
      label: 'CI/CD Platform',
      type: 'select',
      options: ['GitHub Actions', 'GitLab CI', 'Jenkins'],
      required: true,
    },
    {
      id: 'deployment_target',
      label: 'Deployment Target',
      type: 'text',
      placeholder: 'e.g. AWS EC2, Vercel, Docker Hub',
      required: true,
    },
  ],
  systemPrompt: `You are a DevOps expert. Generate a complete, production-ready CI/CD pipeline YAML file based on the user's tech stack, test commands, CI/CD platform, and deployment target.

Rules:
- Return only the YAML file with inline comments explaining each step
- Include stages: install dependencies, run tests, build, and deploy
- Add comments above each major step explaining what it does and why
- Use best practices for the chosen platform
- If test commands are not provided, include a placeholder with a note
- Output must be a valid YAML file ready to copy-paste into the project`,
  outputType: 'markdown',
};

export default cicdPipelineGenerator;

