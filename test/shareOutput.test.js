import test from 'node:test'
import assert from 'node:assert/strict'
import { buildShareCard, getShareableInputs } from '../src/lib/shareOutputFormat.js'

test('getShareableInputs uses labels and omits empty values', () => {
  const inputs = getShareableInputs(
    { topic: '  accessibility ', channels: ['Web', 'Mobile'], optional: '' },
    [
      { id: 'topic', label: 'Topic' },
      { id: 'channels', label: 'Channels' },
      { id: 'optional', label: 'Optional' },
    ],
  )

  assert.deepEqual(inputs, { Topic: 'accessibility', Channels: 'Web, Mobile' })
})

test('buildShareCard includes agent name, timestamp, inputs, and output', () => {
  const card = buildShareCard({
    agentName: 'Accessibility Audit Generator',
    inputs: { Framework: 'React' },
    output: '## Audit\n\nNo critical issues.',
    createdAt: '2026-06-23T10:00:00.000Z',
  })

  assert.match(card, /^# Accessibility Audit Generator/)
  assert.match(card, /2026-06-23T10:00:00.000Z/)
  assert.match(card, /- \*\*Framework:\*\* React/)
  assert.match(card, /## Output\n\n## Audit/)
})
