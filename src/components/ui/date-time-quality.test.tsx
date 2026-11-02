import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DatePicker } from './date-picker'
import { DateRangePicker } from './date-range-picker'
import { TimePicker } from './time-picker'
import { TimeRangePicker } from './time-range-picker'
import { Field } from './field'
import { createCalendarDate } from './calendar-utils'

const tags = (html: string, tag: string) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))].map((match) => match[0])
const attr = (tag: string, name: string) => tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1]
const date = createCalendarDate(2026, 9, 30)

describe('date and time loading contracts', () => {
  it.each([
    ['DatePicker', <DatePicker loading name="date" defaultValue={date} />],
    ['DateRangePicker', <DateRangePicker loading name="dates" defaultValue={{ start: date, end: date }} />],
    ['TimePicker', <TimePicker loading name="time" defaultValue="09:00" />],
    ['TimeRangePicker', <TimeRangePicker loading name="times" defaultValue={{ start: '09:00', end: '10:00' }} />],
  ])('%s blocks native submission and actions while exposing busy state', (_name, component) => {
    const html = renderToStaticMarkup(component)
    const inputs = tags(html, 'input')
    const buttons = tags(html, 'button')
    expect(inputs.length).toBeGreaterThan(0)
    expect(buttons.length).toBeGreaterThan(0)
    expect(inputs.every((tag) => tag.includes('disabled=""'))).toBe(true)
    expect(buttons.every((tag) => tag.includes('disabled=""'))).toBe(true)
    expect(html).toContain('aria-busy="true"')
    expect(html).toContain('class="ui-loading-indicator"')
    expect(inputs.every((tag) => Boolean(attr(tag, 'value')))).toBe(true)
    expect(html).not.toMatch(/\sloading="/)
  })
})

describe('explicit accessible names in date and time fields', () => {
  it.each([
    ['DatePicker', <DatePicker aria-label="공개 일정" />],
    ['DateRangePicker', <DateRangePicker aria-label="공개 일정" />],
  ])('%s lets aria-label override an enclosing Field label', (_name, component) => {
    const html = renderToStaticMarkup(<Field label="내부 필드" error="확인하세요">{component}</Field>)
    const button = tags(html, 'button')[0]
    expect(attr(button, 'aria-label')).toBe('공개 일정')
    expect(attr(button, 'aria-labelledby')).toBeUndefined()
    expect(attr(button, 'aria-describedby')).toBeTruthy()
    expect(attr(button, 'aria-invalid')).toBe('true')
  })
  it('TimePicker keeps explicit aria-label authoritative over visible and enclosing labels', () => {
    const html = renderToStaticMarkup(<Field label="내부 필드" description="안내"><TimePicker label="시간" aria-label="회의 시작 시각" /></Field>)
    const input = tags(html, 'input')[0]
    expect(attr(input, 'aria-label')).toBe('회의 시작 시각')
    expect(attr(input, 'aria-labelledby')).toBeUndefined()
    expect(attr(input, 'aria-describedby')).toBeTruthy()
  })
  it('preserves explicit aria-labelledby precedence over aria-label', () => {
    const html = renderToStaticMarkup(<Field label="내부 필드"><TimePicker aria-label="대체" aria-labelledby="external-label" /></Field>)
    expect(attr(tags(html, 'input')[0], 'aria-labelledby')).toBe('external-label')
  })
  it('TimeRangePicker names the group independently while retaining endpoint labels', () => {
    const html = renderToStaticMarkup(<Field label="내부 필드"><TimeRangePicker aria-label="예약 시간 범위" /></Field>)
    const group = tags(html, 'div').find((tag) => tag.includes('class="ui-time-range-picker"'))!
    expect(attr(group, 'aria-label')).toBe('예약 시간 범위')
    expect(attr(group, 'aria-labelledby')).toBeUndefined()
    expect(tags(html, 'input').every((tag) => Boolean(attr(tag, 'aria-labelledby')))).toBe(true)
  })
})
