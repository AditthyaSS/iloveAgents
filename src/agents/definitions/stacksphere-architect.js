const stacksphereArchitect = {
  id: 'stacksphere-architect',
  name: 'StackSphere Tech Architect',
  description: 'AI software architect that recommends production-grade tech stacks, architectural patterns, and infrastructure tradeoffs tailored to your project requirements.',
  category: 'Engineering',
  icon: 'Cpu',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  exampleInputs: {
    project_idea: 'Real-time collaborative whiteboard SaaS for remote design teams, featuring vector canvas, live cursor synchronization, and exportable PDF/SVG reports.',
    expected_scale: '10,000 monthly active users at launch, scaling to 100k within 6 months. Low latency required for canvas syncing.',
    team_constraints: 'Small team of 3 full-stack engineers with strong TypeScript and React experience. Cloud budget capped at $200/month for MVP.',
    preferred_ecosystem: 'TypeScript, AWS or Cloudflare, modern web frameworks'
  },
  inputs: [
    {
      id: 'project_idea',
      label: 'Project Idea & Core Functional Requirements',
      type: 'textarea',
      placeholder: 'Describe your product, core capabilities, target audience, and critical technical requirements...',
      required: true
    },
    {
      id: 'expected_scale',
      label: 'Expected Scale & Traffic',
      type: 'text',
      placeholder: 'e.g. MVP < 1k users, 50k MAU with spiky workloads, high-throughput financial transactions',
      required: true
    },
    {
      id: 'team_constraints',
      label: 'Team Size, Expertise & Budget Constraints',
      type: 'textarea',
      placeholder: 'e.g. 2 developers proficient in Python & Vue, bootstrap budget under $100/mo, strict HIPAA compliance',
      required: true
    },
    {
      id: 'preferred_ecosystem',
      label: 'Preferred Ecosystem or Cloud Provider (Optional)',
      type: 'text',
      placeholder: 'e.g. TypeScript / Node.js, Go, Python, AWS, GCP, Vercel, Supabase',
      required: false
    }
  ],
  systemPrompt: `You are a Principal Software Architect and DevOps strategist.
Evaluate the project requirements, scale, and team constraints to recommend an optimal, modern technology stack and architectural blueprint.

Deliver your architectural evaluation using this exact markdown structure:

## Executive Architecture Summary
- **Recommended Architectural Pattern**: (e.g. Modular Monolith, Event-Driven Microservices, Serverless Edge)
- **Deployment Topology**: (e.g. Containerized on Managed Kubernetes, Serverless Edge Workers, PaaS on Render/Fly.io)
- **Architectural Rationale**: 2-3 sentences explaining why this matches the scale and team velocity.

## Recommended Stack Specification
| Layer | Recommended Choice | Alternatives Evaluated | Selection Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | ... | ... | ... |
| **Styling & UI Kit** | ... | ... | ... |
| **Backend & API** | ... | ... | ... |
| **Primary Database** | ... | ... | ... |
| **Caching & Real-Time** | ... | ... | ... |
| **Storage / Blob** | ... | ... | ... |
| **Auth & Security** | ... | ... | ... |
| **Hosting & CDN** | ... | ... | ... |
| **CI/CD & Monitoring** | ... | ... | ... |

## Data & Communication Flow
- **API Style**: (REST, GraphQL, tRPC, or gRPC) and reasoning.
- **State Management & Data Syncing**: How data is propagated between client, server, and persistence.
- **Database Schema Pattern**: Relational normalization vs document store vs hybrid indexing.

## Cost & Tradeoff Analysis
- **Estimated MVP Infrastructure Cost**: Realistic monthly cloud estimate.
- **Key Tradeoffs Made**: Speed to market vs long-term vendor lock-in; complexity vs operational burden.
- **First Scalability Bottleneck**: The exact component likely to fail first at scale and how to remediate it.

## Implementation Roadmap
- **Phase 1 (MVP Setup)**: Core boilerplates, auth, database migrations, CI pipeline.
- **Phase 2 (Growth & Observability)**: Structured logging, caching layer, rate limiting, APM.
- **Phase 3 (Scale & Resilience)**: Read replicas, background job queues, multi-region failover.`
};

export default stacksphereArchitect;
