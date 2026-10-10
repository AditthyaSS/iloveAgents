import { useState } from 'react'
import { Copy, Check, FileText, Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import ScorecardOutput from './ScorecardOutput'
import VoiceOutput from './VoiceOutput'
import { downloadBlob, downloadTextFile } from '../lib/downloadBlob'

/**
 * XSS Protection:
 * - ReactMarkdown v9 by default does NOT render raw HTML or script tags
 * - Markdown input is safely escaped; only safe markdown syntax is rendered
 * - Agent prompts cannot inject <script> or HTML attributes via output
 * - Code blocks are syntax-highlighted but never evaluated
 * - Do NOT use dangerouslySetInnerHTML with agent output under any circumstances
 */

function stripMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/#{1,6}\s+/g, '')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`{3}[a-z]*\n?([\s\S]*?)`{3}/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^[-*]\s+\[[ x]\]\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/---+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

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
      let ta
      try {
        ta = document.createElement('textarea')
        ta.value = text
        ta.setAttribute('readonly', '')
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        const copied = document.execCommand('copy')

        if (copied) {
          setCopyState('copied')
          setTimeout(() => setCopyState('idle'), 2000)
          return
        }
      } catch {
        // Report the failed fallback below.
      } finally {
        if (ta?.isConnected) {
          document.body.removeChild(ta)
        }
      }

      setCopyState('failed')
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleCopy}
        title="Copy to clipboard"
        aria-label={copyState === 'failed' ? `${label || 'Copy'} failed` : label || 'Copy'}
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
        <span className="text-[10px] text-red-500" role="status" aria-live="polite">
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

import { buildPdfHtml } from '../lib/exportPdf'

export default function OutputRenderer({ content, outputType, agentName, systemPrompt, userMessage }) {
  if (!content) return null

  // Normalize content to string for safe text operations (JSON outputs might be objects)
  const stringContent = typeof content === 'object' && content !== null
    ? JSON.stringify(content, null, 2)
    : String(content || '');

  const shareText = `--- Agent: ${agentName} ---\n\n--- Output ---\n${stringContent}`

  const handleDownloadTxt = () => {
    const timestamp = new Date().toISOString();
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
`;
    const blobName = agentName ? agentName.replace(/\s+/g, '_').toLowerCase() : 'agent'
    downloadTextFile(logText, `${blobName}_run_log.txt`)
  };

  const handleDownloadJson = () => {
    const timestamp = new Date().toISOString();
    const logObj = {
      agentName: agentName || 'Agent',
      timestamp: timestamp,
      systemPrompt: systemPrompt || '',
      inputs: userMessage || '',
      output: content || ''
    };
    const blobName = agentName ? agentName.replace(/\s+/g, '_').toLowerCase() : 'agent'
    downloadBlob(JSON.stringify(logObj, null, 2), 'application/json;charset=utf-8', `${blobName}_run_log.json`)
  };

  const handleExportPdf = () => {
    const html = buildPdfHtml(agentName, stringContent)
    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 250)
  }

  // Downloads just the raw output (no system prompt / inputs), as .md if
  // the output is markdown, otherwise .txt — matches the "Download Output"
  // request in issue #429.
  const handleDownloadOutput = () => {
    const extension = outputType === 'markdown' ? 'md' : 'txt';
    const blobName = agentName ? agentName.replace(/\s+/g, '_').toLowerCase() : 'agent'
    downloadTextFile(stringContent, `${blobName}_output.${extension}`)
  };

  return (
    <div className="animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400">
          Output
        </span>
        <div className="flex items-center gap-2">
          {/* VoiceOutput — reads the response aloud */}
          <VoiceOutput
            text={stringContent}
          />

          <CopyButton text={stringContent} label="Copy output" />
          <CopyButton text={stripMarkdown(stringContent)} label="Copy as Plain Text" icon={FileText} />
          <CopyButton text={shareText} label="Share" />
          <button
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

      {/* Content */}
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
                  const isInline = !match && ((children?.length ?? 0) < 80);
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
