import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('site webmanifest', () => {
  it('names the app for install prompts', () => {
    const raw = fs.readFileSync(
      path.resolve(process.cwd(), 'public/site.webmanifest'),
      'utf8'
    )
    const manifest = JSON.parse(raw)
    expect(manifest.name.trim()).not.toBe('')
    expect(manifest.short_name.trim()).not.toBe('')
  })

  it('references icons that exist', () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), 'public/site.webmanifest'), 'utf8')
    )
    for (const icon of manifest.icons) {
      expect(fs.existsSync(path.resolve(process.cwd(), `public${icon.src}`))).toBe(true)
    }
  })
})
