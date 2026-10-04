import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const input = path.join(root, 'AGENTS.md')
const output = path.join(root, 'public', 'agents.json')

const text = fs.readFileSync(input, 'utf8')
const lines = text.split('\n')

const agents = []
for (const line of lines) {
  const trimmed = line.trim()
  if (!trimmed.startsWith('|')) continue
  const cells = trimmed.split('|').map((c) => c.trim())
  // cells[0] is empty, then number, name, description, category
  if (cells.length < 5) continue
  const num = Number(cells[1])
  if (!Number.isFinite(num)) continue
  const [, number, name, description, category] = cells
  if (!name) continue
  agents.push({ number, name, description, category: category || '' })
}

agents.sort((a, b) => Number(a.number) - Number(b.number))

fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, JSON.stringify({ count: agents.length, agents }, null, 2) + '\n')
console.log(`Wrote ${agents.length} agents to public/agents.json`)
