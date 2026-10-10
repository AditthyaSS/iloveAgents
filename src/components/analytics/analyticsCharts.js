export function barWidthPercent(count, maxCount) {
  if (!maxCount || maxCount <= 0) return 5
  return Math.max(5, (count / maxCount) * 100)
}

export function donutSegments(data, total, colorMap, unknownKey = 'unknown') {
  const safeTotal = total > 0 ? total : 0
  let cumulative = 0
  return (data || []).map((item) => {
    const pct = safeTotal > 0 ? item.count / safeTotal : 0
    const info = (colorMap && (colorMap[item.name] || colorMap[unknownKey])) || {}
    const segment = {
      ...item,
      pct: Math.round(pct * 100),
      color: info.color,
      label: info.label || item.name,
    }
    segment.offset = cumulative
    cumulative += pct
    return segment
  })
}
