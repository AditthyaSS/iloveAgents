import { Link } from 'react-router-dom'
import { Sparkles, Github, ArrowRight, Heart } from 'lucide-react'

export default function AboutHero() {
  return (
    <section aria-labelledby="about-hero-title" className="relative overflow-hidden rounded-3xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-[#101014]/60 p-6 sm:p-10 md:p-12 shadow-xl backdrop-blur-xl mb-12">
      {/* Background glow accents */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wide">
          <Sparkles size={14} className="animate-pulse" />
          <span>Open Source • Community Driven • Zero Backend</span>
        </div>

        {/* Project Title */}
        <h1 id="about-hero-title" className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight dark:text-white text-gray-900 leading-tight">
          Welcome to <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">iloveAgents</span>
        </h1>

        {/* Short Project Overview & Mission Statement */}
        <p className="text-base sm:text-lg dark:text-text-secondary text-gray-600 max-w-3xl mx-auto leading-relaxed">
          <strong>iloveAgents</strong> is an open-source platform designed to make AI tools accessible, transparent, and effortlessly executable directly inside your browser. Bring your own API key, keep 100% data privacy, and explore specialized agents built for real-world tasks.
        </p>

        {/* Mission Card */}
        <div className="p-4 sm:p-6 rounded-2xl border dark:border-white/10 dark:bg-surface-card/60 bg-indigo-50/50 border-indigo-100/80 text-left backdrop-blur-md max-w-2xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-accent shrink-0 mt-0.5">
              <Heart size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold dark:text-text-primary text-gray-900 mb-1">
                Our Mission
              </h2>
              <p className="text-xs sm:text-sm dark:text-text-secondary text-gray-600 leading-relaxed">
                To democratize AI automation by fostering a global community of developers, creators, and students who build, chain, and share open-source AI tools without paywalls, telemetry, or server lock-in.
              </p>
            </div>
          </div>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-violet-500/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <span>Explore 129+ Agents</span>
            <ArrowRight size={16} />
          </Link>

          <a
            href="https://github.com/AditthyaSS/iloveAgents"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Star iloveAgents on GitHub (opens in new tab)"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold dark:text-text-primary text-gray-800 dark:bg-white/10 bg-white border border-gray-200 dark:border-white/10 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100 dark:hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <Github size={16} />
            <span>Star on GitHub</span>
          </a>

          <Link
            to="/workflows"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold dark:text-text-secondary text-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span>Browse Workflows</span>
          </Link>
        </div>

        {/* Quick Highlights / Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t dark:border-white/10 border-gray-200/80">
          <div className="p-3 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-accent">129+</div>
            <div className="text-xs dark:text-text-secondary text-gray-500 font-medium">Ready-to-use Agents</div>
          </div>
          <div className="p-3 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-accent">3+</div>
            <div className="text-xs dark:text-text-secondary text-gray-500 font-medium">AI Providers</div>
          </div>
          <div className="p-3 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-accent">100%</div>
            <div className="text-xs dark:text-text-secondary text-gray-500 font-medium">Browser Privacy</div>
          </div>
          <div className="p-3 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-accent">GSSoC '26</div>
            <div className="text-xs dark:text-text-secondary text-gray-500 font-medium">Official Project</div>
          </div>
        </div>
      </div>
    </section>
  )
}
