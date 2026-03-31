import { NavLink } from 'react-router-dom'
import * as Icons from 'lucide-react'
import agents from '../agents/registry'

export default function Sidebar({ open, onClose }) {
  // Group agents by category
  const categories = agents.reduce((acc, agent) => {
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
            {agents.length}
          </span>
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
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t dark:border-border border-gray-200">
          <div className="space-y-1.5">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[11px] dark:text-text-muted text-gray-400 hover:text-accent transition-colors"
            >
              GitHub →
            </a>
            <a
              href="https://github.com"
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
