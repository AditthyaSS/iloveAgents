import { supabase } from '../lib/supabase'

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
 * Save a new workflow to Supabase.
 * @param {{ title: string, description: string, agents: string[] }} workflow
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function saveWorkflow(workflow) {
  const { data, error } = await supabase
    .from('workflows')
    .insert([
      {
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
 * Increment the usage_count for a workflow by 1.
 * Uses a raw RPC-style update to safely increment without race conditions.
 * @param {string} id
 * @returns {Promise<{ error: object|null }>}
 */
export async function incrementUsage(id) {
  const { error } = await supabase.rpc('increment_workflow_usage', { workflow_id: id })

  // Fallback: if RPC doesn't exist, do a client-side increment
  if (error) {
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
  }

  return { error }
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
