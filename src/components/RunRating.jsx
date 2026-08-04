import { useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { useAgentRatings } from '../lib/useAgentRatings.js'

export default function RunRating({ agentId }) {
  const [submitted, setSubmitted] = useState(false)
  const { rateAgent } = useAgentRatings()

  const handleRate = (value) => {
    setSubmitted(true)
    if (agentId) {
      rateAgent(agentId, value)
    }
  }

  if (submitted) {
    return (
      <div className="w-full py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm text-center text-gray-600 dark:text-gray-300 transition-all">
        Thank you for your feedback!
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        How was this output?
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleRate('up')}
          className="flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 hover:bg-green-500/10 transition-colors"
          title="Good output"
        >
          <ThumbsUp size={18} />
        </button>
        <button
          type="button"
          onClick={() => handleRate('down')}
          className="flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Bad output"
        >
          <ThumbsDown size={18} />
        </button>
      </div>
    </div>
  )
}