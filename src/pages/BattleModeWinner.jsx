import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Trophy, Copy, Check, RotateCcw, ArrowLeft, Share2 } from 'lucide-react'
import BattleNavbar from '../components/BattleNavbar'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { launchConfetti } from '../lib/confetti'

const colorMap = {
  yellow: { bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', text: 'text-yellow-400', hoverBorder: 'hover:border-yellow-400/60', shadow: 'hover:shadow-yellow-400/30', lightBg: 'bg-yellow-400/5' },
  violet: { bg: 'bg-violet-400/10', border: 'border-violet-400/30', text: 'text-violet-400', hoverBorder: 'hover:border-violet-400/60', shadow: 'hover:shadow-violet-400/30', lightBg: 'bg-violet-400/5' },
  blue: { bg: 'bg-blue-400/10', border: 'border-blue-400/30', text: 'text-blue-400', hoverBorder: 'hover:border-blue-400/60', shadow: 'hover:shadow-blue-400/30', lightBg: 'bg-blue-400/5' },
  teal: { bg: 'bg-teal-400/10', border: 'border-teal-400/30', text: 'text-teal-400', hoverBorder: 'hover:border-teal-400/60', shadow: 'hover:shadow-teal-400/30', lightBg: 'bg-teal-400/5' },
}

export default function BattleModeWinner() {
  const navigate = useNavigate()
  const location = useLocation()
  const { provider, content, duration, agentName } = location.state || {}
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)
  useDocumentTitle(agentName ? `${agentName} Battle Winner` : 'Battle Winner')

  useEffect(() => {
    if (!provider || !content) return
    const stopConfetti = launchConfetti({ duration: 3200, particleCount: 85 })
    return () => {
      stopConfetti?.()
    }
  }, [provider, content])

  if (!provider || !content) {
    navigate('/battle', { replace: true })
    return null
  }

  const colors = colorMap[provider.color] || colorMap.yellow

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = content
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    const shareText = `Battle Mode Winner: ${provider.label}\n${agentName ? `Agent: ${agentName}\n` : ''}${duration ? `Duration: ${(duration / 1000).toFixed(1)}s\n` : ''}\nOutput:\n${content}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Battle Winner: ${provider.label}`,
          text: shareText,
        })
        setShared(true)
        setTimeout(() => setShared(false), 2000)
        return
      } catch (err) {
        if (err.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(shareText)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = shareText
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    }
  }

  return (
    <div className="min-h-screen dark:bg-surface bg-gray-50 text-white battle-page-transition">
      <main className="pt-14 max-w-3xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10 battle-fade-in">
          {/* Large Trophy Icon with pulse glow */}
          <div className={`w-28 h-28 rounded-2xl ${colors.bg} border-2 ${colors.border}
            flex items-center justify-center mx-auto mb-6
            battle-glow-pulse
            transition-all duration-300 cursor-default shadow-xl`}>
            <Trophy size={56} className={`${colors.text} drop-shadow-[0_0_25px_rgba(0,0,0,0.3)]`} />
          </div>

          {/* Winner card slides up */}
          <div className="battle-step-in mb-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-wider mb-2 bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
              Victory!
            </h1>
            <p className="text-lg sm:text-xl font-bold mb-1 text-gray-800 dark:text-gray-100">
              You chose <span className={colors.text}>{provider.label}</span> as the winner
            </p>
            <p className="text-xs dark:text-text-muted text-gray-500 font-medium">
              {agentName && `Agent: ${agentName}`}
              {duration && ` \u00B7 ${(duration / 1000).toFixed(1)}s`}
            </p>
          </div>
        </div>

        {/* Winning Output */}
        <div className={`rounded-xl border ${colors.border} ${colors.lightBg} p-6 mb-8 battle-fade-in
          hover:border-opacity-60 transition-all duration-300 shadow-md`}
          style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest dark:text-text-muted text-gray-500">
              Winning Output
            </span>
          </div>
          <div className="markdown-output text-sm dark:text-text-primary text-gray-900 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={handleShare}
            style={{ animationDelay: '200ms' }}
            className="battle-fade-in flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold
              dark:bg-surface-input bg-gray-50 border border-gray-700/60 dark:text-text-primary text-gray-900
              hover:bg-gray-900/80 hover:border-gray-600 hover:shadow-lg hover:shadow-gray-900/40
              transition-all duration-200 active:scale-95 battle-btn-secondary"
            title="Share result summary"
          >
            {shared ? <Check size={16} className="text-green-400" /> : <Share2 size={16} />}
            {shared ? 'Result Copied!' : 'Share Result'}
          </button>

          <button
            onClick={handleCopy}
            style={{ animationDelay: '300ms' }}
            className="battle-fade-in flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold
              dark:bg-surface-input bg-gray-50 border border-gray-700/60 dark:text-text-primary text-gray-900
              hover:bg-gray-900/80 hover:border-gray-600 hover:shadow-lg hover:shadow-gray-900/40
              transition-all duration-200 active:scale-95 battle-btn-secondary"
            title="Copy winner output"
          >
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Output'}
          </button>

          <button
            onClick={() => navigate('/battle/setup')}
            style={{ animationDelay: '400ms' }}
            className="battle-fade-in flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold
              dark:bg-surface-input bg-gray-50 border border-gray-700/60 dark:text-text-primary text-gray-900
              hover:bg-gray-900/80 hover:border-gray-600 hover:shadow-lg hover:shadow-gray-900/40
              transition-all duration-200 active:scale-95 battle-btn-secondary"
            title="Start a new battle"
          >
            <RotateCcw size={16} />
            Run Again
          </button>

          <button
            onClick={() => navigate('/')}
            style={{ animationDelay: '500ms' }}
            className="battle-fade-in flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold
              dark:bg-surface-input bg-gray-50 border border-gray-700/60 dark:text-text-primary text-gray-900
              hover:bg-gray-900/80 hover:border-gray-600 hover:shadow-lg hover:shadow-gray-900/40
              transition-all duration-200 active:scale-95 battle-btn-secondary"
            title="Return to agent directory"
          >
            <ArrowLeft size={16} />
            Back to Agents
          </button>
        </div>
      </main>
    </div>
  )
}
