import { useState, useEffect } from 'react'

const STORAGE_KEY = 'ila_ratings'
const listeners = new Set()

const getStoredRatings = () => {
  if (typeof window === 'undefined') return {}
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch (error) {
    console.error('Error parsing ratings from localStorage:', error)
    return {}
  }
}

export function useAgentRatings() {
  const [ratings, setRatings] = useState(() => getStoredRatings())

  useEffect(() => {
    const handleChange = () => {
      setRatings(getStoredRatings())
    }

    listeners.add(handleChange)
    window.addEventListener('storage', handleChange)

    return () => {
      listeners.delete(handleChange)
      window.removeEventListener('storage', handleChange)
    }
  }, [])

  const rateAgent = (agentId, value) => {
    if (!agentId) return

    const currentRatings = getStoredRatings()
    const agentData = currentRatings[agentId] || { up: 0, down: 0 }

    if (value === 'up') {
      agentData.up += 1
    } else if (value === 'down') {
      agentData.down += 1
    }

    currentRatings[agentId] = agentData
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentRatings))

    listeners.forEach((listener) => listener())
  }

  const getAgentRatingInfo = (agentId) => {
    const agentData = ratings[agentId] || { up: 0, down: 0 }
    const total = agentData.up + agentData.down
    const percentage = total > 0 ? Math.round((agentData.up / total) * 100) : 0
    
    return {
      up: agentData.up,
      down: agentData.down,
      total,
      percentage
    }
  }

  return { rateAgent, getAgentRatingInfo, ratings }
}