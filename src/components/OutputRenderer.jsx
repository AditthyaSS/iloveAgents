
import { useState, createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Copy, Check, FileText, Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import ScorecardOutput from './ScorecardOutput'
import VoiceOutput from './VoiceOutput'

/**
 * Convert Markdown into plain text for the Copy as Plain Text button.
 */
function stripMarkdown(text) {
  if (!text) return ''

  return text
    .replace(/^[-*+]\s+\[[ xX]\]\s+/gm, '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/```[a-z]*\n?([\s\S]*?)```/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/^---+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Escape text before placing it inside an HTML document.
 */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Create a safe filename from the agent name.
 */
function createFileName(name) {
  const safeName = String(name || 'agent')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')

  return safeName || 'agent'
}

/**
 * Create a print-ready HTML document.
 * Markdown is rendered through ReactMarkdown, which does not render
 * raw HTML by default. No agent output is evaluated as JavaScript.
 */
function buildPrintableHtml(agentName, content, outputType) {
  const title = escapeHtml(agentName || 'Agent output')

  let body

  if (outputType === 'markdown') {
    body = renderToStaticMarkup(
      createElement(
        ReactMarkdown,
        {
          skipHtml: true,
          remarkPlugins: [remarkGfm],
        },
        content
      )
    )
  } else {
    body = `<pre class="plain-output">${escapeHtml(content)}</pre>`
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>

  <style>
    @page {
      size: A4;
      margin: 18mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #222;
      background: #fff;
      margin: 0;
      line-height: 1.7;
      font-size: 13px;
    }

    main {
      max-width: 850px;
      margin: 0 auto;
    }

    h1 {
      font-size: 24px;
      line-height: 1.3;
      margin: 0 0 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid #ddd;
      overflow-wrap: anywhere;
    }

    h2, h3, h4, h5, h6 {
      color: #222;
      margin-top: 22px;
      margin-bottom: 10px;
      break-after: avoid;
    }

    p {
      margin: 10px 0;
    }

    ul, ol {
      padding-left: 25px;
      margin: 12px 0;
    }

    li {
      margin: 5px 0;
    }

    blockquote {
      margin: 16px 0;
      padding: 8px 16px;
      border-left: 4px solid #999;
      color: #555;
      background: #f7f7f7;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 12px;
      break-inside: auto;
    }

    th, td {
      border: 1px solid #ccc;
      padding: 8px;
      text-align: left;
      overflow-wrap: anywhere;
    }

    th {
      background: #f1f1f1;
      font-weight: bold;
    }

    tr {
      break-inside: avoid;
    }

    pre {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      word-break: break-word;
      padding: 12px;
      background: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-family: Consolas, monospace;
      font-size: 11px;
      line-height: 1.6;
      break-inside: auto;
    }

    pre code {
      white-space: pre-wrap;
    }

    code {
      font-family: Consolas, monospace;
      background: #f1f1f1;
      padding: 2px 4px;
      border-radius: 3px;
      overflow-wrap: anywhere;
    }

    pre code {
      background: transparent;
      padding: 0;
    }

    a {
      color: #2457a7;
      overflow-wrap: anywhere;
    }

    img {
      max-width: 100%;
      height: auto;
    }

    hr {
      border: 0;
      border-top: 1px solid #ddd;
      margin: 20px 0;
    }

    .plain-output {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 13px;
    }

    @media screen {
      body {
        padding: 35px 24px;
      }
    }

    @media print {
      body {
        padding: 0;
      }

      main {
        max-width: none;
      }

      h1, h2, h3, h4 {
        break-after: avoid;
      }

      a {
        color: #222;
        text-decoration: none;
      }
    }
  </style>
</head>

<body>
  <main>
    <h1>${title}</h1>
    <article>${body}</article>
  </main>
</body>
</html>`
}

/**
 * Reusable copy button with clipboard fallback.
 */
function CopyButton({ text, label, icon: Icon = Copy }) {
  const [copyState, setCopyState] = useState('idle')

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        throw new Error('Clipboard API is unavailable')
      }

      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2000)
    } catch {
      let textarea

      try {
        textarea = document.createElement('textarea')
        textarea.value = text
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'

        document.body.appendChild(textarea)
        textarea.select()

        const copied = document.execCommand('copy')

        if (copied) {
          setCopyState('copied')
          setTimeout(() => setCopyState('idle'), 2000)
          return
        }
      } catch {
        // Clipboard fallback failed.
      } finally {
        if (textarea?.isConnected) {
          document.body.removeChild(textarea)
        }
      }

      setCopyState('failed')
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleCopy}
        title="Copy to clipboard"
        aria-label={
          copyState === 'failed'
            ? `${label || 'Copy'} failed`
            : label || 'Copy'
        }
        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors
          dark:bg-surface-input dark:text-text-secondary dark:hover:text-text-primary dark:border-border
          bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-200"
      >
        {copyState === 'copied' ? (
          <>
            <Check size={12} className="text-success" />
            Copied!
          </>
        ) : (
          <>
            <Icon size={12} />
            {label || 'Copy'}
          </>
        )}
      </button>

      {copyState === 'failed' && (
        <span
          className="text-[10px] text-red-500"
          role="status"
          aria-live="polite"
        >
          Copy failed. Select the output and press Ctrl+C.
        </span>
      )}

      {copyState === 'copied' && (
        <span className="sr-only" role="status" aria-live="polite">
          {label || 'Output'} copied to clipboard.
        </span>
      )}
    </div>
  )
}

export default function OutputRenderer({
  content,
  outputType,
  agentName,
  systemPrompt,
  userMessage,
}) {
  if (content === null || content === undefined || content === '') {
    return null
  }

  const stringContent =
    typeof content === 'object'
      ? JSON.stringify(content, null, 2)
      : String(content)

  const fileName = createFileName(agentName)

  const shareText = `--- Agent: ${agentName || 'Agent'} ---

--- Output ---
${stringContent}`

  /**
   * Download the complete agent execution log as TXT.
   */
  const handleDownloadTxt = () => {
    const timestamp = new Date().toISOString()

    const logText = `==================================================
AGENT RUN LOG: ${agentName || 'Agent'}
Timestamp: ${timestamp}
==================================================

--- System Prompt ---
${systemPrompt || 'N/A'}

--- User Inputs ---
${userMessage || 'N/A'}

--- Output ---
${stringContent}
`

    const blob = new Blob([logText], {
      type: 'text/plain;charset=utf-8',
    })

    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = `${fileName}_run_log.txt`
    anchor.click()

    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  /**
   * Download the complete agent execution log as JSON.
   */
  const handleDownloadJson = () => {
    const logObject = {
      agentName: agentName || 'Agent',
      timestamp: new Date().toISOString(),
      systemPrompt: systemPrompt || '',
      inputs: userMessage || '',
      output: content ?? '',
    }

    const blob = new Blob(
      [JSON.stringify(logObject, null, 2)],
      { type: 'application/json;charset=utf-8' }
    )

    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = `${fileName}_run_log.json`
    anchor.click()

    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  /**
   * Export only the agent output.
   */
  const handleDownloadOutput = () => {
    const extension = outputType === 'markdown' ? 'md' : 'txt'

    const blob = new Blob([stringContent], {
      type: 'text/plain;charset=utf-8',
    })

    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = `${fileName}_output.${extension}`
    anchor.click()

    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  /**
   * Open a formatted print view.
   * The browser's print dialog allows the user to save as PDF.
   */
  const handleExportPdf = () => {
    let printableWindow

    try {
      printableWindow = window.open(
        '',
        '_blank',
        'width=900,height=700'
      )

      if (!printableWindow) {
        window.alert(
          'Please allow pop-ups to export your output as PDF.'
        )
        return
      }

      printableWindow.opener = null

      const html = buildPrintableHtml(
        agentName,
        stringContent,
        outputType
      )

      printableWindow.document.open()
      printableWindow.document.write(html)
      printableWindow.document.close()

      printableWindow.focus()

      printableWindow.setTimeout(() => {
        if (!printableWindow.closed) {
          printableWindow.print()
        }
      }, 300)
    } catch (error) {
      if (printableWindow && !printableWindow.closed) {
        printableWindow.close()
      }

      console.error('PDF export failed:', error)
      window.alert('Unable to prepare the PDF. Please try again.')
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400">
          Output
        </span>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <VoiceOutput text={stringContent} />

          <CopyButton
            text={stringContent}
            label="Copy output"
          />

          <CopyButton
            text={stripMarkdown(stringContent)}
            label="Copy as Plain Text"
            icon={FileText}
          />

          <CopyButton
            text={shareText}
            label="Share"
          />

          <button
            type="button"
            onClick={handleDownloadOutput}
            title="Download raw output only"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors
              dark:bg-surface-input dark:text-text-secondary dark:hover:text-text-primary dark:border-border
              bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-200"
          >
            <Download size={12} />
            Export Output
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            title="Download full run log as Text"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors
              dark:bg-surface-input dark:text-text-secondary dark:hover:text-text-primary dark:border-border
              bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-200"
          >
            <Download size={12} />
            Export TXT
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            title="Download full run log as JSON"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors
              dark:bg-surface-input dark:text-text-secondary dark:hover:text-text-primary dark:border-border
              bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-200"
          >
            <Download size={12} />
            Export JSON
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            title="Open print view to save as PDF"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors
              dark:bg-surface-input dark:text-text-secondary dark:hover:text-text-primary dark:border-border
              bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-200"
          >
            <Download size={12} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Output Content */}
      <div className="rounded-lg border p-4 dark:bg-surface-card dark:border-border bg-white border-gray-200">
        {outputType === 'json' ? (
          <ScorecardOutput data={content} />
        ) : outputType === 'markdown' ? (
          <div className="markdown-output text-sm dark:text-text-primary text-gray-900">
            <ReactMarkdown
              skipHtml={true}
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const isInline =
                    !match && !String(children).includes('\n')

                  return !isInline && match ? (
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
              {stringContent}
            </ReactMarkdown>
          </div>
        ) : (
          <pre className="text-sm whitespace-pre-wrap font-sans dark:text-text-primary text-gray-900 leading-relaxed">
            {stringContent}
          </pre>
        )}
      </div>
    </div>
  )
}
