import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import * as Icons from 'lucide-react'
import agents from '../agents/registry'

export default function Sidebar({ open, onClose }) {
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState(() => new Set())
  const location = useLocation()
  const activeAgent = useMemo(
    () => agents.find((agent) => location.pathname === `/agent/${agent.id}`),
    [location.pathname]
  )

  // Filter agents based on search query
  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(sidebarSearchQuery.toLowerCase()) ||
    agent.category.toLowerCase().includes(sidebarSearchQuery.toLowerCase())
  )

  // Group agents by category
  const categories = filteredAgents.reduce((acc, agent) => {
    if (!acc[agent.category]) acc[agent.category] = []
    acc[agent.category].push(agent)
    return acc
  }, {})

  const categoryOrder = Object.keys(categories)
  const hasSearchQuery = sidebarSearchQuery.trim().length > 0
  const allCategoriesExpanded =
    categoryOrder.length > 0 &&
    categoryOrder.every((category) => expandedCategories.has(category))

  useEffect(() => {
    if (!activeAgent) return

    setExpandedCategories((current) => {
      if (current.has(activeAgent.category)) return current

      const next = new Set(current)
      next.add(activeAgent.category)
      return next
    })
  }, [activeAgent])

  const toggleCategory = (category) => {
    setExpandedCategories((current) => {
      const next = new Set(current)

      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }

      return next
    })
  }

  const toggleAllCategories = () => {
    setExpandedCategories(() => {
      if (allCategoriesExpanded) return new Set()

      return new Set(categoryOrder)
    })
  }

  const updateSearchQuery = (event) => {
    const nextQuery = event.target.value

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextQuery.trim())) {
      event.target.value = ''
      setSidebarSearchQuery('')
      return
    }

    setSidebarSearchQuery(nextQuery)
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

    <aside
      className={`fixed top-14 left-0 bottom-0 z-40 w-60 flex flex-col border-r transition-all duration-200
        dark:bg-surface dark:border-border bg-white border-gray-200
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
    >
      
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400">
            Agents
          </span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">
            {filteredAgents.length}
          </span>
        </div>

        {/* Search Input */}
        <div className="px-4 mb-3">
          <div className="relative group">
            <Icons.Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-text-muted group-focus-within:text-accent transition-colors"
            />
            <input
              type="search"
              name="ila-agent-filter"
              autoComplete="new-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              data-lpignore="true"
              data-1p-ignore="true"
              placeholder="Search agents..."
              value={sidebarSearchQuery}
              onChange={updateSearchQuery}
              className="w-full pl-8 pr-8 py-1.5 text-[12px] rounded-md border transition-all
                dark:bg-surface-hover dark:border-border dark:text-text-primary dark:focus:border-accent/40
                bg-gray-50 border-gray-200 text-gray-900 focus:border-accent/40 focus:ring-1 focus:ring-accent/10 outline-none"
            />
            {sidebarSearchQuery && (
              <button
                onClick={() => setSidebarSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-text-muted dark:hover:text-text-primary transition-colors"
              >
                <Icons.X size={14} />
              </button>
            )}
          </div>
        </div>

        {categoryOrder.length > 0 && !hasSearchQuery && (
          <div className="px-4 mb-2">
            <button
              type="button"
              onClick={toggleAllCategories}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors
                dark:border-border dark:text-text-secondary dark:hover:bg-surface-hover dark:hover:text-text-primary
                border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            >
              {allCategoriesExpanded ? (
                <Icons.ChevronsUp size={13} />
              ) : (
                <Icons.ChevronsDown size={13} />
              )}
              <span>{allCategoriesExpanded ? 'Collapse all' : 'Expand all'}</span>
            </button>
          </div>
        )}

        {/* Agent List */}
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          {categoryOrder.map((category) => {
            const categoryAgents = categories[category]
            const isExpanded = hasSearchQuery || expandedCategories.has(category)

            return (
              <div key={category} className="mb-1">
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  aria-expanded={isExpanded}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors
                    dark:text-text-secondary dark:hover:text-text-primary dark:hover:bg-surface-hover
                    text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  {isExpanded ? (
                    <Icons.ChevronDown size={14} className="flex-shrink-0" />
                  ) : (
                    <Icons.ChevronRight size={14} className="flex-shrink-0" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-[11px] font-semibold uppercase tracking-widest">
                    {category}
                  </span>
                  <span className="flex-shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-surface-hover dark:text-text-muted">
                    {categoryAgents.length}
                  </span>
                </button>

                {isExpanded && (
                  <div className="mt-1 pl-4">
                    {categoryAgents.map((agent) => {
                      const IconComponent = Icons[agent.icon] || Icons.Bot
                      return (
                        <NavLink
                          key={agent.id}
                          to={`/agent/${agent.id}`}
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
                          <IconComponent size={15} className="flex-shrink-0" />
                          <span className="truncate">{agent.name}</span>
                        </NavLink>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
          {filteredAgents.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-gray-400 dark:text-text-muted">
              No agents found
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="mt-auto px-4 py-3 border-t dark:border-border border-gray-200">
          <div className="space-y-1.5">
            <a
              href="https://github.com/AditthyaSS/iloveAgents"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[11px] dark:text-text-muted text-gray-400 hover:text-accent transition-colors"
            >
              GitHub →
            </a>
            <a
              href="https://github.com/AditthyaSS/iloveAgents/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[11px] dark:text-text-muted text-gray-400 hover:text-accent transition-colors"
            >
              Contribute →
            </a>
            <span className="block text-[10px] dark:text-text-muted/60 text-gray-300">
              GSSoC 2026
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}
