import { useEffect, useState } from 'react'
import { ArrowLeft, Clock3, Loader2, Share2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import OutputRenderer from '../components/OutputRenderer'
import { getSharedOutput } from '../lib/shareOutput'

export default function SharedOutputPage() {
  const { id } = useParams()
  const [sharedOutput, setSharedOutput] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getSharedOutput(id)
      .then((data) => {
        if (!active) return
        if (!data) setError('This shared output was not found or has expired.')
        else setSharedOutput(data)
      })
      .catch(() => active && setError('This shared output could not be loaded.'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [id])

  return (
    <main className="min-h-screen dark:bg-surface bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-accent hover:underline">
          <ArrowLeft size={15} /> Explore iloveAgents
        </Link>

        {loading && (
          <div className="mt-20 flex items-center justify-center gap-2 text-sm dark:text-text-secondary text-gray-500">
            <Loader2 size={18} className="animate-spin text-accent" /> Loading shared output...
          </div>
        )}

        {!loading && error && (
          <section className="mt-10 rounded-xl border p-8 text-center dark:border-border dark:bg-surface-card border-gray-200 bg-white">
            <Share2 size={28} className="mx-auto mb-3 text-gray-400" />
            <h1 className="text-lg font-semibold dark:text-text-primary text-gray-900">Shared output unavailable</h1>
            <p className="mt-2 text-sm dark:text-text-secondary text-gray-500">{error}</p>
          </section>
        )}

        {sharedOutput && (
          <article className="mt-8">
            <header className="mb-6">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
                <Share2 size={14} /> Shared agent output
              </div>
              <h1 className="text-2xl font-bold dark:text-text-primary text-gray-900">{sharedOutput.agent_name}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-xs dark:text-text-muted text-gray-500">
                <Clock3 size={13} /> Generated {new Date(sharedOutput.created_at).toLocaleString()}
              </p>
            </header>

            {Object.keys(sharedOutput.inputs || {}).length > 0 && (
              <section className="mb-5 rounded-lg border p-4 dark:border-border dark:bg-surface-card border-gray-200 bg-white">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400">Inputs</h2>
                <dl className="space-y-3">
                  {Object.entries(sharedOutput.inputs).map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs font-medium dark:text-text-secondary text-gray-500">{label}</dt>
                      <dd className="mt-0.5 whitespace-pre-wrap text-sm dark:text-text-primary text-gray-900">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <OutputRenderer
              content={sharedOutput.output}
              outputType={sharedOutput.output_type}
              agentName={sharedOutput.agent_name}
              showToolbar={false}
            />
            <footer className="mt-12 border-t pt-6 text-center text-xs dark:border-border dark:text-text-muted border-gray-200 text-gray-400">
              Shared via AgentRunner
            </footer>
          </article>
        )}
      </div>
    </main>

  )
}
