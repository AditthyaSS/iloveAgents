import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  X,
  ArrowRight,
  Zap,
  Save,
  Bot,
  ChevronDown,
  GitBranch,
} from 'lucide-react'
import * as Icons from 'lucide-react'
import { loadAllAgents } from '../agents/registry'
import { saveWorkflow } from '../hooks/useWorkflows'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const MAX_AGENTS = 5

export default function WorkflowBuilder() {
  const navigate = useNavigate()
  const location = useLocation()
  const forkedWorkflow = location.state?.forkedWorkflow
  const workflowTitle = location.state?.workflowTitle
  useDocumentTitle('Build a Workflow')

  const [agents, setAgents] = useState([])
  const [title, setTitle] = useState(workflowTitle || '')
  const [description, setDescription] = useState('')
  const descriptionRef = useRef(null)
  const [selectedAgents, setSelectedAgents] = useState([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [hasResolvedPreselected, setHasResolvedPreselected] = useState(false)

  useEffect(() => {
    loadAllAgents().then(setAgents)
    .catch(err => console.error(err))