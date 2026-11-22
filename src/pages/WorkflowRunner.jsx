import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Zap,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  ArrowRight,
  GitBranch,
} from 'lucide-react'
import * as Icons from 'lucide-react'
import { useAgents } from '../lib/useAgents'
import OutputRenderer from '../components/OutputRenderer'
import ApiKeyBar from '../components/ApiKeyBar'
import RunRating from '../components/RunRating'
import { useApiKey } from '../lib/useApiKey'
import { getGlobalKeys } from '../lib/globalKeys'
import { recordAnalyticsRun } from '../lib/useAnalytics'
import { runAgent } from '../lib/llmAdapter'
import { resolveAgentModel, MODEL_MAP } from '../lib/resolveAgentModel'

function getEffectiveApiKey(targetProvider, activeProvider, activeApiKey) {
  if (targetProvider === activeProvider && activeApiKey) {
    return activeApiKey
  }
  // Check session storage with JSON unmarshaling & expiration handling
  const raw = sessionStorage.getItem(`ila_apikey_${targetProvider}`)
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        if (!parsed.expiresAt || Date.now() <= parsed.expiresAt) {
          if (parsed.key) return parsed.key
        }
      } else if (typeof parsed === 'string') {
        return parsed
      }
    } catch {
      return raw // legacy plaintext
    }
  }
  // Fall back to global keys
  const globalKeys = getGlobalKeys()
  if (globalKeys[targetProvider]) {
    return globalKeys[targetProvider]
  }
  return ''
}
