const helmChartGenerator = {
  id: 'helm-chart-generator',
  name: 'Helm Chart Generator',
  description: 'Describe your app and get a complete Helm chart with Chart.yaml, values.yaml, and templated manifests ready to install.',
  category: 'DevOps',
  icon: 'Ship',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  inputs: [
    {
      id: 'app_name',
      label: 'Application Name',
      type: 'text',
      placeholder: 'e.g. my-web-app',
      required: true,
    },
    {
      id: 'container_image',
      label: 'Container Image',
      type: 'text',
      placeholder: 'e.g. nginx:alpine',
      required: true,
    },
    {
      id: 'container_port',
      label: 'Container Port',
      type: 'text',
      placeholder: 'e.g. 8080',
      required: true,
    },
    {
      id: 'replicas',
      label: 'Replicas',
      type: 'select',
      options: ['1', '2', '3', '4', '5'],
      required: true,
    },
    {
      id: 'env_vars',
      label: 'Environment Variables',
      type: 'textarea',
      placeholder: 'KEY=VALUE per line, e.g. NODE_ENV=production',
      required: false,
    },
    {
      id: 'ingress_host',
      label: 'Ingress Host (optional)',
      type: 'text',
      placeholder: 'e.g. app.example.com, leave blank to skip ingress',
      required: false,
    },
  ],
  systemPrompt: `You are a Kubernetes platform engineer who writes clean Helm charts.

Use these inputs:
- App name: {{app_name}}
- Image: {{container_image}}
- Port: {{container_port}}
- Replicas: {{replicas}}
- Env vars: {{env_vars}}
- Ingress host: {{ingress_host}}

Produce a complete chart with these files in order:

1. Chart.yaml with apiVersion v2, the app name, version 0.1.0 and appVersion 1.0.0.
2. values.yaml with replicaCount, image repository and tag split from the image, service port, and env as a map. Keep defaults safe.
3. templates/deployment.yaml using .Values for replicas, image, port and env, with matchLabels app.kubernetes.io/name, imagePullPolicy IfNotPresent, and liveness and readiness probes on the port.
4. templates/service.yaml as ClusterIP exposing port 80 to the container port.
5. templates/ingress.yaml only when an ingress host is given, with class nginx and a rule for that host.
6. A short helm install command at the end.

Rules:
- Reference every configurable value through .Values, no hardcoded names or ports in templates.
- Keep the YAML valid and helm template friendly.
- If env vars are empty, render an empty env block, not broken YAML.
- Keep comments brief and useful for a first time chart author.`,
  outputType: 'markdown',
};

export default helmChartGenerator;
