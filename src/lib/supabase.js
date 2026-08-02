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
    .catch(err => console.error(err))