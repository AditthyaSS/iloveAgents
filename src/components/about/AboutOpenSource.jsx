import { Code2, GitPullRequest, GitFork, CheckCircle2, Terminal, ShieldAlert } from 'lucide-react'

export default function AboutOpenSource() {
  const steps = [
    {
      step: '01',
      title: 'Fork & Clone',
      description: 'Fork the repository on GitHub and clone your fork locally. Install dependencies using npm install.',
      command: 'git clone https://github.com/YOUR_USERNAME/iloveAgents.git',
    },
    {
      step: '02',
      title: 'Create Branch',
      description: 'Always create a feature branch for your changes (e.g. agent/new-agent or fix/bug-name).',
      command: 'git checkout -b agent/my-new-agent',
    },
    {
      step: '03',
      title: 'Add Agent / Code',
      description: 'Add a new agent definition in src/agents/definitions/ in 5 minutes — registry picks it up automatically.',
      command: 'src/agents/definitions/my-new-agent.js',
    },
    {
      step: '04',
      title: 'Validate & Build',
      description: 'Run local build check before opening a PR to ensure zero compilation or syntax issues.',
      command: 'npm run build',
    },
  ]

  return (
    <section aria-labelledby="about-opensource-title" className="mb-12 rounded-3xl border dark:border-border border-gray-200 dark:bg-surface-card/70 bg-gradient-to-b from-white to-indigo-50/30 p-6 sm:p-10 shadow-md">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 pb-6 border-b dark:border-border border-gray-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
            <Code2 size={14} />
            <span>100% Open Source • MIT Licensed</span>
          </div>
          <h2 id="about-opensource-title" className="text-2xl sm:text-3xl font-bold dark:text-text-primary text-gray-900 tracking-tight">
            Open Source Philosophy & Contribution Workflow
          </h2>
        </div>
        <a
          href="https://github.com/AditthyaSS/iloveAgents/blob/main/CONTRIBUTING.md"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm shrink-0"
        >
          <GitPullRequest size={15} />
          <span>Read Full Contributing Guide</span>
        </a>
      </div>

      <p className="text-sm dark:text-text-secondary text-gray-600 mb-8 leading-relaxed">
        iloveAgents is built by developers, designers, and AI enthusiasts around the world. Every line of code, agent prompt, and UI component is open to public inspection, contribution, and improvement. We maintain a zero-gatekeeping environment where even first-time open-source contributors can make a meaningful impact.
      </p>

      {/* Contribution Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {steps.map((item, i) => (
          <div key={i} className="rounded-2xl border dark:border-white/10 border-gray-200/80 dark:bg-black/20 bg-white p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-accent bg-accent/10 px-2.5 py-1 rounded-lg">
                  Step {item.step}
                </span>
                <Terminal size={14} className="dark:text-text-muted text-gray-400" />
              </div>
              <h3 className="text-sm font-bold dark:text-text-primary text-gray-900 mb-1">
                {item.title}
              </h3>
              <p className="text-xs dark:text-text-secondary text-gray-600 leading-relaxed mb-3">
                {item.description}
              </p>
            </div>
            <code className="block text-[11px] font-mono dark:bg-black/40 bg-gray-100 dark:text-indigo-300 text-gray-800 p-2 rounded-lg truncate border dark:border-white/5 border-gray-200">
              {item.command}
            </code>
          </div>
        ))}
      </div>

      {/* Verification Rule Note */}
      <div className="flex items-start gap-3 p-4 rounded-xl dark:bg-amber-500/10 bg-amber-50 border dark:border-amber-500/20 border-amber-200 text-xs dark:text-amber-300 text-amber-900">
        <ShieldAlert size={18} className="shrink-0 mt-0.5" />
        <div>
          <strong>Important Requirement Before Opening PR:</strong> Always run <code className="font-mono bg-amber-200/50 dark:bg-amber-950/50 px-1 py-0.5 rounded">npm run build</code> locally to ensure there are no build errors. Clean, building code keeps the repository healthy for everyone!
        </div>
      </div>
    </section>
  )
}
