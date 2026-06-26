import React, { useEffect, useState } from 'react'

export default function ScrollToBottom() {
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
    const onScroll = () => {
      // Use standard documentElement falling back to body
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
      const clientHeight = window.innerHeight
      const scrollY = window.scrollY || window.pageYOffset

      // Check if page is actually scrollable
      const isScrollable = scrollHeight > clientHeight
      // Check if user is not near the bottom (100px buffer)
      const isNotNearBottom = scrollY + clientHeight < scrollHeight - 100

      setVisible(isScrollable && isNotNearBottom)
    }
    
    // Defer execution slightly to ensure DOM elements/agents have fully rendered and heights are calculated
    const timeoutId = setTimeout(onScroll, 100)
    
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const handleClick = (e) => {
    // Prevent default form behavior if encapsulated, just in case
    e.preventDefault()
    
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }

  const transitionClasses = reduceMotion ? '' : 'transition-all transform duration-300 ease-in-out'
  // Removed pointer-events-none from hidden state to prevent event clipping, letting opacity/visibility handle it safely
  const visibilityClasses = visible 
    ? 'opacity-100 translate-y-0 visible pointer-events-auto' 
    : 'opacity-0 translate-y-2 invisible pointer-events-none'

  return (
    <button
      type="button"
      aria-label="Scroll to bottom"
      aria-hidden={!visible}
      onClick={handleClick}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-20 right-6 z-50 w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-gray-900 ${transitionClasses} ${visibilityClasses}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="w-4 h-4 text-gray-700 dark:text-gray-200">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </button>
  )
}