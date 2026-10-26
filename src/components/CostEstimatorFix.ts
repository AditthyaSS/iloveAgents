/**
 * CostEstimator display correction for token and pricing calculations
 */
export const formatTokenCost = (tokens: number, ratePerThousand: number): string => {
  if (tokens <= 0 || ratePerThousand < 0) return "$0.00";
  const cost = (tokens / 1000) * ratePerThousand;
  return `$${cost.toFixed(4)}`;
};
