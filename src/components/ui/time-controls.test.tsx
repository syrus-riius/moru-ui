import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Field } from './field'
import { TimePicker } from './time-picker'
import { TimeRangePicker } from './time-range-picker'
import { formatTime, getAvailableMinutes, getTimeRangeDuration, getTimeRangeError, getTimeValidationError, isTimeWithinBounds, normalizeTime, normalizeTimeRange, normalizeTimeStep, parseTime, subscribeTimeFormReset, wrapTimeOptionIndex } from './time-utils'

const tags = (markup: string, tag: string) => [...markup.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))].map((match) => match[0])
const attr = (tag: string, name: string) => tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1]

describe('wall-clock parsing and minute constraints', () => {
  it('accepts only complete, zero-padded HH:mm values without Date conversion', () => {
    expect(parseTime('00:00')).toBe(0)
    expect(parseTime('23:59')).toBe(1439)
    for (const value of ['9:05', '24:00', '12:60', '12:30:00', '12:00Z', '', null, undefined]) expect(parseTime(value)).toBeNull()
    expect(normalizeTime('09:05')).toBe('09:05')
    expect(normalizeTime('24:00')).toBeNull()
    expect(formatTime(1439)).toBe('23:59')
    expect(formatTime(1440)).toBeNull()
    expect(formatTime(1.5)).toBeNull()
  })
  it('uses min as step base and keeps invalid imported values visible to validation', () => {
    expect(getTimeValidationError('09:10', { min: '09:10', step: 15 })).toBeNull()
    expect(getTimeValidationError('09:25', { min: '09:10', step: 15 })).toBeNull()
    expect(getTimeValidationError('09:15', { min: '09:10', step: 15 })).toContain('15분')
    expect(getTimeValidationError('08:00', { min: '09:00', max: '18:00' })).toContain('09:00–18:00')
    expect(getTimeValidationError('99:00')).toContain('HH:mm')
    expect(getTimeValidationError(null)).toBeNull()
  })
  it('supports the native periodic interval across midnight for a single time', () => {
    expect(isTimeWithinBounds('23:00', { min: '22:00', max: '02:00' })).toBe(true)
    expect(isTimeWithinBounds('01:00', { min: '22:00', max: '02:00' })).toBe(true)
    expect(isTimeWithinBounds('12:00', { min: '22:00', max: '02:00' })).toBe(false)
  })
  it('generates only available minute choices and bounds malformed step configuration', () => {
    expect(getAvailableMinutes(9, { min: '09:10', max: '10:00', step: 15 })).toEqual([10, 25, 40, 55])
    expect(getAvailableMinutes(8, { min: '09:10', max: '10:00', step: 15 })).toEqual([])
    expect(getAvailableMinutes(10, { min: '09:10', max: '10:00', step: 15 })).toEqual([])
    expect(getAvailableMinutes(24)).toEqual([])
    expect([normalizeTimeStep(0), normalizeTimeStep(100), normalizeTimeStep(5.8), normalizeTimeStep(NaN)]).toEqual([1, 60, 5, 1])
  })
  it('wraps short grids correctly when a vertical arrow moves by more than the option count', () => {
    expect(wrapTimeOptionIndex(-4, 3)).toBe(2)
    expect(wrapTimeOptionIndex(-8, 3)).toBe(1)
    expect(wrapTimeOptionIndex(7, 3)).toBe(1)
    expect(wrapTimeOptionIndex(4, 0)).toBe(0)
  })
})

describe('time range policy', () => {
  it('preserves partial selection and rejects backwards same-day or zero-length ranges', () => {
    expect(normalizeTimeRange({ start: '09:00', end: null })).toEqual({ start: '09:00', end: null })
    expect(normalizeTimeRange({ start: 'wrong', end: '10:00' })).toEqual({ start: null, end: '10:00' })
    expect(getTimeRangeError({ start: '10:00', end: '09:00' })).toContain('늦어야')
    expect(getTimeRangeDuration({ start: '10:00', end: '09:00' })).toBeNull()
    expect(getTimeRangeError({ start: '09:00', end: '09:00' }, true)).toContain('다르게')
    expect(getTimeRangeDuration({ start: '09:00', end: '09:00' }, true)).toBeNull()
  })
  it('calculates next-day duration only after explicit overnight opt-in', () => {
    expect(getTimeRangeDuration({ start: '22:00', end: '02:30' }, true)).toBe(270)
    expect(getTimeRangeError({ start: '22:00', end: '02:30' }, true)).toBeNull()
    expect(getTimeRangeDuration({ start: '09:00', end: '10:30' })).toBe(90)
    expect(getTimeRangeDuration({ start: '09:00', end: null })).toBeNull()
  })
})

describe('time form and accessibility semantics', () => {
  it('keeps one visible native time input with minute step serialized as seconds', () => {
    const html = renderToStaticMarkup(<TimePicker label="시간" name="meeting" defaultValue="09:15" min="09:00" max="18:00" step={15} required form="schedule" />)
    const input = tags(html, 'input')[0]
    expect(tags(html, 'input')).toHaveLength(1)
    expect(attr(input, 'type')).toBe('time')
    expect(attr(input, 'value')).toBe('09:15')
    expect(attr(input, 'step')).toBe('900')
    expect(attr(input, 'min')).toBe('09:00')
    expect(attr(input, 'max')).toBe('18:00')
    expect(attr(input, 'name')).toBe('meeting')
    expect(attr(input, 'form')).toBe('schedule')
    expect(input).toContain('required=""')
    expect(html).toContain(`for="${attr(input, 'id')}"`)
    expect(html).toContain('aria-label="시간 선택 열기"')
  })
  it('connects enclosing Field labels, helper and error to the actual time input', () => {
    const html = renderToStaticMarkup(<Field label="회의 시작" description="15분 간격" error="시간을 확인하세요."><TimePicker name="time" /></Field>)
    const input = tags(html, 'input')[0]
    expect(html).toContain(`for="${attr(input, 'id')}"`)
    expect(attr(input, 'aria-describedby')?.split(' ')).toHaveLength(2)
    expect(attr(input, 'aria-invalid')).toBe('true')
  })
  it('submits a read-only value while keeping disabled controls unavailable', () => {
    const readOnly = tags(renderToStaticMarkup(<TimePicker defaultValue="09:00" name="readonly" readOnly />), 'input')[0]
    expect(readOnly).toContain('readOnly=""')
    expect(readOnly).not.toContain('disabled=""')
    const disabled = renderToStaticMarkup(<TimePicker defaultValue="09:00" disabled />)
    expect(tags(disabled, 'input')[0]).toContain('disabled=""')
    expect(tags(disabled, 'button').every((button) => button.includes('disabled=""'))).toBe(true)
  })
  it('gives paired fields distinct names and stable labels inside a single-control Field', () => {
    const html = renderToStaticMarkup(<Field label="회의 시간" description="협업 가능한 시간"><TimeRangePicker name="session" defaultValue={{ start: '09:00', end: '10:30' }} required /></Field>)
    const inputs = tags(html, 'input')
    expect(inputs).toHaveLength(2)
    expect(inputs.map((input) => attr(input, 'name'))).toEqual(['session.start', 'session.end'])
    expect(new Set(inputs.map((input) => attr(input, 'id'))).size).toBe(2)
    expect(inputs.every((input) => input.includes('required=""'))).toBe(true)
    for (const input of inputs) expect(html).toContain(`for="${attr(input, 'id')}"`)
    for (const input of inputs) expect(attr(input, 'aria-labelledby')?.split(' ')).toHaveLength(2)
    expect(html).toContain('총 1시간 30분 · 같은 날')
  })
  it('requires the missing half of a partial optional pair and exposes reversed-range errors', () => {
    const partial = tags(renderToStaticMarkup(<TimeRangePicker defaultValue={{ start: '09:00', end: null }} />), 'input')
    expect(partial[0]).not.toContain('required=""')
    expect(partial[1]).toContain('required=""')
    const html = renderToStaticMarkup(<TimeRangePicker startName="from" endName="to" defaultValue={{ start: '11:00', end: '10:00' }} />)
    expect(tags(html, 'input').map((input) => attr(input, 'name'))).toEqual(['from', 'to'])
    expect(tags(html, 'input')[1]).toContain('aria-invalid="true"')
    expect(html).toContain('종료 시간은 시작 시간보다 늦어야 해요.')
  })
  it('makes next-day interpretation explicit instead of silently swapping values', () => {
    const html = renderToStaticMarkup(<TimeRangePicker allowOvernight defaultValue={{ start: '22:00', end: '02:00' }} />)
    expect(tags(html, 'input').map((input) => attr(input, 'value'))).toEqual(['22:00', '02:00'])
    expect(html).toContain('총 4시간 · 다음 날 종료')
  })
})

describe('cancellable native form reset scheduling', () => {
  it('waits for later handlers and respects cancelled resets', async () => {
    const target = new EventTarget(); let resets = 0
    const cleanup = subscribeTimeFormReset(target, () => { resets++ })
    target.addEventListener('reset', (event) => event.preventDefault())
    target.dispatchEvent(new Event('reset', { cancelable: true }))
    await Promise.resolve()
    expect(resets).toBe(0); cleanup()
  })
  it('runs once for a normal reset and cancels pending work on unmount', async () => {
    const target = new EventTarget(); let resets = 0
    const cleanup = subscribeTimeFormReset(target, () => { resets++ })
    target.dispatchEvent(new Event('reset')); await Promise.resolve(); expect(resets).toBe(1)
    target.dispatchEvent(new Event('reset')); cleanup(); await Promise.resolve(); expect(resets).toBe(1)
  })
})
