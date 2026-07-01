import { useState, useRef, useMemo } from 'react'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Upload,
  Download,
  StopCircle,
  Zap,
  FileText,
} from 'lucide-react'
import CustomSelect from './CustomSelect'
import { runBatch, parsePastedLines, parseCSV } from '../lib/batchRunner'
import { exportBatchAsCSV, exportBatchAsMarkdown } from '../lib/exportBatch'

const STATUS_COLORS = {
  waiting: 'dark:text-text-muted text-gray-400',
  running: 'text-accent',
  done: 'text-emerald-400',
  failed: 'text-red-400',
}

function StatusIcon({ status }) {
  if (status === 'waiting') return <Clock size={13} className={STATUS_COLORS.waiting} />
  if (status === 'running') return <Loader2 size={13} className="text-accent animate-spin" />
  if (status === 'done') return <CheckCircle2 size={13} className={STATUS_COLORS.done} />
  if (status === 'failed') return <XCircle size={13} className={STATUS_COLORS.failed} />
  return null
}

// Field types that can sensibly hold one "row" of batch data
const BATCHABLE_TYPES = ['text', 'textarea', 'code']

export default function BatchModeRunner({ agent, provider, apiKey, selectedModel, systemPrompt }) {
  const batchableFields = useMemo(
    () => agent.inputs.filter((i) => BATCHABLE_TYPES.includes(i.type)),
    [agent]
  )

  const [batchFieldId, setBatchFieldId] = useState(batchableFields[0]?.id || '')
  const [fixedInputs, setFixedInputs] = useState({})
  const [rawPaste, setRawPaste] = useState('')
  const [items, setItems] = useState([]) // string[]
  const [csvRawRows, setCsvRawRows] = useState(null) // string[][] from parseCSV, before header decision
  const [csvHasHeader, setCsvHasHeader] = useState(false)
  const [csvColumnIndex, setCsvColumnIndex] = useState(0)
  const [results, setResults] = useState([]) // [{input, status, output, error}]
  const [running, setRunning] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  const fileInputRef = useRef(null)
  const abortControllerRef = useRef(null)

  const otherFields = agent.inputs.filter((i) => i.id !== batchFieldId)

  const updateFixedInput = (id, value) => {
    setFixedInputs((prev) => ({ ...prev, [id]: value }))
  }

  // Resolve a fixed field's effective value: explicit user input, else the
  // field's defaultValue, else a sensible empty value. This matters because
  // shared fields show their defaultValue in the UI even before the user
  // touches them — canRun() and the run payload must agree with what's shown.
  const resolveFixedValue = (input) => {
    const current = fixedInputs[input.id]
    if (current !== undefined) return current
    if (input.defaultValue !== undefined) return input.defaultValue
    return input.type === 'multiselect' ? [] : ''
  }

  // Derived view of the CSV: which row is the header (if any), and the data rows
  const csvHeaders = csvHasHeader ? csvRawRows?.[0] : null
  const csvDataRows = csvHasHeader ? csvRawRows?.slice(1) : csvRawRows

  const recomputeItemsFromCsv = (rawRows, hasHeader, columnIndex) => {
    const dataRows = hasHeader ? rawRows.slice(1) : rawRows
    setItems(dataRows.map((r) => r[columnIndex]).filter(Boolean))
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target.result
      if (file.name.toLowerCase().endsWith('.csv')) {
        const parsed = parseCSV(text)
        setCsvRawRows(parsed.rows)
        setCsvHasHeader(false) // safe default: never assume a header, never drop the first row
        setCsvColumnIndex(0)
        setItems(parsed.rows.map((r) => r[0]).filter(Boolean))
      } else {
        setCsvRawRows(null)
        setItems(parsePastedLines(text))
      }
    }
    reader.readAsText(file)
  }

  const handlePasteChange = (val) => {
    setRawPaste(val)
    setCsvRawRows(null)
    setItems(parsePastedLines(val))
  }

  const handleCsvColumnChange = (indexStr) => {
    const index = Number(indexStr)
    setCsvColumnIndex(index)
    if (csvRawRows) {
      recomputeItemsFromCsv(csvRawRows, csvHasHeader, index)
    }
  }

  const handleToggleCsvHeader = () => {
    const next = !csvHasHeader
    setCsvHasHeader(next)
    if (csvRawRows) {
      recomputeItemsFromCsv(csvRawRows, next, csvColumnIndex)
    }
  }

  const canRun = () => {
    if (!apiKey || items.length === 0 || !batchFieldId) return false
    return agent.inputs
      .filter((i) => i.required && i.id !== batchFieldId)
      .every((i) => {
        const v = resolveFixedValue(i)
        if (Array.isArray(v)) return v.length > 0
        return v && String(v).trim() !== ''
      })
  }

  const handleRun = async () => {
    setRunning(true)
    setHasRun(true)
    setResults(items.map((item) => ({ input: item, status: 'waiting' })))

    const controller = new AbortController()
    abortControllerRef.current = controller

    const onItemUpdate = (index, patch) => {
      setResults((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))
    }

    // Include resolved defaults for any fixed field the user never touched,
    // so the run payload matches what's actually shown in the UI.
    const mergedFixedInputs = Object.fromEntries(
      otherFields.map((input) => [input.id, resolveFixedValue(input)])
    )

    try {
      await runBatch({
        items,
        agent,
        fixedInputs: mergedFixedInputs,
        batchFieldId,
        provider,
        model: selectedModel,
        apiKey,
        systemPrompt,
        concurrency: 3,
        onItemUpdate,
        signal: controller.signal,
      })
    } finally {
      setRunning(false)
      abortControllerRef.current = null
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setRunning(false)
  }

  const completedCount = results.filter((r) => r.status === 'done' || r.status === 'failed').length
  const allDone = hasRun && !running && completedCount === results.length && results.length > 0

  return (
    <div className="space-y-4">
      {/* Batch field selector (only shown if there's a choice to make) */}
      {batchableFields.length > 1 && (
        <div>
          <label className="block text-xs font-medium dark:text-text-secondary text-gray-600 mb-1.5">
            Which field varies per item?
          </label>
          <CustomSelect
            value={batchFieldId}
            onChange={setBatchFieldId}
            options={batchableFields.map((f) => ({ value: f.id, label: f.label }))}
            className="w-full sm:w-64"
            triggerClassName="h-9"
          />
        </div>
      )}

      {/* Fixed/shared fields, reused for every item */}
      {otherFields.length > 0 && (
        <div className="space-y-3 p-3 rounded-lg border dark:border-border dark:bg-surface-input/30 border-gray-200 bg-gray-50">
          <p className="text-[11px] font-medium dark:text-text-muted text-gray-400">
            These fields stay the same for every item in the batch:
          </p>
          {otherFields.map((input) => (
            <div key={input.id}>
              <label className="block text-xs font-medium dark:text-text-secondary text-gray-600 mb-1">
                {input.label}
                {input.required && <span className="text-error ml-0.5">*</span>}
              </label>
              {input.type === 'select' ? (
                <CustomSelect
                  value={fixedInputs[input.id] || input.defaultValue || ''}
                  onChange={(val) => updateFixedInput(input.id, val)}
                  options={input.options || []}
                  className="w-full sm:w-64"
                  triggerClassName="h-9"
                />
              ) : input.type === 'multiselect' ? (
                <div className="flex flex-wrap gap-2">
                  {input.options?.map((opt) => {
                    const selected = (fixedInputs[input.id] || input.defaultValue || []).includes(opt)
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          const current = fixedInputs[input.id] || input.defaultValue || []
                          updateFixedInput(
                            input.id,
                            current.includes(opt)
                              ? current.filter((o) => o !== opt)
                              : [...current, opt]
                          )
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all border
                          ${
                            selected
                              ? 'bg-accent/15 text-accent border-accent/30'
                              : 'dark:bg-surface-input dark:text-text-secondary dark:border-border bg-white text-gray-500 border-gray-200'
                          }`}
                      >
                        {selected && '✓ '}
                        {opt}
                      </button>
                    )
                  })}
                </div>
              ) : input.type === 'textarea' || input.type === 'code' ? (
                <textarea
                  value={fixedInputs[input.id] ?? input.defaultValue ?? ''}
                  onChange={(e) => updateFixedInput(input.id, e.target.value)}
                  placeholder={input.placeholder}
                  rows={input.type === 'code' ? 8 : 4}
                  spellCheck={input.type !== 'code'}
                  className={`w-full px-3 py-2 rounded-md text-sm transition-colors resize-y
                    dark:bg-surface-input dark:border-border dark:text-text-primary
                    bg-white border border-gray-200 text-gray-900
                    focus:ring-1 focus:ring-accent focus:border-accent outline-none
                    ${input.type === 'code' ? 'font-mono' : ''}`}
                />
              ) : (
                <input
                  type="text"
                  value={fixedInputs[input.id] ?? input.defaultValue ?? ''}
                  onChange={(e) => updateFixedInput(input.id, e.target.value)}
                  placeholder={input.placeholder}
                  className="w-full h-9 px-3 rounded-md text-sm transition-colors
                    dark:bg-surface-input dark:border-border dark:text-text-primary
                    bg-white border border-gray-200 text-gray-900
                    focus:ring-1 focus:ring-accent focus:border-accent outline-none"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Batch input: paste or upload */}
      <div>
        <label className="block text-xs font-medium dark:text-text-secondary text-gray-600 mb-1.5">
          Batch items — one per line, or upload a .csv / .txt file
        </label>
        <textarea
          value={rawPaste}
          onChange={(e) => handlePasteChange(e.target.value)}
          placeholder={'Item 1\nItem 2\nItem 3...'}
          rows={6}
          disabled={running}
          className="w-full px-3 py-2.5 rounded-lg text-sm transition-colors resize-y
            dark:bg-surface-input dark:border-border dark:text-text-primary
            bg-gray-50 border border-gray-200 text-gray-900
            focus:ring-1 focus:ring-accent focus:border-accent outline-none
            disabled:opacity-60"
        />
        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={running}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
              dark:bg-surface-input dark:text-text-secondary dark:border-border
              bg-white border border-gray-200 text-gray-600 hover:text-gray-900 disabled:opacity-60"
          >
            <Upload size={12} />
            Upload .csv / .txt
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          {items.length > 0 && (
            <span className="text-[11px] dark:text-text-muted text-gray-400">
              {items.length} item{items.length !== 1 ? 's' : ''} detected
            </span>
          )}
        </div>

        {/* Header confirmation (always shown for CSVs) + column picker (multi-column only) */}
        {csvRawRows && csvRawRows.length > 0 && (
          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-2 text-[11px] dark:text-text-secondary text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={csvHasHeader}
                onChange={handleToggleCsvHeader}
                className="accent-accent"
              />
              First row is a header (not a data item)
            </label>
            {csvRawRows[0]?.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] dark:text-text-muted text-gray-400">Use column:</span>
                <CustomSelect
                  value={String(csvColumnIndex)}
                  onChange={handleCsvColumnChange}
                  options={
                    csvHasHeader
                      ? csvHeaders.map((h, i) => ({ value: String(i), label: h || `Column ${i + 1}` }))
                      : csvRawRows[0].map((_, i) => ({ value: String(i), label: `Column ${i + 1}` }))
                  }
                  triggerClassName="h-7 text-xs"
                />
              </div>
            )}
            <p className="text-[10px] dark:text-text-muted text-gray-400">
              {csvDataRows?.length || 0} row{csvDataRows?.length !== 1 ? 's' : ''} will be used as batch items.
            </p>
          </div>
        )}
      </div>

      {/* Run / Stop / Progress */}
      <div className="flex items-center gap-2">
        {running ? (
          <button
            onClick={handleStop}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold
              text-white bg-red-500 hover:bg-red-600 transition-all active:scale-[0.98]"
          >
            <StopCircle size={16} />
            Stop
          </button>
        ) : (
          <button
            onClick={handleRun}
            disabled={!canRun()}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white
              bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed
              transition-all active:scale-[0.98]"
          >
            <Zap size={16} />
            Run Batch ({items.length})
          </button>
        )}

        {hasRun && (
          <span className="text-xs dark:text-text-secondary text-gray-500">
            {completedCount} of {results.length} complete
          </span>
        )}

        {allDone && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => exportBatchAsCSV(agent.name, results)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                dark:bg-surface-input dark:text-text-secondary dark:border-border
                bg-white border border-gray-200 text-gray-600 hover:text-gray-900"
            >
              <Download size={12} />
              Export CSV
            </button>
            <button
              onClick={() => exportBatchAsMarkdown(agent.name, results)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                dark:bg-surface-input dark:text-text-secondary dark:border-border
                bg-white border border-gray-200 text-gray-600 hover:text-gray-900"
            >
              <FileText size={12} />
              Export Markdown
            </button>
          </div>
        )}
      </div>

      {/* Results list */}
      {hasRun && (
        <div className="space-y-2">
          {results.map((r, i) => (
            <div
              key={i}
              className="rounded-lg border dark:bg-surface-card dark:border-border bg-white border-gray-200 overflow-hidden"
            >
              <div className="flex items-center gap-2 px-3 py-2 border-b dark:border-border border-gray-100">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent/10 text-[10px] font-bold text-accent flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-xs dark:text-text-primary text-gray-900 truncate flex-1">
                  {r.input}
                </span>
                <StatusIcon status={r.status} />
                <span className={`text-[11px] font-medium capitalize ${STATUS_COLORS[r.status] || ''}`}>
                  {r.status}
                </span>
              </div>
              {r.status === 'done' && r.output && (
                <div className="px-3 py-2 text-xs dark:text-text-secondary text-gray-600 whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {r.output}
                </div>
              )}
              {r.status === 'failed' && r.error && (
                <div className="px-3 py-2 text-xs text-red-400">{r.error}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
