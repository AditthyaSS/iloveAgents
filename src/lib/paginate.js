export const DEFAULT_PAGE_SIZE = 9

export function getPageCount(total, pageSize) {
  const size = pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE
  if (total <= 0) return 0
  return Math.ceil(total / size)
}

export function paginateItems(items, page, pageSize) {
  const size = pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE
  const list = Array.isArray(items) ? items : []
  const pages = getPageCount(list.length, size)
  const current = Math.min(Math.max(1, page || 1), Math.max(1, pages))
  const start = (current - 1) * size
  return {
    page: current,
    pageCount: pages,
    total: list.length,
    items: list.slice(start, start + size),
  }
}

export function pageNumbers(page, pageCount) {
  if (pageCount <= 0) return []
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }
  const set = new Set([1, 2, page - 1, page, page + 1, pageCount - 1, pageCount])
  return [...set].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b)
}
