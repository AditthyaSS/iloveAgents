import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { barWidthPercent, donutSegments } from './analyticsCharts'
import TopAgentsChart from './TopAgentsChart'
import ProviderDonut, { PROVIDER_COLORS } from './ProviderDonut'

describe('analytics chart math', () => {
  it('floors bar widths and guards zero max', () => {
    expect(barWidthPercent(10, 10)).toBe(100)
    expect(barWidthPercent(1, 100)).toBe(5)
    expect(barWidthPercent(0, 0)).toBe(5)
  })

  it('segments sum to the whole with real legend percents', () => {
    const data = [
      { name: 'openai', count: 3 },
      { name: 'gemini', count: 1 },
    ]
    const segs = donutSegments(data, 4, PROVIDER_COLORS)
    expect(segs[0].pct).toBe(75)
    expect(segs[1].pct).toBe(25)
    expect(segs[0].offset).toBe(0)
    expect(segs[1].offset).toBeCloseTo(0.75)
    expect(segs[0].label).toBe('OpenAI')
  })

  it('falls back for unknown providers and empty totals', () => {
    const segs = donutSegments([{ name: 'nope', count: 2 }], 0, PROVIDER_COLORS)
    expect(segs[0].color).toBe(PROVIDER_COLORS.unknown.color)
    expect(segs[0].pct).toBe(0)
  })
})

describe('extracted charts', () => {
  it('top agents navigate on click', () => {
    const navigate = (...args) => {
      navigate.calls.push(args)
    }
    navigate.calls = []
    render(
      <TopAgentsChart
        agents={[{ agentId: 'a1', agentName: 'Alpha', count: 4 }]}
        navigate={navigate}
      />
    )
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Alpha'))
    expect(navigate.calls).toEqual([['/agent/a1']])
  })

  it('donut legend shows computed percents', () => {
    render(<ProviderDonut data={[{ name: 'openai', count: 1 }]} total={1} />)
    expect(screen.getByText(/OpenAI \(100%\)/)).toBeInTheDocument()
  })
})
