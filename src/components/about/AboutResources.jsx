import { Github, BookOpen, GitPullRequest, AlertCircle, MessageSquare, ExternalLink } from 'lucide-react'

export default function AboutResources() {
  const resources = [
    {
      title: 'GitHub Repository',
      description: 'Explore the full codebase, star the project, or fork your own copy.',
      url: 'https://github.com/AditthyaSS/iloveAgents',
      icon: Github,
      tag: 'Source Code',
    },
    {
      title: 'Documentation',
      description: 'Read setup guides, architecture overviews, and supported provider details.',
      url: 'https://github.com/AditthyaSS/iloveAgents#readme',
      icon: BookOpen,
      tag: 'Docs',
    },
    {
      title: 'Contribution Guide',
      description: 'Step-by-step instructions on adding agents, bug fixing, and submitting PRs.',
      url: 'https://github.com/AditthyaSS/iloveAgents/blob/main/CONTRIBUTING.md',
      icon: GitPullRequest,
      tag: 'Guide',
    },
    {
      title: 'Issues & Tasks',
      description: 'Find open bug reports, feature requests, and beginner-friendly tasks.',
      url: 'https://github.com/AditthyaSS/iloveAgents/issues',
      icon: AlertCircle,
      tag: 'Issues',
    },
    {
      title: 'Discussions',
      description: 'Share feedback, pitch agent ideas, or get help from the community.',
      url: 'https://github.com/AditthyaSS/iloveAgents/discussions',
      icon: MessageSquare,
      tag: 'Community',
    },
  ]

  return (
    <section aria-labelledby="about-resources-title" className="mb-12">
      <div className="mb-8">
        <h2 id="about-resources-title" className="text-2xl sm:text-3xl font-bold dark:text-text-primary text-gray-900 tracking-tight mb-2">
          Useful Resources & Quick Links
        </h2>
        <p className="text-sm dark:text-text-secondary text-gray-600">
          Everything you need to navigate, understand, and contribute to the iloveAgents ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((res, i) => {
          const Icon = res.icon
          return (
            <a
              key={i}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-2xl border dark:border-border border-gray-200 dark:bg-surface-card bg-white p-5 shadow-sm hover:border-accent/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-accent/10 text-accent group-hover:scale-105 transition-transform">
                    <Icon size={20} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full dark:bg-white/10 bg-gray-100 dark:text-text-secondary text-gray-600">
                    {res.tag}
                  </span>
                </div>
                <h3 className="text-sm font-bold dark:text-text-primary text-gray-900 mb-1 group-hover:text-accent transition-colors flex items-center gap-1.5">
                  <span>{res.title}</span>
                  <ExternalLink size={13} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs dark:text-text-secondary text-gray-600 leading-relaxed">
                  {res.description}
                </p>
              </div>
            </a>
          )
        })}
      </div>
    </section>
  )
}
