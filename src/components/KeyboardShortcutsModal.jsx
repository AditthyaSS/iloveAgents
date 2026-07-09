import { X, Command, CornerDownLeft, Search, Type, HelpCircle } from 'lucide-react';

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + Enter', description: 'Run Agent or Workflow', icon: <CornerDownLeft size={14} /> },
    { key: '/', description: 'Focus Search Bar', icon: <Search size={14} /> },
    { key: 'Esc', description: 'Clear Inputs / Collapse Playground', icon: <X size={14} /> },
    { key: 'Alt + 1 / 2 / 3 / 4', description: 'Toggle Provider (OpenAI, Anthropic, Gemini, Groq)', icon: <Type size={14} /> },
    { key: '?', description: 'Open this help menu', icon: <HelpCircle size={14} /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-surface-card border border-gray-200 dark:border-border rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-border">
          <h2 className="text-lg font-bold text-gray-900 dark:text-text-primary flex items-center gap-2">
            <Command size={20} className="text-accent" />
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-text-primary hover:bg-gray-100 dark:hover:bg-surface-hover transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="px-6 py-4 space-y-4">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                  {s.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-text-secondary">
                  {s.description}
                </span>
              </div>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-300 rounded shadow-sm dark:bg-surface-input dark:border-border dark:text-text-muted">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
