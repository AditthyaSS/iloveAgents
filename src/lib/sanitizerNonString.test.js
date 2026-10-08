import { describe, it, expect } from 'vitest'
import { sanitizeAgentConfig } from './marketplace'

describe('sanitizeAgentConfig non-strings', () => {
  it('replaces numeric, boolean, and object secrets', () => {
    const { config, sanitizedFields } = sanitizeAgentConfig({
      apiKey: 12345,
      token: { value: 'abc' },
      enabled: true,
      secretFlag: false,
      name: 'Agent',
    })
    expect(config.apiKey).toContain('YOUR_APIKEY_HERE')
    expect(config.token).toContain('YOUR_TOKEN_HERE')
    expect(config.enabled).toBe(true)
    expect(config.secretFlag).toContain('YOUR_SECRETFLAG_HERE')
    expect(config.name).toBe('Agent')
    expect(sanitizedFields).toContain('apiKey')
    expect(sanitizedFields).toContain('token')
  })
})
