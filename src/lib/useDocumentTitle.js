
import { useEffect } from 'react'

export const SITE_NAME = 'I Love Agents'

export const DEFAULT_TITLE = `${SITE_NAME} — AI Agents, Ready to Use`

export function formatDocumentTitle(pageTitle = '') {
  const title = typeof pageTitle === 'string' ? pageTitle.trim() : ''

  if (!title) {
    return DEFAULT_TITLE
  }

  // Avoid repeating the site name if it is already included.
  if (title === SITE_NAME || title.endsWith(` — ${SITE_NAME}`)) {
    return title
  }

  return `${title} — ${SITE_NAME}`
}

export function useDocumentTitle(pageTitle = '') {
  useEffect(() => {
    if (typeof document === 'undefined') return

    document.title = formatDocumentTitle(pageTitle)

    return () => {
      document.title = DEFAULT_TITLE
    }
  }, [pageTitle])
}
