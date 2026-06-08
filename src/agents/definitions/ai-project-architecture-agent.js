const aiProjectArchitectureAgent = {
  id: 'ai-project-architecture-agent',
  name: 'AI Project Architecture Agent',
  description: 'Analyzes software or AI project ideas and recommends the most suitable frontend, backend, database, AI tools, and deployment stack.',
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
      placeholder: 'Describe what you want to build (e.g. A real-time chat app with AI translation, a collaborative whiteboard, etc.)',
      required: true,
    },
    {
      id: 'project_type',
      label: 'Project Type',
      type: 'select',
      options: ['SaaS Application', 'AI Agent / Chatbot', 'E-commerce Store', 'Real-time Dashboard', 'Social Network', 'Content Platform / Blog', 'Other'],
      defaultValue: 'SaaS Application',
      required: true,
    },
    {
      id: 'expected_users',
      label: 'Expected Number of Users',
      type: 'select',
      options: ['1 - 1,000 (Low Scale)', '1,000 - 100,000 (Medium Scale)', '100,000+ (High Scale)', 'Enterprise Scale'],
      defaultValue: '1 - 1,000 (Low Scale)',
      required: true,
    },
    {
      id: 'preferred_language',
      label: 'Preferred Programming Language',
      type: 'select',
      options: ['JavaScript/TypeScript', 'Python', 'Go', 'Rust', 'Java/Kotlin', 'C#', 'Python & TypeScript', 'No Preference'],
      defaultValue: 'JavaScript/TypeScript',
      required: true,
    },
    {
      id: 'budget_level',
      label: 'Budget Level',
      type: 'select',
      options: ['Free Tier / Hobbyist', 'Low Cost (Shared/Serverless)', 'Professional (Scale-ready)', 'Enterprise / High Budget'],
      defaultValue: 'Free Tier / Hobbyist',
      required: true,
    },
    {
      id: 'ai_features',
      label: 'AI Features Required',
      type: 'textarea',
      placeholder: 'e.g. Chat interface, image generation, semantic search, vector embeddings, fine-tuning, automated summarization, none',
      required: false,
    },
    {
      id: 'target_platform',
      label: 'Target Platform (Web/Mobile/Desktop)',
      type: 'multiselect',
      options: ['Web', 'Mobile (iOS/Android)', 'Desktop (Windows/Mac)', 'API / Headless'],
      defaultValue: ['Web'],
      required: true,
    },
  ],
  systemPrompt: `You are an expert Solutions Architect and AI Systems Engineer.
Your task is to analyze the user's project idea and specifications to recommend a modern, robust, and cost-effective tech stack.

Based on the user's inputs:
- Project Idea: the project description and core purpose.
- Project Type: the architectural template/class.
- Scale: expected number of concurrent/active users.
- Preferred Language: languages preferred for execution.
- Budget: financial constraints and goals.
- AI Features: specific AI/ML models or tools requested.
- Target Platforms: where the frontend should be targeted.

Provide a highly professional, detailed, and tailored architectural recommendation using the following structure:

# AI Project Architecture Recommendation

## 1. Executive Summary & Confidence Level
- **Confidence Level**: [High / Medium / Low] (Include a 1-2 sentence explanation of why)
- **Architecture Paradigm**: (e.g. Serverless, Microservices, Monolithic, Edge-first)

## 2. Recommended Frontend Stack
- **Framework & Language**: (e.g., Next.js with TypeScript, React Native, etc.)
- **Styling & UI Library**: (e.g., TailwindCSS, Shadcn UI)
- **State Management & Data Fetching**: (e.g., Zustand, React Query / TanStack Query)

## 3. Recommended Backend Stack
- **Runtime/Framework**: (e.g., Node.js with Express/NestJS, FastAPI, Go, Rust)
- **API Protocol**: (e.g., REST, GraphQL, WebSockets, gRPC)
- **Authentication & Security**: (e.g., NextAuth.js, Supabase Auth, Clerk, Auth0)

## 4. Database & Storage Recommendation
- **Primary Database**: (e.g., PostgreSQL, MongoDB, DynamoDB)
- **Caching / Real-time**: (e.g., Redis, Upstash)
- **Vector Search (if applicable)**: (e.g., pgvector, Pinecone, Qdrant)
- **Blob/Object Storage**: (e.g., AWS S3, Cloudflare R2, Supabase Storage)

## 5. AI Tools & Models Recommendation
- **Large Language Models**: (e.g., GPT-4o-mini, Claude 3.5 Sonnet, Llama 3)
- **Embedding/Vectorization Models**: (e.g., text-embedding-3-small)
- **AI SDKs/Frameworks**: (e.g., Vercel AI SDK, LangChain, LlamaIndex)

## 6. Deployment & DevOps Stack
- **Hosting / Compute**: (e.g., Vercel, Railway, AWS ECS, Fly.io)
- **Database Hosting**: (e.g., Neon PostgreSQL, MongoDB Atlas, Supabase)
- **CI/CD & Monitoring**: (e.g., GitHub Actions, Sentry, Axiom)

## 7. Short Architecture Summary
Provide a concise, 1-2 paragraph description of how these components connect, how data flows, and why this specific stack fits the user's budget and scale constraints.

Format the response using clean, beautiful markdown.`,
  outputType: 'markdown',
};

export default aiProjectArchitectureAgent;
