// src/agents/definitions/k8sSecurityAgent.js

const k8sSecurityAgent = {
  id: 'k8s-security-audit',
  name: 'Kubernetes Manifest Security Audit',
  description: 'Audits K8s YAML for security misconfigurations and performance bottlenecks.',
  category: 'DevOps',
  icon: 'ShieldCheck',
  run: async (input) => {
    // YAML parsing logic (mock implementation for now)
    const { kubernetesYaml } = input;
    
    let findings = [];
    
    // Security checks logic
    if (kubernetesYaml.includes('privileged: true')) {
      findings.push('Security Warning: Privileged container detected. This allows root-level access to the host.');
    }
    if (kubernetesYaml.includes('runAsRoot: true') || !kubernetesYaml.includes('runAsNonRoot: true')) {
      findings.push('Security Warning: Container might be running as root.');
    }
    if (!kubernetesYaml.includes('resources:')) {
      findings.push('Performance Warning: No resource limits (CPU/Memory) defined.');
    }
    
    return {
      auditFindings: findings.length > 0 ? findings : ['No critical issues found.'],
      optimizedManifest: kubernetesYaml // Yahan tum future mein fix logic add kar sakti ho
    };
  }
};

export default k8sSecurityAgent;