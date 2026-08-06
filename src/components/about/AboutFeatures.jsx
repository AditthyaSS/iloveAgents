import { Bot, Cpu, Swords, Workflow, Lock, FolderHeart } from 'lucide-react'

export default function AboutFeatures() {
  const features = [
    {
      title: '129+ Specialized AI Agents',
      description: 'Focused tools built for code reviews, SQL generation, blog optimization, resume screening, flashcard creation, and much more.',
      icon: Bot,
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-500',
    },
    {
      title: 'Multi-LLM Provider Support',
      description: 'Switch seamlessly between OpenAI (GPT-4o), Anthropic (Claude Sonnet), and Google (Gemini Flash) at runtime with zero setup.',
      icon: Cpu,
      color: 'from-violet-500/20 to-purple-500/20 text-violet-500',
    },
    {
      title: 'Battle Mode Arena',
      description: 'Pit three AI models head-to-head on the exact same prompt, compare speed & response quality, and pick the winner.',
      icon: Swords,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-500',
    },
    {
      title: 'AI Workflow Builder',
      description: 'Chain multiple agents together sequentially where the output of one agent automatically becomes the prompt input for the next.',
      icon: Workflow,
      color: 'from-pink-500/20 to-rose-500/20 text-pink-500',
    },
    {
      title: '100% Client-Side Privacy (BYOK)',
      description: 'Your API key never leaves your browser. Requests go directly from your client to the LLM provider — no middleman backend or database.',
      icon: Lock,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-500',
    },
    {
      title: 'Suites & Custom Collections',
      description: 'Group your favorite agents into personalized collections or answer quiz questions in the Suite Wizard to find the perfect tools.',
      icon: FolderHeart,
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-500',
    },
  ]

  return (
    <section aria-labelledby="about-features-title" className="mb-12">
      <div className="text-center mb-8">
        <h2 id="about-features-title" className="text-2xl sm:text-3xl font-bold dark:text-text-primary text-gray-900 tracking-tight mb-2">
          Key Platform Capabilities
        </h2>
        <p className="text-sm dark:text-text-secondary text-gray-600 max-w-xl mx-auto">
          Everything you need to turn raw AI models into actionable, daily productivity superpowers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon
          return (
            <div
              key={idx}
              className="rounded-2xl border dark:border-border border-gray-200 dark:bg-surface-card bg-white p-6 shadow-sm hover:border-accent/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-base font-bold dark:text-text-primary text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm dark:text-text-secondary text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
