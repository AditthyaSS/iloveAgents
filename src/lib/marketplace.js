/**
 * Agent Marketplace storage layer.
 *
 * Published agents, import counts, and ratings live in localStorage so the
 * marketplace works fully client side, matching how favorites and collections
 * already persist in this app. Every function is storage-failure safe: a
 * blocked or full localStorage degrades to an empty marketplace instead of
 * throwing.
 */

const LISTINGS_KEY = 'ila_marketplace_listings'
const DRAFTS_KEY = 'ila_marketplace_drafts'
const VOTES_KEY = 'ila_marketplace_votes'

export const MARKETPLACE_CATEGORIES = [
  'Data Processing',
  'Content Generation',
  'Research',
]

// Config keys that must never be published as-is
const CREDENTIAL_KEY_PATTERN = /(api[_-]?key|token|secret|password|credential|auth)/i

/**
 * Deep-copy an agent config, replacing the value of any credential-like field
 * with an explicit placeholder. Returns { config, sanitizedFields } where
 * sanitizedFields lists the dotted paths that were replaced.
 * @param {object} config
 * @returns {{ config: object, sanitizedFields: string[] }}
 */
export function sanitizeAgentConfig(config) {
  const sanitizedFields = []

  const walk = (value, path) => {
    if (Array.isArray(value)) return value.map((v, i) => walk(v, `${path}[${i}]`))
    if (value && typeof value === 'object') {
      const out = {}
      for (const [key, v] of Object.entries(value)) {
        const childPath = path ? `${path}.${key}` : key
        if (CREDENTIAL_KEY_PATTERN.test(key) && typeof v === 'string' && v !== '') {
          out[key] = `YOUR_${key.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_HERE`
          sanitizedFields.push(childPath)
        } else {
          out[key] = walk(v, childPath)
        }
      }
      return out
    }
    return value
  }

  return { config: walk(config ?? {}, ''), sanitizedFields }
}

/**
 * Publish an agent to the marketplace. The config is always sanitized before
 * it is stored.
 * @param {{ name: string, description: string, tags: string[], category: string, readme?: string, author?: string, config: object }} entry
 * @returns {object} the stored listing
 */
export function publishAgent(entry) {
  const { config, sanitizedFields } = sanitizeAgentConfig(entry.config)
  const listing = {
    id: `mkt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: String(entry.name ?? '').trim(),
    description: String(entry.description ?? '').trim(),
    tags: (entry.tags ?? []).map((t) => String(t).trim()).filter(Boolean).slice(0, 8),
    category: MARKETPLACE_CATEGORIES.includes(entry.category) ? entry.category : MARKETPLACE_CATEGORIES[0],
    readme: entry.readme ? String(entry.readme) : '',
    author: String(entry.author ?? 'Anonymous').trim() || 'Anonymous',
    config,
    sanitizedFields,
    importCount: 0,
    ratingTotal: 0,
    ratingCount: 0,
    publishedAt: new Date().toISOString(),
  }
  const listings = loadListings()
  listings.unshift(listing)
  saveJson(LISTINGS_KEY, listings)
  return listing
}

/**
 * All published listings, newest first.
 * @returns {Array<object>}
 */
export function loadListings() {
  return loadJson(LISTINGS_KEY, [])
}

/**
 * Import a listing into the local workspace as a draft. The draft keeps the
 * sanitized config and flags which credential fields still need real values,
 * so it cannot run until the user fills them in.
 * @param {string} listingId
 * @returns {object|null} the created draft, or null when the listing is gone
 */
export function importAgent(listingId) {
  const listings = loadListings()
  const listing = listings.find((l) => l.id === listingId)
  if (!listing) return null

  const draft = {
    id: `draft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    sourceListingId: listing.id,
    name: `${listing.name} (imported)`,
    description: listing.description,
    tags: [...listing.tags],
    config: JSON.parse(JSON.stringify(listing.config)),
    pendingCredentialFields: [...listing.sanitizedFields],
    readyToRun: listing.sanitizedFields.length === 0,
    importedAt: new Date().toISOString(),
  }

  const drafts = loadJson(DRAFTS_KEY, [])
  drafts.unshift(draft)
  saveJson(DRAFTS_KEY, drafts)

  listing.importCount = (listing.importCount ?? 0) + 1
  saveJson(LISTINGS_KEY, listings)

  return draft
}

/**
 * Imported drafts, newest first.
 * @returns {Array<object>}
 */
export function loadDrafts() {
  return loadJson(DRAFTS_KEY, [])
}

/**
 * Rate a listing 1 to 5 stars. One vote per user per agent: re-rating
 * replaces the previous vote instead of adding a second one.
 * @param {string} listingId
 * @param {number} stars 1..5
 * @returns {{ average: number, count: number }|null}
 */
export function rateAgent(listingId, stars) {
  const value = Math.min(5, Math.max(1, Math.round(stars)))
  const listings = loadListings()
  const listing = listings.find((l) => l.id === listingId)
  if (!listing) return null

  const votes = loadJson(VOTES_KEY, {})
  const previous = votes[listingId]

  if (previous) {
    listing.ratingTotal = listing.ratingTotal - previous + value
  } else {
    listing.ratingTotal = (listing.ratingTotal ?? 0) + value
    listing.ratingCount = (listing.ratingCount ?? 0) + 1
  }
  votes[listingId] = value

  saveJson(LISTINGS_KEY, listings)
  saveJson(VOTES_KEY, votes)
  return { average: getAverageRating(listing), count: listing.ratingCount }
}

/**
 * The current user's vote for a listing, or null.
 * @param {string} listingId
 * @returns {number|null}
 */
export function getUserVote(listingId) {
  const votes = loadJson(VOTES_KEY, {})
  return votes[listingId] ?? null
}

/**
 * Average rating rounded to one decimal, 0 when unrated.
 * @param {object} listing
 * @returns {number}
 */
export function getAverageRating(listing) {
  if (!listing?.ratingCount) return 0
  return Math.round((listing.ratingTotal / listing.ratingCount) * 10) / 10
}

/**
 * Filter listings by free-text search (name and tags) and category.
 * @param {Array<object>} listings
 * @param {{ search?: string, category?: string }} filters
 * @returns {Array<object>}
 */
export function filterListings(listings, { search = '', category = '' } = {}) {
  const q = search.trim().toLowerCase()
  return listings.filter((l) => {
    if (category && l.category !== category) return false
    if (!q) return true
    return (
      l.name.toLowerCase().includes(q) ||
      l.tags.some((t) => t.toLowerCase().includes(q))
    )
  })
}

function loadJson(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? 'null')
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage unavailable or full; the UI keeps its in-memory state
  }
}
