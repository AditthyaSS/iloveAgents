export const SORT_OPTIONS = ['relevance', 'az', 'za', 'newest']

export function sortAgents(agents, sort) {
  const list = Array.isArray(agents) ? [...agents] : []
  if (sort === 'az') {
    list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
  } else if (sort === 'za') {
    list.sort((a, b) => String(b.name || '').localeCompare(String(a.name || '')))
  } else if (sort === 'newest') {
    list.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return tb - ta
    })
  }
  return list
}
