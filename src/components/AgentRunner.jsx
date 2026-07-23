import { useState, useEffect, useRef, useCallback } from "react";
import { recordAnalyticsRun } from "../lib/useAnalytics";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import CustomSelect from "./CustomSelect";
import {
  Loader2,
  RotateCcw,
  Clock,
  Zap,
  StopCircle,
  ChevronDown,
  ChevronRight,
  Sparkles,
  RotateCw,
  GitBranch,
  Trash2,
  CalendarClock,
  Layers,
} from "lucide-react";
import ApiKeyBar from "./ApiKeyBar";
import ApiKeyInfo from "./ApiKeyInfo";
import OutputRenderer from "./OutputRenderer";
import ErrorCard from "./ErrorCard";
import CharCounter from "./CharCounter";
import TokenCounter from "./TokenCounter";
import CostEstimator from "./CostEstimator";
import { useSessionSpend } from "../lib/useSessionSpend";
import VoiceInput from "./VoiceInput";
import SuggestedChainPills from "./SuggestedChainPills";
import RunRating from "./RunRating";
import BatchModeRunner from "./BatchModeRunner";
import ErrorBoundary from "./ErrorBoundary";
import ScheduleAgentModal from "./ScheduleAgentModal";
import { useScheduler } from "../lib/useScheduler";
import { useApiKey } from "../lib/useApiKey";
import { streamAgent } from "../lib/llmAdapter";
import { analyseModels } from "../lib/modelAnalyser";
import { useHistory } from "../lib/useHistory";
import { resolveAgentModel, MODEL_MAP, MODELS, } from "../lib/resolveAgentModel";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

const providerLabels = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  gemini: "Gemini",
  openrouter: "OpenRouter",
  any: "Any",
};


const LOADING_MESSAGES = [
  "⚙️ Agent is grinding for you...",
  "🧠 Big brain moment loading...",
  "✨ Cooking something fire...",
  "🤖 Agent is in its era...",
  "💀 This might actually go crazy...",
  "🔥 Almost done, hold tight...",
  "🚀 Sending it...",
  "👀 Your agent is locked in...",
];

const MAX_CHAR_LIMIT = 4000; // Character cap configuration
export default function AgentRunner({ agent }) {
  const {
    provider,
    setProvider,
    apiKey,
    setApiKey,
    saveForSession,
    setSaveForSession,
  } = useApiKey();

  const { saveRun } = useHistory();
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({});
  const [output, setOutput] = useState(null);
  const [streamingOutput, setStreamingOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(null);
  const [selectedModel, setSelectedModel] = useState(
    MODEL_MAP[provider] || MODEL_MAP.openai,
  );
  const [versionHistory, setVersionHistory] = useState([]);
  const [playgroundOpen, setPlaygroundOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(agent.systemPrompt);
  const [lastRunSystemPrompt, setLastRunSystemPrompt] = useState("");
  const [lastRunUserMessage, setLastRunUserMessage] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);
  const [analyserOpen, setAnalyserOpen] = useState(false);
  const [modelRecommendation, setModelRecommendation] = useState(null);
  const [analyserLoading, setAnalyserLoading] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [showModelSwitcher, setShowModelSwitcher] = useState(false);
  const { addJob } = useScheduler();
  const { addRun } = useSessionSpend();

  const isPromptModified = customPrompt !== agent.systemPrompt;
  const abortControllerRef = useRef(null);
  const textareaRefs = useRef({});
  

  useKeyboardShortcuts({
  'Control+Enter': () => {
    if (batchMode) return;
    if (canRun() && !loading) handleRun();
  },
    'Escape': () => {
      handleClear();
      setPlaygroundOpen(false);
    },
  });

  useEffect(() => {
    setSelectedModel(MODEL_MAP[provider] || MODEL_MAP.openai);
  }, [provider]);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setOutput(null);
    setStreamingOutput("");
    setIsStreaming(false);
    setError(null);
    setDuration(null);
    setCustomPrompt(agent.systemPrompt);
    setPlaygroundOpen(false);
    setBatchMode(false);

    const defaults = {};
    agent.inputs.forEach((input) => {
      if (input.defaultValue !== undefined) {
        defaults[input.id] = input.defaultValue;
      } else if (input.type === "multiselect") {
        defaults[input.id] = [];
      } else {
        defaults[input.id] = "";
      }
    });
    setInputs(defaults);

    if (agent.provider !== "any") {
      setProvider(agent.provider);
    } else if (agent.defaultProvider) {
      setProvider(agent.defaultProvider);
    }
  }, [agent.id]);

  useEffect(() => {
    if (!loading || isStreaming) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [loading, isStreaming]);

  const updateInput = (id, value) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  const getWordCount = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const getTokenCount = (text) => {
  if (!text) return 0;
  // A rough but highly accurate standard estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
};

  const toggleMultiselect = (id, option) => {
    setInputs((prev) => {
      const current = prev[id] || [];
      return {
        ...prev,
        [id]: current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option],
      };
    });
  };

  const buildUserMessage = () => {
    const parts = [];
    agent.inputs.forEach((input) => {
      const val = inputs[input.id];
      if (!val || (Array.isArray(val) && val.length === 0)) return;
      
      const sanitizedVal = typeof val === "string" ? val.trim() : val;
      if (sanitizedVal === "") return;

      parts.push(
        Array.isArray(sanitizedVal)
          ? `${input.label}: ${sanitizedVal.join(", ")}`
          : `${input.label}: ${sanitizedVal}`,
      );
    });

    return parts
      .join("\n\n")
      .trim()
      .replace(/\n{3,}/g, "\n\n");
  };

  const canRun = () => {
    if (!apiKey) return false;
    return hasRequiredInputs();
  };

  const hasRequiredInputs = () => {
    return agent.inputs
      .filter((i) => i.required)
      .every((i) => {
        const v = inputs[i.id];
        if (Array.isArray(v)) return v.length > 0;
        return v && v.trim() !== "";
      });
  };

  const hasInputContent = () => {
    if (output || streamingOutput || error) return true;
    return agent.inputs.some((input) => {
      const v = inputs[input.id];
      if (Array.isArray(v)) return v.length > 0;
      return v && v !== (input.defaultValue ?? "");
    });
  };

  const handleChunk = useCallback((chunk) => {
    setStreamingOutput((prev) => prev + chunk);
    setIsStreaming(true);
  }, []);

const handleRun = async () => {
    setLoading(true);
    setError(null);
    setOutput(null);
    setStreamingOutput("");
    setIsStreaming(false);
    setDuration(null);
    setMsgIndex(0);

      const newVersion = {
      versionNumber: versionHistory.length + 1,
      timestamp: new Date().toLocaleTimeString(),
      configSnapshot: { ...inputs }
    };
    setVersionHistory((prevHistory) => [
      {
        versionNumber: prevHistory.length + 1,
        timestamp: new Date().toLocaleTimeString(),
        configSnapshot: { ...inputs },
      },
      ...prevHistory,
    ]);

    setLastRunSystemPrompt(customPrompt);
    setLastRunUserMessage(buildUserMessage());

    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      const actualProvider =
        agent.provider === "any" ? provider : agent.provider;
      const model = resolveAgentModel(agent, actualProvider, selectedModel);

      const result = await streamAgent({
        provider: actualProvider,
        model,
        apiKey,
        systemPrompt: customPrompt,
        userMessage: buildUserMessage(),
        onChunk: handleChunk,
        signal: controller.signal,
      });

      setOutput(result.content);
      setStreamingOutput("");
      setIsStreaming(false);
      setDuration(result.duration);

      const inputTokenEstimate = Math.max(
        1,
        Math.round((customPrompt.length + buildUserMessage().length) / 4),
      );
      const outputTokenEstimate = Math.max(1, Math.round(result.content.length / 4));

      addRun({
        model,
        inputTokens: inputTokenEstimate,
        outputTokens: outputTokenEstimate,
        inputCost: null,
        outputCost: null,
      });

      saveRun({
        agentId: agent.id,
        agentName: agent.name,
        inputs: { ...inputs },
        output: result.content,
        provider: actualProvider,
      });

      recordAnalyticsRun({
        agentId: agent.id,
        agentName: agent.name,
        category: agent.category,
        provider: actualProvider,
        model,
        duration: result.duration,
      });
   } catch (err) {
  if (err.name !== "AbortError") {
    if (err && err.type === "invalid_api_key") {
      setError(err);
    } else {
      setError({ type: "generic", message: err.message });
    }
  }
} finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setOutput(streamingOutput);
    setStreamingOutput("");
    setIsStreaming(false);
    setLoading(false);
  };

  const handleClear = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setOutput(null);
    setStreamingOutput("");
    setIsStreaming(false);
    setError(null);
    setDuration(null);

    const defaults = {};
    agent.inputs.forEach((input) => {
      if (input.defaultValue !== undefined) {
        defaults[input.id] = input.defaultValue;
      } else if (input.type === "multiselect") {
        defaults[input.id] = [];
      } else {
        defaults[input.id] = "";
      }
    });
    setInputs(defaults);
  };

  const handleFillExample = () => {
    if (!agent.exampleInputs) return;
    setInputs((prev) => ({ ...prev, ...agent.exampleInputs }));
  };

  const handleAnalyseModels = async () => {
    if (!apiKey) return;
    setAnalyserLoading(true);
    setModelRecommendation(null);
    try {
      const result = await analyseModels(agent, apiKey, provider);
      setModelRecommendation(result);
    } catch (err) {
      setModelRecommendation("Failed to analyse models. Please try again.");
    } finally {
      setAnalyserLoading(false);
    }
  };

  const handleSendToWorkflow = () => {
    navigate("/workflows/build", {
      state: {
        preselectedAgents: [agent.id],
        preFilledOutput: output,
      },
    });
  };

  const IconComponent = Icons[agent.icon] || Icons.Bot;
  const supportsBatchMode = agent.inputs.some((i) =>
    ["text", "textarea", "code"].includes(i.type)
  );

 return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Breadcrumb */}
      <a
        href="/"
        className="inline-flex items-center gap-2 mb-5
          px-3 py-2 rounded-lg
          bg-indigo-50 dark:bg-indigo-500/10
          border border-indigo-200 dark:border-indigo-500/20
          text-sm font-semibold
          text-indigo-700 dark:text-indigo-300
          hover:bg-indigo-100 dark:hover:bg-indigo-500/20
          transition-all duration-200"
      >
        ← All Agents
      </a>

      <div className="mt-2 mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 text-gray-900 dark:text-gray-100">
        <h3 className="
          text-xl
          font-bold
          tracking-tight
          mb-3
          bg-gradient-to-r
          from-amber-500
          to-orange-500
          dark:from-yellow-300
          dark:to-orange-400
          bg-clip-text
          text-transparent
          ">
          Version History
          </h3>
        {versionHistory.length === 0 ? (
          <p className="text-gray-500 text-sm dark:text-gray-400">No versions saved yet. Click "Run" to create one.</p>
        ) : (
          <ul className="space-y-2">
            {versionHistory.map((v) => (
              <li key={v.versionNumber} className="flex justify-between items-center p-2 bg-white dark:bg-zinc-800 rounded shadow-sm text-sm">
                <div>
                  <span className="font-medium text-blue-600 dark:text-blue-400">Version {v.versionNumber}</span>
                  <span className="text-gray-400 dark:text-gray-500 text-xs ml-2">({v.timestamp})</span>
                </div>
                <button
                  onClick={() => setInputs(v.configSnapshot)}
                  className="px-2 py-1 text-xs bg-gray-200 dark:bg-zinc-700 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white rounded transition"
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Agent Header */}
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
          <IconComponent size={24} className="text-accent" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-lg font-bold dark:text-text-primary text-gray-900">
              {agent.name}
            </h1>
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full
              dark:bg-surface-input dark:text-text-muted dark:border-border
              bg-gray-100 text-gray-500 border border-gray-200"
            >
              {agent.category}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
              {providerLabels[agent.provider] || agent.provider}
            </span>
          </div>
          <p className="text-xs dark:text-text-secondary text-gray-500">
            {agent.description}
          </p>
        </div>
        <button
          onClick={handleClear}
          disabled={!hasInputContent()}
          title="Clear Chat"
          className="p-2 rounded-lg dark:text-text-muted text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* API Key Bar */}
      <ApiKeyBar
        provider={provider}
        setProvider={setProvider}
        apiKey={apiKey}
        setApiKey={setApiKey}
        saveForSession={saveForSession}
        setSaveForSession={setSaveForSession}
        agentProvider={agent.provider}
        model={selectedModel}
        setModel={setSelectedModel}
      />

      {supportsBatchMode && (
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setBatchMode((prev) => !prev)}
            title="Run this agent across multiple inputs at once"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
              transition-all duration-200 active:scale-95
              ${
                batchMode
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 border border-violet-500/30"
                  : "bg-white dark:bg-surface-card border border-gray-200 dark:border-border text-gray-700 dark:text-text-primary hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-md"
              }`}
          >
            <Layers size={16} />
            {batchMode ? "Exit Batch Mode" : "Batch Mode"}
          </button>
        </div>
      )}

      {batchMode ? (
        <div className="mb-6">
          <BatchModeRunner
            agent={agent}
            provider={agent.provider === "any" ? provider : agent.provider}
            apiKey={apiKey}
            selectedModel={selectedModel}
            systemPrompt={customPrompt}
          />
        </div>
      ) : (
        <>
      {/* Input Form */}
      <div className="space-y-3 mb-4">
        {agent.inputs.map((input) => (
          <div key={input.id}>
            <label className="block text-xs font-medium dark:text-text-secondary text-gray-600 mb-1.5">
              {input.label}
              {input.required && <span className="text-error ml-0.5">*</span>}
            </label>

            {input.type === "text" && (
              <div className="relative">
                <input
                  type="text"
                  value={inputs[input.id] || ""}
                  onChange={(e) => updateInput(input.id, e.target.value)}
                  placeholder={input.placeholder}
                  className="w-full h-9 pl-3 pr-10 rounded-md text-sm transition-colors
                    dark:bg-surface-input dark:border-border dark:text-text-primary dark:placeholder:text-text-muted
                    bg-gray-50 border border-gray-200 text-gray-900 placeholder:dark:text-text-muted text-gray-500
                    focus:ring-1 focus:ring-accent focus:border-accent outline-none"
                />
                <VoiceInput
                  value={inputs[input.id] || ""}
                  onChange={(v) => updateInput(input.id, v)}
                  className="top-1/2 -translate-y-1/2 right-1.5"
                />
              </div>
            )}

            {input.type === "textarea" && (
              <div className="relative flex flex-col gap-1">
                <textarea
  ref={(el) => {
    textareaRefs.current[input.id] = el;
  }}
                  value={inputs[input.id] || ""}
                  onChange={(e) => {
  if (e.target.value.length <= MAX_CHAR_LIMIT) {
    updateInput(input.id, e.target.value);

    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  }
}}
                  placeholder={input.placeholder}
                  rows={4}
                  className="w-full pl-3 pr-10 py-2 rounded-md text-sm transition-colors resize-none overflow-hidden
                    dark:bg-surface-input dark:border-border dark:text-text-primary dark:placeholder:text-text-muted
                    bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400
                    focus:ring-1 focus:ring-accent focus:border-accent outline-none"
                />
                <VoiceInput
                  value={inputs[input.id] || ""}
                  onChange={(v) => {
                    if (v.length <= MAX_CHAR_LIMIT) updateInput(input.id, v);
                  }}
                  className="top-2 right-2"
                />
                
                {/* Dynamic Live Counter Metric Footer Grid */}
                <div className="flex justify-between items-center px-1 text-[11px] text-gray-400 dark:text-text-muted mt-1.5 w-full">
                  <div className="flex gap-2 font-medium">
                    <span>📝 Words: {getWordCount(inputs[input.id])}</span>
                    <span>🪙 Est. Tokens: {getTokenCount(inputs[input.id])}</span>
                  </div>
                  <span className={`self-end ${inputs[input.id]?.length >= MAX_CHAR_LIMIT ? "text-red-500 font-semibold" : ""}`}>
                    {inputs[input.id]?.length || 0} / {MAX_CHAR_LIMIT} characters
                  </span>
                </div>

                <TokenCounter
                  value={inputs[input.id] || ""}
                  modelId={selectedModel}
                />
              </div>
            )}

            {input.type === "code" && (
              <div className="relative">
                <textarea
                  value={inputs[input.id] || ""}
                  onChange={(e) => updateInput(input.id, e.target.value)}
                  placeholder={input.placeholder}
                  rows={8}
                  className="w-full pl-3 pr-10 py-2 rounded-md text-xs font-mono transition-colors resize-y leading-relaxed
                    dark:bg-[#0d1117] dark:border-border dark:text-green-300 dark:placeholder:text-text-muted
                    bg-gray-900 border border-gray-700 text-green-400 placeholder:text-gray-500
                    focus:ring-1 focus:ring-accent focus:border-accent outline-none"
                  spellCheck={false}
                />
                <VoiceInput
                  value={inputs[input.id] || ""}
                  onChange={(v) => updateInput(input.id, v)}
                  className="top-2 right-2"
                />
                <div className="flex items-center gap-3 mt-1">
                  <CharCounter
                    value={inputs[input.id] || ""}
                    maxLength={5000}
                  />
                  <TokenCounter
                    value={inputs[input.id] || ""}
                    modelId={selectedModel}
                  />
                </div>
              </div>
            )}

            {input.type === "select" && (
              <CustomSelect
                value={inputs[input.id] || input.defaultValue || ""}
                onChange={(val) => updateInput(input.id, val)}
                options={input.options || []}
                className="w-full sm:w-64"
                triggerClassName="h-9"
              />
            )}

            {input.type === "multiselect" && (
              <div className="flex flex-wrap gap-2">
                {input.options?.map((opt) => {
                  const selected = (inputs[input.id] || []).includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleMultiselect(input.id, opt)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all border
                        ${
                          selected
                            ? "bg-accent/15 text-accent border-accent/30"
                            : "dark:bg-surface-input dark:text-text-secondary dark:border-border dark:hover:border-accent/30 bg-gray-50 text-gray-500 border-gray-200 hover:border-indigo-300"
                        }`}
                    >
                      {selected && "✓ "}
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Suggested workflow chain pills */}
      <SuggestedChainPills agent={agent} />

<div className="mb-4">
  <button
    onClick={handleFillExample}
    className="
      inline-flex items-center gap-2
      px-3 py-1.5
      rounded-full
      bg-accent/10
      text-accent
      font-semibold
      border border-accent/20
      hover:bg-accent/20
      hover:border-accent/30
      hover:gap-3
      transition-all duration-200
    "
  >
    ✨ Try an example
  </button>
</div>

      {/* Prompt Playground */}
      <div
        className="mb-4 rounded-lg border transition-all duration-200
        dark:bg-surface-card dark:border-border bg-white border-gray-200"
      >
        <button
          onClick={() => setPlaygroundOpen(!playgroundOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-left group"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-accent" />
            <span className="text-xs font-semibold dark:text-text-primary text-gray-700">
              Prompt Playground
            </span>
            {isPromptModified && (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full
                bg-amber-400/10 text-amber-500 border border-amber-400/20"
              >
                Modified
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] dark:text-text-muted text-gray-400">
              {playgroundOpen ? "Collapse" : "Edit system prompt"}
            </span>
            {playgroundOpen ? (
              <ChevronDown
                size={14}
                className="dark:text-text-muted text-gray-400 transition-transform"
              />
            ) : (
              <ChevronRight
                size={14}
                className="dark:text-text-muted text-gray-400 transition-transform"
              />
            )}
          </div>
        </button>

        {playgroundOpen && (
          <div className="px-4 pb-4 animate-fade-in">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[11px] font-medium dark:text-text-secondary text-gray-500">
                System Prompt
              </label>
              <div className="flex items-center gap-2">
                <TokenCounter
                  value={customPrompt}
                  modelId={selectedModel}
                />
                <CharCounter
                  value={customPrompt}
                  maxLength={5000}
                />
                {isPromptModified && (
                  <button
                    onClick={() => setCustomPrompt(agent.systemPrompt)}
                    className="flex items-center gap-1 text-[10px] font-medium text-accent hover:text-accent-hover transition-colors"
                    title="Reset to default prompt"
                  >
                    <RotateCw size={10} />
                    Reset
                  </button>
                )}
              </div>
            </div>
            <div className="relative">
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={10}
                spellCheck={false}
                className="w-full pl-3 pr-10 py-2.5 rounded-lg text-xs font-mono leading-relaxed transition-colors resize-y
                  dark:bg-[#0d1117] dark:border-border dark:text-text-secondary text-gray-600 dark:placeholder:text-text-muted
                  bg-gray-50 border border-gray-200 text-gray-700 placeholder:text-gray-400
                  focus:ring-1 focus:ring-accent focus:border-accent outline-none"
                placeholder="Enter your custom system prompt..."
              />
              <VoiceInput
                value={customPrompt}
                onChange={(v) => setCustomPrompt(v)}
                className="top-2 right-2"
              />
            </div>
            {isPromptModified && (
              <p className="mt-2 text-[10px] dark:text-amber-400/80 text-amber-600 flex items-center gap-1">
                <Sparkles size={10} />
                You're using a custom prompt. This won't affect other users.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Model Analyser Panel */}
      <div className="mb-4 rounded-lg border transition-all duration-200
        dark:bg-surface-card dark:border-border bg-white border-gray-200">
        <button
          onClick={() => setAnalyserOpen(!analyserOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-left group"
        >
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-accent" />
            <span className="text-xs font-semibold dark:text-text-primary text-gray-700">
              Model Analyser
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full
              bg-accent/10 text-accent border border-accent/20">
              Beta
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] dark:text-text-muted text-gray-400">
              {analyserOpen ? "Collapse" : "Find the best model for this agent"}
            </span>
            {analyserOpen ? (
              <ChevronDown size={14} className="dark:text-text-muted text-gray-400" />
            ) : (
              <ChevronRight size={14} className="dark:text-text-muted text-gray-400" />
            )}
          </div>
        </button>

        {analyserOpen && (
          <div className="px-4 pb-4 animate-fade-in">
            {!apiKey && (
              <p className="text-xs dark:text-text-muted text-gray-400 mb-3">
                Add an API key above to analyse models.
              </p>
            )}
            {apiKey && !modelRecommendation && !analyserLoading && (
              <button
                onClick={handleAnalyseModels}
                className="flex items-center gap-2 px-4 py-2 rounded-xl
                font-semibold text-white
                bg-gradient-to-r from-emerald-600 to-teal-600
                hover:from-emerald-500 hover:to-teal-500
                shadow-md shadow-emerald-500/25
                transition-all duration-200"
              >
                <Zap size={12} />
                Analyse Models
              </button>
            )}
            {analyserLoading && (
              <div className="flex items-center gap-2 text-xs text-accent">
                <Loader2 size={14} className="animate-spin" />
                Analysing best models for this agent...
              </div>
            )}
            {modelRecommendation && (
              <div className="mt-2">
                <OutputRenderer
                  content={modelRecommendation}
                  outputType="markdown"
                  agentName="Model Analyser"
                  systemPrompt=""
                />
                <button
                  onClick={() => setModelRecommendation(null)}
                  className="mt-2 text-[10px] text-accent hover:underline"
                >
                  ↺ Re-analyse
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mb-6">
        {loading ? (
          <button
            onClick={handleStop}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold
              text-white bg-red-500 hover:bg-red-600
              transition-all duration-200 active:scale-[0.98]"
          >
            <StopCircle size={16} />
            Stop
          </button>
        ) : (
          <button
            onClick={handleRun}
            disabled={!canRun()}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white
              bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200 active:scale-[0.98]"
          >
            <Zap size={16} />
            Run Agent
          </button>
        )}

        <button
          onClick={handleClear}
          disabled={!hasInputContent()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
            dark:text-text-secondary dark:hover:text-text-primary dark:hover:bg-surface-hover
            text-gray-500 hover:text-gray-900 hover:bg-gray-100
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
        >
          <RotateCcw size={14} />
          Clear
        </button>

        {/* Schedule button */}
        <button
          onClick={() => setScheduleModalOpen(true)}
          disabled={!hasRequiredInputs()}
          title={
            hasRequiredInputs()
              ? "Schedule this agent to run automatically"
              : "Fill required inputs before scheduling"
          }
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
            dark:text-text-secondary dark:hover:text-text-primary dark:hover:bg-surface-hover
            text-gray-500 hover:text-gray-900 hover:bg-gray-100
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
        >
          <CalendarClock size={14} />
          Schedule
        </button>

        {duration && (
          <div className="flex items-center gap-1 text-[11px] dark:text-text-muted text-gray-400 ml-auto">
            <Clock size={11} />
            {(duration / 1000).toFixed(1)}s
          </div>
        )}
      </div>

      <div className="mb-4">
        <CostEstimator
          inputText={buildUserMessage()}
          systemPrompt={customPrompt}
          modelId={selectedModel}
        />
      </div>

      {error && error.type === "invalid_api_key" ? (
        <ErrorCard message={
          <>
            <strong>
              {error.provider === "openai" && "Your OpenAI API key is invalid or expired."}
              {error.provider === "anthropic" && "Your Anthropic API key is invalid or expired."}
              {error.provider === "gemini" && "Your Google Gemini API key is invalid or expired."}
              {!["openai", "anthropic", "gemini"].includes(error.provider) && "Your API key is invalid or expired."}
            </strong>
            <br />
            Please check and update your API key.<br />
            <button
              className="underline text-accent"
              onClick={() => window.dispatchEvent(new CustomEvent("open-api-key-bar"))}
            >
              Update API Key
            </button>
            <span> or </span>
            <button
              className="underline text-accent"
              onClick={() => window.location.reload()}
            >
              Reloads page after an invalid API key error
            </button>
            {error.detail && (
              <>
                <br /><br />
                <span className="text-xs text-gray-400">Details: {error.detail}</span>
              </>
            )}
          </>
        } />
      ) : (
        error && <ErrorCard message={error.message || error} />
      )}

      {loading && !isStreaming && (
        <div className="rounded-lg border p-6 dark:bg-surface-card dark:border-border bg-white border-gray-200 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Loader2 size={16} className="animate-spin text-accent" />
            <span className="text-xs font-medium text-accent">
              Connecting to API...
            </span>
          </div>
          <p className="text-sm dark:text-text-secondary text-gray-500 transition-all duration-500">
            {LOADING_MESSAGES[msgIndex]}
          </p>
        </div>
      )}

      {isStreaming && streamingOutput && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400">
              Output
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-accent">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              Streaming....
            </span>
          </div>
          <div className="rounded-lg border p-4 dark:bg-surface-card dark:border-border bg-white border-gray-200">
            <div className="markdown-output text-sm dark:text-text-primary text-gray-900">
              <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                {streamingOutput}
                <span className="inline-block w-[2px] h-[1em] bg-accent animate-blink ml-0.5 align-middle" />
              </pre>
            </div>
          </div>
        </div>
      )}

      {output && !isStreaming && (
        <div className="space-y-4">
          <ErrorBoundary>
            <OutputRenderer
              content={output}
              outputType={agent.outputType}
              agentName={agent.name}
              systemPrompt={lastRunSystemPrompt}
              userMessage={lastRunUserMessage}
            />
            <div className="flex items-center gap-2 mt-3">
  <button
    onClick={() => setShowModelSwitcher(!showModelSwitcher)}
    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm
      bg-accent/10 hover:bg-accent/20 text-accent"
  >
    <RotateCw size={14} />
    Try Different Model
  </button>

  <span className="text-xs text-gray-500">
    Current: {selectedModel}
  </span>
</div>
{showModelSwitcher && (
  <div className="mt-3 p-4 border rounded-lg flex flex-wrap gap-3 items-center">
<CustomSelect
      value={provider}
      onChange={setProvider}
      options={[
        { value: "openai", label: "OpenAI" },
        { value: "anthropic", label: "Anthropic" },
        { value: "gemini", label: "Gemini" },
        { value: "openrouter", label: "OpenRouter" },
      ]}
    />

    <CustomSelect
      value={selectedModel}
      onChange={setSelectedModel}
      options={MODELS[provider] || []}
    />

    <button
      onClick={async () => {
        setShowModelSwitcher(false);
        await handleRun();
      }}
      className="px-4 py-2 rounded-lg bg-accent text-white"
    >
      Run Again
    </button>

  </div>
)}
          </ErrorBoundary>
          <div className="mt-4">
            <RunRating agentId={agent.id} />
            <button
              onClick={handleSendToWorkflow}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                text-accent bg-accent/10 hover:bg-accent/20 transition-all border border-accent/20"
            >
              <GitBranch size={16} />
              Send output to Workflow Builder →
            </button>
          </div>
        </div>
      )}

      </>
      )}

      {/* Schedule Agent Modal */}
      {scheduleModalOpen && (
        <ScheduleAgentModal
          agent={agent}
          inputs={inputs}
          provider={provider}
          apiKey={apiKey}
          onSchedule={(scheduleData) => {
            addJob({
              agentId: agent.id,
              agentName: agent.name,
              agentDefinition: agent,
              inputs: { ...inputs },
              ...scheduleData,
            })
          }}
          onClose={() => setScheduleModalOpen(false)}
        />
      )}
    </div>
  );
}



 

  
