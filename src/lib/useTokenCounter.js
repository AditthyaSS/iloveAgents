
import { useState, useEffect } from 'react'

function estimateTokens(text) {
  if (!text || typeof text !== 'string') return 0

  const cleaned = text.trim()
  if (!cleaned) return 0

  // Approximate token estimation
  const words = cleaned.match(/\S+/g) || []

  let tokens = 0

  for (const word of words) {
    // Approximate English token count
    tokens += Math.max(1, Math.ceil(word.length / 4))
  }

  return Math.max(1, Math.round(tokens * 1.1))
}

export function useTokenCounter(text, debounceMs = 300) {
  const [tokens, setTokens] = useState(() => estimateTokens(text))
  const [isEstimating, setIsEstimating] = useState(false)

  useEffect(() => {
    setIsEstimating(true)

    const timer = setTimeout(() => {
      setTokens(estimateTokens(text))
      setIsEstimating(false)
    }, Math.max(0, debounceMs))

    return () => {
      clearTimeout(timer)
    }
  }, [text, debounceMs])

  return { tokens, isEstimating }
}

export function tokenEstimate(text) {
  return estimateTokens(text)
}
