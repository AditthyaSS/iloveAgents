import { describe, it, expect } from 'vitest'
import { formatCost, formatCostShort } from './CostEstimator'

describe('formatCost', () => {
  it('formats zero cost as $0.0000 instead of < $0.0001', () => {
    expect(formatCost(0)).toBe('$0.0000')
  })

  it('formats small non-zero costs as < $0.0001', () => {
    expect(formatCost(0.00001)).toBe('< $0.0001')
    expect(formatCost(0.000099)).toBe('< $0.0001')
  })

  it('formats standard costs to 4 decimal places', () => {
    expect(formatCost(0.0025)).toBe('$0.0025')
    expect(formatCost(0.015)).toBe('$0.0150')
    expect(formatCost(1.23456)).toBe('$1.2346')
  })

  it('handles null, undefined, NaN, and negative values safely', () => {
    expect(formatCost(null)).toBe('—')
    expect(formatCost(undefined)).toBe('—')
    expect(formatCost(NaN)).toBe('—')
    expect(formatCost(-0.01)).toBe('—')
  })
})

describe('formatCostShort', () => {
  it('formats zero cost as $0.00 instead of <$0.0001', () => {
    expect(formatCostShort(0)).toBe('$0.00')
  })

  it('formats small non-zero costs as <$0.0001', () => {
    expect(formatCostShort(0.00005)).toBe('<$0.0001')
  })

  it('formats costs under $0.01 to 4 decimal places', () => {
    expect(formatCostShort(0.0045)).toBe('$0.0045')
  })

  it('formats costs of $0.01 and above to 2 decimal places', () => {
    expect(formatCostShort(0.025)).toBe('$0.03')
    expect(formatCostShort(1.5)).toBe('$1.50')
  })

  it('handles null, undefined, NaN, and negative values safely', () => {
    expect(formatCostShort(null)).toBe('—')
    expect(formatCostShort(undefined)).toBe('—')
    expect(formatCostShort(NaN)).toBe('—')
    expect(formatCostShort(-1)).toBe('—')
  })
})
