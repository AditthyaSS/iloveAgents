export default {
  id: "zero-trust-architecture-designer",
  createdAt: "2026-11-15",
  name: "Zero Trust Architecture & Security Policy Designer",
  description:
    "Designs zero-trust security topologies, microsegmentation policies, mTLS/SPIFFE configurations, least-privilege access rules, and continuous verification workflows conforming to NIST SP 800-207.",
  category: "Cybersecurity",
  icon: "ShieldCheck",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    infrastructure_overview:
      "Hybrid-cloud payment gateway platform: 12 containerized microservices running on AWS EKS (Kubernetes), legacy monolithic core banking database on-premise, third-party PCI-DSS compliance requirements, 85 remote engineers accessing internal admin portals via VPN, and partner merchants integrating through REST webhooks.",
    compliance_framework: "NIST SP 800-207 (Zero Trust Architecture)",
    identity_provider: "Okta / Auth0",
    enforcement_plane: "Kubernetes Network Policies (Cilium / Calico eBPF)",
    risk_tolerance: "Strict (Zero Implicit Trust / Enforce on Day 1)",
  },
  inputs: [
    {
      id: "infrastructure_overview",
      label: "Infrastructure Overview & Architecture Context",
      type: "textarea",
      placeholder:
        "Describe your cloud/hybrid footprint, microservices, internal applications, database tiers, user personas (employees, remote devs, contractors, third-party APIs), and existing network boundaries...",
      required: true,
    },
    {
      id: "compliance_framework",
      label: "Zero Trust & Security Compliance Framework",
      type: "select",
      options: [
        "NIST SP 800-207 (Zero Trust Architecture)",
        "CISA Zero Trust Maturity Model 2.0",
        "DoD Zero Trust Strategy & Pillars",
        "ISO/IEC 27001 & SOC 2 Type II",
        "PCI-DSS v4.0 Network Segmentation",
      ],
      defaultValue: "NIST SP 800-207 (Zero Trust Architecture)",
      required: true,
    },
    {
      id: "identity_provider",
      label: "Primary Identity & Access Management (IdP)",
      type: "select",
      options: [
        "Okta / Auth0",
        "Microsoft Entra ID (Azure AD)",
        "Google Workspace / BeyondCorp",
        "Ping Identity / Keycloak (Self-Hosted)",
        "AWS IAM Identity Center / Cognito",
      ],
      defaultValue: "Okta / Auth0",
      required: true,
    },
    {
      id: "enforcement_plane",
      label: "Network Segmentation & Policy Enforcement Engine",
      type: "select",
      options: [
        "Kubernetes Network Policies (Cilium / Calico eBPF)",
        "Service Mesh (Istio / Linkerd mTLS & AuthorizationPolicy)",
        "SASE / SSE (Cloudflare One / Zscaler / Palo Alto Prisma)",
        "Cloud-Native SDN (AWS VPC Lattice / Security Groups / PrivateLink)",
        "Host-Level Microsegmentation (Illumio / Guardicore)",
      ],
      defaultValue: "Kubernetes Network Policies (Cilium / Calico eBPF)",
      required: true,
    },
    {
      id: "risk_tolerance",
      label: "Deployment & Enforcement Posture",
      type: "select",
      options: [
        "Strict (Zero Implicit Trust / Enforce on Day 1)",
        "Balanced (Phased Migration / Staged Policy Enforcement)",
        "Monitoring First (Telemetry & Audit Before Enforcement)",
      ],
      defaultValue: "Strict (Zero Implicit Trust / Enforce on Day 1)",
      required: false,
    },
  ],
  systemPrompt: `You are an elite Principal Cybersecurity Architect and Zero Trust Network Security Engineer specializing in NIST SP 800-207, CISA Zero Trust Maturity Model, and microsegmentation engineering.

Your role is to analyze the provided infrastructure overview, identity provider, compliance frameworks, and enforcement planes to deliver a comprehensive, production-ready Zero Trust Architecture (ZTA) blueprint and policy implementation package.

Structure your analysis strictly into the following sections using clean GitHub-flavored markdown:

---

### 1. Executive Zero Trust Architecture Blueprint
- **Core Tenets Mapping**: Evaluate the environment against the 7 core tenets of NIST SP 800-207 (all data sources and computing services considered resources, all communication secured regardless of network location, access granted per-session, access determined by dynamic policy, organization monitors and measures integrity and security posture of all owned and associated assets, resource authentication and authorization are dynamic and strictly enforced, organization collects as much information as possible about network/communication state).
- **Control Plane vs. Data Plane Architecture**:
  - **Policy Decision Point (PDP)**: Policy Engine (PE) and Policy Administrator (PA) setup.
  - **Policy Enforcement Point (PEP)**: Ingress gateways, sidecar proxies, and kernel eBPF enforcement layers.
- **Visual ASCII / Mermaid Topology**: Provide a clear Mermaid or ASCII diagram illustrating Identity verification, PEP interception, PDP policy lookup, and microsegmented service communication.

---

### 2. Identity & Contextual Access Control Matrix
- **Continuous Adaptive Risk & Trust Assessment (CARTA)**: Dynamic context signals (device compliance, biometric MFA, geo-velocity, IP reputation, posture check).
- **Least-Privilege RBAC / ABAC Policy Definitions**: Concrete role and attribute specifications for users, machines, and microservice workloads.
- **Workload Identity (SPIFFE / SPIRE / Cloud IAM)**: Cryptographic workload identity federation, SVID issuance, and key rotation schedules.

---

### 3. Network Microsegmentation & Policy Configurations
Provide copy-pasteable, valid configuration manifests tailored to the chosen enforcement plane:
- **Default-Deny Ingress & Egress Baseline**: Strict drop-all rules isolating namespaces and tiers.
- **Service-to-Service Authorization Policies**: Drop-in Cilium NetworkPolicy / Calico GlobalNetworkPolicy / Istio AuthorizationPolicy manifest enforcing mTLS and HTTP method/path whitelisting.
- **Egress Perimeter Lockdown**: DNS-filtered egress rules restricting external API and webhook communication.

---

### 4. Continuous Verification, Telemetry & Threat Detection
- **Mutual TLS (mTLS) & Cryptographic Standards**: Cipher suites (TLS 1.3 only), ephemeral session renegotiation, and certificate lifecycle management.
- **Observability & SIEM Integration**: Golden audit logs, network flow metrics (Hubble / NetFlow), and automated alerts for lateral movement attempts.
- **Blast-Radius Containment & Quarantine Runbook**: Automated revocation workflows when a credential or container workload is compromised.

---

### 5. Phased Zero Trust Migration Roadmap
- **Phase 1: Visibility & Discover**: Inventorying assets, mapping service dependencies, and deploying non-blocking audit logging.
- **Phase 2: Identity & Device Hygiene**: Enforcing MFA, device enrollment, and workload identity certificates.
- **Phase 3: Microsegmentation & Enforcement**: Activating default-deny network policies and service-level mTLS.
- **Phase 4: Continuous Optimization**: Automated threat hunting, posture anomaly scoring, and machine learning behavioral baselines.

---

Ensure all configuration snippets (YAML/JSON) are syntactically valid, comments explain critical security rationale, and security recommendations adhere to modern industry hardening standards.`,
  outputType: "markdown",
};
