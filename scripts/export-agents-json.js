import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const agentsMdPath = path.resolve(__dirname, '../AGENTS.md')
const publicDir = path.resolve(__dirname, '../public')
const outputPath = path.join(publicDir, 'agents.json')

if (!fs.existsSync(agentsMdPath)) {
  console.error('AGENTS.md not found at', agentsMdPath)
  process.exit(1)
}

const content = fs.readFileSync(agentsMdPath, 'utf8')
const lines = content.split('\n')

const agents = []
let inTable = false

for (const line of lines) {
  const trimmed = line.trim()
  if (trimmed.startsWith('| # | Name | Description | Category |')) {
    inTable = true
    continue
  }
  if (inTable) {
    if (trimmed.startsWith('|---')) {
      continue
    }
    if (!trimmed.startsWith('|')) {
      if (agents.length > 0) {
        break
      }
      continue
    }
    const cols = trimmed
      .split('|')
      .map((c) => c.trim())
      .filter((_, i, arr) => i > 0 && i < arr.length - 1)
    if (cols.length >= 4) {
      const [num, name, description, category] = cols
      if (num && !isNaN(Number(num))) {
        agents.push({
          id: Number(num),
          name,
          description,
          category,
        })
      }
    }
  }
}

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

fs.writeFileSync(outputPath, JSON.stringify(agents, null, 2) + '\n', 'utf8')
console.log(`Successfully exported ${agents.length} agents to ${outputPath}`)
