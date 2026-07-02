import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Swords,
  ArrowLeft,
  Key,
  Eye,
  EyeOff,
  ChevronDown,
  Search,
} from "lucide-react";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { loadAllAgents } from "../agents/registry";

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
];

function InputField({ input, value, onChange }) {
  const baseClass =
    "w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-gray-500 transition-colors duration-200 resize-none";

  if (input.type === "select") {
    return (
      <div className="relative">
        <select
          value={value ?? input.defaultValue ?? ""}
          onChange={(e) => onChange(input.id, e.target.value)}
          className={`${baseClass} appearance-none cursor-pointer`}
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
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
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
                  : "bg-gray-800/60 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300"
                }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  if (input.type === "code" || input.type === "textarea") {
    return (
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(input.id, e.target.value)}
        placeholder={input.placeholder}
        rows={input.type === "code" ? 8 : 4}
        className={`${baseClass} font-mono text-xs leading-relaxed`}
      />
    );
  }

  // Default: text input
  return (
    <input
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange(input.id, e.target.value)}
      placeholder={input.placeholder}
      className={baseClass}
    />
  );
}

export default function BattleModeSetup() {
  const navigate = useNavigate();
  useDocumentTitle("Battle Setup");

  const [agents, setAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [inputs, setInputs] = useState({});
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    anthropic: "",
    gemini: "",
  });
  const [showKeys, setShowKeys] = useState({
    openai: false,
    anthropic: false,
    gemini: false,
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
      if (!inp.required) return true;
      const val = inputs[inp.id];
      if (Array.isArray(val)) return val.length > 0;
      return val && String(val).trim().length > 0;
    });

  const handleStartBattle = () => {
    if (!canSubmit) return;
    navigate("/battle/arena", {
      state: { agent: selectedAgent, inputs, apiKeys },
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white battle-page-transition">

      <main className="pt-20 px-4 pb-12 max-w-4xl mx-auto">
        {/* Back */}
        <button
          onClick={() =>
            step === 2 ? setStep(1) : navigate("/battle")
          }
          className="flex items-center gap-1.5 text-xs font-medium text-gray-400
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
          <p className="text-sm text-gray-400">
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
                    : "bg-gray-800 border-gray-700 text-gray-500"
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900/60 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5
                  text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-gray-500
                  transition-colors duration-200"
              />
            </div>

            {agentsLoading ? (
              <div className="text-center py-16 text-gray-500 text-sm">
                Loading agents...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                {filteredAgents.map((agent) => (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => handleSelectAgent(agent)}
                    className="text-left p-4 rounded-xl border border-gray-800 bg-gray-900/40
                      hover:border-yellow-400/40 hover:bg-gray-900/70
                      transition-all duration-200 active:scale-[0.98] group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-sm font-semibold text-gray-100 group-hover:text-white transition-colors">
                        {agent.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700 shrink-0">
                        {agent.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {agent.description}
                    </p>
                  </button>
                ))}
                {filteredAgents.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-gray-500 text-sm">
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
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
              <h2 className="text-sm font-bold text-gray-200 mb-5 uppercase tracking-wider">
                Agent Inputs
              </h2>
              <div className="space-y-5">
                {selectedAgent.inputs?.map((input) => (
                  <div key={input.id}>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
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
                ))}
              </div>
            </div>

            {/* API Keys */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Key size={14} className="text-gray-400" />
                <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider">
                  API Keys
                </h2>
              </div>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">
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
                          text-sm text-gray-100 placeholder-gray-600 outline-none
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
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
                  : "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed"
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