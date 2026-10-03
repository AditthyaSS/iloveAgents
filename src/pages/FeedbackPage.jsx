import { Bug, Lightbulb, MessageSquare, ArrowUpRight } from 'lucide-react'

const GITHUB_ISSUES_URL = 'https://github.com/AditthyaSS/iloveAgents/issues/new'

const feedbackOptions = [
  {
    title: 'Report a bug',
    description: "Something isn't working as expected? Let us know what went wrong.",
    icon: Bug,
    url: `${GITHUB_ISSUES_URL}?template=bug_report.yml`,
  },
  {
    title: 'Suggest a feature',
    description: 'Have an idea that could make iloveAgents better? Share your suggestion.',
    icon: Lightbulb,
    url: `${GITHUB_ISSUES_URL}?template=feature_request.yml`,
  },
  {
    title: 'General feedback',
    description: 'Share your thoughts, experience, or anything else you would like us to know.',
    icon: MessageSquare,
    url: `${GITHUB_ISSUES_URL}?title=General%20Feedback&body=##%20General%20Feedback%0A%0AWhat%20would%20you%20like%20us%20to%20know%3F%0A%0A`,
  },
]

export default function FeedbackPage() {
  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-10">
      <div className="max-w-2xl mb-10">
        <p className="text-sm font-medium text-accent mb-2">We'd love to hear from you</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          Feedback
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
          Help us improve iloveAgents by reporting issues, suggesting features,
          or sharing your experience.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {feedbackOptions.map(({ title, description, icon: Icon, url }) => (
          <a
            key={title}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 hover:border-accent/50 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-accent/10 text-accent">
                <Icon size={22} />
              </div>

              <ArrowUpRight
                size={18}
                className="text-gray-400 group-hover:text-accent transition-colors"
              />
            </div>

            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {description}
            </p>
          </a>
        ))}
      </div>

      <p className="mt-8 text-sm text-gray-500 dark:text-gray-500 text-center">
        Feedback will open GitHub so the maintainers can review and respond to it.
      </p>
    </div>
  )
}