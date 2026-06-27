import { Swords } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function BattleNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-11 flex items-center px-4 sm:px-6
      bg-gray-950 backdrop-blur-md border-b border-yellow-400/20
      shadow-lg shadow-yellow-400/5 battle-page-transition">
      <Link to="/battle" className="flex items-center gap-2 group">
        <div className="w-6 h-6 rounded-md bg-yellow-400/10 border border-yellow-400/30
          flex items-center justify-center group-hover:bg-yellow-400/20 
          group-hover:border-yellow-400/50 group-hover:shadow-lg group-hover:shadow-yellow-400/20
          transition-all duration-200">
          <Swords size={14} className="text-yellow-400 group-hover:text-yellow-300 transition-colors" />
        </div>
        <span className="text-xs font-bold text-white tracking-wide
          bg-gradient-to-r from-yellow-300 to-yellow-200 bg-clip-text text-transparent
          group-hover:to-yellow-100 transition-all duration-200">
          Battle Mode
        </span>
      </Link>
    </nav>
  )
}
