import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'dummy'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default async function handler(req, res) {
  // Setup CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { agentName, agentId, inputs, output, outputType } = req.body

    // Validation
    if (!agentName || typeof agentName !== 'string' || !agentName.trim()) {
      return res.status(400).json({ error: 'agentName is required and must be a non-empty string' })
    }
    if (!output || typeof output !== 'string' || !output.trim()) {
      return res.status(400).json({ error: 'output is required and must be a non-empty string' })
    }

    let parsedInputs = inputs
    if (typeof inputs === 'string') {
      try {
        parsedInputs = JSON.parse(inputs)
      } catch {
        parsedInputs = { text: inputs }
      }
    }

    const id = randomUUID()
    const createdAt = new Date()
    const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)

    const payload = {
      id,
      agent_id: agentId || agentName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      agent_name: agentName,
      inputs: parsedInputs || {},
      output,
      output_type: outputType || 'markdown',
      created_at: createdAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    }

    const { error } = await supabase.from('shared_outputs').insert(payload)
    if (error) {
      console.error('Supabase insert error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({
      shareId: id,
      url: `/share/${id}`,
    })
  } catch (err) {
    console.error('API share error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
