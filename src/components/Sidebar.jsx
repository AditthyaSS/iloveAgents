import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { loadAllAgents } from '../agents/registry'
import { DEFAULT_COLLECTION_ID, useCollections } from '../lib/useCollections'

const SIDEBAR_CATEGORY_STORAGE_KEY = 'sidebar-category-collapsed-state'

export default function Sidebar({ open, onClose }) {
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('')
  // Stores COLLAPSED state per category (absent/false = expanded).
  // Categories are expanded by default on first visit, since we only
  // record an entry here when the user explicitly collapses one.
  const [collapsedCategories, setCollapsedCategories] = useState(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_CATEGORY_STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })
  const [searchExpandedCategories, setSearchExpandedCategories] = useState({})
  const [agents, setAgents] = useState([])
  const [feedback, setFeedback] = useState('')
  const { collections, moveAgentToCollection } = useCollections()
  const location = useLocation()

  useEffect(() => {
    const fetchAgents = async () => {
      const allAgents = await loadAllAgents()
      setAgents(allAgents)
    }

    fetchAgents()
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(
        SIDEBAR_CATEGORY_STORAGE_KEY,
        JSON.stringify(collapsedCategories)
      )
    } catch {
      // localStorage unavailable (e.g. private browsing) — fail silently
    }
  }, [collapsedCategories])

  const currentAgentId = location.pathname.startsWith('/agent/')
    ? location.pathname.split('/agent/')[1]
    : null

  const activeCollectionId = new URLSearchParams(location.search).get('collection')
  const activeAgent = agents.find((a) => a.id === currentAgentId)
  const activeCategory = activeAgent ? activeAgent.category : null

  const normalizedQuery = sidebarSearchQuery.trim().toLowerCase()
  const isSearching = normalizedQuery !== ''

  useEffect(() => {
    if (!isSearching) {
      setSearchExpandedCategories({})
    }
  }, [isSearching])

  const filteredAgents = !normalizedQuery
    ? agents
    : agents.filter(
        (agent) =>
          agent.name.toLowerCase().includes(normalizedQuery) ||
          agent.category.toLowerCase().includes(normalizedQuery)
      )

  const categories = filteredAgents.reduce((acc, agent) => {
    if (!acc[agent.category]) acc[agent.category] = []
    acc[agent.category].push(agent)
    return acc
  }, {})

  const categoryOrder = Object.keys(categories)

  const toggleCategory = (category) => {
    if (isSearching) {
      setSearchExpandedCategories((prev) => ({
        ...prev,
        [category]: !(prev[category] ?? true),
      }))
    } else {
      setCollapsedCategories((prev) => ({
        ...prev,
        [category]: !prev[category],
      }))
    }
  }

  const handleCollectionDrop = (event, collectionId) => {
    event.preventDefault()
    const agentId = event.dataTransfer.getData('text/plain')
    if (!agentId) return

    const collection = collections.find((item) => item.id === collectionId)
    const result = moveAgentToCollection(agentId, collectionId)

    setFeedback(
      result.ok
        ? `Moved to ${collection?.name || 'the selected collection'}.`
        : result.error
    )

    window.setTimeout(() => setFeedback(''), 2200)
  }

  const customCollections = collections.filter(
    (collection) => collection.id !== DEFAULT_COLLECTION_ID
  )
  const allAgentsCount = agents.length

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-14 left-0 bottom-0 z-40 w-60 flex flex-col border-r transition-all duration-200
          dark:border-border border-gray-200
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="absolute inset-0 -z-10 bg-white/75 dark:bg-[#101014]/75 backdrop-blur-2xl" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cyan-400/20 via-indigo-400/20 to-rose-400/20 dark:from-cyan-500/10 dark:via-indigo-500/10 dark:to-rose-500/10 opacity-90" />

        <div className="px-4 py-3 flex items-center justify-between" data-tour="sidebar-agents">
          <span className="text-xs font-bold uppercase tracking-wider dark:text-text-primary text-gray-800">
            Agents
          </span>

          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-accent/15 text-accent dark:text-accent-hover">
            {filteredAgents.length}
          </span>
        </div>

        <div className="px-4 mb-2">
          <div className="relative group">
            <Icons.Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-text-secondary group-focus-within:text-accent transition-colors"
            />

            <input
              type="text"
              placeholder="Search agents..."
              aria-label="Search agents"
              value={sidebarSearchQuery}
              onChange={(e) => setSidebarSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 text-[12px] rounded-md border transition-all
                dark:bg-surface-hover/80 dark:border-border dark:text-text-primary dark:focus:border-accent/40
                bg-gray-50 border-gray-200 text-gray-900 focus:border-accent/40 focus:ring-1 focus:ring-accent/10 outline-none"
            />

            {sidebarSearchQuery && (
              <button
                type="button"
                onClick={() => setSidebarSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-text-muted dark:hover:text-text-primary transition-colors"
              >
                <Icons.X size={14} />
              </button>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          <NavLink
            to="/suites"
            onClick={onClose}
            className={({ isActive }) =>
              `relative flex items-center gap-2.5 pl-3.5 pr-2.5 py-2 rounded-md text-[13px] font-medium transition-all duration-200 mb-2 group
              ${
                isActive
                  ? 'bg-accent/15 text-accent dark:text-accent font-semibold shadow-sm'
                  : 'dark:text-text-secondary dark:hover:text-text-primary dark:hover:bg-white/10 text-gray-700 hover:text-gray-950 hover:bg-gray-150/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-accent rounded-r" />
                )}
                <span className="text-sm transition-transform duration-200 group-hover:translate-x-[4px]">
                  ✨
                </span>
                <span className="truncate transition-transform duration-200 group-hover:translate-x-[4px]">
                  Suites
                </span>
              </>
            )}
          </NavLink>

          <div className="mb-2 rounded-lg border border-gray-100/80 p-2 dark:border-border/80">
            <div className="mb-1 flex items-center justify-between px-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-text-muted">
              <span>Collections</span>
              <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[9px] text-accent">
                {customCollections.length}
              </span>
            </div>

            {feedback && (
              <div className="mb-2 rounded-md border border-accent/20 bg-accent/10 px-2 py-1.5 text-[11px] text-accent">
                {feedback}
              </div>
            )}

            <NavLink
              to="/collections"
              onClick={onClose}
              className={({ isActive }) =>
                `relative mb-0.5 flex items-center gap-2.5 rounded-md py-1.5 pl-2 pr-2 text-[12px] font-medium transition-all duration-200 group
                ${
                  isActive && location.pathname === '/collections'
                    ? 'bg-accent/15 text-accent font-semibold shadow-sm'
                    : 'text-gray-700 hover:bg-gray-150/50 hover:text-gray-950 dark:text-text-secondary dark:hover:bg-white/10 dark:hover:text-text-primary'
                }`
              }
            >
              <Icons.FolderPlus size={14} />
              <span className="truncate">All Collections</span>
            </NavLink>

            <Link
              to="/"
              onClick={onClose}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleCollectionDrop(event, DEFAULT_COLLECTION_ID)}
              className={`relative mb-0.5 flex items-center gap-2.5 rounded-md py-1.5 pl-2 pr-2 text-[12px] font-medium transition-all duration-200 group
                ${
                  location.pathname === '/' && !activeCollectionId
                    ? 'bg-accent/15 text-accent font-semibold shadow-sm'
                    : 'text-gray-700 hover:bg-gray-150/50 hover:text-gray-950 dark:text-text-secondary dark:hover:bg-white/10 dark:hover:text-text-primary'
                }`}
            >
              <Icons.FolderInput size={14} className="flex-shrink-0" />
              <span className="min-w-0 flex-1 truncate">All Agents</span>
              <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[9px] font-bold text-accent">
                {allAgentsCount}
              </span>
            </Link>

            {customCollections.map((collection) => (
              <Link
                key={collection.id}
                to={collection.id === DEFAULT_COLLECTION_ID ? '/' : `/?collection=${collection.id}`}
                onClick={onClose}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleCollectionDrop(event, collection.id)}
                className={`relative flex items-center gap-2.5 rounded-md py-1.5 pl-2 pr-2 text-[12px] font-medium transition-all duration-200 group
                  ${
                    location.pathname === '/' && activeCollectionId === collection.id
                      ? 'bg-accent/15 text-accent font-semibold shadow-sm'
                      : 'text-gray-700 hover:bg-gray-150/50 hover:text-gray-950 dark:text-text-secondary dark:hover:bg-white/10 dark:hover:text-text-primary'
                  }`}
              >
                <Icons.Folder size={14} className="flex-shrink-0" />
                <span className="min-w-0 flex-1 truncate">{collection.name}</span>
                <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[9px] font-bold text-accent">
                  {collection.agentIds.length}
                </span>
              </Link>
            ))}
          </div>

          <NavLink
            to="/scheduler"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors mb-0.5
              ${
                isActive
                  ? 'bg-accent/10 text-accent dark:text-accent'
                  : 'dark:text-text-secondary dark:hover:text-text-primary dark:hover:bg-surface-hover text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`
            }
          >
            <Icons.CalendarClock size={15} className="flex-shrink-0" />
            <span className="truncate">Scheduler</span>
          </NavLink>

          <NavLink
            to="/analytics"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors mb-0.5
              ${
                isActive
                  ? 'bg-accent/10 text-accent dark:text-accent'
                  : 'dark:text-text-secondary dark:hover:text-text-primary dark:hover:bg-surface-hover text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`
            }
          >
            <Icons.BarChart3 size={15} className="flex-shrink-0" />
            <span className="truncate">Analytics</span>
          </NavLink>

          <NavLink
            to="/marketplace"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors mb-0.5
              ${
                isActive
                  ? 'bg-accent/10 text-accent dark:text-accent'
                  : 'dark:text-text-secondary dark:hover:text-text-primary dark:hover:bg-surface-hover text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`
            }
          >
            <Icons.Store size={15} className="flex-shrink-0" />
            <span className="truncate">Marketplace</span>
          </NavLink>

          <div className="border-b dark:border-border border-gray-100 mb-2" />

          {categoryOrder.map((category) => {
            const isActiveCategory = activeCategory === category
            const isCategoryExpanded = isSearching
              ? searchExpandedCategories[category] ?? true
              : isActiveCategory
                ? true
                : !collapsedCategories[category]

            return (
              <div key={category} className="mb-3">
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  aria-expanded={isCategoryExpanded}
                  className={`w-full relative flex items-center justify-between gap-2 pl-3.5 pr-2.5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-200 group rounded-md
                    ${
                      isActiveCategory
                        ? 'bg-accent/20 text-indigo-600 dark:text-indigo-400 font-extrabold'
                        : 'dark:text-text-primary text-gray-800 hover:bg-gray-100/70 dark:hover:bg-white/10 hover:text-accent dark:hover:text-white'
                    }`}
                >
                  {isActiveCategory && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-accent rounded-r" />
                  )}

                  <span className="truncate transition-transform duration-200 ease-in-out group-hover:translate-x-[4px]">
                    {category}
                  </span>

                  <span className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent/20 text-indigo-600 dark:text-indigo-400 tracking-normal flex items-center justify-center min-h-[16px]">
                      {categories[category].length}
                    </span>
                    {isCategoryExpanded ? (
                      <Icons.ChevronDown
                        size={12}
                        className="flex-shrink-0 text-gray-400 group-hover:text-accent transition-colors"
                      />
                    ) : (
                      <Icons.ChevronRight
                        size={12}
                        className="flex-shrink-0 text-gray-400 group-hover:text-accent transition-colors"
                      />
                    )}
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-200 ease-in-out ${
                    isCategoryExpanded
                      ? 'grid-rows-[1fr] opacity-100 mt-0.5'
                      : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    {categories[category].map((agent) => {
                      const IconComponent = Icons[agent.icon] || Icons.Bot

                      return (
                        <NavLink
                          key={agent.id}
                          to={`/agent/${agent.id}`}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `relative flex items-center gap-2.5 pl-3.5 pr-2.5 py-2 rounded-md text-[13px] font-medium transition-all duration-200 mb-0.5 group
                            ${
                              isActive
                                ? 'bg-accent/15 text-accent dark:text-accent font-semibold shadow-sm'
                                : 'dark:text-text-secondary dark:hover:text-text-primary dark:hover:bg-white/10 text-gray-750 hover:text-gray-950 hover:bg-gray-150/50'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              {isActive && (
                                <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-accent rounded-r" />
                              )}
                              <IconComponent
                                size={15}
                                className="flex-shrink-0 transition-transform duration-200 group-hover:translate-x-[4px]"
                              />
                              <span className="truncate transition-transform duration-200 group-hover:translate-x-[4px]">
                                {agent.name}
                              </span>
                            </>
                          )}
                        </NavLink>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}

          {filteredAgents.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-gray-500 dark:text-text-muted">
              No agents found
            </div>
          )}
        </nav>

        <div className="mt-auto px-4 py-3 border-t dark:border-border border-gray-200">
          <div className="space-y-1.5">
            <a
              href="https://github.com/AditthyaSS/iloveAgents"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[11px] dark:text-text-secondary text-gray-500 hover:text-accent transition-colors font-medium"
            >
              GitHub →
            </a>

            <a
              href="https://github.com/AditthyaSS/iloveAgents/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[11px] dark:text-text-secondary text-gray-500 hover:text-accent transition-colors font-medium"
            >
              Contribute →
            </a>

            <span className="block text-[10px] dark:text-text-secondary/70 text-gray-400 font-medium">
              GSSoC 2026
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}