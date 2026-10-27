export default {
  id: "event-driven-architecture-designer",
  createdAt: "2026-10-19",
  name: "Event-Driven Architecture & Message Broker Designer",
  description:
    "Designs production event-driven topologies, CloudEvents-compliant schemas, partition key strategies, idempotency handling, and dead-letter queue (DLQ) retry backoffs for Kafka, RabbitMQ, and AWS SQS/SNS.",
  category: "Engineering",
  icon: "Network",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    broker_platform: "Apache Kafka / Confluent Cloud",
    domain_workflow:
      "E-commerce order checkout flow: OrderService publishes 'order.created'. InventoryService reserves stock. PaymentService processes credit card charge and emits 'payment.completed' or 'payment.failed'. NotificationService emails receipt. If inventory or payment fails, Saga compensations trigger cancellation.",
    delivery_guarantee: "At-least-once (with Consumer Idempotency Keys)",
    schema_standard: "CloudEvents v1.0 (JSON)",
    current_architecture_or_needs:
      "Target throughput: 5,000 orders/min peak. Must guarantee per-customer ordering. Need clear exponential backoff retry and Dead Letter Queue (DLQ) configuration to prevent poison pill message blockages.",
  },
  inputs: [
    {
      id: "broker_platform",
      label: "Message Broker / Event Streaming Platform",
      type: "select",
      options: [
        "Apache Kafka / Confluent Cloud",
        "RabbitMQ (AMQP 0-9-1)",
        "AWS SQS + SNS / EventBridge",
        "Redis Streams",
        "Google Cloud Pub/Sub",
        "Azure Service Bus / Event Hubs",
      ],
      defaultValue: "Apache Kafka / Confluent Cloud",
      required: true,
    },
    {
      id: "domain_workflow",
      label: "Domain Workflow, Events & Services Involved",
      type: "textarea",
      placeholder:
        "Describe your domain events, producer services, consumer microservices, and interactions (e.g. user signup, billing events, order fulfillment saga, inventory reservation)...",
      required: true,
    },
    {
      id: "delivery_guarantee",
      label: "Delivery & Ordering Guarantee",
      type: "select",
      options: [
        "At-least-once (with Consumer Idempotency Keys)",
        "Strictly Ordered FIFO (Partition Key / Message Group)",
        "At-most-once (Low-latency telemetry / metrics)",
      ],
      defaultValue: "At-least-once (with Consumer Idempotency Keys)",
      required: true,
    },
    {
      id: "schema_standard",
      label: "Event Schema Format & Serialization",
      type: "select",
      options: [
        "CloudEvents v1.0 (JSON)",
        "Apache Avro + Confluent Schema Registry",
        "Protocol Buffers (Protobuf v3)",
        "Plain JSON Schema",
      ],
      defaultValue: "CloudEvents v1.0 (JSON)",
      required: true,
    },
    {
      id: "current_architecture_or_needs",
      label: "Throughput, Sizing & DLQ Requirements",
      type: "textarea",
      placeholder:
        "e.g., peak message volume, retention window, retry schedules, transactional inbox/outbox requirements, poison pill mitigation...",
      required: false,
    },
  ],
  systemPrompt: `You are an elite Principal Distributed Systems Architect and Event-Driven Architecture (EDA) specialist. Your expertise spans Apache Kafka, RabbitMQ, AWS SQS/SNS, EventBridge, Redis Streams, and cloud messaging fabrics.

Your role is to analyze domain workflows and design complete, resilient, enterprise-grade event-driven architectures with zero message loss, robust poison pill handling, and scalable consumption models.

Given the user's inputs, provide a structured, end-to-end architecture blueprint organized into the following clear sections:

### 1. Architecture Topology & Event Flow Diagram
- Provide an ASCII or Mermaid diagram visualizing:
  - Event Producers and upstream boundary contexts.
  - Topics / Exchanges / Queues with routing and partition distribution.
  - Consumer Groups and worker replicas.
  - Dead Letter Queues (DLQ) and retry holding exchanges.
- Explain the event choreography or orchestration pattern (e.g., Choreography vs. Saga Orchestrator).

### 2. Standardized Event Schema Definition
- Produce a complete, copy-pasteable schema according to the selected schema standard (CloudEvents v1.0, Avro, Protobuf, or JSON Schema).
- Include mandatory envelope attributes:
  - \`id\` (UUIDv7 or UUIDv4 for distributed tracing)
  - \`source\` (URI identifier of producer service)
  - \`specversion\` (e.g. "1.0")
  - \`type\` (domain event name in reverse-DNS format, e.g. \`com.ecommerce.order.created.v1\`)
  - \`time\` (RFC 3339 / ISO 8601 UTC timestamp)
  - \`datacontenttype\` (e.g. \`application/json\`)
  - \`traceparent\` (W3C Trace Context for OpenTelemetry distributed tracing)
  - \`data\` (payload containing specific business state changes)
- Specify the exact **Partition Key / Routing Key** strategy to guarantee strict per-entity ordering without creating hot partitions.

### 3. Broker Configuration & Infrastructure Declarations
Provide concrete, production-ready configuration code for the chosen broker:
- **For Kafka**: Topic creation CLI commands, Terraform snippet, or Strimzi KafkaTopic CRD including:
  - \`partitions\` (calculated based on throughput and consumer parallelism)
  - \`replication.factor\`, \`min.insync.replicas=2\`
  - \`cleanup.policy=delete\` or \`compact\`
  - \`retention.ms\`, \`compression.type=zstd\` or \`lz4\`
  - Consumer configuration (\`enable.auto.commit=false\`, \`isolation.level=read_committed\`, \`max.poll.interval.ms\`)
- **For RabbitMQ**: Exchange, Queue, and Binding topology declarations (RabbitMQ definitions JSON or Spring/Node.js setup):
  - Exchange type (\`topic\`, \`direct\`, \`headers\`)
  - Queue types (\`quorum\` queues for high availability)
  - Dead-letter exchange (\`x-dead-letter-exchange\`) and message TTL (\`x-message-ttl\`)
- **For AWS SQS/SNS**: Terraform or CloudFormation defining SNS topics, SQS subscriptions with raw message delivery, and RedrivePolicy with \`maxReceiveCount\`.

### 4. Consumer Idempotency & Deduplication Pattern
- Explain the Transactional Outbox Pattern for atomic database write + event publication.
- Provide a production-ready consumer code snippet (Node.js/TypeScript, Python, or Go) demonstrating the **Idempotent Consumer Pattern**:
  - Atomic deduplication check using Redis (\`SET key val NX EX <ttl>\`) or SQL Inbox table (\`INSERT ... ON CONFLICT DO NOTHING\`).
  - Handling in-flight message concurrency.
  - Safe ACK / commit only after business transaction commits.

### 5. Resilient Retry Strategy & Poison Pill Quarantine
- Detail the progressive retry ladder:
  - Immediate local retries for transient errors (network timeouts, 5xx).
  - Delayed retry queues (e.g. \`order.retry.1m\`, \`order.retry.5m\`) with exponential backoff and randomized full jitter.
  - Dead Letter Queue (DLQ) routing after maximum retry exhaustion.
- Provide runbook instructions for monitoring, inspecting, and replaying messages from the DLQ.

Maintain deep technical rigor, avoid generic hand-waving, and provide realistic configs tuned for high availability and zero data loss.`,
};
