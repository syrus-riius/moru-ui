import { describe, expect, it } from 'vitest'
import { getSimChartType, parseSimChartData, SIM_CHART_TYPES } from './simulator-chart-data'

describe('simulator chart data', () => {
  it('recognizes the four basic variants and keeps older values usable', () => {
    expect(SIM_CHART_TYPES.map(getSimChartType)).toEqual(['bar', 'line', 'area', 'donut'])
    expect(getSimChartType('')).toBe('bar')
    expect(getSimChartType('unknown')).toBe('bar')
  })

  it('reads trimmed labels and finite numbers without modifying the source', () => {
    const source = Object.freeze(['  월 | 24 ', '화 | -3.5', '수 | +.75', '목 | 0'])
    expect(parseSimChartData(source)).toEqual({ data: [
      { label: '월', value: 24 }, { label: '화', value: -3.5 },
      { label: '수', value: .75 }, { label: '목', value: 0 },
    ], invalidRows: [] })
    expect(source[0]).toBe('  월 | 24 ')
  })

  it('accepts properly grouped thousands and rejects ambiguous comma placement', () => {
    expect(parseSimChartData(['방문 | 1,200', '매출 | -12,340.5', '오류 | 12,34', '오류 | 1,2345', '오류 | ,100']))
      .toEqual({ data: [{ label: '방문', value: 1200 }, { label: '매출', value: -12340.5 }], invalidRows: [3, 4, 5] })
  })

  it('ignores blank lines while keeping source row numbers in error messages', () => {
    expect(parseSimChartData(['', '월 | 12', '  ', '잘못된 행', '화 | 14']))
      .toEqual({ data: [{ label: '월', value: 12 }, { label: '화', value: 14 }], invalidRows: [4] })
  })

  it('rejects missing cells, extra separators, non-numeric and non-finite values', () => {
    const result = parseSimChartData(['| 12', '이름 |', '이름', '이름 | 12 | 13', 'NaN | NaN', '무한 | Infinity', '16진수 | 0xff', '과대 | ' + '9'.repeat(400)])
    expect(result.data).toEqual([])
    expect(result.invalidRows).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('allows zero for donut charts but identifies negative source rows', () => {
    expect(parseSimChartData(['디자인 | 50', '개발 | -5', '기타 | 0'], 'donut'))
      .toEqual({ data: [{ label: '디자인', value: 50 }, { label: '기타', value: 0 }], invalidRows: [2] })
    expect(parseSimChartData(['증감 | -5'], 'line').data[0].value).toBe(-5)
  })

  it('bounds labels and source rows for compact charts', () => {
    const entries = Array.from({ length: 31 }, (_, index) => `항목 ${index + 1} | ${index}`)
    const result = parseSimChartData(entries)
    expect(result.data).toHaveLength(30)
    expect(result.invalidRows).toEqual([31])
    expect(parseSimChartData([`${'가'.repeat(101)} | 1`, `${'나'.repeat(100)} | 2`]).invalidRows).toEqual([1])
  })

  it('returns a deliberate empty dataset for missing rows and normalizes negative zero', () => {
    expect(parseSimChartData([])).toEqual({ data: [], invalidRows: [] })
    expect(parseSimChartData(['  '])).toEqual({ data: [], invalidRows: [] })
    expect(Object.is(parseSimChartData(['값 | -0']).data[0].value, -0)).toBe(false)
  })
})
