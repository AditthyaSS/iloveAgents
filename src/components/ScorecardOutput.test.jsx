import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ScorecardOutput, { parseScorecardText } from './ScorecardOutput'

const payload = {
  matchScore: 85,
  recommendation: 'Strong Yes',
  criteria: {
    'Technical skills': { score: 90, comment: 'Great experience' },
  },
}

const raw = JSON.stringify(payload)

describe('parseScorecardText', () => {
  it('parses clean JSON', () => {
    expect(parseScorecardText(raw)).toEqual(payload)
  })

  it('parses fenced JSON with preamble and postscript', () => {
    const input =
      'Here is the scorecard:\n```json\n' + raw + '\n```\nHope this helps!'
    expect(parseScorecardText(input)).toEqual(payload)
  })

  it('parses fence without language tag', () => {
    const input = 'result:\n```\n' + raw + '\n```'
    expect(parseScorecardText(input)).toEqual(payload)
  })

  it('parses bare JSON with surrounding text and no fences', () => {
    const input =
      'Here is your candidate evaluation:\n\n' + raw + '\n\nLet me know if you need anything else!'
    expect(parseScorecardText(input)).toEqual(payload)
  })

  it('returns null for genuinely invalid output', () => {
    expect(parseScorecardText('not json at all')).toBeNull()
    expect(parseScorecardText('')).toBeNull()
  })

  it('passes through non-string input', () => {
    expect(parseScorecardText(payload)).toEqual(payload)
  })
})

describe('ScorecardOutput rendering', () => {
  it('renders the gauge when preamble surrounds fenced JSON', () => {
    const input =
      'Here is the scorecard:\n```json\n' + raw + '\n```\nThanks!'
    render(<ScorecardOutput data={input} />)
    expect(screen.getByText('85/100')).toBeInTheDocument()
    expect(screen.getByText('Technical skills')).toBeInTheDocument()
  })

  it('shows fallback card for unparsable text', () => {
    render(<ScorecardOutput data="hello world" />)
    expect(
      screen.getByText(/Could not parse the response as a scorecard/i)
    ).toBeInTheDocument()
  })
})
