import { createContext, useContext, useState } from 'react'
import { Check, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      removeToast(id)
    }, 3000)
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-xl
              dark:bg-surface-card dark:border-border dark:text-text-primary
              bg-white border-gray-200 text-gray-900 animate-toast-in"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                <Check size={12} className="stroke-[3]" />
              </div>
              <span className="text-xs font-semibold tracking-wide truncate">
                {toast.message}
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="p-1 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-surface-hover text-gray-400 hover:text-gray-600 dark:hover:text-text-primary"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
