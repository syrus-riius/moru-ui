import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DateRangePicker } from './date-range-picker'
import { dateRangeFieldNames, getDateRangeFormValues, getDateRangeIssue, getDateRangeNativeBounds, normalizeDateRange } from './date-range-picker-utils'
import { calendarDateKey, createCalendarDate } from './calendar-utils'
import { Field } from './field'

const start = createCalendarDate(2026, 9, 27)
const end = createCalendarDate(2026, 10, 3)
const empty = { start: null, end: null }
const tags = (markup: string, tag: string) => [...markup.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))].map((match) => match[0])
const attribute = (tag: string, name: string) => tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1]

describe('date range validation and serialization', () => {
  it('distinguishes an optional empty range from a required empty range', () => {
    expect(getDateRangeIssue(empty)).toBeNull()
    expect(getDateRangeIssue(empty, { required: true })).toMatchObject({ kind: 'missing' })
    expect(getDateRangeFormValues(empty)).toEqual({ start: '', end: '' })
  })
  it('requires both endpoints when either side has been selected', () => {
    expect(getDateRangeIssue({ start, end: null })).toMatchObject({ kind: 'missing', message: '종료일을 선택해 주세요.' })
    expect(getDateRangeIssue({ start: null, end })).toMatchObject({ kind: 'missing', message: '시작일을 선택해 주세요.' })
  })
  it('keeps reversed controlled data intact and flags its ordering', () => {
    const value = { start: end, end: start }
    expect(getDateRangeIssue(value)?.kind).toBe('order')
    expect(getDateRangeFormValues(normalizeDateRange(value))).toEqual({ start: '2026-11-03', end: '2026-10-27' })
  })
  it('accepts same-day ranges and both inclusive date bounds', () => {
    expect(getDateRangeIssue({ start, end: start }, { minDate: start, maxDate: end })).toBeNull()
    expect(getDateRangeIssue({ start, end }, { minDate: start, maxDate: end })).toBeNull()
  })
  it('rejects either endpoint outside the allowed dates and reversed bounds', () => {
    expect(getDateRangeIssue({ start, end }, { minDate: createCalendarDate(2026, 9, 28) })?.kind).toBe('bounds')
    expect(getDateRangeIssue({ start, end }, { maxDate: createCalendarDate(2026, 10, 2) })?.kind).toBe('bounds')
    expect(getDateRangeIssue({ start, end }, { minDate: end, maxDate: start })?.kind).toBe('bounds')
  })
  it('rejects invalid Date objects instead of serializing NaN dates', () => {
    expect(getDateRangeIssue({ start: new Date(NaN), end })?.kind).toBe('invalid')
    expect(getDateRangeIssue({ start, end: new Date(NaN) })?.kind).toBe('invalid')
    expect(getDateRangeFormValues({ start: new Date(NaN), end })).toEqual({ start: '', end: '2026-11-03' })
  })
  it('uses local date fields across a DST boundary and preserves early Gregorian years', () => {
    expect(getDateRangeFormValues({ start: createCalendarDate(2026, 2, 7), end: createCalendarDate(2026, 2, 9) })).toEqual({ start: '2026-03-07', end: '2026-03-09' })
    expect(getDateRangeFormValues({ start: createCalendarDate(1, 0, 1), end: createCalendarDate(1, 0, 2) })).toEqual({ start: '0001-01-01', end: '0001-01-02' })
  })
  it('normalizes times without mutating the original Date objects', () => {
    const original = new Date(2026, 9, 27, 23, 45)
    const result = normalizeDateRange({ start: original, end })
    expect(result.start).not.toBe(original)
    expect(result.start?.getHours()).toBe(0)
    expect(original.getHours()).toBe(23)
    expect(calendarDateKey(result.start)).toBe('2026-10-27')
  })
  it('supports predictable grouped form names and explicit endpoint overrides', () => {
    expect(dateRangeFieldNames('period')).toEqual({ start: 'period.start', end: 'period.end' })
    expect(dateRangeFieldNames('period', 'check-in', 'check-out')).toEqual({ start: 'check-in', end: 'check-out' })
    expect(dateRangeFieldNames()).toEqual({ start: undefined, end: undefined })
  })
  it('encodes cross-endpoint constraints and retains stricter application bounds', () => {
    expect(getDateRangeNativeBounds({ start, end })).toEqual({ startMin: undefined, startMax: '2026-11-03', endMin: '2026-10-27', endMax: undefined })
    expect(getDateRangeNativeBounds({ start, end }, end, start)).toEqual({ startMin: '2026-11-03', startMax: '2026-10-27', endMin: '2026-11-03', endMax: '2026-10-27' })
  })
})

describe('DateRangePicker native form and accessibility contracts', () => {
  it('submits two validating date-only controls with external form and bounds', () => {
    const markup = renderToStaticMarkup(<DateRangePicker label="예약 기간" name="period" defaultValue={{ start, end }} form="booking" required minDate={start} maxDate={end} />)
    const inputs = tags(markup, 'input')
    expect(inputs).toHaveLength(2)
    expect(inputs.map((input) => attribute(input, 'name'))).toEqual(['period.start', 'period.end'])
    expect(inputs.map((input) => attribute(input, 'value'))).toEqual(['2026-10-27', '2026-11-03'])
    for (const input of inputs) {
      expect(input).toContain('type="date"')
      expect(input).toContain('required=""')
      expect(attribute(input, 'form')).toBe('booking')
      expect(attribute(input, 'min')).toBe('2026-10-27')
      expect(attribute(input, 'max')).toBe('2026-11-03')
      expect(input).toContain('aria-hidden="true"')
      expect(input).toContain('tabindex="-1"')
    }
  })
  it('leaves an optional empty range valid but requires completion after a first date', () => {
    const emptyMarkup = renderToStaticMarkup(<DateRangePicker name="period" />)
    expect(tags(emptyMarkup, 'input').every((input) => !input.includes('required=""'))).toBe(true)
    const partialMarkup = renderToStaticMarkup(<DateRangePicker name="period" value={{ start, end: null }} />)
    expect(tags(partialMarkup, 'input').every((input) => input.includes('required=""'))).toBe(true)
    expect(partialMarkup).toContain('종료일 선택')
  })
  it('connects the visible trigger to Field label, helper and errors', () => {
    const markup = renderToStaticMarkup(<Field label="프로젝트 기간" description="일정을 확인하세요." error="기간을 선택하세요."><DateRangePicker name="period" required /></Field>)
    const trigger = tags(markup, 'button')[0]
    expect(attribute(tags(markup, 'label')[0], 'for')).toBe(attribute(trigger, 'id'))
    expect(attribute(trigger, 'aria-invalid')).toBe('true')
    expect(attribute(trigger, 'aria-describedby')?.split(' ').length).toBeGreaterThanOrEqual(4)
    expect(attribute(trigger, 'aria-haspopup')).toBe('dialog')
  })
  it('respects a controlled empty value instead of restoring default endpoints', () => {
    const markup = renderToStaticMarkup(<DateRangePicker name="period" value={empty} defaultValue={{ start, end }} />)
    expect(tags(markup, 'input').map((input) => attribute(input, 'value'))).toEqual(['', ''])
    expect(markup).not.toContain('2026년 10월 27일')
    const nullMarkup = renderToStaticMarkup(<DateRangePicker name="period" value={null} defaultValue={{ start, end }} />)
    expect(tags(nullMarkup, 'input').map((input) => attribute(input, 'value'))).toEqual(['', ''])
  })
  it('keeps read-only values submittable while disabling picker activation', () => {
    const markup = renderToStaticMarkup(<DateRangePicker name="period" value={{ start, end }} readOnly />)
    expect(tags(markup, 'input').every((input) => input.includes('readOnly=""') && !input.includes('disabled=""'))).toBe(true)
    expect(tags(markup, 'button')[0]).toContain('aria-disabled="true"')
  })
  it('disables both actual submitted controls and the visible trigger', () => {
    const markup = renderToStaticMarkup(<DateRangePicker name="period" disabled defaultValue={{ start, end }} />)
    expect(tags(markup, 'input').every((input) => input.includes('disabled=""'))).toBe(true)
    expect(tags(markup, 'button')[0]).toContain('disabled=""')
  })
  it('visibly flags reversed controlled values without silently changing form values', () => {
    const markup = renderToStaticMarkup(<DateRangePicker name="period" value={{ start: end, end: start }} />)
    expect(tags(markup, 'button')[0]).toContain('aria-invalid="true"')
    expect(markup).toContain('종료일은 시작일과 같거나 이후여야 합니다.')
    expect(tags(markup, 'input').map((input) => attribute(input, 'value'))).toEqual(['2026-11-03', '2026-10-27'])
  })
  it('passes common sizes and endpoint names without adding duplicate form fields', () => {
    const markup = renderToStaticMarkup(<DateRangePicker label="휴가" name="period" startName="from" endName="to" size="lg" />)
    expect(tags(markup, 'button')[0]).toContain('data-size="lg"')
    expect(tags(markup, 'input').map((input) => attribute(input, 'name'))).toEqual(['from', 'to'])
  })
  it('falls back safely for malformed locales and preserves full selected date labels', () => {
    const markup = renderToStaticMarkup(<DateRangePicker label="기간" defaultValue={{ start, end }} locale="not_a_valid_locale" />)
    expect(markup).toContain('2026년 10월 27일')
    expect(markup).toContain('2026년 11월 3일')
  })
})
