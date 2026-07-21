import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit3, FolderPlus, ListChecks, Plus, Trash2, X } from 'lucide-react'
import CollectionModal from '../components/CollectionModal'
import { useAgents } from '../lib/useAgents'
import { DEFAULT_COLLECTION_ID, MAX_COLLECTIONS, useCollections } from '../lib/useCollections'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export default function CollectionsPage() {
  useDocumentTitle('Collections')
  const { collections, createCollection, deleteCollection, renameCollection } = useCollections()
  const { agents, loading, error: agentsError } = useAgents()

  // ── Existing modal state ──────────────────────────────────────────────────
  const [modal, setModal] = useState(null)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  // ── Bulk selection state ──────────────────────────────────────────────────
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [showBulkConfirm, setShowBulkConfirm] = useState(false)

  // ── Existing handlers ─────────────────────────────────────────────────────
  const customCollections = useMemo(
    () => collections.filter((collection) => collection.id !== DEFAULT_COLLECTION_ID),
    [collections]
  )
  const agentMap = useMemo(() => new Map(agents.map((agent) => [agent.id, agent])), [agents])
  const openCreate = () => { setModal('create'); setName(''); setError('') }
  const submitCreate = (event) => { event.preventDefault(); const result = createCollection(name); if (!result.ok) return setError(result.error); setModal(null) }
  const submitRename = (event) => { event.preventDefault(); const result = renameCollection(modal.id, name); if (!result.ok) return setError(result.error); setModal(null) }

  // ── Bulk selection helpers ────────────────────────────────────────────────
  const enterBulkMode = () => { setIsBulkMode(true); setSelectedIds(new Set()) }

  const exitBulkMode = useCallback(() => {
    setIsBulkMode(false)
    setSelectedIds(new Set())
    setShowBulkConfirm(false)
  }, [])

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(collections.map((c) => c.id)))
  }, [collections])

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const handleBulkDeleteConfirm = useCallback(() => {
    selectedIds.forEach((id) => deleteCollection(id))
    exitBulkMode()
  }, [selectedIds, deleteCollection, exitBulkMode])

  // ── Agent preview text ────────────────────────────────────────────────────
  const agentMap = useMemo(() => new Map(agents.map((agent) => [agent.id, agent])), [agents])

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

  const selectedCount = selectedIds.size
  const hasSelections = selectedCount > 0

  return (
    <div className="animate-fade-in space-y-8">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-text-primary">Collections</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-text-secondary">
            Create custom groups of agents for your workflows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {collections.length > 0 && !isBulkMode && (
            <button
              id="manage-collections-btn"
              onClick={enterBulkMode}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:border-border dark:bg-surface-input dark:text-text-secondary dark:hover:text-text-primary"
              aria-label="Enter bulk selection mode"
            >
              <ListChecks size={16} />
              Manage
            </button>
          )}

          <button
            id="new-collection-btn"
            onClick={openCreate}
            disabled={collections.length >= MAX_COLLECTIONS}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={16} />
            New Collection
          </button>
        </div>
      </div>

      {/* ── Bulk action bar ───────────────────────────────────────────────── */}
      {isBulkMode && (
        <div
          role="toolbar"
          aria-label="Bulk selection actions"
          className="flex flex-wrap items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 dark:border-accent/20 dark:bg-accent/10"
        >
          {/* Selected count */}
          <span className="min-w-[6rem] text-sm font-semibold text-gray-700 dark:text-text-primary">
            {selectedCount === 0
              ? 'None selected'
              : `${selectedCount} selected`}
          </span>

          {/* Select / Deselect all */}
          <button
            id="select-all-btn"
            onClick={selectAll}
            disabled={selectedCount === collections.length}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-border dark:bg-surface-input dark:text-text-primary dark:hover:bg-surface-hover"
            aria-label="Select all collections"
          >
            Select All
          </button>

          <button
            id="deselect-all-btn"
            onClick={deselectAll}
            disabled={!hasSelections}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-border dark:bg-surface-input dark:text-text-primary dark:hover:bg-surface-hover"
            aria-label="Deselect all collections"
          >
            Deselect All
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Delete Selected */}
          <button
            id="delete-selected-btn"
            onClick={() => setShowBulkConfirm(true)}
            disabled={!hasSelections}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Delete ${selectedCount} selected collection${selectedCount !== 1 ? 's' : ''}`}
          >
            <Trash2 size={14} />
            Delete Selected
          </button>

          {/* Cancel / exit bulk mode */}
          <button
            id="cancel-bulk-mode-btn"
            onClick={exitBulkMode}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:border-border dark:bg-surface-input dark:text-text-secondary dark:hover:text-text-primary"
            aria-label="Exit bulk selection mode"
          >
            <X size={14} />
            Cancel
          </button>
        </div>
      )}

      {/* ── Collection grid / empty state ─────────────────────────────────── */}
      {collections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-border dark:bg-surface-card">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <FolderPlus size={24} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-text-primary">No collections yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-text-secondary">
            Start by creating a collection, then add agents from the agent cards.
          </p>
          <button
            onClick={openCreate}
            className="mt-5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            Create Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {collections.map((collection) => {
            const isSelected = selectedIds.has(collection.id)

            return (
              <article
                key={collection.id}
                onClick={isBulkMode ? () => toggleSelect(collection.id) : undefined}
                className={[
                  'rounded-xl border bg-white p-5 shadow-sm transition',
                  isBulkMode
                    ? 'cursor-pointer select-none'
                    : 'hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg',
                  isSelected
                    ? 'border-accent ring-2 ring-accent/30 dark:border-accent dark:bg-accent/5'
                    : 'border-gray-200 dark:border-border dark:bg-surface-card',
                ].join(' ')}
                aria-selected={isBulkMode ? isSelected : undefined}
              >
                {/* Card header */}
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Checkbox (bulk mode only) */}
                    {isBulkMode && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(collection.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select collection "${collection.name}"`}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-[#6366f1] focus:ring-accent dark:border-border"
                      />
                    )}

                    <div className="rounded-lg bg-accent/10 p-2 text-accent">
                      <FolderPlus size={20} />
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900 dark:text-text-primary">
                        {collection.name}
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-text-muted">
                        {collection.agentIds.length} agents
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preview text */}
                <p className="min-h-10 text-sm text-gray-500 dark:text-text-secondary">
                  {getPreviewText(collection)}
                </p>

                {/* Card actions — hidden in bulk mode */}
                {!isBulkMode && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      to={`/collections/${collection.id}`}
                      className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
                    >
                      Open
                    </Link>

                    <button
                      onClick={() => { setModal(collection); setName(collection.name); setError('') }}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:border-border dark:bg-surface-input dark:text-text-secondary"
                    >
                      <Edit3 size={14} />
                      Rename
                    </button>

                    <button
                      onClick={() => deleteCollection(collection.id)}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      {/* ── Create / Rename modals ─────────────────────────────────────────── */}
      {modal === 'create' && (
        <CollectionModal
          title="New Collection"
          description={`You can create up to ${MAX_COLLECTIONS} collections.`}
          value={name}
          onChange={setName}
          error={error}
          onClose={() => setModal(null)}
          onSubmit={submitCreate}
          submitLabel="Create"
        />
      )}

      {modal && modal !== 'create' && (
        <CollectionModal
          title="Rename Collection"
          value={name}
          onChange={setName}
          error={error}
          onClose={() => setModal(null)}
          onSubmit={submitRename}
          submitLabel="Save"
        />
      )}

      {/* ── Bulk delete confirmation dialog ───────────────────────────────── */}
      {showBulkConfirm && (
        <CollectionModal
          title="Delete Collections"
          destructive
          onClose={() => setShowBulkConfirm(false)}
          onSubmit={(e) => { e.preventDefault(); handleBulkDeleteConfirm() }}
          submitLabel={`Delete ${selectedCount} Collection${selectedCount !== 1 ? 's' : ''}`}
        >
          <p className="text-sm text-gray-600 dark:text-text-secondary">
            You are about to permanently delete{' '}
            <strong className="font-semibold text-gray-900 dark:text-text-primary">
              {selectedCount} collection{selectedCount !== 1 ? 's' : ''}
            </strong>
            . This action cannot be undone.
          </p>
        </CollectionModal>
      )}
    </div>
  )
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
