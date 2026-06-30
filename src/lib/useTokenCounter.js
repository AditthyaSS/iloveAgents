import { useState, useEffect, useRef } from 'react'

function estimateTokens(text) {
  if (!text) return 0
  const cleaned = text.trim()
  if (!cleaned) return 0

  let tokens = 0
  let i = 0
  const len = cleaned.length

  while (i < len) {
    const char = cleaned[i]
    const code = cleaned.codePointAt(i)

    if (code === undefined) { i++; continue }

    if (code <= 0x7f) {
      if (/[a-zA-Z0-9]/.test(char)) {
        let wordLen = 0
        while (i < len && /[a-zA-Z0-9]/.test(cleaned[i])) {
          wordLen++
          i++
        }
        tokens += Math.ceil(wordLen / 4)
      } else if (/\s/.test(char)) {
        tokens += 1
        i++
      } else {
        tokens += 1
        i++
      }
    } else if (code <= 0x7ff) {
      tokens += 2
      i++
    } else if (code <= 0xffff) {
      tokens += 3
      i++
    } else {
      tokens += 4
      i += 2
    }
  }

  return Math.max(1, Math.round(tokens * 1.1))
}

export function useTokenCounter(text, debounceMs = 300) {
  const [tokens, setTokens] = useState(0)
  const [isEstimating, setIsEstimating] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    setIsEstimating(true)

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      setTokens(estimateTokens(text))
      setIsEstimating(false)
    }, debounceMs)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [text, debounceMs])

  return { tokens, isEstimating }
}

export function tokenEstimate(text) {
  return estimateTokens(text)
}
