import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit3, FolderPlus, Plus, Trash2 } from 'lucide-react'
import CollectionModal from '../components/CollectionModal'
import { useAgents } from '../lib/useAgents'
import { DEFAULT_COLLECTION_ID, MAX_COLLECTIONS, useCollections } from '../lib/useCollections'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export default function CollectionsPage() {
  useDocumentTitle('Collections')
  const { collections, createCollection, deleteCollection, renameCollection } = useCollections()
  const { agents, loading, error: agentsError } = useAgents()
  const [modal, setModal] = useState(null)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const customCollections = useMemo(
    () => collections.filter((collection) => collection.id !== DEFAULT_COLLECTION_ID),
    [collections]
  )
  const agentMap = useMemo(() => new Map(agents.map((agent) => [agent.id, agent])), [agents])
  const openCreate = () => { setModal('create'); setName(''); setError('') }
  const submitCreate = (event) => { event.preventDefault(); const result = createCollection(name); if (!result.ok) return setError(result.error); setModal(null) }
  const submitRename = (event) => { event.preventDefault(); const result = renameCollection(modal.id, name); if (!result.ok) return setError(result.error); setModal(null) }

  const getPreviewText = (collection) => {
    if (loading) return 'Loading agent previews...'
    if (agentsError) return 'Agent previews unavailable. Open the collection to manage saved agents.'

    const previewAgents = collection.agentIds
      .map((id) => agentMap.get(id))
      .filter(Boolean)
      .slice(0, 3)

    if (previewAgents.length) {
      return previewAgents.map((agent) => agent.name).join(', ')
    }

    return collection.agentIds.length
      ? 'Saved agents are unavailable. Open the collection to review them.'
      : 'Empty collection. Add agents from the agent cards.'
  }

  return <div className="animate-fade-in space-y-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><h1 className="text-3xl font-bold text-gray-900 dark:text-text-primary">Collections</h1><p className="mt-2 text-sm text-gray-500 dark:text-text-secondary">Create custom groups of agents for your workflows.</p></div>
      <button onClick={openCreate} disabled={customCollections.length >= MAX_COLLECTIONS} className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"><Plus size={16} />New Collection</button>
    </div>

    {customCollections.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-border dark:bg-surface-card"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent"><FolderPlus size={24} /></div><h2 className="text-lg font-semibold text-gray-900 dark:text-text-primary">No collections yet</h2><p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-text-secondary">Start by creating a collection, then add agents from the agent cards.</p><button onClick={openCreate} className="mt-5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover">Create Collection</button></div> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {customCollections.map((collection) => {
        return <article key={collection.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg dark:border-border dark:bg-surface-card">
          <div className="mb-4 flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="rounded-lg bg-accent/10 p-2 text-accent"><FolderPlus size={20} /></div><div><h2 className="font-semibold text-gray-900 dark:text-text-primary">{collection.name}</h2><p className="text-xs text-gray-500 dark:text-text-muted">{collection.agentIds.length} agents</p></div></div></div>
          <p className="min-h-10 text-sm text-gray-500 dark:text-text-secondary">{getPreviewText(collection)}</p>
          <div className="mt-5 flex flex-wrap gap-2"><Link to={`/collections/${collection.id}`} className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white hover:bg-accent-hover">Open</Link><button onClick={() => { setModal(collection); setName(collection.name); setError('') }} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:border-border dark:bg-surface-input dark:text-text-secondary"><Edit3 size={14} />Rename</button><button onClick={() => deleteCollection(collection.id)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 size={14} />Delete</button></div>
        </article>
      })}
    </div>}

    {modal === 'create' && <CollectionModal title="New Collection" description={`You can create up to ${MAX_COLLECTIONS} collections.`} value={name} onChange={setName} error={error} onClose={() => setModal(null)} onSubmit={submitCreate} submitLabel="Create" />}
    {modal && modal !== 'create' && <CollectionModal title="Rename Collection" value={name} onChange={setName} error={error} onClose={() => setModal(null)} onSubmit={submitRename} submitLabel="Save" />}
  </div>
}
