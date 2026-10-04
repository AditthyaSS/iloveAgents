import fs from 'node:fs'
import path from 'node:path'

function field(source, name) {
  const m = source.match(new RegExp(name + '\\s*:\\s*["\']([\\s\\S]*?)["\']'))
  return m ? m[1].replace(/\s+/g, ' ').trim() : ''
}

export function loadAgentSummaries(defsDir) {
  const dir = defsDir || path.resolve(process.cwd(), 'src/agents/definitions')
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js'))
  return files.map((file) => {
    const source = fs.readFileSync(path.join(dir, file), 'utf8')
    return {
      id: field(source, 'id') || file.replace(/\.js$/, ''),
      name: field(source, 'name'),
      description: field(source, 'description'),
      category: field(source, 'category'),
      file,
    }
  })
}

export function searchAgents(agents, query) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return agents
  return agents.filter((a) =>
    [a.id, a.name, a.description, a.category].join(' ').toLowerCase().includes(q)
  )
}

export function formatAgentLine(a) {
  return `${a.id} | ${a.name} | ${a.category}`
}
