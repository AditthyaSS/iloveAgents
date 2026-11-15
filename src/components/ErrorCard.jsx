import { AlertTriangle, XCircle, Wifi } from 'lucide-react'

export default function ErrorCard({ message }) {
  const normalizedMessage =
    typeof message === 'string' ? message.toLowerCase() : ''

  let Icon = XCircle
  let color = 'error'

  if (normalizedMessage.includes('rate limit')) {
    Icon = AlertTriangle
    color = 'warning'
  } else if (
    normalizedMessage.includes('connection') ||
    normalizedMessage.includes('reach')
  ) {
    Icon = Wifi
    color = 'warning'
  }

  const isError = color === 'error'

  return (
    <div
      className={`rounded-lg border p-4 animate-fade-in ${
        isError
          ? 'bg-error/5 border-error/20'
          : 'bg-warning/5 border-warning/20'
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon
          size={18}
          className={`flex-shrink-0 mt-0.5 ${
            isError ? 'text-error' : 'text-warning'
          }`}
        />

        <div>
          <h4
            className={`text-sm font-semibold mb-1 ${
              isError ? 'text-error' : 'text-warning'
            }`}
          >
            {isError ? 'Error' : 'Warning'}
          </h4>

          {typeof message === 'string' ? (
            <p className="text-xs dark:text-text-secondary text-gray-600 leading-relaxed whitespace-pre-wrap">
              {message}
            </p>
          ) : (
            <div className="text-xs dark:text-text-secondary text-gray-600 leading-relaxed whitespace-pre-wrap">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
