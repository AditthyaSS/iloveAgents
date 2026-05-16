export default {
  id: 'k8s-manifest-generator',
  name: 'Kubernetes Manifest Generator',
  description: 'Generates a complete Kubernetes Deployment, Service, and ConfigMap manifest from a few app inputs.',
  category: 'DevOps',
  icon: 'Box',
  provider: 'any',
  defaultProvider: 'google',
  model: 'gemini-2.5-flash',
  inputs: [
    {
      id: 'appName',
      label: 'Application Name',
      type: 'text',
      placeholder: 'e.g., my-web-app',
      required: true,
    },
    {
      id: 'containerImage',
      label: 'Container Image',
      type: 'text',
      placeholder: 'e.g., nginx:alpine or ghcr.io/org/repo:tag',
      required: true,
    },
    {
      id: 'port',
      label: 'Container Port',
      type: 'text',
      placeholder: 'e.g., 8080',
      required: true,
    },
    {
      id: 'cpuRequest',
      label: 'CPU Request (Optional)',
      type: 'text',
      placeholder: 'e.g., 100m',
      required: false,
    },
    {
      id: 'memoryRequest',
      label: 'Memory Request (Optional)',
      type: 'text',
      placeholder: 'e.g., 128Mi',
      required: false,
    },
    {
      id: 'cpuLimit',
      label: 'CPU Limit (Optional)',
      type: 'text',
      placeholder: 'e.g., 250m',
      required: false,
    },
    {
      id: 'memoryLimit',
      label: 'Memory Limit (Optional)',
      type: 'text',
      placeholder: 'e.g., 256Mi',
      required: false,
    },
    {
      id: 'envVars',
      label: 'Environment Variables (Optional)',
      type: 'textarea',
      placeholder: 'KEY=VALUE',
      required: false,
    },
  ],
  systemPrompt: `You are an expert Kubernetes platform engineer.
Generate a complete Kubernetes manifest for a developer deploying an app for the first time.

INPUTS:
- App Name: {{appName}}
- Container Image: {{containerImage}}
- Container Port: {{port}}
- CPU Request: {{cpuRequest}}
- Memory Request: {{memoryRequest}}
- CPU Limit: {{cpuLimit}}
- Memory Limit: {{memoryLimit}}
- Env Vars: {{envVars}}

REQUIREMENTS:
1. Output valid Kubernetes YAML only. Do not include markdown fences or any prose before or after the YAML.
2. Produce exactly three resources in this order, separated by '---':
   - ConfigMap using apiVersion 'v1'
   - Deployment using apiVersion 'apps/v1'
   - Service using apiVersion 'v1'
3. Use the label 'app.kubernetes.io/name: {{appName}}' consistently in metadata labels, pod template labels, and service selectors.
4. Name resources predictably:
   - ConfigMap: '{{appName}}-config'
   - Deployment: '{{appName}}'
   - Service: '{{appName}}'
5. The Deployment must include:
   - replicas: 2
   - selector.matchLabels matching the pod template labels
   - one container using image '{{containerImage}}'
   - containerPort set from '{{port}}' as an integer
   - imagePullPolicy: IfNotPresent
   - envFrom referencing the ConfigMap
   - pod-level securityContext with runAsNonRoot: true
   - container-level securityContext with allowPrivilegeEscalation: false, readOnlyRootFilesystem: true, and capabilities.drop including 'ALL'
6. The Service must be of type ClusterIP and expose port 80 targeting '{{port}}'.
7. Handle resources carefully:
   - If any of '{{cpuRequest}}', '{{memoryRequest}}', '{{cpuLimit}}', or '{{memoryLimit}}' are provided, generate a resources block using the provided values.
   - If only request values are provided, include only requests.
   - If only limit values are provided, include only limits.
   - If none of those fields are provided, include a fully commented-out example resources block with safe starter defaults:
     requests cpu 100m, memory 128Mi
     limits cpu 250m, memory 256Mi
8. Handle environment variables carefully:
   - If '{{envVars}}' is provided, parse lines in KEY=VALUE format into ConfigMap data entries.
   - If '{{envVars}}' is empty, still generate the ConfigMap with an empty 'data: {}' block.
9. Include readinessProbe and livenessProbe as valid YAML using tcpSocket on port '{{port}}'. Do not use placeholder paths or partially commented YAML that could break validity.
10. Add short YAML comments only where they help a beginner understand why a section exists. Keep comments concise.

QUALITY BAR:
- The YAML must be kubectl-apply friendly.
- Avoid placeholders that make the manifest invalid.
- Prefer safe defaults and clarity over advanced options.`,
  outputType: 'text',
};