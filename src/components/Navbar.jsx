import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Sun,
  Moon,
  Github,
  Menu,
  X,
  HelpCircle,
  Sparkles,
  PanelLeftOpen,
  PanelLeftClose,
  PanelsTopLeft,
  Workflow,
  LibraryBig
} from 'lucide-react'

import Logo from './Logo'
import KeyboardShortcutsModal from './KeyboardShortcutsModal'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const [darkMode, setDarkMode] = useState(true)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const navItems = [
    { label: 'Agents', to: '/', icon: Sparkles, end: true },
    { label: 'Suites', to: '/suites', icon: LibraryBig },
    { label: 'Workflows', to: '/workflows', icon: Workflow },
    { label: 'Battle', to: '/battle', icon: PanelsTopLeft },
  ]

  const navLinkClass = ({ isActive }) =>
    `group relative inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold tracking-wide transition-all duration-300
    ${isActive
      ? 'text-gray-950 dark:text-white bg-white/80 dark:bg-white/10 shadow-sm shadow-indigo-500/10'
      : 'text-gray-600 hover:text-gray-950 dark:text-text-secondary dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'
    }`

  return (
    <>
      <nav
        className="
          fixed top-3 left-3 right-3 z-50
          mx-auto max-w-6xl
          rounded-[2rem]
          border border-white/40 dark:border-white/10
          bg-white/70 dark:bg-[#101014]/70
          px-3 py-2
          shadow-[0_18px_55px_rgba(15,23,42,0.14),0_0_28px_rgba(99,102,241,0.10)]
          backdrop-blur-2xl
          transition-all duration-300
          before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[2rem]
          before:bg-gradient-to-r before:from-cyan-400/30 before:via-indigo-400/30 before:to-rose-400/30 before:p-px
          md:left-6 md:right-6 lg:left-[17rem] lg:right-6
        "
      >
        <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="
              lg:hidden
              p-2.5
              rounded-full
              shrink-0
              text-gray-600 dark:text-text-secondary
              dark:hover:bg-white/10
              hover:bg-white/70
              transition-all duration-200 hover:scale-105
            "
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>

          <Link
            to="/"
            aria-label="iloveAgents - Go to homepage"
            onClick={() => {
              setMobileMenuOpen(false)
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              })
            }}
            className="
              flex items-center rounded-full px-1.5 py-1
              min-w-0
              overflow-hidden
              transition-all duration-300 hover:scale-[1.02]
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500
            "
          >
            <Logo
              height={24}
              className="dark:text-white text-gray-900 max-w-full"
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center justify-center rounded-full border border-white/50 bg-white/45 p-1 shadow-inner shadow-white/50 dark:border-white/10 dark:bg-black/20 dark:shadow-black/20">
          {navItems.map(({ label, to, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={navLinkClass} aria-label={label}>
              {({isactive }) => (
                <>
                  <Icon size={14} />
                <span>{label}</span>
                <span className="absolute inset-x-4 -bottom-1 h-px scale-x-0 rounded-full bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-0 transition-all duration-300 group-hover:scale-x-100 group-hover:opacity-100" />
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <a
            href="https://github.com/AditthyaSS/iloveAgents"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Star iloveAgents on GitHub (opens in new tab)"
            className="
              hidden md:flex items-center justify-center gap-1.5
              px-3.5 py-2
              rounded-full
              text-xs font-bold
              text-white
              bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500
              shadow-lg shadow-indigo-500/25
              transition-all duration-300 hover:-translate-y-0.5 hover:shadow-violet-500/35
            "
          >
            <Github size={15} aria-hidden="true" />
            <span>Star</span>
          </a>

          <button
            onClick={() => setShowShortcuts(true)}
            className="
              hidden md:inline-flex items-center justify-center p-2.5
              rounded-full
              transition-all duration-200 hover:scale-105
              dark:hover:bg-white/10
              dark:text-text-secondary
              hover:bg-white/70
              text-gray-500
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500
            "
            aria-label="Keyboard Shortcuts"
          >
            <HelpCircle size={16} />
          </button>

          <button
            onClick={toggleTheme}
            className="
              hidden md:inline-flex items-center justify-center p-2.5
              rounded-full
              transition-all duration-200 hover:scale-105
              dark:hover:bg-white/10
              dark:text-text-secondary
              hover:bg-white/70
              text-gray-500
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500
            "
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="
              md:hidden p-2.5 rounded-full
              text-gray-600 dark:text-text-secondary
              transition-all duration-200 hover:scale-105
              hover:bg-white/70 dark:hover:bg-white/10
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500
            "
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        </div>

        <div
          role="menu"
          aria-hidden={ !mobileMenuOpen }
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
            mobileMenuOpen ? 'max-h-80 opacity-100 pt-3' : 'max-h-0 opacity-0 pt-0'
          }`}
        >
          <div className="rounded-[1.5rem] border border-white/50 bg-white/70 p-2 shadow-inner shadow-white/50 dark:border-white/10 dark:bg-black/25 dark:shadow-black/20">
            <div className="grid gap-1">
              {navItems.map(({ label, to, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-gray-950 shadow-sm dark:bg-white/10 dark:text-white'
                        : 'text-gray-600 hover:bg-white/70 hover:text-gray-950 dark:text-text-secondary dark:hover:bg-white/10 dark:hover:text-white'
                    }`
                  }
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={16} />
                    {label}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 opacity-60" />
                </NavLink>
              ))}
              <a
                href="https://github.com/AditthyaSS/iloveAgents"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25"
              >
                <Github size={16} />
                Star on GitHub
              </a>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setShowShortcuts(true)
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/50 bg-white/70 px-3 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:text-gray-950 dark:border-white/10 dark:bg-white/5 dark:text-text-secondary dark:hover:text-white"
                >
                  <HelpCircle size={15} />
                  Shortcuts
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/50 bg-white/70 px-3 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:text-gray-950 dark:border-white/10 dark:bg-white/5 dark:text-text-secondary dark:hover:text-white"
                >
                  {darkMode ? <Sun size={15} /> : <Moon size={15} />}
                  Theme
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </>
  )
}
