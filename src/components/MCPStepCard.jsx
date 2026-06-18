import { useMemo, useState } from 'react'
import { PlugZap, Plus } from 'lucide-react'
import { createMcpWorkflowStep, mcpRegistry } from '../data/mcpRegistry'

export default function MCPStepCard({ disabled, onAdd }) {
  const [serverId, setServerId] = useState(mcpRegistry[0]?.id ?? '')
  const server = mcpRegistry.find((item) => item.id === serverId)
  const [toolId, setToolId] = useState(server?.tools[0]?.id ?? '')
  const tool = server?.tools.find((item) => item.id === toolId)
  const [config, setConfig] = useState({})

  const fields = useMemo(() => tool?.fields ?? [], [tool])

  const updateField = (fieldId, value) => {
    setConfig((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleServerChange = (nextServerId) => {
    const nextServer = mcpRegistry.find((item) => item.id === nextServerId)
    setServerId(nextServerId)
    setToolId(nextServer?.tools[0]?.id ?? '')
    setConfig({})
  }

  const canAdd =
    !disabled &&
    server &&
    tool &&
    fields.every((field) => !field.required || String(config[field.id] || '').trim())

  const handleAdd = () => {
    if (!canAdd) return
    const step = createMcpWorkflowStep(server.id, tool.id, config)
    if (step) onAdd(step)
    setConfig({})
  }

  return (
    <div
      className="rounded-lg border p-3
        dark:bg-surface-card dark:border-border bg-white border-gray-200"
    >
      <div className="flex items-start gap-2 mb-3">
        <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center">
          <PlugZap size={15} className="text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold dark:text-text-primary text-gray-900">
            Add MCP action
          </p>
          <p className="text-[11px] dark:text-text-muted text-gray-400">
            Pass the previous agent output into a tool action.
          </p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-[11px] font-medium dark:text-text-secondary text-gray-600">
          Server
          <select
            value={serverId}
            onChange={(event) => handleServerChange(event.target.value)}
            className="mt-1 w-full rounded-md border px-2 py-1.5 text-xs
              dark:bg-surface-input dark:border-border dark:text-text-primary
              bg-gray-50 border-gray-200 text-gray-900"
          >
            {mcpRegistry.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-[11px] font-medium dark:text-text-secondary text-gray-600">
          Action
          <select
            value={toolId}
            onChange={(event) => {
              setToolId(event.target.value)
              setConfig({})
            }}
            className="mt-1 w-full rounded-md border px-2 py-1.5 text-xs
              dark:bg-surface-input dark:border-border dark:text-text-primary
              bg-gray-50 border-gray-200 text-gray-900"
          >
            {(server?.tools ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 grid gap-2">
        {fields.map((field) => (
          <label key={field.id} className="text-[11px] font-medium dark:text-text-secondary text-gray-600">
            {field.label}
            {field.required && <span className="text-red-400"> *</span>}
            <input
              value={config[field.id] ?? ''}
              onChange={(event) => updateField(field.id, event.target.value)}
              placeholder={field.placeholder}
              className="mt-1 w-full rounded-md border px-2 py-1.5 text-xs
                dark:bg-surface-input dark:border-border dark:text-text-primary dark:placeholder-text-muted
                bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!canAdd}
        className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white
          disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-hover"
      >
        <Plus size={13} />
        Add MCP step
      </button>
    </div>
  )
}
