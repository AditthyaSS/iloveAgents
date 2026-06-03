import { useState } from 'react'
import { ClipboardList } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import ScorecardOutput from './ScorecardOutput'
import ExportCenter from './ExportCenter'

export default function OutputRenderer({ content, outputType, agentName, systemPrompt }) {
  if (!content) return null

  return (
    <div className="animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400">
          Output
        </span>
        <ExportCenter content={content} agentName={agentName} outputType={outputType} />
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
