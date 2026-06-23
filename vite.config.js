import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-server-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/share')) {
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

            if (req.method === 'OPTIONS') {
              res.statusCode = 200
              res.end()
              return
            }

            const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321'
            const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'dummy'
            const supabase = createClient(supabaseUrl, supabaseAnonKey)

            const url = new URL(req.url, 'http://localhost')
            const pathname = url.pathname

            if (req.method === 'POST' && pathname === '/api/share') {
              let body = ''
              req.on('data', chunk => {
                body += chunk.toString()
              })
              req.on('end', async () => {
                try {
                  const { agentName, agentId, inputs, output, outputType } = JSON.parse(body)

                  if (!agentName || typeof agentName !== 'string' || !agentName.trim()) {
                    res.statusCode = 400
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify({ error: 'agentName is required and must be a non-empty string' }))
                    return
                  }
                  if (!output || typeof output !== 'string' || !output.trim()) {
                    res.statusCode = 400
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify({ error: 'output is required and must be a non-empty string' }))
                    return
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
                    res.statusCode = 500
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify({ error: error.message }))
                    return
                  }

                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({
                    shareId: id,
                    url: `/share/${id}`,
                  }))
                } catch (err) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'Failed to process request: ' + err.message }))
                }
              })
              return
            }

            if (req.method === 'GET' && pathname.startsWith('/api/share/')) {
              const id = pathname.substring('/api/share/'.length)

              if (!id) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'ID is required' }))
                return
              }

              try {
                const { data, error } = await supabase
                  .from('shared_outputs')
                  .select('id, agent_id, agent_name, inputs, output, output_type, created_at, expires_at')
                  .eq('id', id)
                  .gt('expires_at', new Date().toISOString())
                  .maybeSingle()

                if (error) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: error.message }))
                  return
                }

                if (!data) {
                  res.statusCode = 404
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'Shared output not found or expired' }))
                  return
                }

                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(data))
              } catch (err) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'Failed to query database' }))
              }
              return
            }
          }
          next()
        })
      }
    }
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/src/agents/definitions/')) {
            return 'agent-definitions'
          }
        }
      }
    }
  }
})

