import { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  FileCode, 
  Copy, 
  Check, 
  ChevronDown,
  Share2
} from 'lucide-react';
import { exportToTXT, exportToMarkdown, exportToPDF, copyToClipboard } from '../lib/exportUtils';

export default function ExportCenter({ content, agentName, outputType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  const filename = (agentName || 'agent-output').toLowerCase().replace(/\s+/g, '-');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = async () => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setIsOpen(false);
  };

  const exportOptions = [
    { 
      label: 'Export as PDF', 
      icon: <FileText size={16} />, 
      action: () => exportToPDF(content, filename, agentName),
      description: 'Best for reading and sharing'
    },
    { 
      label: 'Export as Markdown', 
      icon: <FileCode size={16} />, 
      action: () => exportToMarkdown(content, filename),
      description: 'Best for developers and documentation'
    },
    { 
      label: 'Export as TXT', 
      icon: <FileText size={16} />, 
      action: () => exportToTXT(content, filename),
      description: 'Plain text format'
    },
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-all rounded-lg
            dark:bg-surface-input dark:text-text-secondary dark:hover:text-text-primary dark:border-border
            bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200 shadow-sm hover:shadow"
        >
          <Download size={16} />
          <span>Export</span>
          <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <button
          onClick={handleCopy}
          title="Copy to clipboard"
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-all rounded-lg
            dark:bg-surface-input dark:text-text-secondary dark:hover:text-text-primary dark:border-border
            bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200 shadow-sm hover:shadow"
        >
          {copied ? (
            <>
              <Check size={16} className="text-success" />
              <span className="text-success">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border bg-white dark:bg-surface-card dark:border-border shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-text-muted uppercase tracking-wider">
              Download Formats
            </div>
            {exportOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  option.action();
                  setIsOpen(false);
                }}
                className="w-full flex items-start gap-3 px-3 py-2.5 text-sm text-left transition-colors rounded-lg
                  dark:hover:bg-surface-hover dark:text-text-primary
                  hover:bg-gray-50 text-gray-700 group"
              >
                <div className="mt-0.5 text-gray-400 group-hover:text-primary dark:group-hover:text-primary-light">
                  {option.icon}
                </div>
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-400 dark:text-text-muted">{option.description}</div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="border-t dark:border-border border-gray-100 p-2 bg-gray-50/50 dark:bg-black/10">
            <button
              onClick={() => {
                const shareText = `--- Agent: ${agentName} ---\n\n--- Output ---\n${content}`;
                copyToClipboard(shareText);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors rounded-lg
                dark:hover:bg-surface-hover dark:text-text-primary
                hover:bg-gray-100 text-gray-700"
            >
              <Share2 size={16} className="text-gray-400" />
              <span className="font-medium">Copy Shareable Format</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
