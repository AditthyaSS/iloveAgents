import { useState, useEffect, useCallback } from 'react'

const listenersByKey = new Map()

function readKey(key, initial, validate) {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return initial
    const parsed = JSON.parse(raw)
    return validate(parsed) ? parsed : initial
  } catch {
    return initial
  }
}

function broadcast(key) {
  listenersByKey.get(key)?.forEach((fn) => {
    try {
      fn()
    } catch {}
  })
}

export function useSyncedLocalStorage(key, options = {}) {
  const { initial = [], validate = Array.isArray, cap = null } = options
  const [value, setValue] = useState(() => readKey(key, initial, validate))

  useEffect(() => {
    const sync = () => setValue(readKey(key, initial, validate))
    if (!listenersByKey.has(key)) listenersByKey.set(key, new Set())
    listenersByKey.get(key).add(sync)
    const onStorage = (e) => {
      if (!e.key || e.key === key) sync()
    }
    window.addEventListener('storage', onStorage)
    return () => {
      listenersByKey.get(key)?.delete(sync)
      window.removeEventListener('storage', onStorage)
    }
  }, [key])

  const set = useCallback(
    (next) => {
      const resolved = typeof next === 'function' ? next(readKey(key, initial, validate)) : next
      const capped = cap != null && Array.isArray(resolved) ? resolved.slice(0, cap) : resolved
      try {
        localStorage.setItem(key, JSON.stringify(capped))
      } catch {}
      setValue(capped)
      broadcast(key)
    },
    [key, cap]
  )

  return [value, set]
}
