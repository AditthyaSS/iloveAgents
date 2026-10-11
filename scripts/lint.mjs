// Repo-owned contract lint: validates agent definitions against the
// model registry and category list. Zero dependencies; run via `npm run lint`.
// Exits non-zero with a violation list when contracts break.
import { readdirSync, readFileSync } from 'node:fs'
import { join, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const { MODELS } = await import('../src/lib/resolveAgentModel.js').catch(() => ({ MODELS: {} }))
const { CATEGORIES } = await import('../src/agents/categories.js').catch(() => ({ CATEGORIES: [] }))

const validModels = new Set(Object.values(MODELS ?? {}).flat().map((m) => m.value))
const validCats = new Set(CATEGORIES ?? [])
const dir = join(root, 'src', 'agents', 'definitions')
const violations = []

for (const file of readdirSync(dir)) {
  if (!file.endsWith('.js')) continue
  const text = readFileSync(join(dir, file), 'utf8')
  const expectedId = basename(file, '.js')
  const id = text.match(/id:\s*['"]([^'"]+)['"]/)?.[1]
  if (id !== expectedId) violations.push(`${file}: id "${id}" != filename "${expectedId}"`)
  const model = text.match(/^\s*model:\s*['"]([^'"]+)['"]/m)?.[1]
  if (model && !validModels.has(model)) violations.push(`${file}: unknown model "${model}"`)
  const cat = text.match(/category:\s*['"]([^'"]+)['"]/)?.[1]
  if (cat && !validCats.has(cat)) violations.push(`${file}: unknown category "${cat}"`)
}

if (violations.length > 0) {
  console.error(`lint: ${violations.length} violation(s) found`)
  for (const v of violations) console.error(` - ${v}`)
  process.exit(1)
}
console.log('lint: agent contracts OK')
