import { useState, useRef, useEffect, useCallback } from "react";
import { streamAgent } from "../lib/llmAdapter";
import { resolveAgentModel } from "../lib/resolveAgentModel";
import { useHistory } from "../lib/useHistory";
import { useSessionSpend } from "../lib/useSessionSpend";
import { recordAnalyticsRun } from "../lib/useAnalytics";

/**
 * Owns a single agent execution: streaming state, run identity for
 * stale-completion guards, abort control, and the run/stop/clear lifecycle.
 * Rendering (inputs, panels, modals) stays in AgentRunner.
 */
export function useAgentExecution({
  agent,
  provider,
  apiKey,
  selectedModel,
  customPrompt,
  inputs,
  buildUserMessage,
}) {
  const [output, setOutput] = useState(null);
  const [streamingOutput, setStreamingOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(null);
  const [versionHistory, setVersionHistory] = useState([]);
  const [lastRunSystemPrompt, setLastRunSystemPrompt] = useState("");
  const [lastRunUserMessage, setLastRunUserMessage] = useState("");

  const abortControllerRef = useRef(null);
  // Identifies the current run. streamAgent() resolves (rather than rejects)
  // when aborted, so a cancelled run's continuation looks identical to a
  // finished one. Every run captures the id it started with and must discard
  // its results if the id has since changed (cleared, superseded, unmounted).
  const runIdRef = useRef(0);

  const { saveRun } = useHistory();
  const { addRun } = useSessionSpend();

  // Abort the in-flight request AND invalidate the run that owns it.
  const cancelActiveRun = useCallback(() => {
    runIdRef.current += 1;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Leaving the page mid-stream must stop the (billed) request and must not
  // write history/analytics for a run the user walked away from.
  useEffect(() => cancelActiveRun, [cancelActiveRun]);

  const handleChunk = useCallback((chunk) => {
    setStreamingOutput((prev) => prev + chunk);
    setIsStreaming(true);
  }, []);

  const clearExecution = useCallback(() => {
    setOutput(null);
    setStreamingOutput("");
    setIsStreaming(false);
    setError(null);
    setDuration(null);
  }, []);

  const handleRun = useCallback(async () => {
    setLoading(true);
    setError(null);
    setOutput(null);
    setStreamingOutput("");
    setIsStreaming(false);
    setDuration(null);
    setVersionHistory((prevHistory) => [
      {
        versionNumber: prevHistory.length + 1,
        timestamp: new Date().toLocaleTimeString(),
        configSnapshot: { ...inputs },
      },
      ...prevHistory,
    ]);

    setLastRunSystemPrompt(customPrompt);
    setLastRunUserMessage(buildUserMessage());

    // Supersede any run still winding down (e.g. one that was just stopped)
    // and give this run an identity so stale completions can be recognised.
    cancelActiveRun();
    const runId = runIdRef.current;
    const isCurrentRun = () => runIdRef.current === runId;

    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      const actualProvider =
        agent.provider === "any" ? provider : agent.provider;
      const model = resolveAgentModel(agent, actualProvider, selectedModel);

      const result = await streamAgent({
        provider: actualProvider,
        model,
        apiKey,
        systemPrompt: customPrompt,
        userMessage: buildUserMessage(),
        onChunk: (chunk) => {
          if (isCurrentRun()) handleChunk(chunk);
        },
        signal: controller.signal,
      });

      // Cleared / superseded / unmounted while streaming: discard everything.
      // (Stop is different: it doesn't invalidate the run, so its partial
      // output is committed below exactly as before.)
      if (!isCurrentRun()) return;

      setOutput(result.content);
      setStreamingOutput("");
      setIsStreaming(false);
      setDuration(result.duration);

      const inputTokenEstimate = Math.max(
        1,
        Math.round((customPrompt.length + buildUserMessage().length) / 4),
      );
      const outputTokenEstimate = Math.max(1, Math.round(result.content.length / 4));

      addRun({
        model,
        inputTokens: inputTokenEstimate,
        outputTokens: outputTokenEstimate,
        inputCost: null,
        outputCost: null,
      });

      saveRun({
        agentId: agent.id,
        agentName: agent.name,
        inputs: { ...inputs },
        output: result.content,
        provider: actualProvider,
      });

      recordAnalyticsRun({
        agentId: agent.id,
        agentName: agent.name,
        category: agent.category,
        provider: actualProvider,
        model,
        duration: result.duration,
      });
    } catch (err) {
      if (!isCurrentRun()) return;
      if (err.name !== "AbortError") {
        if (err && err.type === "invalid_api_key") {
          setError(err);
        } else {
          setError({ type: "generic", message: err.message });
        }
      }
    } finally {
      // Only the owning run may touch shared state; a stale run's late
      // cleanup must not null the controller / loading flag of a newer run.
      if (isCurrentRun()) {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }
  }, [
    agent,
    provider,
    apiKey,
    selectedModel,
    customPrompt,
    inputs,
    buildUserMessage,
    cancelActiveRun,
    handleChunk,
    addRun,
    saveRun,
  ]);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setOutput(streamingOutput);
    setStreamingOutput("");
    setIsStreaming(false);
    setLoading(false);
  }, [streamingOutput]);

  const handleClearExecution = useCallback(() => {
    // Cancel *and invalidate* the in-flight run so its late completion cannot
    // resurrect the output we are about to discard.
    cancelActiveRun();
    setLoading(false);
    clearExecution();
  }, [cancelActiveRun, clearExecution]);

  return {
    output,
    streamingOutput,
    isStreaming,
    error,
    loading,
    duration,
    versionHistory,
    lastRunSystemPrompt,
    lastRunUserMessage,
    setError,
    handleRun,
    handleStop,
    handleClearExecution,
    cancelActiveRun,
    clearExecution,
  };
}
