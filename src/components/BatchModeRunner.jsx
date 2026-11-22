
import { useState } from 'react'
import { runBatch, parsePastedLines, parseCSV } from '../lib/batchRunner'
import {
  exportBatchAsCSV,
  exportBatchAsMarkdown,
} from '../lib/exportBatch'
import CustomSelect from './CustomSelect'

const MAX_BATCH_SIZE = 25

const STATUS_COLORS = {
  waiting: 'dark:text-text-muted text-gray-400',
  running: 'text-accent',
  completed: 'text-green-500',
  error: 'text-red-500',
}

export default function BatchModeRunner({
  agent,
  provider,
  apiKey,
  selectedModel,
}) {
  const [items, setItems] = useState([])
  const [batchFieldId, setBatchFieldId] = useState('')
  const [results, setResults] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState('')

  // Check whether the batch can run
  const canRun = () => {
    if (
      !apiKey ||
      items.length === 0 ||
      items.length > MAX_BATCH_SIZE ||
      !batchFieldId
    ) {
      return false
    }

    return agent.inputs
      .filter(
        (input) =>
          input.required && input.id !== batchFieldId
      )
      .every((input) => Boolean(input.value))
  }

  // Add batch items
  const handleAddItems = (newItems) => {
    if (!Array.isArray(newItems)) {
      setError('Invalid batch data.')
      return
    }

    if (newItems.length > MAX_BATCH_SIZE) {
      setError(`Maximum batch size is ${MAX_BATCH_SIZE}.`)
      return
    }

    setItems(newItems)
    setError('')
  }

  // Execute batch
  const handleRunBatch = async () => {
    if (!canRun() || isRunning) {
      setError(
        `Please check your API key, required fields, and batch size. Maximum ${MAX_BATCH_SIZE} items allowed.`
      )
      return
    }

    try {
      setIsRunning(true)
      setError('')

      const batchResults = await runBatch({
        agent,
        provider,
        apiKey,
        selectedModel,
        items,
        batchFieldId,
        concurrency: 3,
      })

      setResults(batchResults)
    } catch (err) {
      console.error('Batch execution failed:', err)
      setError(err.message || 'Batch execution failed.')
    } finally {
      setIsRunning(false)
    }
  }

  // Export results
  const handleExportCSV = () => {
    if (results.length > 0) {
      exportBatchAsCSV(results)
    }
  }

  const handleExportMarkdown = () => {
    if (results.length > 0) {
      exportBatchAsMarkdown(results)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">
        Batch Mode Runner
      </h2>

      <p className="text-sm text-gray-500">
        Maximum {MAX_BATCH_SIZE} items per batch.
      </p>

      <p className="text-sm">
        Current batch size: {items.length}/{MAX_BATCH_SIZE}
      </p>

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={isRunning}
          onClick={handleRunBatch}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Run Batch'}
        </button>

        <button
          type="button"
          disabled={isRunning}
          onClick={() => {
            setItems([])
            setResults([])
            setError('')
          }}
          className="rounded border px-4 py-2"
        >
          Clear
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Results</h3>

          {results.map((result, index) => (
            <div
              key={index}
              className="rounded border p-3"
            >
              <p className="font-medium">
                Item {index + 1}
              </p>

              <p className={STATUS_COLORS[result.status] || ''}>
                {result.status}
              </p>
            </div>
          ))}

          <div className="flex gap-2">
            <button onClick={handleExportCSV}>
              Export CSV
            </button>

            <button onClick={handleExportMarkdown}>
              Export Markdown
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
