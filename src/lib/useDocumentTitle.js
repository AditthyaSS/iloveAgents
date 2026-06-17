import { useEffect } from 'react'

export const SITE_NAME = 'I Love Agents'
export const DEFAULT_TITLE = `${SITE_NAME} \u2014 AI Agents, Ready to Use`

export function formatDocumentTitle(pageTitle) {
  return pageTitle ? `${pageTitle} \u2014 ${SITE_NAME}` : DEFAULT_TITLE
}

export function useDocumentTitle(pageTitle) {
  useEffect(() => {
    document.title = formatDocumentTitle(pageTitle)
  }, [pageTitle])
}
