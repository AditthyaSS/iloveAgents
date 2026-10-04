import { describe, it, expect } from 'vitest'
import { paginateItems, pageNumbers, getPageCount } from './paginate'

const items = Array.from({ length: 20 }, (_, i) => i + 1)

describe('paginate', () => {
  it('splits into pages of nine by default', () => {
    const first = paginateItems(items, 1)
    expect(first.items).toHaveLength(9)
    expect(first.pageCount).toBe(3)
    const last = paginateItems(items, 3)
    expect(last.items).toEqual([19, 20])
  })

  it('clamps out of range pages', () => {
    expect(paginateItems(items, 99).page).toBe(3)
    expect(paginateItems(items, 0).page).toBe(1)
  })

  it('counts pages', () => {
    expect(getPageCount(0, 9)).toBe(0)
    expect(getPageCount(9, 9)).toBe(1)
    expect(getPageCount(10, 9)).toBe(2)
  })

  it('lists page numbers compactly', () => {
    expect(pageNumbers(1, 3)).toEqual([1, 2, 3])
    expect(pageNumbers(5, 20).length).toBeLessThanOrEqual(7)
  })
})
