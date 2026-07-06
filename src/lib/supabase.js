import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured =
  Boolean(supabaseUrl && supabaseAnonKey) &&
  supabaseUrl !== 'undefined' &&
  supabaseAnonKey !== 'undefined'

function createNoopQuery(result = { data: [], error: null }) {
  const query = {
    select: () => query,
    insert: () => query,
    update: () => query,
    eq: () => query,
    order: () => query,
    single: () => createNoopQuery({ data: null, error: null }),
    then: (resolve) => Promise.resolve(result).then(resolve),
  }

  return query
}

const noopChannel = {
  on: () => noopChannel,
  subscribe: () => noopChannel,
}

const noopSupabase = {
  from: () => createNoopQuery(),
  rpc: () => Promise.resolve({ data: null, error: null }),
  channel: () => noopChannel,
  removeChannel: () => Promise.resolve(),
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : noopSupabase

