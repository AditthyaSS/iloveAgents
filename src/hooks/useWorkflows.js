import { supabase } from '../lib/supabase'

/**
 * Get the currently authenticated user's ID.
 * Returns null if no user is logged in or Supabase auth is unavailable.
 * @returns {Promise<string|null>}
 */
async function getCurrentUserId() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    return user.id
  } catch (err) {
    console.warn('Failed to get current user:', err)
    return null
  }
}

/**
 * Fetch all public workflows from Supabase, ordered by newest first.
 * @returns {Promise<{ data: Array, error: object|null }>}
 */
export async function fetchWorkflows() {
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  return { data: data ?? [], error }
}

/**
 * Fetch a single workflow by its ID.
 * @param {string} id
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function fetchWorkflowById(id) {
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', id)
    .single()

  return { data: data ?? null, error }
}

/**
 * Save a new workflow to Supabase with user ownership verification.
 * Ensures the current authenticated user is recorded as the workflow owner.
 * @param {{ title: string, description: string, agents: string[] }} workflow
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function saveWorkflow(workflow) {
  const userId = await getCurrentUserId()

  // Require user authentication to prevent unauthorized writes
  if (!userId) {
    return {
      data: null,
      error: {
        message: 'User must be authenticated to save workflows. Please log in first.',
      },
    }
  }

  const { data, error } = await supabase
    .from('workflows')
    .insert([
      {
        user_id: userId,
        title: workflow.title,
        description: workflow.description || '',
        agents: workflow.agents,
        is_public: true,
        usage_count: 0,
      },
    ])
    .select()
    .single()

  return { data: data ?? null, error }
}

/**
 * Update an existing workflow with user ownership verification.
 * Only allows updates if the current user is the workflow owner.
 * @param {string} id - Workflow ID
 * @param {{ title?: string, description?: string, agents?: string[], is_public?: boolean }} updates
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function updateWorkflow(id, updates) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return {
      data: null,
      error: {
        message: 'User must be authenticated to update workflows.',
      },
    }
  }

  // Verify ownership: fetch workflow and check user_id matches
  const { data: workflow, error: fetchError } = await supabase
    .from('workflows')
    .select('user_id')
    .eq('id', id)
    .single()

  if (fetchError || !workflow) {
    return {
      data: null,
      error: fetchError || { message: 'Workflow not found.' },
    }
  }

  if (workflow.user_id !== userId) {
    return {
      data: null,
      error: {
        message: 'You do not have permission to update this workflow. Only the owner can make changes.',
      },
    }
  }

  // Proceed with update (ownership verified)
  const { data, error } = await supabase
    .from('workflows')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  return { data: data ?? null, error }
}

/**
 * Delete a workflow with user ownership verification.
 * Only allows deletion if the current user is the workflow owner.
 * @param {string} id - Workflow ID
 * @returns {Promise<{ error: object|null }>}
 */
export async function deleteWorkflow(id) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return {
      error: {
        message: 'User must be authenticated to delete workflows.',
      },
    }
  }

  // Verify ownership: fetch workflow and check user_id matches
  const { data: workflow, error: fetchError } = await supabase
    .from('workflows')
    .select('user_id')
    .eq('id', id)
    .single()

  if (fetchError || !workflow) {
    return {
      error: fetchError || { message: 'Workflow not found.' },
    }
  }

  if (workflow.user_id !== userId) {
    return {
      error: {
        message: 'You do not have permission to delete this workflow. Only the owner can delete it.',
      },
    }
  }

  // Proceed with deletion (ownership verified)
  const { error } = await supabase
    .from('workflows')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  return { error }
}

/**
 * Increment the usage_count for a workflow by 1.
 * Uses a raw RPC-style update to safely increment without race conditions.
 * @param {string} id
 * @returns {Promise<{ error: object|null }>}
 */
/**
 * Increment the usage_count for a workflow by 1.
 * Uses a raw RPC-style update to safely increment without race conditions.
 * @param {string} id
 * @returns {Promise<{ error: object|null }>}
 */
export async function incrementUsage(id) {
  const { error: rpcError } = await supabase.rpc('increment_workflow_usage', { workflow_id: id })

  // 1. If the RPC works perfectly, exit immediately with no error.
  if (!rpcError) {
    return { error: null }
  }

  // 2. If we reach this point, the RPC failed. Attempt client-side fallback.
  console.warn('RPC failed, executing client-side fallback:', rpcError.message)

  const { data: current } = await supabase
    .from('workflows')
    .select('usage_count')
    .eq('id', id)
    .single()

  if (current) {
    const { error: updateError } = await supabase
      .from('workflows')
      .update({ usage_count: (current.usage_count ?? 0) + 1 })
      .eq('id', id)
    
    return { error: updateError }
  }

  // 3. THE FIX: If 'current' is null (row not found), return a clear contextual error
  // instead of letting it slip through to return the old rpcError.
  return { 
    error: { 
      message: `Failed to increment usage. Workflow with ID ${id} could not be found during fallback.` 
    } 
  }
}

/**
 * Subscribe to realtime updates for a specific workflow's usage_count.
 * Returns the channel object — call supabase.removeChannel(channel) to unsubscribe.
 * @param {string} workflowId
 * @param {(payload: object) => void} callback
 * @returns {RealtimeChannel}
 */
export function subscribeToWorkflow(workflowId, callback) {
  const channel = supabase
    .channel(`workflow-usage-${workflowId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'workflows',
        filter: `id=eq.${workflowId}`,
      },
      (payload) => {
        callback(payload)
      }
    )
    .subscribe()

  return channel
}

/**
 * Subscribe to realtime updates for ALL public workflows (for library page).
 * Returns the channel object — call supabase.removeChannel(channel) to unsubscribe.
 * @param {(payload: object) => void} callback
 * @returns {RealtimeChannel}
 */
export function subscribeToAllWorkflows(callback) {
  const channel = supabase
    .channel('workflow-usage-all')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'workflows',
      },
      (payload) => {
        callback(payload)
      }
    )
    .subscribe()

  return channel
}
