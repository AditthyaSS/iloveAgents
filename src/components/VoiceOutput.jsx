import { useState, useEffect, useRef } from "react";
import { Volume2, Square, Loader2 } from "lucide-react";

export default function VoiceOutput({ text }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      setVoices(synth.getVoices());
    };
    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    return () => {
      if (synth) {
        synth.cancel();
      }
    };
  }, []);

  const handlePlay = () => {
    if (!text) return;
    
    if (isPaused) {
      synthRef.current.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }

    // Clean up markdown syntax for better reading
    const cleanText = text
      .replace(/[#*_]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links but keep text
      .replace(/```[\s\S]*?```/g, "Code block omitted for audio.");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Pick a good default voice if possible
    const preferredVoices = voices.filter(v => v.lang.includes("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Premium")));
    if (preferredVoices.length > 0) {
      utterance.voice = preferredVoices[0];
    } else if (voices.length > 0) {
      utterance.voice = voices[0];
    }

    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!("speechSynthesis" in window)) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mt-4 bg-gray-900/40 border border-gray-700/50 rounded-xl p-3 w-max">
      {!isPlaying ? (
        <button
          onClick={handlePlay}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-accent hover:bg-accent/10 transition-colors"
          title="Read Aloud"
        >
          <Volume2 size={16} />
          <span>Read Aloud</span>
        </button>
      ) : (
        <div className="flex items-center gap-3 px-2">
          <button
            onClick={handleStop}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors"
            title="Stop"
          >
            <Square size={16} fill="currentColor" />
            <span>Stop</span>
          </button>
          
          {/* Animated visualizer */}
          <div className="flex items-end gap-[3px] h-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-accent rounded-full animate-sound-wave"
                style={{
                  height: "100%",
                  animationDelay: (i * 0.15) + "s",
                  animationDuration: (0.8 + (i % 3) * 0.2) + "s"
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
