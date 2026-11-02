export type PaginationItem = number | 'start-ellipsis' | 'end-ellipsis'

export function normalizePageCount(pageCount: number): number {
  return Number.isFinite(pageCount) ? Math.max(0, Math.floor(pageCount)) : 0
}

export function clampPage(page: number, pageCount: number): number {
  const count = normalizePageCount(pageCount)
  if (count === 0) return 0
  return Math.min(count, Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1))
}

/** Keep bounds visible, fill one-page gaps, and never emit duplicate pages or ellipses. */
export function getPaginationItems(page: number, pageCount: number, siblingCount = 1): PaginationItem[] {
  const count = normalizePageCount(pageCount)
  if (count === 0) return []
  const current = clampPage(page, count)
  const siblings = Number.isFinite(siblingCount) ? Math.min(4, Math.max(0, Math.floor(siblingCount))) : 1
  const visible = new Set([1, count])
  for (let candidate = Math.max(1, current - siblings); candidate <= Math.min(count, current + siblings); candidate += 1) visible.add(candidate)
  const pages = [...visible].sort((a, b) => a - b)
  const result: PaginationItem[] = []
  for (let index = 0; index < pages.length; index += 1) {
    const previous = pages[index - 1]
    const next = pages[index]
    if (previous !== undefined && next - previous === 2) result.push(previous + 1)
    else if (previous !== undefined && next - previous > 2) result.push(next <= current ? 'start-ellipsis' : 'end-ellipsis')
    result.push(next)
  }
  return result
}
