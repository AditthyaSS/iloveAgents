import { Bot, Users, Code2, ArrowRight, Github } from 'lucide-react'
import agents from '../agents/registry'
import AgentCard from '../components/AgentCard'

export default function HomePage() {
  const uniqueProviders = [...new Set(agents.map((a) => a.provider === 'any'
    ? (a.defaultProvider || 'openai')
    : a.provider))]

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-10 pt-2">
        <h1 className="text-3xl sm:text-4xl font-bold dark:text-text-primary text-gray-900 mb-3 tracking-tight">
          AI Agents, ready to use.
        </h1>
        <p className="text-sm dark:text-text-secondary text-gray-500 max-w-md mx-auto leading-relaxed">
          Open source. Community-built. Bring your own key.
        </p>
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

      {/* Agent Grid */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400 mb-4">
          Available Agents
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

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
