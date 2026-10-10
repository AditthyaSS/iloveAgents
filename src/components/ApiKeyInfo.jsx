import { useState } from "react";
import { Info } from "lucide-react";

export default function ApiKeyInfo({ provider, url }) {
  const [open, setOpen] = useState(false);
  const panelId = `apikey-info-${provider}`;
  return (
    <div className="relative group inline-block ml-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Where to get a ${provider} API key`}
        className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Info size={16} aria-hidden="true" className="cursor-pointer text-gray-400 hover:text-white" />
      </button>
      <div
        id={panelId}
        className={`absolute z-50 bg-black text-white text-xs rounded-md p-3 w-56 top-6 left-0 shadow-lg ${open ? "block" : "hidden group-hover:block"}`}
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
