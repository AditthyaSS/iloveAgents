import { useState } from "react";
import * as Icons from "lucide-react";
import { ChevronDown, ChevronRight, FileCode2 } from "lucide-react";

const providerLabels = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  gemini: "Gemini",
  openrouter: "OpenRouter",
  any: "Any",
};

const typeLabels = {
  text: "Text",
  textarea: "Textarea",
  code: "Code",
  select: "Select",
  multiselect: "Multi-select",
};

export default function AgentPreviewPanel({ agent }) {
  const [promptOpen, setPromptOpen] = useState(false);
  const IconComponent = Icons[agent.icon] || Icons.Bot;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Agent identity */}
      <div className="flex items-start gap-4 p-4 rounded-lg border dark:bg-surface-card dark:border-border bg-white border-gray-200">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
          <IconComponent size={24} className="text-accent" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="text-base font-bold dark:text-text-primary text-gray-900">
              {agent.name}
            </h2>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full dark:bg-surface-input dark:text-text-muted dark:border-border bg-gray-100 text-gray-500 border border-gray-200">
              {agent.category}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
              {providerLabels[agent.provider] || agent.provider}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full dark:bg-surface-input dark:text-text-muted dark:border-border bg-gray-100 text-gray-500 border border-gray-200">
              {agent.outputType}
            </span>
          </div>
          <p className="text-xs dark:text-text-secondary text-gray-500">
            {agent.description}
          </p>
        </div>
      </div>

      {/* Input fields */}
      <div className="p-4 rounded-lg border dark:bg-surface-card dark:border-border bg-white border-gray-200">
        <h3 className="text-xs font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400 mb-3">
          Input Fields
        </h3>
        <div className="space-y-2">
          {agent.inputs.map((input) => (
            <div
              key={input.id}
              className="flex items-start justify-between gap-3 p-2.5 rounded-md dark:bg-surface-input bg-gray-50 border dark:border-border border-gray-200"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium dark:text-text-primary text-gray-800">
                    {input.label}
                  </span>
                  {input.required && (
                    <span className="text-error text-xs">*</span>
                  )}
                </div>
                {input.placeholder && (
                  <p className="text-[11px] dark:text-text-muted text-gray-400 mt-0.5">
                    Placeholder: "{input.placeholder}"
                  </p>
                )}
                {input.options && input.options.length > 0 && (
                  <p className="text-[11px] dark:text-text-muted text-gray-400 mt-0.5">
                    Options: {input.options.join(", ")}
                  </p>
                )}
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap dark:bg-surface-hover dark:text-text-secondary bg-gray-100 text-gray-500">
                {typeLabels[input.type] || input.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* System prompt, collapsed by default */}
      <div className="rounded-lg border dark:bg-surface-card dark:border-border bg-white border-gray-200">
        <button
          onClick={() => setPromptOpen(!promptOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <FileCode2 size={14} className="text-accent" />
            <span className="text-xs font-semibold dark:text-text-primary text-gray-700">
              System Prompt
            </span>
          </div>
          {promptOpen ? (
            <ChevronDown size={14} className="dark:text-text-muted text-gray-400" />
          ) : (
            <ChevronRight size={14} className="dark:text-text-muted text-gray-400" />
          )}
        </button>
        {promptOpen && (
          <div className="px-4 pb-4">
            <pre className="whitespace-pre-wrap text-xs font-mono leading-relaxed p-3 rounded-md dark:bg-[#0d1117] dark:text-text-secondary bg-gray-50 text-gray-700 border dark:border-border border-gray-200">
              {agent.systemPrompt}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}