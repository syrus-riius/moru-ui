import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DatePicker } from './date-picker'
import { Field } from './field'
import { calendarDateKey, createCalendarDate } from './calendar-utils'
import { parseDatePickerFormValue, subscribeDatePickerFormReset } from './date-picker-form-utils'
import { AdvancedComponentDemo } from '../AdvancedComponentDemo'
import { ToastProvider } from './toast'

const tags = (markup: string, tag: string) => [...markup.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))].map((match) => match[0])
const attribute = (tag: string, name: string) => tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1]

describe('DatePicker date-only form values', () => {
  it('preserves local calendar fields without UTC serialization', () => {
    const date = parseDatePickerFormValue('2026-10-27')!
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 9, 27])
    expect(calendarDateKey(date)).toBe('2026-10-27')
  })
  it('validates leap days and rejects normalized rollover dates', () => {
    expect(calendarDateKey(parseDatePickerFormValue('2028-02-29'))).toBe('2028-02-29')
    expect(parseDatePickerFormValue('2026-02-29')).toBeNull()
    expect(parseDatePickerFormValue('2026-04-31')).toBeNull()
    expect(parseDatePickerFormValue('2026-13-01')).toBeNull()
  })
  it('preserves early Gregorian years rather than applying the Date constructor 1900 offset', () => {
    expect(parseDatePickerFormValue('0001-01-01')?.getFullYear()).toBe(1)
  })
  it('treats empty, partial, locale-formatted and UTC timestamp values as no native date', () => {
    for (const value of ['', '0000-01-01', '2026-1-2', '27/10/2026', '2026-10-27T00:00:00Z', 'not-a-date']) expect(parseDatePickerFormValue(value)).toBeNull()
  })
})

describe('DatePicker native form contracts', () => {
  it('uses a validating native date control rather than a nonvalidating hidden input', () => {
    const markup = renderToStaticMarkup(<DatePicker label="마감일" name="due" required defaultValue={createCalendarDate(2026, 9, 27)} minDate={createCalendarDate(2026, 9, 1)} maxDate={createCalendarDate(2026, 10, 30)} form="project-form" />)
    const input = tags(markup, 'input')[0]
    expect(input).toContain('type="date"')
    expect(attribute(input, 'name')).toBe('due')
    expect(attribute(input, 'value')).toBe('2026-10-27')
    expect(attribute(input, 'min')).toBe('2026-10-01')
    expect(attribute(input, 'max')).toBe('2026-11-30')
    expect(attribute(input, 'form')).toBe('project-form')
    expect(input).toContain('required=""')
    expect(input).not.toContain('type="hidden"')
  })
  it('retains visible trigger labelling while keeping the validation proxy out of the tab order', () => {
    const markup = renderToStaticMarkup(<Field label="마감일"><DatePicker name="due" required /></Field>)
    const trigger = tags(markup, 'button')[0]
    const input = tags(markup, 'input')[0]
    const label = tags(markup, 'label')[0]
    expect(attribute(label, 'for')).toBe(attribute(trigger, 'id'))
    expect(input).toContain('aria-hidden="true"')
    expect(input).toContain('tabindex="-1"')
    expect(markup).toContain('필수 항목.')
    expect(attribute(trigger, 'aria-describedby')).toBeTruthy()
    expect(attribute(trigger, 'aria-haspopup')).toBe('dialog')
  })
  it('keeps a read-only value submittable but makes opening the picker unavailable', () => {
    const markup = renderToStaticMarkup(<DatePicker label="확정 일정" name="confirmed" readOnly required value={createCalendarDate(2026, 9, 27)} />)
    const input = tags(markup, 'input')[0]
    const trigger = tags(markup, 'button')[0]
    expect(input).toContain('readOnly=""')
    expect(input).not.toContain('disabled=""')
    expect(input).toContain('value="2026-10-27"')
    expect(trigger).toContain('aria-disabled="true"')
    expect(trigger).not.toContain('disabled=""')
    expect(markup).toContain('읽기 전용.')
  })
  it('disables the native submitted control as well as the visible trigger', () => {
    const markup = renderToStaticMarkup(<DatePicker name="due" disabled defaultValue={createCalendarDate(2026, 9, 27)} />)
    expect(tags(markup, 'input')[0]).toContain('disabled=""')
    expect(tags(markup, 'button')[0]).toContain('disabled=""')
  })
  it('distinguishes a controlled empty selection from an uncontrolled initial date', () => {
    const markup = renderToStaticMarkup(<DatePicker name="due" value={null} defaultValue={createCalendarDate(2026, 9, 27)} />)
    expect(attribute(tags(markup, 'input')[0], 'value')).toBe('')
    expect(markup).not.toContain('2026년 10월 27일')
  })
  it('starts the catalog example with a real empty required form, submit and reset actions', () => {
    const markup = renderToStaticMarkup(<ToastProvider><AdvancedComponentDemo id="date-picker" disabled={false} size="md" /></ToastProvider>)
    const form = tags(markup, 'form')[0]
    const input = tags(markup, 'input').find((tag) => attribute(tag, 'name') === 'due')!
    expect(form).toContain('aria-label="마감일 제출 예제"')
    expect(input).toContain('value=""')
    expect(input).toContain('required=""')
    expect(tags(markup, 'button').some((tag) => attribute(tag, 'type') === 'submit')).toBe(true)
    expect(tags(markup, 'button').some((tag) => attribute(tag, 'type') === 'reset')).toBe(true)
    expect(markup).toContain('제출 전 · 날짜를 선택해 주세요.')
  })
})

describe('DatePicker reset event ordering', () => {
  it('restores after the form reset handlers have completed', async () => {
    const form = new EventTarget()
    const order: string[] = []
    const unsubscribe = subscribeDatePickerFormReset(form, () => order.push('restore'))
    form.addEventListener('reset', () => order.push('handler'))
    form.dispatchEvent(new Event('reset', { cancelable: true }))
    expect(order).toEqual(['handler'])
    await Promise.resolve()
    expect(order).toEqual(['handler', 'restore'])
    unsubscribe()
  })
  it('honors a reset canceled later during propagation', async () => {
    const form = new EventTarget()
    let called = false
    const unsubscribe = subscribeDatePickerFormReset(form, () => { called = true })
    form.addEventListener('reset', (event) => event.preventDefault())
    form.dispatchEvent(new Event('reset', { cancelable: true }))
    await Promise.resolve()
    expect(called).toBe(false)
    unsubscribe()
  })
  it('does not apply a queued reset after unmount', async () => {
    const form = new EventTarget()
    let called = false
    const unsubscribe = subscribeDatePickerFormReset(form, () => { called = true })
    form.dispatchEvent(new Event('reset', { cancelable: true }))
    unsubscribe()
    await Promise.resolve()
    expect(called).toBe(false)
  })
})
