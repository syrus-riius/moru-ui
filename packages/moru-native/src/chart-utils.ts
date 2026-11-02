export type NativeChartDatum = { id: string; label: string; value: number }
export type ChartDomain = { min: number; max: number }
export type ChartPoint = NativeChartDatum & { x: number; y: number }

/** Keep only finite numeric values; return fresh entries and stable, unique keys. */
export function normalizeChartData(input: unknown): NativeChartDatum[] {
  if (!Array.isArray(input)) return []
  const keys = new Set<string>()
  return input.flatMap((entry, index) => {
    if (!entry || typeof entry !== 'object' || !Object.prototype.hasOwnProperty.call(entry, 'value')) return []
    const value = entry.value
    if (typeof value !== 'number' || !Number.isFinite(value)) return []
    const base = typeof entry.id === 'string' && entry.id.trim() ? entry.id.trim() : `point-${index}`
    let id = base
    let suffix = 2
    while (keys.has(id)) id = `${base}-${suffix++}`
    keys.add(id)
    return [{ id, label: typeof entry.label === 'string' && entry.label.trim() ? entry.label.trim() : `${index + 1}`, value }]
  })
}

export function chartDomain(values: readonly number[], includeZero = true): ChartDomain {
  const finite = values.filter(Number.isFinite)
  if (!finite.length) return { min: 0, max: 1 }
  let min = includeZero ? 0 : finite[0]
  let max = includeZero ? 0 : finite[0]
  for (const value of finite) { min = Math.min(min, value); max = Math.max(max, value) }
  if (min === max) {
    if (min === 0) return includeZero ? { min: 0, max: 1 } : { min: -1, max: 1 }
    const padding = Math.abs(min) * .05 || 1
    const below = min - padding
    const above = max + padding
    min = Number.isFinite(below) ? below : min
    max = Number.isFinite(above) ? above : max
  }
  return { min, max }
}

/** Avoid overflow when the domain spans -Number.MAX_VALUE through Number.MAX_VALUE. */
export function scaleChartValue(value: number, domain: ChartDomain, start: number, end: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(domain.min) || !Number.isFinite(domain.max) || domain.max <= domain.min) return (start + end) / 2
  const range = domain.max - domain.min
  const magnitude = Math.max(Math.abs(domain.min), Math.abs(domain.max)) || 1
  const ratio = Number.isFinite(range)
    ? (value - domain.min) / range
    : (value / magnitude - domain.min / magnitude) / (domain.max / magnitude - domain.min / magnitude)
  return start + Math.max(0, Math.min(1, ratio)) * (end - start)
}

export function chartCoordinates(data: readonly NativeChartDatum[], width: number, height: number, includeZero = true, padding = { left: 52, right: 12, top: 12, bottom: 28 }) {
  const safeWidth = Number.isFinite(width) ? Math.max(1, width) : 320
  const safeHeight = Number.isFinite(height) ? Math.max(1, height) : 200
  const plot = {
    left: padding.left, right: Math.max(padding.left + 1, safeWidth - padding.right),
    top: padding.top, bottom: Math.max(padding.top + 1, safeHeight - padding.bottom),
  }
  const domain = chartDomain(data.map((item) => item.value), includeZero)
  const points = data.map((item, index) => ({
    ...item,
    x: data.length === 1 ? (plot.left + plot.right) / 2 : plot.left + (plot.right - plot.left) * index / Math.max(1, data.length - 1),
    y: scaleChartValue(item.value, domain, plot.bottom, plot.top),
  }))
  return { points, domain, plot, baseline: scaleChartValue(0, domain, plot.bottom, plot.top) }
}

const coordinate = (value: number) => Number(value.toFixed(3))
export function chartLinePath(points: readonly Pick<ChartPoint, 'x' | 'y'>[]): string {
  return points.map((point, index) => `${index ? 'L' : 'M'}${coordinate(point.x)} ${coordinate(point.y)}`).join(' ')
}

export function chartAreaPath(points: readonly Pick<ChartPoint, 'x' | 'y'>[], baseline: number): string {
  if (!points.length) return ''
  return `${chartLinePath(points)} L${coordinate(points[points.length - 1].x)} ${coordinate(baseline)} L${coordinate(points[0].x)} ${coordinate(baseline)} Z`
}

export type DonutSegment = NativeChartDatum & { ratio: number; startAngle: number; endAngle: number }
export function donutSegments(data: readonly NativeChartDatum[]): DonutSegment[] {
  const positive = data.filter((item) => Number.isFinite(item.value) && item.value > 0)
  if (!positive.length) return []
  let largest = 0
  for (const item of positive) largest = Math.max(largest, item.value)
  const total = positive.reduce((sum, item) => sum + item.value / largest, 0)
  let angle = 0
  return positive.map((item, index) => {
    const ratio = item.value / largest / total
    const startAngle = angle
    angle = index === positive.length - 1 ? 360 : Math.min(360, angle + ratio * 360)
    return { ...item, ratio, startAngle, endAngle: angle }
  })
}

export function donutArcPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number): string {
  if (![cx, cy, radius, startAngle, endAngle].every(Number.isFinite) || radius <= 0 || endAngle <= startAngle) return ''
  const angle = Math.min(360, endAngle - startAngle)
  const point = (degrees: number) => ({ x: coordinate(cx + radius * Math.cos((degrees - 90) * Math.PI / 180)), y: coordinate(cy + radius * Math.sin((degrees - 90) * Math.PI / 180)) })
  const start = point(startAngle)
  const end = point(startAngle + angle)
  if (angle >= 359.999999) {
    const middle = point(startAngle + 180)
    return `M${start.x} ${start.y} A${radius} ${radius} 0 1 1 ${middle.x} ${middle.y} A${radius} ${radius} 0 1 1 ${end.x} ${end.y}`
  }
  return `M${start.x} ${start.y} A${radius} ${radius} 0 ${angle > 180 ? 1 : 0} 1 ${end.x} ${end.y}`
}

export function formatChartValue(value: number): string {
  if (!Number.isFinite(value)) return '—'
  if (value !== 0 && (Math.abs(value) >= 1e12 || Math.abs(value) < .001)) return value.toExponential(1)
  return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 }).format(value)
}
