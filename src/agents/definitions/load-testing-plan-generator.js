export default {
  id: 'load-testing-plan-generator',

  createdAt: '2026-07-02',

  name: 'Load Testing Plan Generator',

  description:
    "Describe your app or API and get a complete load testing plan with ready-to-run scripts for k6, JMeter, Locust, Artillery, or ab.",

  category: 'Engineering',

  icon: 'Activity',

  provider: 'any',

  defaultProvider: 'openai',

  model: 'gpt-4o',

  exampleInputs: {
    appDescription:
      'REST API with GET /users, POST /orders (creates an order in PostgreSQL), GET /products (cached via Redis). Auth via JWT token in Authorization header.',
    loadTestingTool: 'k6',
    targetLoad: '500 concurrent users, 10,000 requests/min',
    testDuration: '10 minutes ramp-up, 30 minutes sustained',
    environment: 'staging',
  },

  inputs: [
    {
      id: 'appDescription',
      label: 'App/API Description',
      type: 'textarea',
      placeholder:
        'Describe your endpoints, critical paths, authentication, database queries, caching layers, and any known bottlenecks...',
      required: true,
    },

    {
      id: 'loadTestingTool',
      label: 'Load Testing Tool',
      type: 'select',
      options: ['k6', 'JMeter', 'Locust', 'Artillery', 'ab'],
      defaultValue: 'k6',
      required: true,
    },

    {
      id: 'targetLoad',
      label: 'Target Load',
      type: 'text',
      placeholder:
        'e.g. 500 concurrent users, 10,000 requests/min',
      required: true,
    },

    {
      id: 'testDuration',
      label: 'Test Duration',
      type: 'text',
      placeholder:
        'e.g. 10 minutes ramp-up, 30 minutes sustained',
      required: false,
    },

    {
      id: 'environment',
      label: 'Environment',
      type: 'select',
      options: ['staging', 'production'],
      defaultValue: 'staging',
      required: true,
    },
  ],

  systemPrompt: `You are a senior performance engineer and load testing expert.

Your task is to generate a complete load testing plan based on the user's app/API description, chosen tool, target load, test duration, and environment.

Return the response in clean markdown with the following structure:

## Test Strategy Overview

Explain what will be tested and why. Identify the critical endpoints and scenarios based on the app description. Mention any potential bottlenecks.

## Ready-to-Run Script

Provide a complete, production-ready load testing script in the tool chosen by the user. Include realistic data, proper headers, authentication handling, and parameterization. Do NOT use placeholder comments — generate real, runnable code.

Wrap the script in a fenced code block with the appropriate language tag:
- For k6: use javascript
- For JMeter: use xml
- For Locust: use python
- For Artillery: use yaml
- For ab: use bash

## Threshold & Pass Criteria

Define specific pass/fail thresholds using the tool's built-in threshold system:
- p95 latency must be under a reasonable threshold based on target load
- Error rate must be below a reasonable percentage
- Throughput must meet or exceed the target
- Any tool-specific criteria

## Key Metrics to Monitor

List the essential metrics to watch during and after the test:
- p95 and p99 latency
- Error rate by endpoint
- Throughput (requests/sec)
- Resource usage (CPU, memory, DB connections)
- Any tool-specific custom metrics

## Safety Notes

Provide clear warnings and guidelines for running the test safely:
- Never run against production without explicit approval and monitoring
- Recommended warm-up period
- How to abort if things go wrong
- Database connection pool sizing considerations
- Rate limiting and throttling awareness
- Impact on shared resources

Rules:
- Be specific and practical — generate real scripts, not templates.
- Use realistic endpoint paths and data based on the app description.
- If the app description mentions databases, include connection pool considerations.
- If it mentions auth, include proper authentication in the script.
- Tailor thresholds to the target load — don't use defaults for everything.
- The script must be ready to copy, paste, and run with zero modifications (except API keys/secrets).`,
  outputType: 'markdown',
};
