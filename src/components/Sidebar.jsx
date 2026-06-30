import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { loadAllAgents } from '../agents/registry'

export default function Sidebar({ open, onClose }) {
  const STORAGE_KEY = "sidebar-category-state";
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('')
  const [openCategories, setOpenCategories] = useState(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
});
  const [searchExpandedCategories, setSearchExpandedCategories] = useState({})
  const [agents, setAgents] = useState([])
  const location = useLocation()

  useEffect(() => {
    const fetchAgents = async () => {
      const allAgents = await loadAllAgents()
      setAgents(allAgents)
    }

    fetchAgents()
  }, [])
useEffect(() => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(openCategories)
  );
}, [openCategories]);
  // Auto-expand the category of the currently active agent
  useEffect(() => {
    const currentAgentId = location.pathname.startsWith('/agent/') ? location.pathname.split('/agent/')[1] : null
    if (currentAgentId && agents.length > 0) {
      const activeAgent = agents.find((a) => a.id === currentAgentId)
      if (activeAgent && activeAgent.category) {
        setOpenCategories((prev) => ({
          ...prev,
          [activeAgent.category]: true,
        }))
      }
    }
  }, [location.pathname, agents])

  const currentAgentId = location.pathname.startsWith('/agent/') ? location.pathname.split('/agent/')[1] : null
  const activeAgent = agents.find((a) => a.id === currentAgentId)
  const activeCategory = activeAgent ? activeAgent.category : null

  // Normalize the query (trim + lowercase) so matching is case-insensitive
  // and tolerant of leading/trailing whitespace in user input.
  const normalizedQuery = sidebarSearchQuery.trim().toLowerCase()
  const isSearching = normalizedQuery !== ''

  useEffect(() => {
    if (!isSearching) {
      setSearchExpandedCategories({})
    }
  }, [isSearching])

  // Filter agents based on search query
  const filteredAgents = !normalizedQuery
    ? agents
    : agents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(normalizedQuery) ||
        agent.category.toLowerCase().includes(normalizedQuery)
    )

  // Group agents by category
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
    }));
  } else {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !(prev[category] ?? true),
    }));
  }
};

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
          dark:border-border border-gray-200
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Background gradient & blur matching Navbar */}
        <div className="absolute inset-0 -z-10 bg-white/75 dark:bg-[#101014]/75 backdrop-blur-2xl" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cyan-400/20 via-indigo-400/20 to-rose-400/20 dark:from-cyan-500/10 dark:via-indigo-500/10 dark:to-rose-500/10 opacity-90" />

        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider dark:text-text-primary text-gray-800">
            Agents
          </span>

          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-accent/15 text-accent dark:text-accent-hover">
            {filteredAgents.length}
          </span>
        </div>

        {/* Search Input */}
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

        {/* Agent List */}
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          {/* Suites link */}
          <NavLink
            to="/suites"
            onClick={onClose}
            className={({ isActive }) =>
              `relative flex items-center gap-2.5 pl-3.5 pr-2.5 py-2 rounded-md text-[13px] font-medium transition-all duration-200 mb-2 group
              ${isActive
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

          {/* Scheduler link */}
          <NavLink
            to="/scheduler"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors mb-0.5
              ${isActive
                ? 'bg-accent/10 text-accent dark:text-accent'
                : 'dark:text-text-secondary dark:hover:text-text-primary dark:hover:bg-surface-hover text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`
            }
          >
            <Icons.CalendarClock size={15} className="flex-shrink-0" />
            <span className="truncate">Scheduler</span>
          </NavLink>

          <div className="border-b dark:border-border border-gray-100 mb-2" />

          {categoryOrder.map((category) => {
            const isActiveCategory = activeCategory === category;

const isCategoryExpanded = isSearching
  ? (searchExpandedCategories[category] ?? true)
  : (openCategories[category] ?? true);

            return (
              <div key={category} className="mb-3">
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  aria-expanded={isCategoryExpanded}
                  className={`w-full relative flex items-center justify-between gap-2 pl-3.5 pr-2.5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-200 group rounded-md
                    ${isActiveCategory
                      ? 'bg-accent/20 text-indigo-600 dark:text-indigo-400 font-extrabold'
                      : 'dark:text-text-primary text-gray-800 hover:bg-gray-100/70 dark:hover:bg-white/10 hover:text-accent dark:hover:text-white'
                    }`}
                >
                  {/* Left accent bar for active category */}
                  {isActiveCategory && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-accent rounded-r" />
                  )}

                  {/* Category Text (shifts on hover) */}
                  <span className="truncate transition-transform duration-200 ease-in-out group-hover:translate-x-[4px]">
                    {category}
                  </span>

                  {/* Right section: Badge + Chevron (both vertically centered) */}
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
  className={`overflow-hidden transition-all duration-300 ease-in-out ${
    isCategoryExpanded
      ? "max-h-screen opacity-100"
      : "max-h-0 opacity-0"
  }`}
>
  <div className="mt-0.5">
                    {categories[category].map((agent) => {
                      const IconComponent = Icons[agent.icon] || Icons.Bot

                      return (
                        <NavLink
                          key={agent.id}
                          to={`/agent/${agent.id}`}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `relative flex items-center gap-2.5 pl-3.5 pr-2.5 py-2 rounded-md text-[13px] font-medium transition-all duration-200 mb-0.5 group
                            ${isActive
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

        {/* Footer */}
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

