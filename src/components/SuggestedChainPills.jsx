import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GitBranch } from 'lucide-react'
import * as Icons from 'lucide-react'
import { loadAllAgents } from '../agents/registry'

/**
 * Renders "Works well after" clickable pills for agents that define
 * a `suggestedChainFrom` array in their definition.
 *
 * Clicking a pill navigates to /workflows/build with the pair
 * pre-selected via React Router state.
 */
export default function SuggestedChainPills({ agent }) {
  const navigate = useNavigate()
  const [agents, setAgents] = useState([])

  useEffect(() => {
    loadAllAgents().then(setAgents)
    .catch(err => console.error(err))