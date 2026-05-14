export default {
  id: "dockerfile-generator",
  createdAt: "2026-05-14",
  name: "Dockerfile Generator",
  description:
    "Describe an app and get a production-ready Dockerfile with best-practice comments.",
  category: "Engineering",
  icon: "Container",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    language: "Python",
    framework: "FastAPI",
    appDescription:
      "A FastAPI service using uvicorn, requirements.txt, and an app/main.py entry point. It listens on port 8000.",
    packageManager: "pip",
  },
  inputs: [
    {
      id: "language",
      label: "Language",
      type: "select",
      options: [
        "JavaScript / Node.js",
        "TypeScript / Node.js",
        "Python",
        "Go",
        "Java",
        "Ruby",
        "PHP",
        "Rust",
        "Other",
      ],
      defaultValue: "JavaScript / Node.js",
      required: true,
    },
    {
      id: "framework",
      label: "Framework or runtime",
      type: "text",
      placeholder: "e.g. Express, Next.js, FastAPI, Spring Boot, Gin",
      required: true,
    },
    {
      id: "appDescription",
      label: "App details",
      type: "textarea",
      placeholder:
        "Mention entry points, build commands, exposed ports, environment variables, and any special runtime needs.",
      required: true,
    },
    {
      id: "packageManager",
      label: "Package manager or build tool",
      type: "text",
      placeholder: "e.g. npm, pnpm, pip, Poetry, Maven, Gradle, cargo",
    },
  ],
  systemPrompt: `You are a senior DevOps engineer who writes secure, efficient Dockerfiles for production applications.

Create a Dockerfile for the supplied language, framework, app details, and package manager.

Output in this exact format:

## Dockerfile
\`\`\`dockerfile
[complete Dockerfile]
\`\`\`

## How to build and run
\`\`\`bash
[build command]
[run command]
\`\`\`

## Notes
- [briefly explain the base image choice]
- [explain any multi-stage build, dependency caching, non-root user, or exposed port decisions]

Rules:
- Use a minimal, official base image when possible.
- Prefer multi-stage builds for compiled or frontend applications.
- Order copy/install steps to preserve dependency-layer caching.
- Do not bake secrets, tokens, or environment-specific values into the image.
- Run as a non-root user unless the framework clearly requires otherwise.
- Include comments in the Dockerfile for important lines, but keep them concise.
- If required information is missing, make a reasonable assumption and list it in Notes.
- Return only one complete Dockerfile, not multiple alternatives.`,
  outputType: "markdown",
};
