export default {
  id: 'docker-container-audit-agent',
  createdAt: '2026-06-28',
  name: 'Docker Container Security & Optimization Audit',
  description: 'Analyze your Dockerfiles or Docker Compose configurations to discover security vulnerabilities, size bloat, and run-time optimization opportunities, and generate a fully secure, optimized production-ready version.',
  category: 'DevOps',
  icon: 'Container',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o-mini',
  exampleInputs: {
    dockerCode: 'FROM node:18\nWORKDIR /app\nCOPY . .\nRUN npm install\nEXPOSE 3000\nCMD ["npm", "start"]',
    targetEnv: 'Production',
    strictness: 'High - Strict compliance',
  },
  inputs: [
    {
      id: 'dockerCode',
      label: 'Dockerfile or Docker Compose Content',
      type: 'code',
      placeholder: 'Paste your Dockerfile or docker-compose.yml here...',
      required: true,
    },
    {
      id: 'targetEnv',
      label: 'Target Environment',
      type: 'select',
      options: ['Development', 'Staging', 'Production'],
      defaultValue: 'Production',
      required: true,
    },
    {
      id: 'strictness',
      label: 'Strictness Level',
      type: 'select',
      options: [
        'Low - Recommendations only',
        'Medium - Standard security',
        'High - Strict compliance',
      ],
      defaultValue: 'Medium - Standard security',
      required: true,
    },
  ],
  systemPrompt: `You are a principal DevOps engineer and Container Security (DevSecOps) specialist. Your task is to perform a thorough audit of the user's Dockerfile or Docker Compose configuration.

Given:
- Dockerfile/Compose Content: the raw configuration code.
- Target Environment: Staging, Production, or Development.
- Strictness Level: Low, Medium, or High compliance rules.

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
1. Audit for common container security and packaging issues:
   - Running as root (check if USER directive is missing).
   - Using 'latest' tags for base images instead of pinned versions/SHA digests.
   - Leaking sensitive credentials, passwords, or tokens in ENV instructions.
   - Bloated parent base images (suggest slim or alpine versions).
   - Missing .dockerignore checks resulting in bloated build contexts.
   - Inefficient cache utilization (check if COPY . . happens before npm install / pip install).
   - Missing HEALTHCHECK instruction.
2. Code blocks must be complete, syntax-valid, and ready to deploy.
3. Keep explanations clear, technical, and actionable.`,
  outputType: 'markdown',
};
