import { FolderPlus, X } from 'lucide-react'

export default function CollectionModal({ title, description, value, onChange, error, onClose, onSubmit, submitLabel = 'Save', destructive = false, children }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-border dark:bg-surface-card">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5 dark:border-border">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-accent/10 p-2 text-accent"><FolderPlus size={18} /></div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-text-primary">{title}</h2>
              {description && <p className="mt-1 text-sm text-gray-500 dark:text-text-secondary">{description}</p>}
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-text-primary" aria-label="Close dialog"><X size={18} /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 p-5">
          {children || (
            <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary">
              Collection name
              <input
                autoFocus
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent dark:border-border dark:bg-surface-input dark:text-text-primary"
                placeholder="e.g. Launch planning"
              />
            </label>
          )}
          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:border-border dark:bg-surface-input dark:text-text-secondary dark:hover:text-text-primary">Cancel</button>
            <button type="submit" className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition active:scale-[0.98] ${destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-accent hover:bg-accent-hover'}`}>{submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
