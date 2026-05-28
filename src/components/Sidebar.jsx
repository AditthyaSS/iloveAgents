import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { useAgents } from '../lib/useAgents'

export default function Sidebar({ open, onClose }) {
  const { agents } = useAgents()
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('')

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
        <div className="px-4 mb-2">
          <div className="relative group">
            <Icons.Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-text-muted group-focus-within:text-accent transition-colors"
            />
            <input
              type="text"
              placeholder="Search agents..."
              value={sidebarSearchQuery}
              onChange={(e) => setSidebarSearchQuery(e.target.value)}
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

        {/* Agent List */}
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          {categoryOrder.map((category) => (
            <div key={category} className="mb-3">
              <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest dark:text-text-muted text-gray-400">
                {category}
              </div>
              {categories[category].map((agent) => {
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
          ))}
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
