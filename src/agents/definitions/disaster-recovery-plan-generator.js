export default {
    id: "disaster-recovery-plan-generator",

    createdAt: "2026-06-09",

    name: "Disaster Recovery Plan Generator",

    description:
        "Generate a complete disaster recovery plan with RTO/RPO targets, backup strategies, failover procedures, recovery workflows, and testing schedules.",

    category: "DevOps",

    icon: "ShieldAlert",

    provider: "any",

    defaultProvider: "anthropic",

    model: "claude-3-5-sonnet-20241022",

    exampleInputs: {
        architecture:
            "AWS EC2 application servers behind an Application Load Balancer, PostgreSQL RDS database, Redis cache, and S3 storage.",

        businessCriticality: "Mission Critical",

        disasterScenarios:
            "Region outage, database corruption, ransomware attack, accidental deletion",

        complianceRequirements:
            "SOC2, ISO 27001",

        recoveryRequirements:
            "Application must be restored within 2 hours with minimal data loss.",
    },

    inputs: [
        {
            id: "architecture",
            label: "System Architecture",
            type: "textarea",
            placeholder:
                "Describe your infrastructure, databases, applications, cloud providers, storage systems, and dependencies.",
            required: true,
        },

        {
            id: "businessCriticality",
            label: "Business Criticality",
            type: "select",
            options: [
                "Low",
                "Medium",
                "High",
                "Mission Critical",
            ],
            defaultValue: "High",
            required: true,
        },

        {
            id: "disasterScenarios",
            label: "Disaster Scenarios",
            type: "textarea",
            placeholder:
                "e.g. Cloud region outage, ransomware attack, accidental deletion, hardware failure",
            required: true,
        },

        {
            id: "complianceRequirements",
            label: "Compliance Requirements",
            type: "text",
            placeholder:
                "e.g. SOC2, ISO 27001, HIPAA, GDPR (optional)",
            required: false,
        },

        {
            id: "recoveryRequirements",
            label: "Recovery Requirements",
            type: "textarea",
            placeholder:
                "e.g. Restore customer-facing services within 4 hours and databases within 1 hour",
            required: true,
        },
    ],

    systemPrompt: `You are a senior Disaster Recovery (DR) and Business Continuity consultant.

Your task is to generate a complete enterprise-grade Disaster Recovery Plan based on the provided architecture, criticality, disaster scenarios, compliance requirements, and recovery requirements.

Return the response in clean markdown.

Structure the response exactly as follows:

# Executive Summary

Provide a high-level overview of the disaster recovery strategy.

# System Overview

Summarize the architecture and critical services.

# Risk Assessment

Create a table with:

| Risk | Likelihood | Impact | Mitigation |

Include all major risks.

# Recovery Objectives

Define:

- Recovery Time Objective (RTO)
- Recovery Point Objective (RPO)

Explain the reasoning behind both.

# Backup Strategy

Include:

- Backup frequency
- Retention policy
- Backup locations
- Encryption recommendations
- Validation procedures

# Failover Strategy

Describe:

- Automatic failover
- Manual failover
- Multi-region recovery
- Service restoration order

# Disaster Recovery Procedures

Provide detailed step-by-step recovery instructions for each disaster scenario.

# Roles and Responsibilities

Create a table:

| Role | Responsibility |

Include executives, operations teams, engineers, security teams, and communication owners.

# Communication Plan

Describe:

- Internal communication
- Customer communication
- Escalation procedures
- Stakeholder notifications

# Testing and Validation Schedule

Provide:

- Monthly checks
- Quarterly exercises
- Annual DR simulation

# Compliance and Audit Readiness

List controls, evidence, and documentation needed for audits.

# Recommendations

Provide actionable recommendations to improve resilience.

Rules:
- Be realistic and practical.
- Use industry best practices.
- Include measurable targets.
- Tailor recommendations to the provided architecture.
- Do not use generic placeholders.
- Think like an enterprise disaster recovery consultant.`,

    outputType: "markdown",
};