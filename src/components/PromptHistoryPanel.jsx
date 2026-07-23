import { useState } from "react";
import { X, Search, Star, Trash2, Copy, RotateCcw, History } from "lucide-react";
import { usePromptHistory } from "../lib/usePromptHistory";

function truncate(text, max = 140) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trim() + "…" : text;
}

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function PromptItem({ entry, onUse, onToggleFavorite, onDelete, onCopy }) {
  return (
    <div className="group rounded-lg border p-3 dark:bg-surface-input dark:border-border bg-gray-50 border-gray-200 transition-colors hover:border-accent/40">
      <p className="text-xs dark:text-text-primary text-gray-800 leading-relaxed mb-2 whitespace-pre-wrap">
        {truncate(entry.text)}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] dark:text-text-muted text-gray-400">
          {entry.agentName && (
            <span className="px-1.5 py-0.5 rounded-full dark:bg-surface-hover bg-gray-100">
              {entry.agentName}
            </span>
          )}
          <span>{timeAgo(entry.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onUse(entry)}
            title="Use this prompt"
            className="p-1 rounded-md dark:text-text-muted text-gray-500 hover:text-accent hover:bg-accent/10 transition-colors"
          >
            <RotateCcw size={13} />
          </button>
          <button
            onClick={() => onCopy(entry)}
            title="Copy to clipboard"
            className="p-1 rounded-md dark:text-text-muted text-gray-500 hover:text-accent hover:bg-accent/10 transition-colors"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={() => onToggleFavorite(entry.id)}
            title={entry.favorite ? "Remove from favorites" : "Add to favorites"}
            className={`p-1 rounded-md transition-colors ${
              entry.favorite
                ? "text-yellow-400 hover:text-yellow-300"
                : "dark:text-text-muted text-gray-500 hover:text-yellow-400"
            }`}
          >
            <Star size={13} className={entry.favorite ? "fill-yellow-400" : ""} />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            title="Delete"
            className="p-1 rounded-md dark:text-text-muted text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide-over panel for browsing, searching, favoriting, and reusing
 * saved prompts across any agent.
 *
 * @param {boolean} open
 * @param {() => void} onClose
 * @param {(text: string) => void} onUsePrompt - called with the prompt text when "Use" is clicked
 */
export default function PromptHistoryPanel({ open, onClose, onUsePrompt }) {
  const { prompts, favorites, deletePrompt, clearHistory, toggleFavorite, searchPrompts } =
    usePromptHistory();
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  if (!open) return null;

  const nonFavorites = prompts.filter((p) => !p.favorite);
  const filteredFavorites = query ? searchPrompts(query).filter((p) => p.favorite) : favorites;
  const filteredHistory = query ? searchPrompts(query).filter((p) => !p.favorite) : nonFavorites;

  const handleUse = (entry) => {
    onUsePrompt(entry.text);
    onClose();
  };

  const handleCopy = async (entry) => {
    try {
      await navigator.clipboard.writeText(entry.text);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm h-full dark:bg-surface-card bg-white border-l dark:border-border border-gray-200 shadow-2xl flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-border border-gray-200">
          <div className="flex items-center gap-2">
            <History size={16} className="text-accent" />
            <h2 className="text-sm font-semibold dark:text-text-primary text-gray-900">
              Prompt History
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md dark:text-text-muted text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-hover transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b dark:border-border border-gray-200">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 dark:text-text-muted text-gray-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search prompts..."
              className="w-full h-8 pl-8 pr-3 rounded-md text-xs transition-colors
                dark:bg-surface-input dark:border-border dark:text-text-primary dark:placeholder:text-text-muted
                bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400
                focus:ring-1 focus:ring-accent focus:border-accent outline-none"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
          {prompts.length === 0 && (
            <p className="text-xs dark:text-text-muted text-gray-400 text-center py-8">
              No saved prompts yet. Save a prompt from any agent to see it here.
            </p>
          )}

          {filteredFavorites.length > 0 && (
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400 mb-2 flex items-center gap-1">
                <Star size={11} className="fill-yellow-400 text-yellow-400" />
                Favorites
              </h3>
              <div className="space-y-2">
                {filteredFavorites.map((entry) => (
                  <PromptItem
                    key={entry.id}
                    entry={entry}
                    onUse={handleUse}
                    onToggleFavorite={toggleFavorite}
                    onDelete={deletePrompt}
                    onCopy={handleCopy}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredHistory.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400">
                  History
                </h3>
                {!query && nonFavorites.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-[10px] text-accent hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {filteredHistory.map((entry) => (
                  <PromptItem
                    key={entry.id}
                    entry={entry}
                    onUse={handleUse}
                    onToggleFavorite={toggleFavorite}
                    onDelete={deletePrompt}
                    onCopy={handleCopy}
                  />
                ))}
              </div>
            </div>
          )}

          {query && filteredFavorites.length === 0 && filteredHistory.length === 0 && (
            <p className="text-xs dark:text-text-muted text-gray-400 text-center py-8">
              No prompts match "{query}".
            </p>
          )}
        </div>
      </div>
    </div>
  );
}