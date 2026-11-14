const compareByName = (a, b) =>
  String(a.name ?? '').localeCompare(String(b.name ?? ''), undefined, {
    sensitivity: 'base',
  })

const compareByNewest = (a, b) => {
  const dateA = Date.parse(a.createdAt ?? '')
  const dateB = Date.parse(b.createdAt ?? '')
  const hasDateA = !Number.isNaN(dateA)
  const hasDateB = !Number.isNaN(dateB)

  if (!hasDateA) return hasDateB ? 1 : 0
  if (!hasDateB) return -1
  return dateB - dateA
}

const sortComparators = {
  relevance: () => 0,
  'name-asc': compareByName,
  'name-desc': (a, b) => compareByName(b, a),
  newest: compareByNewest,
}

export function sortAgents(agents, sortBy = 'relevance') {
  const compare = sortComparators[sortBy] || sortComparators.relevance
  return [...agents].sort(compare)
}
