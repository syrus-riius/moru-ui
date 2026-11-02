import { describe, expect, it } from 'vitest'
import { clampPage, getPaginationItems, normalizePageCount } from './pagination-utils'

describe('Pagination boundary normalization', () => {
  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, -8, 0])('treats page count %s as an empty collection', (count) => {
    expect(normalizePageCount(count)).toBe(0)
    expect(clampPage(4, count)).toBe(0)
    expect(getPaginationItems(4, count)).toEqual([])
  })
  it('floors fractional totals and clamps invalid or stale current pages', () => {
    expect(normalizePageCount(6.9)).toBe(6)
    expect(clampPage(-2, 6)).toBe(1)
    expect(clampPage(Number.NaN, 6)).toBe(1)
    expect(clampPage(8, 6)).toBe(6)
    expect(clampPage(3.9, 6)).toBe(3)
  })
})

describe('Pagination navigation windows', () => {
  it('keeps a large list navigable from the middle and both ends', () => {
    expect(getPaginationItems(50, 100)).toEqual([1, 'start-ellipsis', 49, 50, 51, 'end-ellipsis', 100])
    expect(getPaginationItems(1, 100)).toEqual([1, 2, 'end-ellipsis', 100])
    expect(getPaginationItems(100, 100)).toEqual([1, 'start-ellipsis', 99, 100])
  })
  it('shows a missing single page instead of an unnecessary ellipsis', () => {
    expect(getPaginationItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(getPaginationItems(1, 3, 0)).toEqual([1, 2, 3])
  })
  it('always exposes the first, last, and current page without duplicates or out-of-bounds pages', () => {
    for (let count = 1; count <= 100; count += 1) {
      for (const requested of [-4, 1, Math.ceil(count / 2), count, count + 8]) {
        const result = getPaginationItems(requested, count)
        const numeric = result.filter((entry): entry is number => typeof entry === 'number')
        expect(numeric).toContain(1)
        expect(numeric).toContain(count)
        expect(numeric).toContain(clampPage(requested, count))
        expect(new Set(result).size).toBe(result.length)
        expect(numeric.every((entry) => entry >= 1 && entry <= count)).toBe(true)
        expect(numeric).toEqual([...numeric].sort((a, b) => a - b))
        expect(result.length).toBeLessThanOrEqual(7)
      }
    }
  })
  it('limits pathological sibling counts to a bounded navigation window', () => {
    expect(getPaginationItems(50, 100, Number.NaN)).toEqual(getPaginationItems(50, 100, 1))
    expect(getPaginationItems(50, 100, 1_000_000).length).toBeLessThanOrEqual(13)
    expect(getPaginationItems(50, 100, -2)).toEqual([1, 'start-ellipsis', 50, 'end-ellipsis', 100])
  })
})
