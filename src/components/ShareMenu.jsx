import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Copy, Link, Loader2, Share2 } from 'lucide-react'
import { buildShareCard, createSharedOutput, getShareableInputs } from '../lib/shareOutput'
import { useToast } from '../lib/useToast'

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}

export default function ShareMenu({ agent, inputs, output }) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const menuRef = useRef(null)
  const { addToast } = useToast()

  useEffect(() => {
    if (!open) return undefined
    const closeMenu = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', closeMenu)
    return () => document.removeEventListener('mousedown', closeMenu)
  }, [open])

  const handleCopyCard = async () => {
    setError('')
    try {
      await copyText(buildShareCard({
        agentName: agent.name,
        inputs: getShareableInputs(inputs, agent.inputs),
        output,
      }))
      setStatus('copied-card')
      addToast('Copied as formatted card')
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setError('Could not copy the card. Please try again.')
    }
  }

  const handleCreateLink = async () => {
    setError('')
    setStatus('creating-link')
    try {
      const shared = await createSharedOutput({ agent, inputs, output })
      await copyText(shared.url)
      setStatus('copied-link')
      addToast('Share link copied')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setStatus('idle')
      setError('Could not create a shareable link. Please try again.')
    }
  }


  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors
          dark:bg-surface-input dark:text-text-secondary dark:hover:text-text-primary dark:border-border
          bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-200"
      >
        <Share2 size={12} />
        Share
        <ChevronDown size={11} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 w-72 overflow-hidden rounded-xl border
            dark:border-border dark:bg-surface-card bg-white border-gray-200 shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleCopyCard}
            className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-surface-hover"
          >
            {status === 'copied-card' ? <Check size={16} className="mt-0.5 text-success" /> : <Copy size={16} className="mt-0.5 text-accent" />}
            <span>
              <span className="block text-sm font-medium dark:text-text-primary text-gray-900">
                {status === 'copied-card' ? 'Card copied!' : 'Copy as formatted card'}
              </span>
              <span className="block mt-0.5 text-xs dark:text-text-muted text-gray-500">
                Markdown with the agent, timestamp, inputs, and output.
              </span>
            </span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={handleCreateLink}
            disabled={status === 'creating-link'}
            className="w-full flex items-start gap-3 border-t px-4 py-3 text-left hover:bg-gray-50
              disabled:cursor-wait disabled:opacity-70 dark:border-border dark:hover:bg-surface-hover border-gray-100"
          >
            {status === 'creating-link' ? (
              <Loader2 size={16} className="mt-0.5 animate-spin text-accent" />
            ) : status === 'copied-link' ? (
              <Check size={16} className="mt-0.5 text-success" />
            ) : (
              <Link size={16} className="mt-0.5 text-accent" />
            )}
            <span>
              <span className="block text-sm font-medium dark:text-text-primary text-gray-900">
                {status === 'copied-link' ? 'Link copied!' : 'Create shareable link'}
              </span>
              <span className="block mt-0.5 text-xs dark:text-text-muted text-gray-500">
                Anyone with the link can view it for 7 days. No login required.
              </span>
            </span>
          </button>

          {error && <p role="alert" className="border-t px-4 py-2 text-xs text-error dark:border-border border-gray-100">{error}</p>}
        </div>
      )}
    </div>
  )
}
