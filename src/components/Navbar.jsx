import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sun,
  Moon,
  Github,
  Menu,
  X,
  HelpCircle
} from 'lucide-react'

import Logo from './Logo'
import KeyboardShortcutsModal from './KeyboardShortcutsModal'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const [darkMode, setDarkMode] = useState(true)
  const [showShortcuts, setShowShortcuts] = useState(false)

  useKeyboardShortcuts({
    '?': () => setShowShortcuts(true),
  })

  useEffect(() => {
    const saved = localStorage.getItem('ila_theme')

    if (saved === 'light') {
      setDarkMode(false)
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
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
    <>
      <nav
        className="
          fixed top-0 left-0 right-0 z-50
          h-14
          px-3 sm:px-4
          border-b
          flex items-center justify-between
          transition-theme
          dark:bg-surface dark:border-border
          bg-white border-gray-200
        "
      >
        {/* LEFT */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="
              lg:hidden
              p-2
              rounded-md
              shrink-0
              dark:hover:bg-surface-hover
              hover:bg-gray-100
              transition-colors
            "
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link
            to="/"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              })
            }
            className="
              flex items-center
              min-w-0
              overflow-hidden
            "
          >
            <Logo
              height={24}
              className="dark:text-white text-gray-900 max-w-full"
            />
          </Link>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Workflows */}
          <Link
            to="/workflows"
            className="
              hidden sm:flex
              items-center
              px-2.5 py-1.5
              sm:px-3
              rounded-md
              text-[11px] sm:text-xs
              font-medium
              whitespace-nowrap
              transition-colors
              dark:bg-surface-card
              dark:text-text-secondary
              dark:hover:text-text-primary
              dark:border-border
              bg-gray-100
              text-gray-600
              hover:text-gray-900
              border border-gray-200
            "
          >
            Workflows
          </Link>

          {/* GitHub */}
          <a
            href="https://github.com/AditthyaSS/iloveAgents"
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex items-center justify-center
              p-2 sm:px-3 sm:py-1.5
              rounded-md
              transition-colors
              dark:bg-surface-card
              dark:text-text-secondary
              dark:hover:text-text-primary
              dark:border-border
              bg-gray-100
              text-gray-600
              hover:text-gray-900
              border border-gray-200
            "
          >
            <Github size={15} />

            <span className="hidden md:inline ml-1.5 text-xs font-medium">
              Star
            </span>
          </a>

          {/* Shortcuts */}
          <button
            onClick={() => setShowShortcuts(true)}
            className="
              p-2
              rounded-md
              transition-colors
              dark:hover:bg-surface-hover
              dark:text-text-secondary
              hover:bg-gray-100
              text-gray-500
            "
            aria-label="Keyboard Shortcuts"
          >
            <HelpCircle size={16} />
          </button>

          {/* Theme */}
          <button
            onClick={toggleTheme}
            className="
              p-2
              rounded-md
              transition-colors
              dark:hover:bg-surface-hover
              dark:text-text-secondary
              hover:bg-gray-100
              text-gray-500
            "
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </nav>

      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </>
  )
}