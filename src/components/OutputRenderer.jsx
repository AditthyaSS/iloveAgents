import { useState } from 'react'
import { Copy, Check, ClipboardList } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import ScorecardOutput from './ScorecardOutput'

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors
        dark:bg-surface-input dark:text-text-secondary dark:hover:text-text-primary dark:border-border
        bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-200"
    >
      {copied ? (
        <>
          <Check size={12} className="text-success" />
          Copied!
        </>
      ) : (
        <>
          <Copy size={12} />
          {label || 'Copy'}
        </>
      )}
    </button>
  )
}

function DownloadButton({ text, agentName }) {
  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${agentName || 'output'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleDownload}
      title="Download as .txt"
      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors
        dark:bg-surface-input dark:text-text-secondary dark:hover:text-text-primary dark:border-border
        bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-200"
    >
      ⬇ Download
    </button>
  )
}

export default function OutputRenderer({ content, outputType, agentName, systemPrompt }) {
  if (!content) return null

  const shareText = `--- Agent: ${agentName} ---\n\n--- Output ---\n${content}`

  return (
    <div className="animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400">
          Output
        </span>
        <div className="flex items-center gap-2">
          <CopyButton text={content} label="Copy output" />
          <CopyButton text={shareText} label="Share" />
          <DownloadButton text={content} agentName={agentName} />
        </div>
      </div>

      {/* Content */}
      <div className="rounded-lg border p-4 dark:bg-surface-card dark:border-border bg-white border-gray-200">
        {outputType === 'json' ? (
          <ScorecardOutput data={content} />
        ) : outputType === 'markdown' ? (
          <div className="markdown-output text-sm dark:text-text-primary text-gray-900">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        margin: '0.5rem 0',
                        borderRadius: '0.5rem',
                        fontSize: '0.75rem',
                      }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          /* text output */
          <pre className="text-sm whitespace-pre-wrap font-sans dark:text-text-primary text-gray-900 leading-relaxed">
            {content}
          </pre>
        )}
      </div>
    </div>
  )
}
