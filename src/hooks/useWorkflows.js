
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const WORKFLOWS_TABLE = 'workflows'
const MAX_WORKFLOW_AGENTS = 5

function configurationError() {
  return {
    message:
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.',
  }
}

function authenticationError() {
  return {
    message: 'Authentication required. Please sign in to continue.',
  }
}

function notFoundError() {
  return {
    message: 'Workflow not found.',
  }
}

function permissionError() {
  return {
    message: 'Permission denied. You do not own this workflow.',
  }
}

function validateWorkflow(workflow) {
  if (!workflow || typeof workflow !== 'object') {
    return 'A workflow is required.'
  }

  if (
    typeof workflow.title !== 'string' ||
    !workflow.title.trim()
  ) {
    return 'Workflow title is required.'
  }

  if (
    !Array.isArray(workflow.agents) ||
    workflow.agents.length < 1
  ) {
    return 'Add at least one agent to the workflow.'
  }

  if (workflow.agents.length > MAX_WORKFLOW_AGENTS) {
    return `A workflow can contain no more than ${MAX_WORKFLOW_AGENTS} agents.`
  }

  if (
    workflow.agents.some(
      (agentId) =>
        typeof agentId !== 'string' || !agentId.trim()
    )
  ) {
    return 'Every workflow step must contain a valid agent ID.'
  }

  if (new Set(workflow.agents).size !== workflow.agents.length) {
    return 'An agent can only appear once in a workflow.'
  }

  return null
}

// Get the currently authenticated Supabase user.
async function getCurrentUserId() {
  if (!isSupabaseConfigured) {
    return null
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user.id
  } catch (error) {
    console.error('Authentication verification failed:', error)
    return null
  }
}

// Verify that the current user owns the requested workflow.
async function verifyWorkflowOwnership(workflowId, userId) {
  const { data, error } = await supabase
    .from(WORKFLOWS_TABLE)
    .select('id, user_id')
    .eq('id', workflowId)
    .maybeSingle()

  if (error) {
    return { authorized: false, error }
  }

  if (!data) {
    return {
      authorized: false,
      error: notFoundError(),
    }
  }

  if (data.user_id !== userId) {
    return {
      authorized: false,
      error: permissionError(),
    }
  }

  return {
    authorized: true,
    error: null,
  }
}

/**
 * Fetch public workflows.
 */
export async function fetchWorkflows() {
  if (!isSupabaseConfigured) {
    return { data: [], error: configurationError() }
  }

  const { data, error } = await supabase
    .from(WORKFLOWS_TABLE)
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  return { data: data ?? [], error }
}

/**
 * Fetch one public workflow.
 */
export async function fetchWorkflowById(id) {
  if (!isSupabaseConfigured) {
    return { data: null, error: configurationError() }
  }

  if (!id || typeof id !== 'string') {
    return {
      data: null,
      error: { message: 'A valid workflow ID is required.' },
    }
  }

  const { data, error } = await supabase
    .from(WORKFLOWS_TABLE)
    .select('*')
    .eq('id', id)
    .eq('is_public', true)
    .maybeSingle()

  return { data: data ?? null, error }
}

/**
 * Save a workflow.
 * Authentication is mandatory.
 */
export async function saveWorkflow(workflow) {
  const validationError = validateWorkflow(workflow)

  if (validationError) {
    return {
      data: null,
      error: { message: validationError },
    }
  }

  if (!isSupabaseConfigured) {
    return { data: null, error: configurationError() }
  }

  const userId = await getCurrentUserId()

  if (!userId) {
    return {
      data: null,
      error: authenticationError(),
    }
  }

  const { data, error } = await supabase
    .from(WORKFLOWS_TABLE)
    .insert({
      user_id: userId,
      title: workflow.title.trim(),
      description:
        typeof workflow.description === 'string'
          ? workflow.description.trim()
          : '',
      agents: workflow.agents,
      is_public: true,
      usage_count: 0,
    })
    .select('*')
    .single()

  return {
    data: data ?? null,
    error,
  }
}

/**
 * Update a workflow.
 * Verify ownership before updating and include user_id
 * in the final database query as an additional safeguard.
 */
export async function updateWorkflow(id, updates) {
  if (!isSupabaseConfigured) {
    return { data: null, error: configurationError() }
  }

  if (!id || typeof id !== 'string') {
    return {
      data: null,
      error: { message: 'A valid workflow ID is required.' },
    }
  }

  const userId = await getCurrentUserId()

  if (!userId) {
    return {
      data: null,
      error: authenticationError(),
    }
  }

  const ownership = await verifyWorkflowOwnership(id, userId)

  if (!ownership.authorized) {
    return {
      data: null,
      error: ownership.error,
    }
  }

  const allowedUpdates = {}

  if (typeof updates?.title === 'string') {
    if (!updates.title.trim()) {
      return {
        data: null,
        error: { message: 'Workflow title cannot be empty.' },
      }
    }

    allowedUpdates.title = updates.title.trim()
  }

  if (typeof updates?.description === 'string') {
    allowedUpdates.description = updates.description.trim()
  }

  if (Array.isArray(updates?.agents)) {
    const validationError = validateWorkflow({
      title: updates.title ?? 'Workflow',
      agents: updates.agents,
    })

    if (validationError) {
      return {
        data: null,
        error: { message: validationError },
      }
    }

    allowedUpdates.agents = updates.agents
  }

  if (typeof updates?.is_public === 'boolean') {
    allowedUpdates.is_public = updates.is_public
  }

  if (Object.keys(allowedUpdates).length === 0) {
    return {
      data: null,
      error: {
        message: 'No valid workflow changes were provided.',
      },
    }
  }

  const { data, error } = await supabase
    .from(WORKFLOWS_TABLE)
    .update(allowedUpdates)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .maybeSingle()

  if (error) {
    return { data: null, error }
  }

  if (!data) {
    return {
      data: null,
      error: permissionError(),
    }
  }

  return { data, error: null }
}

/**
 * Delete a workflow.
 * Verify ownership before deleting.
 */
export async function deleteWorkflow(id) {
  if (!isSupabaseConfigured) {
    return { error: configurationError() }
  }

  if (!id || typeof id !== 'string') {
    return {
      error: { message: 'A valid workflow ID is required.' },
    }
  }

  const userId = await getCurrentUserId()

  if (!userId) {
    return { error: authenticationError() }
  }

  const ownership = await verifyWorkflowOwnership(id, userId)

  if (!ownership.authorized) {
    return { error: ownership.error }
  }

  const { data, error } = await supabase
    .from(WORKFLOWS_TABLE)
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select('id')

  if (error) {
    return { error }
  }

  if (!data || data.length === 0) {
    return { error: permissionError() }
  }

  return { error: null }
}

/**
 * Increment workflow usage atomically.
 */
export async function incrementUsage(id) {
  if (!isSupabaseConfigured) {
    return { data: null, error: configurationError() }
  }

  if (!id) {
    return {
      data: null,
      error: { message: 'A workflow ID is required.' },
    }
  }

  const { data, error } = await supabase.rpc(
    'increment_workflow_usage',
    { workflow_id: id }
  )

  return { data, error }
}

/**
 * Subscribe to one workflow's updates.
 */
export function subscribeToWorkflow(workflowId, callback) {
  if (
    !isSupabaseConfigured ||
    !workflowId ||
    typeof callback !== 'function'
  ) {
    return null
  }

  return supabase
    .channel(`workflow-${workflowId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: WORKFLOWS_TABLE,
        filter: `id=eq.${workflowId}`,
      },
      callback
    )
    .subscribe()
}

/**
 * Subscribe to public workflow updates.
 */
export function subscribeToAllWorkflows(callback) {
  if (
    !isSupabaseConfigured ||
    typeof callback !== 'function'
  ) {
    return null
  }

  return supabase
    .channel('public-workflows-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: WORKFLOWS_TABLE,
        filter: 'is_public=eq.true',
      },
      callback
    )
    .subscribe()
}
