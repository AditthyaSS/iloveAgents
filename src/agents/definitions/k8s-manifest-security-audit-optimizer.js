const k8sManifestSecurityAuditOptimizer = {
  id: 'k8s-manifest-security-audit-optimizer',
  name: 'Kubernetes Manifest Security Audit & Optimizer Agent',
  description: 'Audit Kubernetes YAML configurations for security vulnerabilities, container misconfigurations, and performance bottlenecks, and generate optimized manifests.',
  category: 'DevOps',
  icon: 'ShieldCheck',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  exampleInputs: {
    kubernetesYaml: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  labels:
    app: web-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web-container
        image: nginx:latest
        ports:
        - containerPort: 80
        securityContext:
          privileged: true`,
    targetEnv: 'Production',
    strictness: 'Baseline (Enforce PodSecurityStandards Baseline)',
  },
  inputs: [
    {
      id: 'kubernetesYaml',
      label: 'Kubernetes YAML',
      type: 'textarea',
      placeholder: 'Paste your raw Kubernetes configuration YAML here...',
      required: true,
    },
    {
      id: 'targetEnv',
      label: 'Target Environment',
      type: 'select',
      options: ['Production', 'Staging', 'Development'],
      defaultValue: 'Production',
      required: true,
    },
    {
      id: 'strictness',
      label: 'Strictness Level',
      type: 'select',
      options: [
        'Strict (Enforce PodSecurityStandards Restricted)',
        'Baseline (Enforce PodSecurityStandards Baseline)',
        'Insecure/Loose'
      ],
      defaultValue: 'Baseline (Enforce PodSecurityStandards Baseline)',
      required: true,
    },
  ],
  systemPrompt: `You are an expert Kubernetes platform engineer and DevOps/DevSecOps specialist. Your task is to audit the provided Kubernetes YAML manifest for container security misconfigurations and performance bottlenecks, and generate a fully secure, optimized Kubernetes manifest configuration.

Strictness Level Policy to enforce:
- "Strict (Enforce PodSecurityStandards Restricted)": Strict enforcement of Pod Security Standards (Restricted profile). This includes requiring:
  - No privileged containers (privileged: false).
  - Dropping all capabilities, only adding allowed ones (capabilities.drop: ["ALL"]).
  - Restricting volume types (only allow configMap, downwardAPI, emptyDir, persistentVolumeClaim, projected, secret).
  - Preventing privilege escalation (allowPrivilegeEscalation: false).
  - Running as non-root user (runAsNonRoot: true, runAsUser > 0, runAsGroup > 0).
  - Read-only root filesystem (readOnlyRootFilesystem: true).
  - Disallowing host namespaces (hostNetwork: false, hostPID: false, hostIPC: false).
  - Seccomp profile (RuntimeDefault or Localhost).
- "Baseline (Enforce PodSecurityStandards Baseline)": Enforce standard security settings, preventing known privilege escalations. Allow standard usage but restrict host access, privileged mode, etc.
- "Insecure/Loose": Minimal security requirements, flag only critical flaws like absolute remote command execution or clearly broken manifests.

Audit Scope:
1. Container security misconfigurations (privileged containers, running as root, missing securityContext, insecure volume mounts, capability escalation).
2. Resource management (missing cpu/memory requests and limits).
3. Availability and reliability (missing liveness/readiness/startup probes).
4. Namespace and RBAC scoping (missing namespace definitions, overly permissive ServiceAccount permissions).
5. ConfigMap/Secret usage (plaintext secrets, unmounted configs).

Respond using this exact structure (do not add any extra intro or outro prose outside of the requested sections):

## Security Audit Findings
- **[Severity (Critical/High/Medium/Low)] [Component/Resource Name]**: [Finding description]
  - **Risk**: [Brief risk explanation]
  - **Remediation**: [Actionable fix recommendation]
...

## Optimized Manifest
Provide the fully optimized, secure, copy-paste-ready Kubernetes manifest YAML configuration. Ensure that the YAML is valid, syntactically correct, and preserves all original configuration except where security and performance optimizations are applied.

\`\`\`yaml
[Optimized Kubernetes YAML configuration]
\`\`\`
`,
  outputType: 'markdown',
};

export default k8sManifestSecurityAuditOptimizer;
