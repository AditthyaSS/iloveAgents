import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'dummy'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default async function handler(req, res) {
  // Setup CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID parameter is required and must be a string' })
    }

    const { data, error } = await supabase
      .from('shared_outputs')
      .select('id, agent_id, agent_name, inputs, output, output_type, created_at, expires_at')
      .eq('id', id)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    if (error) {
      console.error('Supabase get error:', error)
      return res.status(500).json({ error: error.message })
    }

    if (!data) {
      return res.status(404).json({ error: 'Shared output not found or expired' })
    }

    return res.status(200).json(data)
  } catch (err) {
    console.error('API share get error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
