import { describe, expect, it } from 'vitest'
import { chartAreaPath, chartCoordinates, chartDomain, chartLinePath, donutArcPath, donutSegments, formatChartValue, normalizeChartData, scaleChartValue } from './chart-utils'

describe('native chart normalization', () => {
  it('retains zero/negative finite values, drops invalid values, and creates unique keys without mutation', () => {
    const input = Object.freeze([{ id: 'a', label: '영', value: 0 }, { id: 'a', label: ' 음수 ', value: -4 }, { id: 'bad', label: '오류', value: NaN }, { id: 'a-2', label: '', value: 3 }].map(Object.freeze))
    expect(normalizeChartData(input)).toEqual([{ id: 'a', label: '영', value: 0 }, { id: 'a-2', label: '음수', value: -4 }, { id: 'a-2-2', label: '4', value: 3 }])
    expect(input[1].id).toBe('a')
    expect(normalizeChartData(null)).toEqual([])
    expect(normalizeChartData([Object.create({ value: 4 }), { value: Infinity }, { value: '3' }])).toEqual([])
  })
})

describe('native cartesian geometry', () => {
  it('includes a real zero baseline for positive, negative, mixed and zero-only data', () => {
    expect(chartDomain([3, 9])).toEqual({ min: 0, max: 9 })
    expect(chartDomain([-3, -9])).toEqual({ min: -9, max: 0 })
    expect(chartDomain([-3, 9])).toEqual({ min: -3, max: 9 })
    expect(chartDomain([0, 0])).toEqual({ min: 0, max: 1 })
    expect(chartDomain([])).toEqual({ min: 0, max: 1 })
  })
  it('gives a flat sparkline a valid domain without forcing unrelated zero', () => {
    expect(chartDomain([20, 20], false)).toEqual({ min: 19, max: 21 })
    expect(chartDomain([0], false)).toEqual({ min: -1, max: 1 })
    expect(chartDomain([Number.MAX_VALUE], false).min).toBeLessThan(Number.MAX_VALUE)
  })
  it('keeps extreme finite domains and pixel coordinates finite', () => {
    const data = normalizeChartData([{ id: 'min', label: '최저', value: -Number.MAX_VALUE }, { id: 'max', label: '최고', value: Number.MAX_VALUE }])
    const layout = chartCoordinates(data, 320, 200)
    expect(layout.points.map((point) => point.y)).toEqual([172, 12])
    expect(layout.baseline).toBe(92)
    expect(scaleChartValue(NaN, { min: 0, max: 1 }, 10, 20)).toBe(15)
    expect(layout.points.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true)
  })
  it('centers a single point and makes a closed area anchored to the zero baseline', () => {
    const data = normalizeChartData([{ id: 'only', label: '하나', value: 4 }])
    const layout = chartCoordinates(data, 320, 200)
    expect(layout.points[0].x).toBe(180)
    expect(chartLinePath(layout.points)).toBe('M180 12')
    expect(chartAreaPath(layout.points, layout.baseline)).toBe('M180 12 L180 172 L180 172 Z')
    expect(chartAreaPath([], 0)).toBe('')
  })
  it('fits a short sparkline to its actual viewport rather than forcing chart-sized height', () => {
    const data = normalizeChartData([{ value: 1 }, { value: 3 }])
    const layout = chartCoordinates(data, 48, 32, false, { left: 4, right: 4, top: 4, bottom: 4 })
    expect(layout.points.map(({ x, y }) => ({ x, y }))).toEqual([{ x: 4, y: 28 }, { x: 44, y: 4 }])
  })
})

describe('native donut geometry', () => {
  it('excludes nonpositive values while preserving the exact positive shares', () => {
    const data = normalizeChartData([{ id: 'a', label: 'A', value: 3 }, { id: 'b', label: 'B', value: 1 }, { id: 'zero', label: '영', value: 0 }, { id: 'negative', label: '음수', value: -2 }])
    const segments = donutSegments(data)
    expect(segments.map(({ ratio, startAngle, endAngle }) => ({ ratio, startAngle, endAngle }))).toEqual([{ ratio: .75, startAngle: 0, endAngle: 270 }, { ratio: .25, startAngle: 270, endAngle: 360 }])
    expect(donutSegments(data.slice(2))).toEqual([])
  })
  it('normalizes large totals without overflowing to Infinity or losing the full circle', () => {
    const segments = donutSegments([{ id: 'a', label: 'A', value: Number.MAX_VALUE }, { id: 'b', label: 'B', value: Number.MAX_VALUE }])
    expect(segments.map((segment) => segment.ratio)).toEqual([.5, .5])
    expect(segments.at(-1)?.endAngle).toBe(360)
  })
  it('draws a full circle using two arcs and safely handles invalid or empty slices', () => {
    const circle = donutArcPath(50, 50, 40, 0, 360)
    expect(circle).toBe('M50 10 A40 40 0 1 1 50 90 A40 40 0 1 1 50 10')
    expect(donutArcPath(50, 50, 40, 0, 90)).toContain(' 0 0 1 ')
    expect(donutArcPath(50, 50, 40, 0, 270)).toContain(' 0 1 1 ')
    expect(donutArcPath(0, 0, -4, 0, 90)).toBe('')
    expect(donutArcPath(0, 0, 4, 0, NaN)).toBe('')
    expect(donutArcPath(0, 0, 4, 90, 90)).toBe('')
  })
  it('formats axis extremes compactly and never exposes NaN', () => {
    expect(formatChartValue(1250)).toBe('1,250')
    expect(formatChartValue(Number.MAX_VALUE)).toBe('1.8e+308')
    expect(formatChartValue(NaN)).toBe('—')
  })
})
