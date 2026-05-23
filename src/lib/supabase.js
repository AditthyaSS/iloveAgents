import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'dummy'

export const supabase = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'undefined' 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : { from: () => ({ select: () => ({ order: () => Promise.resolve({ data: [] }) }), insert: () => Promise.resolve({ data: null }), rpc: () => Promise.resolve({}) }) }

