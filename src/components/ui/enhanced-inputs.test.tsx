import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Field } from './field'
import { NumberInput, subscribeNumberInputFormReset } from './number-input'
import { PasswordInput } from './password-input'
import { MultiSelect, subscribeMultiSelectFormReset } from './multi-select'

const tags = (markup: string, tag: string) => [...markup.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))].map((match) => match[0])
const attribute = (tag: string, name: string) => tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1]
const items = [{ value: 'design', label: '디자인' }, { value: 'develop', label: '개발' }, { value: 'archive', label: '보관', disabled: true }]

describe('NumberInput numeric and accessible form contracts', () => {
  it('keeps formatted units out of submitted numeric values', () => {
    const markup = renderToStaticMarkup(<NumberInput name="hours" defaultValue={2.5} min={0} max={24} step={0.25} precision={2} locale="en-US" format={{ style: 'unit', unit: 'hour' }} aria-label="작업 시간" />)
    const inputs = tags(markup, 'input')
    const visible = inputs.find((input) => attribute(input, 'type') === 'text')!
    const submitted = inputs.find((input) => attribute(input, 'name') === 'hours')!
    expect(attribute(visible, 'aria-label')).toBe('작업 시간')
    expect(attribute(visible, 'value')).toContain('2.5')
    expect(attribute(submitted, 'value')).toBe('2.5')
    expect(submitted).toContain('min="0"')
    expect(submitted).toContain('max="24"')
  })
  it('distinguishes controlled empty values from zero', () => {
    const empty = renderToStaticMarkup(<NumberInput name="amount" value={null} hideControls aria-label="금액" />)
    const zero = renderToStaticMarkup(<NumberInput name="amount" value={0} hideControls aria-label="금액" />)
    expect(tags(empty, 'input').find((tag) => attribute(tag, 'name') === 'amount')).toContain('value=""')
    expect(tags(zero, 'input').find((tag) => attribute(tag, 'name') === 'amount')).toContain('value="0"')
    expect(empty).not.toContain('<button')
  })
  it('connects the visible number input to Field descriptions and validation', () => {
    const markup = renderToStaticMarkup(<Field label="참여 인원" description="1명 이상" error="인원을 입력하세요."><NumberInput /></Field>)
    const input = tags(markup, 'input').find((tag) => attribute(tag, 'type') === 'text')!
    expect(attribute(input, 'aria-invalid')).toBe('true')
    expect(attribute(input, 'aria-describedby')?.split(' ')).toHaveLength(2)
    expect(markup).toContain(`for="${attribute(input, 'id')}"`)
  })
  it('keeps read-only values in forms and disables both step controls', () => {
    const markup = renderToStaticMarkup(<NumberInput name="capacity" defaultValue={10} readOnly aria-label="정원" />)
    expect(tags(markup, 'button')).toHaveLength(2)
    expect(tags(markup, 'button').every((tag) => tag.includes('disabled=""'))).toBe(true)
    expect(tags(markup, 'input').find((tag) => attribute(tag, 'name') === 'capacity')).not.toContain('disabled=""')
  })
  it('sanitizes precision without constructing an invalid Intl formatter', () => {
    expect(() => renderToStaticMarkup(<NumberInput defaultValue={2.5} precision={-9} format={{ minimumFractionDigits: 5 }} />)).not.toThrow()
    expect(() => renderToStaticMarkup(<NumberInput defaultValue={2.5} precision={1000} />)).not.toThrow()
  })
  it('associates both visible and submitted fields with an external form', () => {
    const markup = renderToStaticMarkup(<NumberInput name="quantity" defaultValue={2} form="external-form" aria-label="수량" />)
    expect(tags(markup, 'input').map((tag) => attribute(tag, 'form'))).toEqual(['external-form', 'external-form'])
  })
  it('accepts inputProps.form as the owner for reset, validation and submitted values', () => {
    const markup = renderToStaticMarkup(<NumberInput name="quantity" defaultValue={2} inputProps={{ form: 'input-owned-form' }} aria-label="수량" />)
    expect(tags(markup, 'input').map((tag) => attribute(tag, 'form'))).toEqual(['input-owned-form', 'input-owned-form'])
  })
  it('gives the explicit root form precedence over a conflicting visible input form', () => {
    const markup = renderToStaticMarkup(<NumberInput name="quantity" defaultValue={2} form="root-form" inputProps={{ form: 'other-form' }} aria-label="수량" />)
    expect(tags(markup, 'input').map((tag) => attribute(tag, 'form'))).toEqual(['root-form', 'root-form'])
  })
})

describe('NumberInput uncontrolled form reset policy', () => {
  it('restores its default numeric state after an uncanceled native reset', async () => {
    const form = new EventTarget()
    let value = 3
    const unsubscribe = subscribeNumberInputFormReset(form, () => { value = 2 }, () => false)
    form.dispatchEvent(new Event('reset', { cancelable: true }))
    expect(value).toBe(3)
    await Promise.resolve()
    expect(value).toBe(2)
    unsubscribe()
  })
  it('preserves a controlled numeric or empty value across native resets', async () => {
    for (const controlledValue of [4, null]) {
      const form = new EventTarget()
      let value = controlledValue
      const unsubscribe = subscribeNumberInputFormReset(form, () => { value = 2 }, () => value !== undefined)
      form.dispatchEvent(new Event('reset', { cancelable: true }))
      await Promise.resolve()
      expect(value).toBe(controlledValue)
      unsubscribe()
    }
  })
  it('respects cancelation by a later form handler and cancels pending unmounted resets', async () => {
    const form = new EventTarget()
    let resets = 0
    const unsubscribe = subscribeNumberInputFormReset(form, () => resets++, () => false)
    form.addEventListener('reset', (event) => event.preventDefault(), { once: true })
    form.dispatchEvent(new Event('reset', { cancelable: true }))
    await Promise.resolve()
    expect(resets).toBe(0)
    form.dispatchEvent(new Event('reset', { cancelable: true }))
    unsubscribe()
    await Promise.resolve()
    expect(resets).toBe(0)
  })
})

describe('PasswordInput reveal and form contracts', () => {
  it('starts concealed with browser password-manager semantics', () => {
    const markup = renderToStaticMarkup(<PasswordInput name="password" defaultValue="example-only" aria-label="비밀번호" />)
    const input = tags(markup, 'input')[0]
    const toggle = tags(markup, 'button')[0]
    expect(attribute(input, 'type')).toBe('password')
    expect(attribute(input, 'name')).toBe('password')
    expect(attribute(input, 'autoComplete')).toBe('current-password')
    expect(attribute(toggle, 'type')).toBe('button')
    expect(attribute(toggle, 'aria-pressed')).toBe('false')
    expect(attribute(toggle, 'aria-controls')).toBe(attribute(input, 'id'))
  })
  it('supports controlled visibility and explicit new-password autocomplete', () => {
    const markup = renderToStaticMarkup(<PasswordInput visible autoComplete="new-password" aria-label="새 비밀번호" />)
    expect(attribute(tags(markup, 'input')[0], 'type')).toBe('text')
    expect(attribute(tags(markup, 'input')[0], 'autoComplete')).toBe('new-password')
    expect(attribute(tags(markup, 'button')[0], 'aria-pressed')).toBe('true')
  })
  it('disables reveal while loading and keeps Field error association', () => {
    const markup = renderToStaticMarkup(<Field label="비밀번호" error="입력을 확인하세요."><PasswordInput loading /></Field>)
    const input = tags(markup, 'input')[0]
    expect(attribute(input, 'aria-invalid')).toBe('true')
    expect(attribute(input, 'aria-describedby')).toBeTruthy()
    expect(tags(markup, 'button')[0]).toContain('disabled=""')
    expect(markup).toContain(`for="${attribute(input, 'id')}"`)
  })
})

describe('MultiSelect stable selection and accessible form contracts', () => {
  it('submits one stable string per selected item and de-duplicates repeated selections', () => {
    const markup = renderToStaticMarkup(<MultiSelect name="areas" items={items} value={['design', 'develop', 'design']} aria-label="분야" />)
    const submitted = tags(markup, 'input').filter((tag) => attribute(tag, 'name') === 'areas')
    expect(submitted.map((tag) => attribute(tag, 'value'))).toEqual(['design', 'develop'])
    expect(markup).toContain('디자인 선택 해제')
    expect(markup).toContain('개발 선택 해제')
    expect(tags(markup, 'input').find((tag) => attribute(tag, 'role') === 'combobox')).toContain('aria-label="분야"')
  })
  it('keeps unknown selected values available when async options change', () => {
    const markup = renderToStaticMarkup(<MultiSelect name="areas" items={[]} value={['existing']} readOnly aria-label="분야" />)
    expect(markup).toContain('existing')
    expect(tags(markup, 'input').find((tag) => attribute(tag, 'name') === 'areas')).toContain('value="existing"')
    expect(markup).not.toContain('선택 해제')
    expect(markup).not.toContain('모든 선택 지우기')
  })
  it('associates a maximum-selection hint with the input and preserves Field labels', () => {
    const markup = renderToStaticMarkup(<Field label="팀 분야" description="최대 2개" error="분야를 확인하세요."><MultiSelect items={items} defaultValue={['design']} maxSelected={2} /></Field>)
    const input = tags(markup, 'input').find((tag) => attribute(tag, 'role') === 'combobox')!
    expect(attribute(input, 'aria-describedby')?.split(' ')).toHaveLength(3)
    expect(attribute(input, 'aria-invalid')).toBe('true')
    expect(markup).toContain(`for="${attribute(input, 'id')}"`)
    expect(markup).toContain('1 / 2개 선택')
  })
  it('disables all submitted fields and removes clear action when unavailable', () => {
    const markup = renderToStaticMarkup(<MultiSelect name="areas" items={items} defaultValue={['design']} disabled aria-label="분야" />)
    expect(tags(markup, 'input').every((tag) => tag.includes('disabled=""'))).toBe(true)
    expect(markup).not.toContain('모든 선택 지우기')
  })
})

describe('MultiSelect native form reset events', () => {
  it('runs after the native reset handlers complete', async () => {
    const form = new EventTarget()
    const order: string[] = []
    const unsubscribe = subscribeMultiSelectFormReset(form, () => order.push('restore default selection'))
    form.addEventListener('reset', () => order.push('form handler'))
    form.dispatchEvent(new Event('reset', { cancelable: true }))
    expect(order).toEqual(['form handler'])
    await Promise.resolve()
    expect(order).toEqual(['form handler', 'restore default selection'])
    unsubscribe()
  })
  it('respects a reset canceled by a later form handler', async () => {
    const form = new EventTarget()
    let resets = 0
    const unsubscribe = subscribeMultiSelectFormReset(form, () => resets++)
    form.addEventListener('reset', (event) => event.preventDefault())
    form.dispatchEvent(new Event('reset', { cancelable: true }))
    await Promise.resolve()
    expect(resets).toBe(0)
    unsubscribe()
  })
  it('removes its listener and cancels queued work when the field unmounts', async () => {
    const form = new EventTarget()
    let resets = 0
    const unsubscribe = subscribeMultiSelectFormReset(form, () => resets++)
    form.dispatchEvent(new Event('reset', { cancelable: true }))
    unsubscribe()
    await Promise.resolve()
    form.dispatchEvent(new Event('reset', { cancelable: true }))
    await Promise.resolve()
    expect(resets).toBe(0)
  })
})
