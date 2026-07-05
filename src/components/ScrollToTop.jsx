import React, { useEffect, useState } from 'react'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e) => setReduceMotion(e.matches)
    setReduceMotion(mq.matches)
    if (mq.addEventListener) mq.addEventListener('change', onChange)
    else mq.addListener(onChange)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange)
      else mq.removeListener(onChange)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = () => {
    setVisible(false)
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const transitionClasses = reduceMotion ? '' : 'transition-opacity transform duration-300 ease-in-out'
  const visibilityClasses = visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'

  return (
    <button
      type="button"
      aria-label="Scroll back to top"
      aria-hidden={!visible}
      onClick={handleClick}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-gray-900 ${transitionClasses} ${visibilityClasses}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="w-4 h-4 text-gray-700 dark:text-text-primary text-gray-900">
        <path fillRule="evenodd" d="M10 5a1 1 0 01.707.293l4 4a1 1 0 11-1.414 1.414L10 7.414 6.707 10.707A1 1 0 115.293 9.293l4-4A1 1 0 0110 5z" clipRule="evenodd" />
      </svg>
    </button>
  )
}
