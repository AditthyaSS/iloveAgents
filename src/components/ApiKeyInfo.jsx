import { Info } from "lucide-react";

export default function ApiKeyInfo({ provider, url }) {
  return (
    <div className="relative group inline-block ml-2">
      <Info size={16} className="cursor-pointer text-gray-400 hover:text-white" />
      <div className="absolute z-50 hidden group-hover:block bg-black text-white text-xs rounded-md p-3 w-56 top-6 left-0 shadow-lg">
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
