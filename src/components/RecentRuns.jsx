import React from 'react';
import { RotateCcw, Copy, Trash2, History } from 'lucide-react';

const RecentRuns = ({ history, onRerun, onCopy, onDelete, onClearAll }) => {
  if (!history || history.length === 0) {
    return (
      <div className="w-full mt-2 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <History size={16} className="text-accent" />
          <h2 className="text-sm font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400">
            Recent Runs
          </h2>
        </div>
        <div className="p-8 border border-dashed rounded-xl text-center flex flex-col items-center justify-center gap-3
          dark:border-border dark:bg-surface-card/50 bg-gray-50 border-gray-200">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-1">
            <RotateCcw size={20} className="text-accent opacity-80" />
          </div>
          <h3 className="text-sm font-bold dark:text-text-primary text-gray-800">No history yet</h3>
          <p className="text-xs dark:text-text-secondary text-gray-500 max-w-[200px] leading-relaxed">
            Runs will automatically appear here once you start using agents.
          </p>
        </div>
      </div>
    );
  }

  const getProviderStyle = (provider) => {
    const p = provider?.toLowerCase() || '';
    if (p.includes('gpt') || p.includes('openai')) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    if (p.includes('claude') || p.includes('anthropic')) return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
    if (p.includes('gemini') || p.includes('google')) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
  };

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="w-full animate-fade-in flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History size={16} className="text-accent" />
          <h2 className="text-sm font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400">
            Recent Runs
          </h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
            {history.length}
          </span>
        </div>
        <button
          onClick={onClearAll}
          className="text-[11px] font-medium text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider"
          aria-label="Clear all history"
        >
          Clear All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 120px)', minHeight: '300px' }}>
        {history.map((run, idx) => (
          <div
            key={run.id}
            className="group relative flex flex-col p-4 rounded-xl border transition-all duration-200
              dark:bg-surface-card dark:border-border dark:hover:border-accent/50 dark:hover:shadow-accent/5
              bg-white border-gray-200 hover:border-accent/40 hover:shadow-md hover:shadow-accent/5"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            {/* Header info */}
            <div className="flex justify-between items-start mb-3 gap-2">
              <div className="flex flex-col gap-2 min-w-0">
                <h3 className="text-[14px] font-bold dark:text-text-primary text-gray-900 truncate">
                  {run.agentName}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[9px] px-2 py-0.5 rounded-md border font-bold uppercase tracking-wider ${getProviderStyle(run.provider)}`}>
                    {run.provider || 'Unknown'}
                  </span>
                  <span className="text-[10px] font-medium dark:text-text-muted text-gray-400 flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                    {formatTimeAgo(run.timestamp)}
                  </span>
                </div>
              </div>

              {/* Delete button (top right, fade in on hover) */}
              <button
                onClick={() => onDelete(run.id)}
                className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                title="Delete run"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Output Snippet */}
            <div className="relative mb-4">
              <p className="text-[13px] dark:text-text-secondary text-gray-600 line-clamp-3 leading-relaxed font-medium">
                {run.output}
              </p>
              {/* Fade out effect for long text */}
              {run.output?.length > 100 && (
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t dark:from-surface-card from-white to-transparent pointer-events-none" />
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-3 mt-auto pt-3 border-t dark:border-border/50 border-gray-100">
              <button
                onClick={() => onRerun(run)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all
                  dark:bg-surface-input dark:hover:bg-accent/10 dark:text-text-secondary dark:hover:text-accent
                  bg-gray-50 hover:bg-accent/10 text-gray-600 hover:text-accent border dark:border-transparent border-gray-200"
              >
                <RotateCcw size={13} />
                Re-run
              </button>
              <button
                onClick={() => onCopy(run.output)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all
                  dark:bg-surface-input dark:hover:bg-green-500/10 dark:text-text-secondary dark:hover:text-green-400
                  bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-600 border dark:border-transparent border-gray-200"
              >
                <Copy size={13} />
                Copy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentRuns;
