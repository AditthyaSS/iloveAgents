/**
 * Standardized error handling and reporting utility for runtime exceptions.
 */
export function handleRuntimeError(error: unknown, context: string): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`[Error in ${context}]:`, errorMessage);
}
