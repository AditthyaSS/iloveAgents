# Persistent Agent Execution & Recovery System

## Overview
The **Persistent Agent Execution System** guarantees high reliability, fault tolerance, and recoverable execution for AI agent runs within **Agent Runner**. Long-running agent executions can encounter intermittent network drops, API rate limits (HTTP 429), gateway/server errors (HTTP 500, 502, 503, 504), browser refreshes, or accidental page unloads.

With this persistent system:
1. Every execution receives a unique, traceable **Execution ID**.
2. Execution state and step checkpoints are persisted to `localStorage` after every step.
3. Transient failures automatically trigger configurable **exponential backoff retries** with live countdowns.
4. Non-transient errors (such as invalid API keys) fail fast without wasting retries.
5. Interrupted runs (e.g. from browser refresh or crash) are automatically detected and can be **resumed from the last saved checkpoint** without repeating already completed steps.
6. Concurrency locks prevent duplicate simultaneous execution of the same run.
7. Real-time UI controls in `AgentRunner` display step progress, retry status, error diagnostics, and recovery actions.

---

## 1. Execution State Machine

Agent executions transition through the following lifecycle states:

```
                  ┌───────────────┐
                  │    PENDING    │
                  └───────┬───────┘
                          │ (Execution begins / Lock acquired)
                          ▼
                  ┌───────────────┐
      ┌──────────►│    RUNNING    │◄───────────┐
      │           └───────┬───────┘            │
      │ (Retry)           │                    │ (Resume)
      │       ┌───────────┼───────────┐        │
      │       ▼           ▼           ▼        │
 ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┴───┐
 │ FAILED  │ │COMPLETED│ │CANCELLED│ │ INTERRUPTED │
 └─────────┘ └─────────┘ └─────────┘ └─────────────┘
```

| State | Description | Recoverable? |
|---|---|---|
| `pending` | Initialized and queued with prepared inputs and steps. | Yes |
| `running` | Actively executing a step or waiting on backoff timer. | N/A (in-flight) |
| `completed` | All steps executed successfully. Final output and metrics persisted. | Finished |
| `failed` | A step failed permanently or retries were exhausted. | Yes (Manual Retry) |
| `cancelled` | Execution was explicitly stopped/cancelled by the user. | Yes (Can restart/clear) |
| `interrupted` | Loaded from storage after an unexpected browser reload or crash. | Yes (1-Click Resume) |

---

## 2. Step Pipeline Architecture

Executions in `AgentRunner` are broken into deterministic, checkpointed steps:

```
┌─────────────────────────────────┐
│ Step 1: Input Validation & Prep │  Validates required fields, calculates token estimates,
└───────────────┬─────────────────┘  assembles user and system prompts.
                ▼
┌─────────────────────────────────┐
│ Step 2: Agent Model Execution   │  Streams/queries the LLM provider. Enforces timeout
└───────────────┬─────────────────┘  and performs exponential backoff retries on transient errors.
                ▼
┌─────────────────────────────────┐
│ Step 3: Output & Metrics        │  Formats response, updates session spend token counters,
└─────────────────────────────────┘  records analytics, and writes run history.
```

### Checkpointing & Safe Resume
- After each step finishes, its output payload, duration, and status (`completed`) are immediately persisted in `localStorage`.
- When an execution is resumed after an interruption or failure:
  - Already `completed` steps are **skipped**. Their checkpointed outputs are loaded into context.
  - Execution resumes directly at the first incomplete step.
  - This eliminates unnecessary repeat API calls and preserves previously generated results.

---

## 3. Retry Policies & Transient Error Handling

### Transient vs Non-Transient Classification
Errors are classified dynamically by `isTransientError(error)`:

| Error Category | Transient? | Behavior |
|---|---|---|
| HTTP 429 Rate Limit | **Yes** | Exponential backoff retry with countdown |
| HTTP 500, 502, 503, 504 | **Yes** | Exponential backoff retry with countdown |
| Network drop / `Failed to fetch` | **Yes** | Exponential backoff retry with countdown |
| Step timeout (`timeoutMs`) | **Yes** | Exponential backoff retry with countdown |
| HTTP 401 / Invalid API Key | **No** | Fails fast immediately with API key prompt |
| HTTP 403 Forbidden | **No** | Fails fast immediately |
| Missing required input | **No** | Fails fast immediately |
| User cancellation (`AbortError`) | **No** | Stops immediately and sets `cancelled` |

### Exponential Backoff Calculation
The delay between retry attempts follows:
$$\text{delay} = \min\left(\text{initialDelayMs} \times (\text{backoffFactor})^{\text{attempt}}, \text{maxDelayMs}\right) + \text{jitter}$$

**Default Policy Settings**:
- `maxRetries`: `3`
- `initialDelayMs`: `1000` (1 second)
- `backoffFactor`: `2`
- `maxDelayMs`: `10000` (10 seconds)
- `timeoutMs`: `45000` (45 seconds per step)

Users can customize `maxRetries` and `initialDelayMs` directly from the `ExecutionStatusBar` settings drawer.

---

## 4. Concurrency Protection

To prevent multiple browser tabs or accidental rapid clicks from executing the same run concurrently:
1. `acquireExecutionLock(executionId, runnerId)` records an active lock token with a 45-second TTL.
2. A background heartbeat refreshes the lock every 15 seconds during execution.
3. If another runner or tab attempts to execute the same run while a lock is held, it is rejected with `CONCURRENT_EXECUTION_BLOCKED`.
4. When execution finishes, fails, or cancels, `releaseExecutionLock` releases the token cleanly.

---

## 5. Frontend Integration in Agent Runner

The `ExecutionStatusBar` component provides real-time visibility:
- **Execution Header**: Displays the unique `executionId` with quick copy, duration timer, and status badge.
- **Step Pipeline**: Shows all steps with status icons, elapsed time, retry counts, and expandable checkpoint output previews.
- **Active Retry Banner**: When transient errors occur, displays the failure reason and an animated countdown to the next attempt.
- **Interrupted Recovery Alert**: When a user returns after a browser refresh, announces the interrupted run and offers a 1-click **Resume Run** button.
- **Manual Retry Action**: Failed executions offer a 1-click **Retry Failed Step** button.

---

## 6. Verification and Testing

Tests covering all scenarios are located in:
- `src/lib/agentExecutionEngine.test.js`: Core engine, state machine, transient classifier, backoff, checkpoint recovery, and concurrency locks.
- `src/hooks/usePersistentExecution.test.js`: Hook lifecycle, storage rehydration, progress calculation, and cancellation.
- `src/components/AgentRunner.test.jsx`: Component integration, status bar rendering, and interrupted recovery flows.

To run the test suite:
```bash
npm test
```
