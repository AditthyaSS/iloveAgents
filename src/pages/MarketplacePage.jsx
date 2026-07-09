import { useEffect, useMemo, useState } from 'react'
import {
  Store,
  Search,
  Star,
  Download,
  UploadCloud,
  X,
  Check,
  ShieldCheck,
  Tag,
} from 'lucide-react'
import { loadAllAgents } from '../agents/registry'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import {
  MARKETPLACE_CATEGORIES,
  loadListings,
  publishAgent,
  importAgent,
  rateAgent,
  getUserVote,
  getAverageRating,
  filterListings,
} from '../lib/marketplace'

function StarRating({ listing, onRate }) {
  const [hover, setHover] = useState(0)
  const userVote = getUserVote(listing.id)
  const average = getAverageRating(listing)

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex" role="radiogroup" aria-label={`Rate ${listing.name}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            role="radio"
            aria-checked={userVote === star}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            onClick={() => onRate(listing.id, star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5"
          >
            <Star
              size={13}
              className={
                star <= (hover || userVote || Math.round(average))
                  ? 'text-amber-400 fill-amber-400'
                  : 'dark:text-text-muted text-gray-300'
              }
            />
          </button>
        ))}
      </div>
      <span className="text-[11px] dark:text-text-muted text-gray-400">
        {average > 0 ? `${average} (${listing.ratingCount})` : 'No ratings'}
      </span>
    </div>
  )
}

function PublishModal({ agents, onClose, onPublished }) {
  const [agentId, setAgentId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [category, setCategory] = useState(MARKETPLACE_CATEGORIES[0])
  const [readme, setReadme] = useState('')
  const [author, setAuthor] = useState('')

  const selected = agents.find((a) => a.id === agentId)
  const canPublish = agentId && name.trim() && description.trim()

  const handlePublish = () => {
    if (!canPublish) return
    const listing = publishAgent({
      name,
      description,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      category,
      readme,
      author,
      config: {
        baseAgentId: selected.id,
        provider: selected.provider,
        systemPrompt: selected.systemPrompt,
        outputType: selected.outputType ?? 'text',
      },
    })
    onPublished(listing)
  }

  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm transition-all
    dark:bg-surface-card dark:border-border dark:text-text-primary dark:placeholder-text-muted
    bg-white border-gray-200 text-gray-900 placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Publish agent to marketplace"
    >
      <div
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border p-5
          dark:bg-surface dark:border-border bg-white border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold dark:text-text-primary text-gray-900">
            Publish to Marketplace
          </h2>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-md dark:hover:bg-surface-hover hover:bg-gray-100">
            <X size={15} className="dark:text-text-secondary text-gray-500" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium dark:text-text-secondary text-gray-600 mb-1">
              Agent <span className="text-red-400">*</span>
            </label>
            <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className={inputClass}>
              <option value="">Select an agent to publish...</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium dark:text-text-secondary text-gray-600 mb-1">
              Display Name <span className="text-red-400">*</span>
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Agent Pack" className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-medium dark:text-text-secondary text-gray-600 mb-1">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="What does this agent do?" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium dark:text-text-secondary text-gray-600 mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                {MARKETPLACE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium dark:text-text-secondary text-gray-600 mb-1">Author</label>
              <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Your name" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium dark:text-text-secondary text-gray-600 mb-1">
              Tags <span className="dark:text-text-muted text-gray-400 font-normal">(comma separated)</span>
            </label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="summarizer, research, markdown" className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-medium dark:text-text-secondary text-gray-600 mb-1">
              README <span className="dark:text-text-muted text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea value={readme} onChange={(e) => setReadme(e.target.value)} rows={3} placeholder="Usage notes, examples, tips..." className={inputClass} />
          </div>

          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-400/90">
              Credential fields (API keys, tokens, secrets) are replaced with placeholders before publishing. Importers must supply their own values.
            </p>
          </div>

          <button
            onClick={handlePublish}
            disabled={!canPublish}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white
              bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <UploadCloud size={15} />
            Publish
          </button>
        </div>
      </div>
    </div>
  )
}

function ListingCard({ listing, onImport, onRate, imported }) {
  return (
    <div
      className="rounded-lg border p-4 flex flex-col gap-2.5 transition-all
        dark:bg-surface-card dark:border-border dark:hover:border-accent/40
        bg-white border-gray-200 hover:border-accent/40 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold dark:text-text-primary text-gray-900 truncate">{listing.name}</h3>
          <p className="text-[11px] dark:text-text-muted text-gray-400">by {listing.author}</p>
        </div>
        <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent/10 text-accent">
          {listing.category}
        </span>
      </div>

      <p className="text-xs dark:text-text-secondary text-gray-600 line-clamp-2">{listing.description}</p>

      {listing.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {listing.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px]
                dark:bg-surface-hover dark:text-text-secondary bg-gray-100 text-gray-600"
            >
              <Tag size={9} />
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-1">
        <StarRating listing={listing} onRate={onRate} />
        <div className="flex items-center gap-2">
          <span className="text-[11px] dark:text-text-muted text-gray-400">
            {listing.importCount} import{listing.importCount === 1 ? '' : 's'}
          </span>
          <button
            onClick={() => onImport(listing.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors
              bg-accent/10 text-accent hover:bg-accent hover:text-white"
          >
            {imported ? <Check size={11} /> : <Download size={11} />}
            {imported ? 'Imported' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MarketplacePage() {
  useDocumentTitle('Agent Marketplace')

  const [listings, setListings] = useState([])
  const [agents, setAgents] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [showPublish, setShowPublish] = useState(false)
  const [importedIds, setImportedIds] = useState(new Set())
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    setListings(loadListings())
    loadAllAgents().then(setAgents)
  }, [])

  const visible = useMemo(
    () => filterListings(listings, { search, category }),
    [listings, search, category]
  )

  const flash = (message) => {
    setNotice(message)
    setTimeout(() => setNotice(null), 3500)
  }

  const handleImport = (listingId) => {
    const draft = importAgent(listingId)
    if (!draft) return
    setListings(loadListings())
    setImportedIds((prev) => new Set(prev).add(listingId))
    flash(
      draft.pendingCredentialFields.length > 0
        ? `Imported "${draft.name}". Configure ${draft.pendingCredentialFields.length} credential field(s) before running it.`
        : `Imported "${draft.name}" into your workspace.`
    )
  }

  const handleRate = (listingId, stars) => {
    rateAgent(listingId, stars)
    setListings(loadListings())
  }

  const handlePublished = (listing) => {
    setShowPublish(false)
    setListings(loadListings())
    flash(`Published "${listing.name}" to the marketplace.`)
  }

  const inputClass = `px-3 py-2 rounded-lg border text-sm transition-all
    dark:bg-surface-card dark:border-border dark:text-text-primary dark:placeholder-text-muted
    bg-white border-gray-200 text-gray-900 placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50`

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Store size={16} className="text-accent" />
          </div>
          <div>
            <h1 className="text-base font-bold dark:text-text-primary text-gray-900">Agent Marketplace</h1>
            <p className="text-[11px] dark:text-text-muted text-gray-400">
              Publish your agents and import ones built by the community
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowPublish(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white
            bg-accent hover:bg-accent-hover transition-all active:scale-[0.98]"
        >
          <UploadCloud size={14} />
          Publish to Marketplace
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-text-muted text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or tag..."
            aria-label="Search marketplace"
            className={`${inputClass} w-full pl-9`}
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className={inputClass}
        >
          <option value="">All categories</option>
          {MARKETPLACE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Notice */}
      {notice && (
        <div className="mb-4 p-3 rounded-lg border bg-emerald-500/10 border-emerald-500/20 animate-fade-in">
          <p className="text-xs font-medium text-emerald-400">{notice}</p>
        </div>
      )}

      {/* Grid */}
      {visible.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onImport={handleImport}
              onRate={handleRate}
              imported={importedIds.has(listing.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Store size={28} className="mx-auto mb-3 dark:text-text-muted text-gray-300" />
          <p className="text-sm dark:text-text-secondary text-gray-500 mb-1">
            {listings.length === 0 ? 'The marketplace is empty.' : 'No agents match your filters.'}
          </p>
          <p className="text-xs dark:text-text-muted text-gray-400">
            {listings.length === 0
              ? 'Be the first to publish an agent for the community.'
              : 'Try a different search term or category.'}
          </p>
        </div>
      )}

      {showPublish && (
        <PublishModal agents={agents} onClose={() => setShowPublish(false)} onPublished={handlePublished} />
      )}
    </div>
  )
}
