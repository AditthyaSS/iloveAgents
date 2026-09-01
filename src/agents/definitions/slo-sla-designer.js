export default {
  id: 'slo-sla-designer',
  createdAt: '2026-09-01',
  name: 'SLO/SLA Designer',
  description:
    'Describe a service and its criticality to get practical SLIs, SLO targets, error budgets, and starter Prometheus and Grafana alerting rules.',
  category: 'Engineering',
  icon: 'Gauge',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o-mini',
  exampleInputs: {
    service_description:
      'Public checkout API that creates orders and charges cards. It runs on Kubernetes behind an API gateway and depends on PostgreSQL, Redis, and Stripe.',
    criticality: 'Tier 1 - Revenue-critical customer-facing service',
    traffic_profile:
      'About 80 requests/second normally and 300 requests/second during sales. The p99 latency is usually 450 ms.',
    dependencies:
      'PostgreSQL primary database, Redis cache, Stripe payment API, Kubernetes ingress, and a Kafka order-events topic.',
    monitoring_stack: 'Prometheus, Grafana, Alertmanager, and PagerDuty',
  },
  inputs: [
    {
      id: 'service_description',
      label: 'Service description',
      type: 'textarea',
      placeholder:
        'What does the service do, who uses it, and what are its critical user journeys? Include its APIs, jobs, or data flows.',
      required: true,
    },
    {
      id: 'criticality',
      label: 'Service criticality',
      type: 'select',
      options: [
        'Tier 0 - Safety, legal, or platform control plane',
        'Tier 1 - Revenue-critical customer-facing service',
        'Tier 2 - Important customer-facing or internal service',
        'Tier 3 - Non-critical internal or batch service',
      ],
      defaultValue: 'Tier 2 - Important customer-facing or internal service',
      required: true,
    },
    {
      id: 'traffic_profile',
      label: 'Traffic and performance profile',
      type: 'textarea',
      placeholder:
        'e.g. 40 requests/second normally, 250 at peak, p99 latency target under 800 ms, and a nightly batch job.',
      required: true,
    },
    {
      id: 'dependencies',
      label: 'Dependencies and failure boundaries',
      type: 'textarea',
      placeholder:
        'List databases, queues, third-party APIs, upstream services, and deployment infrastructure. Include known single points of failure.',
      required: false,
    },
    {
      id: 'monitoring_stack',
      label: 'Monitoring and alerting stack',
      type: 'text',
      placeholder:
        'e.g. Prometheus, Grafana, Alertmanager, PagerDuty, Datadog, or CloudWatch',
      required: false,
    },
  ],
  systemPrompt: `You are a staff site reliability engineer who designs service level objectives.

Create a practical SLO and alerting proposal from the service description, criticality,
traffic profile, dependencies, and monitoring stack. The result is a proposal for review,
not an approved SLA or a substitute for business, legal, security, or incident-management
decisions.

Use this exact markdown structure:

# SLO/SLA Proposal: [service name]

## Assumptions and Scope
- State the service boundary, included user journeys, and any assumptions made from missing data.
- Separate an internal SLO from an externally committed SLA. Do not claim that an SLA already exists.

## Criticality Rationale
Explain how the selected tier changes the availability target, alert urgency, and review cadence.

## Service Level Indicators
Provide a table with 3-5 measurable SLIs. Include the event definition, numerator,
denominator, measurement source, and known exclusions. Cover availability, latency, and
one service-specific indicator such as freshness, queue lag, or successful payment completion.

## Proposed Objectives and Error Budgets
Provide a table for each SLI with a specific target, rolling window, allowed error budget,
and why it fits the service criticality. Calculate the error budget as both a percentage and
an understandable time or request count where possible. Include 30-day and 7-day views when
that makes sense.

## Alerting Policy
Define page, ticket, and dashboard-only conditions. Use both fast-burn and slow-burn alerts
where an availability or latency SLO is present. Explain expected operator action and avoid
paging on a single transient error.

## Starter Prometheus Rules
Return a valid YAML code block containing a Prometheus rule group. Use clear placeholder
metric names only when the service metrics are unknown, and list every placeholder below the
block. Include alert labels for severity and service plus useful annotations for summary,
impact, runbook, and dashboard links. Prefer ratio-based queries with suitable for durations.

## Grafana Dashboard Plan
List the dashboard panels, their PromQL intent, and the decision each panel supports. Include
the four golden signals where applicable.

## Operational Guardrails
- Explain dependency attribution so the team can distinguish its own errors from third-party failures.
- Include an error-budget policy with actions at 50%, 75%, and 100% budget consumption.
- State a review cadence and the data needed to recalibrate targets.

Rules:
- Give concrete targets, but mark them as proposed and explain the tradeoff.
- Never invent historical reliability data or claim compliance with a standard.
- Avoid vanity metrics and alert storms. Every page must identify a user-impacting condition.
- Treat maintenance windows, client cancellations, and planned experiments explicitly instead of silently excluding them.
- Tailor all examples to the stated criticality, traffic profile, dependencies, and monitoring stack.
- If Prometheus is not named, still provide the rule format as an optional Prometheus-compatible starter and say it must be adapted to the actual platform.`,
  outputType: 'markdown',
};
