import type { ChartType } from '../ui/chart'

export const SIM_CHART_TYPES = ['bar', 'line', 'area', 'donut'] as const satisfies readonly ChartType[]

export function getSimChartType(value: string): ChartType {
  return SIM_CHART_TYPES.includes(value as ChartType) ? value as ChartType : 'bar'
}

export interface SimChartData {
  data: { label: string; value: number }[]
  /** One-based source line numbers, including any blank lines before them. */
  invalidRows: number[]
}

const plainNumber = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/
const groupedNumber = /^[+-]?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/

/** Reads the same portable label | value rows used by the inspector. */
export function parseSimChartData(options: readonly string[], type: ChartType = 'bar'): SimChartData {
  const result: SimChartData = { data: [], invalidRows: [] }
  options.forEach((source, index) => {
    if (!source.trim()) return
    const cells = source.split('|')
    const label = cells[0]?.trim() ?? ''
    const rawValue = cells[1]?.trim() ?? ''
    const numeric = plainNumber.test(rawValue) || groupedNumber.test(rawValue)
    const value = numeric ? Number(rawValue.replaceAll(',', '')) : NaN
    if (index >= 30 || cells.length !== 2 || !label || label.length > 100 || !Number.isFinite(value) || (type === 'donut' && value < 0)) {
      result.invalidRows.push(index + 1)
      return
    }
    result.data.push({ label, value: Object.is(value, -0) ? 0 : value })
  })
  return result
}
