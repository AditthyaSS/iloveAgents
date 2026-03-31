import { AlertTriangle, XCircle, Wifi } from 'lucide-react'

export default function ErrorCard({ message }) {
  // Determine icon based on error content
  let Icon = XCircle
  let color = 'error'
  if (message.includes('Rate limit')) {
    Icon = AlertTriangle
    color = 'warning'
  } else if (message.includes('connection') || message.includes('reach')) {
    Icon = Wifi
    color = 'warning'
  }

  return (
    <div className={`rounded-lg border p-4 animate-fade-in
      ${color === 'error'
        ? 'bg-error/5 border-error/20'
        : 'bg-warning/5 border-warning/20'
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon
          size={18}
          className={`flex-shrink-0 mt-0.5 ${
            color === 'error' ? 'text-error' : 'text-warning'
          }`}
        />
        <div>
          <h4 className={`text-sm font-semibold mb-1 ${
            color === 'error' ? 'text-error' : 'text-warning'
          }`}>
            {color === 'error' ? 'Error' : 'Warning'}
          </h4>
          <p className="text-xs dark:text-text-secondary text-gray-600 leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}
