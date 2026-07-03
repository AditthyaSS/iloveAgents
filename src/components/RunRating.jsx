import { useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

export default function RunRating() {
  const [rating, setRating] = useState(null) // 'up' | 'down' | null
  const [submitted, setSubmitted] = useState(false)

  const handleRate = (value) => {
    setRating(value)
    setSubmitted(true)
    // In a real app, send to analytics or database here
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 py-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 text-green-500">
          ✓
        </span>
        Thank you for your feedback!
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 py-2 border-t border-gray-100 dark:dark:border-border border-gray-200/60 mt-4 pt-4">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
        How was this output?
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => handleRate('up')}
          className="p-1.5 rounded-md text-gray-400 hover:text-green-500 hover:bg-green-500/10 transition-colors"
          title="Good output"
          aria-label="Rate as good output"
        >
          <ThumbsUp size={16} />
        </button>
        <button
          type="button"
          onClick={() => handleRate('down')}
          className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
          title="Bad output"
          aria-label="Rate as bad output"
        >
          <ThumbsDown size={16} />
        </button>
      </div>
    </div>
  )
}
