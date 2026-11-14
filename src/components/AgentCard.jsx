
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";

import {
  ArrowRight,
  FolderPlus,
  Star,
  Copy,
  Check,
  Bot,
} from "lucide-react";

import { useFavorites } from "../lib/useFavorites";
import CollectionPicker from "./CollectionPicker";

// ---------------------------------------------
// Provider Configuration
// ---------------------------------------------

const providerColors = {
  openai: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  anthropic: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/20",
  },
  gemini: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  openrouter: {
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    border: "border-sky-500/20",
  },
  any: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
  },
};

const providerLabels = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  gemini: "Gemini",
  openrouter: "OpenRouter",
  any: "Any Provider",
};

// ---------------------------------------------
// Utility Functions
// ---------------------------------------------

function isWithinLast7Days(dateStr) {
  if (!dateStr) return false;

  const created = new Date(dateStr);

  if (Number.isNaN(created.getTime())) return false;

  const diff = Date.now() - created.getTime();

  return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
}

function getProvider(agent) {
  const provider = agent?.provider?.toLowerCase() || "any";

  return {
    styles: providerColors[provider] || providerColors.any,
    label: providerLabels[provider] || agent?.provider || "Any Provider",
  };
}

// ---------------------------------------------
// Clipboard Utility
// ---------------------------------------------

async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Try fallback below.
    }
  }

  const textarea = document.createElement("textarea");

  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.setAttribute("readonly", "");

  document.body.appendChild(textarea);

  try {
    textarea.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

// ---------------------------------------------
// Reusable Action Button
// ---------------------------------------------

function ActionButton({
  label,
  onClick,
  children,
  active = false,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`
        flex items-center justify-center
        p-2 rounded-lg
        text-gray-500 dark:text-text-muted
        hover:text-accent hover:bg-accent/10
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-accent
        transition-all duration-200
        ${className}
      `}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------
// Agent Card Component
// ---------------------------------------------

function AgentCard({ agent }) {
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const copyTimer = useRef(null);

  const { isFavorite, toggleFavorite } = useFavorites();

  const agentId = agent?.id;

  const favorited = agentId ? isFavorite(agentId) : false;

  // Dynamic icon lookup
  const IconComponent = Icons[agent?.icon] || Bot;

  // Provider information
  const { styles: prov, label: provLabel } = getProvider(agent);

  // New agent indicator
  const isNew = isWithinLast7Days(agent?.createdAt);

  // -------------------------------------------
  // Cleanup timers on unmount
  // -------------------------------------------

  useEffect(() => {
    return () => {
      if (copyTimer.current) {
        clearTimeout(copyTimer.current);
      }
    };
  }, []);

  // -------------------------------------------
  // Drag and Drop
  // -------------------------------------------

  const handleDragStart = useCallback(
    (event) => {
      if (!agentId) {
        event.preventDefault();
        return;
      }

      event.dataTransfer.setData("text/plain", agentId);
      event.dataTransfer.effectAllowed = "move";
    },
    [agentId]
  );

  // -------------------------------------------
  // Favorite Handler
  // -------------------------------------------

  const handleFavorite = useCallback(() => {
    if (!agentId) return;
    toggleFavorite(agentId);
  }, [agentId, toggleFavorite]);

  // -------------------------------------------
  // Collection Handler
  // -------------------------------------------

  const handleCollectionPicker = useCallback(() => {
    if (!agentId) return;
    setShowCollectionPicker(true);
  }, [agentId]);

  const closeCollectionPicker = useCallback(() => {
    setShowCollectionPicker(false);
  }, []);

  // -------------------------------------------
  // Copy Prompt Handler
  // -------------------------------------------

  const handleCopyPrompt = useCallback(async () => {
    const text = agent?.systemPrompt || agent?.description || "";

    if (!text) return;

    setCopyError(false);

    const success = await copyToClipboard(text);

    if (success) {
      setCopied(true);

      if (copyTimer.current) {
        clearTimeout(copyTimer.current);
      }

      copyTimer.current = setTimeout(() => {
        setCopied(false);
      }, 1800);
    } else {
      setCopyError(true);
    }
  }, [agent?.systemPrompt, agent?.description]);

  // -------------------------------------------
  // Render
  // -------------------------------------------

  return (
    <>
      <article
        draggable={Boolean(agentId)}
        onDragStart={handleDragStart}
        className="
          premium-hover-card
          group relative
          flex flex-col
          rounded-xl border p-4
          bg-white border-gray-200
          dark:bg-surface-card dark:border-border

          cursor-grab active:cursor-grabbing

          transition-all duration-300 ease-out

          hover:-translate-y-1
          hover:shadow-xl
          hover:border-purple-400
          dark:hover:border-accent

          motion-safe:hover:[transform:perspective(1000px)_rotateX(3deg)_rotateY(-3deg)_translateY(-5px)]

          focus-within:ring-2
          focus-within:ring-accent

          motion-reduce:transition-none
          motion-reduce:hover:transform-none
        "
      >
        {/* Top Section */}
        <div className="flex items-start justify-between gap-3 mb-4">

          {/* Agent Icon */}
          <div
            className="
              w-11 h-11 shrink-0
              rounded-xl
              bg-accent/10
              flex items-center justify-center

              group-hover:bg-accent/20
              group-hover:scale-110
              group-hover:rotate-3

              transition-all duration-300
            "
          >
            <IconComponent
              size={22}
              className="text-accent"
              aria-hidden="true"
            />
          </div>

          {/* Badges */}
          <div className="flex items-center flex-wrap justify-end gap-1.5">

            {isNew && (
              <span
                className="
                  text-[10px] font-semibold
                  px-2 py-1 rounded-full
                  bg-green-500/10
                  text-green-500
                  border border-green-500/20
                "
              >
                New
              </span>
            )}

            <span
              className="
                text-[10px] font-medium
                px-2 py-1 rounded-full
                bg-gray-100 text-gray-500
                border border-gray-200
                dark:bg-surface-input
                dark:text-text-muted
                dark:border-border
              "
            >
              {agent?.category || "General"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="
            absolute top-14 right-3
            flex items-center gap-1
            opacity-0
            group-hover:opacity-100
            group-focus-within:opacity-100
            transition-opacity duration-200
          "
        >
          <ActionButton
            label={
              copied
                ? "Prompt copied"
                : "Copy system prompt"
            }
            onClick={handleCopyPrompt}
            className={copied ? "text-green-500" : ""}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </ActionButton>

          <ActionButton
            label="Add to collection"
            onClick={handleCollectionPicker}
          >
            <FolderPlus size={15} />
          </ActionButton>

          <ActionButton
            label={
              favorited
                ? "Remove from favorites"
                : "Add to favorites"
            }
            onClick={handleFavorite}
            active={favorited}
            className={
              favorited
                ? "!text-yellow-400"
                : "hover:!text-yellow-400"
            }
          >
            <Star
              size={15}
              className={favorited ? "fill-yellow-400" : ""}
            />
          </ActionButton>
        </div>

        {/* Accessible Copy Feedback */}
        <span className="sr-only" role="status" aria-live="polite">
          {copied
            ? "Prompt copied successfully"
            : copyError
              ? "Unable to copy prompt"
              : ""}
        </span>

        {/* Main Agent Content */}
        <Link
          to={agentId ? `/agent/${agentId}` : "#"}
          aria-label={`Open ${agent?.name || "Unnamed Agent"}`}
          aria-disabled={!agentId}
          onClick={(event) => {
            if (!agentId) event.preventDefault();
          }}
          className="
            block flex-1 min-w-0
            rounded-md
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-accent
          "
        >
          <h3
            className="
              text-sm font-semibold
              text-gray-900 dark:text-text-primary
              mb-1
              group-hover:text-accent
              transition-colors
            "
          >
            {agent?.name || "Unnamed Agent"}
          </h3>

          <p
            className="
              text-xs
              text-gray-500 dark:text-text-secondary
              leading-relaxed
              mb-4
              line-clamp-2
              min-h-8
            "
          >
            {agent?.description || "No description provided."}
          </p>

          {/* Bottom Section */}
          <div className="flex items-center justify-between gap-2 mt-auto">

            {/* Provider Badge */}
            <span
              className={`
                text-[10px] font-medium
                px-2 py-1 rounded-full border
                ${prov.bg}
                ${prov.text}
                ${prov.border}
              `}
            >
              {provLabel}
            </span>

            {/* Run Action */}
            <span
              className="
                flex items-center gap-1
                text-xs font-semibold
                text-accent

                opacity-0
                group-hover:opacity-100
                group-focus-within:opacity-100

                transition-all duration-300
                group-hover:translate-x-0
                translate-x-2
              "
            >
              Run
              <ArrowRight
                size={13}
                className="
                  transition-transform duration-300
                  group-hover:translate-x-1
                "
              />
            </span>
          </div>
        </Link>
      </article>

      {/* Collection Picker */}
      {showCollectionPicker && agentId && (
        <CollectionPicker
          agentId={agentId}
          onClose={closeCollectionPicker}
        />
      )}
    </>
  );
}

export default memo(AgentCard);
