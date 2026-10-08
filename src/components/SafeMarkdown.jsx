import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const ALLOWED_URL_SCHEMES = ['http:', 'https:', 'mailto:']

export function sanitizeMarkdownUrl(url) {
  if (typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (trimmed === '' || trimmed.startsWith('#')) return trimmed
  try {
    const scheme = new URL(trimmed, 'https://iloveagents.local').protocol
    return ALLOWED_URL_SCHEMES.includes(scheme) ? trimmed : '#'
  } catch {
    return '#'
  }
}

export default function SafeMarkdown({ children, className }) {
  return (
    <ReactMarkdown
      skipHtml
      remarkPlugins={[remarkGfm]}
      urlTransform={sanitizeMarkdownUrl}
      className={className}
    >
      {children}
    </ReactMarkdown>
  )
}
