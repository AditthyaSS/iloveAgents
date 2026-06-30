const k8sSecurityAgent = {
  id: 'k8s-security-audit',
  name: 'Kubernetes Manifest Security Audit',
  description: 'Audits K8s YAML for security misconfigurations.',
  category: 'DevOps',
  icon: 'ShieldCheck',
  run: async (input) => {
    const kubernetesYaml = input?.kubernetesYaml;
    if (typeof kubernetesYaml !== 'string' || kubernetesYaml.trim() === '') {
      return {
        auditFindings: ['Please provide a valid Kubernetes YAML manifest to audit.'],
        optimizedManifest: ''
      };
    }

    // Har document ko alag process karne ke liye split
    const docs = kubernetesYaml.split('---').filter(doc => doc.trim() !== '');
    let findings = [];

    docs.forEach((doc, index) => {
      // Basic Security Checks
      if (doc.includes('privileged: true')) {
        findings.push(`Doc ${index + 1}: Security Warning - Privileged container detected.`);
      }
      if (doc.includes('runAsRoot: true')) {
        findings.push(`Doc ${index + 1}: Security Warning - Container is configured to run as root.`);
      }
      if (!doc.includes('resources:')) {
        findings.push(`Doc ${index + 1}: Performance Warning - No resource limits (CPU/Memory) defined.`);
      }
    });

    return {
      auditFindings: findings.length > 0 ? findings : ['No critical issues found.'],
      optimizedManifest: kubernetesYaml
    };
  }
};

export default k8sSecurityAgent;