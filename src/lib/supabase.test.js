/**
 * Tests for the supabase noop fallback.
 *
 * In the test environment VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are
 * undefined, so isSupabaseConfigured is false and supabase is the noop client.
 * We verify that the noop implementation is safe to call without throwing.
 */
import { describe, it, expect } from 'vitest'
import { isSupabaseConfigured, supabase } from './supabase.js'

describe('isSupabaseConfigured', () => {
  it('is false when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not set', () => {
    // In the Vitest environment there are no VITE_ env vars
    expect(isSupabaseConfigured).toBe(false)
  })
})

describe('noop supabase client (used when Supabase is not configured)', () => {
  it('supabase.from() returns a chainable query object', () => {
    const q = supabase.from('some_table')
    expect(q).toBeDefined()
  })

  it('select() is chainable and returns the same query', () => {
    const q = supabase.from('t')
    expect(q.select()).toBe(q)
  })

  it('insert() is chainable', () => {
    const q = supabase.from('t')
    expect(q.insert({ data: 1 })).toBe(q)
  })

  it('eq() is chainable', () => {
    const q = supabase.from('t')
    expect(q.eq('id', 1)).toBe(q)
  })

  it('gte() is chainable', () => {
    const q = supabase.from('t')
    expect(q.gte('created_at', '2024-01-01')).toBe(q)
  })

  it('order() is chainable', () => {
    const q = supabase.from('t')
    expect(q.order('timestamp')).toBe(q)
  })

  it('awaiting the query resolves with { data: [], error: null }', async () => {
    const result = await supabase.from('t').select()
    expect(result).toEqual({ data: [], error: null })
  })

  it('single() resolves with { data: null, error: null }', async () => {
    const result = await supabase.from('t').select().single()
    expect(result).toEqual({ data: null, error: null })
  })

  it('rpc() resolves with { data: null, error: null }', async () => {
    const result = await supabase.rpc('my_function', {})
    expect(result).toEqual({ data: null, error: null })
  })

  it('channel() returns an object with on() and subscribe()', () => {
    const ch = supabase.channel('my_channel')
    expect(typeof ch.on).toBe('function')
    expect(typeof ch.subscribe).toBe('function')
  })

  it('channel().on() is chainable', () => {
    const ch = supabase.channel('c')
    expect(ch.on('event', () => {})).toBe(ch)
  })

  it('channel().subscribe() returns the same channel (for cleanup)', () => {
    const ch = supabase.channel('c')
    expect(ch.subscribe()).toBe(ch)
  })

  it('removeChannel() resolves without throwing', async () => {
    const ch = supabase.channel('c')
    await expect(supabase.removeChannel(ch)).resolves.toBeUndefined()
  })
})
