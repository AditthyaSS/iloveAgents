import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sun, Moon, Github, Menu, X } from 'lucide-react'
import Logo from './Logo'

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('ila_theme')
    if (saved === 'light') {
      setDarkMode(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const next = !darkMode
    setDarkMode(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('ila_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('ila_theme', 'light')
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 border-b transition-theme
      dark:bg-surface dark:border-border bg-white border-gray-200">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-1.5 rounded-md dark:hover:bg-surface-hover hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <Link to="/" className="flex items-center group hover:opacity-80 transition-opacity">
          <Logo height={26} className="dark:text-white text-gray-900" />
        </Link>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <Link
          to="/workflows"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
            dark:bg-surface-card dark:text-text-secondary dark:hover:text-text-primary dark:border-border
            bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200"
        >
          <span>Workflows</span>
        </Link>

        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
            dark:bg-surface-card dark:text-text-secondary dark:hover:text-text-primary dark:border-border
            bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200"
        >
          <Github size={14} />
          <span className="hidden sm:inline">Star on GitHub</span>
        </a>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-md transition-colors
            dark:hover:bg-surface-hover dark:text-text-secondary
            hover:bg-gray-100 text-gray-500"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </nav>
  )
}
