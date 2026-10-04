import { describe, it, expect } from 'vitest'
import { parsePastedLines, parseCSV, buildBatchUserMessage } from './batchRunner'
import { createTrace, recordStep, finalizeTrace } from './executionTrace'

const AGENT = {
  inputs: [{ id: 'item', label: 'Item' }, { id: 'context', label: 'Context' }]
}

describe('Batch + trace integration', () => {
  it('processes pasted lines into trace steps', () => {
    const lines = parsePastedLines('apple\nbanana\ncherry')
    const trace = createTrace({ workflowTitle: 'Fruit Batch' })

    lines.forEach((item) => {
      const msg = buildBatchUserMessage(AGENT, { context: 'classify fruit' }, 'item', item)
      recordStep(trace, {
        stepName: `Process: ${item}`,
        stepType: 'agent',
        input: msg,
        output: `Classification of ${item}`,
        durationMs: 200,
        status: 'done',
      })
    })

    finalizeTrace(trace, { status: 'done', finalOutput: 'All 3 items processed' })

    expect(lines).toHaveLength(3)
    expect(trace.steps).toHaveLength(3)
    expect(trace.status).toBe('done')
    expect(trace.steps[0].input).toContain('apple')
  })

  it('processes CSV rows into trace steps', () => {
    const { rows } = parseCSV('Product,Category\nLaptop,Electronics\nShirt,Clothing')
    const trace = createTrace({ workflowTitle: 'Product Classifier' })

    rows.forEach((row) => {
      recordStep(trace, {
        stepName: `Classify: ${row[0]}`,
        stepType: 'agent',
        input: `Product: ${row[0]}`,
        output: `Category: ${row[1]}`,
        durationMs: 150,
        status: 'done',
      })
    })

    finalizeTrace(trace, { status: 'done' })
    expect(trace.steps).toHaveLength(rows.length)
    expect(trace.steps[0].stepName).toContain('Product')
  })
})
