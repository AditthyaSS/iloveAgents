import { Info } from "lucide-react";

export default function ApiKeyInfo({ provider, url }) {
  return (
    <div className="relative group inline-block ml-2">
      {/* Keyboard-accessible trigger: button with tabIndex and aria-label */}
      <button
        type="button"
        tabIndex={0}
        aria-label={`Get your ${provider} API key`}
        className="cursor-pointer text-gray-400 hover:text-white focus:outline-none focus:text-white"
      >
        <Info size={16} />
      </button>
      {/* Panel opens on hover and focus-within so keyboard/touch users can reach the link */}
      <div
        className="absolute z-50 hidden group-hover:block group-focus-within:block bg-black text-white text-xs rounded-md p-3 w-56 top-6 left-0 shadow-lg"
        role="tooltip"
      >
        <p className="mb-2">Get your {provider} API key</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline"
        >
          Open {provider} dashboard
        </a>
      </div>
    </div>
  );
}
