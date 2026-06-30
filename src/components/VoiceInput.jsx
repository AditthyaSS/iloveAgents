import { useState, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";

/**
 * VoiceInput — a mic button that uses the browser-native SpeechRecognition API
 * to transcribe speech into a text/textarea field.
 *
 * Renders nothing on browsers without SpeechRecognition support (e.g. Firefox).
 * Speech is appended to whatever was already in the field, so keyboard input
 * and dictation can be mixed freely.
 *
 * Props:
 *   value     — current value of the input field (string)
 *   onChange  — called with the new value (string) when speech is transcribed
 *   disabled  — optional, disables the mic button
 *   className — optional extra classes for positioning
 */
export default function VoiceInput({
  value,
  onChange,
  disabled = false,
  className = "",
  lang = "en-US",
}) {
  // Feature-detect once. If unsupported, the component renders null below.
  const SpeechRecognition =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  // Snapshot of `value` at the moment recording started. Each onresult event
  // appends the latest transcript to this baseline. We update it in two cases:
  //   1. When the speech engine finalizes a chunk (push it onto the baseline).
  //   2. When the user types while recording (reconcile via lastWrittenRef
  //      below) so their typing doesn't get clobbered by the next onresult.
  const baseValueRef = useRef("");
  // The exact string we last pushed via onChange. If the incoming `value`
  // prop diverges from this while recording, the user typed — and we need
  // to fold their edit into the baseline.
  const lastWrittenRef = useRef("");
  // Latest onChange — keeps the recognition handlers from going stale.
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Reconcile user typing during recording. If `value` no longer matches
  // what we last wrote, the user edited the field by hand — make their
  // version the new baseline so the next transcript appends to it.
  useEffect(() => {
    if (isRecording && value !== lastWrittenRef.current) {
      baseValueRef.current = value || "";
      lastWrittenRef.current = value || "";
    }
  }, [value, isRecording]);

  // Cleanup: if the component unmounts mid-recording, stop the mic.
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore — already stopped
        }
      }
    };
  }, []);

  if (!SpeechRecognition) {
    return null;
  }

  const startRecording = () => {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    baseValueRef.current = value || "";
    lastWrittenRef.current = value || "";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Persist finalized transcript into the baseline so the next event
      // doesn't overwrite it with only interim results.
      if (finalTranscript) {
        const sep =
          baseValueRef.current && !baseValueRef.current.endsWith(" ")
            ? " "
            : "";
        baseValueRef.current =
          baseValueRef.current + sep + finalTranscript.trim();
      }

      // Trim interim too — Chrome's SpeechRecognition often returns
      // transcripts with leading spaces ("word boundary" markers). Without
      // trimming, you get a leading space on the very first utterance and
      // double spaces between utterances.
      const interim = interimTranscript.trim();
      const sep =
        baseValueRef.current && interim && !baseValueRef.current.endsWith(" ")
          ? " "
          : "";
      const next = baseValueRef.current + sep + interim;
      lastWrittenRef.current = next;
      onChangeRef.current(next);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } catch {
      // start() throws if called while already running — safe to ignore.
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsRecording(false);
  };

  const handleClick = (e) => {
    // Prevent button from submitting forms or stealing focus from the input.
    e.preventDefault();
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={isRecording ? "Stop recording" : "Start voice input"}
      aria-label={isRecording ? "Stop voice input" : "Start voice input"}
      className={`absolute z-10 flex items-center justify-center w-7 h-7 rounded-md transition-colors
        ${
          isRecording
            ? "text-red-500 bg-red-500/10 hover:bg-red-500/20"
            : "text-gray-400 hover:text-accent hover:bg-accent/10 dark:text-text-muted"
        }
        disabled:opacity-40 disabled:cursor-not-allowed
        ${className}`}
    >
      {isRecording && (
        <span className="absolute inline-flex h-full w-full rounded-md bg-red-500/30 animate-ping" />
      )}
      {isRecording ? (
  <MicOff size={14} className="relative" />
   ) : (
  <Mic size={14} className="relative" />
      )}
    </button>
  );
}
