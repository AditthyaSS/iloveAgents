import { Award, HeartHandshake, Sparkles, ExternalLink, CheckCircle } from 'lucide-react'

export default function AboutGSSoC() {
  const highlights = [
    'Mentorship & Code Review guidance for student contributors.',
    'Beginner-friendly issues tagged with `gssoc2026` & `good first issue`.',
    'Fast-tracked PR reviews and transparent feedback.',
    'Opportunity to contribute to live AI agents used by real users.',
  ]

  return (
    <section aria-labelledby="about-gssoc-title" className="mb-12 rounded-3xl border border-indigo-500/30 dark:border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6 sm:p-10 shadow-lg backdrop-blur-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-bold tracking-wide">
            <Award size={14} />
            <span>Official Participating Project</span>
          </div>

          <h2 id="about-gssoc-title" className="text-2xl sm:text-3xl font-extrabold dark:text-white text-gray-900 tracking-tight">
            GirlScript Summer of Code 2026 (GSSoC '26)
          </h2>

          <p className="text-sm dark:text-text-secondary text-gray-600 leading-relaxed">
            <strong>iloveAgents</strong> is proud to participate in <strong>GSSoC 2026</strong> — a premier 3-month open-source program by GirlScript Foundation. We welcome contributors from around the globe to build features, create AI agents, and learn modern Web & AI engineering hands-on.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {highlights.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-medium dark:text-text-primary text-gray-800">
                <CheckCircle size={14} className="text-accent shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
          <a
            href="https://gssoc.girlscript.tech/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md transition-all duration-200"
          >
            <span>Visit GSSoC Website</span>
            <ExternalLink size={14} />
          </a>

          <a
            href="https://github.com/AditthyaSS/iloveAgents/issues?q=is%3Aissue+is%3Aopen+label%3Agssoc2026"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold dark:text-text-primary text-gray-800 dark:bg-white/10 bg-white border border-gray-200 dark:border-white/10 shadow-sm hover:bg-gray-100 dark:hover:bg-white/20 transition-all duration-200"
          >
            <Sparkles size={14} className="text-accent" />
            <span>Browse GSSoC Issues</span>
          </a>
        </div>
      </div>
    </section>
  )
}
