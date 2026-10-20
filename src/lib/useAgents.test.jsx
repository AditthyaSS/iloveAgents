import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { useAgents, AgentsProvider } from './useAgents'

const SRC_DIR = path.resolve(process.cwd(), 'src')

function collectSourceFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return collectSourceFiles(full)
    return /\.(js|jsx)$/.test(entry.name) ? [full] : []
  })
}

describe('useAgents architecture', () => {
  it('exposes the provider and hook', () => {
    expect(typeof AgentsProvider).toBe('function')
    expect(typeof useAgents).toBe('function')
  })

  it('only useAgents.jsx imports loadAllAgents from the registry', () => {
    const offenders = []

    for (const file of collectSourceFiles(SRC_DIR)) {
      const relative = path.relative(SRC_DIR, file).replace(/\\/g, '/')
      if (relative === 'lib/useAgents.jsx') continue
      if (/\.test\.jsx?$/.test(relative)) continue

      const source = fs.readFileSync(file, 'utf8')
      const importsRegistry = /from\s+['"][^'"]*agents\/registry['"]/.test(source)

      if (importsRegistry) offenders.push(relative)
    }

    expect(offenders).toEqual([])
  })
})
