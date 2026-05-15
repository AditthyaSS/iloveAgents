import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Trophy, Copy, Check, RotateCcw, ArrowLeft } from 'lucide-react'
import BattleNavbar from '../components/BattleNavbar'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const colorMap = {
  yellow: { bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', text: 'text-yellow-400', hoverBorder: 'hover:border-yellow-400/60', shadow: 'hover:shadow-yellow-400/30', lightBg: 'bg-yellow-400/5' },
  violet: { bg: 'bg-violet-400/10', border: 'border-violet-400/30', text: 'text-violet-400', hoverBorder: 'hover:border-violet-400/60', shadow: 'hover:shadow-violet-400/30', lightBg: 'bg-violet-400/5' },
  blue: { bg: 'bg-blue-400/10', border: 'border-blue-400/30', text: 'text-blue-400', hoverBorder: 'hover:border-blue-400/60', shadow: 'hover:shadow-blue-400/30', lightBg: 'bg-blue-400/5' },
}

export default function BattleModeWinner() {
  const navigate = useNavigate()
  const location = useLocation()
  const { provider, content, duration, agentName } = location.state || {}
  const [copied, setCopied] = useState(false)

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

  return (
    <div className="min-h-screen bg-gray-950 text-white battle-page-transition">
      <BattleNavbar />

      <main className="pt-14 max-w-3xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12 battle-fade-in">
          <div className={`w-24 h-24 rounded-2xl ${colors.bg} border ${colors.border}
            flex items-center justify-center mx-auto mb-8 
            ${colors.hoverBorder} ${colors.shadow} hover:scale-110
            transition-all duration-300 cursor-default`}>
            <Trophy size={52} className={`${colors.text} drop-shadow-[0_0_20px_rgba(0,0,0,0.3)]`} />
          </div>
          <h1 className={`text-5xl font-extrabold tracking-wider mb-3
            bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent`}>
            Winner
          </h1>
          <p className={`text-lg font-bold mb-1 ${colors.text}`}>
            {provider.label}
          </p>
          <p className="text-xs text-gray-400 font-medium">
            {agentName && `Agent: ${agentName}`}
            {duration && ` \u00B7 ${(duration / 1000).toFixed(1)}s`}
          </p>
        </div>

        {/* Winning Output */}
        <div className={`rounded-xl border ${colors.border} ${colors.lightBg} p-6 mb-10 battle-fade-in
          hover:border-opacity-60 transition-all duration-300`}
          style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Winning Output
            </span>
          </div>
          <div className="markdown-output text-sm text-gray-100 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 battle-fade-in"
          style={{ animationDelay: '250ms' }}>
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-sm font-semibold
              bg-gray-900/60 border border-gray-700/60 text-gray-100 
              hover:bg-gray-900/80 hover:border-gray-600 hover:shadow-lg hover:shadow-gray-900/40
              transition-all duration-200 active:scale-95 battle-btn-secondary"
          >
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Winner Output'}
          </button>

          <button
            onClick={() => navigate('/battle/setup')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-sm font-semibold
              bg-gray-900/60 border border-gray-700/60 text-gray-100
              hover:bg-gray-900/80 hover:border-gray-600 hover:shadow-lg hover:shadow-gray-900/40
              transition-all duration-200 active:scale-95 battle-btn-secondary"
          >
            <RotateCcw size={16} />
            Run Battle Again
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-sm font-semibold
              bg-gray-900/60 border border-gray-700/60 text-gray-100
              hover:bg-gray-900/80 hover:border-gray-600 hover:shadow-lg hover:shadow-gray-900/40
              transition-all duration-200 active:scale-95 battle-btn-secondary"
          >
            <ArrowLeft size={16} />
            Back to Agents
          </button>
        </div>
      </main>
    </div>
  )
}
