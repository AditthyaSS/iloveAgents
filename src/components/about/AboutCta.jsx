import { Link } from 'react-router-dom'
import { Sparkles, Github, GitPullRequest, ArrowRight, PlusCircle } from 'lucide-react'

export default function AboutCta() {
  return (
    <section aria-labelledby="about-cta-title" className="relative overflow-hidden rounded-3xl border border-indigo-500/30 dark:border-indigo-500/20 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-8 sm:p-12 text-white text-center shadow-2xl">
      {/* Glow overlays */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-pink-500/20 blur-2xl" />

      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-md border border-white/20">
          <Sparkles size={14} className="text-yellow-300" />
          <span>Join 100+ Community Contributors</span>
        </div>

        <h2 id="about-cta-title" className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
          Ready to Shape the Future of Open AI Tools?
        </h2>

        <p className="text-sm sm:text-base text-indigo-100 max-w-2xl mx-auto leading-relaxed">
          Whether you want to add a 5-minute agent, polish UI components, or fix open issues — your contributions power this platform.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="https://github.com/AditthyaSS/iloveAgents/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-indigo-950 bg-white hover:bg-gray-100 shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            <GitPullRequest size={16} />
            <span>Explore Open Issues</span>
          </a>

          <a
            href="https://github.com/AditthyaSS/iloveAgents"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5"
          >
            <Github size={16} />
            <span>Star on GitHub</span>
          </a>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white bg-indigo-950/40 hover:bg-indigo-950/60 border border-white/20 transition-all duration-300"
          >
            <PlusCircle size={16} />
            <span>Use AI Agents Now</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
