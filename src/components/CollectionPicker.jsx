import { useState } from 'react'
import { FolderPlus, Plus, X } from 'lucide-react'
import { MAX_COLLECTIONS, useCollections } from '../lib/useCollections'

export default function CollectionPicker({ agentId, onClose }) {
  const { collections, createCollection, addAgentToCollection, isAgentInCollection } = useCollections()
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  const handleCreate = () => {
    const result = createCollection(name)
    if (!result.ok) return setMessage(result.error)
    setName('')
    const addResult = addAgentToCollection(result.collection.id, agentId)
    setMessage(addResult.ok ? `Added to ${result.collection.name}.` : addResult.error)
  }

  const handleAdd = (collection) => {
    const result = addAgentToCollection(collection.id, agentId)
    setMessage(result.ok ? `Added to ${collection.name}.` : result.error)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-border dark:bg-surface-card">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5 dark:border-border">
          <div className="flex items-start gap-3"><div className="rounded-lg bg-accent/10 p-2 text-accent"><FolderPlus size={18} /></div><div><h2 className="text-base font-semibold text-gray-900 dark:text-text-primary">Add to Collection</h2><p className="mt-1 text-sm text-gray-500 dark:text-text-secondary">Choose a collection or create a new one.</p></div></div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-text-primary" aria-label="Close dialog"><X size={18} /></button>
        </div>
        <div className="space-y-4 p-5">
          <div className="space-y-2">
            {collections.length === 0 ? <p className="text-sm text-gray-500 dark:text-text-secondary">No collections yet.</p> : collections.map((collection) => {
              const alreadyAdded = isAgentInCollection(collection.id, agentId)
              return <button key={collection.id} type="button" onClick={() => handleAdd(collection)} disabled={alreadyAdded} className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-left text-sm transition hover:border-accent/50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-border dark:hover:border-accent/50"><span className="font-medium text-gray-800 dark:text-text-primary">{collection.name}</span><span className="text-xs text-gray-500 dark:text-text-muted">{alreadyAdded ? 'Already added' : `${collection.agentIds.length} agents`}</span></button>
            })}
          </div>
          <div className="flex gap-2 border-t border-gray-100 pt-4 dark:border-border">
            <input value={name} onChange={(event) => setName(event.target.value)} disabled={collections.length >= MAX_COLLECTIONS} className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-60 dark:border-border dark:bg-surface-input dark:text-text-primary" placeholder="New collection name" />
            <button type="button" onClick={handleCreate} disabled={collections.length >= MAX_COLLECTIONS} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"><Plus size={15} />Create</button>
          </div>
          {message && <p className="rounded-lg border border-accent/20 bg-accent/10 px-3 py-2 text-sm text-accent">{message}</p>}
          {collections.length >= MAX_COLLECTIONS && <p className="text-xs text-gray-500 dark:text-text-muted">You can create up to {MAX_COLLECTIONS} collections.</p>}
        </div>
      </div>
    </div>
  )
}
