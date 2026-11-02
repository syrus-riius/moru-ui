export type CalendarDay = { date: string; day: number; weekday: number }

export function isLeapYear(year: number): boolean {
  return Number.isInteger(year) && year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

/** Month is one-based. UTC keeps calendar labels stable across device time zones. */
export function calendarMonthCells(year: number, month: number): (CalendarDay | null)[] {
  if (!Number.isInteger(year) || year < 1 || year > 9999 || !Number.isInteger(month) || month < 1 || month > 12) return []
  const first = new Date(0)
  first.setUTCFullYear(year, month - 1, 1)
  first.setUTCHours(0, 0, 0, 0)
  const offset = (first.getUTCDay() + 6) % 7
  const days = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1]
  const count = Math.ceil((offset + days) / 7) * 7
  return Array.from({ length: count }, (_, index) => {
    const day = index - offset + 1
    return day < 1 || day > days ? null : {
      date: `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      day,
      weekday: index % 7,
    }
  })
}

export function progressValues(value: number, maximum = 100) {
  const max = Number.isFinite(maximum) && maximum > 0 ? maximum : 100
  const current = Math.min(max, Math.max(0, Number.isFinite(value) ? value : 0))
  return { value: current, max, fraction: current / max }
}

/** Values up to one are fractions of the usable screen; larger values are pixels. */
export function sheetDetentHeights(detents: readonly number[] | undefined, availableHeight: number): number[] {
  const available = Number.isFinite(availableHeight) && availableHeight > 0 ? Math.max(1, Math.floor(availableHeight)) : 800
  const minimum = Math.min(160, available)
  const normalize = (value: number) => Math.round(Math.max(minimum, Math.min(available, value <= 1 ? value * available : value)))
  const values = (detents?.length ? detents : [.45, .85])
    .filter((value) => Number.isFinite(value) && value > 0)
    .map(normalize)
  return [...new Set(values.length ? values : [.45, .85].map(normalize))].sort((a, b) => a - b)
}

export function closestDetent(value: number, heights: readonly number[]): number {
  if (!heights.length) return 0
  const safe = Number.isFinite(value) ? value : heights[0]
  return heights.reduce((best, height, index) => Math.abs(height - safe) < Math.abs(heights[best] - safe) ? index : best, 0)
}

/** Return the stronger of black and white after sRGB luminance conversion. */
export function readableOn(color: string, fallback = '#ffffff'): string {
  const normalized = /^#[\da-f]{3}$/i.test(color) ? `#${color.slice(1).split('').map((part) => part + part).join('')}` : color
  if (!/^#[\da-f]{6}$/i.test(normalized)) return fallback
  const channels = [1, 3, 5].map((index) => {
    const channel = parseInt(normalized.slice(index, index + 2), 16) / 255
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4
  })
  const luminance = channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722
  return (1.05 / (luminance + .05)) >= ((luminance + .05) / .05) ? '#ffffff' : '#000000'
}

/** Remove common decimal addition noise without stalling very small increments. */
export function steppedValue(current: number, increment: number, direction: number, lower: number, upper: number): number {
  const next = current + increment * direction
  const rounded = Number.isFinite(next) ? Number(next.toPrecision(15)) : next
  return Math.min(upper, Math.max(lower, rounded === current && next !== current ? next : rounded))
}
