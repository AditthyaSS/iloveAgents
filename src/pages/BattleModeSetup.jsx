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
  AlertCircle,
} from "lucide-react";
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
      .catch(err => console.error(err))