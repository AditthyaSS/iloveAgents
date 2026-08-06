import { Users, Heart, Trophy, MessageSquare, Star } from 'lucide-react'

export default function AboutCommunity() {
  return (
    <section aria-labelledby="about-community-title" className="mb-12">
      <div className="flex items-center gap-2 mb-3">
        <Users className="text-accent" size={22} />
        <h2 id="about-community-title" className="text-2xl sm:text-3xl font-bold dark:text-text-primary text-gray-900 tracking-tight">
          Community & Contributor Appreciation
        </h2>
      </div>

      <p className="text-sm dark:text-text-secondary text-gray-600 mb-8 max-w-3xl leading-relaxed">
        iloveAgents thrives on collective intelligence. Every contributor who submits an agent, fixes a typo, optimizes CSS, or reviews code is an essential builder of this platform.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border dark:border-border border-gray-200 dark:bg-surface-card bg-white p-6 shadow-sm hover:border-accent/40 transition-all">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 w-fit mb-4">
            <Heart size={22} />
          </div>
          <h3 className="text-base font-bold dark:text-text-primary text-gray-900 mb-2">
            Contributor First
          </h3>
          <p className="text-xs sm:text-sm dark:text-text-secondary text-gray-600 leading-relaxed">
            We value your time. Our contribution guide is designed to get your first PR merged in under 15 minutes with clear feedback and zero bureaucracy.
          </p>
        </div>

        <div className="rounded-2xl border dark:border-border border-gray-200 dark:bg-surface-card bg-white p-6 shadow-sm hover:border-accent/40 transition-all">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 w-fit mb-4">
            <Trophy size={22} />
          </div>
          <h3 className="text-base font-bold dark:text-text-primary text-gray-900 mb-2">
            Hall of Fame
          </h3>
          <p className="text-xs sm:text-sm dark:text-text-secondary text-gray-600 leading-relaxed">
            All contributors are permanently celebrated in our repository's Hall of Fame. Your name and agent contributions leave a lasting mark.
          </p>
        </div>

        <div className="rounded-2xl border dark:border-border border-gray-200 dark:bg-surface-card bg-white p-6 shadow-sm hover:border-accent/40 transition-all">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 w-fit mb-4">
            <MessageSquare size={22} />
          </div>
          <h3 className="text-base font-bold dark:text-text-primary text-gray-900 mb-2">
            Open Collaboration
          </h3>
          <p className="text-xs sm:text-sm dark:text-text-secondary text-gray-600 leading-relaxed">
            Have an idea for a new agent category or workflow feature? Join GitHub Discussions to brainstorm with maintainers and fellow developers.
          </p>
        </div>
      </div>
    </section>
  )
}
