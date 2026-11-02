import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Combobox } from './combobox'
import { Field } from './field'
import { MultiSelect } from './multi-select'
import { NumberInput } from './number-input'
import { Select } from './select'

const items = [{ value: 'design', label: '디자인' }, { value: 'development', label: '개발', disabled: true }]
const tags = (markup: string, element: string) => markup.match(new RegExp(`<${element}\\b[^>]*>`, 'g')) ?? []
const attribute = (tag: string, name: string) => tag.match(new RegExp(`(?:^|\\s)${name}(?:="([^"]*)")?(?=\\s|/?>|$)`))?.[1]

describe('Selection input loading contracts', () => {
  it.each([
    ['Combobox', <Combobox items={items} name="team" value="design" loading />],
    ['MultiSelect', <MultiSelect items={items} name="team" value={['design']} loading />],
    ['NumberInput', <NumberInput name="team" value={2} loading />],
  ])('%s marks its visible field busy and disables every value-changing control', (_, component) => {
    const markup = renderToStaticMarkup(<Field label="팀" error="값을 확인하세요.">{component}</Field>)
    const inputs = tags(markup, 'input')
    const visible = inputs.find((tag) => attribute(tag, 'aria-busy') === 'true')!

    expect(visible).toBeDefined()
    expect(attribute(visible, 'aria-invalid')).toBe('true')
    expect(attribute(visible, 'aria-describedby')).toBeTruthy()
    expect(inputs.every((tag) => attribute(tag, 'disabled') !== undefined)).toBe(true)
    expect(tags(markup, 'button').every((tag) => attribute(tag, 'disabled') !== undefined || attribute(tag, 'aria-disabled') === 'true')).toBe(true)
    expect(markup).toContain('ui-loading-indicator')
    expect(markup).not.toContain('aria-label="모든 선택 지우기"')
    expect(markup).not.toContain('aria-label="선택 지우기"')
  })

  it('shows a busy indicator even when NumberInput step controls are hidden', () => {
    const markup = renderToStaticMarkup(<NumberInput aria-label="금액" loading hideControls />)
    expect(tags(markup, 'button')).toHaveLength(0)
    expect(markup).toContain('ui-loading-indicator')
    expect(attribute(tags(markup, 'input')[0]!, 'aria-busy')).toBe('true')
  })

  it('keeps an unloaded controlled Combobox value instead of silently clearing its form value', () => {
    const markup = renderToStaticMarkup(<Combobox items={[]} name="team" value="existing-team" aria-label="팀" />)
    expect(attribute(tags(markup, 'input').find((tag) => attribute(tag, 'name') === 'team')!, 'value')).toBe('existing-team')
    expect(attribute(tags(markup, 'input').find((tag) => attribute(tag, 'role') === 'combobox')!, 'value')).toBe('existing-team')
  })

  it('keeps an unloaded default Combobox value available until its options arrive', () => {
    const markup = renderToStaticMarkup(<Combobox items={[]} name="team" defaultValue="existing-team" aria-label="팀" />)
    expect(attribute(tags(markup, 'input').find((tag) => attribute(tag, 'name') === 'team')!, 'value')).toBe('existing-team')
  })

  it('keeps a controlled empty selection empty', () => {
    const markup = renderToStaticMarkup(<Combobox items={items} name="team" value={null} aria-label="팀" />)
    expect(attribute(tags(markup, 'input').find((tag) => attribute(tag, 'name') === 'team')!, 'value')).toBe('')
  })
})

describe('Selection input form ownership and validation', () => {
  it.each([
    { disabled: true, inputProps: { disabled: false } },
    { inputProps: { disabled: true } },
    { loading: true, inputProps: { disabled: false } },
  ])('keeps NumberInput text, steppers and submitted value consistently unavailable: %j', (props) => {
    const markup = renderToStaticMarkup(<NumberInput {...props} name="quantity" defaultValue={3} />)
    expect(tags(markup, 'input').every((tag) => attribute(tag, 'disabled') !== undefined)).toBe(true)
    expect(tags(markup, 'button').every((tag) => attribute(tag, 'disabled') !== undefined || attribute(tag, 'aria-disabled') === 'true')).toBe(true)
  })

  it.each([
    { readOnly: true, inputProps: { readOnly: false } },
    { inputProps: { readOnly: true } },
  ])('keeps NumberInput read-only across its text and steppers: %j', (props) => {
    const markup = renderToStaticMarkup(<NumberInput {...props} name="quantity" defaultValue={3} />)
    const visible = tags(markup, 'input').find((tag) => attribute(tag, 'type') === 'text')!
    expect(attribute(visible, 'readOnly')).toBeDefined()
    expect(tags(markup, 'button').every((tag) => attribute(tag, 'disabled') !== undefined || attribute(tag, 'aria-disabled') === 'true')).toBe(true)
    expect(attribute(tags(markup, 'input').find((tag) => attribute(tag, 'name') === 'quantity')!, 'disabled')).toBeUndefined()
  })

  it.each([
    ['Select', <Select items={items} name="team" form="external-form" required />],
    ['Combobox', <Combobox items={items} name="team" form="external-form" required />],
  ])('%s associates native validation and submitted values with an external form', (_, component) => {
    const markup = renderToStaticMarkup(component)
    const submitted = [...tags(markup, 'input'), ...tags(markup, 'select')].find((tag) => attribute(tag, 'name') === 'team')!
    expect(submitted).toBeDefined()
    expect(attribute(submitted, 'form')).toBe('external-form')
    expect(attribute(submitted, 'required')).toBeDefined()
    const control = [...tags(markup, 'input'), ...tags(markup, 'button')].find((tag) => attribute(tag, 'role') === 'combobox')!
    expect(attribute(control, 'aria-required')).toBe('true')
  })

  it('associates MultiSelect validation and every selected value with an external form', () => {
    const emptyMarkup = renderToStaticMarkup(<MultiSelect items={items} name="team" form="external-form" required />)
    const validator = tags(emptyMarkup, 'input').find((tag) => attribute(tag, 'required') !== undefined)!
    expect(validator).toBeDefined()
    expect(attribute(validator, 'form')).toBe('external-form')
    expect(attribute(tags(emptyMarkup, 'input').find((tag) => attribute(tag, 'role') === 'combobox')!, 'aria-required')).toBe('true')

    const selectedMarkup = renderToStaticMarkup(<MultiSelect items={items} name="team" form="external-form" value={['design']} required />)
    const submitted = tags(selectedMarkup, 'input').find((tag) => attribute(tag, 'name') === 'team')!
    expect(attribute(submitted, 'form')).toBe('external-form')
    expect(attribute(submitted, 'value')).toBe('design')
  })
})
