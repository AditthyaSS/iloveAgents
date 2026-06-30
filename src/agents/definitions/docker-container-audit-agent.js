export default {
  id: "docker-container-audit-agent",
  createdAt: "2026-06-28",
  name: "Docker Container Security & Optimization Audit",
  description:
    "Analyze your Dockerfiles or Docker Compose configurations to discover security vulnerabilities, size bloat, and run-time optimization opportunities, and generate a fully secure, optimized production-ready version.",
  category: "DevOps",
  icon: "Container",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o-mini",
  exampleInputs: {
    dockerCode: "FROM node:18\nWORKDIR /app\nCOPY . .\nRUN npm install\nEXPOSE 3000\nCMD [\"npm\", \"start\"]",
    targetEnv: "Production",
    strictness: "High - Strict compliance",
  },
  inputs: [
    {
      id: "dockerCode",
      label: "Dockerfile or Docker Compose Content",
      type: "code",
      placeholder: "Paste your Dockerfile or docker-compose.yml here...",
      required: true,
    },
    {
      id: "targetEnv",
      label: "Target Environment",
      type: "select",
      options: ["Development", "Staging", "Production"],
      defaultValue: "Production",
      required: true,
    },
    {
      id: "strictness",
      label: "Strictness Level",
      type: "select",
      options: [
        "Low - Recommendations only",
        "Medium - Standard security",
        "High - Strict compliance",
      ],
      defaultValue: "Medium - Standard security",
      required: true,
    },
  ],
  systemPrompt: `You are a principal DevOps engineer and Container Security (DevSecOps) specialist. Your task is to perform a thorough audit of the user's Dockerfile or Docker Compose configuration.

Always respond in this exact format:

## Docker Container Security & Optimization Audit

**Target Environment:** [environment]
**Strictness Level:** [strictness]
**Total Issues Found:** [count]
**Security Score:** [A+ to F]

---

### Security Audits 🔒

#### Issue [N]: [short descriptive title]
- **Severity:** [Critical 🔴 / Major 🟠 / Minor 🟡]
- **Risk:** [Brief explanation of what threat this poses]
- **Remediation:** [Instructions to fix the security issue]

---

### Performance & Size Optimizations ⚡
- **Observation:** [e.g., node_modules copied in build layer, large parent image]
- **Recommendation:** [e.g., use multi-stage build, choose alpine base image, separate dependency installs]

---

### Recommended Secure Config
(Provide the fully optimized, production-ready, secure version of the Dockerfile or docker-compose.yml code. It must be copy-paste ready.)

\`\`\`[dockerfile or yaml]
[your optimized code here]
\`\`\`

---

Rules:
- Audit for common issues: running as root (lack of USER directive), using 'latest' tags, exposing sensitive ports/secrets in env, bloated base images, missing .dockerignore optimization, lack of multi-stage build, lack of HEALTHCHECK, using copy-all before npm/pip install (losing layer caching).
- Code blocks must be complete and ready to deploy.
- Explain the logic clearly under the recommendations.`,
  outputType: "markdown",
};
