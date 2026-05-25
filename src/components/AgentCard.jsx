import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { ArrowRight, Star } from "lucide-react";
import { useFavorites } from "../lib/useFavorites";

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
  any: "Any Provider",
};

function isWithinLast7Days(dateStr) {
  if (!dateStr) return false;
  const created = new Date(dateStr);
  if (Number.isNaN(created.getTime())) return false;
  const now = new Date();
  const diffMs = now - created;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  return diffMs >= 0 && diffMs <= sevenDaysMs;
}

export default function AgentCard({ agent }) {
  const IconComponent = Icons[agent.icon] || Icons.Bot;
  const prov = providerColors[agent.provider] || providerColors.any;
  const provLabel = providerLabels[agent.provider] || agent.provider;
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(agent.id);

  const handleFavorite = (e) => {
    e.preventDefault(); // prevent Link navigation
    e.stopPropagation();
    toggleFavorite(agent.id);
  };

  return (
    <Link
      to={`/agent/${agent.id}`}
      className="group block rounded-lg border p-4 transition-all duration-200
  dark:bg-surface-card dark:border-border dark:hover:border-accent/40
  bg-white border-gray-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-accent/5
  hover:-translate-y-1"    >
      {/* Top row: icon + badges + star */}
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center
          group-hover:bg-accent/20 transition-colors"
        >
          <IconComponent size={20} className="text-accent" />
        </div>
        <div className="flex items-center gap-1.5">
          {isWithinLast7Days(agent.createdAt) && (
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full
              bg-green-500/10 text-green-400 border border-green-500/20"
            >
              New
            </span>
          )}
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full dark:bg-surface-input dark:text-text-muted
            bg-gray-100 text-gray-500 border dark:border-border border-gray-200"
          >
            {agent.category}
          </span>
          <button
            onClick={handleFavorite}
            className={`p-1 rounded-md transition-all duration-200
              ${
                favorited
                  ? "text-yellow-400 hover:text-yellow-300 scale-110"
                  : "dark:text-text-muted text-gray-300 hover:text-yellow-400 opacity-0 group-hover:opacity-100"
              }`}
            aria-label={
              favorited ? "Remove from favorites" : "Add to favorites"
            }
            title={favorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Star
              size={15}
              className={`transition-transform duration-200 ${favorited ? "fill-yellow-400" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Name + description */}
      <h3 className="text-sm font-semibold dark:text-text-primary text-gray-900 mb-1 group-hover:text-accent transition-colors">
        {agent.name}
      </h3>
      <p className="text-xs dark:text-text-secondary text-gray-500 leading-relaxed mb-3 line-clamp-2">
        {agent.description}
      </p>

      {/* Bottom: provider badge + run link */}
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${prov.bg} ${prov.text} ${prov.border}`}
        >
          {provLabel}
        </span>
        <span className="flex items-center gap-1 text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
          Run <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}
