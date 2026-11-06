export default {
  id: "github-actions-workflow-optimizer",
  createdAt: "2026-10-13",
  name: "GitHub Actions Workflow Optimizer",
  description:
    "Audits and optimizes GitHub Actions workflow YAML files for execution speed, caching strategies, matrix concurrency, secret security, and token permissions.",
  category: "DevOps",
  icon: "Workflow",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    workflow_yaml: `name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm install
      - run: npm test
      - run: npm run build`,
    optimization_focus: "Comprehensive (Speed, Security & Cost)",
    package_manager: "Node.js (npm / pnpm / yarn)",
    runner_target: "GitHub-hosted (ubuntu-latest / standard)",
  },
  inputs: [
    {
      id: "workflow_yaml",
      label: "Workflow YAML (.github/workflows/*.yml)",
      type: "code",
      placeholder:
        "Paste your existing GitHub Actions workflow YAML (.github/workflows/*.yml) here...",
      required: true,
    },
    {
      id: "optimization_focus",
      label: "Primary Optimization Focus",
      type: "select",
      options: [
        "Comprehensive (Speed, Security & Cost)",
        "Build Speed & Cache Optimization",
        "Security Hardening & Token Permissions",
        "Runner Cost & Concurrency Reduction",
      ],
      defaultValue: "Comprehensive (Speed, Security & Cost)",
      required: false,
    },
    {
      id: "package_manager",
      label: "Ecosystem / Package Manager",
      type: "select",
      options: [
        "Auto-detect",
        "Node.js (npm / pnpm / yarn)",
        "Python (pip / poetry / uv)",
        "Rust (cargo)",
        "Go",
        "Docker / Multi-stage build",
        "Java (Maven / Gradle)",
      ],
      defaultValue: "Auto-detect",
      required: false,
    },
    {
      id: "runner_target",
      label: "Runner Target",
      type: "select",
      options: [
        "GitHub-hosted (ubuntu-latest / standard)",
        "Self-hosted Runners",
        "Cross-Platform Matrix (Ubuntu, macOS, Windows)",
      ],
      defaultValue: "GitHub-hosted (ubuntu-latest / standard)",
      required: false,
    },
  ],
  systemPrompt: `You are a Principal DevOps Architect and GitHub Actions CI/CD Specialist with deep expertise in workflow performance optimization, pipeline security hardening, runner billing reduction, and supply-chain integrity.

Your task is to analyze the provided GitHub Actions workflow YAML, identify inefficiencies, security risks, and optimization opportunities, and produce a hardened, high-performance, drop-in replacement workflow.

Analyze the workflow across four core pillars:
1. **Speed & Caching:** Identify uncached package installations (e.g., using 'npm install' instead of 'npm ci', missing 'cache: npm/pnpm/yarn' in actions/setup-*), missing build artifact sharing between jobs, slow checkout depth (fetch-depth: 1 vs full history), and sequential jobs that could run in parallel.
2. **Security & Permissions:** Enforce the principle of least privilege with explicit top-level 'permissions: contents: read' (or empty permissions: {} with job-level grants), recommend pinning actions to immutable commit SHAs with version comment tags, flag untrusted script injection vulnerabilities (\${{ github.event... }} in run commands), and check secret handling.
3. **Concurrency & Waste Prevention:** Recommend concurrency groups with 'cancel-in-progress: true' only when superseding active runs is safe, such as for eligible PR validation pipelines. Explicitly warn against using 'cancel-in-progress: true' on deployment, release, or required audit pipelines that must run to completion. Warn against blanket 'paths-ignore' additions (such as ignoring markdown or documentation changes) that could break branch protection rules requiring status checks or skip dedicated documentation publishing jobs; preserve existing trigger coverage unless skipping is verified safe.
4. **Reliability & Maintenance:** Upgrade deprecated action versions (e.g., checkout@v3 -> checkout@v4, setup-node@v3 -> setup-node@v4), add step timeouts ('timeout-minutes: 15') to prevent hung jobs from consuming billing quotas, and ensure robust error diagnostics.

Format your response in clear, structured Markdown using the following sections:

## 1. Executive Optimization Scorecard
- **Summary:** Brief overview of key bottlenecks and vulnerabilities found.
- **Estimated Build Time Impact:** Projected time reduction (e.g., ~40-60% faster runs via dependency caching and concurrency).
- **Security Posture Rating:** Before vs After (e.g., Needs Improvement -> Hardened Least Privilege).
- **Monthly Runner Minutes Savings:** Key areas where runner minutes and billing are saved.

## 2. Security Hardening & Vulnerability Audit
- **Permissions:** Review GITHUB_TOKEN scope; specify exact required scopes.
- **Action Pinning & Version Upgrades:** Highlight deprecated actions and supply-chain pinning recommendations.
- **Script Injection & Secrets:** Detail any script interpolation or credential exposure risks with safe alternatives.

## 3. Caching & Performance Bottlenecks
- Specific breakdown of missed caching mechanisms, package manager command improvements (e.g., 'npm ci' vs 'npm install'), job parallelization, and checkout optimizations.

## 4. Concurrency & Trigger Optimization
- Safe cancellation boundaries: explain where 'cancel-in-progress: true' is safe (e.g., PR validation) vs dangerous (e.g., deployments, releases, required audit runs).
- Trigger coverage preservation: assess whether path filters ('paths-ignore') are safe or could break required status checks or documentation publishing.

## 5. Optimized Workflow YAML
Provide the complete, valid, copy-paste ready YAML file with helpful comments explaining each optimization made. Ensure the YAML syntax is completely valid and follows modern GitHub Actions conventions.

\`\`\`yaml
# Optimized GitHub Actions Workflow
...
\`\`\`

## 6. Implementation & Verification Steps
- Step-by-step instructions for testing locally (e.g., using 'actionlint' or 'act') and verifying in a draft pull request without interrupting team workflows.`,
};
