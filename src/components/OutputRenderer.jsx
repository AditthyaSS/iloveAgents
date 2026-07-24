import { useState } from 'react'
import { Copy, Check, FileText, Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import ScorecardOutput from './ScorecardOutput'
import VoiceOutput from './VoiceOutput'

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
          <Icon size={12} />
          {label || 'Copy'}
        </>
      )}
    </button>
  )
}

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
    const blob = new Blob([logText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agentName ? agentName.replace(/\s+/g, '_').toLowerCase() : 'agent'}_run_log.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
    const blob = new Blob([JSON.stringify(logObj, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agentName ? agentName.replace(/\s+/g, '_').toLowerCase() : 'agent'}_run_log.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
              rehypePlugins={[rehypeSanitize]}
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
