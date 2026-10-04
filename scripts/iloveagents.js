#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { loadAgentSummaries, searchAgents, formatAgentLine } from '../src/lib/agentsCli.js'

const args = process.argv.slice(2)
const cmd = args[0] || 'list'

function printHelp() {
  console.log('Usage:')
  console.log('  node scripts/iloveagents.js list')
  console.log('  node scripts/iloveagents.js search <query>')
  console.log('  node scripts/iloveagents.js show <id>')
}

try {
  const agents = loadAgentSummaries()
  if (cmd === 'list') {
    agents.forEach((a) => console.log(formatAgentLine(a)))
  } else if (cmd === 'search') {
    const q = args.slice(1).join(' ')
    const hits = searchAgents(agents, q)
    if (hits.length === 0) console.log('No agents found for: ' + q)
    hits.forEach((a) => {
      console.log(formatAgentLine(a))
      if (a.description) console.log('  ' + a.description)
    })
  } else if (cmd === 'show') {
    const id = args[1]
    const found = agents.find((a) => a.id === id)
    if (!found) {
      console.error('Unknown agent id: ' + id)
      process.exit(1)
    }
    const defsDir = path.resolve(process.cwd(), 'src/agents/definitions')
    const source = fs.readFileSync(path.join(defsDir, found.file), 'utf8')
    const prompt = source.match(/systemPrompt:\s*`([\s\S]*?)`/)
    console.log(found.name + ' (' + found.id + ')')
    console.log('Category: ' + found.category)
    if (found.description) console.log(found.description)
    if (prompt) {
      console.log('')
      console.log(prompt[1].trim())
    }
  } else {
    printHelp()
  }
} catch (err) {
  console.error(err.message || String(err))
  process.exit(1)
}
