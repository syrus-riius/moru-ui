import { describe, expect, it } from 'vitest'
import { calendarMonthCells, closestDetent, isLeapYear, progressValues, readableOn, sheetDetentHeights, steppedValue } from './mobile-utils'

describe('native activity calendar dates', () => {
  it('uses a Monday-first grid with complete weeks and exact date keys', () => {
    const cells = calendarMonthCells(2026, 10)
    expect(cells).toHaveLength(35)
    expect(cells.slice(0, 3)).toEqual([null, null, null])
    expect(cells[3]).toEqual({ date: '2026-10-01', day: 1, weekday: 3 })
    expect(cells.filter(Boolean)).toHaveLength(31)
    expect(cells.at(-1)).toBeNull()
  })
  it('handles leap centuries and years below 100 without Date constructor coercion', () => {
    expect(isLeapYear(1900)).toBe(false)
    expect(isLeapYear(2000)).toBe(true)
    expect(calendarMonthCells(1900, 2).filter(Boolean)).toHaveLength(28)
    expect(calendarMonthCells(2000, 2).filter(Boolean)).toHaveLength(29)
    expect(calendarMonthCells(24, 2).filter(Boolean).at(-1)?.date).toBe('0024-02-29')
  })
  it.each([[2026, 0], [2026, 13], [2026, 2.5], [NaN, 1], [0, 1], [10000, 1]])('rejects an invalid year/month %s/%s', (year, month) => {
    expect(calendarMonthCells(year, month)).toEqual([])
  })
})

describe('native geometry and progress', () => {
  it('clamps progress and avoids NaN or invalid accessibility ranges', () => {
    expect(progressValues(-4, 20)).toEqual({ value: 0, max: 20, fraction: 0 })
    expect(progressValues(25, 20)).toEqual({ value: 20, max: 20, fraction: 1 })
    expect(progressValues(Infinity, 0)).toEqual({ value: 0, max: 100, fraction: 0 })
    expect(progressValues(5, 20).fraction).toBe(.25)
  })
  it('resolves fractions and px into sorted, bounded, unique detents', () => {
    expect(sheetDetentHeights([.8, .4, 320, -3, Infinity, .4], 800)).toEqual([320, 640])
    expect(sheetDetentHeights([2000, 1, 10], 500)).toEqual([160, 500])
    expect(sheetDetentHeights([.4, .8], 120)).toEqual([120])
    expect(sheetDetentHeights([NaN], 800)).toEqual([360, 680])
    expect(sheetDetentHeights([NaN], 120)).toEqual([120])
  })
  it('chooses the nearest detent without mutating the supplied list', () => {
    const heights = Object.freeze([240, 500, 700])
    expect(closestDetent(420, heights)).toBe(1)
    expect(closestDetent(620, heights)).toBe(2)
    expect(closestDetent(NaN, heights)).toBe(0)
    expect(closestDetent(100, [])).toBe(0)
  })
  it('chooses readable foregrounds for light, dark and short hex colors', () => {
    expect(readableOn('#fff')).toBe('#000000')
    expect(readableOn('#121212')).toBe('#ffffff')
    expect(readableOn('#ffff00')).toBe('#000000')
    expect(readableOn('invalid', '#123456')).toBe('#123456')
  })
})

describe('native decimal steps', () => {
  it('preserves tiny steps and avoids ordinary decimal addition noise', () => {
    expect(steppedValue(0, 1e-9, 1, 0, 1)).toBe(1e-9)
    expect(steppedValue(0, 1e-101, 1, 0, 1)).toBe(1e-101)
    expect(steppedValue(.1, .2, 1, 0, 1)).toBe(.3)
    expect(steppedValue(.9, .2, 1, 0, 1)).toBe(1)
    expect(steppedValue(.1, .2, -1, 0, 1)).toBe(0)
  })
})
