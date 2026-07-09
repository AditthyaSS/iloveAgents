import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Swords,
  ArrowLeft,
  Key,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Settings,
  Key,
  Sword,
  Info,
  ExternalLink,
  ShieldCheck,
  Search
  Search,
  AlertCircle,
} from "lucide-react";
import { runAgent } from "../lib/llmAdapter";
import { loadAllAgents } from '../agents/registry'
import { useAgents } from '../lib/useAgents'
import BattleNavbar from "../components/BattleNavbar";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { loadAllAgents } from "../agents/registry";

// Input validation constants - prevent LLM calls with excessively long inputs
const INPUT_LIMITS = {
  text: 2000,      // Standard text field max
  textarea: 10000, // Textarea/description max
  code: 50000,     // Code input max (allow more for actual code)
  select: 1000,    // Select option max
  multiselect: 5000, // Combined multiselect options max
};

// Validate input length based on input type
function validateInput(input, value) {
  if (!value) return { valid: true };

  const limit = INPUT_LIMITS[input.type] || 2000;
  let length = 0;

  if (Array.isArray(value)) {
    // For multiselect, sum the lengths of all selected options
    length = value.join(", ").length;
  } else {
    length = String(value).length;
  }

  if (length > limit) {
    return {
      valid: false,
      error: `${input.label || "Input"} exceeds maximum length (${length}/${limit} characters)`,
      length,
      limit,
    };
  }

  return { valid: true, length, limit };
}

const API_KEY_FIELDS = [
  {
    id: "openai",
    label: "OpenAI API Key",
    placeholder: "sk-...",
    color: "text-yellow-400",
    border: "border-yellow-400/30",
    bg: "bg-yellow-400/10",
    focusBorder: "focus:border-yellow-400/60",
  },
  {
    id: "anthropic",
    label: "Anthropic API Key",
    placeholder: "sk-ant-...",
    color: "text-violet-400",
    border: "border-violet-400/30",
    bg: "bg-violet-400/10",
    focusBorder: "focus:border-violet-400/60",
  },
  {
    id: "gemini",
    label: "Gemini API Key",
    placeholder: "AIza...",
    color: "text-blue-400",
    border: "border-blue-400/30",
    bg: "bg-blue-400/10",
    focusBorder: "focus:border-blue-400/60",
  },
  {
    id: "groq",
    label: "Groq",
    model: "llama-3.3-70b-versatile",
    color: "red",
    borderClass: "border-red-400/40 battle-card-red",
    glowClass: "hover:shadow-red-400/30",
    headerBg: "bg-red-400/10 border-b border-red-400/30",
    textColor: "text-red-400",
    btnBg:
      "bg-red-400/10 hover:bg-red-400/20 text-red-400 border-red-400/40 border-2 hover:border-red-300/60 battle-btn-secondary",
    loaderColor: "text-red-400",
  },
];

function InputField({ input, value, onChange }) {
  const validation = validateInput(input, value);
  const baseClass =
    "w-full dark:bg-surface-input bg-gray-50 border border-gray-700 rounded-lg px-3 py-2 text-sm dark:text-text-primary text-gray-900 placeholder-gray-500 outline-none focus:border-gray-500 transition-colors duration-200 resize-none";

  const borderClass = validation.valid
    ? "border-gray-700"
    : "border-red-500/50 focus:border-red-500";

  if (input.type === "select") {
    return (
      <div>
        <div className="relative">
          <select
            value={value ?? input.defaultValue ?? ""}
            onChange={(e) => onChange(input.id, e.target.value)}
            className={`${baseClass} ${borderClass} appearance-none cursor-pointer`}
            style={{ background: "rgb(17 24 39 / 0.6)" }}
          >
            {input.options.map((opt) => (
              <option key={opt} value={opt} style={{ background: "#111827" }}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-text-muted text-gray-500 pointer-events-none"
          />
        </div>
        {!validation.valid && (
          <div className="flex items-center gap-2 mt-1 text-xs text-red-400">
            <AlertCircle size={12} />
            {validation.error}
          </div>
        )}
      </div>
    );
  }

  if (input.type === "multiselect") {
    const selected = Array.isArray(value)
      ? value
      : input.defaultValue ?? [];
    const toggle = (opt) => {
      const next = selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt];
      onChange(input.id, next);
    };
    return (
      <div>
        <div className="flex flex-wrap gap-2">
          {input.options.map((opt) => {
            const active = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150
                  ${active
                    ? "bg-yellow-400/20 border-yellow-400/60 text-yellow-300"
                    : "bg-gray-800/60 border-gray-700 dark:text-text-muted text-gray-500 hover:border-gray-500 hover:text-gray-300"
                  }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {!validation.valid && (
          <div className="flex items-center gap-2 mt-1 text-xs text-red-400">
            <AlertCircle size={12} />
            {validation.error}
          </div>
        )}
      </div>
    );
  }

  if (input.type === "code" || input.type === "textarea") {
    return (
      <div>
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(input.id, e.target.value)}
          placeholder={input.placeholder}
          rows={input.type === "code" ? 8 : 4}
          className={`${baseClass} ${borderClass} font-mono text-xs leading-relaxed`}
        />
        <div className="flex items-center justify-between mt-1 text-xs">
          <div className={validation.valid ? "text-gray-500" : "text-red-400 flex items-center gap-1"}>
            {!validation.valid && (
              <>
                <AlertCircle size={12} />
                {validation.error}
              </>
            )}
            {validation.valid && validation.length > 0 && (
              <span className="text-gray-500">{validation.length}/{validation.limit} characters</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default: text input
  return (
    <div>
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(input.id, e.target.value)}
        placeholder={input.placeholder}
        className={`${baseClass} ${borderClass}`}
      />
      {!validation.valid && (
        <div className="flex items-center gap-2 mt-1 text-xs text-red-400">
          <AlertCircle size={12} />
          {validation.error}
        </div>
      )}
    </div>
  );
}

export default function BattleModeSetup() {
  const navigate = useNavigate();
  useDocumentTitle("Battle Setup");

  const [results, setResults] = useState({
    openai: { loading: true, content: null, error: null, duration: null },
    anthropic: { loading: true, content: null, error: null, duration: null },
    gemini: { loading: true, content: null, error: null, duration: null },
    groq: { loading: true, content: null, error: null, duration: null },
  });

  const [promptViewerOpen, setPromptViewerOpen] = useState(false);
  const [prompts, setPrompts] = useState({
    openai: null,
    anthropic: null,
    gemini: null,
    groq: null,
  });
  const [agents, setAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [inputs, setInputs] = useState({});
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    anthropic: "",
    gemini: "",
    groq: "",
  });
  const [showKeys, setShowKeys] = useState({
    openai: false,
    anthropic: false,
    gemini: false,
    groq: false,
  });
  const [step, setStep] = useState(1); // 1 = pick agent, 2 = fill inputs + keys

  useEffect(() => {
    loadAllAgents()
      .then(setAgents)
      .finally(() => setAgentsLoading(false));
  }, []);

  const filteredAgents = agents.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      a.category?.toLowerCase().includes(q)
    );
  });

  const handleInputChange = (id, val) => {
    setInputs((prev) => ({ ...prev, [id]: val }));
  };

  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
    // Pre-fill defaults
    const defaults = {};
    agent.inputs?.forEach((inp) => {
      if (inp.defaultValue !== undefined) {
        defaults[inp.id] = inp.defaultValue;
      }
    });
    setInputs(defaults);
    setStep(2);
  };

  const canSubmit =
    selectedAgent &&
    apiKeys.openai.trim() &&
    apiKeys.anthropic.trim() &&
    apiKeys.gemini.trim() &&
    selectedAgent.inputs?.every((inp) => {
      const val = inputs[inp.id];
      if (!inp.required) {
        // For optional fields, if there's a value, it must be valid
        if (!val || (Array.isArray(val) && val.length === 0)) return true;
        return validateInput(inp, val).valid;
      }
      // For required fields, must have value and pass validation
      if (Array.isArray(val)) return val.length > 0 && validateInput(inp, val).valid;
      const hasValue = val && String(val).trim().length > 0;
      return hasValue && validateInput(inp, val).valid;
    });

  const handleStartBattle = () => {
    if (!canSubmit) return;
    navigate("/battle/arena", {
      state: { agent: selectedAgent, inputs, apiKeys },
    });
  };

  return (
    <div className="min-h-screen dark:bg-surface bg-gray-50 text-white battle-page-transition">

      <main className="pt-20 px-4 pb-12 max-w-4xl mx-auto">
        {/* Back */}
        <button
          onClick={() =>
            step === 2 ? setStep(1) : navigate("/battle")
          }
          className="flex items-center gap-1.5 text-xs font-medium dark:text-text-secondary dark:text-text-muted dark:text-text-muted text-gray-500
            hover:text-white transition-all duration-200 hover:gap-2 mb-8"
        >
          <ArrowLeft size={14} />
          {step === 2 ? "Back to Agent Selection" : "Back to Battle Mode"}
        </button>

        {/* Header */}
        <div className="text-center mb-10 battle-fade-in">
          <h1 className="text-3xl font-extrabold tracking-wider mb-1 text-white">
            {step === 1 ? "Pick Your Agent" : "Configure Battle"}
          </h1>
          <p className="text-sm dark:text-text-muted dark:text-text-muted text-gray-500">
            {step === 1
              ? "Choose an agent to battle across GPT-4o, Claude Sonnet, and Gemini Flash"
              : `Setting up ${selectedAgent?.name}`}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-200
                  ${step >= s
                    ? "bg-yellow-400/20 border-yellow-400/60 text-yellow-300"
                    : "bg-gray-800 border-gray-700 dark:text-text-muted dark:text-text-muted text-gray-500"
                  }`}
              >
                {s}
              </div>
              {s < 2 && (
                <div
                  className={`h-px w-12 transition-all duration-300 ${
                    step > s ? "bg-yellow-400/40" : "bg-gray-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Agent Selection ── */}
        {step === 1 && (
          <div className="battle-fade-in">
            {/* Search */}
            <div className="relative mb-6">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-text-muted dark:text-text-muted text-gray-500"
              />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full dark:bg-surface-input bg-gray-50 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5
                  text-sm dark:text-text-primary text-gray-900 placeholder-gray-500 outline-none focus:border-gray-500
                  transition-colors duration-200"
              />
            </div>

            {agentsLoading ? (
              <div className="text-center py-16 dark:text-text-muted dark:text-text-muted text-gray-500 text-sm">
                Loading agents...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                {filteredAgents.map((agent) => (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => handleSelectAgent(agent)}
                    className="text-left p-4 rounded-xl border dark:border-border border-gray-200 bg-gray-900/40
                      hover:border-yellow-400/40 hover:bg-gray-900/70
                      transition-all duration-200 active:scale-[0.98] group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-sm font-semibold dark:text-text-primary text-gray-900 group-hover:text-white transition-colors">
                        {agent.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 dark:text-text-muted dark:text-text-muted text-gray-500 border border-gray-700 shrink-0">
                        {agent.category}
                      </span>
                    </div>
                    <p className="text-xs dark:text-text-muted dark:text-text-muted text-gray-500 line-clamp-2 leading-relaxed">
                      {agent.description}
                    </p>
                  </button>
                ))}
                {filteredAgents.length === 0 && (
                  <div className="col-span-2 text-center py-12 dark:text-text-muted dark:text-text-muted text-gray-500 text-sm">
                    No agents found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Inputs + API Keys ── */}
        {step === 2 && selectedAgent && (
          <div className="space-y-8 battle-fade-in">
            {/* Agent Inputs */}
            <div className="rounded-xl border dark:border-border border-gray-200 bg-gray-900/40 p-6">
              <h2 className="text-sm font-bold dark:text-text-primary text-gray-900 mb-5 uppercase tracking-wider">
                Agent Inputs
              </h2>
              <div className="space-y-5">
                {selectedAgent.inputs?.map((input) => (
                  <div key={input.id}>
                    <label className="block text-xs font-semibold dark:text-text-primary text-gray-900 mb-1.5 uppercase tracking-wide">
                      {input.label}
                      {input.required && (
                        <span className="text-yellow-400 ml-1">*</span>
                      )}
                    </label>
                    <InputField
                      input={input}
                      value={inputs[input.id]}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        System Prompt
                      </span>
                      <pre className="whitespace-pre-wrap mt-2 text-xs text-gray-300 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                        {prompts.gemini?.systemPrompt ||
                          "Prompt not available yet."}
                      </pre>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        User Prompt
                      </span>
                      <pre className="whitespace-pre-wrap mt-2 text-xs text-gray-300 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                        {prompts.gemini?.userMessage ||
                          "Prompt not available yet."}
                      </pre>
                    </div>
                  </div>
                </div>
                
                {/* Groq Column */}
                <div className="rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm flex flex-col overflow-hidden">
                  <div className="bg-gray-900/50 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-red-400">
                      Groq
                    </span>
                    <button
                      onClick={() => handleCopyPrompt("groq", prompts.groq)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-gray-800/50 transition-all duration-200"
                    >
                      {copiedProvider === "groq" ? (
                        <>
                          <Check size={14} className="text-green-400" />
                          <span className="text-xs text-green-400">Copied</span>
                        </>
                      ) : (
                        <Copy
                          size={14}
                          className="text-gray-400 hover:text-gray-300"
                        />
                      )}
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        System Prompt
                      </span>
                      <pre className="whitespace-pre-wrap mt-2 text-xs text-gray-300 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                        {prompts.groq?.systemPrompt ||
                          "Prompt not available yet."}
                      </pre>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        User Prompt
                      </span>
                      <pre className="whitespace-pre-wrap mt-2 text-xs text-gray-300 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                        {prompts.groq?.userMessage ||
                          "Prompt not available yet."}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* API Keys */}
            <div className="rounded-xl border dark:border-border border-gray-200 bg-gray-900/40 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Key size={14} className="dark:text-text-secondary dark:text-text-muted dark:text-text-muted text-gray-500" />
                <h2 className="text-sm font-bold dark:text-text-primary dark:text-text-primary text-gray-900 uppercase tracking-wider">
                  API Keys
                </h2>
              </div>
              <p className="text-xs dark:text-text-muted dark:text-text-muted text-gray-500 mb-5 leading-relaxed">
                Your keys are used directly in the browser and never sent to our
                servers.
              </p>
              <div className="space-y-4">
                {API_KEY_FIELDS.map((field) => (
                  <div key={field.id}>
                    <label
                      className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${field.color}`}
                    >
                      {field.label}
                      <span className="text-yellow-400 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showKeys[field.id] ? "text" : "password"}
                        value={apiKeys[field.id]}
                        onChange={(e) =>
                          setApiKeys((prev) => ({
                            ...prev,
                            [field.id]: e.target.value,
                          }))
                        }
                        placeholder={field.placeholder}
                        className={`w-full ${field.bg} border ${field.border} rounded-lg px-3 py-2 pr-10
                          text-sm dark:text-text-primary text-gray-900 placeholder-gray-600 outline-none
                          ${field.focusBorder} focus:border transition-colors duration-200`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowKeys((prev) => ({
                            ...prev,
                            [field.id]: !prev[field.id],
                          }))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-text-muted dark:text-text-muted text-gray-500 hover:text-gray-300 transition-colors"
                        aria-label={
                          showKeys[field.id] ? "Hide key" : "Show key"
                        }
                      >
                        {showKeys[field.id] ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleStartBattle}
              disabled={!canSubmit}
              className={`w-full flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl
                text-sm font-bold transition-all duration-200 active:scale-95 border
                ${canSubmit
                  ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-950 hover:from-yellow-400 hover:to-amber-400 hover:shadow-xl hover:shadow-yellow-500/40 border-yellow-400/20 shadow-lg shadow-yellow-500/20"
                  : "bg-gray-800 dark:text-text-muted dark:text-text-muted text-gray-500 border-gray-700 cursor-not-allowed"
                }`}
            >
              <Swords size={18} />
              {canSubmit ? "Start Battle" : "Fill all required fields"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}