import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, Users, Code2, ArrowRight, Github, Search, X, SlidersHorizontal, Star, Heart, Swords, GitBranch } from 'lucide-react'
import agents from '../agents/registry'
import AgentCard from '../components/AgentCard'
import { useFavorites } from '../lib/useFavorites'

// Derive unique sorted categories from the registry
const allCategories = [...new Set(agents.map((a) => a.category))].sort()

// Category icons/colors for the filter pills
const categoryMeta = {
  Productivity: { color: 'from-blue-500 to-cyan-400',   ring: 'ring-blue-500/30' },
  Research:     { color: 'from-violet-500 to-purple-400', ring: 'ring-violet-500/30' },
  Marketing:    { color: 'from-pink-500 to-rose-400',    ring: 'ring-pink-500/30' },
  Engineering:  { color: 'from-emerald-500 to-green-400', ring: 'ring-emerald-500/30' },
  HR:           { color: 'from-amber-500 to-yellow-400',  ring: 'ring-amber-500/30' },
  Business:     { color: 'from-orange-500 to-amber-400',  ring: 'ring-orange-500/30' },
  Education:    { color: 'from-indigo-500 to-blue-400',   ring: 'ring-indigo-500/30' },
  Legal:        { color: 'from-red-500 to-rose-400',      ring: 'ring-red-500/30' },
  Design:       { color: 'from-fuchsia-500 to-pink-400',  ring: 'ring-fuchsia-500/30' },
  Product:      { color: 'from-teal-500 to-cyan-400',     ring: 'ring-teal-500/30' },
}

const defaultMeta = { color: 'from-gray-500 to-gray-400', ring: 'ring-gray-500/30' }

export default function HomePage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  
  const { favorites } = useFavorites()

const recentAgents = useMemo(() => {
  const recentIds = JSON.parse(
    localStorage.getItem('recentAgents') || '[]'
  )

  return recentIds
    .map((id) => agents.find((a) => a.id === id))
    .filter(Boolean)
}, [])

  // Resolve favorite agents (preserving the user's star order)
  const favoriteAgents = useMemo(() => {
    return favorites
      .map((id) => agents.find((a) => a.id === id))
      .filter(Boolean)
  }, [favorites])

  // Filter agents based on search + category
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchesCategory = !selectedCategory || agent.category === selectedCategory
      if (!matchesCategory) return false

      if (!searchQuery.trim()) return true

      const q = searchQuery.toLowerCase()
      return (
        agent.name.toLowerCase().includes(q) ||
        agent.description.toLowerCase().includes(q) ||
        agent.category.toLowerCase().includes(q)
      )
    })
  }, [searchQuery, selectedCategory])

  const showingFiltered = searchQuery.trim() || selectedCategory

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-10 pt-2">
        <h1 className="text-3xl sm:text-4xl font-bold dark:text-text-primary text-gray-900 mb-3 tracking-tight">
          AI Agents, ready to use.
        </h1>
        <p className="text-sm dark:text-text-secondary text-gray-500 max-w-md mx-auto leading-relaxed mb-4">
          Open source. Community-built. Bring your own key.
        </p>
        <button
          onClick={() => navigate('/battle')}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold
            bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-950
            hover:from-yellow-400 hover:to-amber-400 transition-all duration-200
            shadow-md shadow-yellow-500/20 hover:shadow-yellow-500/30 active:scale-[0.97]"
        >
          <Swords size={16} />
          Enter Battle Mode
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3 mb-10 max-w-lg mx-auto">
        <div className="text-center p-4 rounded-lg border transition-theme
          dark:bg-surface-card dark:border-border bg-white border-gray-200">
          <div className="flex justify-center mb-2">
            <Bot size={20} className="text-accent" />
          </div>
          <div className="text-xl font-bold dark:text-text-primary text-gray-900">
            {agents.length}
          </div>
          <div className="text-[11px] dark:text-text-muted text-gray-400 font-medium">
            Agents
          </div>
        </div>

        <div className="text-center p-4 rounded-lg border transition-theme
          dark:bg-surface-card dark:border-border bg-white border-gray-200">
          <div className="flex justify-center mb-2">
            <Users size={20} className="text-accent" />
          </div>
          <div className="text-xl font-bold dark:text-text-primary text-gray-900">
            3
          </div>
          <div className="text-[11px] dark:text-text-muted text-gray-400 font-medium">
            Providers
          </div>
        </div>

        <div className="text-center p-4 rounded-lg border transition-theme
          dark:bg-surface-card dark:border-border bg-white border-gray-200">
          <div className="flex justify-center mb-2">
            <Code2 size={20} className="text-accent" />
          </div>
          <div className="text-xl font-bold dark:text-text-primary text-gray-900">
            100%
          </div>
          <div className="text-[11px] dark:text-text-muted text-gray-400 font-medium">
            Open Source
          </div>
        </div>
      </div>

      {/* ── Favorites Section ── */}
      {favoriteAgents.length > 0 && !showingFiltered && (
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400">
              Your Favorites
            </h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-500 border border-yellow-400/20">
              {favoriteAgents.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {favoriteAgents.map((agent, idx) => (
              <div
                key={agent.id}
                className="animate-fade-in"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <AgentCard agent={agent} />
              </div>
            ))}
          </div>
        </div>
      )}
      {/* ── Recently Used Section ── */}
{recentAgents.length > 0 && !showingFiltered && (
  <div className="mb-8 animate-fade-in">
    <div className="flex items-center gap-2 mb-4">
      <Heart size={14} className="text-pink-400 fill-pink-400" />

      <h2 className="text-sm font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400">
        Recently Used
      </h2>

      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-pink-400/10 text-pink-500 border border-pink-400/20">
        {recentAgents.length}
      </span>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {recentAgents.map((agent, idx) => (
        <div
          key={agent.id}
          className="animate-fade-in"
          style={{ animationDelay: `${idx * 40}ms` }}
        >
          <AgentCard agent={agent} />
        </div>
      ))}
    </div>
  </div>
)}

      {/* ── Search & Category Filter Section ── */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search size={16} className="dark:text-text-muted text-gray-400" />
          </div>
          <input
            id="agent-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agents by name, description, or category..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm transition-all duration-200
              dark:bg-surface-card dark:border-border dark:text-text-primary dark:placeholder-text-muted
              bg-white border-gray-200 text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50
              hover:border-accent/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center
                dark:text-text-muted text-gray-400 hover:text-accent transition-colors"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <SlidersHorizontal size={14} className="dark:text-text-muted text-gray-400 flex-shrink-0" />
          <button
            id="filter-all"
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border
              ${!selectedCategory
                ? 'bg-accent text-white border-accent shadow-md shadow-accent/20'
                : 'dark:bg-surface-card dark:border-border dark:text-text-secondary dark:hover:border-accent/40 bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}
          >
            All
          </button>
          {allCategories.map((cat) => {
            const meta = categoryMeta[cat] || defaultMeta
            const isActive = selectedCategory === cat
            return (
              <button
                key={cat}
                id={`filter-${cat.toLowerCase()}`}
                onClick={() => setSelectedCategory(isActive ? null : cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border
                  ${isActive
                    ? `bg-gradient-to-r ${meta.color} text-white border-transparent shadow-md ring-2 ${meta.ring}`
                    : 'dark:bg-surface-card dark:border-border dark:text-text-secondary dark:hover:border-accent/40 bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
                  }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Agent Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400">
            {showingFiltered ? 'Matching Agents' : 'Available Agents'}
          </h2>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
            {filteredAgents.length} {filteredAgents.length === 1 ? 'agent' : 'agents'}
          </span>
        </div>

        {filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAgents.map((agent, idx) => (
              <div
                key={agent.id}
                className="animate-fade-in"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <AgentCard agent={agent} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-xl border dark:bg-surface-card dark:border-border bg-white border-gray-200">
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-accent" />
            </div>
            <h3 className="text-sm font-semibold dark:text-text-primary text-gray-900 mb-1">
              No agents found
            </h3>
            <p className="text-xs dark:text-text-secondary text-gray-500 mb-4">
              Try adjusting your search or removing category filters
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
            >
              Clear all filters <X size={12} />
            </button>
          </div>
        )}
      </div>

      {/* ── Workflows Section ── */}
      {!showingFiltered && (
        <div className="mb-8 animate-fade-in">
          <div
            className="rounded-xl border p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4
              dark:bg-surface-card dark:border-border bg-white border-gray-200"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <GitBranch size={20} className="text-accent" />
              </div>
              <div>
                <h2 className="text-sm font-semibold dark:text-text-primary text-gray-900">
                  Workflows
                </h2>
                <p className="text-xs dark:text-text-secondary text-gray-500 mt-0.5">
                  Community built AI workflows — connect agents and automate your process
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => navigate('/workflows')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  dark:bg-surface-input dark:border-border dark:text-text-secondary dark:hover:text-text-primary
                  bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900"
              >
                Explore Workflows
              </button>
              <button
                onClick={() => navigate('/workflows/build')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white
                  bg-accent hover:bg-accent-hover transition-all duration-200 active:scale-[0.97]"
              >
                Build a Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <div className="text-center py-8 border-t dark:border-border border-gray-200">
        <p className="text-xs dark:text-text-muted text-gray-400 mb-3">
          Built for GSSoC 2026
        </p>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
        >
          <Github size={14} />
          Contribute an agent on GitHub
          <ArrowRight size={12} />
        </a>
      </div>
    </div>
  )
}
