export const MAX_STORED_OUTPUT_CHARS = 20000
export const MAX_STORED_RUNS = 100

export function truncateStoredText(value, maxChars = MAX_STORED_OUTPUT_CHARS) {
  if (typeof value !== 'string') return value
  if (value.length <= maxChars) return value
  return value.slice(0, maxChars) + `…[truncated ${value.length - maxChars} chars]`
}
