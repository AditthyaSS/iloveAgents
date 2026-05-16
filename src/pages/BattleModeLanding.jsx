import { useNavigate } from 'react-router-dom'
import { Swords, ArrowLeft, Crosshair, PenLine, Cpu, Trophy } from 'lucide-react'
import BattleNavbar from '../components/BattleNavbar'

const steps = [
  { icon: Crosshair, text: 'Pick any agent', number: '01' },
  { icon: PenLine,    text: 'Enter your input once', number: '02' },
  { icon: Cpu,        text: 'GPT-4o vs Claude Sonnet vs Gemini Flash generate outputs', number: '03' },
  { icon: Trophy,     text: 'You pick the winner', number: '04' },
]

export default function BattleModeLanding() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 text-white battle-page-transition">
      <BattleNavbar />

      <main className="pt-14 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-20 left-4 sm:left-6 flex items-center gap-1.5 text-xs font-medium
            text-gray-400 hover:text-white transition-all duration-200 hover:gap-2"
        >
          <ArrowLeft size={14} />
          Back to Agents
        </button>

        {/* Hero */}
        <div className="text-center mb-12 battle-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-yellow-400/10 border border-yellow-400/30
            flex items-center justify-center mx-auto mb-6 battle-glow-gold
            hover:border-yellow-400/60 hover:shadow-lg hover:shadow-yellow-400/30 
            transition-all duration-300 cursor-default">
            <Swords size={40} className="text-yellow-400" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-wider mb-3
            bg-gradient-to-r from-yellow-300 via-white to-violet-400 bg-clip-text text-transparent
            drop-shadow-[0_0_30px_rgba(250,204,21,0.3)]">
            Battle Mode
          </h1>
          <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed font-medium">
            Pit three AI providers against each other. Same prompt, three outputs, you decide who wins.
          </p>
        </div>

        {/* Steps */}
        <div className="w-full max-w-2xl space-y-3 mb-12">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div
                key={idx}
                className="flex items-center gap-4 p-5 rounded-xl border border-gray-800/60
                  bg-gray-900/40 backdrop-blur-sm battle-step-in
                  hover:border-gray-700/80 hover:bg-gray-900/60 hover:shadow-lg hover:shadow-gray-900/40
                  transition-all duration-200 hover:translate-x-1 cursor-default"
                style={{ animationDelay: `${(idx + 1) * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400/20 to-yellow-400/10
                  flex items-center justify-center flex-shrink-0 border border-yellow-400/20">
                  <span className="text-lg font-bold text-yellow-400/80">{step.number}</span>
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Step {idx + 1}
                  </span>
                  <p className="text-sm font-medium text-gray-100 mt-0.5">{step.text}</p>
                </div>
                <Icon size={18} className="text-gray-500 flex-shrink-0" />
              </div>
            )
          })}
        </div>

        {/* Start Button */}
        <button
          onClick={() => navigate('/battle/setup')}
          className="flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-bold
            bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-950
            hover:from-yellow-400 hover:to-amber-400 hover:shadow-xl hover:shadow-yellow-500/40
            transition-all duration-200 active:scale-95 battle-fade-in
            border border-yellow-400/20 hover:border-yellow-300/40
            shadow-lg shadow-yellow-500/20"
          style={{ animationDelay: '600ms' }}
        >
          <Swords size={18} />
          Start Battle
        </button>
      </main>
    </div>
  )
}
