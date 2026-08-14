import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

const PRICING = {
  "gpt-4o": { input: 0.005, output: 0.015 },
  "claude-sonnet": { input: 0.003, output: 0.015 },
};

export function estimateCost(model, inputTokens, outputTokens) {
  const p = PRICING[model];
  if (!p) return null; // unknown model — don't silently record as $0
  return (inputTokens / 1000) * p.input + (outputTokens / 1000) * p.output;
}

export async function logAgentRun({
  agentRunId,
  model,
  inputTokens,
  outputTokens,
  status,
  durationMs,
}) {
  const cost = estimateCost(model, inputTokens, outputTokens);
  return supabase.from("agent_runs").insert({
    agent_run_id: agentRunId,
    model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    estimated_cost_usd: cost, // null when pricing is unknown, not 0
    status,
    duration_ms: durationMs,
    timestamp: new Date().toISOString(),
  });
}

export function useAgentRunMetrics(rangeDays = 30) {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRuns = useCallback(async () => {
    setLoading(true);
    try {
      const since = new Date(
        Date.now() - rangeDays * 24 * 60 * 60 * 1000,
      ).toISOString();
      const { data, error } = await supabase
        .from("agent_runs")
        .select("*")
        .gte("timestamp", since)
        .order("timestamp", { ascending: false });
      if (!error && data) {
        setRuns(data);
      }
    } finally {
      setLoading(false);
    }
  }, [rangeDays]);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  const totalRuns = runs.length;
  const successCount = runs.filter((r) => r.status === "success").length;
  const successRate = totalRuns ? (successCount / totalRuns) * 100 : 0;
  const totalTokens = runs.reduce(
    (sum, r) => sum + (r.input_tokens || 0) + (r.output_tokens || 0),
    0,
  );
  const totalCostUSD = runs.reduce(
    (sum, r) => sum + (r.estimated_cost_usd || 0),
    0,
  );
  const avgDurationMs = totalRuns
    ? runs.reduce((sum, r) => sum + (r.duration_ms || 0), 0) / totalRuns
    : 0;

  return {
    runs,
    loading,
    totalRuns,
    successRate,
    totalTokens,
    totalCostUSD,
    avgDurationMs,
    refetch: fetchRuns,
  };
}
