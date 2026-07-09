import { useNavigate } from 'react-router-dom'
import { Swords, Crosshair, PenLine, Cpu, Trophy, Bot } from 'lucide-react'
import BattleNavbar from '../components/BattleNavbar'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const steps = [
  { icon: Crosshair, text: 'Pick any agent', number: '01' },
  { icon: PenLine,    text: 'Enter your input once', number: '02' },
  { icon: Cpu,        text: 'GPT-4o vs Claude Sonnet vs Gemini Flash generate outputs', number: '03' },
  { icon: Trophy,     text: 'You pick the winner', number: '04' },
]

const providers = [
  { name: 'GPT-4o',         label: 'OpenAI',   color: 'text-green-400 dark:text-green-400',  border: 'border-green-400/30 dark:border-green-400/300',  bg: 'bg-green-400/10 dark:bg-green-400/10',  side: 'battle-slide-left'   },
  { name: 'Claude',         label: 'Anthropic', color: 'text-orange-400 dark:text-orange-400', border: 'border-orange-400/30 dark:border-orange-400/30', bg: 'bg-orange-400/10 dark:bg-orange-400/10', side: 'battle-slide-right'  },
  { name: 'Gemini',         label: 'Google',    color: 'text-blue-400 dark:text-blue 400',   border: 'border-blue-400/30 dark:border-blue-400/30',   bg: 'bg-blue-400/10 dark:bg-blue-400/10',   side: 'battle-slide-right'  },
  { name: 'Groq',         label: 'Groq',    color: 'text-red-400 dark:text-red 400',   border: 'border-red-400/30 dark:border-red-400/30',   bg: 'bg-red-400/10 dark:bg-red-400/10',   side: 'battle-slide-right'  },
]

export default function BattleModeLanding() {
  const navigate = useNavigate()
  useDocumentTitle('Battle Mode')

  return (
    <div className="min-h-screen battle-page-transition
  dark:bg-surface bg-gray-50
  dark:text-text-primary text-gray-900">
      <main className="pt-12 pb-12 flex min-h-screen flex-col items-center px-4">
        {/* Hero */}
        <div className="text-center mb-14 battle-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/30
            flex items-center justify-center mx-auto mb-4 battle-glow-gold
            hover:border-yellow-400/60 hover:shadow-lg hover:shadow-yellow-400/30 
            transition-all duration-300 cursor-default">
            <Swords size={32} className="text-amber-600 dark:text-yellow-400" />
          </div>
          <h1 className="
            text-5xl sm:text-6xl
            font-extrabold
            tracking-tight
            mb-3
            bg-gradient-to-r
            from-amber-600 via-yellow-600 to-orange-500
            dark:from-yellow-300
            dark:via-white
            dark:to-violet-400
            dark:from-yellow-300 dark:via-white dark:to-violet-400
            bg-clip-text
            text-transparent  
            drop-shadow-[0_0_30px_rgba(250,204,21,0.3)]">
            Battle Mode
          </h1>
          <p className="text-base dark:text-text-secondary text-gray-700 dark:text-text-secondary dark:text-text-secondary max-w-md mx-auto leading-relaxed font-medium">
            Pit three AI providers against each other. Same prompt, three outputs, you decide who wins.
          </p>
        </div>

        {/* Provider Cards */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 mb-14 w-full max-w-lg">
          {/* GPT */}
          <div
            className={`flex-1 flex flex-col items-center gap-2 p-5 rounded-2xl border
              ${providers[0].border} ${providers[0].bg} battle-slide-left`}
            style={{ animationDelay: '200ms' }}
          >
            <Bot size={28} className={providers[0].color} />
            <span className={`text-base font-bold ${providers[0].color}`}>{providers[0].name}</span>
            <span className="text-[10px] dark:text-text-muted text-gray-700 dark:text-text-secondary dark:text-text-secondary uppercase tracking-widest">{providers[0].label}</span>
          </div>

          {/* VS */}
          <div
            className="flex flex-col items-center gap-1 battle-slide-center"
            style={{ animationDelay: '400ms' }}
          >
            <Swords size={22} className="text-amber-600 dark:text-yellow-400" />
            <span className="text-xs font-extrabold text-amber-600 dark:text-yellow-400 tracking-widest">VS</span>
          </div>

          {/* Claude */}
          <div
            className={`flex-1 flex flex-col items-center gap-2 p-5 rounded-2xl border
              ${providers[1].border} ${providers[1].bg} battle-slide-center`}
            style={{ animationDelay: '300ms' }}
          >
            <Bot size={28} className={providers[1].color} />
            <span className={`text-sm font-bold ${providers[1].color}`}>{providers[1].name}</span>
            <span className="text-[10px] dark:text-text-muted text-gray-700 dark:text-text-secondary dark:text-text-secondary uppercase tracking-widest">{providers[1].label}</span>
          </div>

          {/* VS */}
          <div
            className="flex flex-col items-center gap-1 battle-slide-center"
            style={{ animationDelay: '400ms' }}
          >
            <Swords size={22} className="text-amber-600 dark:text-yellow-400" />
            <span className="text-xs font-extrabold text-amber-600 dark:text-yellow-400 tracking-widest">VS</span>
          </div>

          {/* Gemini */}
          <div
            className={`flex-1 flex flex-col items-center gap-2 p-5 rounded-2xl border
              ${providers[2].border} ${providers[2].bg} battle-slide-right`}
            style={{ animationDelay: '200ms' }}
          >
            <Bot size={28} className={providers[2].color} />
            <span className={`text-sm font-bold ${providers[2].color}`}>{providers[2].name}</span>
            <span className="text-[10px] dark:text-text-muted text-gray-700 dark:text-text-secondary dark:text-text-secondary uppercase tracking-widest">{providers[2].label}</span>
          </div>

          {/* Groq */}
          <div
            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border
              ${providers[3].border} ${providers[3].bg} battle-slide-right`}
            style={{ animationDelay: '200ms' }}
          >
            <Bot size={28} className={providers[3].color} />
            <span className={`text-sm font-bold ${providers[3].color}`}>{providers[3].name}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">{providers[3].label}</span>
          </div>
        </div>

        {/* Steps */}
        <div className="w-full max-w-2xl space-y-3 mb-14">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div
                key={idx}
                className="flex items-center gap-4 p-5 rounded-2xl border dark:border-border border-gray-200
                  bg-white dark:bg-surface backdrop-blur-sm battle-step-in
                  hover:border-gray-700/80 hover:dark:bg-surface-input bg-gray-50 hover:shadow-lg hover:shadow-md dark:hover:shadow-xl
                  transition-all duration-200 hover:translate-x-1 cursor-default"
                style={{ animationDelay: `${(idx + 1) * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-amber-400/20 to-yellow-400/10
                  flex items-center justify-center flex-shrink-0 border border-amber-400/20">
                  <span className="text-base sm:text-lg font-bold text-amber-600 dark:text-yellow-400">{step.number}</span>
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest dark:text-text-muted text-gray-700 dark:text-text-secondary">
                    Step {idx + 1}
                  </span>
                  <p className="text-base sm:text-lg font-semibold dark:text-text-muted text-gray-700 dark:text-text-secondary mt-0.5">
                    {step.text}
                  </p>
                </div>
                <Icon size={18} className="dark:text-text-muted text-gray-700 dark:text-text-secondary flex-shrink-0" />
              </div>
            )
          })}
        </div>

       {/* Start Button */}
        <button
          onClick={() => navigate('/battle/setup')}
          className="flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold
            bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-950
            hover:from-amber-400 hover:to-yellow-400 hover:shadow-xl hover:shadow-amber-500/40
            transition-all duration-200 active:scale-95 battle-fade-in
            border border-amber-400/20 hover:border-amber-300/40
            shadow-lg shadow-amber-500/20"
          style={{ animationDelay: '600ms' }}
        >
          <Swords size={18} className="text-amber-600 dark:text-yellow-400" />
          Start Battle
        </button>
      </main>
    </div>
  )
}
