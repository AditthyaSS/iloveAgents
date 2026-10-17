#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const agentsDir = path.resolve(__dirname, '../src/agents/definitions')

function loadAgents() {
  if (!fs.existsSync(agentsDir)) return []
  const files = fs.readdirSync(agentsDir).filter((f) => f.endsWith('.js'))
  const agents = []
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(agentsDir, file), 'utf8')
      const idMatch = content.match(/id:\s*["']([^"']+)["']/)
      const nameMatch = content.match(/name:\s*["']([^"']+)["']/)
      const descMatch = content.match(/description:\s*["']([^"']+)["']/)
      const catMatch = content.match(/category:\s*["']([^"']+)["']/)
      if (idMatch && nameMatch) {
        agents.push({
          id: idMatch[1],
          name: nameMatch[1],
          description: descMatch ? descMatch[1] : '',
          category: catMatch ? catMatch[1] : '',
          file,
        })
      }
    } catch {}
  }
  return agents
}

const args = process.argv.slice(2)
const command = args[0]

if (!command || command === 'help' || command === '--help' || command === '-h') {
  console.log(`
iloveAgents CLI

Usage:
  iloveagents list                      List all agents
  iloveagents search <query>            Search agents by name, category, or description
  iloveagents get <agent-id>            View details for an agent
`)
  process.exit(0)
}

const agents = loadAgents()

if (command === 'list') {
  console.log(`Found ${agents.length} agents:\n`)
  for (const a of agents) {
    console.log(`• ${a.name} [${a.category}] (ID: ${a.id})`)
  }
} else if (command === 'search') {
  const query = args.slice(1).join(' ').toLowerCase()
  if (!query) {
    console.error(
      'Please specify a search query. Example: iloveagents search database'
    )
    process.exit(1)
  }
  const results = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(query) ||
      a.category.toLowerCase().includes(query) ||
      a.description.toLowerCase().includes(query) ||
      a.id.toLowerCase().includes(query)
  )
  console.log(`Search results for "${query}" (${results.length} found):\n`)
  for (const r of results) {
    console.log(`• ${r.name} [${r.category}] (ID: ${r.id})`)
    if (r.description) console.log(`  ${r.description}\n`)
  }
} else if (command === 'get') {
  const id = args[1]
  if (!id) {
    console.error(
      'Please specify an agent ID. Example: iloveagents get api-doc-generator'
    )
    process.exit(1)
  }
  const agent = agents.find((a) => a.id.toLowerCase() === id.toLowerCase())
  if (!agent) {
    console.error(`Agent not found with ID "${id}".`)
    process.exit(1)
  }
  console.log(`
=========================================
${agent.name}
=========================================
ID:          ${agent.id}
Category:    ${agent.category}
Description: ${agent.description}
File:        src/agents/definitions/${agent.file}
`)
} else {
  console.error(
    `Unknown command: "${command}". Run "iloveagents --help" for usage.`
  )
  process.exit(1)
}
